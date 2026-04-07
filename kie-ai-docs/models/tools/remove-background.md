# Recraft - Remove Background

> Remove background from images using Recraft AI

## Overview

Remove background from images using Recraft's AI-powered background removal.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "recraft/remove-background",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "image": "https://example.com/image.jpg"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `recraft/remove-background` |
| callBackUrl | string | No | Callback URL |
| input.image | string | Yes | Image URL (PNG, JPG, WEBP. Max 5MB, max 16MP, max 4096px, min 256px) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_recraft_1765177006198"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter.
