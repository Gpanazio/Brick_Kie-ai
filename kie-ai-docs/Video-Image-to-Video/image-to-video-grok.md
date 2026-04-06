# Grok Imagine - Image to Video

> Transform images into dynamic videos powered by Grok's advanced AI model

## Overview

Transform static images into dynamic videos using Grok Imagine image-to-video model.
Supports **up to 7 reference images** — reference them in the prompt with `@image1`, `@image2`, etc.

## API Endpoint

**POST** `https://api.kie.ai/api/v1/jobs/createTask`

### Headers

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Request Body

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
| `model` | string | Yes | Must be `grok-imagine/image-to-video` |
| `callBackUrl` | string (URI) | No | URL to receive POST notifications when video generation completes. Recommended for production. See [Webhook Verification Guide](/common-api/webhook-verification) for signature verification. |
| `input.image_urls` | array | No* | External image URLs as reference for video generation. Supports JPEG, PNG, WEBP. Max 10MB per image. **Up to 7 URLs.** Reference in prompt with `@image(n)` (e.g., `@image1 a sunset over the ocean`). Spicy mode not available for external images. |
| `input.task_id` | string | No* | Task ID from a previously generated Grok image (`grok-imagine/text-to-image`). Use with `index` to select a specific image. Do not use with `image_urls`. Supports all modes including Spicy. Max 100 characters. |
| `input.index` | integer | No | When using `task_id`, specify which image to use (Grok generates 6 images per task). 0-based index (0-5). Ignored if `image_urls` is provided. Default: `0`. |
| `input.prompt` | string | No | Text prompt describing the desired video motion. Should be detailed about movement, action sequences, camera work, and timing. Max 5000 characters. Supports English. |
| `input.mode` | string | No | Generation mode: `fun` (creative/playful), `normal` (balanced), `spicy` (dynamic/intense). Spicy not available for external images. Default: `normal`. |
| `input.duration` | string | No | Duration in seconds (6-30, step 1). |
| `input.resolution` | string | No | Resolution: `480p`, `720p`. Default: `480p`. |
| `input.aspect_ratio` | string | No | Aspect ratio: `2:3`, `3:2`, `1:1`, `16:9`, `9:16`. Only applies to multi-image mode. In single-image mode, video dimensions follow the image dimensions. Default: `16:9`. |

*Either `image_urls` or `task_id` is required. Do not use both simultaneously.

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

### Error Codes

| Code | Description |
|------|-------------|
| 200 | Success — Request has been processed successfully |
| 401 | Unauthorized — Authentication credentials are missing or invalid |
| 402 | Insufficient Credits — Account does not have enough credits |
| 404 | Not Found — The requested resource or endpoint does not exist |
| 422 | Validation Error — The request parameters failed validation checks |
| 429 | Rate Limited — Request limit has been exceeded |
| 455 | Service Unavailable — System is currently undergoing maintenance |
| 500 | Server Error — An unexpected error occurred while processing the request |
| 501 | Generation Failed — Content generation task failed |
| 505 | Feature Disabled — The requested feature is currently disabled |

### Important Notes

- Generated videos are processed asynchronously
- Video URLs are valid for 24 hours
- Generation time: 15-30 seconds
- Spicy mode not available for external images
- In multi-image mode, reference images in prompt with `@image1`, `@image2`, etc.
- `aspect_ratio` only applies in multi-image mode; single-image mode uses the image's own dimensions

### Rate Limits

- Maximum 25 concurrent tasks per account
- Maximum 250 task creations per hour

## Pricing

| Resolution | Duration | Credits |
|------------|----------|---------|
| 480p | 6s | 10 credits |
| 480p | 10s | 20 credits |
| 720p | 6s | 20 credits |
| 720p | 10s | 30 credits |

## Query Task Status

**GET** `https://api.kie.ai/api/v1/jobs/recordInfo?taskId={taskId}`

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes, rather than polling the status endpoint.
