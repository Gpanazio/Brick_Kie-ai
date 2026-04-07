# Seedream 5.0 Lite - Text to Image

> High-quality photorealistic image generation powered by Seedream's advanced AI model

## Overview

Generate images from text prompts using the Seedream 5.0 Lite model. Outputs 2K (basic) or 4K (high) images.

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
  "model": "seedream/5-lite-text-to-image",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "A full-process cafe design tool for entrepreneurs and designers...",
    "aspect_ratio": "1:1",
    "quality": "basic",
    "nsfw_checker": false
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `seedream/5-lite-text-to-image` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes | A text description of the image (Min: 3, Max: 3000 characters) |
| input.aspect_ratio | string | Yes | Aspect ratio: `1:1`, `4:3`, `3:4`, `16:9`, `9:16`, `2:3`, `3:2`, `21:9` |
| input.quality | string | Yes | Output quality: `basic` (2K) or `high` (4K) |
| input.nsfw_checker | boolean | No | Enable/disable NSFW content filter (default: `true`) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_seedream_1765166238716"
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
