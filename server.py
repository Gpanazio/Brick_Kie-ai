"""
KIE AI — FastAPI Server
Wraps kie_api.py functions into REST endpoints for the frontend.
"""

import asyncio
import json
import logging
import os
import tempfile
import uuid
from pathlib import Path
from typing import Optional, List
import hmac
import hashlib

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response


from dotenv import load_dotenv

load_dotenv()

import kie_api
import db
import storage
import auth as auth_module
from auth import is_protected, extract_token, decode_token

FRONTEND_DIR = Path(__file__).parent / "frontend"

# root_path for reverse proxy subpath
ROOT_PATH = os.environ.get("ROOT_PATH", "")
# Callback URL for KIE.ai webhooks
CALLBACK_URL = os.environ.get("KIE_CALLBACK_URL", "")
# API key for frontend authentication
API_KEY = os.environ.get("API_KEY", "brick-squad-2026")
# Webhook HMAC key for verifying KIE.ai callbacks
WEBHOOK_KEY = os.environ.get("KIE_WEBHOOK_KEY", "")

logger = logging.getLogger(__name__)


# ==================== Helpers ====================


def _safe_unlink(path: str) -> None:
    """Remove temporary files without masking the original request error."""
    try:
        os.unlink(path)
    except FileNotFoundError:
        pass
    except Exception:
        logger.warning("[tmp] Failed to remove temp file %s", path, exc_info=True)


def _ensure_callback_url(payload: dict) -> dict:
    """Inject default callback URL if not already set."""
    if CALLBACK_URL and "callBackUrl" not in payload:
        payload["callBackUrl"] = CALLBACK_URL
    return payload


WAN_MODEL_MIGRATION_MAP = {
    "wan/2-6-text-to-video": "wan/2-7-text-to-video",
    "wan/2-6-image-to-video": "wan/2-7-image-to-video",
    "wan/2-6-video-to-video": "wan/2-7-videoedit",
}


def _normalize_market_model(model: str) -> str:
    return WAN_MODEL_MIGRATION_MAP.get(model, model)


def _validate_api_response(resp: dict) -> dict:
    """Check API-level error codes in JSON body (KIE returns HTTP 200 with error codes in body)."""
    if isinstance(resp, dict):
        code = resp.get("code")
        if code is not None and code != 200:
            msg = resp.get("msg", f"API error (code {code})")
            raise HTTPException(
                status_code=code if 400 <= code < 600 else 502, detail=msg
            )
    return resp


def _sanitize_error(e: Exception) -> str:
    """Sanitize error messages to avoid leaking internal details (paths, keys, stack traces)."""
    msg = str(e)
    # Strip file paths
    if "/" in msg and ("tmp" in msg.lower() or "home" in msg.lower()):
        return "Internal server error"
    # Strip API key fragments
    if "bearer" in msg.lower() or "authorization" in msg.lower():
        return "Authentication error"
    # Cap length to avoid leaking verbose tracebacks
    if len(msg) > 200:
        return msg[:200] + "..."
    return msg


def _request_id(request: Request) -> str:
    """Extract or generate a request ID for tracing."""
    return request.headers.get("X-Request-ID", uuid.uuid4().hex[:12])


async def _save_upload_to_temp(file: UploadFile, default_name: str = "file") -> str:
    """Save an UploadFile to a temporary file and return its path."""
    suffix = Path(file.filename or default_name).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        while content := await file.read(1024 * 1024):  # Read in 1MB chunks
            tmp.write(content)
        return tmp.name


# ==================== App ====================


app = FastAPI(title="KIE AI Frontend Server", version="1.0.0", root_path=ROOT_PATH)

# CORS for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth router ──
app.include_router(auth_module.router)


# ── JWT Auth Middleware ──
from starlette.middleware.base import BaseHTTPMiddleware


