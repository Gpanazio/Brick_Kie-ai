# Seedance 2.0 — Video Generation

> Generate high-quality videos with Seedance 2 using frames, multi-image references, or video references

## Overview

Generate dynamic videos with the Seedance 2 model by ByteDance. Supports three input workflows:

1. **Frames** — Set initial and final frames to control video start/end
2. **Multi Reference** — Up to 9 reference images for character/scene consistency
3. **Video Reference** — Up to 3 reference videos (total ≤ 15 seconds)

## File Requirements

### Images (reference_image_urls)
- **Accepted formats:** JPEG, PNG, WebP
- **Max file size:** 10MB per image
- **Max images per request:** 9

### Videos (reference_video_urls)
- **Accepted formats:** MP4, QuickTime (MOV), MKV
- **Max file size:** 10MB per video
- **Max videos per request:** 3
- **Total video duration:** ≤ 15 seconds combined

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
  "model": "bytedance/seedance-2",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Reference @Image1 @Image2 for the character. Generate an action sequence with fluid movement.",
    "reference_image_urls": [
      "https://example.com/ref1.png",
      "https://example.com/ref2.png"
    ],
    "reference_video_urls": [
      "https://example.com/motion_ref.mp4"
    ],
    "generate_audio": true,
    "return_last_frame": false,
    "resolution": "720p",
    "aspect_ratio": "16:9",
    "duration": 15
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `bytedance/seedance-2` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | No | Text prompt/description (max 5000 chars) |
| input.reference_image_urls | array | No | Reference image URLs (max 9; JPEG, PNG, WebP; max 10MB each) |
| input.reference_video_urls | array | No | Reference video URLs (max 3; MP4, MOV, MKV; max 10MB each; total ≤ 15s) |
| input.reference_audio_urls | array | No | Reference audio URLs (MPEG, WAV, AAC, OGG; max 10MB each) |
| input.generate_audio | boolean | No | Generate AI audio synced with video (default: `true`) |
| input.return_last_frame | boolean | No | Return last frame as image (default: `false`) |
| input.resolution | string | No | Output resolution: `480p`, `720p` (default: `720p`) |
| input.aspect_ratio | string | No | Aspect ratio: `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `21:9` (default: `16:9`) |
| input.duration | number | No | Video duration in seconds: 4–15 (default: `15`) |
| input.web_search | boolean | No | Use online search (default: `false`) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "281e5b0*********************f39b9"
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

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid request parameters |
| 401 | Unauthorized – invalid or missing API Key |
| 402 | Insufficient Credits |
| 404 | Not Found |
| 422 | Validation Error – request parameters failed validation |
| 429 | Rate Limited |
| 500 | Server Error |
