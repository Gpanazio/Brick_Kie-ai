# Get Remaining Credits

Retrieve the current balance of credits available in your account.

### Usage Guide

* Use this endpoint to check your current credit balance
* Monitor usage to ensure sufficient credits for continued service
* Plan credit replenishment based on your usage patterns

### Developer Notes

* Credit balance is required for all generation services
* Service access will be restricted when credits are depleted
* Credits are consumed based on the specific service and usage volume

## API Endpoint

**GET /api/v1/chat/credit**

### Request

**Headers:**

```http
Authorization: Bearer YOUR_API_KEY
```

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": 100
}
```

### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| code | integer | Response status code |
| msg | string | Error message when code != 200 |
| data | integer | Remaining credit quantity |

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Request has been processed successfully |
| 401 | Unauthorized - Authentication credentials are missing or invalid |
| 402 | Insufficient Credits - Account does not have enough credits to perform the operation |
| 404 | Not Found - The requested resource or endpoint does not exist |
| 422 | Validation Error - The request parameters failed validation checks |
| 429 | Rate Limited - Request limit has been exceeded for this resource |
| 455 | Service Unavailable - System is currently undergoing maintenance |
| 500 | Server Error - An unexpected error occurred while processing the request |
| 505 | Feature Disabled - The requested feature is currently disabled |

## Example

**cURL:**

```bash
curl -X GET "https://api.kie.ai/api/v1/chat/credit" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**JavaScript:**

```javascript
const response = await fetch('https://api.kie.ai/api/v1/chat/credit', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const result = await response.json();
console.log('Current credits:', result.data);
```

**Python:**

```python
import requests

url = "https://api.kie.ai/api/v1/chat/credit"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}

response = requests.get(url, headers=headers)
result = response.json()

print(f"Current credits: {result['data']}")
```