class JWTAuthMiddleware(BaseHTTPMiddleware):
    """Protege todas as rotas /api/* (exceto /api/auth/* e /api/kie-callback)."""

    async def dispatch(self, request: Request, call_next):
        if is_protected(request.url.path):
            token = extract_token(request)
            if not token:
                return JSONResponse(
                    {"error": "Autenticação necessária"},
                    status_code=401,
                )
            try:
                decode_token(token)
            except HTTPException as e:
                return JSONResponse({"error": e.detail}, status_code=e.status_code)
        return await call_next(request)


app.add_middleware(JWTAuthMiddleware)


# ==================== SSE (Server-Sent Events) ====================


# In-memory list of SSE subscribers
_sse_clients: List[asyncio.Queue] = []


async def _broadcast_sse(event_type: str, data: dict):
    """Send an event to all connected SSE clients."""
    payload = json.dumps(data)
    dead: List[asyncio.Queue] = []
    for q in _sse_clients:
        try:
            q.put_nowait({"event": event_type, "data": payload})
        except asyncio.QueueFull:
            dead.append(q)
    for q in dead:
        _sse_clients.remove(q)


from starlette.responses import StreamingResponse


@app.get("/api/events")
async def sse_events():
    """SSE endpoint — replaces Socket.IO for real-time task updates."""
    q: asyncio.Queue = asyncio.Queue(maxsize=64)
    _sse_clients.append(q)

    async def stream():
        try:
            while True:
                try:
                    # Wait up to 15s for a real event; if none, send a keep-alive comment
                    msg = await asyncio.wait_for(q.get(), timeout=15)
                    yield f"event: {msg['event']}\ndata: {msg['data']}\n\n"
                except asyncio.TimeoutError:
                    # SSE comment line — keeps connection alive through proxies/browsers
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            if q in _sse_clients:
                _sse_clients.remove(q)

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ==================== Webhook Callback ====================


@app.post("/api/kie-callback")
async def kie_callback(request: Request):
    """Receives task completion callbacks from KIE.ai and broadcasts via SSE."""
    rid = _request_id(request)
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # Normalize task_id → taskId
    task_id = None
    if isinstance(body.get("data"), dict):
        task_id = body["data"].get("taskId") or body["data"].get("task_id")
        if task_id and "taskId" not in body["data"]:
            body["data"]["taskId"] = task_id
    if not task_id:
        raise HTTPException(status_code=400, detail="Missing taskId")

    # Verify HMAC signature if key is configured
    if WEBHOOK_KEY:
        timestamp = request.headers.get("x-webhook-timestamp", "")
        signature = request.headers.get("x-webhook-signature", "")
        if not timestamp or not signature:
            raise HTTPException(status_code=401, detail="Missing signature headers")
        message = f"{task_id}.{timestamp}"
        expected = hmac.new(
            WEBHOOK_KEY.encode(), message.encode(), hashlib.sha256
        ).digest()
        import base64

        expected_b64 = base64.b64encode(expected).decode()
        if not hmac.compare_digest(expected_b64, signature):
            raise HTTPException(status_code=401, detail="Invalid signature")

    logger.info("[%s] kie-callback: taskId=%s code=%s", rid, task_id, body.get("code"))

    # Broadcast to SSE clients
    await _broadcast_sse("kie:task-update", body)

    # Save to history if completed
    task_state = None
    code = body.get("code")
    if code == 200:
        task_state = "success"
    elif isinstance(code, int) and code >= 400:
        task_state = "fail"

    if task_state and task_id:
        task_data = body.get("data", {})
        inp = task_data.get("input", {})
        prompt = inp.get("prompt", "") if isinstance(inp, dict) else ""
        urls = _extract_callback_urls(task_data)
        entry = {
            "id": task_id,
            "model": task_data.get("model", ""),
            "state": task_state,
            "cat": _infer_cat(task_data.get("model", "")),
            "urls": urls,
            "prompt": prompt,
            "timestamp": task_data.get("createTime"),
        }
        db.upsert_entry(entry)

        # Download media in background so files are persisted before KIE deletes them
        if urls and task_state == "success":
            asyncio.create_task(_download_and_save(task_id, urls))

    return {"code": 200, "msg": "success"}


