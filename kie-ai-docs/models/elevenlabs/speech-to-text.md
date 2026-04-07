# elevenlabs/speech-to-text

> Speech-to-text transcription using ElevenLabs

## Overview

Transcribe audio to text using ElevenLabs speech-to-text model.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "elevenlabs/speech-to-text",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "audio_url": "https://example.com/audio.mp3",
    "language_code": "",
    "tag_audio_events": true,
    "diarize": true
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `elevenlabs/speech-to-text` |
| callBackUrl | string | No | Callback URL |
| input.audio_url | string | Yes | Audio file URL (MP3, WAV, AAC, MP4, OGG. Max 200MB) |
| input.language_code | string | No | Language code (ISO 639-1) |
| input.tag_audio_events | boolean | No | Tag audio events (laughter, applause, etc.) |
| input.diarize | boolean | No | Annotate who is speaking |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_elevenlabs_1765185413162"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**
