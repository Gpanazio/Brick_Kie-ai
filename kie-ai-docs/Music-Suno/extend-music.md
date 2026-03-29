# Extend Music

> Extend or modify existing music by creating a continuation based on a source audio track.

## Overview

Extend existing music tracks with Suno's AI music generation.

## Usage Modes

### Custom Parameters (`defaultParamFlag: true`)
* Requires: `prompt`, `style`, `title`, `continueAt`

### Original Parameters (`defaultParamFlag: false`)
* Only requires: `audioId`
* Uses original audio parameters

## API Endpoint

**POST /api/v1/generate/extend**

### Request

```json
{
  "defaultParamFlag": true,
  "audioId": "e231****-****-****-****-****8cadc7dc",
  "prompt": "Extend the music with more relaxing notes",
  "style": "Classical",
  "title": "Peaceful Piano Extended",
  "continueAt": 60,
  "model": "V5",
  "callBackUrl": "https://api.example.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| defaultParamFlag | boolean | Yes | Use custom or original params |
| audioId | string | Yes | Source audio ID to extend |
| prompt | string | Yes (custom) | Extension description |
| style | string | Yes (custom) | Music style |
| title | string | Yes (custom) | Track title |
| continueAt | number | Yes (custom) | Start time in seconds |
| model | string | Yes | AI model (V4, V4_5, V4_5PLUS, V4_5ALL, V5) |
| callBackUrl | string | Yes | Callback URL |
| vocalGender | string | No | Vocal gender (m/f) |
| styleWeight | number | No | Style adherence (0-1) |
| weirdnessConstraint | number | No | Creativity level (0-1) |
| personaId | string | No | Persona style ID |

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

> **Note:** Generated files are retained for 14 days.