async def _download_and_save(task_id: str, urls: list[str]):
    """Background task: download media files and update DB with local paths."""
    try:
        local_files = await storage.download_media(task_id, urls)
        if local_files:
            db.update_local_urls(task_id, local_files)
            logger.info("[media] Saved %d files for task %s", len(local_files), task_id)
    except Exception as e:
        logger.error("[media] Background download failed for %s: %s", task_id, e)


def _extract_callback_urls(data: dict) -> list:
    """Extract result URLs from a KIE callback payload."""
    urls = []
    if not isinstance(data, dict):
        return urls
    for k in ("resultUrl", "output", "fileUrl", "downloadUrl", "audioUrl", "videoUrl"):
        v = data.get(k)
        if isinstance(v, str) and v.startswith("http"):
            urls.append(v)
    for k in ("resultUrls", "output_urls", "urls"):
        v = data.get(k)
        if isinstance(v, list):
            urls.extend(u for u in v if isinstance(u, str) and u.startswith("http"))
    rj = data.get("resultJson")
    if isinstance(rj, str):
        try:
            rj = json.loads(rj)
        except (json.JSONDecodeError, ValueError):
            rj = None
    if isinstance(rj, dict):
        for k in (
            "resultUrl",
            "resultUrls",
            "output",
            "fileUrl",
            "downloadUrl",
            "videoUrl",
            "audioUrl",
        ):
            v = rj.get(k)
            if isinstance(v, str) and v.startswith("http"):
                urls.append(v)
            elif isinstance(v, list):
                urls.extend(u for u in v if isinstance(u, str) and u.startswith("http"))
    return list(dict.fromkeys(urls))  # deduplicate preserving order


# ==================== Static Frontend ====================


@app.get("/", response_class=FileResponse)
async def serve_index():
    response = FileResponse(FRONTEND_DIR / "index.html", media_type="text/html")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@app.get("/login", response_class=FileResponse)
async def serve_login():
    """Serve a página de login."""
    response = FileResponse(FRONTEND_DIR / "login.html", media_type="text/html")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@app.get("/favicon.ico")
async def favicon():
    return Response(content=b"", media_type="image/x-icon", status_code=204)


@app.get("/static/{filename:path}", response_class=FileResponse)
async def serve_static(filename: str):
    """Serve static files (CSS, JS, images) — handles ?v=N query string automatically."""
    base_dir = FRONTEND_DIR.resolve()
    file_path = (FRONTEND_DIR / filename).resolve()
    if base_dir not in file_path.parents and file_path != base_dir:
        raise HTTPException(status_code=403, detail="Invalid static file path")
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=404, detail=f"Static file not found: {filename}"
        )
    response = FileResponse(str(file_path))
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


# ==================== Media Serving ====================


import mimetypes


@app.get("/media/{task_id}/{filename}")
async def serve_media(task_id: str, filename: str):
    """Serve a locally-stored media file from the Railway volume."""
    path = storage.get_local_path(task_id, filename)
    if not path:
        raise HTTPException(status_code=404, detail="Media file not found")
    media_type = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    response = FileResponse(str(path), media_type=media_type)
    # Cache for 30 days — these files are permanent
    response.headers["Cache-Control"] = "public, max-age=2592000, immutable"
    return response


