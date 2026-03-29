"""
Tests for kie-ai/server.py — helpers, validation, and API endpoint smoke tests.
Uses unittest.mock to avoid real HTTP calls to kie.ai.
"""

import json
import os
import sys
from pathlib import Path
from unittest import mock

import pytest

# Ensure kie-ai directory is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# We need to mock db (PostgreSQL) and kie_api before importing server
with mock.patch.dict(os.environ, {"KIE_API_KEY": "test-key-000", "DATABASE_URL": "postgresql://test:test@localhost/test"}):
    # Mock db module so it doesn't try to connect to PostgreSQL
    mock_db = mock.MagicMock()
    mock_db.upsert_entry = mock.MagicMock()
    mock_db.load_history = mock.MagicMock(return_value=[])
    mock_db.count_history = mock.MagicMock(return_value=0)
    mock_db.delete_entry = mock.MagicMock()
    mock_db.clear_history = mock.MagicMock()
    mock_db.entry_exists = mock.MagicMock(return_value=False)
    mock_db.update_local_urls = mock.MagicMock()
    mock_db.entries_needing_backfill = mock.MagicMock(return_value=[])
    sys.modules["db"] = mock_db

    # Mock storage module
    mock_storage = mock.MagicMock()
    mock_storage.get_local_path = mock.MagicMock(return_value=None)
    mock_storage.download_media = mock.MagicMock()
    sys.modules["storage"] = mock_storage

    import server
    import kie_api


# ==================== Helper Tests ====================


class TestSafeUnlink:
    def test_removes_existing_file(self, tmp_path):
        f = tmp_path / "test.txt"
        f.write_text("hello")
        server._safe_unlink(str(f))
        assert not f.exists()

    def test_no_error_on_missing_file(self):
        server._safe_unlink("/tmp/nonexistent_file_abc123.txt")

    def test_no_error_on_directory(self, tmp_path):
        # Should log warning but not raise
        server._safe_unlink(str(tmp_path))


class TestSanitizeError:
    def test_strips_file_paths(self):
        err = Exception("/home/user/tmp/upload_abc.png: No such file")
        assert "Internal server error" == server._sanitize_error(err)

    def test_strips_auth_details(self):
        err = Exception("Authorization header invalid: Bearer sk-abc123")
        assert "Authentication error" == server._sanitize_error(err)

    def test_truncates_long_messages(self):
        err = Exception("x" * 300)
        result = server._sanitize_error(err)
        assert len(result) <= 203  # 200 + "..."

    def test_passes_normal_messages(self):
        err = Exception("Something went wrong")
        assert "Something went wrong" == server._sanitize_error(err)


class TestEnsureCallbackUrl:
    def test_injects_callback_when_missing(self):
        with mock.patch.object(server, "CALLBACK_URL", "https://example.com/callback"):
            payload = {"prompt": "test"}
            result = server._ensure_callback_url(payload)
            assert result["callBackUrl"] == "https://example.com/callback"

    def test_does_not_override_existing(self):
        with mock.patch.object(server, "CALLBACK_URL", "https://example.com/callback"):
            payload = {"callBackUrl": "https://custom.com/cb"}
            result = server._ensure_callback_url(payload)
            assert result["callBackUrl"] == "https://custom.com/cb"

    def test_no_injection_when_empty(self):
        with mock.patch.object(server, "CALLBACK_URL", ""):
            payload = {"prompt": "test"}
            result = server._ensure_callback_url(payload)
            assert "callBackUrl" not in result


class TestValidateApiResponse:
    def test_passes_valid_response(self):
        resp = {"code": 200, "data": {"taskId": "abc"}}
        assert server._validate_api_response(resp) == resp

    def test_raises_on_error_code(self):
        resp = {"code": 401, "msg": "Unauthorized"}
        with pytest.raises(server.HTTPException) as exc:
            server._validate_api_response(resp)
        assert exc.value.status_code == 401

    def test_maps_invalid_codes_to_502(self):
        resp = {"code": 999, "msg": "Unknown"}
        with pytest.raises(server.HTTPException) as exc:
            server._validate_api_response(resp)
        assert exc.value.status_code == 502

    def test_passes_non_dict(self):
        assert server._validate_api_response([1, 2, 3]) == [1, 2, 3]

    def test_passes_no_code(self):
        resp = {"data": {"taskId": "abc"}}
        assert server._validate_api_response(resp) == resp


