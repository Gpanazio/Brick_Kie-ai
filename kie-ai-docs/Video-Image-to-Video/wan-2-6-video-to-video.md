# Wan 2.6 - Video to Video

> Transform existing videos with new prompts using Wan's advanced AI model

## Overview

Transform existing videos by applying new text prompts. Preserves the original video timing and structure while modifying style, actions, or themes.

## File Requirements

- **Accepted formats:** MP4, QuickTime, Matroska (MKV)
- **Max file size:** 10MB per video
- **Max videos per request:** 3

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

**Headers:**

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Body:**

```json
{
  "model": "wan/2-6-video-to-video",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "The video drinks milk tea while doing some improvised dance moves to the music.",
    "video_urls": [
      "https://static.aiquickdraw.com/tools/example/1765957777782_cNJpvhRx.mp4"
    ],
    "duration": "5",
    "resolution": "1080p",
    "nsfw_checker": false
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `wan/2-6-video-to-video` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes | Text prompt describing desired transformation (Min: 2, Max: 5000 characters) |
| input.video_urls | array | Yes | URLs of input videos (max 3; MP4, QuickTime, MKV; max 10MB each) |
| input.duration | string | No | Output video duration in seconds: `5`, `10` (default: `5`) |
| input.resolution | string | No | Video resolution: `720p`, `1080p` (default: `1080p`) |
| input.nsfw_checker | boolean | No | Enable/disable NSFW filter (default: `true`) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_wan_1765967743009"
  }
}
```

## Query Task Status

After submitting a task, use the unified query endpoint to check progress and retrieve results:

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes, rather than polling the status endpoint.

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthorized – invalid or missing API Key |
| 402 | Insufficient Credits |
| 404 | Not Found |
| 422 | Validation Error – request parameters failed validation |
| 429 | Rate Limited |
| 455 | Service Unavailable – system under maintenance |
| 500 | Server Error |
| 501 | Generation Failed |
| 505 | Feature Disabled |
