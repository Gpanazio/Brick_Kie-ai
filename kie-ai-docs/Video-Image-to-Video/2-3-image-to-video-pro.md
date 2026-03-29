# Hailuo - Image to Video Pro

> Transform images into dynamic videos powered by Hailuo's advanced AI model

## Overview

Transform static images into dynamic videos using Hailuo 2.3 Image-to-Video Pro model.

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
  "model": "hailuo/2-3-image-to-video-pro",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "A graceful geisha performs a traditional Japanese dance indoors...",
    "image_url": "https://example.com/image.jpg",
    "duration": "6",
    "resolution": "768P"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `hailuo/2-3-image-to-video-pro` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes | Text prompt describing desired video animation (Max 5000 characters) |
| input.image_url | string | Yes | Input image to animate |
| input.duration | string | No | Video duration (6, 10 seconds) |
| input.resolution | string | No | Resolution (768P, 1080P). Note: 10s not supported for 1080P |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_hailuo_1765182976860"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes.
