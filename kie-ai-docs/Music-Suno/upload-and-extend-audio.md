# Upload And Extend Audio

> Extend audio tracks while preserving the original style.

## Overview

Extend uploaded audio tracks while maintaining the original style. Creates a longer track that seamlessly continues the input.

## API Endpoint

**POST /api/v1/generate/upload-extend**

### Request

```json
{
  "uploadUrl": "https://storage.example.com/upload",
  "defaultParamFlag": true,
  "instrumental": false,
  "prompt": "Extend the music with more relaxing notes",
  "style": "Classical",
  "title": "Peaceful Piano Extended",
  "continueAt": 60,
  "model": "V4",
  "callBackUrl": "https://api.example.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| uploadUrl | string | Yes | Audio file URL (max 8 minutes) |
| defaultParamFlag | boolean | Yes | Enable custom parameters |
| instrumental | boolean | Yes | Generate without vocals |
| prompt | string | Yes* | Extension description (*required if instrumental=false) |
| style | string | Yes* | Music style (*required in custom mode) |
| title | string | Yes* | Track title (*required in custom mode) |
| continueAt | number | Yes | Start time in seconds |
| model | string | Yes | AI model (V4, V4_5, V4_5PLUS, V4_5ALL, V5) |
| callBackUrl | string | Yes | Callback URL |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "5c79****be8e"
  }
}
```

### Important Notes

* Generated files retained for 14 days
* Audio max 8 minutes (V4_5ALL: max 1 minute)
* continueAt must be greater than 0 and less than audio duration
* Model version must match source music

## Query Task Status

**GET /api/v1/generate/get-details?taskId={taskId}**
