# Topaz - Video Upscale

> Enhance video resolution and quality using advanced AI upscaling powered by Topaz

## Overview

Upscale videos to higher resolution using Topaz's AI-powered video enhancement.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "topaz/video-upscale",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "video_url": "https://example.com/video.mp4",
    "upscale_factor": "2"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `topaz/video-upscale` |
| callBackUrl | string | No | Callback URL |
| input.video_url | string | Yes | Video URL to upscale |
| input.upscale_factor | string | Yes | Upscale factor (1, 2, 4) |

### Video Requirements

* **Formats**: MP4, QuickTime, MKV
* **Max size**: 10MB
* **Note**: Longer videos may take more time to process

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_topaz_1765185786549"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter.
