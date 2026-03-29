# Generate 4o Image (GPT Image 1)

> Create a new 4o Image generation task. Generated images are stored for 14 days.

## Overview

Generate high-quality images using OpenAI's GPT-4o Image generation model.

## API Endpoint

**POST /api/v1/gpt4o-image/generate**

### Request

```json
{
  "prompt": "A beautiful sunset over the mountains",
  "filesUrl": ["https://example.com/image.png"],
  "size": "1:1",
  "callBackUrl": "https://your-callback-url.com/callback",
  "isEnhance": false,
  "uploadCn": false,
  "enableFallback": false,
  "fallbackModel": "FLUX_MAX"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | No* | Text prompt describing the image (*required if no filesUrl) |
| filesUrl | array | No* | Up to 5 image URLs as reference (min 1 if no prompt) |
| size | string | Yes | Aspect ratio (1:1, 3:2, 2:3) |
| maskUrl | string | No | Mask image URL for inpainting |
| callBackUrl | string | No | Callback URL for completion |
| isEnhance | boolean | No | Enable prompt enhancement |
| uploadCn | boolean | No | Use China servers |
| enableFallback | boolean | No | Enable fallback to backup model |
| fallbackModel | string | No | Backup model (GPT_IMAGE_1, FLUX_MAX) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task12345"
  }
}
```

### Important Notes

* Generated images expire after 14 days
* Supports up to 5 reference images
* Fallback to Flux model available
* Supports mask-based editing

## Query Task Status

**GET /api/v1/gpt4o-image/record-info?taskId={taskId}**
