# Veo3.1 Video Generation Callbacks

> The system will call this callback to notify results when video generation is completed

## Callback Mechanism Overview

The callback mechanism avoids the need for you to poll the API for task status, as the system will actively push task completion results to your server.

### Callback Method

* **HTTP Method**: POST
* **Content Type**: application/json
* **Timeout**: 15 seconds

## Callback Request Format

### Success Callback

```json
{
  "code": 200,
  "msg": "Veo3.1 video generated successfully.",
  "data": {
    "taskId": "veo_task_abcdef123456",
    "info": {
      "resultUrls": ["http://example.com/video1.mp4"],
      "originUrls": ["http://example.com/original_video1.mp4"],
      "resolution": "1080p"
    },
    "fallbackFlag": false
  }
}
```

### Failure Callback

```json
{
  "code": 400,
  "msg": "Your prompt was flagged by Website as violating content policies.",
  "data": {
    "taskId": "veo_task_abcdef123456"
  }
}
```

### Fallback Success Callback

```json
{
  "code": 200,
  "msg": "Veo3.1 video generated successfully (using fallback model).",
  "data": {
    "taskId": "veo_task_abcdef123456",
    "info": {
      "resultUrls": ["http://example.com/video1.mp4"],
      "resolution": "1080p"
    },
    "fallbackFlag": true
  }
}
```

## Status Code Description

| Code | Description |
|------|-------------|
| 200 | Success - Video generation task successfully |
| 400 | Client error - Prompt violates content policies |
| 422 | Fallback failed |
| 500 | Internal error |
| 501 | Failed - Video generation task failed |

## Response Data Fields

| Field | Description |
|-------|-------------|
| taskId | Task ID |
| info.resultUrls | Generated video URLs |
| info.originUrls | Original video URLs (only when aspect_ratio != 16:9) |
| info.resolution | Video resolution |
| fallbackFlag | Whether using fallback model |

## Fallback Functionality

The fallback functionality is an intelligent backup generation mechanism:

### Enabling Conditions
1. `enableFallback` parameter is set to `true`
2. Aspect ratio is `16:9`
3. Specific errors occur (content policy violations, etc.)

### Limitations
* Fallback videos are 1080p only
* Cannot access via Get 1080P Video endpoint

## Best Practices

1. **Use HTTPS**: Ensure callback URL uses HTTPS
2. **Verify Source**: Verify request legitimacy
3. **Idempotent Processing**: Same taskId may receive multiple callbacks
4. **Quick Response**: Return 200 quickly
5. **Timely Download**: Download videos promptly

## Important Reminders

* Prompts are processed in English — use `enableTranslation: true` in the generate request to auto-translate other languages
* Callback URL must be publicly accessible
* Server must respond within 15 seconds

## Alternative Solution

Poll the Get Veo3.1 Video Details endpoint every 30 seconds.
