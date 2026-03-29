# Music Generation Callbacks

> System will call this callback when audio generation is complete.

## Callback Mechanism Overview

The callback mechanism eliminates the need to poll the API for task status. The system will proactively push task completion results to your server.

### Callback Timing

The system will send callback notifications in the following situations:

* Music generation task completed successfully
* Music generation task failed
* Errors occurred during task processing

### Callback Method

* **HTTP Method**: POST
* **Content Type**: application/json
* **Timeout**: 15 seconds

## Callback Request Format

### Success Callback

```json
{
  "code": 200,
  "msg": "All generated successfully.",
  "data": {
    "callbackType": "complete",
    "task_id": "2fac****9f72",
    "data": [
      {
        "id": "e231****-****-****-****-****8cadc7dc",
        "audio_url": "https://example.cn/****.mp3",
        "stream_audio_url": "https://example.cn/****",
        "image_url": "https://example.cn/****.jpeg",
        "prompt": "[Verse] Night city lights shining bright",
        "model_name": "chirp-v3-5",
        "title": "Iron Man",
        "tags": "electrifying, rock",
        "createTime": "2025-01-01 00:00:00",
        "duration": 198.44
      }
    ]
  }
}
```

### Failure Callback

```json
{
  "code": 501,
  "msg": "Audio generation failed",
  "data": {
    "callbackType": "error",
    "task_id": "2fac****9f72",
    "data": null
  }
}
```

## Callback Types

| Type | Description |
|------|-------------|
| text | Text generation complete |
| first | First track complete |
| complete | All tracks complete |
| error | Generation failed |

## Status Code Description

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Validation Error - Lyrics contained copyrighted material |
| 408 | Rate Limited - Timeout |
| 413 | Conflict - Uploaded audio matches existing work |
| 500 | Server Error |
| 501 | Audio generation failed |
| 531 | Generation failed, credits refunded |

## Response Data Fields

| Field | Description |
|-------|-------------|
| id | Audio unique identifier |
| audio_url | Audio file URL |
| stream_audio_url | Streaming audio URL |
| image_url | Cover image URL |
| prompt | Generation prompt/lyrics |
| model_name | Model name used |
| title | Music title |
| tags | Music tags |
| duration | Audio duration (seconds) |

## Best Practices

1. **Use HTTPS**: Ensure callback URL uses HTTPS
2. **Verify Source**: Verify request legitimacy
3. **Idempotent Processing**: Same task_id may receive multiple callbacks
4. **Quick Response**: Return 200 quickly
5. **Asynchronous Processing**: Process complex logic asynchronously

## Important Reminders

* Callback URL must be publicly accessible
* Server must respond within 15 seconds
* After 3 consecutive retries fail, system stops sending callbacks

## Alternative Solution

Poll the Get Music Details endpoint every 30 seconds.
