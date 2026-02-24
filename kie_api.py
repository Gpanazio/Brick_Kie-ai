import argparse
import json
import os
import sys
import time
import mimetypes
from pathlib import Path
from typing import Any, Dict, Optional

import requests

# ==================== Config ====================

# Market + MJ share the same API key header.
# Accepts KIE_API_KEY or KIE_API (Railway env var name)
API_KEY = os.environ.get("KIE_API_KEY") or os.environ.get("KIE_API")

# Market base
BASE_URL = os.environ.get("KIE_BASE_URL", "https://api.kie.ai")

# Upload API base (per docs)
UPLOAD_BASE_URL = os.environ.get("KIE_UPLOAD_BASE_URL", "https://kieai.redpandaai.co")

# --- Market Unified API (docs)
# POST https://api.kie.ai/api/v1/jobs/createTask
# GET  https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...
# GET  https://api.kie.ai/api/v1/chat/credit  (docs say /user/credits but 404)
CREATE_TASK_PATH = "/api/v1/jobs/createTask"
RECORD_INFO_PATH = "/api/v1/jobs/recordInfo"
CREDITS_PATH = "/api/v1/chat/credit"

# --- MJ API (Midjourney)
# POST https://api.kie.ai/api/v1/mj/generate
# GET  https://api.kie.ai/api/v1/mj/record-info?taskId=...
MJ_GENERATE_PATH = "/api/v1/mj/generate"
MJ_RECORD_INFO_PATH = "/api/v1/mj/record-info"

# --- File Upload API (docs)
# POST https://kieai.redpandaai.co/api/file-stream-upload
# POST https://kieai.redpandaai.co/api/file-url-upload
UPLOAD_STREAM_PATH = "/api/file-stream-upload"
UPLOAD_URL_PATH = "/api/file-url-upload"


def _auth_headers_json() -> Dict[str, str]:
    if not API_KEY:
        raise ValueError("KIE_API_KEY não definido no ambiente.")
    return {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }


def _auth_headers_no_content_type() -> Dict[str, str]:
    if not API_KEY:
        raise ValueError("KIE_API_KEY não definido no ambiente.")
    return {"Authorization": f"Bearer {API_KEY}"}


def _url(base: str, path: str) -> str:
    return base.rstrip("/") + path


# ==================== Upload ====================


def upload_stream(file_path: str, upload_path: str = "uploads", file_name: Optional[str] = None) -> Dict[str, Any]:
    """Uploads a local file (multipart/form-data) and returns the full JSON response."""
    p = Path(file_path)
    if not p.exists():
        raise FileNotFoundError(str(p))

    url = _url(UPLOAD_BASE_URL, UPLOAD_STREAM_PATH)

    # multipart: file + uploadPath + fileName (optional)
    data = {"uploadPath": upload_path}
    if file_name:
        data["fileName"] = file_name

    mime_type, _ = mimetypes.guess_type(file_name or p.name)
    mime_type = mime_type or "application/octet-stream"

    with p.open("rb") as f:
        files = {"file": (file_name or p.name, f, mime_type)}
        r = requests.post(url, headers=_auth_headers_no_content_type(), files=files, data=data, timeout=300)
    r.raise_for_status()
    return r.json()


def upload_url(file_url: str, upload_path: str = "uploads", file_name: Optional[str] = None) -> Dict[str, Any]:
    url = _url(UPLOAD_BASE_URL, UPLOAD_URL_PATH)
    payload: Dict[str, Any] = {"fileUrl": file_url, "uploadPath": upload_path}
    if file_name:
        payload["fileName"] = file_name

    r = requests.post(url, headers=_auth_headers_json(), data=json.dumps(payload), timeout=120)
    r.raise_for_status()
    return r.json()


