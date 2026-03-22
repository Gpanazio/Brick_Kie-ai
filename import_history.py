"""
Import historical tasks into server-side history by fetching from kie.ai API.
Usage: python import_history.py
"""
import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
import kie_api

HISTORY_DIR = Path(os.environ.get("HISTORY_DIR", "/data"))
# For local dev, use a local path
if not HISTORY_DIR.exists():
    HISTORY_DIR = Path(__file__).parent / "data"
HISTORY_FILE = HISTORY_DIR / "kie_history.json"
HISTORY_MAX = 500

TASK_IDS = [
    "2d5cfd4c59e4ec765eecd8035774190b",
    "40f7a8e98069837f25f1c8ae63a26ebc",
    "b00f8e1c46477071880301f4fac66a09",
    "ce9cff8d45999cc1eaa14329c2c2f248",
    "e8cafa0727077b9a63af5de60512ca3a",
    "6ea07610c5f297d5976fa123936d09b8",
    "770fdc0ace8538c2b198bb141198d234",
    "05efa7becf715784eda616a2f4bb9a81",
    "7bbe2092ea6fe8bbed008f8a36bff563",
    "8965b27aa454df658934da365d26a237",
    "a2a9a79cc097d4d311c1bed7b55354b1",
    "377f07e6aced6307c60055881059c4d6",
    "34c741de5a7bb52acef799a3118304ec",
    "2da79d83092b36039bb92211f8154201",
    "42632f783d202de5466831a2c9242f81",
    "62b4369003816bfe3209d845cf26b1f4",
    "b32840ef3af49f6cb25b87a1c21aa1da",
    "96c84461b26ee6c3c0a2faa3250a9075",
    "f33bc8c36e32801198910a53b17d4a9c",
    "b7cfbaafe58e6256d9461b859ea74de3",
    "3e62902fca8200163088e48ec88ecb3a",
    "e0807ba5b1177cf13d8e478f59d59c0e",
    "65ba327507bf129f5518ee001928d374",
    "e9ca0dceeb46bdd7797395f279d871d5",
    "04eee46de4de5993f42f04defcb10661",
    "46225c32e8e0416c7287b24649e517c6",
    "6d3ba4badcfd1adc8870295a28502e63",
    "bdec63b6a12173485e05f6dc372bbd3d",
    "db1b976a39fa30001986c737901ac9f0",
    # Suno / other API
    "c8c5e8d6f4218191690c2d806f39f96b",
    "01d74a1519f757a0add3a42642ed4899",
    "2191751dc93f39ca563d472e0eca9933",
    "3cc47dffed9bc3580eb50bbca8856ae1",
    "57af1872eb2a0fcbdfa1e9084101f5fa",
    "2061b93efef17e56a69b3d057c5e44b2",
    "c3253997de83f602cb8065bf90a9e53f",
    "6d96d8083a6437085580d84342926c1a",
    "1f8534002b40c1a3daf22d8557080d4e",
    "5d71313ccffc78d4c6eece9a6f0e464d",
    "a0cb2efa106140c8bd95dc551a460ef4",
]

def _infer_cat(model: str) -> str:
    m = model.lower() if model else ""
    if "suno" in m: return "music"
    if "elevenlabs" in m: return "audio"
    if "topaz" in m or "crisp" in m or "recraft" in m: return "tools"
    if any(x in m for x in ["video", "kling", "wan", "hailuo", "sora", "veo"]): return "video"
    return "image"

