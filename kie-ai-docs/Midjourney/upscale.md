# Midjourney - Upscale

> Upscale previously generated Midjourney images to higher resolution.

## API Endpoint

**POST /api/v1/mj/generateUpscale**

### Request

```json
{
  "taskId": "2584469c38e43c173dcae9e60663f645",
  "imageIndex": 0,
  "waterMark": "watermark",
  "callBackUrl": "https://your-domain.com/api/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Original MJ generation task ID |
| imageIndex | integer | Yes | Image index (0-3) |
| waterMark | string | No | Watermark text |
| callBackUrl | string | No | Callback URL |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "mj_upscale_abcdef123456"
  }
}
```

## Callback Format

### Success

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "mj_task_12345",
    "resultUrls": [
      "https://example.com/mj_result1.png"
    ]
  }
}
```

### Failure

```json
{
  "code": 500,
  "msg": "Image generation failed",
  "data": {
    "taskId": "mj_task_12345",
    "resultUrls": []
  }
}
```

## Important Notes

* POST callback with JSON, 15s timeout
* Retry 3 times (1min, 5min, 15min)
* Download images promptly
