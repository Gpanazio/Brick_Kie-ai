# 4o Image Generation Callbacks

> When the 4o Image task is completed, the system will send the result to your provided callback URL via POST request

## Callback Mechanism Overview

The callback mechanism eliminates the need to poll the API for task status. The system will proactively push task completion results to your server.

### Callback Timing

The system will send callback notifications in the following situations:

* 4o image generation task completed successfully
* 4o image generation task failed
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
  "msg": "success",
  "data": {
    "taskId": "task12345",
    "info": {
      "result_urls": [
        "https://example.com/result/image1.png"
      ]
    }
  }
}
```

### Failure Callback

```json
{
  "code": 400,
  "msg": "Your content was flagged by OpenAI as violating content policies",
  "data": {
    "taskId": "task12345",
    "info": null
  }
}
```

## Status Code Description

| Code | Description |
|------|-------------|
| 200 | Success - Image generation completed successfully |
| 400 | Bad Request - Content policy violation, image size exceeds limit, or unable to process image |
| 451 | Download Failed - Unable to download image from the provided filesUrl |
| 500 | Server Error - Please try again later |

## Best Practices

1. **Use HTTPS**: Ensure your callback URL uses HTTPS protocol
2. **Verify Source**: Verify the legitimacy of the request source
3. **Idempotent Processing**: The same taskId may receive multiple callbacks
4. **Quick Response**: Return 200 status code quickly to avoid timeout
5. **Asynchronous Processing**: Process complex logic asynchronously
6. **Timely Download**: Download images promptly as URLs may expire

## Important Reminders

* Callback URL must be publicly accessible
* Server must respond within 15 seconds
* If 3 consecutive retries fail, the system will stop sending callbacks
* Generated image URLs may have time limits - download promptly

## Alternative Solution

Poll the Get 4o Image Details endpoint every 30 seconds if callbacks are not available.
