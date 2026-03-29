# Image Generation or Editing Callbacks

> When the image generation task is completed, the system will send the result to your provided callback URL via POST request

## Callback Mechanism Overview

The callback mechanism eliminates the need to poll the API for task status. The system will proactively push task completion results to your server.

### Callback Timing

The system will send callback notifications in the following situations:

* Image generation or editing task completed successfully
* Image generation or editing task failed
* Errors occurred during task processing

### Callback Method

* **HTTP Method**: POST
* **Content Type**: application/json
* **Timeout Setting**: 15 seconds

## Callback Request Format

### Success Callback

```json
{
  "code": 200,
  "msg": "BFL image generated successfully.",
  "data": {
    "taskId": "task12345",
    "info": {
      "originImageUrl": "https://example.com/original.jpg",
      "resultImageUrl": "https://example.com/result.jpg"
    }
  }
}
```

### Content Policy Violation

```json
{
  "code": 400,
  "msg": "Your prompt was flagged by Website as violating content policies.",
  "data": {
    "taskId": "task12345",
    "info": {
      "originImageUrl": "",
      "resultImageUrl": ""
    }
  }
}
```

### Generation Failure

```json
{
  "code": 501,
  "msg": "Image generation task failed",
  "data": {
    "taskId": "task12345",
    "info": {
      "originImageUrl": "",
      "resultImageUrl": ""
    }
  }
}
```

## Status Code Description

| Code | Description |
|------|-------------|
| 200 | Success - Image generation completed successfully |
| 400 | Failed - Prompt violated content policies |
| 500 | Failed - Internal Error |
| 501 | Failed - Image generation task failed |

## Important Notes

* Original image URLs expire after 10 minutes - download immediately
* Callback URL must be publicly accessible
* Server must respond within 15 seconds
* If 3 consecutive retries fail, the system stops sending callbacks
