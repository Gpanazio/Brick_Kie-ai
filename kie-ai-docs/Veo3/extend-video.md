# Extend Veo 3.1 AI Video

> Extend an existing Veo3.1 video by generating new content based on the original video and a text prompt.

## Overview

Extend existing Veo3.1 videos by generating new content based on the original video and a text prompt. The extended video seamlessly connects with the original.

## API Endpoint

**POST /api/v1/veo/extend**

### Request

```json
{
  "taskId": "veo_task_abcdef123456",
  "prompt": "The dog continues running through the park, jumping over obstacles",
  "seeds": 12345,
  "watermark": "MyBrand",
  "callBackUrl": "https://your-callback-url.com/veo-extend-callback",
  "model": "fast"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Original video task ID |
| prompt | string | Yes | Text prompt describing extension |
| seeds | integer | No | Random seed (10000-99999) |
| watermark | string | No | Watermark text |
| callBackUrl | string | No | Callback URL |
| model | string | No | Generation mode (fast, quality) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "veo_extend_task_xyz789"
  }
}
```

### Important Notes

* Can only extend videos generated through Veo3.1 API
* Videos generated after 1080P cannot be extended
* Extended content must comply with content policies
* Recommend using English prompts

## Query Task Status

**GET /api/v1/veo/record-info?taskId={taskId}**