@app.post("/api/media/backfill")
async def media_backfill(request: Request):
    """Download media for existing history entries that don't have local copies yet."""
    rid = _request_id(request)
    try:
        entries = db.entries_needing_backfill(limit=50)
        if not entries:
            return {"success": True, "processed": 0, "message": "Nothing to backfill"}

        processed = 0
        errors = []
        for entry in entries:
            try:
                urls = entry.get("urls", [])
                if isinstance(urls, str):
                    import json as _json

                    urls = _json.loads(urls)
                if not urls:
                    continue
                local_files = await storage.download_media(entry["id"], urls)
                if local_files:
                    db.update_local_urls(entry["id"], local_files)
                    processed += 1
            except Exception as e:
                logger.warning("[%s] backfill: failed for %s: %s", rid, entry["id"], e)
                errors.append({"id": entry["id"], "error": str(e)[:100]})

        total_remaining = len(db.entries_needing_backfill(limit=1))
        logger.info(
            "[%s] media/backfill: processed=%d, errors=%d", rid, processed, len(errors)
        )
        return {
            "success": True,
            "processed": processed,
            "errors": errors,
            "remaining": total_remaining,
        }
    except Exception as e:
        logger.error("[%s] media/backfill: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


# ==================== Config ====================


@app.get("/api/config")
def get_config():
    """Return frontend configuration including API key for auth."""
    return {"apiKey": API_KEY}


# ==================== Credits ====================


@app.get("/api/credits")
def get_credits(request: Request):
    rid = _request_id(request)
    try:
        resp = kie_api.credits()
        _validate_api_response(resp)
        return resp
    except ValueError as e:
        logger.warning("[%s] credits: API key not configured: %s", rid, e)
        raise HTTPException(status_code=503, detail="KIE_API_KEY não configurada")
    except Exception as e:
        logger.error("[%s] credits: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


# ==================== Upload ====================


@app.post("/api/upload")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    uploadPath: str = Form("uploads"),
):
    """Upload a file to KIE storage and return the URL."""
    rid = _request_id(request)
    tmp_path = None
    try:
        tmp_path = await _save_upload_to_temp(file)
        resp = await asyncio.to_thread(
            kie_api.upload_stream,
            tmp_path,
            upload_path=uploadPath,
            file_name=file.filename,
        )
        _validate_api_response(resp)
        url = kie_api._extract_uploaded_url(resp)
        logger.info("[%s] upload: success, url=%s", rid, url[:80])
        return {"success": True, "upload": resp, "url": url}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] upload: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))
    finally:
        if tmp_path:
            _safe_unlink(tmp_path)


# ==================== Market (Unified) ====================


@app.post("/api/market/create")
def market_create(
    request: Request,
    model: str = Form(...),
    input_json: str = Form(...),
    callback: Optional[str] = Form(None),
):
    rid = _request_id(request)
    try:
        input_data = json.loads(input_json)
        model = _normalize_market_model(model)
        resp = kie_api.market_create_task(
            model, input_data, callback_url=callback or CALLBACK_URL
        )
        _validate_api_response(resp)
        logger.info("[%s] market/create: model=%s", rid, model)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] market/create: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


@app.get("/api/market/task/{task_id}")
def market_task(request: Request, task_id: str):
    rid = _request_id(request)
    try:
        resp = kie_api.market_task_info(task_id)
        _validate_api_response(resp)
        return resp
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] market/task: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


# ==================== Perfect Shortcuts ====================


@app.post("/api/shortcuts/recraft-rmbg")
async def shortcut_recraft_rmbg(
    request: Request,
    file: UploadFile = File(...),
    uploadPath: str = Form("images"),
    callback: Optional[str] = Form(None),
):
    rid = _request_id(request)
    tmp_path = None
    try:
        tmp_path = await _save_upload_to_temp(file, "img.png")
        resp = await asyncio.to_thread(
            kie_api.recraft_remove_background_from_local,
            tmp_path,
            upload_path=uploadPath,
            callback_url=callback or CALLBACK_URL,
            file_name=file.filename,
        )
        _validate_api_response(resp)
        logger.info("[%s] shortcuts/recraft-rmbg: submitted", rid)
        return resp
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] shortcuts/recraft-rmbg: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))
    finally:
        if tmp_path:
            _safe_unlink(tmp_path)


@app.post("/api/shortcuts/topaz-upscale")
async def shortcut_topaz_upscale(
    request: Request,
    file: UploadFile = File(...),
    factor: str = Form("2"),
    uploadPath: str = Form("videos"),
    callback: Optional[str] = Form(None),
):
    rid = _request_id(request)
    tmp_path = None
    try:
        tmp_path = await _save_upload_to_temp(file, "video.mp4")
        resp = await asyncio.to_thread(
            kie_api.topaz_video_upscale_from_local,
            tmp_path,
            upscale_factor=factor,
            upload_path=uploadPath,
            callback_url=callback or CALLBACK_URL,
            file_name=file.filename,
        )
        _validate_api_response(resp)
        logger.info("[%s] shortcuts/topaz-upscale: factor=%s", rid, factor)
        return resp
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] shortcuts/topaz-upscale: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))
    finally:
        if tmp_path:
            _safe_unlink(tmp_path)


