# Get Music Task Details

> Retrieve detailed information about a music generation task.

## Overview

Check status and access results of music generation tasks.

## API Endpoint

**GET /api/v1/generate/record-info**

### Request

```
GET /api/v1/generate/record-info?taskId=5c79****be8e
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Music generation task ID |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "5c79****be8e",
    "param": "{\"prompt\":\"A calm piano track\",\"style\":\"Classical\"}",
    "response": {
      "sunoData": [
        {
          "id": "e231****-****-****-****-****8cadc7dc",
          "audioUrl": "https://example.cn/****.mp3",
          "streamAudioUrl": "https://example.cn/****",
          "imageUrl": "https://example.cn/****.jpeg",
          "title": "Peaceful Piano",
          "duration": 198.44
        }
      ]
    },
    "status": "SUCCESS",
    "operationType": "generate"
  }
}
```

## Status Descriptions

| Status | Description |
|--------|-------------|
| PENDING | Task is waiting to be processed |
| TEXT_SUCCESS | Lyrics/text generation completed |
| FIRST_SUCCESS | First track generation completed |
| SUCCESS | All tracks generated successfully |
| CREATE_TASK_FAILED | Failed to create task |
| GENERATE_AUDIO_FAILED | Failed to generate audio |
| CALLBACK_EXCEPTION | Callback error |
| SENSITIVE_WORD_ERROR | Content filtered |

## Operation Types

* `generate` - Generate Music
* `extend` - Extend Music
* `upload_cover` - Upload And Cover Audio
* `upload_extend` - Upload And Extend Audio

## Important Notes

* Max query rate: 3 requests per second per task
* For instrumental tracks, no lyrics data included
