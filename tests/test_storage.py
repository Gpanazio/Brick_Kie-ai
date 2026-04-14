import importlib.util
import sys
from pathlib import Path
from unittest import mock

import requests


_STORAGE_PATH = Path(__file__).resolve().parent.parent / "storage.py"
_SPEC = importlib.util.spec_from_file_location("storage_under_test", _STORAGE_PATH)
assert _SPEC is not None
storage = importlib.util.module_from_spec(_SPEC)
sys.modules["storage_under_test"] = storage
assert _SPEC.loader is not None
_SPEC.loader.exec_module(storage)
del _SPEC
del _STORAGE_PATH


class _Response:
    def __init__(self, *, content_type="video/mp4", status_code=200, chunks=None):
        self.headers = {"content-type": content_type}
        self.status_code = status_code
        self._chunks = chunks or [b"data"]

    def raise_for_status(self):
        if self.status_code >= 500:
            raise requests.HTTPError(response=mock.Mock(status_code=self.status_code))

    def iter_content(self, chunk_size=0):
        yield from self._chunks


class TestDownloadOne:
    def test_retries_transient_failures_then_succeeds(self, tmp_path):
        dest = tmp_path / "000.bin"
        responses = [
            requests.ConnectionError("network"),
            requests.Timeout("slow"),
            _Response(),
        ]

        with (
            mock.patch.object(
                storage.requests, "get", side_effect=responses
            ) as get_mock,
            mock.patch.object(storage.time, "sleep") as sleep_mock,
        ):
            assert (
                storage._download_one(
                    "https://cdn.example.com/file", dest, task_id="task-1"
                )
                is True
            )

        assert get_mock.call_count == 3
        assert sleep_mock.call_count == 2
        assert (tmp_path / "000.mp4").exists()

    def test_stops_after_exhausting_retries(self, tmp_path):
        dest = tmp_path / "000.mp4"
        error = requests.HTTPError(response=mock.Mock(status_code=503))

        with (
            mock.patch.object(
                storage.requests, "get", side_effect=[error, error, error]
            ) as get_mock,
            mock.patch.object(storage.time, "sleep") as sleep_mock,
        ):
            assert (
                storage._download_one(
                    "https://cdn.example.com/file", dest, task_id="task-2"
                )
                is False
            )

        assert get_mock.call_count == 3
        assert sleep_mock.call_count == 2
        assert not dest.exists()
