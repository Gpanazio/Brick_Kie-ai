"""
storage.py — Download and serve KIE-generated media from the Railway volume.

Downloads result files (videos, images, audio) on task completion and stores them
permanently at /history/media/{task_id}/ so they survive KIE's 14-day retention.
"""

import logging
import os
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

import requests

logger = logging.getLogger(__name__)

# Railway volume mount or local fallback
MEDIA_DIR = Path(os.environ.get("MEDIA_DIR", "/history/media"))

# Thread pool for background downloads (avoids blocking the async event loop)
_pool = ThreadPoolExecutor(max_workers=3)

# Timeout for downloading files (connect, read)
_DL_TIMEOUT = (10, 300)  # 10s connect, 5min read (videos can be large)


def _ensure_dir(task_id: str) -> Path:
    """Create and return the directory for a task's media files."""
    d = MEDIA_DIR / task_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def _filename_from_url(url: str, index: int) -> str:
    """Extract a sensible filename from a URL, falling back to index-based names."""
    try:
        parsed = urlparse(url)
        path = parsed.path.rstrip("/")
        basename = path.split("/")[-1] if "/" in path else ""

        # Strip query params that might be part of the basename
        basename = basename.split("?")[0]

        # Extract extension
        ext_match = re.search(r'\.(\w{2,5})$', basename)
        ext = ext_match.group(0) if ext_match else _guess_ext_from_url(url)

        return f"{index:03d}{ext}"
    except Exception:
        return f"{index:03d}.bin"


def _guess_ext_from_url(url: str) -> str:
    """Guess file extension from URL patterns."""
    url_lower = url.lower()
    if any(x in url_lower for x in [".mp4", "video"]):
        return ".mp4"
    if any(x in url_lower for x in [".mp3", "audio"]):
        return ".mp3"
    if any(x in url_lower for x in [".wav"]):
        return ".wav"
    if any(x in url_lower for x in [".webp"]):
        return ".webp"
    if any(x in url_lower for x in [".png"]):
        return ".png"
    if any(x in url_lower for x in [".jpg", ".jpeg"]):
        return ".jpg"
    if any(x in url_lower for x in [".webm"]):
        return ".webm"
    return ".bin"


def _download_one(url: str, dest: Path) -> bool:
    """Download a single URL to dest. Returns True on success."""
    try:
        resp = requests.get(url, timeout=_DL_TIMEOUT, stream=True)
        resp.raise_for_status()

        # Refine extension from Content-Type if we got .bin
        if dest.suffix == ".bin":
            ct = resp.headers.get("content-type", "")
            ext_map = {
                "video/mp4": ".mp4",
                "video/webm": ".webm",
                "audio/mpeg": ".mp3",
                "audio/wav": ".wav",
                "audio/x-wav": ".wav",
                "image/png": ".png",
                "image/jpeg": ".jpg",
                "image/webp": ".webp",
            }
            for mime, ext in ext_map.items():
                if mime in ct:
                    dest = dest.with_suffix(ext)
                    break

        with open(dest, "wb") as f:
            for chunk in resp.iter_content(chunk_size=1024 * 256):  # 256KB chunks
                f.write(chunk)

        size_mb = dest.stat().st_size / (1024 * 1024)
        logger.info("[storage] Downloaded %s (%.1fMB) -> %s", url[:80], size_mb, dest.name)
        return True
    except Exception as e:
        logger.error("[storage] Failed to download %s: %s", url[:80], e)
        # Clean up partial file
        try:
            dest.unlink(missing_ok=True)
        except Exception:
            pass
        return False


def download_media_sync(task_id: str, urls: list[str]) -> list[str]:
    """
    Download media files for a task (synchronous, run in thread pool).

    Returns list of local filenames that were saved successfully.
    """
    if not urls:
        return []

    task_dir = _ensure_dir(task_id)
    saved: list[str] = []

    for i, url in enumerate(urls):
        if not isinstance(url, str) or not url.startswith("http"):
            continue

        filename = _filename_from_url(url, i)
        dest = task_dir / filename

        # Skip if already downloaded
        if dest.exists() and dest.stat().st_size > 0:
            saved.append(dest.name)
            continue

        if _download_one(url, dest):
            # Re-read the filename in case it was renamed by content-type detection
            # (the dest variable might have been changed with with_suffix)
            actual_files = sorted(task_dir.glob(f"{i:03d}.*"))
            if actual_files:
                saved.append(actual_files[0].name)

    logger.info("[storage] Task %s: saved %d/%d files", task_id, len(saved), len(urls))
    return saved


async def download_media(task_id: str, urls: list[str]) -> list[str]:
    """
    Async wrapper: download media in a background thread.
    Returns list of local filenames.
    """
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_pool, download_media_sync, task_id, urls)


def get_local_path(task_id: str, filename: str) -> Path | None:
    """Return the full path to a local media file, or None if not found."""
    path = MEDIA_DIR / task_id / filename
    if path.exists() and path.is_file():
        # Security: ensure resolved path is within MEDIA_DIR
        if MEDIA_DIR.resolve() in path.resolve().parents or path.resolve().parent == MEDIA_DIR.resolve():
            return path
    return None


def list_local_files(task_id: str) -> list[str]:
    """List all downloaded media files for a task."""
    task_dir = MEDIA_DIR / task_id
    if not task_dir.exists():
        return []
    return sorted(f.name for f in task_dir.iterdir() if f.is_file())
