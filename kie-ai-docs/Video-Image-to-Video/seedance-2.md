# Seedance 2.0 — Video Generation

> Generate high-quality videos with Seedance 2 using frames, multi-image references, or video references

## Overview

Generate dynamic videos with the Seedance 2 model by ByteDance. Supports three input workflows:

1. **First Frame** — Animate from a single starting image
2. **First & Last Frames** — Control start and end of video with two images
3. **Multimodal Reference** — Use reference images, videos, and audio for guidance

## File Requirements

### Images (first_frame_url, last_frame_url, reference_image_urls)
- **Accepted formats:** JPEG, PNG, WebP, BMP, TIFF, GIF
- **Max file size:** 30MB per image
- **Max images per request:** 9 (for reference_image_urls)
- **Aspect ratio:** 0.4 to 2.5
- **Dimensions:** 300-6000 pixels

### Videos (reference_video_urls)
- **Accepted formats:** MP4, MOV
- **Max file size:** 50MB per video
- **Max videos per request:** 3
- **Total video duration:** ≤ 15 seconds combined
- **Frame rate:** 24-60 FPS

### Audio (reference_audio_urls)
- **Accepted formats:** WAV, MP3
- **Max file size:** 15MB per audio
- **Max audios per request:** 3
- **Total audio duration:** ≤ 15 seconds combined

## API Endpoint

**POST https://api.kie.ai/api/v1/jobs/createTask**

### Request

**Headers:**

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Body:**

```json
{
  "model": "bytedance/seedance-2",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "A serene beach at sunset with waves gently crashing on the shore.",
    "first_frame_url": "https://example.com/first.png",
    "last_frame_url": "https://example.com/last.png",
    "reference_image_urls": [
      "https://example.com/ref1.png",
      "https://example.com/ref2.png"
    ],
    "reference_video_urls": [
      "https://example.com/motion_ref.mp4"
    ],
    "reference_audio_urls": [
      "https://example.com/audio.mp3"
    ],
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

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `bytedance/seedance-2` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | No | Text prompt/description (min 3, max 2500 chars) |
| input.first_frame_url | string | No | First frame image URL (for Image-to-Video) |
| input.last_frame_url | string | No | Last frame image URL (for First & Last Frames) |
| input.reference_image_urls | array | No | Reference image URLs (max 9; JPEG, PNG, WebP, BMP, TIFF, GIF; max 30MB each) |
| input.reference_video_urls | array | No | Reference video URLs (max 3; MP4, MOV; max 50MB each; total ≤ 15s) |
| input.reference_audio_urls | array | No | Reference audio URLs (max 3; WAV, MP3; max 15MB each; total ≤ 15s) |
| input.generate_audio | boolean | No | Generate AI audio synced with video (default: `true`) |
| input.return_last_frame | boolean | No | Return last frame as image (default: `false`) |
| input.resolution | string | No | Output resolution: `480p`, `720p` (default: `720p`) |
| input.aspect_ratio | string | No | Aspect ratio: `1:1`, `4:3`, `3:4`, `16:9`, `9:16`, `21:9`, `adaptive` (default: `16:9`) |
| input.duration | number | No | Video duration in seconds: 4–15 (default: `8`) |
| input.web_search | boolean | **Yes** | Use online search (REQUIRED) |
| input.nsfw_checker | boolean | No | Enable content filtering (default: `false`) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_bytedance_1765186743319"
  }
}
```

## Query Task Status

After submitting a task, use the unified query endpoint to check progress and retrieve results:

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes, rather than polling the status endpoint.

## Pricing

| Resolution | With Video Input | Without Video Input |
|------------|-----------------|---------------------|
| 480p | 11.5 credits/s ($0.0575/s) | 19 credits/s ($0.095/s) |
| 720p | 25 credits/s ($0.125/s) | 41 credits/s ($0.205/s) |

**Cost formula (with video input):** `(input video duration + output duration) × rate`

**Cost formula (without video input):** `output duration × rate`

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthorized – invalid or missing API Key |
| 402 | Insufficient Credits |
| 404 | Not Found |
| 422 | Validation Error – request parameters failed validation |
| 429 | Rate Limited |
| 455 | Service Unavailable – maintenance |
| 500 | Server Error |
| 501 | Generation Failed |
| 505 | Feature Disabled |