def _extract_uploaded_url(resp: Dict[str, Any]) -> str:
    """Tries to extract a usable URL from upload response."""
    if not isinstance(resp, dict):
        raise ValueError(f"Resposta inesperada de upload: {resp}")

    data = resp.get("data")
    if isinstance(data, dict):
        # docs show downloadUrl. quickstart shows fileUrl sometimes.
        for k in ("fileUrl", "downloadUrl"):
            if data.get(k):
                return data[k]

    raise ValueError(f"Não achei fileUrl/downloadUrl no upload response: {resp}")


# ==================== Market ====================


def credits() -> Dict[str, Any]:
    r = requests.get(_url(BASE_URL, CREDITS_PATH), headers=_auth_headers_json(), timeout=60)
    r.raise_for_status()
    return r.json()


def market_create_task(model: str, input_data: Dict[str, Any], callback_url: Optional[str] = None) -> Dict[str, Any]:
    payload: Dict[str, Any] = {"model": model, "input": input_data}
    if callback_url:
        payload["callBackUrl"] = callback_url

    r = requests.post(_url(BASE_URL, CREATE_TASK_PATH), headers=_auth_headers_json(), data=json.dumps(payload), timeout=180)
    r.raise_for_status()
    return r.json()


def market_task_info(task_id: str) -> Dict[str, Any]:
    r = requests.get(_url(BASE_URL, RECORD_INFO_PATH), headers=_auth_headers_json(), params={"taskId": task_id}, timeout=60)
    r.raise_for_status()
    return r.json()


def _market_state(resp: Dict[str, Any]) -> Optional[str]:
    data = resp.get("data") if isinstance(resp, dict) else None
    if isinstance(data, dict):
        return data.get("state")
    return None


def market_wait(task_id: str, interval: float = 5.0, timeout_s: float = 1800.0) -> Dict[str, Any]:
    t0 = time.time()
    last: Dict[str, Any] = {}

    while True:
        last = market_task_info(task_id)
        state = _market_state(last)
        if state in ("success", "fail"):
            return last
        if time.time() - t0 > timeout_s:
            raise TimeoutError(f"Timeout (market) task {task_id}. Último state: {state} | resp={last}")
        time.sleep(interval)


# ==================== Suno ====================

SUNO_API_PATHS: Dict[str, str] = {
    "suno/generate-music": "/api/v1/generate",
    "suno/generate-lyrics": "/api/v1/lyrics",
    "suno/extend-music": "/api/v1/generate/extend",
    "suno/upload-extend": "/api/v1/generate/upload-extend",
    "suno/upload-cover": "/api/v1/generate/upload-cover",
    "suno/add-instrumental": "/api/v1/generate/add-instrumental",
    "suno/add-vocals": "/api/v1/generate/add-vocals",
    "suno/separate-vocals": "/api/v1/vocal-removal/generate",
    "suno/music-video": "/api/v1/mp4/generate",
    "suno/convert-wav": "/api/v1/wav/generate",
    "suno/get-lyrics": "/api/v1/generate/get-timestamped-lyrics",
    "suno/generate-persona": "/api/v1/generate/generate-persona",
    "suno/cover-suno": "/api/v1/suno/cover/generate",
    "suno/generate-midi": "/api/v1/suno/midi/generate",
}

# These Suno endpoints use GET instead of POST
SUNO_GET_ENDPOINTS: set = {"suno/get-lyrics"}

SUNO_TASK_INFO_PATH = "/api/v1/generate/record-info"


