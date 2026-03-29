# Grok Imagine - Image to Video

> Transform images into dynamic videos powered by Grok's advanced AI model

## Overview

Transform static images into dynamic videos using Grok Imagine image-to-video model.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "grok-imagine/image-to-video",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "image_urls": ["https://example.com/image.jpg"],
    "prompt": "POV hand comes into frame handing the girl a cup of coffee...",
    "mode": "normal",
    "duration": "6",
    "resolution": "480p"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `grok-imagine/image-to-video` |
| callBackUrl | string | No | Callback URL |
| input.image_urls | array | No* | External image URL (JPEG, PNG, WEBP. Max 10MB) |
| input.task_id | string | No* | Previous Grok image task ID |
| input.index | integer | No | Image index (0-5) when using task_id |
| input.prompt | string | No | Text prompt describing desired motion |
| input.mode | string | No | Mode (fun, normal, spicy). Spicy not available for external images |
| input.duration | string | No | Duration (6, 10 seconds) |
| input.resolution | string | No | Resolution (480p, 720p) |

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
