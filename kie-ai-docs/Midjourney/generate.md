# Midjourney - Generate

> Generate images and videos using Midjourney AI models.

## Overview

Create Midjourney image and video generation tasks with various modes.

## API Endpoint

**POST /api/v1/mj/generate**

### Request

```json
{
  "taskType": "mj_txt2img",
  "speed": "relaxed",
  "prompt": "Help me generate a sci-fi themed fighter jet in a beautiful sky",
  "fileUrls": ["https://example.com/image.jpg"],
  "aspectRatio": "16:9",
  "version": "7",
  "variety": 10,
  "stylization": 1,
  "weirdness": 1,
  "waterMark": "",
  "callBackUrl": "https://api.example.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskType | string | Yes | Generation mode: `mj_txt2img`, `mj_img2img`, `mj_video`, `mj_style_reference`, `mj_omni_reference` |
| speed | string | No* | Speed mode: `fast`, `relaxed`, `turbo` (*not for mj_video/omni_reference) |
| prompt | string | Yes | Text prompt (max 2000 chars) |
| fileUrls | array | No* | Input image URLs (*required for img2img/video) |
| aspectRatio | string | No | Output ratio: `1:1`, `16:9`, `9:16`, `2:3`, `3:2`, etc. |
| version | string | No | Model version: `7`, `6.1`, `6`, `5.2`, `5.1`, `niji6`, `niji7` |
| variety | integer | No | Diversity (0-100, step 5) |
| stylization | integer | No | Style intensity (0-1000, multiple of 50) |
| weirdness | integer | No | Creativity (0-3000, multiple of 100) |
| ow | integer | No* | Omni intensity (1-1000, *only for mj_omni_reference) |
| waterMark | string | No | Watermark text |
| callBackUrl | string | No | Callback URL |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "mj_task_abcdef123456"
  }
}
```

## Task Types

* **mj_txt2img** - Text to image
* **mj_img2img** - Image to image
* **mj_video** - Image to video
* **mj_style_reference** - Style reference
* **mj_omni_reference** - Omni reference

## Callback Notifications

### Success Callback

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "mj_task_12345",
    "promptJson": "{\"prompt\":\"a beautiful landscape\"}",
    "resultUrls": [
      "https://example.com/mj_result1.png",
      "https://example.com/mj_result2.png",
      "https://example.com/mj_result3.png",
      "https://example.com/mj_result4.png"
    ]
  }
}
```

### Failure Callback

```json
{
  "code": 500,
  "msg": "Image generation failed",
  "data": {
    "taskId": "mj_task_12345",
    "resultUrls": []
  }
}
```

## Important Notes

* POST callback with JSON, 15s timeout
* Retry 3 times (1min, 5min, 15min)
* Download images promptly - URLs may expire
