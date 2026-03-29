# Midjourney - Extend Video

> Extend an existing Midjourney-generated video to create a longer sequence.

## API Endpoint

**POST /api/v1/mj/generateVideoExtend**

### Request

```json
{
  "prompt": "Continue the scene with the spacecraft accelerating into a colorful nebula",
  "taskType": "mj_video_extend_manual",
  "taskId": "ee603959-debb-48d1-98c4-a6d1c717eba6",
  "index": 0,
  "waterMark": "my_watermark",
  "callBackUrl": "https://api.example.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | Yes* | Continuation prompt (*required for mj_video_extend_manual) |
| taskType | string | Yes | Extension type: `mj_video_extend_manual`, `mj_video_extend_auto` |
| taskId | string | Yes | Original MJ video task ID |
| index | integer | Yes | Video index to extend (0) |
| waterMark | string | No | Watermark text |
| callBackUrl | string | No | Callback URL |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "40d90dd1c6fddsa0a7dssa2a08366149"
  }
}
```

## Extension Types

* **mj_video_extend_manual** - Manual extension with custom prompt
* **mj_video_extend_auto** - Automatic AI-generated continuation

## Callback Format

### Success

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "a3cacd7dc83719b6524db95b495a5a9c",
    "taskType": "mj_video_extend_manual",
    "resultInfoJson": {
      "resultUrls": [
        {"resultUrl": "https://tempfile.aiquickdraw.com/m/xxx_0_0.mp4"}
      ]
    },
    "successFlag": 1
  }
}
```

### Failure

```json
{
  "code": 500,
  "msg": "Video extension failed",
  "data": {
    "taskId": "a3cacd7dc83719b6524db95b495a5a9c",
    "successFlag": 3,
    "errorCode": "VIDEO_EXTEND_FAILED",
    "errorMessage": "Failed to extend video due to processing error"
  }
}
```

## Important Notes

* Extended videos stored for 14 days
* Maintains same aspect ratio as original
* POST callback with JSON, 15s timeout
* Retry 3 times (1min, 5min, 15min)
* Download videos promptly
