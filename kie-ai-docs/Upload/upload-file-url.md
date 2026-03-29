# URL File Upload

> Download files from URLs and upload them as temporary files. Note: Uploaded files are temporary and automatically deleted after 3 days.

### Features

* Supports HTTP and HTTPS file links
* Automatically downloads remote files and uploads them
* Automatically extracts file names from URLs or uses custom file names (overwrites existing files with same name, may have caching delays)
* Automatic MIME type recognition
* Returns complete file information and download links
* API Key authentication protection
* Uploaded files are temporary and automatically deleted after 3 days

### Supported Protocols

* **HTTP**: `http://example.com/file.jpg`
* **HTTPS**: `https://example.com/file.jpg`

### Use Cases

* Migrating files from other services
* Batch downloading and storing web resources
* Backing up remote files
* Caching external resources

### Important Notes

* Ensure the provided URL is publicly accessible
* Download timeout is 30 seconds
* Recommended file size limit is 100MB

## API Endpoint

**POST /api/file-url-upload**

### Request

**Headers:**

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Body:**

```json
{
  "fileUrl": "https://example.com/images/sample.jpg",
  "uploadPath": "images/downloaded",
  "fileName": "my-downloaded-image.jpg"
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fileUrl | string | Yes | File download URL, must be a valid HTTP or HTTPS address |
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
const response = await fetch('https://kieai.redpandaai.co/api/file-url-upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileUrl: 'https://example.com/sample-image.jpg',
    uploadPath: 'images',
    fileName: 'my-image.jpg'
  })
});

const result = await response.json();
console.log('Upload successful:', result);
```

## Example with Python

```python
import requests

url = "https://kieai.redpandaai.co/api/file-url-upload"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "fileUrl": "https://example.com/sample-image.jpg",
    "uploadPath": "images",
    "fileName": "my-image.jpg"
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()

print(f"Upload successful: {result}")
```
