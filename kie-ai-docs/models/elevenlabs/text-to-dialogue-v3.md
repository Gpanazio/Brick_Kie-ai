# elevenlabs/text-to-dialogue-v3

> Dialogue text-to-speech generation using ElevenLabs Dialogue V3 model

## Overview

Generate dialogue speech with multiple voices using ElevenLabs Dialogue V3 model.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "elevenlabs/text-to-dialogue-v3",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "dialogue": [
      { "text": "I have a pen, I have an apple, ah, Apple pen~", "voice": "Adam" },
      { "text": "a happy dog", "voice": "Brian" },
      { "text": "a happy cat", "voice": "Roger" }
    ],
    "stability": 0.5
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `elevenlabs/text-to-dialogue-v3` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.dialogue | array | Yes | Array of dialogue items with text and voice |
| input.dialogue[].text | string | Yes | Dialogue text (total max 5000 chars) |
| input.dialogue[].voice | string | Yes | Voice name or ID |
| input.stability | number | No | Voice stability (0, 0.5, or 1.0) |
| input.language_code | string | No | Language code for speech |

### Available Voices

Adam, Alice, Bill, Brian, Callum, Charlie, Chris, Daniel, Eric, George, Harry, Jessica, Laura, Liam, Lily, Matilda, River, Roger, Sarah, Will, and more.

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_elevenlabs_1765185448724",
    "recordId": "elevenlabs_1765185448724"
  }
}
```

## Query Task Status

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes.
