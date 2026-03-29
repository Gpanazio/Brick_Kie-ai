# Upload And Cover Audio

> Transform an audio track into a new style while retaining its core melody.

## Overview

Cover an audio track by transforming it into a new style while keeping the original melody intact.

## API Endpoint

**POST /api/v1/generate/upload-cover**

### Request

```json
{
  "uploadUrl": "https://storage.example.com/upload",
  "prompt": "A calm and relaxing piano track with soft melodies",
  "style": "Classical",
  "title": "Peaceful Piano Meditation",
  "customMode": true,
  "instrumental": false,
  "model": "V5",
  "callBackUrl": "https://api.example.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| uploadUrl | string | Yes | Audio file URL (max 8 minutes) |
| prompt | string | Yes* | Audio description (*required if instrumental=false) |
| style | string | Yes* | Music style (*required in custom mode) |
| title | string | Yes* | Track title (*required in custom mode) |
| customMode | boolean | Yes | Enable custom mode |
| instrumental | boolean | Yes | Generate without vocals |
| model | string | Yes | AI model (V4, V4_5, V4_5PLUS, V4_5ALL, V5) |
| callBackUrl | string | Yes | Callback URL |
| vocalGender | string | No | Vocal gender (m/f) |
| styleWeight | number | No | Style adherence (0-1) |
| weirdnessConstraint | number | No | Creativity level (0-1) |
| personaId | string | No | Persona style ID |

### Character Limits by Model

| Model | prompt | style | title |
|-------|--------|-------|-------|
| V5 | 5000 | 1000 | 100 |
| V4_5PLUS/V4_5 | 5000 | 1000 | 100 |
| V4_5ALL | 5000 | 1000 | 80 |
| V4 | 3000 | 200 | 80 |

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

* Generated files deleted after 15 days
* Audio max 8 minutes (V4_5ALL: max 1 minute)
* Callback stages: text, first, complete

## Query Task Status

**GET /api/v1/generate/get-details?taskId={taskId}**
