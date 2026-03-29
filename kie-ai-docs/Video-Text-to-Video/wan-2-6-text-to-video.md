# Wan 2.6 - Text to Video

> High-quality video generation from text descriptions powered by Wan's advanced AI model

## Overview

Generate videos directly from text descriptions. Supports Chinese and English prompts. No input image required.

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
  "model": "wan/2-6-text-to-video",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "In a hyperrealistic ASMR video, a hand uses a knitted knife to slowly slice a burger made entirely of knitted wool...",
    "duration": "5",
    "resolution": "1080p",
    "nsfw_checker": false
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `wan/2-6-text-to-video` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes | Text prompt (Min: 1, Max: 5000 characters; Chinese and English supported) |
| input.duration | string | No | Video duration in seconds: `5`, `10`, `15` (default: `5`) |
| input.resolution | string | No | Video resolution: `720p`, `1080p` (default: `1080p`) |
| input.nsfw_checker | boolean | No | Enable/disable NSFW filter (default: `true`) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_wan_1765967707657"
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
