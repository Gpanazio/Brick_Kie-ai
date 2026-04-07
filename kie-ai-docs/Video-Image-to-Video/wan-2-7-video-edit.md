# Wan 2.7 - Video Edit

Edit existing videos with Wan 2.7 video editing model.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "wan/2-7-videoedit",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "Change the character outfit and add the hat from reference image.",
    "negative_prompt": "low quality, malformed",
    "video_url": "https://example.com/demo/video.mp4",
    "reference_image": "https://example.com/demo/reference.png",
    "resolution": "1080p",
    "aspect_ratio": "16:9",
    "duration": 0,
    "audio_setting": "auto",
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
| model | string | Yes | Must be `wan/2-7-videoedit` |
| input.video_url | string (uri) | Yes | Source video URL |
| input.prompt | string | No | Edit instructions (max 5000 chars) |
| input.negative_prompt | string | No | Negative prompt (max 500 chars) |
| input.reference_image | string (uri) | No | Optional style/reference image |
| input.resolution | string | No | `720p` or `1080p` |
| input.aspect_ratio | string | No | `16:9`, `9:16`, `1:1`, `4:3`, `3:4` |
| input.duration | integer | No | `0` or integer in range `2..10` |
| input.audio_setting | string | No | `auto` or `origin` |
| input.prompt_extend | boolean | No | Enable prompt rewrite |
| input.watermark | boolean | No | Add watermark |
| input.seed | integer | No | Random seed (0 to 2147483647) |
| input.nsfw_checker | boolean | No | Content filter toggle |
| callBackUrl | string (uri) | No | Callback URL for completion notifications |

### Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_wan_1765180586443"
  }
}
```
