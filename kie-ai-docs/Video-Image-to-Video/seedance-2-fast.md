# Seedance 2 Fast API Documentation

> Generate content using the Seedance 2 Fast model

## Overview

This document describes how to use the Seedance 2 Fast model for content generation. The process consists of two steps:
1. Create a generation task
2. Query task status and results

## Authentication

All API requests require a Bearer Token in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

Get API Key:
1. Visit [API Key Management Page](https://kie.ai/api-key) to get your API Key
2. Add to request header: `Authorization: Bearer YOUR_API_KEY`

---

## 1. Create Generation Task

### API Information
- **URL**: `POST https://api.kie.ai/api/v1/jobs/createTask`
- **Content-Type**: `application/json`

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `bytedance/seedance-2-fast` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | No | Text prompt (min 3, max 2500 chars) |
| input.first_frame_url | string | No | First frame image URL (for Image-to-Video) |
| input.last_frame_url | string | No | Last frame image URL (for First & Last Frames) |
| input.reference_image_urls | array | No | Reference image URLs (max 9; max 30MB each) |
| input.reference_video_urls | array | No | Reference video URLs (max 3; max 50MB each; total ≤ 15s) |
| input.reference_audio_urls | array | No | Reference audio URLs (max 3; max 15MB each; total ≤ 15s) |
| input.generate_audio | boolean | No | Generate AI audio (default: `true`) |
| input.return_last_frame | boolean | No | Return last frame as image (default: `false`) |
| input.resolution | string | No | Output resolution: `480p`, `720p` (default: `720p`) |
| input.aspect_ratio | string | No | Aspect ratio: `1:1`, `4:3`, `3:4`, `16:9`, `9:16`, `21:9`, `adaptive` (default: `16:9`) |
| input.duration | number | No | Video duration: 4-15 seconds (default: `8`) |
| input.web_search | boolean | **Yes** | Use online search (REQUIRED) |
| input.nsfw_checker | boolean | No | Enable content filtering (default: `false`) |

### Request Example

```json
{
  "model": "bytedance/seedance-2-fast",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "A serene beach at sunset with waves gently crashing on the shore.",
    "first_frame_url": "https://example.com/first.png",
    "last_frame_url": "https://example.com/last.png",
    "reference_image_urls": [
      "https://example.com/ref1.png"
    ],
    "reference_video_urls": [],
    "reference_audio_urls": [],
    "generate_audio": true,
    "return_last_frame": false,
    "resolution": "720p",
    "aspect_ratio": "16:9",
    "duration": 15,
    "web_search": false,
    "nsfw_checker": false
  }
}
```

### Response Example

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_bytedance_1765186743319"
  }
}
```

---

## 2. Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

---

## File Requirements

### Images
- **Formats:** JPEG, PNG, WebP, BMP, TIFF, GIF
- **Max size:** 30MB per image
- **Max images:** 9

### Videos
- **Formats:** MP4, MOV
- **Max size:** 50MB per video
- **Max videos:** 3
- **Total duration:** ≤ 15 seconds
- **Frame rate:** 24-60 FPS

### Audio
- **Formats:** WAV, MP3
- **Max size:** 15MB per audio
- **Max audios:** 3
- **Total duration:** ≤ 15 seconds

---

## Pricing

| Resolution | With Video Input | Without Video Input |
|------------|-----------------|---------------------|
| 480p | 8 credits/s | 15.5 credits/s |
| 720p | 20 credits/s | 33 credits/s |

**Note:** Seedance 2 Fast has lower pricing than Seedance 2 (standard) for faster generation.

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthorized – invalid or missing API Key |
| 402 | Insufficient Credits |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 455 | Service Unavailable |
| 500 | Server Error |
| 501 | Generation Failed |
| 505 | Feature Disabled |