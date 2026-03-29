# Wan - Text to Video Turbo

> High-quality video generation from text descriptions powered by Wan's advanced AI model

## Overview

Generate high-quality videos from text using Wan 2.2 A14B Text-to-Video Turbo model.

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
  "model": "wan/2-2-a14b-text-to-video-turbo",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Drone shot, fast traversal, starting inside a cracked, frosty circular pipe...",
    "resolution": "720p",
    "aspect_ratio": "16:9",
    "enable_prompt_expansion": false,
    "seed": 0,
    "acceleration": "none"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `wan/2-2-a14b-text-to-video-turbo` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes | Text prompt (Max 5000 characters) |
| input.resolution | string | No | Resolution (480p, 720p). Default: 720p |
| input.aspect_ratio | string | No | Aspect ratio (16:9, 9:16). Default: 16:9 |
| input.enable_prompt_expansion | boolean | No | Enable prompt expansion using LLM |
| input.seed | number | No | Random seed for reproducibility (Min: 0, Max: 2147483647) |
| input.acceleration | string | No | Acceleration level (none, regular) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_wan_1765172502514"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes.
