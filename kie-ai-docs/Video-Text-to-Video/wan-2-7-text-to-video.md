# Wan 2.7 - Text to Video

Generate videos directly from text prompts using the Wan 2.7 text-to-video model.

## API Endpoint

**POST /api/v1/jobs/createTask**

### Request

```json
{
  "model": "wan/2-7-text-to-video",
  "callBackUrl": "https://your-domain.com/api/callback",
  "input": {
    "prompt": "A futuristic city street at night with neon reflections and a slow cinematic dolly-in.",
    "negative_prompt": "blurry, low quality, flicker",
    "audio_url": "https://your-domain.com/audio/custom-track.mp3",
    "resolution": "1080p",
    "ratio": "16:9",
    "duration": 5,
    "prompt_extend": true,
    "watermark": false,
    "seed": 123456,
    "nsfw_checker": false
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| model | string | Yes | Must be `wan/2-7-text-to-video` |
| input.prompt | string | Yes | Prompt text (min 1, max 5000 chars) |
| input.negative_prompt | string | No | Negative prompt (max 500 chars) |
| input.audio_url | string (uri) | No | Optional custom audio URL |
| input.resolution | string | No | `720p` or `1080p` (default `1080p`) |
| input.ratio | string | No | `16:9`, `9:16`, `1:1`, `4:3`, `3:4` |
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
