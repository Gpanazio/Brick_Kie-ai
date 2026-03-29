# Google - Nano Banana Pro

> Image generation using Google's Pro Image to Image

Generate images using Google's Nano model

## Overview Banana Pro model.

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
  "model": "nano-banana-pro",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Comic poster: cool banana hero in shades leaps from sci-fi pad...",
    "image_input": [],
    "aspect_ratio": "1:1",
    "resolution": "1K",
    "output_format": "png"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `nano-banana-pro` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes | A text description of the image (Max 10000 characters) |
| input.image_input | array | No | Input images to transform (up to 8 images) |
| input.aspect_ratio | string | No | Aspect ratio (1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9, auto) |
| input.resolution | string | No | Resolution (1K, 2K, 4K) |
| input.output_format | string | No | Output format (png, jpg) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_nano-banana-pro_1765178625768"
  }
}
```

## Query Task Status

After submitting a task, use the unified query endpoint to check progress and retrieve results:

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes, rather than polling the status endpoint.
