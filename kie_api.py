import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, Optional

import requests

# ==================== Config ====================

# Market + MJ share the same API key header.
API_KEY = os.environ.get("KIE_API_KEY")

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
        raise SystemExit("KIE_API_KEY não definido no ambiente.")
    return {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }


def _auth_headers_no_content_type() -> Dict[str, str]:
    if not API_KEY:
        raise SystemExit("KIE_API_KEY não definido no ambiente.")
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

    with p.open("rb") as f:
        files = {"file": (file_name or p.name, f)}
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


# ==================== MJ (Midjourney) ====================


def mj_generate(payload: Dict[str, Any]) -> Dict[str, Any]:
    r = requests.post(_url(BASE_URL, MJ_GENERATE_PATH), headers=_auth_headers_json(), data=json.dumps(payload), timeout=180)
    r.raise_for_status()
    return r.json()


def mj_task_info(task_id: str) -> Dict[str, Any]:
    r = requests.get(_url(BASE_URL, MJ_RECORD_INFO_PATH), headers=_auth_headers_json(), params={"taskId": task_id}, timeout=60)
    r.raise_for_status()
    return r.json()


def _mj_state(resp: Dict[str, Any]) -> Optional[str]:
    data = resp.get("data") if isinstance(resp, dict) else None
    if isinstance(data, dict):
        return data.get("status") or data.get("state")
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


# ==================== Convenience wrappers ====================


def recraft_remove_background_from_local(image_path: str, upload_path: str = "images", callback_url: Optional[str] = None) -> Dict[str, Any]:
    up = upload_stream(image_path, upload_path=upload_path)
    image_url = _extract_uploaded_url(up)
    return market_create_task(
        model="recraft/remove-background",
        input_data={"image": image_url},
        callback_url=callback_url,
    )


def topaz_video_upscale_from_local(video_path: str, upscale_factor: str = "2", upload_path: str = "videos", callback_url: Optional[str] = None) -> Dict[str, Any]:
    up = upload_stream(video_path, upload_path=upload_path)
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
