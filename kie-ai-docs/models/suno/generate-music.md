# Generate Music

> Generate music with or without lyrics using AI models.

## Overview

Generate music with or without lyrics using Suno's AI music generation models.

## Usage Modes

### Custom Mode (`customMode: true`)
* If `instrumental: true`: `style` and `title` are required
* If `instrumental: false`: `style`, `prompt`, and `title` are required

### Non-custom Mode (`customMode: false`)
* Only `prompt` is required
* Simpler usage for beginners

## API Endpoint

**POST /api/v1/generate**

### Request

```json
{
  "prompt": "A calm and relaxing piano track with soft melodies",
  "style": "Classical",
  "title": "Peaceful Piano Meditation",
  "customMode": true,
  "instrumental": false,
  "model": "V5_5",
  "callBackUrl": "https://api.example.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | Yes | Music description (500-5000 chars based on model) |
| style | string | Yes (custom) | Music style (Jazz, Classical, Pop, etc.) |
| title | string | Yes (custom) | Track title (max 80 chars) |
| customMode | boolean | Yes | Enable advanced customization |
| instrumental | boolean | Yes | Generate without lyrics |
| model | string | Yes | AI model (V4, V4_5, V4_5PLUS, V4_5ALL, V5, V5_5) |
| callBackUrl | string | Yes | Callback URL |
| negativeTags | string | No | Styles to exclude |
| vocalGender | string | No | Vocal gender (m/f) |
| styleWeight | number | No | Style adherence (0-1) |
| weirdnessConstraint | number | No | Creativity level (0-1) |
| personaId | string | No | Persona style ID |
| personaModel | string | No | Persona type |

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

### Callback Stages

* `text` - Text generation complete
* `first` - First track complete
* `complete` - All tracks complete

> **Note:** Generated files are retained for 14 days.
