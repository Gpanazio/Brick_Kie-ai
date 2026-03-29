# Recraft - Image Upscale (Crisp)

> Enhance image resolution and quality using advanced AI upscaling powered by Recraft

## Overview

Upscale images to higher resolution using Recraft's AI-powered crisp upscaling.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "recraft/crisp-upscale",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "image": "https://example.com/image.jpg"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `recraft/crisp-upscale` |
| callBackUrl | string | No | Callback URL |
| input.image | string | Yes | Image URL (JPEG, PNG, WEBP. Max 10MB) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_recraft_1765177373893"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter.
