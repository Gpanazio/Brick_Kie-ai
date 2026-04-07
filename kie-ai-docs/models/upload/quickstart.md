# File Upload API Quickstart

> Get started with the File Upload API in minutes, supporting multiple upload methods

## Welcome to File Upload API

The File Upload API provides flexible and efficient file upload services, supporting multiple upload methods to meet diverse business needs. Whether it's remote file migration, large file transmission, or quick small file uploads, our API offers the best solutions for your requirements.

> **Info:** **File uploads are free** - No charges apply for uploading files to our service. You can upload files without worrying about upload costs or fees.

> **Warning:** **Important Notice**: Uploaded files are temporary and will be **automatically deleted after 3 days**. Please download or migrate important files promptly.

## Authentication

All API requests require authentication using Bearer tokens. Please obtain your API key from the [API Key Management Page](https://kie.ai/api-key).

### API Base URL

```
https://kieai.redpandaai.co
```

### Authentication Header

```http
Authorization: Bearer YOUR_API_KEY
```

## Quick Start Guide

### Step 1: Choose Your Upload Method

Select the appropriate upload method based on your needs:

#### URL File Upload

Suitable for downloading and uploading files from remote servers:

**cURL:**

```bash
curl -X POST "https://kieai.redpandaai.co/api/file-url-upload" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrl": "https://example.com/sample-image.jpg",
    "uploadPath": "images",
    "fileName": "my-image.jpg"
  }'
```

#### File Stream Upload

Suitable for directly uploading local files, especially large files:

**cURL:**

```bash
curl -X POST "https://kieai.redpandaai.co/api/file-stream-upload" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@/path/to/your-file.jpg" \
  -F "uploadPath=images/user-uploads" \
  -F "fileName=custom-name.jpg"
```

#### Base64 Upload

Suitable for Base64 encoded file data:

**cURL:**

```bash
curl -X POST "https://kieai.redpandaai.co/api/file-base64-upload" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "base64Data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "uploadPath": "images",
    "fileName": "base64-image.png"
  }'
```

### Understanding fileName Parameter

> **Info:** The `fileName` parameter is optional in all upload methods and behaves as follows:

| Parameter | Type | Description |
|-----------|------|-------------|
| fileName | string | Optional |

**File name behavior:**
* If not provided, a random file name will be automatically generated
* If the same file name is uploaded again, the old file will be overwritten
* Due to caching, changes may not take effect immediately when overwriting files

### Step 2: Handle Response

Upon successful upload, you'll receive a response containing file information:

```json
{
  "success": true,
  "code": 200,
  "msg": "File uploaded successfully",
  "data": {
    "fileId": "file_abc123456",
    "fileName": "my-image.jpg",
    "originalName": "sample-image.jpg",
    "fileSize": 245760,
    "mimeType": "image/jpeg",
    "uploadPath": "images",
    "fileUrl": "https://kieai.redpandaai.co/files/images/my-image.jpg",
    "downloadUrl": "https://kieai.redpandaai.co/download/file_abc123456",
    "uploadTime": "2025-01-15T10:30:00Z",
    "expiresAt": "2025-01-18T10:30:00Z"
  }
}
```

## Upload Method Comparison

Choose the most suitable upload method for your needs:

| Method | Best for | Advantages | Limitations |
|--------|----------|------------|-------------|
| URL File Upload | File migration, batch processing | No local file required, Automatic download handling, Supports remote resources | Requires publicly accessible URL, 30-second download timeout, Recommended ≤100MB |
| File Stream Upload | Large files, local files | High transmission efficiency, Supports large files, Binary transmission | Requires local file, Server processing time |
| Base64 Upload | Small files, API integration | JSON format transmission, Easy integration, Supports Data URL | Data size increases by 33%, Not suitable for large files, Recommended ≤10MB |

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Request processed successfully, file upload completed |
| 400 | Bad Request - Request parameters are incorrect or missing required parameters |
| 401 | Unauthorized - Authentication credentials are missing or invalid |
| 405 | Method Not Allowed - Request method is not supported |
| 500 | Server Error - An unexpected error occurred while processing the request |

## File Storage Information

> **Warning:** **Important Notice**: All uploaded files are temporary and will be **automatically deleted after 3 days**.

* Files are immediately accessible and downloadable after upload
* File URLs remain valid for 3 days
* The system provides an `expiresAt` field in the response indicating expiration time
* It's recommended to download or migrate important files before expiration
* Use the `downloadUrl` field to get direct download links

## Next Steps

<CardGroup cols={3}>
  <Card title="URL File Upload" icon="link" href="/file-upload-api/upload-file-url">
    Learn how to upload files from remote URLs
  </Card>

  <Card title="File Stream Upload" icon="upload" href="/file-upload-api/upload-file-stream">
    Master efficient file stream upload methods
  </Card>

  <Card title="Base64 Upload" icon="code" href="/file-upload-api/upload-file-base-64">
    Understand Base64 encoded file uploads
  </Card>
</CardGroup>

## Support

Need help? Our technical support team is here to assist you.

* **Email**: [support@kie.ai](mailto:support@kie.ai)
* **Documentation**: [docs.kie.ai](https://docs.kie.ai)

***

Ready to start uploading files? [Get your API key](https://kie.ai/api-key) and begin using the file upload service immediately!
