# Grok Imagine - Text to Image

> High-quality photorealistic image generation powered by Grok's advanced AI model

## Overview

Generate high-quality images using Grok Imagine text-to-image model.

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
  "model": "grok-imagine/text-to-image",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Cinematic portrait of a woman sitting by a vinyl record player...",
    "aspect_ratio": "3:2"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `grok-imagine/text-to-image` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes | Text prompt describing the desired image (Max 5000 characters) |
| input.aspect_ratio | string | No | Aspect ratio (2:3, 3:2, 1:1, 16:9, 9:16). Default: 1:1 |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_grok_12345678"
  }
}
```

### Important Notes

- Generated images are processed asynchronously
- Use the returned taskId to track generation progress
- Callback URL is recommended for production use
- Generated image URLs are valid for 24 hours - download and store images immediately
- Supports multiple aspect ratios for flexible image composition

### Generation Time

- **Standard quality**: 5-10 seconds
- **High complexity prompts**: 10-15 seconds

### Rate Limits

- Maximum 50 concurrent tasks per account
- Maximum 500 task creations per hour

## Query Task Status

After submitting a task, use the unified query endpoint to check progress and retrieve results:

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes, rather than polling the status endpoint.
