# Market

> Explore and integrate cutting-edge AI models for image generation, video creation, and audio processing through unified APIs.

## Welcome to the Market

Access a comprehensive collection of state-of-the-art AI models through our unified API platform. Choose from the latest image generation, video creation, and audio models to power your applications.

## Image Models

Comprehensive collection of AI models for image generation, editing, and enhancement.

| Model | Description |
|-------|-------------|
| Seedream | Creative image generation with unique artistic styles (v4.0, v4.5) |
| Grok Imagine | High-quality photorealistic images, text-to-image, and upscaling |
| Flux-2 | Advanced text-to-image and image-to-image generation |
| Google Imagen | State-of-the-art image generation (Imagen4 Fast/Ultra) |
| Ideogram | Creative image generation with character consistency |
| Qwen | Multilingual image generation and editing |
| Recraft | Professional image upscaling and background removal |
| Topaz | AI-powered image enhancement and upscaling |

## Video Models

Advanced AI models for video creation, editing, and transformation from text and images.

| Model | Description |
|-------|-------------|
| Kling | High-quality video generation and AI avatars (v2.1, v2.5, v3.0) |
| Sora2 | State-of-the-art video generation from text and images |
| Bytedance | Fast and efficient video generation (v1 Pro/Lite) |
| Hailuo | High-quality video generation with multiple styles |
| Wan | Advanced video generation with turbo performance |
| Grok Imagine Video | Video generation from text and images |
| Gemini | Google's Gemini video generation models (2.5 Flash, 2.5 Pro) |

## Audio Models

AI-powered audio processing including speech synthesis, recognition, and effects.

| Model | Description |
|-------|-------------|
| ElevenLabs | High-quality text-to-speech, speech-to-text, and audio isolation |
| Infinitalk | Advanced audio processing and speech analysis |

## Chat Models

Advanced conversational AI models for natural language understanding and generation.

| Model | Description |
|-------|-------------|
| Gemini 2.5 Flash | Fast chat completions with optional reasoning and structured outputs |
| Gemini 2.5 Pro | Advanced reasoning and long-context chat for complex prompts |

## Getting Started

1. **Choose Your Model**: Select the AI model that best fits your use case from the categories above.
2. **Get API Key**: Visit the [API Key Management Page](https://kie.ai/api-key) to obtain your API credentials.
3. **Integrate**: Follow the model-specific documentation to integrate the API into your application.
4. **Start Creating**: Begin generating content using your chosen AI model through simple API calls.

## Authentication

All models in the market use the same authentication method:

```bash
Authorization: Bearer YOUR_API_KEY
```

> **Warning:** Keep your API key secure. Never expose it in client-side code or public repositories.

## Unified API Structure

All models follow a consistent API structure for ease of integration:

### Create Task

```bash
POST https://api.kie.ai/api/v1/jobs/createTask
```

### Query Task Status

```bash
GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId={taskId}
```

### Callback Notifications

Optional webhook callbacks notify you when tasks complete, eliminating the need for polling.

> **Tip:** Each model has unique parameters and capabilities. Refer to individual model documentation for detailed specifications.

## Credits and Pricing

Different models consume different amounts of credits based on their computational requirements:

* **Image Models**: Typically 10-50 credits per generation
* **Video Models**: Typically 100-500 credits per generation
* **Language Models**: Charged per token usage

Check your remaining credits:

```bash
GET https://api.kie.ai/api/v1/chat/credit
```

## Support

Need help choosing the right model or integrating our APIs?

* Email: [support@kie.ai](mailto:support@kie.ai)
* Documentation: Browse model-specific guides in the navigation
* Community: Join our Discord server for discussions and updates
