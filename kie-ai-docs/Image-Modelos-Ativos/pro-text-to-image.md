# Flux-2 - Pro Text to Image

> High-quality photorealistic image generation powered by Flux-2's advanced AI model

## Overview

Generate high-quality images using Flux-2 Pro text-to-image model.

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
  "model": "flux-2/pro-text-to-image",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Hyperrealistic supermarket blister pack on clean olive green surface...",
    "aspect_ratio": "1:1",
    "resolution": "1K"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `flux-2/pro-text-to-image` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes | A text description of the image (Max 5000 characters) |
| input.aspect_ratio | string | Yes | Aspect ratio (1:1, 4:3, 3:4, 16:9, 9:16, 3:2, 2:3, auto) |
| input.resolution | string | Yes | Output resolution (1K, 2K) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_flux-2_1765175072483"
  }
}
```

## Query Task Status

After submitting a task, use the unified query endpoint to check progress and retrieve results:

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes, rather than polling the status endpoint.
