# Get 1080P Video

> Get the high-definition 1080P version of a Veo3.1 video generation task.

## Overview

Get the 1080P HD version of a previously generated Veo3.1 video.

## API Endpoint

**GET /api/v1/veo/get-1080p-video**

### Request

```
GET /api/v1/veo/get-1080p-video?taskId=veo_task_abcdef123456&index=0
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Original video task ID |
| index | integer | No | Video index (default: 0) |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "resultUrl": "https://tempfile.aiquickdraw.com/p/xxx.mp4"
  }
}
```

### Important Notes

* 1080P generation takes ~1-3 minutes
* If not ready, returns non-200 code - retry after 20-30s
* Ensure original generation task is successful first

## Pricing

1080P generation requires extra credits. See pricing details.
