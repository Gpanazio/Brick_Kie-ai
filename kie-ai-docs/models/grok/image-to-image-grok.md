# Grok Imagine - Image to Image

> Content generation using grok-imagine/image-to-image

## File Upload Requirements

Before using the Image-to-Image API, you need to upload your reference image:

Use the File Upload API to upload your reference image.

**Requirements:**

- **File Type**: JPEG, PNG, or WebP format
- **Max File Size**: 10MB per file
- **Content**: Image you want to use as reference for generation

> **Warning:** 
> - Supported formats: JPEG, PNG, WebP (Max: 10MB)
> - Maximum one image per request

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

**Headers:**

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Body:**

```json
{
  "model": "grok-imagine/image-to-image",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Recreate the Titanic movie poster with two adorable anthropomorphic cats...",
    "image_urls": ["https://example.com/image.jpg"]
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| model | string | Yes | Must be `grok-imagine/image-to-image` |
| callBackUrl | string | No | URL to receive callback when task completes |
| input.prompt | string | Yes | Text description of desired content/style (Max 390000 characters) |
| input.image_urls | array | Yes | Array with one URL to reference image |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_grok-imagine_1767694553297"
  }
}
```

## Query Task Status

After submitting a task, use the unified query endpoint to check progress and retrieve results:

**GET /api/v1/jobs/recordInfo?taskId={taskId}**

> **Tip:** For production use, we recommend using the `callBackUrl` parameter to receive automatic notifications when generation completes, rather than polling the status endpoint.
