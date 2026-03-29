# Get 4K Video Callbacks

> When 4K video generation completes, the system calls this callback to notify results

## Callback Configuration

Configure callback URL when requesting 4K video:

```json
{
  "taskId": "veo_task_abcdef123456",
  "callBackUrl": "https://your-domain.com/api/4k-callback"
}
```

## Callback Format

### Success Callback

```json
{
  "code": 200,
  "msg": "4K Video generated successfully.",
  "data": {
    "taskId": "veo_task_example123",
    "info": {
      "resultUrls": ["https://file.aiquickdraw.com/v/example_task_1234567890.mp4"],
      "imageUrls": ["https://file.aiquickdraw.com/v/example_task_1234567890.jpg"]
    }
  }
}
```

### Failure Callback

```json
{
  "code": 500,
  "msg": "The 4K version of this video is unavailable. Please try a different video.",
  "data": {
    "taskId": "veo_task_abcdef123456"
  }
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| code | integer | 200 = success, 500 = failure |
| msg | string | Status message |
| data.info.resultUrls | array | Generated 4K video URLs |
| data.info.imageUrls | array | Thumbnail/preview URLs |

## Error Handling

* **500**: 4K version unavailable - try a different video

## Best Practices

1. **Timely Download**: Download 4K videos promptly as URLs may expire
2. **Idempotent Processing**: Same task may receive multiple callbacks
3. **Error Retry**: If 4K unavailable, try different video
4. **Storage Planning**: 4K files are large

## Alternative

Poll Get Video Details endpoint every 30 seconds.
