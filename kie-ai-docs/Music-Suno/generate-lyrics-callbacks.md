# Lyrics Generation Callbacks

> System will call this callback when lyrics generation is complete.

## Callback Format

### Success Callback

```json
{
  "code": 200,
  "msg": "All generated successfully.",
  "data": {
    "callbackType": "complete",
    "task_id": "3b66882fde0a5d398bd269cab6d9542b",
    "data": [
      {
        "error_message": "",
        "status": "complete",
        "text": "[Verse]\nMoonlight spreads across the windowsill...",
        "title": "Starry Night Dreams"
      }
    ]
  }
}
```

### Failure Callback

```json
{
  "code": 400,
  "msg": "Song Description flagged for moderation",
  "data": {
    "callbackType": "complete",
    "task_id": "3b66882fde0a5d398bd269cab6d9542b",
    "data": null
  }
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Rephrase with different approach |
| 500 | Internal Error |

## Response Fields

| Field | Description |
|-------|-------------|
| data[].text | Lyrics content |
| data[].title | Lyrics title |
| data[].status | complete or failed |
| data[].error_message | Error message on failure |

## Best Practices

1. **Use HTTPS**: Ensure callback URL uses HTTPS
2. **Verify Source**: Verify request legitimacy
3. **Idempotent Processing**: Same task_id may receive multiple callbacks
4. **Quick Response**: Return 200 quickly
5. **Status Checking**: Check status field for each lyrics item

## Important Reminders

* Callback URL must be publicly accessible
* Server must respond within 15 seconds
* After 3 consecutive retries fail, system stops sending callbacks

## Alternative

Poll Get Lyrics Details endpoint every 30 seconds.
