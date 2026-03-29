# Base64 File Upload

> Upload temporary files via Base64 encoded data. Note: Uploaded files are temporary and automatically deleted after 3 days.

### Features

* Supports Base64 encoded data and data URL format
* Automatic MIME type recognition and file extension inference
* Support for custom file names or auto-generation (overwrites existing files with same name, may have caching delays)
* Returns complete file information and download links
* API Key authentication protection
* Uploaded files are temporary and automatically deleted after 3 days

### Supported Formats

* **Pure Base64 String**: `iVBORw0KGgoAAAANSUhEUgAA...`
* **Data URL Format**: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...`

### Usage Recommendations

* Recommended for small files like images
* For large files (>10MB), use the file stream upload API
* Base64 encoding increases data transmission by approximately 33%

## API Endpoint

**POST /api/file-base64-upload**

### Request

**Headers:**

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Body:**

```json
{
  "base64Data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "uploadPath": "images/base64",
  "fileName": "test-image.png"
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| base64Data | string | Yes | Base64 encoded file data. Supports pure Base64 strings or data URL format |
| uploadPath | string | Yes | File upload path, without leading or trailing slashes |
| fileName | string | No | File name (optional), including file extension |

### Response

```json
{
  "success": true,
  "code": 200,
  "msg": "File uploaded successfully",
  "data": {
    "fileName": "uploaded-image.png",
    "filePath": "images/user-uploads/uploaded-image.png",
    "downloadUrl": "https://tempfile.redpandaai.co/xxx/images/user-uploads/uploaded-image.png",
    "fileSize": 154832,
    "mimeType": "image/png",
    "uploadedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Request has been processed successfully |
| 400 | Bad Request - Request parameters are incorrect or missing required parameters |
| 401 | Unauthorized - Authentication credentials are missing or invalid |
| 405 | Method Not Allowed - Request method is not supported |
| 500 | Server Error - An unexpected error occurred while processing the request |

## Example with JavaScript

```javascript
const response = await fetch('https://kieai.redpandaai.co/api/file-base64-upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    base64Data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    uploadPath: 'images',
    fileName: 'base64-image.png'
  })
});

const result = await response.json();
console.log('Upload successful:', result);
```

## Example with Python

```python
import requests
import base64

# Read file and convert to base64
with open('/path/to/your-file.jpg', 'rb') as f:
    file_data = base64.b64encode(f.read()).decode('utf-8')
    base64_data = f'data:image/jpeg;base64,{file_data}'

url = "https://kieai.redpandaai.co/api/file-base64-upload"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "base64Data": base64_data,
    "uploadPath": "images",
    "fileName": "base64-image.jpg"
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()

print(f"Upload successful: {result}")
```
