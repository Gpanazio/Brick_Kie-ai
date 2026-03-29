# Ideogram - v3-reframe

> Image generation by ideogram/v3-reframe

## Overview

Reframe images using Ideogram v3 model.

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
  "model": "ideogram/v3-reframe",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "image_url": "https://example.com/image.jpg",
    "image_size": "square_hd",
    "rendering_speed": "BALANCED",
    "style": "AUTO",
    "num_images": "1",
    "seed": 0
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `ideogram/v3-reframe` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.image_url | string | Yes | Image URL to reframe |
| input.image_size | string | Yes | Resolution (square, square_hd, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9) |
| input.rendering_speed | string | No | Rendering speed (TURBO, BALANCED, QUALITY) |
| input.style | string | No | Style (AUTO, GENERAL, REALISTIC, DESIGN) |
| input.num_images | string | No | Number of images (1-4) |
| input.seed | number | No | Seed for random number generator |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_ideogram_1765177570132"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes.