def _extract_urls(data: dict) -> list:
    urls = []
    if not isinstance(data, dict):
        return urls
    
    # Direct fields
    for key in ("resultUrl", "output", "fileUrl", "downloadUrl", "audioUrl", "videoUrl"):
        val = data.get(key)
        if isinstance(val, str) and val.startswith("http"):
            urls.append(val)
    
    # Array fields
    for key in ("resultUrls", "output_urls", "urls"):
        val = data.get(key)
        if isinstance(val, list):
            urls.extend(u for u in val if isinstance(u, str) and u.startswith("http"))
    
    # resultJson (Market tasks often store results here)
    result_json = data.get("resultJson")
    if isinstance(result_json, str):
        try:
            rj = json.loads(result_json)
            if isinstance(rj, dict):
                for key in ("resultUrl", "resultUrls", "output", "fileUrl", "downloadUrl", "videoUrl", "audioUrl"):
                    val = rj.get(key)
                    if isinstance(val, str) and val.startswith("http"):
                        urls.append(val)
                    elif isinstance(val, list):
                        urls.extend(u for u in val if isinstance(u, str) and u.startswith("http"))
        except:
            pass
    elif isinstance(result_json, dict):
        for key in ("resultUrl", "resultUrls", "output", "fileUrl", "downloadUrl", "videoUrl", "audioUrl"):
            val = result_json.get(key)
            if isinstance(val, str) and val.startswith("http"):
                urls.append(val)
            elif isinstance(val, list):
                urls.extend(u for u in val if isinstance(u, str) and u.startswith("http"))
    
    # Nested response
    resp = data.get("response", {})
    if isinstance(resp, dict):
        for key in ("resultUrl", "output", "fileUrl", "downloadUrl"):
            val = resp.get(key)
            if isinstance(val, str) and val.startswith("http"):
                urls.append(val)
        # Suno
        suno_data = resp.get("sunoData", [])
        if isinstance(suno_data, list):
            for s in suno_data:
                if isinstance(s, dict):
                    for k in ("audioUrl", "videoUrl", "sourceAudioUrl"):
                        if s.get(k): urls.append(s[k])
    
    return list(dict.fromkeys(urls))  # dedupe preserving order

def fetch_and_build_entry(task_id: str, debug=False) -> dict | None:
    print(f"  Fetching {task_id}...", end=" ")
    try:
        resp = kie_api.market_task_info(task_id)
        data = resp.get("data", {}) if isinstance(resp, dict) else {}
        
        if debug:
            print(f"\n    RAW DATA KEYS: {list(data.keys()) if isinstance(data, dict) else 'not dict'}")
            # Print a summary of each key's value type
            for k, v in (data.items() if isinstance(data, dict) else []):
                if isinstance(v, str) and len(v) > 100:
                    print(f"    {k}: str({len(v)} chars) = {v[:100]}...")
                elif isinstance(v, (dict, list)):
                    print(f"    {k}: {type(v).__name__}({len(v)}) = {json.dumps(v, ensure_ascii=False)[:200]}")
                else:
                    print(f"    {k}: {v}")
        
        state = data.get("state", "unknown")
        model = data.get("model", "")
        prompt = ""
        
        # Try to get prompt from input params
        input_params = data.get("input", {})
        if isinstance(input_params, dict):
            prompt = input_params.get("prompt", "")
        
        urls = _extract_urls(data)
        cat = _infer_cat(model)
        
        entry = {
            "id": task_id,
            "model": model,
            "state": state,
            "cat": cat,
            "urls": urls,
            "prompt": prompt,
            "timestamp": data.get("createTime", None),
        }
        
        print(f"✅ model={model}, state={state}, urls={len(urls)}, cat={cat}")
        return entry
    except Exception as e:
        print(f"❌ Error: {e}")
        
        # Try Suno endpoint
        try:
            resp = kie_api.suno_task_info(task_id)
            data = resp.get("data", {}) if isinstance(resp, dict) else {}
            state = data.get("state", data.get("status", "unknown"))
            urls = _extract_urls(data)
            entry = {
                "id": task_id,
                "model": "suno/generate-music",
                "state": "success" if urls else state,
                "cat": "music",
                "urls": urls,
                "prompt": data.get("prompt", ""),
                "timestamp": data.get("createTime", None),
            }
            print(f"    ↪ Suno fallback ✅ urls={len(urls)}")
            return entry
        except:
            pass
        
        return None

def main():
    print(f"=== Importing {len(TASK_IDS)} tasks ===\n")
    
    # Load existing history
    history = []
    if HISTORY_FILE.exists():
        try:
            history = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
        except:
            pass
    
    existing_ids = {h["id"] for h in history if "id" in h}
    imported = 0
    
    for tid in TASK_IDS:
        if tid in existing_ids:
            print(f"  Skipping {tid} (already in history)")
            continue
        entry = fetch_and_build_entry(tid, debug=(imported == 0))
        if entry:
            history.insert(0, entry)
            imported += 1
    
    # Save
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    HISTORY_FILE.write_text(json.dumps(history[:HISTORY_MAX], ensure_ascii=False, indent=2), encoding="utf-8")
    
    print(f"\n=== Done: {imported} imported, {len(history)} total entries ===")
    print(f"Saved to: {HISTORY_FILE}")

if __name__ == "__main__":
    main()
