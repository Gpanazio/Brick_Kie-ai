"""
KIE AI — FastAPI Server
Wraps kie_api.py functions into REST endpoints for the frontend.
"""

import json
import logging
import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response


from dotenv import load_dotenv
load_dotenv()

import kie_api

FRONTEND_DIR = Path(__file__).parent / "frontend"

# root_path for reverse proxy subpath (e.g. /kie-ai)
ROOT_PATH = os.environ.get("ROOT_PATH", "")
# Callback URL for KIE.ai webhooks (set by parent Node.js server from RAILWAY_PUBLIC_DOMAIN)
CALLBACK_URL = os.environ.get("KIE_CALLBACK_URL", "")

logger = logging.getLogger(__name__)


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

def _validate_api_response(resp: dict) -> dict:
    """Check API-level error codes in JSON body (KIE returns HTTP 200 with error codes in body)."""
    if isinstance(resp, dict):
        code = resp.get("code")
        if code is not None and code != 200:
            msg = resp.get("msg", f"API error (code {code})")
            raise HTTPException(status_code=code if 400 <= code < 600 else 502, detail=msg)
    return resp

app = FastAPI(title="KIE AI Frontend Server", version="1.0.0", root_path=ROOT_PATH)

# CORS for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Static Frontend ====================

# ── Path-rewriting middleware: /kie-ai/* → /* (for local dev without Node proxy) ──
# In production, the Node.js reverse proxy forwards /kie-ai/* to this server.
# When running locally on port 8420 directly, the browser still sends /kie-ai/api/...
# and /kie-ai/static/... — this middleware rewrites the path so the routes below match.
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest

class KieAiPrefixMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        path = request.scope.get("path", "")
        # Rewrite /kie-ai/api/... → /api/...
        # /kie-ai/static/... → /static/...  (served below)
        if path.startswith("/kie-ai/"):
            request.scope["path"] = "/" + path[len("/kie-ai/"):]
        return await call_next(request)

app.add_middleware(KieAiPrefixMiddleware)


@app.get("/", response_class=FileResponse)
@app.get("/kie-ai", response_class=FileResponse)
@app.get("/kie-ai/", response_class=FileResponse)
async def serve_index():
    response = FileResponse(FRONTEND_DIR / "index.html", media_type="text/html")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@app.get("/favicon.ico")
async def favicon():
    return Response(content=b"", media_type="image/x-icon", status_code=204)


# Serve static files (CSS, JS, images) — handles ?v=N query string automatically
@app.get("/static/{filename:path}", response_class=FileResponse)
async def serve_static(filename: str):
    base_dir = FRONTEND_DIR.resolve()
    file_path = (FRONTEND_DIR / filename).resolve()
    if base_dir not in file_path.parents and file_path != base_dir:
        raise HTTPException(status_code=403, detail="Invalid static file path")
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail=f"Static file not found: {filename}")
    return FileResponse(str(file_path))


# Stub for socket.io (not used in local dev mode)
@app.get("/socket.io/socket.io.js")
async def socket_io_stub():
    """Return a minimal socket.io stub so the page doesn't throw errors."""
    stub = "var io = function(){ return { on: function(){}, emit: function(){}, connected: false }; };"
    return Response(content=stub, media_type="application/javascript")


# ==================== Credits ====================