# ==================== Generic: Upload + Create Task ====================


@app.post("/api/process")
async def process_file(
    request: Request,
    file: UploadFile = File(...),
    model: str = Form(...),
    input_json: str = Form("{}"),
    file_field: str = Form("image"),
    uploadPath: str = Form("uploads"),
):
    """
    Generic endpoint: Upload file → get URL → create market task.
    """
    rid = _request_id(request)
    tmp_path = None
    try:
        tmp_path = await _save_upload_to_temp(file)

        # Step 1: Upload
        up_resp = await asyncio.to_thread(
            kie_api.upload_stream,
            tmp_path,
            upload_path=uploadPath,
            file_name=file.filename,
        )
        _validate_api_response(up_resp)
        file_url = kie_api._extract_uploaded_url(up_resp)

        # Step 2: Build input
        extra = json.loads(input_json) if input_json else {}
        model = _normalize_market_model(model)
        # Fields ending with _urls expect an array of URLs
        if file_field.endswith("_urls"):
            extra[file_field] = [file_url]
        else:
            extra[file_field] = file_url

        # Step 3: Create task
        task_resp = await asyncio.to_thread(
            kie_api.market_create_task, model, extra, callback_url=CALLBACK_URL
        )
        _validate_api_response(task_resp)

        logger.info("[%s] process: model=%s, uploaded=%s", rid, model, file_url[:80])
        return {
            "success": True,
            "uploaded_url": file_url,
            "task": task_resp,
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input_json")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] process: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))
    finally:
        if tmp_path:
            _safe_unlink(tmp_path)


# ==================== Text-only Market Task (no file upload) ====================


@app.post("/api/market/create-json")
def market_create_json_body(
    request: Request,
    model: str = Form(...),
    input_json: str = Form(...),
):
    """Create a Market task from JSON input only (no file upload needed)."""
    rid = _request_id(request)
    try:
        input_data = json.loads(input_json)
        model = _normalize_market_model(model)
        logger.info(
            "[%s] market/create-json: model=%s input=%s",
            rid,
            model,
            json.dumps(input_data, ensure_ascii=False)[:500],
        )
        resp = kie_api.market_create_task(model, input_data, callback_url=CALLBACK_URL)
        logger.info(
            "[%s] market/create-json response: %s",
            rid,
            json.dumps(resp, ensure_ascii=False)[:500],
        )
        _validate_api_response(resp)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] market/create-json: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


# ==================== Suno-specific API proxy ====================


@app.post("/api/suno/create")
async def suno_create(
    request: Request,
    model: str = Form(...),
    input_json: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    """Proxy to Suno-specific API endpoints (extend, cover, vocals, etc.)."""
    rid = _request_id(request)
    tmp_path = None
    try:
        input_data = json.loads(input_json)

        # If a file was uploaded, stream it to KIE upload API first
        if file and file.filename:
            tmp_path = await _save_upload_to_temp(file, "audio.tmp")
            up_resp = await asyncio.to_thread(
                kie_api.upload_stream, tmp_path, upload_path="audio"
            )
            _validate_api_response(up_resp)
            upload_url = kie_api._extract_uploaded_url(up_resp)
            input_data["uploadUrl"] = upload_url

        _ensure_callback_url(input_data)
        resp = await asyncio.to_thread(kie_api.suno_create_task, model, input_data)
        _validate_api_response(resp)
        logger.info("[%s] suno/create: model=%s", rid, model)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] suno/create: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))
    finally:
        if tmp_path:
            _safe_unlink(tmp_path)


@app.get("/api/suno/task/{task_id}")
def suno_task(request: Request, task_id: str):
    """Get Suno task status."""
    rid = _request_id(request)
    try:
        resp = kie_api.suno_task_info(task_id)
        _validate_api_response(resp)
        return resp
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] suno/task: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


