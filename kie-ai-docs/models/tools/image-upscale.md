# Topaz - Image Upscale

> Enhance image resolution and quality using advanced AI upscaling powered by Topaz

## Overview

Upscale images to higher resolution using Topaz's AI-powered image enhancement.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "topaz/image-upscale",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "image_url": "https://example.com/image.jpg",
    "upscale_factor": "2"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `topaz/image-upscale` |
| callBackUrl | string | No | Callback URL |
| input.image_url | string | Yes | Image URL to upscale |
| input.upscale_factor | string | Yes | Upscale factor (1, 2, 4, 8) |

### Image Requirements

* **Formats**: JPEG, PNG, WEBP
* **Max size**: 10MB
* **Max resolution**: Longest side × upscale_factor ≤ 20,000 pixels

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_topaz_1765176093786"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter.
