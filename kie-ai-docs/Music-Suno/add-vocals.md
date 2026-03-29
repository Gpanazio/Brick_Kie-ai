# Add Vocals

> Layer AI-generated vocals on top of an existing instrumental track.

## Overview

Add vocals to an existing instrumental audio file. Generate vocal output harmonized with the provided track.

## API Endpoint

**POST /api/v1/generate/add-vocals**

### Request

```json
{
  "uploadUrl": "https://example.com/music.mp3",
  "prompt": "A calm and relaxing piano track",
  "title": "Relaxing Piano",
  "negativeTags": "heavy metal, strong drum beats",
  "style": "Jazz",
  "vocalGender": "m",
  "model": "V5",
  "callBackUrl": "https://example.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| uploadUrl | string | Yes | Instrumental audio URL |
| prompt | string | Yes | Lyric content and style |
| title | string | Yes | Track title |
| negativeTags | string | Yes | Styles to exclude |
| style | string | Yes | Music style |
| vocalGender | string | No | Vocal gender (m/f) |
| styleWeight | number | No | Style adherence (0-1) |
| weirdnessConstraint | number | No | Creativity level (0-1) |
| audioWeight | number | No | Audio weight (0-1) |
| model | string | No | AI model (V4_5PLUS, V5) |
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
