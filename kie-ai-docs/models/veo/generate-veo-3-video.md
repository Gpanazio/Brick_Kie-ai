# Generate Veo 3.1 AI Video

> Create a new video generation task using the Veo3.1 AI model.

## Overview

Our **Veo 3.1 Generation API** is more than a direct wrapper around Google's baseline. It layers extensive optimisation and reliability tooling on top of the official models, giving you greater flexibility and markedly higher success rates — **25% of the official Google pricing**.

| Capability | Details |
|------------|---------|
| **Models** | • **Veo 3.1 Quality** — flagship model, highest fidelity<br/>• **Veo 3.1 Fast** — cost-efficient variant |
| **Tasks** | • **Text → Video**<br/>• **Image → Video** (single or first/last frames)<br/>• **Material → Video** |
| **Generation Modes** | • **TEXT_2_VIDEO** — Text-to-video<br/>• **FIRST_AND_LAST_FRAMES_2_VIDEO** — First and last frames to video<br/>• **REFERENCE_2_VIDEO** — Material-to-video (Fast only) |
| **Aspect Ratios** | 16:9, 9:16, Auto |
| **Output Quality** | 1080P and 4K (4K requires extra credits) |
| **Audio Track** | All videos ship with background audio by default |

### Why our Veo 3.1 API is different

1. **True vertical video** – Native Veo 3.1 supports **9:16** output
2. **Global language reach** – Multilingual prompts supported by default
3. **Significant cost savings** – 25% of Google's direct API pricing

## API Endpoint

**POST /api/v1/veo/generate**

### Request

```json
{
  "prompt": "A dog playing in a park",
  "imageUrls": ["http://example.com/image1.jpg"],
  "model": "veo3_fast",
  "watermark": "MyBrand",
  "callBackUrl": "http://your-callback-url.com/complete",
  "aspect_ratio": "16:9",
  "seeds": 12345,
  "generationType": "TEXT_2_VIDEO",
  "enableTranslation": true
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | Yes | Text prompt describing the desired video |
| imageUrls | array | No | Image URLs for image-to-video (1 or 2 images) |
| model | string | No | Model type (veo3, veo3_fast). Default: veo3_fast |
| generationType | string | No | TEXT_2_VIDEO, FIRST_AND_LAST_FRAMES_2_VIDEO, REFERENCE_2_VIDEO |
| aspect_ratio | string | No | Video aspect ratio (16:9, 9:16, Auto). Default: 16:9 |
| seeds | integer | No | Random seed (10000-99999) |
| callBackUrl | string | No | Callback URL for completion notifications |
| enableTranslation | boolean | No | Enable prompt translation to English. Default: true |
| watermark | string | No | Watermark text to add to video |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "veo_task_abcdef123456"
  }
}
```

## Query Task Status

**GET /api/v1/veo/record-info?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes.
