# Wan 2.7 - Image to Video

Generate videos from images using Wan 2.7 image-to-video workflows.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "wan/2-7-image-to-video",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "A white cat on a windowsill in warm afternoon light, camera slowly pushing in.",
    "negative_prompt": "blurry, flicker, low quality, distorted",
    "first_frame_url": "https://your-domain.com/assets/first-frame.png",
    "last_frame_url": "https://your-domain.com/assets/last-frame.png",
    "first_clip_url": "https://your-domain.com/assets/first-clip.mp4",
    "driving_audio_url": "https://your-domain.com/assets/driving-audio.mp3",
    "resolution": "1080p",
    "duration": 5,
    "prompt_extend": true,
    "watermark": false,
    "seed": 123456,
    "nsfw_checker": false
  }
}
```

### Generation modes

- First-frame-to-video: provide `first_frame_url`
- First-and-last-frame-to-video: provide `first_frame_url` and `last_frame_url`
- Video continuation: provide `first_clip_url`

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| model | string | Yes | Must be `wan/2-7-image-to-video` |
| input.prompt | string | Yes | Prompt text (max 5000 chars) |
| input.negative_prompt | string | No | Negative prompt (max 500 chars) |
| input.first_frame_url | string (uri) | No | First frame image URL |
| input.last_frame_url | string (uri) | No | Last frame image URL |
| input.first_clip_url | string (uri) | No | Source clip URL for continuation |
| input.driving_audio_url | string (uri) | No | Driving audio URL |
| input.resolution | string | No | `720p` or `1080p` |
| input.duration | integer | No | 2 to 15 seconds (default `5`) |
| input.prompt_extend | boolean | No | Enable prompt rewrite (default `true`) |
| input.watermark | boolean | No | Add watermark (default `false`) |
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
