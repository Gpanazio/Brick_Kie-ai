# Midjourney - Vary

> Enhance image clarity and simulate styles based on previously generated Midjourney images.

## API Endpoint

**POST /api/v1/mj/generateVary**

### Request

```json
{
  "taskId": "96a5****67tr",
  "imageIndex": 1,
  "waterMark": "my_watermark",
  "callBackUrl": "https://example.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Original MJ generation task ID |
| imageIndex | integer | Yes | Image index (1-4) |
| waterMark | string | No | Watermark text |
| callBackUrl | string | No | Callback URL |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "2182668588ae82da0bc553c07c48ca38"
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
      "https://example.com/mj_result1.png",
      "https://example.com/mj_result2.png",
      "https://example.com/mj_result3.png",
      "https://example.com/mj_result4.png"
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
