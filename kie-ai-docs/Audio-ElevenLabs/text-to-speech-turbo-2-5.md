# elevenlabs/text-to-speech-turbo-2-5

> High-quality text-to-speech generation using ElevenLabs Turbo 2.5 model

## Overview

Generate high-quality speech from text using ElevenLabs Text-to-Speech Turbo 2.5 model.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "elevenlabs/text-to-speech-turbo-2-5",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "text": "Unlock powerful API with Kie.ai! Affordable, scalable API integration...",
    "voice": "Rachel",
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0,
    "speed": 1,
    "timestamps": false
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `elevenlabs/text-to-speech-turbo-2-5` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.text | string | Yes | Text to convert to speech (Max 5000 characters) |
| input.voice | string | No | Voice name or ID (e.g., Rachel, Adam, etc.) |
| input.stability | number | No | Voice stability (0-1) |
| input.similarity_boost | number | No | Similarity boost (0-1) |
| input.style | number | No | Style exaggeration (0-1) |
| input.speed | number | No | Speech speed (0.7-1.2) |
| input.timestamps | boolean | No | Return word timestamps |
| input.language_code | string | No | Language code (ISO 639-1) |

### Available Voices

Rachel, Aria, Roger, Sarah, Laura, Charlie, George, Callum, River, Liam, Charlotte, Alice, Matilda, Will, Jessica, Eric, Chris, Brian, Daniel, Lily, Bill, and more.

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_elevenlabs_1765185518880",
    "recordId": "elevenlabs_1765185518880"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes.
