# Vocal & Instrument Stem Separation

> Split tracks into vocal, instrumental, and individual instrument stems using AI.

## Overview

Separate music into vocal, instrumental, and individual instrument components using Suno's source-separation AI.

## API Endpoint

**POST /api/v1/vocal-removal/generate**

### Request

```json
{
  "taskId": "5c79****be8e",
  "audioId": "e231****-****-****-****-****8cadc7dc",
  "type": "separate_vocal",
  "callBackUrl": "https://api.example.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Original music generation task ID |
| audioId | string | Yes | Audio track ID to process |
| type | string | Yes | Separation type: `separate_vocal` or `split_stem` |
| callBackUrl | string | Yes | Callback URL |

### Separation Types

* **separate_vocal**: 2-stem split (vocals + instrumental)
* **split_stem**: Up to 12 stems (vocals, drums, bass, guitar, keyboard, strings, brass, woodwinds, percussion, synth, FX, etc.)

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

* Audio URLs retained for 14 days
* Every request is charged - re-calling same track costs credits
* Best results on professionally mixed AI tracks

## Query Task Status

**GET /api/v1/vocal-removal/get-details?taskId={taskId}**