# ==================== Veo 3.1 API proxy ====================


@app.post("/api/veo/create")
def veo_create(
    request: Request,
    model: str = Form(...),
    input_json: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    """Proxy to Veo 3.1 API endpoints (generate, extend)."""
    rid = _request_id(request)
    try:
        input_data = json.loads(input_json)

        _ensure_callback_url(input_data)
        resp = kie_api.veo_create_task(model, input_data)
        _validate_api_response(resp)
        logger.info("[%s] veo/create: model=%s", rid, model)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] veo/create: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


@app.get("/api/veo/task/{task_id}")
def veo_task(request: Request, task_id: str):
    """Get Veo 3.1 task status."""
    rid = _request_id(request)
    try:
        resp = kie_api.veo_task_info(task_id)
        _validate_api_response(resp)
        return resp
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] veo/task: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


@app.get("/api/veo/1080p/{task_id}")
def veo_1080p(request: Request, task_id: str):
    """Get 1080P version of a Veo video."""
    rid = _request_id(request)
    try:
        resp = kie_api.veo_get_1080p(task_id)
        _validate_api_response(resp)
        return resp
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] veo/1080p: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


@app.post("/api/veo/4k")
def veo_4k(request: Request, task_id: str = Form(...)):
    """Get 4K version of a Veo video."""
    rid = _request_id(request)
    try:
        resp = kie_api.veo_get_4k(task_id, callback_url=CALLBACK_URL)
        _validate_api_response(resp)
        return resp
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] veo/4k: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


# ==================== GPT 4o Image API proxy ====================


@app.post("/api/gpt4o-image/create")
async def gpt4o_image_create(
    request: Request,
    model: str = Form(...),
    input_json: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    """Proxy to GPT 4o Image API. Supports optional image upload via filesUrl."""
    rid = _request_id(request)
    tmp_path = None
    try:
        input_data = json.loads(input_json)

        # If a file was uploaded, upload it first then add to filesUrl
        upload_url = None
        if file and file.filename:
            tmp_path = await _save_upload_to_temp(file, "img.tmp")
            up_resp = await asyncio.to_thread(
                kie_api.upload_stream, tmp_path, upload_path="images"
            )
            _validate_api_response(up_resp)
            upload_url = kie_api._extract_uploaded_url(up_resp)
            existing = input_data.get("filesUrl", [])
            if not isinstance(existing, list):
                existing = []
            existing.append(upload_url)
            input_data["filesUrl"] = existing

        _ensure_callback_url(input_data)
        resp = await asyncio.to_thread(kie_api.gpt4o_image_generate, input_data)
        _validate_api_response(resp)
        if isinstance(resp, dict) and upload_url:
            resp["uploaded_url"] = upload_url
        logger.info("[%s] gpt4o-image/create: model=%s", rid, model)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] gpt4o-image/create: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))
    finally:
        if tmp_path:
            _safe_unlink(tmp_path)


@app.get("/api/gpt4o-image/task/{task_id}")
def gpt4o_image_task(request: Request, task_id: str):
    """Get GPT 4o Image task status."""
    rid = _request_id(request)
    try:
        resp = kie_api.gpt4o_image_task_info(task_id)
        _validate_api_response(resp)
        return resp
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] gpt4o-image/task: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


@app.post("/api/gpt4o-image/download-url")
def gpt4o_image_download(
    request: Request,
    taskId: str = Form(...),
    url: str = Form(...),
):
    """Get a signed download URL for a GPT 4o Image result."""
    rid = _request_id(request)
    try:
        resp = kie_api.gpt4o_image_download_url(taskId, url)
        _validate_api_response(resp)
        return resp
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] gpt4o-image/download-url: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


# ==================== Flux Kontext API proxy ====================


