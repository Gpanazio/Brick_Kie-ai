# Get Veo3.1 Video Details

> Query the execution status and results of Veo3.1 video generation tasks.

## Overview

Query the status and results of all Veo 3.1 video tasks including regular generation, extension, 1080P upgrade, and 4K upgrade.

## API Endpoint

**GET /api/v1/veo/record-info**

### Request

```
GET /api/v1/veo/record-info?taskId=veo_task_abcdef123456
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Task ID |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "veo_task_abcdef123456",
    "paramJson": "{\"prompt\":\"A futuristic city...\"}",
    "completeTime": "2025-06-06 10:30:00",
    "response": {
      "resultUrls": ["http://example.com/video1.mp4"],
      "originUrls": ["http://example.com/original_video1.mp4"],
      "resolution": "1080p"
    },
    "successFlag": 1,
    "createTime": "2025-06-06 10:25:00"
  }
}
```

## Status Descriptions

| successFlag | Description |
|------------|-------------|
| 0 | Generating — task is being processed |
| 1 | Success — task completed successfully |
| 2 | Failed — task failed before completion |
| 3 | Generation Failed — upstream generation failed |

## Supported Task Types

* **Regular Video Generation** - Text-to-video, image-to-video
* **Video Extension** - Extended videos
* **1080P Upgrade** - HD upgrade tasks
* **4K Upgrade** - Ultra-HD upgrade tasks

## Task Type Identification

### Regular Generation
* `fallbackFlag`: true = backup model used (720p), false = primary model

### 4K Tasks
* No `fallbackFlag` field
* Response includes `mediaIds`

## Important Notes

* This endpoint is the final authority for task status
* Fallback videos cannot be upgraded to 1080P
* Records supported within 14 days

## Alternative

Use callback mechanism for production environments.