class TestValidateHistoryEntry:
    def test_valid_entry(self):
        entry = {"id": "task123", "model": "test/model", "cat": "image"}
        result = server._validate_history_entry(entry)
        assert result["id"] == "task123"

    def test_rejects_non_dict(self):
        with pytest.raises(server.HTTPException) as exc:
            server._validate_history_entry("not a dict")
        assert exc.value.status_code == 400

    def test_rejects_missing_id(self):
        with pytest.raises(server.HTTPException) as exc:
            server._validate_history_entry({"model": "test"})
        assert exc.value.status_code == 400

    def test_rejects_non_string_id(self):
        with pytest.raises(server.HTTPException) as exc:
            server._validate_history_entry({"id": 123})
        assert exc.value.status_code == 400

    def test_rejects_invalid_model_type(self):
        with pytest.raises(server.HTTPException) as exc:
            server._validate_history_entry({"id": "abc", "model": 123})
        assert exc.value.status_code == 400

    def test_rejects_invalid_urls_type(self):
        with pytest.raises(server.HTTPException) as exc:
            server._validate_history_entry({"id": "abc", "urls": "not-a-list"})
        assert exc.value.status_code == 400


# ==================== History Helpers ====================


class TestExtractResultUrls:
    def test_extracts_simple_url(self):
        data = {"resultUrl": "https://example.com/file.png"}
        urls = server._extract_result_urls(data)
        assert "https://example.com/file.png" in urls

    def test_extracts_array_urls(self):
        data = {"resultUrls": ["https://a.com/1.png", "https://b.com/2.png"]}
        urls = server._extract_result_urls(data)
        assert len(urls) == 2

    def test_parses_resultJson_string(self):
        data = {"resultJson": json.dumps({"resultUrl": "https://r.com/img.png"})}
        urls = server._extract_result_urls(data)
        assert "https://r.com/img.png" in urls

    def test_handles_invalid_resultJson(self):
        data = {"resultJson": "not-json"}
        urls = server._extract_result_urls(data)
        assert urls == []

    def test_handles_non_dict(self):
        assert server._extract_result_urls("not a dict") == []

    def test_deduplicates(self):
        data = {"resultUrl": "https://a.com/1.png", "output": "https://a.com/1.png"}
        urls = server._extract_result_urls(data)
        assert len(urls) == 1


class TestExtractCallbackUrls:
    def test_extracts_simple_url(self):
        data = {"resultUrl": "https://example.com/file.png"}
        urls = server._extract_callback_urls(data)
        assert "https://example.com/file.png" in urls

    def test_extracts_from_resultJson_string(self):
        data = {"resultJson": json.dumps({"resultUrls": ["https://r.com/1.mp4", "https://r.com/2.mp4"]})}
        urls = server._extract_callback_urls(data)
        assert len(urls) == 2

    def test_handles_non_dict(self):
        assert server._extract_callback_urls("not a dict") == []

    def test_deduplicates_preserving_order(self):
        data = {"resultUrl": "https://a.com/1.png", "output": "https://a.com/1.png", "videoUrl": "https://b.com/2.mp4"}
        urls = server._extract_callback_urls(data)
        assert urls == ["https://a.com/1.png", "https://b.com/2.mp4"]


class TestInferCat:
    def test_suno(self):
        assert server._infer_cat("suno/generate-music") == "music"

    def test_video(self):
        assert server._infer_cat("kling/video-gen") == "video"

    def test_image_default(self):
        assert server._infer_cat("flux/something") == "image"

    def test_tools(self):
        assert server._infer_cat("recraft/remove-background") == "tools"

    def test_elevenlabs_audio(self):
        assert server._infer_cat("elevenlabs/text-to-speech") == "audio"

    def test_topaz_tools(self):
        assert server._infer_cat("topaz/video-upscale") == "tools"

    def test_veo_video(self):
        assert server._infer_cat("veo3_fast") == "video"

    def test_hailuo_video(self):
        assert server._infer_cat("hailuo/text-to-video") == "video"


