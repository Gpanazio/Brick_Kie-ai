# Kling 3.0

> Generate high-quality videos with advanced multi-shot capabilities and element references using Kling 3.0 AI model

## Overview

Kling 3.0 is an advanced video generation model that supports both single-shot and multi-shot video creation with element references. It offers two generation modes (standard and pro) with different resolution options, and supports sound effects for enhanced video output.

## Key Features

* **Dual Generation Modes**: Choose between `std` (standard resolution) and `pro` (higher resolution) modes
* **Multi-Shot Support**: Create videos with multiple shots, each with its own prompt and duration
* **Element References**: Reference images or videos in your prompts using `@element_name` syntax
* **Sound Effects**: Optional sound effects to enhance video output
* **Flexible Aspect Ratios**: Support for 16:9, 9:16, and 1:1 aspect ratios
* **Configurable Duration**: Video duration from 3 to 15 seconds

## Single-Shot vs Multi-Shot Mode

### Single-Shot Mode (`multi_shots: false`)
* Uses the main `prompt` field for video generation
* Supports first and last frame images via `image_urls`
* Sound effects are optional

### Multi-Shot Mode (`multi_shots: true`)
* Uses `multi_prompt` array to define multiple shots
* Each shot has its own prompt and duration (1-12 seconds)
* Only supports first frame image (via `image_urls[0]`)
* Sound effects default to enabled

## Aspect Ratio Auto-Adaptation

When you provide `image_urls` (first or last frame images), the `aspect_ratio` parameter becomes optional. The system will automatically adapt the aspect ratio based on the uploaded images.

## Element References

You can reference images or videos in your prompts using the `@element_name` syntax. Define elements in the `kling_elements` array:

* **Image Elements**: 2-4 image URLs (JPG/PNG, at least 300*300px, max 10MB each)
* **Video Elements**: 1 video URL (MP4/MOV, max 50MB)

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "kling-3.0/video",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "In a bright rehearsal room, sunlight streams through the window @element_dog",
    "image_urls": ["https://example.com/image.jpg"],
    "sound": true,
    "duration": "5",
    "aspect_ratio": "16:9",
    "mode": "pro",
    "multi_shots": false,
    "multi_prompt": [],
    "kling_elements": []
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `kling-3.0/video` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes (single-shot) | Video generation prompt |
| input.image_urls | array | No | First/last frame image URLs |
| input.sound | boolean | Yes | Enable sound effects |
| input.duration | string | Yes | Video duration (3-15 seconds) |
| input.aspect_ratio | string | No | Aspect ratio (16:9, 9:16, 1:1) |
| input.mode | string | Yes | Generation mode (std, pro) |
| input.multi_shots | boolean | Yes | Enable multi-shot mode |
| input.multi_prompt | array | Yes (multi-shot) | Array of shot prompts with duration |
| input.kling_elements | array | No | Element references |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_kling-3.0_1765187774173"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes.