@app.get("/api/credits")
async def get_credits():
    try:
        return kie_api.credits()
    except ValueError as e:
        raise HTTPException(status_code=503, detail=f"KIE_API_KEY não configurada: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Upload ====================


@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    uploadPath: str = Form("uploads"),
):
    """Upload a file to KIE storage and return the URL."""
    try:
        suffix = Path(file.filename or "file").suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        try:
            resp = kie_api.upload_stream(tmp_path, upload_path=uploadPath, file_name=file.filename)
            url = kie_api._extract_uploaded_url(resp)
            return {"success": True, "upload": resp, "url": url}
        finally:
            _safe_unlink(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Market (Unified) ====================


@app.post("/api/market/create")
async def market_create(
    model: str = Form(...),
    input_json: str = Form(...),
    callback: Optional[str] = Form(None),
):
    try:
        input_data = json.loads(input_json)
        resp = kie_api.market_create_task(model, input_data, callback_url=callback or CALLBACK_URL)
        _validate_api_response(resp)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/market/task/{task_id}")
async def market_task(task_id: str):
    try:
        return kie_api.market_task_info(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== MJ (Midjourney) ====================


@app.post("/api/mj/generate")
async def mj_create(
    payload_json: str = Form(...),
):
    try:
        payload = json.loads(payload_json)
        _ensure_callback_url(payload)
        resp = kie_api.mj_generate(payload)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/mj/task/{task_id}")
async def mj_task(task_id: str):
    try:
        return kie_api.mj_task_info(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mj/upscale")
async def mj_upscale(
    payload_json: str = Form(...),
):
    """Upscale a previously generated MJ image."""
    try:
        payload = json.loads(payload_json)
        _ensure_callback_url(payload)
        resp = kie_api.mj_upscale(payload)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mj/vary")
async def mj_vary(
    payload_json: str = Form(...),
):
    """Generate variations of a previously generated MJ image."""
    try:
        payload = json.loads(payload_json)
        _ensure_callback_url(payload)
        resp = kie_api.mj_vary(payload)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mj/video-extend")
async def mj_video_extend(
    payload_json: str = Form(...),
):
    """Extend a previously generated MJ video."""
    try:
        payload = json.loads(payload_json)
        _ensure_callback_url(payload)
        resp = kie_api.mj_video_extend(payload)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Perfect Shortcuts ====================


@app.post("/api/shortcuts/recraft-rmbg")
async def shortcut_recraft_rmbg(
    file: UploadFile = File(...),
    uploadPath: str = Form("images"),
    callback: Optional[str] = Form(None),
):
    try:
        suffix = Path(file.filename or "img.png").suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        try:
            resp = kie_api.recraft_remove_background_from_local(
                tmp_path, upload_path=uploadPath, callback_url=callback or CALLBACK_URL, file_name=file.filename
            )
            return resp
        finally:
            _safe_unlink(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/shortcuts/topaz-upscale")
async def shortcut_topaz_upscale(
    file: UploadFile = File(...),
    factor: str = Form("2"),
    uploadPath: str = Form("videos"),
    callback: Optional[str] = Form(None),
):
    try:
        suffix = Path(file.filename or "video.mp4").suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        try:
            resp = kie_api.topaz_video_upscale_from_local(
                tmp_path, upscale_factor=factor, upload_path=uploadPath, callback_url=callback or CALLBACK_URL, file_name=file.filename
            )
            return resp
        finally:
            _safe_unlink(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Generic: Upload + Create Task ====================


@app.post("/api/process")
async def process_file(
    file: UploadFile = File(...),
    model: str = Form(...),
    input_json: str = Form("{}"),
    file_field: str = Form("image"),
    uploadPath: str = Form("uploads"),
):
    """
    Generic endpoint: Upload file → get URL → create market task.
    """
    try:
        suffix = Path(file.filename or "file").suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        try:
            # Step 1: Upload
            up_resp = kie_api.upload_stream(tmp_path, upload_path=uploadPath, file_name=file.filename)
            file_url = kie_api._extract_uploaded_url(up_resp)

            # Step 2: Build input
            extra = json.loads(input_json) if input_json else {}
            # Fields ending with _urls expect an array of URLs
            if file_field.endswith("_urls"):
                extra[file_field] = [file_url]
            else:
                extra[file_field] = file_url

            # Step 3: Create task
            task_resp = kie_api.market_create_task(model, extra, callback_url=CALLBACK_URL)

            return {
                "success": True,
                "uploaded_url": file_url,
                "task": task_resp,
            }
        finally:
            _safe_unlink(tmp_path)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input_json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Text-only Market Task (no file upload) ====================


@app.post("/api/market/create-json")
async def market_create_json_body(
    model: str = Form(...),
    input_json: str = Form(...),
):
    """Create a Market task from JSON input only (no file upload needed)."""
    try:
        input_data = json.loads(input_json)
        resp = kie_api.market_create_task(model, input_data, callback_url=CALLBACK_URL)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Suno-specific API proxy ====================


@app.post("/api/suno/create")
async def suno_create(
    model: str = Form(...),
    input_json: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    """Proxy to Suno-specific API endpoints (extend, cover, vocals, etc.)."""
    try:
        input_data = json.loads(input_json)

        # If a file was uploaded, stream it to KIE upload API first
        if file and file.filename:
            suffix = Path(file.filename).suffix or ".tmp"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name
            try:
                up_resp = kie_api.upload_stream(tmp_path, upload_path="audio")
                upload_url = kie_api._extract_uploaded_url(up_resp)
                input_data["uploadUrl"] = upload_url
            finally:
                Path(tmp_path).unlink(missing_ok=True)

        _ensure_callback_url(input_data)
        resp = kie_api.suno_create_task(model, input_data)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/suno/task/{task_id}")
async def suno_task(task_id: str):
    """Get Suno task status."""
    try:
        return kie_api.suno_task_info(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Veo 3.1 API proxy ====================


@app.post("/api/veo/create")
async def veo_create(
    model: str = Form(...),
    input_json: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    """Proxy to Veo 3.1 API endpoints (generate, extend)."""
    try:
        input_data = json.loads(input_json)

        # If a file was uploaded (image-to-video), upload it first then add to imageUrls
        upload_url = None
        if file and file.filename:
            suffix = Path(file.filename).suffix or ".tmp"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name
            try:
                up_resp = kie_api.upload_stream(tmp_path, upload_path="image")
                upload_url = kie_api._extract_uploaded_url(up_resp)
                input_data["imageUrls"] = [upload_url]
            finally:
                Path(tmp_path).unlink(missing_ok=True)

        _ensure_callback_url(input_data)
        resp = kie_api.veo_create_task(model, input_data)
        # Attach uploaded_url so frontend can display the input image (like gpt4o/flux)
        if isinstance(resp, dict) and file and file.filename:
            resp["uploaded_url"] = upload_url
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/veo/task/{task_id}")
async def veo_task(task_id: str):
    """Get Veo 3.1 task status."""
    try:
        return kie_api.veo_task_info(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/veo/1080p/{task_id}")
async def veo_1080p(task_id: str):
    """Get 1080P version of a Veo video."""
    try:
        return kie_api.veo_get_1080p(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/veo/4k")
async def veo_4k(task_id: str = Form(...)):
    """Get 4K version of a Veo video."""
    try:
        return kie_api.veo_get_4k(task_id, callback_url=CALLBACK_URL)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== GPT 4o Image API proxy ====================


@app.post("/api/gpt4o-image/create")
async def gpt4o_image_create(
    model: str = Form(...),
    input_json: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    """Proxy to GPT 4o Image API. Supports optional image upload via filesUrl."""
    try:
        input_data = json.loads(input_json)

        # If a file was uploaded, upload it first then add to filesUrl
        upload_url = None
        if file and file.filename:
            suffix = Path(file.filename).suffix or ".tmp"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name
            try:
                up_resp = kie_api.upload_stream(tmp_path, upload_path="images")
                upload_url = kie_api._extract_uploaded_url(up_resp)
                existing = input_data.get("filesUrl", [])
                if not isinstance(existing, list):
                    existing = []
                existing.append(upload_url)
                input_data["filesUrl"] = existing
            finally:
                Path(tmp_path).unlink(missing_ok=True)

        _ensure_callback_url(input_data)
        resp = kie_api.gpt4o_image_generate(input_data)
        _validate_api_response(resp)
        if isinstance(resp, dict) and upload_url:
            resp["uploaded_url"] = upload_url
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/gpt4o-image/task/{task_id}")
async def gpt4o_image_task(task_id: str):
    """Get GPT 4o Image task status."""
    try:
        return kie_api.gpt4o_image_task_info(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/gpt4o-image/download-url")
async def gpt4o_image_download(
    taskId: str = Form(...),
    url: str = Form(...),
):
    """Get a signed download URL for a GPT 4o Image result."""
    try:
        resp = kie_api.gpt4o_image_download_url(taskId, url)
        return resp
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Flux Kontext API proxy ====================


@app.post("/api/flux-kontext/create")
async def flux_kontext_create(
    model: str = Form(...),
    input_json: str = Form(...),
    file: Optional[UploadFile] = File(None),
):
    """Proxy to Flux Kontext API. Supports optional image upload via inputImage."""
    try:
        input_data = json.loads(input_json)

        # If a file was uploaded, upload it first then set inputImage
        upload_url = None
        if file and file.filename:
            suffix = Path(file.filename).suffix or ".tmp"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name
            try:
                up_resp = kie_api.upload_stream(tmp_path, upload_path="images")
                upload_url = kie_api._extract_uploaded_url(up_resp)
                input_data["inputImage"] = upload_url
            finally:
                Path(tmp_path).unlink(missing_ok=True)

        # Ensure model is set in input_data
        if "model" not in input_data:
            input_data["model"] = model

        _ensure_callback_url(input_data)
        resp = kie_api.flux_kontext_generate(input_data)
        _validate_api_response(resp)
        if isinstance(resp, dict) and upload_url:
            resp["uploaded_url"] = upload_url
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/flux-kontext/task/{task_id}")
async def flux_kontext_task(task_id: str):
    """Get Flux Kontext task status."""
    try:
        return kie_api.flux_kontext_task_info(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Server-Side History ====================

HISTORY_DIR = Path(os.environ.get("HISTORY_DIR", "/data"))
if not HISTORY_DIR.exists():
    HISTORY_DIR = Path(__file__).parent / "data"
HISTORY_FILE = HISTORY_DIR / "kie_history.json"
HISTORY_MAX = 500  # Keep last N entries

def _load_server_history() -> list:
    try:
        if HISTORY_FILE.exists():
            return json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
    except Exception:
        pass
    return []

def _save_server_history(history: list):
    try:
        HISTORY_DIR.mkdir(parents=True, exist_ok=True)
        HISTORY_FILE.write_text(json.dumps(history[:HISTORY_MAX], ensure_ascii=False), encoding="utf-8")
    except Exception as e:
        print(f"[history] Failed to save: {e}")

@app.post("/api/history")
async def save_history_entry(
    entry_json: str = Form(...),
):
    """Save a task result to server-side history."""
    try:
        entry = json.loads(entry_json)
        if not entry.get("id"):
            raise HTTPException(status_code=400, detail="Entry must have id")
        history = _load_server_history()
        # Remove duplicate
        history = [h for h in history if h.get("id") != entry["id"]]
        history.insert(0, entry)
        _save_server_history(history)
        return {"success": True, "count": len(history)}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history(cat: Optional[str] = None, limit: int = 100):
    """Get server-side history, optionally filtered by category."""
    history = _load_server_history()
    if cat:
        history = [h for h in history if h.get("cat") == cat]
    return {"history": history[:limit], "total": len(history)}

@app.delete("/api/history/{entry_id}")
async def delete_history_entry(entry_id: str):
    """Delete a specific history entry by ID."""
    history = _load_server_history()
    history = [h for h in history if h.get("id") != entry_id]
    _save_server_history(history)
    return {"success": True, "count": len(history)}

@app.delete("/api/history")
async def clear_history(cat: Optional[str] = None):
    """Clear server-side history, optionally filtered to a specific category."""
    history = _load_server_history()
    if cat:
        history = [h for h in history if h.get("cat") != cat]
    else:
        history = []
    _save_server_history(history)
    return {"success": True}


def _extract_result_urls(data: dict) -> list:
    """Extract result URLs from task data, checking multiple response formats."""
    urls = []
    if not isinstance(data, dict):
        return urls
    for key in ("resultUrl", "output", "fileUrl", "downloadUrl", "audioUrl", "videoUrl"):
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
        except:
            result_json = None
    if isinstance(result_json, dict):
        for key in ("resultUrl", "resultUrls", "output", "fileUrl", "downloadUrl", "videoUrl", "audioUrl"):
            val = result_json.get(key)
            if isinstance(val, str) and val.startswith("http"):
                urls.append(val)
            elif isinstance(val, list):
                urls.extend(u for u in val if isinstance(u, str) and u.startswith("http"))
    resp = data.get("response", {})
    if isinstance(resp, dict):
        for key in ("resultUrl", "output", "fileUrl", "downloadUrl"):
            val = resp.get(key)
            if isinstance(val, str) and val.startswith("http"):
                urls.append(val)
        for s in (resp.get("sunoData") or []):
            if isinstance(s, dict):
                for k in ("audioUrl", "videoUrl", "sourceAudioUrl"):
                    if s.get(k): urls.append(s[k])
    return list(dict.fromkeys(urls))

def _infer_cat(model: str) -> str:
    m = (model or "").lower()
    if "suno" in m: return "music"
    if "elevenlabs" in m: return "audio"
    if "topaz" in m or "crisp" in m or "recraft" in m: return "tools"
    if any(x in m for x in ["video", "kling", "wan", "hailuo", "sora", "veo"]): return "video"
    if "mj" in m or "midjourney" in m: return "mj"
    return "image"

@app.post("/api/history/import")
async def import_history_tasks(
    task_ids_json: str = Form(...),
):
    """Import tasks by fetching their info from kie.ai API and saving to history."""
    try:
        task_ids = json.loads(task_ids_json)
        if not isinstance(task_ids, list):
            raise HTTPException(status_code=400, detail="task_ids_json must be a JSON array")
        
        history = _load_server_history()
        existing_ids = {h["id"] for h in history if "id" in h}
        imported = 0
        errors = []
        
        for tid in task_ids:
            if tid in existing_ids:
                continue
            try:
                resp = kie_api.market_task_info(tid)
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
                history.insert(0, entry)
                imported += 1
            except Exception as e:
                errors.append({"id": tid, "error": str(e)})
        
        _save_server_history(history)
        return {"success": True, "imported": imported, "total": len(history), "errors": errors}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("KIE_PORT", "8420"))
    uvicorn.run(app, host="0.0.0.0", port=port)

