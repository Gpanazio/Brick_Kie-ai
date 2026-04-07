# Qwen - Text to Image

> High-quality photorealistic image generation powered by Qwen's advanced AI model

## Overview

Generate high-quality images using Qwen text-to-image model.

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
  "model": "qwen/text-to-image",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Your prompt here",
    "image_size": "square_hd",
    "num_inference_steps": 30,
    "guidance_scale": 2.5,
    "enable_safety_checker": true,
    "output_format": "png",
    "negative_prompt": "",
    "acceleration": "none"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `qwen/text-to-image` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes | The prompt to generate the image (Max 5000 characters) |
| input.image_size | string | No | Size (square, square_hd, portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9) |
| input.num_inference_steps | number | No | Inference steps (Min: 2, Max: 250) |
| input.seed | integer | No | Seed for reproducible results |
| input.guidance_scale | number | No | CFG scale (Min: 0, Max: 20) |
| input.enable_safety_checker | boolean | No | Enable safety checker |
| input.output_format | string | No | Output format (png, jpeg) |
| input.negative_prompt | string | No | Negative prompt (Max 500 characters) |
| input.acceleration | string | No | Acceleration (none, regular, high) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_qwen_1765178144357"
  }
}
```

## Query Task Status

After submitting a task, use the unified query endpoint to check progress and retrieve results:

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes, rather than polling the status endpoint.
