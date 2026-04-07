# elevenlabs/sound-effect-v2

> Sound effect generation using ElevenLabs Sound Effect V2 model

## Overview

Generate sound effects from text descriptions using ElevenLabs Sound Effect V2 model.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "elevenlabs/sound-effect-v2",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "text": "your sound description here",
    "loop": false,
    "prompt_influence": 0.3,
    "output_format": "mp3_44100_128"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `elevenlabs/sound-effect-v2` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.text | string | Yes | Text describing the sound effect (Max 5000 characters) |
| input.loop | boolean | No | Create looping sound effect |
| input.duration_seconds | number | No | Duration (0.5-22 seconds) |
| input.prompt_influence | number | No | How closely to follow prompt (0-1). Default: 0.3 |
| input.output_format | string | No | Output format (mp3, pcm, opus, etc.) |

### Output Formats

| Format | Description |
|--------|-------------|
| mp3_22050_32 | MP3 22kHz 32kbps |
| mp3_44100_32 | MP3 44.1kHz 32kbps |
| mp3_44100_64 | MP3 44.1kHz 64kbps |
| mp3_44100_128 | MP3 44.1kHz 128kbps |
| mp3_44100_192 | MP3 44.1kHz 192kbps |
| pcm_44100 | PCM 44.1kHz |
| opus_48000_128 | Opus 48kHz 128kbps |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_elevenlabs_1765185379603",
    "recordId": "elevenlabs_1765185379603"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes.
