# Get Task Details

> Query the status and results of any task created in the Market models

## Overview

Use this endpoint to query the status and results of any task created through Market model APIs. This is a unified query interface that works with all models under the Market category.

> **Info:** This endpoint works with all Market models including Seedream, Grok Imagine, Kling, Claude, and any future models added to the Market.

## API Endpoint

```
GET https://api.kie.ai/api/v1/jobs/recordInfo
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | The unique task identifier returned when you created the task. |

## Request Example

**cURL:**

```bash
curl -X GET "https://api.kie.ai/api/v1/jobs/recordInfo?taskId=task_12345678" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Node.js:**

```javascript
const response = await fetch('https://api.kie.ai/api/v1/jobs/recordInfo?taskId=task_12345678', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const result = await response.json();
console.log('Task Status:', result.data.state);
console.log('Result:', result.data.resultJson);
```

**Python:**

```python
import requests

response = requests.get(
    'https://api.kie.ai/api/v1/jobs/recordInfo',
    params={'taskId': 'task_12345678'},
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

result = response.json()
print('Task Status:', result['data']['state'])
print('Result:', result['data']['resultJson'])
```

## Response Format

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_12345678",
    "model": "grok-imagine/text-to-image",
    "state": "success",
    "param": "{\"model\":\"grok-imagine/text-to-image\",\"callBackUrl\":\"https://your-domain.com/api/callback\",\"input\":{\"prompt\":\"Cinematic portrait...\",\"aspect_ratio\":\"3:2\"}}",
    "resultJson": "{\"resultUrls\":[\"https://example.com/generated-content.jpg\"]}",
    "failCode": "",
    "failMsg": "",
    "completeTime": 1698765432000,
    "createTime": 1698765400000,
    "updateTime": 1698765432000
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| code | integer | Response status code. `200` indicates success. |
| message | string | Response message. Typically `"success"` for successful queries. |
| data.taskId | string | The unique identifier for this task. |
| data.model | string | The model used for this task (e.g., `grok-imagine/text-to-image`, `seedream-4.0`, `kling-1.0`). |
| data.state | string | Current state of the task. See Task States below. |
| data.param | string | JSON string containing the original request parameters. |
| data.resultJson | string | JSON string containing the generated content URLs. Only present when `state` is `success`. |
| data.failCode | string | Error code if the task failed. Empty if successful. |
| data.failMsg | string | Error message if the task failed. Empty if successful. |
| data.completeTime | integer | Unix timestamp (in milliseconds) when the task completed. |
| data.createTime | integer | Unix timestamp (in milliseconds) when the task was created. |
| data.updateTime | integer | Unix timestamp (in milliseconds) when the task was last updated. |
| data.progress | integer | Generation progress (0-100). Only returned when model is `sora2` or `sora2 pro`. |

## Task States

| State | Description | Action |
|-------|-------------|--------|
| `waiting` | Task is queued and waiting to be processed | Continue polling |
| `queuing` | Task is in the processing queue | Continue polling |
| `generating` | Task is currently being processed | Continue polling |
| `success` | Task completed successfully | Parse `resultJson` to get results |
| `fail` | Task failed | Check `failCode` and `failMsg` for details |

## Polling Best Practices

### Recommended Polling Intervals
* **Initial polls (first 30 seconds)**: Every 2-3 seconds
* **After 30 seconds**: Every 5-10 seconds
* **After 2 minutes**: Every 15-30 seconds
* **Maximum polling duration**: Stop after 10-15 minutes and investigate

> **Tip:** Use exponential backoff to reduce server load and API costs.

### Using Callbacks Instead of Polling

For production applications, we strongly recommend using the `callBackUrl` parameter when creating tasks:

* **No polling needed**: Your server receives notifications automatically
* **Lower API costs**: Eliminates continuous polling requests
* **Better performance**: Immediate notifications when tasks complete
* **Reduced latency**: No delay between completion and notification

### Handling Completed Tasks

When `state` is `success`:

1. Parse the `resultJson` string to JSON
2. Extract the `resultUrls` array
3. Download generated content immediately
4. Store content in your own storage

> **Important**: Generated content URLs typically expire after 24 hours.

## Error Handling

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_12345678",
    "model": "grok-imagine/text-to-image",
    "state": "fail",
    "param": "{\"model\":\"grok-imagine/text-to-image\",\"input\":{\"prompt\":\"...\"}}",
    "resultJson": "",
    "failCode": "422",
    "failMsg": "Invalid prompt: prompt contains prohibited content",
    "completeTime": 1698765432000,
    "createTime": 1698765400000,
    "updateTime": 1698765432000
  }
}
```

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `401` | Unauthorized - Invalid or missing API key | Check your API key |
| `404` | Task not found | Verify the taskId is correct |
| `422` | Validation error in original request | Check the `failMsg` for details |
| `500` | Internal server error | Retry after a few minutes |
| `501` | Generation failed | Check `failMsg` for specific error details |

## Example: Complete Polling Flow

```javascript
async function pollTaskStatus(taskId, maxAttempts = 60, interval = 5000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`,
      {
        headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
      }
    );
    
    const result = await response.json();
    const { state, resultJson, failMsg } = result.data;
    
    console.log(`Attempt ${attempt + 1}: State = ${state}`);
    
    if (state === 'success') {
      const results = JSON.parse(resultJson);
      console.log('Task completed!');
      console.log('Results:', results.resultUrls);
      return results;
    }
    
    if (state === 'fail') {
      console.error('Task failed:', failMsg);
      throw new Error(failMsg);
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Task timed out after maximum attempts');
}
```

## Rate Limits

* **Maximum query rate**: 10 requests per second per API key
* **Recommended interval**: 2-5 seconds between polls

> **Warning:** Excessive polling may result in rate limiting. Use callbacks for production applications.