@app.post("/api/flux-kontext/create")
async def flux_kontext_create(
    request: Request,
    model: str = Form(...),
    input_json: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    """Proxy to Flux Kontext API. Supports optional image upload via inputImage."""
    rid = _request_id(request)
    tmp_path = None
    try:
        input_data = json.loads(input_json)

        # If a file was uploaded, upload it first then set inputImage
        upload_url = None
        if file and file.filename:
            tmp_path = await _save_upload_to_temp(file, "img.tmp")
            up_resp = await asyncio.to_thread(
                kie_api.upload_stream, tmp_path, upload_path="images"
            )
            _validate_api_response(up_resp)
            upload_url = kie_api._extract_uploaded_url(up_resp)
            input_data["inputImage"] = upload_url

        # Ensure model is set in input_data
        if "model" not in input_data:
            input_data["model"] = model

        _ensure_callback_url(input_data)
        resp = await asyncio.to_thread(kie_api.flux_kontext_generate, input_data)
        _validate_api_response(resp)
        if isinstance(resp, dict) and upload_url:
            resp["uploaded_url"] = upload_url
        logger.info("[%s] flux-kontext/create: model=%s", rid, model)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] flux-kontext/create: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))
    finally:
        if tmp_path:
            _safe_unlink(tmp_path)


@app.get("/api/flux-kontext/task/{task_id}")
def flux_kontext_task(request: Request, task_id: str):
    """Get Flux Kontext task status."""
    rid = _request_id(request)
    try:
        resp = kie_api.flux_kontext_task_info(task_id)
        _validate_api_response(resp)
        return resp
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] flux-kontext/task: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


# ==================== Server-Side History (PostgreSQL) ====================


def _validate_history_entry(entry: dict) -> dict:
    """Validate a history entry before persisting."""
    if not isinstance(entry, dict):
        raise HTTPException(status_code=400, detail="Entry must be a JSON object")
    if not entry.get("id") or not isinstance(entry["id"], str):
        raise HTTPException(
            status_code=400, detail="Entry must have a non-empty string 'id'"
        )
    if "model" in entry and not isinstance(entry.get("model"), str):
        raise HTTPException(status_code=400, detail="'model' must be a string")
    if "cat" in entry and not isinstance(entry.get("cat"), str):
        raise HTTPException(status_code=400, detail="'cat' must be a string")
    if "urls" in entry and not isinstance(entry.get("urls"), list):
        raise HTTPException(status_code=400, detail="'urls' must be an array")
    return entry


@app.post("/api/history")
async def save_history_entry(
    request: Request,
    entry_json: str = Form(...),
):
    """Save (upsert) a task result to PostgreSQL history."""
    rid = _request_id(request)
    try:
        entry = json.loads(entry_json)
        _validate_history_entry(entry)
        db.upsert_entry(entry)
        total = db.count_history()
        logger.info("[%s] history/save: id=%s, total=%d", rid, entry["id"], total)

        # Download media in background
        urls = entry.get("urls", [])
        if urls and entry.get("state") == "success":
            asyncio.create_task(_download_and_save(entry["id"], urls))

        return {"success": True, "count": total}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] history/save: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


@app.get("/api/history")
def get_history(cat: Optional[str] = None, limit: int = 100):
    """Get history from PostgreSQL, optionally filtered by category."""
    history = db.load_history(cat=cat, limit=limit)
    total = db.count_history(cat=cat)
    return {"history": history, "total": total}


@app.delete("/api/history/{entry_id}")
def delete_history_entry(request: Request, entry_id: str):
    """Delete a specific history entry by ID."""
    rid = _request_id(request)
    db.delete_entry(entry_id)
    total = db.count_history()
    logger.info("[%s] history/delete: id=%s", rid, entry_id)
    return {"success": True, "count": total}


@app.delete("/api/history")
def clear_history_endpoint(request: Request, cat: Optional[str] = None):
    """Clear history, optionally filtered to a specific category."""
    rid = _request_id(request)
    db.clear_history(cat=cat)
    logger.info("[%s] history/clear: cat=%s", rid, cat or "all")
    return {"success": True}


