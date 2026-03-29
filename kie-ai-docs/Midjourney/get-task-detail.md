# Midjourney - Get Task Details

> Retrieve the status and details of a Midjourney generation task.

## API Endpoint

**GET /api/v1/mj/record-info**

### Request

```
GET /api/v1/mj/record-info?taskId=mj_task_abcdef123456
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | Task ID from generation request |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "4edb3c5XXXXX75e3f0aa5cc",
    "taskType": "mj_txt2img",
    "paramJson": "{\"aspectRatio\":\"16:9\",\"prompt\":\"Help me generate a sci-fi jet...\"}",
    "completeTime": "2024-03-20T10:30:00Z",
    "resultInfoJson": {
      "resultUrls": [
        {"resultUrl": "https://tempfile.aiquickdraw.com/v/xxx_0_0.jpeg"},
        {"resultUrl": "https://tempfile.aiquickdraw.com/v/xxx_0_1.jpeg"},
        {"resultUrl": "https://tempfile.aiquickdraw.com/v/xxx_0_2.jpeg"},
        {"resultUrl": "https://tempfile.aiquickdraw.com/v/xxx_0_3.jpeg"}
      ]
    },
    "successFlag": 1,
    "createTime": "2024-03-20T10:25:00Z",
    "errorCode": null,
    "errorMessage": null
  }
}
```

## Status Flags

| successFlag | Description |
|-------------|-------------|
| 0 | Generating |
| 1 | Success |
| 2 | Failed |
| 3 | Generation Failed |

## Response Fields

| Field | Description |
|-------|-------------|
| taskId | Task ID |
| taskType | Task type |
| paramJson | Request parameters |
| successFlag | Status flag |
| resultInfoJson.resultUrls | Result image URLs |
| createTime | Creation timestamp |
| completeTime | Completion timestamp |
| errorCode | Error code if failed |
| errorMessage | Error message if failed |
