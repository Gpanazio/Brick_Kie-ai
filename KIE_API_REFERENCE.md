# KIE.ai API -- Comprehensive Reference Document

> Compiled 2026-02-21 from docs.kie.ai and related sources.
> Note: docs.kie.ai returns HTTP 403 to automated fetchers; this reference was assembled via web search extraction.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Authentication & Headers](#2-authentication--headers)
3. [Asynchronous Task Model](#3-asynchronous-task-model)
4. [Rate Limits & Concurrency](#4-rate-limits--concurrency)
5. [Data Retention Policy](#5-data-retention-policy)
6. [Pricing & Credits](#6-pricing--credits)
7. [File Upload API](#7-file-upload-api)
8. [Common / Utility API](#8-common--utility-api)
9. [Veo 3.1 API (Google)](#9-veo-31-api-google)
10. [Runway API](#10-runway-api)
11. [Luma API](#11-luma-api)
12. [Suno API (Music)](#12-suno-api-music)
13. [4o Image API (GPT Image 1)](#13-4o-image-api-gpt-image-1)
14. [Flux Kontext API](#14-flux-kontext-api)
15. [Market Unified API](#15-market-unified-api)
17. [ElevenLabs API (via Market)](#17-elevenlabs-api-via-market)
18. [Nano Banana / Google (via Market)](#18-nano-banana--google-via-market)
19. [All Other Market Models](#19-all-other-market-models)
20. [Error Codes Reference](#20-error-codes-reference)
21. [Full Documentation Sitemap](#21-full-documentation-sitemap)

---

## 1. Platform Overview

KIE.ai is an **AI API aggregator** providing a single, unified point of access to leading third-party AI models. It does not create its own models -- it acts as an intermediary to models from Google, OpenAI, Runway, Suno, ElevenLabs, ByteDance, and many others.

**Base API URL:** `https://api.kie.ai`
**Upload API URL:** `https://kieai.redpandaai.co`
**Documentation:** `https://docs.kie.ai`
**Pricing Page:** `https://kie.ai/pricing`
**API Key Management:** `https://kie.ai/api-key`

**Support Hours:** UTC 21:00 -- UTC 17:00 (next day)
**Support Email:** support@kie.ai

---

## 2. Authentication & Headers

All API requests require Bearer Token authentication.

**Required Headers:**
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json       (for POST requests with JSON body)
```

**Security Best Practices:**
- Never expose API keys in frontend/client-side code
- Never commit keys to public repositories
- If compromised, reset immediately at https://kie.ai/api-key
- IP whitelist support available (only approved server IPs)

---

## 3. Asynchronous Task Model

ALL generation tasks on KIE are **asynchronous**. A successful 200 response means the task was **created**, NOT completed.

**Two ways to get results:**

1. **Callback/Webhook (recommended for production):** Set `callBackUrl` in the request. The system POSTs results to your URL upon completion.
2. **Polling:** Use the relevant `record-info` endpoint with `taskId` to check status.

**Common Task States:**
- `0` / `GENERATING` -- Task is being processed
- `1` / `SUCCESS` -- Completed successfully
- `2` / `CREATE_TASK_FAILED` -- Failed to create
- `3` / `GENERATE_FAILED` -- Generation failed
- `4` -- Generation succeeded but callback delivery failed

For Market API tasks, states are: `waiting`, `queuing`, `generating`, `success`, `fail`.

---

## 4. Rate Limits & Concurrency

- Rate limits enforced per API key: hourly, daily, and total usage caps
- IP whitelist support for approved server IPs only
- HTTP 429 = Rate Limited
- Recommended: exponential backoff with retry logic for 429 responses
- Contact support to request higher limits if consistently hitting 429

---

## 5. Data Retention Policy

| Content Type | Retention |
|---|---|
| Download URLs (temp signed) | **20 minutes** |
| Uploaded files (File Upload API) | **3 days** |
| Generated videos (e.g., Runway) | **14 days** |
| Generated images | **14 days** |
| Log records / metadata | **2 months** |

Always download and persist generated content promptly.

---

## 6. Pricing & Credits

**Credit System:** 1 credit = $0.005

**Recharge Plans:**
- $5 = 1,000 credits (beginner)
- $50 = 10,000 credits (save 5%)
- Payment: credit card, PayPal, WeChat Pay
- Free trial available for testing

**Per-Model Costs (selected, may change):**

| Model | Credits | USD |
|---|---|---|
| Veo 3.1 Fast (16:9 / 9:16) | 60 | $0.30 |
| Veo 3.1 Quality | 250 | $1.25 |
| Veo 3.1 Fallback | 100 | $0.50 |
| Nano Banana Image | 4 | $0.02 |
| Seedream 4.0 Image | 3.5 | $0.0175 |
| Image Models (general) | 10-50 | $0.05-$0.25 |
| Video Models (general) | 100-500 | $0.50-$2.50 |

**KIE claims 30-50% lower than official APIs, up to 80% discount for some models.**

**Check Credits Endpoint:**
```
GET https://api.kie.ai/api/v1/chat/credit
Authorization: Bearer YOUR_API_KEY
```
HTTP 402 = Insufficient Credits.

For current pricing: https://kie.ai/pricing

---

## 7. File Upload API

File uploads are **free** (no credit charge). Uploaded files auto-delete after 3 days.

**Upload Base URL:** `https://kieai.redpandaai.co`

### 7.1 Base64 Upload
```
POST https://kieai.redpandaai.co/api/file-base64-upload
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "base64Data": "iVBORw0KGgoAAAANSUhEUgAA...",   // or "data:image/png;base64,..."
  "fileName": "my-image.png",                  // optional
  "uploadPath": "uploads"                      // optional
}
```
Best for: small files.

### 7.2 File Stream Upload
```
POST https://kieai.redpandaai.co/api/file-stream-upload
Authorization: Bearer YOUR_API_KEY
Content-Type: multipart/form-data

file: <binary>
uploadPath: "uploads"
fileName: "my-video.mp4"    (optional)
```
Best for: large files. ~33% more efficient than Base64.

### 7.3 URL Upload
```
POST https://kieai.redpandaai.co/api/file-url-upload
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "fileUrl": "https://example.com/image.jpg",
  "uploadPath": "uploads",
  "fileName": "image.jpg"     // optional
}
```
Best for: files already hosted at a remote URL.

### Upload Response (all methods)
```json
{
  "success": true,
  "code": 200,
  "msg": "success",
  "data": {
    "fileName": "image.jpg",
    "filePath": "uploads/image.jpg",
    "downloadUrl": "https://...",
    "fileSize": 123456,
    "mimeType": "image/jpeg",
    "uploadedAt": "2026-02-21T..."
  }
}
```

**Docs:**
- https://docs.kie.ai/file-upload-api/quickstart
- https://docs.kie.ai/file-upload-api/upload-file-base-64
- https://docs.kie.ai/file-upload-api/upload-file-stream
- https://docs.kie.ai/file-upload-api/upload-file-url

---

## 8. Common / Utility API

### 8.1 Get Remaining Credits
```
GET https://api.kie.ai/api/v1/chat/credit
Authorization: Bearer YOUR_API_KEY
```

### 8.2 Get Download URL for Generated Files
Converts generated file URLs to temporary downloadable URLs. **Valid for 20 minutes only.**
```
POST https://api.kie.ai/api/v1/common/download-url
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "url": "https://...generated-file-url..."
}
```

**Docs:**
- https://docs.kie.ai/common-api/quickstart
- https://docs.kie.ai/common-api/get-account-credits
- https://docs.kie.ai/common-api/download-url

---

## 9. Veo 3.1 API (Google)

### 9.1 Generate Video
```
POST https://api.kie.ai/api/v1/veo/generate
```

**Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `prompt` | Yes | Text prompt describing the video |
| `model` | Yes | `veo3` (Quality) or `veo3_fast` (Fast) |
| `imageUrls` | No | Array of image URLs for image-to-video |
| `aspect_ratio` | No | e.g., `"16:9"` |
| `seeds` | No | 10000-99999, controls randomness |
| `watermark` | No | Watermark text overlay |
| `callBackUrl` | No | Webhook URL |
| `enableTranslation` | No | Translate prompt |
| `generationType` | No | `TEXT_2_VIDEO`, `FIRST_AND_LAST_FRAMES_2_VIDEO`, `REFERENCE_2_VIDEO` |

**Notes:**
- Clips limited to 8 seconds
- Generation takes 2-5 minutes
- Supports JPG, PNG, WebP input images
- 25% of Google's direct pricing

### 9.2 Extend Video
```
POST https://api.kie.ai/api/v1/veo/extend
```
Parameters: `taskId`, `model` (`fast` or `quality`), `prompt`, `callBackUrl`

### 9.3 Get Video Details
```
GET https://api.kie.ai/api/v1/veo/record-info?taskId={taskId}
```

### 9.4 Get 1080P Video
```
GET https://api.kie.ai/api/v1/veo/get-1080p-video?taskId={taskId}
```

### 9.5 Get 4K Video
```
POST https://api.kie.ai/api/v1/veo/get-4k-video
Body: { "taskId": "...", "callBackUrl": "..." }
```
4K costs approximately 2x Fast mode credits.

**Docs:**
- https://docs.kie.ai/veo3-api/quickstart
- https://docs.kie.ai/veo3-api/generate-veo-3-video
- https://docs.kie.ai/veo3-api/extend-video
- https://docs.kie.ai/veo3-api/get-veo-3-video-details
- https://docs.kie.ai/veo3-api/get-veo-3-1080-p-video
- https://docs.kie.ai/veo3-api/get-veo-3-4k-video
- https://docs.kie.ai/veo3-api/generate-veo-3-video-callbacks

---

## 10. Runway API

### 10.1 Generate AI Video (Gen-3)
```
POST https://api.kie.ai/api/v1/runway/generate
```

| Parameter | Required | Description |
|---|---|---|
| `prompt` | Yes | Text guiding generation |
| `model` | Yes | e.g., `"runway-duration-5-generate"` |
| `duration` | Yes | 5 or 10 seconds (10s cannot use 1080p) |
| `quality` | Yes | `720p` or `1080p` (1080p cannot use 10s) |
| `aspectRatio` | For text-to-video | Required for text-only; ignored when imageUrl provided |
| `imageUrl` | No | Source image for image-to-video |
| `waterMark` | No | Watermark text (empty = none) |
| `callBackUrl` | Required | Webhook URL for completion |

### 10.2 Generate Aleph Video (Video-to-Video)
```
POST https://api.kie.ai/api/v1/aleph/generate
```

| Parameter | Required | Description |
|---|---|---|
| `prompt` | Yes | How to transform the reference video |
| `videoUrl` | Yes | Reference video URL |
| `callBackUrl` | No | Webhook URL |
| `waterMark` | No | Watermark text |
| `uploadCn` | No | `true` = Alibaba Cloud; `false` = R2 |
| `aspectRatio` | No | Video aspect ratio |
| `seed` | No | For reproducible generation |
| `imageUrl` | No | Reference image for style influence |

**Note:** Aleph outputs capped at 5 seconds; input beyond 5s will be truncated.

### 10.3 Extend AI Video
```
POST https://api.kie.ai/api/v1/runway/extend
```
Parameters: `taskId`, `prompt`, `imageUrl`, `expandPrompt`, `waterMark`, `callBackUrl`

### 10.4 Get AI Video Details
```
GET https://api.kie.ai/api/v1/runway/record-detail?taskId={taskId}
```

### 10.5 Get Aleph Video Details
```
GET https://api.kie.ai/api/v1/aleph/record-info?taskId={taskId}
```

**Docs:**
- https://docs.kie.ai/runway-api/quickstart
- https://docs.kie.ai/runway-api/generate-ai-video
- https://docs.kie.ai/runway-api/generate-aleph-video
- https://docs.kie.ai/runway-api/extend-ai-video
- https://docs.kie.ai/runway-api/get-ai-video-details
- https://docs.kie.ai/runway-api/get-aleph-video-details
- https://docs.kie.ai/runway-api/generate-ai-video-callbacks
- https://docs.kie.ai/runway-api/generate-aleph-video-callbacks
- https://docs.kie.ai/runway-api/extend-ai-video-callbacks

---

## 11. Luma API

### 11.1 Generate/Modify Video
```
POST https://api.kie.ai/api/v1/modify/generate
```

| Parameter | Required | Description |
|---|---|---|
| `prompt` | Yes | How the video should be modified/transformed |
| `videoUrl` | Yes | Input video URL |
| `callBackUrl` | No | Webhook URL |
| `watermark` | No | Watermark text |

### 11.2 Get Luma Modify Details
```
GET https://api.kie.ai/api/v1/modify/record-info?taskId={taskId}
```

**Docs:**
- https://docs.kie.ai/luma-api/quickstart
- https://docs.kie.ai/luma-api/get-luma-modify-details

---

## 12. Suno API (Music)

The Suno API provides comprehensive music generation, editing, and analysis capabilities.

### 12.1 Generate Music
```
POST https://api.kie.ai/api/v1/generate
```

| Parameter | Required | Description |
|---|---|---|
| `prompt` | Conditional | Lyrics (customMode=true, instrumental=false) or idea (customMode=false). Max 500 chars |
| `customMode` | No | `true` = advanced control; `false` = auto-generate lyrics |
| `style` | Conditional | Music style. Required when customMode=true |
| `title` | Conditional | Song title. Required when customMode=true |
| `model` | No | `V5`, `V4_5PLUS`, `V4_5`, `V4` |
| `instrumental` | No | Generate without vocals |
| `callBackUrl` | Required | Webhook URL |
| `personaId` | No | Apply persona style (customMode only) |
| `negativeTags` | No | Styles to avoid |
| `vocalGender` | No | `'m'` or `'f'` (customMode only, increases probability) |
| `styleWeight` | No | 0-1, adherence to specified style |
| `weirdnessConstraint` | No | Creativity level |
| `audioWeight` | No | Audio influence weight |
| `personaModel` | No | Persona model version |

**Models:**
- `V5` -- Superior expression, faster generation
- `V4_5PLUS` -- Richer sound, max 8 min
- `V4_5` -- Smarter prompts, faster, max 8 min
- `V4` -- Improved vocal quality, max 4 min

**Callback Stages:** `PENDING` -> `TEXT_SUCCESS` -> `FIRST_SUCCESS` -> `SUCCESS`

### 12.2 Extend Music
```
POST https://api.kie.ai/api/v1/generate/extend
```
Parameters: `audioId`, `continueAt` (seconds), `style`, `title`, `prompt`, `callBackUrl`

### 12.3 Upload and Cover Audio
```
POST https://api.kie.ai/api/v1/generate/upload-cover
```
Upload audio + transform style while preserving melody. Supports custom/non-custom modes.

### 12.4 Upload and Extend Audio
Upload + extend existing audio. Max 8 min (V4_5ALL: max 1 min upload).

### 12.5 Add Instrumental
```
POST https://api.kie.ai/api/v1/generate/add-instrumental
```
Generates accompaniment for uploaded vocals/melody. Parameters: `uploadUrl`, `vocalGender`, `styleWeight` (0-1).

### 12.6 Add Vocals
Layers AI-generated vocals on existing instrumental. Parameters: `uploadUrl`, `prompt`.

### 12.7 Generate Lyrics
```
POST https://api.kie.ai/api/v1/lyrics
```
Creates structured lyrics from creative prompts.

### 12.8 Get Timestamped Lyrics
```
GET /api/v1/generate/get-timestamped-lyrics
```
Requires taskId from Generate or Extend Music endpoints.

### 12.9 Generate Persona
Create personalized music Persona from generated music. Requires taskId + audioId. Supports models above v3_5.

### 12.10 Generate Music Cover (Image)
Create cover images for generated music. Returns 2 style variants.

### 12.11 Vocal & Instrument Stem Separation
```
POST https://api.kie.ai/api/v1/vocal-removal/generate
```
- `separate_vocal` -- 2 stems (vocals + instrumental)
- `split_stem` -- up to 12 stems (vocals, drums, bass, guitar, keyboard, strings, brass, woodwinds, percussion, synth, FX, backing vocals)

### 12.12 Generate MIDI from Audio
Converts separated audio tracks to MIDI. Requires completed vocal separation task.

### 12.13 Create Music Video
```
POST https://api.kie.ai/api/v1/mp4/generate
```

### 12.14 Convert to WAV
```
POST https://api.kie.ai/api/v1/wav/generate
```

### 12.15 Get Music Task Details
```
GET https://api.kie.ai/api/v1/generate/record-info?taskId={taskId}
```

**Docs:**
- https://docs.kie.ai/suno-api/quickstart
- https://docs.kie.ai/suno-api/generate-music
- https://docs.kie.ai/suno-api/extend-music
- https://docs.kie.ai/suno-api/upload-and-cover-audio
- https://docs.kie.ai/suno-api/upload-and-extend-audio
- https://docs.kie.ai/suno-api/add-instrumental
- https://docs.kie.ai/suno-api/add-vocals
- https://docs.kie.ai/suno-api/generate-lyrics
- https://docs.kie.ai/suno-api/get-timestamped-lyrics
- https://docs.kie.ai/suno-api/generate-persona
- https://docs.kie.ai/suno-api/cover-suno
- https://docs.kie.ai/suno-api/vocal-removal
- https://docs.kie.ai/suno-api/separate-vocals
- https://docs.kie.ai/suno-api/generate-midi
- https://docs.kie.ai/suno-api/get-midi-details
- https://docs.kie.ai/suno-api/create-music-video
- https://docs.kie.ai/suno-api/get-music-details
- https://docs.kie.ai/suno-api/get-lyrics-details
- https://docs.kie.ai/suno-api/get-music-video-details

---

## 13. 4o Image API (GPT Image 1)

### 13.1 Generate Image
```
POST https://api.kie.ai/api/v1/gpt4o-image/generate
```

| Parameter | Required | Description |
|---|---|---|
| `prompt` | Conditional | Text prompt. Required if no `filesUrl`. At least one of prompt/filesUrl needed |
| `filesUrl` | No | Array of up to 5 image URLs for editing/reference |
| `size` | No | Output aspect ratio, e.g., `"1:1"` |
| `nVariants` | No | Number of variants to generate |
| `callBackUrl` | No | Webhook URL |
| `isEnhance` | No | Enable prompt enhancement (for 3D renders etc). Default false |
| `uploadCn` | No | `true` = China servers; `false` = non-China |
| `enableFallback` | No | Auto-switch to backup if GPT-4o unavailable. Default false |
| `fallbackModel` | No | `GPT_IMAGE_1` or `FLUX_MAX`. Default `FLUX_MAX` |
| `fileUrl` | Deprecated | Use `filesUrl` instead |

**Mask-based Editing:** Black areas edited, white areas preserved. Mask must match original dimensions.

### 13.2 Get Image Details
```
GET https://api.kie.ai/api/v1/gpt4o-image/record-info?taskId={taskId}
```

### 13.3 Get Direct Download URL
```
POST https://api.kie.ai/api/v1/gpt4o-image/download-url
Body: { "taskId": "...", "url": "..." }
```
Returns signed Cloudflare R2 storage URL.

**Docs:**
- https://docs.kie.ai/4o-image-api/quickstart
- https://docs.kie.ai/4o-image-api/generate-4-o-image
- https://docs.kie.ai/4o-image-api/get-4-o-image-details
- https://docs.kie.ai/4o-image-api/get-4-o-image-download-url

---

## 14. Flux Kontext API

### 14.1 Generate or Edit Image
```
POST https://api.kie.ai/api/v1/flux/kontext/generate
```

| Parameter | Required | Description |
|---|---|---|
| `prompt` | Yes | Text description for generation or editing |
| `model` | Yes | `flux-kontext-pro` or `flux-kontext-max` |
| `aspectRatio` | No | e.g., `"16:9"`, `"1:1"` |
| `outputFormat` | No | e.g., `"jpeg"` |
| `enableTranslation` | No | Enable prompt translation |
| `promptUpsampling` | No | Upsample the prompt |
| `inputImage` | No | Input image URL for editing mode |
| `callBackUrl` | No | Webhook URL |
| `safetyTolerance` | No | Generation: 0-6 (strict to permissive); Editing: 0-2 |

### 14.2 Get Image Details
```
GET https://api.kie.ai/api/v1/flux/kontext/record-info?taskId={taskId}
```

**Docs:**
- https://docs.kie.ai/flux-kontext-api/quickstart
- https://docs.kie.ai/flux-kontext-api/generate-or-edit-image
- https://docs.kie.ai/flux-kontext-api/get-image-details
- https://docs.kie.ai/flux-kontext-api/generate-or-edit-image-callbacks

---

## 15. Market Unified API

The Market API provides access to dozens of AI models through **two unified endpoints**.

### 15.1 Create Task
```
POST https://api.kie.ai/api/v1/jobs/createTask
```

```json
{
  "model": "model-name/variant",
  "callBackUrl": "https://your-webhook.com/callback",
  "input": {
    "prompt": "...",
    ...model-specific parameters...
  }
}
```

### 15.2 Get Task Details
```
GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId={taskId}
```

Successful response:
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_...",
    "state": "success",
    ...results...
  }
}
```

---

## 17. ElevenLabs API (via Market)

Uses the Market `createTask` endpoint.

### Available Models

| Model | Identifier |
|---|---|
| Text-to-Speech Turbo 2.5 | `elevenlabs/text-to-speech-turbo-2-5` |
| Text-to-Speech Multilingual v2 | `elevenlabs/text-to-speech-multilingual-v2` |
| Text-to-Dialogue v3 | `elevenlabs/text-to-dialogue-v3` |
| Speech-to-Text | `elevenlabs/speech-to-text` |
| Sound Effect v2 | `elevenlabs/sound-effect-v2` |
| Audio Isolation | `elevenlabs/audio-isolation` |

### Example: Text-to-Speech
```json
POST https://api.kie.ai/api/v1/jobs/createTask

{
  "model": "elevenlabs/text-to-speech-turbo-2-5",
  "callBackUrl": "https://your-webhook.com/callback",
  "input": {
    "text": "Hello, world!",
    "voice": "Rachel",
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "speed": 1.0,
    "language_code": "en",
    "timestamps": false,
    "previous_text": "",
    "next_text": ""
  }
}
```

**Docs:**
- https://docs.kie.ai/market/elevenlabs/text-to-speech-turbo-2-5
- https://docs.kie.ai/market/elevenlabs/text-to-speech-multilingual-v2
- https://docs.kie.ai/market/elevenlabs/text-to-dialogue-v3
- https://docs.kie.ai/market/elevenlabs/speech-to-text
- https://docs.kie.ai/market/elevenlabs/sound-effect-v2

---

## 18. Nano Banana / Google (via Market)

### Models

| Model | Identifier | Type |
|---|---|---|
| Nano Banana | `google/nano-banana` | Text-to-Image |
| Nano Banana Pro | `nano-banana-pro` | Image-to-Image |
| Nano Banana Edit | `google/nano-banana-edit` | Image Editing |

### Example: Text-to-Image
```json
POST https://api.kie.ai/api/v1/jobs/createTask

{
  "model": "google/nano-banana",
  "callBackUrl": "https://your-webhook.com/callback",
  "input": {
    "prompt": "A futuristic cityscape at sunset",
    "output_format": "png",
    "image_size": "1:1"
  }
}
```

**Docs:**
- https://docs.kie.ai/market/google/nano-banana
- https://docs.kie.ai/market/google/pro-image-to-image
- https://docs.kie.ai/market/google/nano-banana-edit

---

## 19. All Other Market Models

All use `POST /api/v1/jobs/createTask` with model-specific `input` parameters.

### Image Generation

| Model | Identifier | Docs |
|---|---|---|
| Seedream 3.0 Text-to-Image | `bytedance/seedream` | https://docs.kie.ai/market/seedream/seedream |
| Seedream 4.0 Text-to-Image | `bytedance/seedream-v4-text-to-image` | https://docs.kie.ai/market/seedream/seedream-v4-text-to-image |
| Seedream 4.0 Edit | `bytedance/seedream-v4-edit` | https://docs.kie.ai/market/seedream/seedream-v4-edit |
| Seedream 4.5 Text-to-Image | `seedream/4.5-text-to-image` | https://docs.kie.ai/market/seedream/4.5-text-to-image |
| Seedream 4.5 Edit | `seedream/4.5-edit` | https://docs.kie.ai/market/seedream/4.5-edit |
| Flux-2 Pro Text-to-Image | (see docs) | https://docs.kie.ai/market/flux2/pro-text-to-image |
| Flux-2 Pro Image-to-Image | (see docs) | https://docs.kie.ai/market/flux2/pro-image-to-image |
| Flux-2 Flex Image-to-Image | (see docs) | https://docs.kie.ai/market/flux2/flex-image-to-image |
| Grok Imagine Text-to-Image | (see docs) | https://docs.kie.ai/market/grok-imagine/text-to-image |
| Grok Imagine Image-to-Image | (see docs) | https://docs.kie.ai/market/grok-imagine/image-to-image |
| Grok Imagine Image Upscale | (see docs) | https://docs.kie.ai/market/grok-imagine/upscale |
| GPT Image 1.5 Image-to-Image | (see docs) | https://docs.kie.ai/market/gpt-image/1.5-image-to-image |
| Qwen Image-to-Image | (see docs) | https://docs.kie.ai/market/qwen/image-to-image |
| Recraft Remove Background | `recraft/remove-background` | (market) |
| Ideogram Reframe | (see docs) | (market) |

### Video Generation

| Model | Identifier | Docs |
|---|---|---|
| Seedance 1.5 Pro | `bytedance/seedance-1.5-pro` | https://docs.kie.ai/market/bytedance/seedance-1.5-pro |
| Kling 2.6 Text-to-Video | (see docs) | https://docs.kie.ai/market/kling/text-to-video |
| Kling 2.6 Motion Control | (see docs) | https://docs.kie.ai/market/kling/motion-control |
| Kling 3.0 | (see docs) | https://docs.kie.ai/market/kling/kling-3.0 |
| Sora2 Text-to-Video | (see docs) | (market) |
| Sora2 Image-to-Video | (see docs) | (market) |
| Sora2 Characters Pro | (see docs) | https://docs.kie.ai/market/sora2/sora-2-characters-pro |
| Wan 2.2 Image-to-Video Turbo | (see docs) | https://docs.kie.ai/market/wan/2-2-a14b-image-to-video-turbo |
| Wan 2.7 Video Edit | (see docs) | https://docs.kie.ai/market/wan/2-7-videoedit |
| Grok Imagine Image-to-Video | (see docs) | https://docs.kie.ai/market/grok-imagine/image-to-video |
| Hailuo Standard Text-to-Video | (see docs) | https://docs.kie.ai/market/hailuo/02-text-to-video-standard |
| Topaz Video Upscale | `topaz/video-upscale` | (market) |

### Audio / Text / LLM

| Model | Identifier | Docs |
|---|---|---|
| ElevenLabs (see section 17) | various | (market) |
| Infinitalk | (see docs) | (market) |
| GPT (LLM) | (see docs) | (market) |
| Claude (LLM) | (see docs) | (market) |
| Gemini (LLM) | (see docs) | (market) |

### Seedream 4.5 Edit (Detailed)

Image editing model from ByteDance. Uses the Market `createTask` endpoint with model `seedream/4.5-edit`.

**Capabilities:** Edit existing images based on text prompts (e.g., change materials, lighting, colors while preserving pose/composition).

**Input Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `prompt` | string | Yes | Text description of the desired edit. Max 3000 chars |
| `image_urls` | array | Yes | Array of input image URLs (upload via File Upload API first). Max 10MB per file. Accepts JPEG, PNG, WebP |
| `aspect_ratio` | string | Yes | Output aspect ratio: `1:1`, `4:3`, `3:4`, `16:9`, `9:16`, `2:3`, `3:2`, `21:9`. Default: `1:1` |
| `quality` | string | Yes | `basic` (2K output) or `high` (4K output). Default: `basic` |

**Example Request:**
```json
POST https://api.kie.ai/api/v1/jobs/createTask

{
  "model": "seedream/4.5-edit",
  "input": {
    "prompt": "Keep the model's pose and the flowing shape of the liquid dress unchanged. Change the clothing material from silver metal to completely transparent clear water (or glass).",
    "image_urls": ["https://your-uploaded-image-url.webp"],
    "aspect_ratio": "1:1",
    "quality": "basic"
  }
}
```

**Response:** Standard Market task response with `taskId`. Poll via `GET /api/v1/jobs/recordInfo?taskId=...` — result in `resultJson.resultUrls[]`.

**Docs:** https://docs.kie.ai/market/seedream/4.5-edit

---

## 20. Error Codes Reference

| Code | Meaning |
|---|---|
| 200 | Success (task created -- not completed) |
| 400 | Bad Request / Format Error |
| 401 | Unauthorized (invalid API key) |
| 402 | Insufficient Credits |
| 404 | Not Found |
| 405 | Rate limit exceeded (Suno lyrics) |
| 409 | Conflict (resource already exists) |
| 422 | Validation Error (parameter check failed) |
| 429 | Rate Limited |
| 430 | Call frequency too high (Suno) |
| 451 | Unauthorized -- failed to fetch referenced file |
| 455 | Service Unavailable (maintenance) |
| 500 | Server Error |
| 501 | Generation Failed |
| 505 | Feature Disabled |
| 550 | Connection Denied -- task rejected (full queue / source site issue) |

---

## 21. Full Documentation Sitemap

### Getting Started
- https://docs.kie.ai (Getting Started -- Important)
- https://docs.kie.ai/index (API Documentation Index)

### Veo 3.1 API
- https://docs.kie.ai/veo3-api/quickstart
- https://docs.kie.ai/veo3-api/veo-3-api
- https://docs.kie.ai/veo3-api/generate-veo-3-video
- https://docs.kie.ai/veo3-api/generate-veo-3-video-callbacks
- https://docs.kie.ai/veo3-api/get-veo-3-video-details
- https://docs.kie.ai/veo3-api/get-veo-3-1080-p-video
- https://docs.kie.ai/veo3-api/get-veo-3-4k-video
- https://docs.kie.ai/veo3-api/extend-video

### Runway API
- https://docs.kie.ai/runway-api/quickstart
- https://docs.kie.ai/runway-api/runway-api
- https://docs.kie.ai/runway-api/generate-ai-video
- https://docs.kie.ai/runway-api/generate-ai-video-callbacks
- https://docs.kie.ai/runway-api/get-ai-video-details
- https://docs.kie.ai/runway-api/extend-ai-video
- https://docs.kie.ai/runway-api/extend-ai-video-callbacks
- https://docs.kie.ai/runway-api/generate-aleph-video
- https://docs.kie.ai/runway-api/generate-aleph-video-callbacks
- https://docs.kie.ai/runway-api/get-aleph-video-details

### Luma API
- https://docs.kie.ai/luma-api/quickstart
- https://docs.kie.ai/luma-api/get-luma-modify-details

### Suno API
- https://docs.kie.ai/suno-api/quickstart
- https://docs.kie.ai/suno-api/generate-music
- https://docs.kie.ai/suno-api/extend-music
- https://docs.kie.ai/suno-api/extend-music-callbacks
- https://docs.kie.ai/suno-api/upload-and-cover-audio
- https://docs.kie.ai/suno-api/upload-and-extend-audio
- https://docs.kie.ai/suno-api/upload-and-extend-audio-callbacks
- https://docs.kie.ai/suno-api/add-instrumental
- https://docs.kie.ai/suno-api/add-instrumental-callbacks
- https://docs.kie.ai/suno-api/add-vocals
- https://docs.kie.ai/suno-api/generate-lyrics
- https://docs.kie.ai/suno-api/get-lyrics-details
- https://docs.kie.ai/suno-api/get-timestamped-lyrics
- https://docs.kie.ai/suno-api/generate-persona
- https://docs.kie.ai/suno-api/cover-suno
- https://docs.kie.ai/suno-api/vocal-removal
- https://docs.kie.ai/suno-api/separate-vocals
- https://docs.kie.ai/suno-api/generate-midi
- https://docs.kie.ai/suno-api/get-midi-details
- https://docs.kie.ai/suno-api/create-music-video
- https://docs.kie.ai/suno-api/get-music-details
- https://docs.kie.ai/suno-api/get-music-video-details

### 4o Image API
- https://docs.kie.ai/4o-image-api/quickstart
- https://docs.kie.ai/4o-image-api/generate-4-o-image
- https://docs.kie.ai/4o-image-api/get-4-o-image-details
- https://docs.kie.ai/4o-image-api/get-4-o-image-download-url

### Flux Kontext API
- https://docs.kie.ai/flux-kontext-api/quickstart
- https://docs.kie.ai/flux-kontext-api/flux-kontext-api
- https://docs.kie.ai/flux-kontext-api/generate-or-edit-image
- https://docs.kie.ai/flux-kontext-api/generate-or-edit-image-callbacks
- https://docs.kie.ai/flux-kontext-api/get-image-details

### File Upload API
- https://docs.kie.ai/file-upload-api/quickstart
- https://docs.kie.ai/file-upload-api/upload-file-base-64
- https://docs.kie.ai/file-upload-api/upload-file-stream
- https://docs.kie.ai/file-upload-api/upload-file-url

### Common API
- https://docs.kie.ai/common-api/quickstart
- https://docs.kie.ai/common-api/get-account-credits
- https://docs.kie.ai/common-api/download-url

### Market (Unified)
- https://docs.kie.ai/market/quickstart
- https://docs.kie.ai/market/common/get-task-detail

### Market -- Image Models
- https://docs.kie.ai/market/seedream/seedream
- https://docs.kie.ai/market/seedream/seedream-v4-text-to-image
- https://docs.kie.ai/market/seedream/seedream-v4-edit
- https://docs.kie.ai/market/seedream/4.5-text-to-image
- https://docs.kie.ai/market/seedream/4.5-edit
- https://docs.kie.ai/market/flux2/pro-text-to-image
- https://docs.kie.ai/market/flux2/pro-image-to-image
- https://docs.kie.ai/market/flux2/flex-image-to-image
- https://docs.kie.ai/market/google/nano-banana
- https://docs.kie.ai/market/google/pro-image-to-image
- https://docs.kie.ai/market/google/nano-banana-edit
- https://docs.kie.ai/market/grok-imagine/text-to-image
- https://docs.kie.ai/market/grok-imagine/image-to-image
- https://docs.kie.ai/market/grok-imagine/upscale
- https://docs.kie.ai/market/gpt-image/1.5-image-to-image
- https://docs.kie.ai/market/qwen/image-to-image

### Market -- Video Models
- https://docs.kie.ai/market/bytedance/seedance-1.5-pro
- https://docs.kie.ai/market/kling/text-to-video
- https://docs.kie.ai/market/kling/motion-control
- https://docs.kie.ai/market/kling/kling-3.0
- https://docs.kie.ai/market/sora2/sora-2-characters-pro
- https://docs.kie.ai/market/wan/2-2-a14b-image-to-video-turbo
- https://docs.kie.ai/market/wan/2-7-videoedit
- https://docs.kie.ai/market/grok-imagine/image-to-video
- https://docs.kie.ai/market/hailuo/02-text-to-video-standard

### Market -- Audio Models
- https://docs.kie.ai/market/elevenlabs/text-to-speech-turbo-2-5
- https://docs.kie.ai/market/elevenlabs/text-to-speech-multilingual-v2
- https://docs.kie.ai/market/elevenlabs/text-to-dialogue-v3
- https://docs.kie.ai/market/elevenlabs/speech-to-text
- https://docs.kie.ai/market/elevenlabs/sound-effect-v2

### LLMs.txt (machine-readable index)
- https://docs.kie.ai/llms.txt

### Chinese Documentation
- https://docs.kie.ai/cn/file-upload-api/quickstart
- https://docs.kie.ai/cn/market/google/nano-banana-edit

---

## Appendix: Python API Paths (from kie_api.py)

These are the verified paths used in the project's API client at `kie_api.py`:

```python
# Market
CREATE_TASK_PATH   = "/api/v1/jobs/createTask"
RECORD_INFO_PATH   = "/api/v1/jobs/recordInfo"
CREDITS_PATH       = "/api/v1/chat/credit"

# File Upload (base: https://kieai.redpandaai.co)
UPLOAD_STREAM_PATH = "/api/file-stream-upload"
UPLOAD_URL_PATH    = "/api/file-url-upload"

# Veo 3.1
VEO_GENERATE_PATH     = "/api/v1/veo/generate"
VEO_EXTEND_PATH       = "/api/v1/veo/extend"
VEO_1080P_PATH        = "/api/v1/veo/get-1080p-video"
VEO_4K_PATH           = "/api/v1/veo/get-4k-video"
VEO_RECORD_INFO_PATH  = "/api/v1/veo/record-info"

# Suno
SUNO_GENERATE       = "/api/v1/generate"
SUNO_LYRICS         = "/api/v1/lyrics"
SUNO_EXTEND         = "/api/v1/generate/extend"
SUNO_UPLOAD_COVER   = "/api/v1/generate/upload-cover"
SUNO_ADD_INSTRUMENT = "/api/v1/generate/add-instrumental"
SUNO_ADD_VOCALS     = "/api/v1/generate/add-vocals"
SUNO_VOCAL_REMOVAL  = "/api/v1/vocal-removal/generate"
SUNO_MUSIC_VIDEO    = "/api/v1/mp4/generate"
SUNO_WAV            = "/api/v1/wav/generate"
SUNO_TIMESTAMPED    = "/api/v1/generate/get-timestamped-lyrics"
SUNO_RECORD_INFO    = "/api/v1/generate/record-info"

# Runway
RUNWAY_GENERATE        = "/api/v1/runway/generate"
RUNWAY_EXTEND          = "/api/v1/runway/extend"
RUNWAY_RECORD_DETAIL   = "/api/v1/runway/record-detail"

# Runway Aleph
ALEPH_GENERATE         = "/api/v1/aleph/generate"
ALEPH_RECORD_INFO      = "/api/v1/aleph/record-info"

# Luma
LUMA_MODIFY_GENERATE   = "/api/v1/modify/generate"
LUMA_MODIFY_RECORD     = "/api/v1/modify/record-info"

# 4o Image
GPT4O_IMAGE_GENERATE   = "/api/v1/gpt4o-image/generate"
GPT4O_IMAGE_RECORD     = "/api/v1/gpt4o-image/record-info"
GPT4O_IMAGE_DOWNLOAD   = "/api/v1/gpt4o-image/download-url"

# Flux Kontext
FLUX_KONTEXT_GENERATE  = "/api/v1/flux/kontext/generate"
FLUX_KONTEXT_RECORD    = "/api/v1/flux/kontext/record-info"

# Common
COMMON_DOWNLOAD_URL    = "/api/v1/common/download-url"
```

---

*End of KIE API Reference Document.*
