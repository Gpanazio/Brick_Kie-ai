# Generate Lyrics

> Generate creative lyrics content based on a text prompt.

## Overview

Generate lyrics for music composition using Suno's AI lyrics generation.

## API Endpoint

**POST /api/v1/lyrics**

### Request

```json
{
  "prompt": "A nostalgic song about childhood memories and growing up in a small town",
  "callBackUrl": "https://api.example.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | Yes | Theme/description for lyrics (max 200 words) |
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

### Callback Response

Returns 2-3 lyric variations with:
* `title` - Lyrics title
* `text` - Structured lyrics with [Verse], [Chorus], etc.
* `status` - Generation status

### Example

```json
{
  "code": 200,
  "data": {
    "callbackType": "complete",
    "data": [
      {
        "text": "[Verse]\nMoonlight fills the window\nStars dancing in the sky...",
        "title": "Starlight Dreams",
        "status": "complete"
      }
    ]
  }
}
```

> **Note:** Generated lyrics are retained for 14 days.