def _extract_result_urls(data: dict) -> list:
    """Extract result URLs from task data, checking multiple response formats."""
    urls = []
    if not isinstance(data, dict):
        return urls
    for key in (
        "resultUrl",
        "output",
        "fileUrl",
        "downloadUrl",
        "audioUrl",
        "videoUrl",
    ):
        val = data.get(key)
        if isinstance(val, str) and val.startswith("http"):
            urls.append(val)
    for key in ("resultUrls", "output_urls", "urls"):
        val = data.get(key)
        if isinstance(val, list):
            urls.extend(u for u in val if isinstance(u, str) and u.startswith("http"))
    result_json = data.get("resultJson")
    if isinstance(result_json, str):
        try:
            result_json = json.loads(result_json)
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning("[history] Failed to parse resultJson: %s", e)
            result_json = None
    if isinstance(result_json, dict):
        for key in (
            "resultUrl",
            "resultUrls",
            "output",
            "fileUrl",
            "downloadUrl",
            "videoUrl",
            "audioUrl",
        ):
            val = result_json.get(key)
            if isinstance(val, str) and val.startswith("http"):
                urls.append(val)
            elif isinstance(val, list):
                urls.extend(
                    u for u in val if isinstance(u, str) and u.startswith("http")
                )
    resp = data.get("response", {})
    if isinstance(resp, dict):
        for key in ("resultUrl", "output", "fileUrl", "downloadUrl"):
            val = resp.get(key)
            if isinstance(val, str) and val.startswith("http"):
                urls.append(val)
        for s in resp.get("sunoData") or []:
            if isinstance(s, dict):
                for k in ("audioUrl", "videoUrl", "sourceAudioUrl"):
                    if s.get(k):
                        urls.append(s[k])
    return list(dict.fromkeys(urls))


def _infer_cat(model: str) -> str:
    m = (model or "").lower()
    if "suno" in m:
        return "music"
    if "elevenlabs" in m:
        return "audio"
    if "topaz" in m or "crisp" in m or "recraft" in m:
        return "tools"
    if any(
        x in m for x in ["video", "kling", "wan", "hailuo", "sora", "veo", "seedance"]
    ):
        return "video"
    return "image"


@app.post("/api/history/import")
def import_history_tasks(
    request: Request,
    task_ids_json: str = Form(...),
):
    """Import tasks by fetching their info from kie.ai API and saving to PostgreSQL."""
    rid = _request_id(request)
    try:
        task_ids = json.loads(task_ids_json)
        if not isinstance(task_ids, list):
            raise HTTPException(
                status_code=400, detail="task_ids_json must be a JSON array"
            )

        imported = 0
        errors = []

        for tid in task_ids:
            if not isinstance(tid, str) or not tid:
                errors.append({"id": str(tid), "error": "Invalid task ID"})
                continue
            if db.entry_exists(tid):
                continue
            try:
                resp = kie_api.market_task_info(tid)
                _validate_api_response(resp)
                data = resp.get("data", {}) if isinstance(resp, dict) else {}
                state = data.get("state", "unknown")
                model = data.get("model", "")
                inp = data.get("input", {})
                prompt = inp.get("prompt", "") if isinstance(inp, dict) else ""
                urls = _extract_result_urls(data)
                entry = {
                    "id": tid,
                    "model": model,
                    "state": state,
                    "cat": _infer_cat(model),
                    "urls": urls,
                    "prompt": prompt,
                    "timestamp": data.get("createTime"),
                }
                db.upsert_entry(entry)
                imported += 1
            except Exception as e:
                logger.warning("[%s] history/import: failed for %s: %s", rid, tid, e)
                errors.append({"id": tid, "error": _sanitize_error(e)})

        total = db.count_history()
        logger.info(
            "[%s] history/import: imported=%d, errors=%d", rid, imported, len(errors)
        )
        return {"success": True, "imported": imported, "total": total, "errors": errors}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[%s] history/import: %s", rid, e, exc_info=True)
        raise HTTPException(status_code=500, detail=_sanitize_error(e))


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", os.environ.get("KIE_PORT", "8420")))
    uvicorn.run(app, host="0.0.0.0", port=port)
