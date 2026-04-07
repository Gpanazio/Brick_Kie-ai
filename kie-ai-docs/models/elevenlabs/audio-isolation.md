# elevenlabs/audio-isolation

> Audio isolation/voice separation using ElevenLabs

## Overview

Isolate voice from audio files using ElevenLabs audio isolation model.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "elevenlabs/audio-isolation",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "audio_url": "https://example.com/audio.mp3"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `elevenlabs/audio-isolation` |
| callBackUrl | string | No | Callback URL |
| input.audio_url | string | Yes | Audio file URL (MP3, WAV, AAC, MP4, OGG. Max 10MB) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_elevenlabs_1765185282276",
    "recordId": "elevenlabs_1765185282276"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**
