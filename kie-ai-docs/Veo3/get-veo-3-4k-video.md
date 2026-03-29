# Get 4K Video

> Get the ultra-high-definition 4K version of a Veo3.1 video generation task.

## Overview

Get the 4K UHD version of a previously generated Veo3.1 video.

## API Endpoint

**POST /api/v1/veo/get-4k-video**

### Request

```json
{
  "taskId": "veo_task_abcdef123456",
  "index": 0,
  "callBackUrl": "http://your-callback-url.com/4k-callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Original video task ID |
| index | integer | No | Video index (default: 0) |
| callBackUrl | string | No | Callback URL |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "veo_task_abcdef123456",
    "resultUrls": ["https://file.aiquickdraw.com/v/xxx.mp4"],
    "imageUrls": ["https://file.aiquickdraw.com/v/xxx.jpg"]
  }
}
```

### Important Notes

* 4K generation takes ~5-10 minutes
* Requires additional credits (~2x Fast mode)
* Supports both 16:9 and 9:16 aspect ratios
* Use callback for production to avoid polling

### Error Responses

**Processing:**
```json
{
  "code": 422,
  "msg": "4k is processing. It should be ready in 5-10 minutes."
}
```

**Already Generated:**
```json
{
  "code": 422,
  "msg": "The video has been generated successfully"
}
```

## Pricing

4K requires extra credits. See pricing details.
