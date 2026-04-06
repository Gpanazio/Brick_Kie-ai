# Add Instrumental

> Generate instrumental accompaniment for an uploaded audio file (vocal stem or melody).

## Overview

Generate musical accompaniment for an uploaded audio file. Perfect for singers or melody writers who want instant arrangements around their vocal inputs.

## API Endpoint

**POST /api/v1/generate/add-instrumental**

### Request

```json
{
  "uploadUrl": "https://example.com/music.mp3",
  "title": "Relaxing Piano",
  "negativeTags": "heavy metal, fast drums",
  "tags": "relaxing, piano, soothing",
  "vocalGender": "m",
  "model": "V5_5",
  "callBackUrl": "https://example.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| uploadUrl | string | Yes | Audio file URL |
| title | string | Yes | Track title |
| negativeTags | string | Yes | Styles to exclude |
| tags | string | Yes | Music styles to include |
| vocalGender | string | No | Vocal gender (m/f) |
| styleWeight | number | No | Style adherence (0-1) |
| weirdnessConstraint | number | No | Creativity level (0-1) |
| audioWeight | number | No | Audio weight (0-1) |
| model | string | No | AI model (V4_5PLUS, V5, V5_5) |
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
* Callback stages: text, first, complete

## Query Task Status

**GET /api/v1/generate/get-details?taskId={taskId}**