def suno_create_task(model: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Call a Suno-specific API endpoint (not Market)."""
    api_path = SUNO_API_PATHS.get(model)
    if not api_path:
        raise ValueError(f"Modelo Suno desconhecido: {model}")

    # Some Suno endpoints use GET (e.g. timestamped lyrics)
    if model in SUNO_GET_ENDPOINTS:
        r = requests.get(
            _url(BASE_URL, api_path),
            headers=_auth_headers_json(),
            params=input_data,
            timeout=60,
        )
    else:
        r = requests.post(
            _url(BASE_URL, api_path),
            headers=_auth_headers_json(),
            data=json.dumps(input_data),
            timeout=180,
        )
    r.raise_for_status()
    return r.json()


def suno_task_info(task_id: str) -> Dict[str, Any]:
    """Get Suno task details via the Suno-specific record-info endpoint."""
    r = requests.get(
        _url(BASE_URL, SUNO_TASK_INFO_PATH),
        headers=_auth_headers_json(),
        params={"taskId": task_id},
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


# ==================== Veo 3.1 (Google) ====================

VEO_GENERATE_PATH = "/api/v1/veo/generate"
VEO_EXTEND_PATH = "/api/v1/veo/extend"
VEO_1080P_PATH = "/api/v1/veo/get-1080p-video"
VEO_4K_PATH = "/api/v1/veo/get-4k-video"
VEO_RECORD_INFO_PATH = "/api/v1/veo/record-info"

# Map frontend model names → (api_model, api_path, method)
VEO_MODEL_MAP: Dict[str, Dict[str, str]] = {
    "veo3/text-to-video-fast": {"model": "veo3_fast", "path": VEO_GENERATE_PATH},
    "veo3/text-to-video-quality": {"model": "veo3", "path": VEO_GENERATE_PATH},
    "veo3/image-to-video-fast": {"model": "veo3_fast", "path": VEO_GENERATE_PATH},
    "veo3/image-to-video-quality": {"model": "veo3", "path": VEO_GENERATE_PATH},
    "veo3/extend-fast": {"model": "fast", "path": VEO_EXTEND_PATH},
    "veo3/extend-quality": {"model": "quality", "path": VEO_EXTEND_PATH},
}


def veo_create_task(model: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Call a Veo 3.1 API endpoint (generate or extend)."""
    mapping = VEO_MODEL_MAP.get(model)
    if not mapping:
        raise ValueError(f"Modelo Veo desconhecido: {model}")

    input_data["model"] = mapping["model"]
    r = requests.post(
        _url(BASE_URL, mapping["path"]),
        headers=_auth_headers_json(),
        data=json.dumps(input_data),
        timeout=180,
    )
    r.raise_for_status()
    return r.json()


def veo_get_1080p(task_id: str) -> Dict[str, Any]:
    """Get 1080P version of a Veo video."""
    r = requests.get(
        _url(BASE_URL, VEO_1080P_PATH),
        headers=_auth_headers_json(),
        params={"taskId": task_id},
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


def veo_get_4k(task_id: str, callback_url: Optional[str] = None) -> Dict[str, Any]:
    """Get 4K version of a Veo video."""
    payload: Dict[str, Any] = {"taskId": task_id}
    if callback_url:
        payload["callBackUrl"] = callback_url
    r = requests.post(
        _url(BASE_URL, VEO_4K_PATH),
        headers=_auth_headers_json(),
        data=json.dumps(payload),
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


def veo_task_info(task_id: str) -> Dict[str, Any]:
    """Get Veo task details."""
    r = requests.get(
        _url(BASE_URL, VEO_RECORD_INFO_PATH),
        headers=_auth_headers_json(),
        params={"taskId": task_id},
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


# ==================== MJ (Midjourney) ====================

MJ_UPSCALE_PATH = "/api/v1/mj/generateUpscale"
MJ_VARY_PATH = "/api/v1/mj/generateVary"
MJ_VIDEO_EXTEND_PATH = "/api/v1/mj/generateVideoExtend"


def mj_generate(payload: Dict[str, Any]) -> Dict[str, Any]:
    r = requests.post(_url(BASE_URL, MJ_GENERATE_PATH), headers=_auth_headers_json(), data=json.dumps(payload), timeout=180)
    r.raise_for_status()
    return r.json()


def mj_upscale(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Upscale a previously generated MJ image. Payload: {taskId, imageIndex, waterMark?, callBackUrl?}"""
    r = requests.post(_url(BASE_URL, MJ_UPSCALE_PATH), headers=_auth_headers_json(), data=json.dumps(payload), timeout=180)
    r.raise_for_status()
    return r.json()


def mj_vary(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Generate variations of a previously generated MJ image. Payload: {taskId, imageIndex, waterMark?, callBackUrl?}"""
    r = requests.post(_url(BASE_URL, MJ_VARY_PATH), headers=_auth_headers_json(), data=json.dumps(payload), timeout=180)
    r.raise_for_status()
    return r.json()


def mj_video_extend(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Extend a previously generated MJ video. Payload: {taskId, index, taskType, prompt?, waterMark?, callBackUrl?}"""
    r = requests.post(_url(BASE_URL, MJ_VIDEO_EXTEND_PATH), headers=_auth_headers_json(), data=json.dumps(payload), timeout=180)
    r.raise_for_status()
    return r.json()


def mj_task_info(task_id: str) -> Dict[str, Any]:
    r = requests.get(_url(BASE_URL, MJ_RECORD_INFO_PATH), headers=_auth_headers_json(), params={"taskId": task_id}, timeout=60)
    r.raise_for_status()
    return r.json()


def _mj_state(resp: Dict[str, Any]) -> Optional[str]:
    data = resp.get("data") if isinstance(resp, dict) else None
    if isinstance(data, dict):
        sf = data.get("successFlag")
        if sf == 1 or data.get("resultUrls") or data.get("resultInfoJson"):
            return "success"
        if sf is not None and sf > 1:
            return "fail"
        if data.get("errorCode"):
            return "fail"
    return None


def mj_wait(task_id: str, interval: float = 5.0, timeout_s: float = 1800.0) -> Dict[str, Any]:
    t0 = time.time()
    last: Dict[str, Any] = {}

    while True:
        last = mj_task_info(task_id)
        status = _mj_state(last)

        if status and str(status).lower() in ("success", "succeeded", "completed", "done", "fail", "failed", "error"):
            return last

        data = last.get("data") if isinstance(last, dict) else None
        if isinstance(data, dict) and data.get("resultUrls"):
            return last

        if time.time() - t0 > timeout_s:
            raise TimeoutError(f"Timeout (mj) task {task_id}. Último status: {status} | resp={last}")

        time.sleep(interval)


# ==================== GPT 4o Image ====================

GPT4O_IMAGE_GENERATE = "/api/v1/gpt4o-image/generate"
GPT4O_IMAGE_RECORD = "/api/v1/gpt4o-image/record-info"  # docs also list /get-details
GPT4O_IMAGE_DOWNLOAD = "/api/v1/gpt4o-image/download-url"


def gpt4o_image_generate(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate an image using GPT 4o Image API."""
    r = requests.post(
        _url(BASE_URL, GPT4O_IMAGE_GENERATE),
        headers=_auth_headers_json(),
        data=json.dumps(input_data),
        timeout=180,
    )
    r.raise_for_status()
    return r.json()


def gpt4o_image_task_info(task_id: str) -> Dict[str, Any]:
    """Get GPT 4o Image task details."""
    r = requests.get(
        _url(BASE_URL, GPT4O_IMAGE_RECORD),
        headers=_auth_headers_json(),
        params={"taskId": task_id},
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


def gpt4o_image_download_url(task_id: str, url: str) -> Dict[str, Any]:
    """Get a signed download URL for a GPT 4o Image result."""
    payload: Dict[str, Any] = {"taskId": task_id, "url": url}
    r = requests.post(
        _url(BASE_URL, GPT4O_IMAGE_DOWNLOAD),
        headers=_auth_headers_json(),
        data=json.dumps(payload),
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


# ==================== Flux Kontext ====================

FLUX_KONTEXT_GENERATE = "/api/v1/flux/kontext/generate"
FLUX_KONTEXT_RECORD = "/api/v1/flux/kontext/record-info"  # docs also list /get-details


def flux_kontext_generate(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate or edit an image using Flux Kontext API."""
    r = requests.post(
        _url(BASE_URL, FLUX_KONTEXT_GENERATE),
        headers=_auth_headers_json(),
        data=json.dumps(input_data),
        timeout=180,
    )
    r.raise_for_status()
    return r.json()


def flux_kontext_task_info(task_id: str) -> Dict[str, Any]:
    """Get Flux Kontext task details."""
    r = requests.get(
        _url(BASE_URL, FLUX_KONTEXT_RECORD),
        headers=_auth_headers_json(),
        params={"taskId": task_id},
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


# ==================== Common API ====================


DOWNLOAD_URL_PATH = "/api/v1/common/download-url"


def download_url(file_url: str) -> Dict[str, Any]:
    """Get a temporary download URL for a KIE-generated file (valid ~20 min)."""
    r = requests.post(
        _url(BASE_URL, DOWNLOAD_URL_PATH),
        headers=_auth_headers_json(),
        data=json.dumps({"url": file_url}),
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


# ==================== Upload (Base64) ====================


UPLOAD_BASE64_PATH = "/api/file-base64-upload"


def upload_base64(base64_data: str, upload_path: str = "uploads", file_name: Optional[str] = None) -> Dict[str, Any]:
    """Upload a base64-encoded file. Suitable for small files (<10 MB encoded)."""
    payload: Dict[str, Any] = {"base64Data": base64_data, "uploadPath": upload_path}
    if file_name:
        payload["fileName"] = file_name

    r = requests.post(
        _url(UPLOAD_BASE_URL, UPLOAD_BASE64_PATH),
        headers=_auth_headers_json(),
        data=json.dumps(payload),
        timeout=120,
    )
    r.raise_for_status()
    return r.json()


# ==================== Convenience wrappers ====================


def recraft_remove_background_from_local(image_path: str, upload_path: str = "images", callback_url: Optional[str] = None, file_name: Optional[str] = None) -> Dict[str, Any]:
    up = upload_stream(image_path, upload_path=upload_path, file_name=file_name)
    image_url = _extract_uploaded_url(up)
    return market_create_task(
        model="recraft/remove-background",
        input_data={"image": image_url},
        callback_url=callback_url,
    )


def topaz_video_upscale_from_local(video_path: str, upscale_factor: str = "2", upload_path: str = "videos", callback_url: Optional[str] = None, file_name: Optional[str] = None) -> Dict[str, Any]:
    up = upload_stream(video_path, upload_path=upload_path, file_name=file_name)
    video_url = _extract_uploaded_url(up)
    return market_create_task(
        model="topaz/video-upscale",
        input_data={"video_url": video_url, "upscale_factor": str(upscale_factor)},
        callback_url=callback_url,
    )


# ==================== CLI ====================


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(prog="kie_api", description="CLI para KIE.ai (Market + MJ + Upload)")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("credits", help="Mostra créditos restantes (Market)")

    # -------- Market
    p_m_create = sub.add_parser("create", help="(Market) Cria uma task (model + input JSON)")
    p_m_create.add_argument("--model", required=True)
    p_m_create.add_argument("--input", required=True, help='JSON string. Ex: {"prompt":"..."}')
    p_m_create.add_argument("--callback")

    p_m_task = sub.add_parser("task", help="(Market) Busca info de uma task")
    p_m_task.add_argument("task_id")

    p_m_wait = sub.add_parser("wait", help="(Market) Espera uma task finalizar")
    p_m_wait.add_argument("task_id")
    p_m_wait.add_argument("--interval", type=float, default=5.0)
    p_m_wait.add_argument("--timeout", type=float, default=1800.0)

    # -------- MJ
    p_mj_gen = sub.add_parser("mj-generate", help="(MJ) Cria uma task Midjourney (payload JSON)")
    p_mj_gen.add_argument("--json", required=True)

    p_mj_task = sub.add_parser("mj-task", help="(MJ) Busca info de uma task")
    p_mj_task.add_argument("task_id")

    p_mj_wait = sub.add_parser("mj-wait", help="(MJ) Espera uma task finalizar")
    p_mj_wait.add_argument("task_id")
    p_mj_wait.add_argument("--interval", type=float, default=5.0)
    p_mj_wait.add_argument("--timeout", type=float, default=1800.0)

    # -------- Upload
    p_up_stream = sub.add_parser("upload-stream", help="(Upload) Sobe arquivo local e retorna JSON + URL")
    p_up_stream.add_argument("--path", required=True)
    p_up_stream.add_argument("--uploadPath", default="uploads")
    p_up_stream.add_argument("--fileName")

    p_up_url = sub.add_parser("upload-url", help="(Upload) Baixa de uma URL e sobe como temporário")
    p_up_url.add_argument("--fileUrl", required=True)
    p_up_url.add_argument("--uploadPath", default="uploads")
    p_up_url.add_argument("--fileName")

    # -------- Perfect shortcuts
    p_rmbg = sub.add_parser("recraft-rmbg", help="Upload + recraft/remove-background")
    p_rmbg.add_argument("--path", required=True)
    p_rmbg.add_argument("--uploadPath", default="images")
    p_rmbg.add_argument("--callback")

    p_topaz = sub.add_parser("topaz-upscale", help="Upload + topaz/video-upscale")
    p_topaz.add_argument("--path", required=True)
    p_topaz.add_argument("--factor", default="2", choices=["1", "2", "4"])
    p_topaz.add_argument("--uploadPath", default="videos")
    p_topaz.add_argument("--callback")

    args = p.parse_args(argv)

    try:
        if args.cmd == "credits":
            print(json.dumps(credits(), indent=2, ensure_ascii=False))
            return 0

        if args.cmd == "create":
            input_data = json.loads(args.input)
            resp = market_create_task(args.model, input_data, callback_url=args.callback)
            print(json.dumps(resp, indent=2, ensure_ascii=False))
            return 0

        if args.cmd == "task":
            print(json.dumps(market_task_info(args.task_id), indent=2, ensure_ascii=False))
            return 0

        if args.cmd == "wait":
            resp = market_wait(args.task_id, interval=args.interval, timeout_s=args.timeout)
            print(json.dumps(resp, indent=2, ensure_ascii=False))
            return 0

        if args.cmd == "mj-generate":
            payload = json.loads(args.json)
            resp = mj_generate(payload)
            print(json.dumps(resp, indent=2, ensure_ascii=False))
            return 0

        if args.cmd == "mj-task":
            print(json.dumps(mj_task_info(args.task_id), indent=2, ensure_ascii=False))
            return 0

        if args.cmd == "mj-wait":
            resp = mj_wait(args.task_id, interval=args.interval, timeout_s=args.timeout)
            print(json.dumps(resp, indent=2, ensure_ascii=False))
            return 0

        if args.cmd == "upload-stream":
            resp = upload_stream(args.path, upload_path=args.uploadPath, file_name=args.fileName)
            out = {"upload": resp}
            try:
                out["url"] = _extract_uploaded_url(resp)
            except Exception:
                pass
            print(json.dumps(out, indent=2, ensure_ascii=False))
            return 0

        if args.cmd == "upload-url":
            resp = upload_url(args.fileUrl, upload_path=args.uploadPath, file_name=args.fileName)
            out = {"upload": resp}
            try:
                out["url"] = _extract_uploaded_url(resp)
            except Exception:
                pass
            print(json.dumps(out, indent=2, ensure_ascii=False))
            return 0

        if args.cmd == "recraft-rmbg":
            resp = recraft_remove_background_from_local(args.path, upload_path=args.uploadPath, callback_url=args.callback)
            print(json.dumps(resp, indent=2, ensure_ascii=False))
            return 0

        if args.cmd == "topaz-upscale":
            resp = topaz_video_upscale_from_local(
                args.path,
                upscale_factor=args.factor,
                upload_path=args.uploadPath,
                callback_url=args.callback,
            )
            print(json.dumps(resp, indent=2, ensure_ascii=False))
            return 0

        p.print_help()
        return 2

    except requests.HTTPError as e:
        body = getattr(e.response, "text", None)
        print(f"HTTPError: {e}\nResponse: {body}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Erro: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
