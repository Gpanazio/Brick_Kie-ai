# Common API Quickstart

> Essential utility APIs for account management and file operations

## Welcome to Common API

The Common API provides essential utility services for managing your kie.ai account and handling generated content. These APIs help you monitor credit usage and access generated files efficiently.

## Authentication

All API requests require authentication using Bearer tokens. Please obtain your API key from the [API Key Management Page](https://kie.ai/api-key).

> **Warning:** Please keep your API key secure and never share it publicly. If you suspect your key has been compromised, reset it immediately.

### API Base URL

```
https://api.kie.ai
```

### Authentication Header

```http
Authorization: Bearer YOUR_API_KEY
```

## Quick Start Guide

### Step 1: Check Your Credit Balance

Monitor your account credits to ensure sufficient balance for continued service:

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

**Response:**

```json
{
  "code": 200,
  "msg": "success",
  "data": 100
}
```

### Step 2: Get Download URL for Generated Files

Convert generated file URLs to temporary downloadable links:

**cURL:**

```bash
curl -X POST "https://api.kie.ai/api/v1/common/download-url" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://tempfile.1f6cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxbd98"
  }'
```

**JavaScript:**

```javascript
const response = await fetch('https://api.kie.ai/api/v1/common/download-url', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://tempfile.1f6cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxbd98'
  })
});

const result = await response.json();
console.log('Download URL:', result.data);
```

**Python:**

```python
import requests

url = "https://api.kie.ai/api/v1/common/download-url"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "url": "https://tempfile.1f6cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxbd98"
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()

print(f"Download URL: {result['data']}")
```

**Response:**

```json
{
  "code": 200,
  "msg": "success",
  "data": "https://tempfile.1f6cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxbd98"
}
```

> **Warning:** Download URLs are valid for **20 minutes only**. Make sure to download or cache the content within this timeframe.

## API Overview

### Get Account Credits

**GET /api/v1/chat/credit**

**Purpose**: Monitor your account credit balance

**Features**:
* Real-time credit balance retrieval
* No parameters required
* Instant response
* Essential for usage monitoring

**Use Cases**:
* Check credits before starting generation tasks
* Monitor credit consumption patterns
* Plan credit replenishment
* Implement credit threshold alerts

### Get Download URL

**POST /api/v1/common/download-url**

**Purpose**: Generate temporary download links for generated files

**Features**:
* Supports all kie.ai generated file types (images, videos, audio, etc.)
* 20-minute validity period
* Secure authenticated access
* Only works with kie.ai generated URLs

**Use Cases**:
* Download generated content to local storage
* Share temporary links with team members
* Integrate with external systems
* Build custom download workflows

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Request has been processed successfully |
| 401 | Unauthorized - Authentication credentials are missing or invalid |
| 402 | Insufficient Credits - Account does not have enough credits to perform the operation |
| 404 | Not Found - The requested resource or endpoint does not exist |
| 422 | Validation Error - Invalid request parameters |
| 429 | Rate Limited - Request limit has been exceeded for this resource |
| 455 | Service Unavailable - System is currently undergoing maintenance |
| 500 | Server Error - An unexpected error occurred while processing the request |
| 505 | Feature Disabled - The requested feature is currently disabled |

## Next Steps

<CardGroup cols={2}>
  <Card title="Get Account Credits" icon="wallet" href="/common-api/get-account-credits">
    Learn how to check and monitor your credit balance
  </Card>

  <Card title="Get Download URL" icon="download" href="/common-api/download-url">
    Master file download URL generation
  </Card>
</CardGroup>

## Support

Need help? Our technical support team is here to assist you.

* **Email**: [support@kie.ai](mailto:support@kie.ai)
* **Documentation**: [docs.kie.ai](https://docs.kie.ai)

***

Ready to start? [Get your API key](https://kie.ai/api-key) and begin using Common API services immediately!
