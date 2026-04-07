# Grok Imagine - Text to Video

> High-quality video generation from text descriptions powered by Grok's advanced AI model

## Overview

Generate high-quality videos from text using Grok Imagine text-to-video model.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "grok-imagine/text-to-video",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "A couple of doors open to the right one by one randomly and stay open...",
    "aspect_ratio": "2:3",
    "mode": "normal",
    "duration": "6",
    "resolution": "480p"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `grok-imagine/text-to-video` |
| callBackUrl | string | No | Callback URL |
| input.prompt | string | Yes | Text prompt (Max 5000 characters) |
| input.aspect_ratio | string | No | Aspect ratio (2:3, 3:2, 1:1, 16:9, 9:16). Default: 2:3 |
| input.mode | string | No | Mode (fun, normal, spicy) |
| input.duration | string | No | Duration (6, 10 seconds) |
| input.resolution | string | No | Resolution (480p, 720p) |

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
* Generation time: 10-25 seconds

### Rate Limits

* Maximum 30 concurrent tasks per account
* Maximum 300 task creations per hour

## Pricing

| Resolution | Duration | Credits |
|------------|----------|---------|
| 480p | 6s | 10 credits |
| 480p | 10s | 20 credits |
| 720p | 6s | 20 credits |
| 720p | 10s | 30 credits |

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**
