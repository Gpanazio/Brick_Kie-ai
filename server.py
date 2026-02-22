"""
KIE AI — FastAPI Server
Wraps kie_api.py functions into REST endpoints for the frontend.
"""

import json
import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from dotenv import load_dotenv
load_dotenv()

import kie_api

FRONTEND_DIR = Path(__file__).parent / "frontend"

# root_path for reverse proxy subpath (e.g. /kie-ai)
ROOT_PATH = os.environ.get("ROOT_PATH", "")
# Callback URL for KIE.ai webhooks (set by parent Node.js server from RAILWAY_PUBLIC_DOMAIN)
CALLBACK_URL = os.environ.get("KIE_CALLBACK_URL", "")

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


@app.get("/", response_class=FileResponse)
async def serve_index():
    response = FileResponse(FRONTEND_DIR / "index.html", media_type="text/html")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@app.get("/favicon.ico")
async def favicon():
    return Response(content=b"", media_type="image/x-icon", status_code=204)


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
            os.unlink(tmp_path)
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
            os.unlink(tmp_path)
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
            os.unlink(tmp_path)
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
            os.unlink(tmp_path)
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


app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("KIE_PORT", "8420"))
    uvicorn.run(app, host="0.0.0.0", port=port)