# ==================== FastAPI Endpoint Tests ====================


@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    return TestClient(server.app)


class TestEndpointHistory:
    def test_get_history_empty(self, client):
        mock_db.load_history.return_value = []
        mock_db.count_history.return_value = 0
        resp = client.get("/api/history")
        assert resp.status_code == 200
        data = resp.json()
        assert data["history"] == []
        assert data["total"] == 0

    def test_save_history_entry(self, client):
        mock_db.upsert_entry.reset_mock()
        mock_db.count_history.return_value = 1
        entry = {"id": "task-123", "model": "test/model", "cat": "image", "urls": []}
        resp = client.post("/api/history", data={"entry_json": json.dumps(entry)})
        assert resp.status_code == 200
        assert resp.json()["success"] is True
        mock_db.upsert_entry.assert_called_once()

    def test_save_and_get_history(self, client):
        entry = {"id": "task-456", "model": "test/model", "cat": "image", "urls": [], "state": "success"}
        # Save
        mock_db.count_history.return_value = 1
        resp = client.post("/api/history", data={"entry_json": json.dumps(entry)})
        assert resp.status_code == 200

        # Get — mock returns the saved entry
        mock_db.load_history.return_value = [entry]
        mock_db.count_history.return_value = 1
        resp = client.get("/api/history")
        assert resp.status_code == 200
        assert len(resp.json()["history"]) == 1
        assert resp.json()["history"][0]["id"] == "task-456"

    def test_get_history_with_category_filter(self, client):
        mock_db.load_history.return_value = [{"id": "t1", "cat": "video"}]
        mock_db.count_history.return_value = 1
        resp = client.get("/api/history?cat=video")
        assert resp.status_code == 200
        mock_db.load_history.assert_called_with(cat="video", limit=100)

    def test_save_rejects_invalid_json(self, client):
        resp = client.post("/api/history", data={"entry_json": "not-json"})
        assert resp.status_code == 400

    def test_save_rejects_missing_id(self, client):
        resp = client.post("/api/history", data={"entry_json": json.dumps({"model": "test"})})
        assert resp.status_code == 400

    def test_delete_history_entry(self, client):
        mock_db.delete_entry.reset_mock()
        mock_db.count_history.return_value = 0
        resp = client.delete("/api/history/t1")
        assert resp.status_code == 200
        assert resp.json()["success"] is True
        mock_db.delete_entry.assert_called_once_with("t1")

    def test_clear_history(self, client):
        mock_db.clear_history.reset_mock()
        resp = client.delete("/api/history")
        assert resp.status_code == 200
        assert resp.json()["success"] is True
        mock_db.clear_history.assert_called_once()

    def test_clear_history_with_category(self, client):
        mock_db.clear_history.reset_mock()
        resp = client.delete("/api/history?cat=image")
        assert resp.status_code == 200
        mock_db.clear_history.assert_called_once_with(cat="image")


class TestEndpointCredits:
    def test_credits_returns_data(self, client):
        with mock.patch.object(kie_api, "credits", return_value={"credits": 100}):
            resp = client.get("/api/credits")
            assert resp.status_code == 200
            assert resp.json()["credits"] == 100

    def test_credits_no_api_key(self, client):
        with mock.patch.object(kie_api, "credits", side_effect=ValueError("no key")):
            resp = client.get("/api/credits")
            assert resp.status_code == 503


class TestEndpointConfig:
    def test_config_returns_api_key(self, client):
        resp = client.get("/api/config")
        assert resp.status_code == 200
        assert "apiKey" in resp.json()




class TestEndpointStatic:
    def test_index_returns_html(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert "text/html" in resp.headers["content-type"]

    def test_favicon_returns_204(self, client):
        resp = client.get("/favicon.ico")
        assert resp.status_code == 204

    def test_static_404_for_missing_file(self, client):
        resp = client.get("/static/nonexistent.js")
        assert resp.status_code == 404
