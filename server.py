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
    except SystemExit as e:
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
        resp = kie_api.market_create_task(model, input_data, callback_url=callback)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
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
                tmp_path, upload_path=uploadPath, callback_url=callback
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
                tmp_path, upscale_factor=factor, upload_path=uploadPath, callback_url=callback
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
            extra[file_field] = file_url

            # Step 3: Create task
            task_resp = kie_api.market_create_task(model, extra)

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
        resp = kie_api.market_create_task(model, input_data)
        return resp
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid input JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Static Files (MUST be last) ====================

app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("KIE_PORT", "8420"))
    uvicorn.run(app, host="0.0.0.0", port=port)

