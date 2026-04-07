# Generate or Edit Image (Flux Kontext)

> Create a new image generation or editing task using the Flux Kontext AI model.

## Usage Modes

1. **Text-to-Image Generation**
   * Provide `prompt` and `aspectRatio`
   * Model generates a new image based on the text description

2. **Image Editing**
   * Provide `prompt` and `inputImage`
   * Optionally provide `aspectRatio` (or preserves original)
   * Model edits the input image according to the prompt

## API Endpoint

**POST /api/v1/flux/kontext/generate**

### Request

```json
{
  "prompt": "A serene mountain landscape at sunset with a lake",
  "enableTranslation": true,
  "aspectRatio": "16:9",
  "outputFormat": "jpeg",
  "model": "flux-kontext-pro",
  "callBackUrl": "https://your-callback-url.com/callback"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | Yes | Text prompt (English only) |
| enableTranslation | boolean | No | Auto-translate prompts to English |
| inputImage | string | No | Input image URL for editing |
| aspectRatio | string | No | Output ratio (21:9, 16:9, 4:3, 1:1, 3:4, 9:16) |
| outputFormat | string | No | Output format (jpeg, png) |
| promptUpsampling | boolean | No | Enable prompt upsampling |
| model | string | No | Model (flux-kontext-pro, flux-kontext-max) |
| callBackUrl | string | No | Callback URL |
| safetyTolerance | integer | No | Moderation level (0-6 for generation, 0-2 for editing) |
| watermark | string | No | Watermark text |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task12345"
  }
}
```

### Important Notes

* Generated images expire after 14 days
* Prompts only support English
* flux-kontext-max for complex scenes
* flux-kontext-pro for standard use cases

## Query Task Status

**GET /api/v1/flux/kontext/record-info?taskId={taskId}**
