# Sora2 - Pro Image to Video

> Transform images into dynamic videos powered by Sora-2-pro-image-to-video's advanced AI model

## Overview

Transform static images into dynamic videos using Sora 2 Pro Image-to-Video model.

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
  "model": "sora-2-pro-image-to-video",
  "callBackUrl": "https://your-domain.com/api/callback",
  "progressCallBackUrl": "https://your-domain.com/api/v1/jobs/progressCallBackUrl",
  "input": {
    "prompt": "your prompt here",
    "image_urls": ["https://example.com/image.jpg"],
    "aspect_ratio": "landscape",
    "n_frames": "10",
    "size": "standard",
    "remove_watermark": true,
    "upload_method": "s3"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `sora-2-pro-image-to-video` |
| callBackUrl | string | No | URL to receive callback when task completes |
| progressCallBackUrl | string | No | URL to receive progress updates |
| input.prompt | string | Yes | Text prompt describing desired video motion |
| input.image_urls | array | Yes | URL of the image to use as first frame |
| input.aspect_ratio | string | No | Aspect ratio (portrait, landscape) |
| input.n_frames | string | No | Number of frames (10, 15) |
| input.size | string | No | Quality (standard, high) |
| input.remove_watermark | boolean | No | Remove watermark from generated video |
| input.upload_method | string | No | Upload destination (s3, oss) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_sora-2-pro-image-to-video_1765183474472"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes.
