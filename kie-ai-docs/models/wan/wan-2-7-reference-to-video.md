# Wan 2.7 - Reference to Video

Generate videos from mixed references (images/videos/audio) using Wan 2.7 R2V.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "wan/2-7-r2v",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Image 1 is eating while video 1 and image 2 are singing beside it.",
    "negative_prompt": "low resolution, malformed",
    "reference_image": [
      "https://example.com/demo/ref-image-1.png",
      "https://example.com/demo/ref-image-2.png"
    ],
    "reference_video": [
      "https://example.com/demo/ref-video-1.mp4"
    ],
    "first_frame": "https://example.com/demo/first-frame.png",
    "reference_voice": "https://example.com/demo/reference-voice.mp3",
    "resolution": "1080p",
    "aspect_ratio": "16:9",
    "duration": 5,
    "prompt_extend": true,
    "watermark": false,
    "seed": 0,
    "nsfw_checker": false
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| model | string | Yes | Must be `wan/2-7-r2v` |
| input.prompt | string | Yes | Prompt text (max 5000 chars) |
| input.reference_image | string[] | No* | Up to 5 image URLs |
| input.reference_video | string[] | No* | Up to 5 video URLs |
| input.first_frame | string (uri) | No | Optional first frame |
| input.reference_voice | string (uri) | No | Optional voice reference |
| input.resolution | string | No | `720p` or `1080p` |
| input.aspect_ratio | string | No | `16:9`, `9:16`, `1:1`, `4:3`, `3:4` |
| input.duration | integer | No | 2 to 10 seconds |
| input.prompt_extend | boolean | No | Enable prompt rewrite |
| input.watermark | boolean | No | Add watermark |
| input.seed | integer | No | Random seed (0 to 2147483647) |
| input.nsfw_checker | boolean | No | Content filter toggle |
| callBackUrl | string (uri) | No | Callback URL for completion notifications |

\* At least one of `reference_image` or `reference_video` must be provided.
