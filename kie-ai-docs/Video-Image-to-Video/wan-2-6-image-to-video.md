# Wan 2.6 - Image to Video

> Transform static images into dynamic videos powered by Wan's advanced AI model

## Overview

Generate dynamic videos from static images using the Wan 2.6 Image to Video model. Upload an image first, then use the returned URL as input.

## File Requirements

- **Accepted formats:** JPEG, PNG, WebP
- **Max file size:** 10MB
- **Min resolution:** 256×256px
- **Max images per request:** 1

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
  "model": "wan/2-6-image-to-video",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Anthropomorphic fox singing a Christmas song at the rubbish dump in the rain.",
    "image_urls": [
      "https://static.aiquickdraw.com/tools/example/1765957673717_awiBAidD.webp"
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
| model | string | Yes | Must be `wan/2-6-image-to-video` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes | Text prompt (Min: 2, Max: 5000 characters; Chinese and English supported) |
| input.image_urls | array | Yes | URLs of input images (max 1; JPEG, PNG, WebP; max 10MB; min 256×256px) |
| input.duration | string | No | Video duration in seconds: `5`, `10`, `15` (default: `5`) |
| input.resolution | string | No | Video resolution: `720p`, `1080p` (default: `1080p`) |
| input.nsfw_checker | boolean | No | Enable/disable NSFW filter (default: `true`) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_wan_1765967723871"
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
