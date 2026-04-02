# Grok Imagine - Image to Video

> Transform images into dynamic videos powered by Grok's advanced AI model

## Overview

Transform static images into dynamic videos using Grok Imagine image-to-video model.
Supports **up to 7 reference images** — reference them in the prompt with `@image1`, `@image2`, etc.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "grok-imagine/image-to-video",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "image_urls": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "prompt": "@image1 a sunset over the ocean, @image2 appears as a reflection in the water",
    "mode": "normal",
    "duration": "6",
    "resolution": "480p",
    "aspect_ratio": "16:9"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `grok-imagine/image-to-video` |
| callBackUrl | string | No | Callback URL |
| input.image_urls | array | No* | External image URLs (JPEG, PNG, WEBP. Max 10MB each). **Up to 7 images.** Reference in prompt with `@image(n)` (e.g. `@image1`). |
| input.task_id | string | No* | Previous Grok image task ID (do not use with image_urls) |
| input.index | integer | No | Image index (0-5) when using task_id |
| input.prompt | string | No | Text prompt describing desired motion (Max 5000 characters) |
| input.mode | string | No | Mode: `fun`, `normal`, `spicy`. Spicy not available for external images |
| input.duration | string | No | Duration in seconds (6-30, step 1) |
| input.resolution | string | No | Resolution: `480p`, `720p` |
| input.aspect_ratio | string | No | Aspect ratio: `2:3`, `3:2`, `1:1`, `16:9`, `9:16`. Only applies to multi-image mode. In single-image mode, video dimensions follow the image. |

*Either image_urls or task_id is required

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_grok_video_12345678"
  }
}
```

### Important Notes

* Generated videos are processed asynchronously
* Video URLs are valid for 24 hours
* Generation time: 15-30 seconds
* Spicy mode not available for external images
* In multi-image mode, reference images in prompt with `@image1`, `@image2`, etc.
* `aspect_ratio` only applies in multi-image mode; single-image mode uses the image's own dimensions

### Rate Limits

* Maximum 25 concurrent tasks per account
* Maximum 250 task creations per hour

## Pricing

| Resolution | Duration | Credits |
|------------|----------|---------|
| 480p | 6s | 10 credits |
| 480p | 10s | 20 credits |
| 720p | 6s | 20 credits |
| 720p | 10s | 30 credits |

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**
