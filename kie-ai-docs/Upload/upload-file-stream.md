# File Stream Upload

> Upload temporary files via multipart/form-data format. Note: Uploaded files are temporary and automatically deleted after 3 days.

### Features

* Supports binary stream upload for various file types
* Suitable for large file uploads with high transmission efficiency
* Automatic MIME type recognition
* Support for custom file names or auto-generation (overwrites existing files with same name, may have caching delays)
* Returns complete file information and download links
* API Key authentication protection
* Uploaded files are temporary and automatically deleted after 3 days

### Usage Recommendations

* Recommended for large files (>10MB)
* Supports various formats: images, videos, documents, etc.
* Transmission efficiency is approximately 33% higher than Base64 format

## API Endpoint

**POST /api/file-stream-upload**

### Request

**Headers:**

```http
Authorization: Bearer YOUR_API_KEY
```

**Body (multipart/form-data):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | binary | Yes | File to upload (binary data) |
| uploadPath | string | Yes | File upload path, without leading or trailing slashes |
| fileName | string | No | File name (optional), including file extension. If not provided, a random file name will be generated. |

### Example

```bash
curl -X POST https://kieai.redpandaai.co/api/file-stream-upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@/path/to/your-file.jpg" \
  -F "uploadPath=images/user-uploads" \
  -F "fileName=custom-name.jpg"
```

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

### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| success | boolean | Whether the request was successful |
| code | integer | Response status code |
| msg | string | Response message |
| data.fileName | string | File name |
| data.filePath | string | Complete file path in storage |
| data.downloadUrl | string | File download URL |
| data.fileSize | integer | File size in bytes |
| data.mimeType | string | File MIME type |
| data.uploadedAt | string | Upload timestamp |

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
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('uploadPath', 'images/user-uploads');
formData.append('fileName', 'custom-name.jpg');

const response = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const result = await response.json();
console.log('Upload successful:', result);
```

## Example with Python

```python
import requests

url = "https://kieai.redpandaai.co/api/file-stream-upload"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}

files = {
    'file': ('your-file.jpg', open('/path/to/your-file.jpg', 'rb')),
    'uploadPath': (None, 'images/user-uploads'),
    'fileName': (None, 'custom-name.jpg')
}

response = requests.post(url, headers=headers, files=files)
result = response.json()

print(f"Upload successful: {result}")
```
