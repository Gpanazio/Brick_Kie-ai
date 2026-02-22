/**
 * KIE AI Studio — Application Logic v3
 * Full model parameter configuration from KIE docs.
 */

const API = '/kie-ai';

// ==================== MODEL PARAMETER REGISTRY ====================
// Each model defines its 'params' — array of { key, label, type, options, default, min, max, step }
// 'cost' is the estimated credits per generation (from KIE API docs)

// Credit cost estimates (1 credit ≈ $0.005 USD)
const MODEL_COST_ESTIMATES = {
    // ── Image ──
    'nano-banana-pro': 18,                // 1/2K = 18, 4K = 24
    'nano-banana-v2': 18,                 // experimental v2 design
    'google/nano-banana-edit': 4,          // image editing
    'bytedance/4.5-text-to-image': 10,    // estimated
    'seedream/4.5-edit': 10,              // estimated (image editing)
    'flux-2/pro-text-to-image': 5,        // 1K = 5, 2K = 7
    'google/imagen4': 10,                 // estimated
    'ideogram/v3-text-to-image': 10,      // v3 = 10, v3 pro = 20
    'qwen/text-to-image': 4,             // qwen image = 4
    'grok-imagine/text-to-image': 4,     // 4 cr/image
    'grok-imagine/image-to-image': 4,    // 4 cr/image
    'gpt4o-image': 30,                   // ~30 cr/image
    'flux-kontext-pro': 10,              // ~10 cr/image
    'flux-kontext-max': 20,              // ~20 cr/image
    // ── Image Tools ──
    'recraft/remove-background': 10,
    'recraft/crisp-upscale': 15,
    'topaz/image-upscale': 10,
    'ideogram/v3-reframe': 15,
    'topaz/video-upscale': 100,
    // ── Video (costs vary by duration/resolution, showing default config) ──
    'sora-2-pro-text-to-video': 35,       // standard-10s = 30, stable-10s = 35
    'sora-2-pro-image-to-video': 35,      // standard-10s = 30, stable-10s = 35
    'kling-3.0/video': 40,                // 40/s 1080p w/ audio, 27/s without
    'wan/2-2-a14b-text-to-video-turbo': 40,  // 5s 480p = 40
    'grok-imagine/text-to-video': 10,     // 6s 480p = 10, 10s 720p = 30
    'grok-imagine/image-to-video': 10,    // 6s 480p = 10, 10s 720p = 30
    'hailuo/2-3-image-to-video-pro': 30,  // 6s 768p = 30, 6s 1080p pro = 80
    // ── Audio (ElevenLabs) ──
    'elevenlabs/text-to-speech-turbo-2-5': 6,   // 6 cr / 1000 chars
    'elevenlabs/text-to-dialogue-v3': 14,       // 14 cr / 1000 chars
    'elevenlabs/sound-effect-v2': 5,            // 0.24 cr/s ≈ ~5 for typical
    'elevenlabs/speech-to-text': 4,             // 3.5 cr/min
    'elevenlabs/audio-isolation': 1,            // 0.1 cr/s
    // ── Music / Suno ──
    'suno/generate-music': 12,            // mashup = 12
    'suno/generate-lyrics': 1,            // 0.4 cr/request ≈ ~1
    'suno/edit-audio': 12,                // extend/instrumental/vocals/separate
    'suno/utilities': 2,                  // music-video/convert-wav/get-lyrics
    // ── Veo 3.1 (Google) ──
    'veo3/text-to-video': 60,             // Base display cost 
    'veo3/image-to-video': 80,            // Base display cost
    'veo3/text-to-video-fast': 60,        // 60 cr/video
    'veo3/text-to-video-quality': 250,    // 250 cr/video
    'veo3/image-to-video-fast': 80,       // 80 cr/video
    'veo3/image-to-video-quality': 250,   // 250 cr/video
    'veo3/extend-fast': 60,               // 60 cr/video
    'veo3/extend-quality': 250,           // 250 cr/video
    'veo3/get-1080p': 5,                  // 5 cr/video
    'veo3/get-4k': 120,                   // 120 cr/video
    // ── MJ ──
    'mj': 8,                              // relaxed=3, fast=8, turbo=16
    'mj-txt': 8,                          // relaxed=3, fast=8, turbo=16
    'mj-img': 8,                          // relaxed=3, fast=8, turbo=16
    'mj-video': 16,                       // video = turbo only
    'mj-ref': 8,                          // relaxed=3, fast=8, turbo=16
};

// ==================== BRAND SVG LOGOS ====================
// Used to override HTML data-icons directly for crisp rendering
const BRAND_LOGOS = {
    'kie.ai': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg>`,
    'bytedance': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M19 12h-3c-1.1 0-2-.9-2-2V7c0-1.1-.9-2-2-2S10 5.9 10 7v3c0 1.1-.9 2-2 2H5c-1.1 0-2 .9-2 2s.9 2 2 2h3c1.1 0 2 .9 2 2v3c0 1.1.9 2 2 2s2-.9 2-2v-3c0-1.1.9-2 2-2h3c1.1 0 2-.9 2-2s-.9-2-2-2z" fill="currentColor"/></svg>`,
    'flux.2': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M5 5h14v3H9v3h8v3H9v5H5V5z" fill="currentColor"/></svg>`,
    'ideogram': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M7 4h2v16H7zm8 0h2v16h-2zm-4 4h2v8h-2z" fill="currentColor"/></svg>`,
    'qwen': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" fill="currentColor"/></svg>`,
    'openai': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10zM12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8zm-2 12h4v1h-4zm0-3h4v1h-4zm0-3h4v1h-4z" fill="currentColor"/></svg>`,
    'kling': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13z" fill="currentColor"/></svg>`,
    'wan': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M5 5l4 14 3-8 3 8 4-14h-2.5l-2.5 9-3-8-3 8-2.5-9z" fill="currentColor"/></svg>`,
    'xai': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M4 4l6 8-6 8h3l4.5-6L16 20h3l-6-8 6-8h-3l-4.5 6L7 4z" fill="currentColor"/></svg>`,
    'hailuo': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-11.5v7l6-3.5z" fill="currentColor"/></svg>`,
    'elevenlabs': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M6 10v4M10 6v12M14 8v8M18 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    'infini': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`,
    'suno': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10S22 17.52 22 12c0-.34-.02-.67-.06-1h-2.02c.05.33.08.66.08 1 0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8c1.69 0 3.24.53 4.54 1.44l1.52-1.25A9.95 9.95 0 0012 2zm7 3l-1.5 3L13 9l4.5 1.5L19 15l1.5-4.5L25 9l-4.5-1.5z" fill="currentColor"/></svg>`,
    'recraft': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M6 6h12v12H6z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`,
    'topaz': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2l-6 10h12zM5 14l7 8 7-8z" fill="currentColor"/></svg>`,
    'midjourney': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 3C10 7 6 11 4 13c2 0 5 .5 7 2V3zm0 0c2 4 6 8 8 10-2 0-5 .5-7 2V3z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 19c3-2 6-3 9-3s6 1 9 3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M5 21c2.5-1 5-1.5 7-1.5s4.5.5 7 1.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`
};

// Per-model prompt character limits (from KIE API docs)
const PROMPT_CHAR_LIMITS = {
    'grok-imagine/text-to-video': 5000,
    'grok-imagine/image-to-video': 5000,
    'kling-3.0/video': 2500,
    'sora-2-pro-text-to-video': 4000,
    'wan/2-2-a14b-text-to-video-turbo': 2000,
    'hailuo/2-3-image-to-video-pro': 2000,
    'nano-banana-pro': 2000,
    'nano-banana-v2': 2000,
    'google/nano-banana-edit': 5000,
    'grok-imagine/text-to-image': 5000,
    'grok-imagine/image-to-image': 5000,
    'gpt4o-image': 5000,
    'flux-kontext-pro': 5000,
    'flux-kontext-max': 5000,
    'bytedance/4.5-text-to-image': 2000,
    'seedream/4.5-edit': 3000,
    'flux-2/pro-text-to-image': 2000,
    'google/imagen4': 2000,
    'ideogram/v3-text-to-image': 2000,
    'qwen/text-to-image': 2000,
    'elevenlabs/text-to-speech-turbo-2-5': 5000,
    'elevenlabs/text-to-dialogue-v3': 5000,
    'elevenlabs/sound-effect-v2': 5000,
    'sora-2-pro-image-to-video': 4000,
    'suno/generate-music': 3000,
    'suno/generate-lyrics': 3000,
    'suno/edit-audio': 3000,
    'suno/utilities': 200,
    'veo3/text-to-video': 5000,
    'veo3/image-to-video': 5000,
    'veo3/text-to-video-fast': 5000,
    'veo3/text-to-video-quality': 5000,
    'veo3/image-to-video-fast': 5000,
    'veo3/image-to-video-quality': 5000,
    'veo3/extend-fast': 5000,
    'veo3/extend-quality': 5000,
};

function getModelCost(model) {
    return MODEL_COST_ESTIMATES[model] || null;
}

function costColorClass(cost) {
    if (cost <= 10) return 'cost-low';
    if (cost <= 35) return 'cost-mid';
    return 'cost-high';
}

function updateCostBadge(el, cost, baseClass, suffix) {
    if (!el) return;
    if (typeof cost === 'number' && cost) {
        el.textContent = `~${cost} ${suffix}`;
        el.className = `${baseClass} ${costColorClass(cost)}`;
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

const MODEL_CONFIGS = {
    // ──── IMAGE MODELS ────
    'nano-banana-pro': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9', 'auto'], default: '1:1' },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['1K', '2K', '4K'], default: '1K' },
            { key: 'output_format', label: 'Formato', type: 'select', options: ['png', 'jpg'], default: 'png' },
        ]
    },
    'nano-banana-v2': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9', 'auto'], default: '1:1' },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['1K', '2K', '4K'], default: '1K' },
            { key: 'output_format', label: 'Formato', type: 'select', options: ['png', 'jpg'], default: 'png' },
        ]
    },
    'google/nano-banana-edit': {
        params: [
            { key: 'image_size', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9', 'auto'], default: '1:1' },
            { key: 'output_format', label: 'Formato', type: 'select', options: ['png', 'jpeg'], default: 'png' },
        ]
    },
    'grok-imagine/text-to-image': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '2:3', '3:2', '16:9', '9:16'], default: '1:1' },
        ]
    },
    'grok-imagine/image-to-image': {
        params: []
    },
    'gpt4o-image': {
        params: [
            { key: 'size', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '16:9', '9:16', '4:3', '3:4'], default: '1:1' },
            { key: 'nVariants', label: 'Variantes', type: 'select', options: ['1', '2', '3', '4'], default: '1' },
            { key: 'isEnhance', label: 'Enhance Prompt', type: 'bool', default: false },
        ]
    },
    'flux-kontext-pro': {
        params: [
            { key: 'aspectRatio', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'], default: '1:1' },
            { key: 'outputFormat', label: 'Formato', type: 'select', options: ['jpeg', 'png'], default: 'jpeg' },
            { key: 'promptUpsampling', label: 'Prompt Upsampling', type: 'bool', default: false },
            { key: 'safetyTolerance', label: 'Safety Tolerance', type: 'number', default: 2, min: 0, max: 6, step: 1 },
        ]
    },
    'flux-kontext-max': {
        params: [
            { key: 'aspectRatio', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'], default: '1:1' },
            { key: 'outputFormat', label: 'Formato', type: 'select', options: ['jpeg', 'png'], default: 'jpeg' },
            { key: 'promptUpsampling', label: 'Prompt Upsampling', type: 'bool', default: false },
            { key: 'safetyTolerance', label: 'Safety Tolerance', type: 'number', default: 2, min: 0, max: 6, step: 1 },
        ]
    },
    'bytedance/4.5-text-to-image': {
        params: [
            { key: 'image_size', label: 'Tamanho', type: 'select', options: ['square_hd', 'square', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9'], default: 'square_hd' },
            { key: 'guidance_scale', label: 'Guidance', type: 'number', default: 2.5, min: 1, max: 20, step: 0.5 },
            { key: 'enable_safety_checker', label: 'Safety', type: 'bool', default: true },
        ]
    },
    'seedream/4.5-edit': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'], default: '1:1' },
            { key: 'quality', label: 'Qualidade', type: 'select', options: ['basic', 'high'], default: 'basic' },
        ]
    },
    'flux-2/pro-text-to-image': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'], default: '1:1' },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['1K', '2K'], default: '1K' },
        ]
    },
    'google/imagen4': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'], default: '1:1' },
            { key: 'negative_prompt', label: 'Prompt Negativo', type: 'text', default: '' },
            { key: 'seed', label: 'Seed', type: 'text', default: '' },
        ]
    },
    'ideogram/v3-text-to-image': {
        params: [
            { key: 'rendering_speed', label: 'Speed', type: 'select', options: ['BALANCED', 'TURBO', 'QUALITY'], default: 'BALANCED' },
            { key: 'style', label: 'Estilo', type: 'select', options: ['AUTO', 'GENERAL', 'REALISTIC', 'DESIGN', 'RENDER_3D', 'ANIME'], default: 'AUTO' },
            { key: 'image_size', label: 'Tamanho', type: 'select', options: ['square_hd', 'landscape_4_3', 'landscape_16_9', 'portrait_4_3', 'portrait_16_9'], default: 'square_hd' },
            { key: 'num_images', label: 'Quantidade', type: 'select', options: ['1', '2', '3', '4'], default: '1' },
            { key: 'expand_prompt', label: 'Expand Prompt', type: 'bool', default: true },
            { key: 'negative_prompt', label: 'Prompt Negativo', type: 'text', default: '' },
        ]
    },
    'qwen/text-to-image': {
        params: [
            { key: 'image_size', label: 'Tamanho', type: 'select', options: ['square_hd', 'square', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9'], default: 'square_hd' },
            { key: 'num_inference_steps', label: 'Steps', type: 'number', default: 30, min: 1, max: 50, step: 1 },
            { key: 'guidance_scale', label: 'Guidance', type: 'number', default: 2.5, min: 1, max: 20, step: 0.5 },
            { key: 'output_format', label: 'Formato', type: 'select', options: ['png', 'jpeg', 'webp'], default: 'png' },
            { key: 'negative_prompt', label: 'Prompt Negativo', type: 'text', default: '' },
            { key: 'enable_safety_checker', label: 'Safety', type: 'bool', default: true },
            { key: 'acceleration', label: 'Aceleração', type: 'select', options: ['none'], default: 'none' },
        ]
    },

    // ──── IMAGE TOOLS ────
    'recraft/remove-background': { params: [] },
    'recraft/crisp-upscale': { params: [] },
    'topaz/image-upscale': {
        params: [
            { key: 'upscale_factor', label: 'Fator de Upscale', type: 'select', options: ['2', '4'], default: '2' },
        ]
    },
    'ideogram/v3-reframe': {
        params: [
            { key: 'image_size', label: 'Tamanho', type: 'select', options: ['square', 'square_hd', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9'], default: 'square_hd' },
            { key: 'rendering_speed', label: 'Velocidade', type: 'select', options: ['TURBO', 'BALANCED', 'QUALITY'], default: 'BALANCED' },
            { key: 'style', label: 'Estilo', type: 'select', options: ['AUTO', 'GENERAL', 'REALISTIC', 'DESIGN'], default: 'AUTO' },
            { key: 'num_images', label: 'Qtd. Imagens', type: 'select', options: ['1', '2', '3', '4'], default: '1' },
            { key: 'seed', label: 'Seed (0 = Random)', type: 'number_input', default: '0' }
        ]
    },
    'topaz/video-upscale': {
        params: [
            { key: 'upscale_factor', label: 'Fator de Upscale', type: 'radio', options: ['1', '2', '4'], default: '2' },
        ]
    },

    // ──── VIDEO MODELS ────
    'sora-2-pro-text-to-video': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['landscape', 'portrait'], default: 'landscape' },
            { key: 'n_frames', label: 'Frames', type: 'select', options: ['10', '15'], default: '10' },
            { key: 'size', label: 'Qualidade', type: 'select', options: ['standard', 'high'], default: 'high' },
            { key: 'remove_watermark', label: 'Sem Watermark', type: 'bool', default: true },
            { key: 'upload_method', label: 'Upload Method', type: 'select', options: ['s3', 'oss'], default: 's3' },
        ]
    },
    'kling-3.0/video': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '16:9', '9:16'], default: '16:9' },
            { key: 'duration', label: 'Duração (s)', type: 'select', options: ['3', '5', '10', '15'], default: '5' },
            { key: 'mode', label: 'Modo', type: 'select', options: ['std', 'pro'], default: 'pro' },
            { key: 'sound', label: 'Som', type: 'bool', default: true },
            { key: 'multi_shots', label: 'Multi-Shot', type: 'bool', default: false },
            { key: 'negative_prompt', label: 'Prompt Negativo', type: 'text', default: '' },
        ]
    },
    'wan/2-2-a14b-text-to-video-turbo': {
        params: [
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['480p', '720p'], default: '720p' },
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '16:9', '9:16', '4:3', '3:4'], default: '16:9' },
            { key: 'enable_prompt_expansion', label: 'Expand Prompt', type: 'bool', default: false },
            { key: 'seed', label: 'Seed', type: 'number', default: 0, min: 0, max: 99999, step: 1 },
            { key: 'acceleration', label: 'Aceleração', type: 'select', options: ['none'], default: 'none' },
        ]
    },
    'grok-imagine/text-to-video': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'radio', options: ['1:1', '16:9', '9:16', '2:3', '3:2', '4:3', '3:4'], default: '16:9' },
            { key: 'mode', label: 'Modo', type: 'select', options: ['fun', 'normal', 'spicy'], default: 'normal' },
            { key: 'duration', label: 'Duração (s)', type: 'select', options: ['6', '10'], default: '6' },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['480p', '720p'], default: '480p' },
        ]
    },
    'grok-imagine/image-to-video': {
        params: [
            { key: 'mode', label: 'Modo', type: 'select', options: ['fun', 'normal', 'spicy'], default: 'normal' },
            { key: 'duration', label: 'Duração (s)', type: 'select', options: ['6', '10'], default: '6' },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['480p', '720p'], default: '480p' },
        ]
    },
    'sora-2-pro-image-to-video': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['landscape', 'portrait'], default: 'landscape' },
            { key: 'n_frames', label: 'Frames', type: 'select', options: ['10', '15'], default: '10' },
            { key: 'size', label: 'Qualidade', type: 'select', options: ['standard', 'high'], default: 'standard' },
            { key: 'remove_watermark', label: 'Sem Watermark', type: 'bool', default: true },
            { key: 'upload_method', label: 'Upload Method', type: 'select', options: ['s3', 'oss'], default: 's3' },
        ]
    },
    'hailuo/2-3-image-to-video-pro': {
        params: [
            { key: 'duration', label: 'Duração (s)', type: 'select', options: ['4', '6'], default: '6' },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['480P', '768P', '1080P'], default: '768P' },
        ]
    },

    // ──── AUDIO ────
    'elevenlabs/text-to-speech-turbo-2-5': {
        params: [
            { key: 'voice', label: 'Voz', type: 'select', options: ['Rachel', 'Domi', 'Bella', 'Antoni', 'Elli', 'Josh', 'Arnold', 'Adam', 'Sam', 'Glinda', 'Clyde', 'Dorothy', 'Fin', 'Gigi', 'Charlotte', 'Daniel', 'Callum', 'Charlie', 'Emily', 'Lily'], default: 'Rachel' },
            { key: 'stability', label: 'Estabilidade', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05 },
            { key: 'similarity_boost', label: 'Similaridade', type: 'number', default: 0.75, min: 0, max: 1, step: 0.05 },
            { key: 'style', label: 'Estilo', type: 'number', default: 0, min: 0, max: 1, step: 0.05 },
            { key: 'speed', label: 'Velocidade', type: 'number', default: 1, min: 0.5, max: 2, step: 0.1 },
            { key: 'timestamps', label: 'Timestamps', type: 'bool', default: false },
            { key: 'previous_text', label: 'Texto Anterior', type: 'text', default: '' },
            { key: 'next_text', label: 'Texto Seguinte', type: 'text', default: '' },
            { key: 'language_code', label: 'Idioma', type: 'select', options: ['', 'en', 'pt', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh'], default: '' },
        ]
    },
    // ──── ELEVENLABS / AUDIO ────
    'elevenlabs/text-to-dialogue-v3': {
        params: [
            { key: 'stability', label: 'Estabilidade da Voz', type: 'radio', options: ['0', '0.5', '1'], default: '0.5' },
        ]
    },
    'elevenlabs/sound-effect-v2': {
        params: [
            { key: 'duration_seconds', label: 'Duração (s)', type: 'number', min: 0.5, max: 22, step: 0.5, default: 5 },
            { key: 'prompt_influence', label: 'Fidelidade ao Prompt', type: 'number', min: 0, max: 1, step: 0.01, default: 0.3 },
            { key: 'loop', label: 'Loop Contínuo', type: 'bool', default: false },
        ]
    },
    'elevenlabs/speech-to-text': {
        params: [
            { key: 'tag_audio_events', label: 'Detectar Eventos', type: 'bool', default: true },
            { key: 'diarize', label: 'Identificar Falantes', type: 'bool', default: true },
        ]
    },
    'elevenlabs/audio-isolation': { params: [] },

    // ──── SUNO / MUSIC ────
    'suno/generate-music': {
        params: [
            { key: 'model', label: 'Modelo Suno', type: 'select', options: ['V3_5', 'V4', 'V4_5', 'V4_5PLUS', 'V5'], default: 'V4_5' },
            { key: 'custom_mode', label: 'Modo Avançado', type: 'bool', default: false },
            { key: 'style', label: 'Estilo Musical', type: 'text', default: '' },
            { key: 'title', label: 'Título', type: 'text', default: '' },
            { key: 'instrumental', label: 'Só Instrumental', type: 'bool', default: false },
        ]
    },
    'suno/generate-lyrics': { params: [] },
    'suno/edit-audio': {
        params: [
            { key: 'suno_action', label: 'Ação', type: 'select', options: ['Extend Music', 'Add Instrumental', 'Add Vocals', 'Separate Vocals'], default: 'Extend Music' },
            { key: 'audioId', label: 'Audio ID (da geração anterior)', type: 'text', default: '' },
            { key: 'taskId', label: 'Task ID (da geração anterior)', type: 'text', default: '' },
            { key: 'style', label: 'Estilo Musical', type: 'text', default: '' },
            { key: 'title', label: 'Título', type: 'text', default: '' },
            { key: 'continueAt', label: 'Continuar em (segundos)', type: 'number', min: 0, max: 600, step: 1, default: 0 },
            { key: 'tags', label: 'Tags / Gênero', type: 'text', default: '' },
            { key: 'negativeTags', label: 'Tags Negativas', type: 'text', default: '' },
            { key: 'type', label: 'Tipo de Separação', type: 'radio', options: ['vocals', 'instrumental', 'both'], default: 'both' },
        ]
    },
    'suno/utilities': {
        params: [
            { key: 'suno_action', label: 'Ação', type: 'select', options: ['Music Video', 'Convert WAV', 'Get Lyrics'], default: 'Music Video' },
            { key: 'taskId', label: 'Task ID (da geração anterior)', type: 'text', default: '' },
            { key: 'audioId', label: 'Audio ID', type: 'text', default: '' },
            { key: 'author', label: 'Autor (opcional)', type: 'text', default: '' },
        ]
    },

    // ──── VEO 3.1 (Google) ────
    'veo3/text-to-video': {
        params: [
            { key: 'quality', label: 'Quality', type: 'radio', options: ['Fast', 'Quality'], default: 'Fast' },
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'radio', options: ['16:9', '9:16'], default: '16:9' },
        ]
    },
    'veo3/image-to-video': {
        params: [
            { key: 'quality', label: 'Quality', type: 'radio', options: ['Fast', 'Quality'], default: 'Fast' },
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'radio', options: ['16:9', '9:16'], default: '16:9' },
        ]
    },
    'veo3/extend-fast': {
        params: [
            { key: 'taskId', label: 'Task ID (do vídeo original)', type: 'text', default: '' },
        ]
    },
    'veo3/extend-quality': {
        params: [
            { key: 'taskId', label: 'Task ID (do vídeo original)', type: 'text', default: '' },
        ]
    },
    'veo3/get-1080p': {
        params: [
            { key: 'taskId', label: 'Task ID (do vídeo gerado)', type: 'text', default: '' },
        ]
    },
    'veo3/get-4k': {
        params: [
            { key: 'taskId', label: 'Task ID (do vídeo gerado)', type: 'text', default: '' },
        ]
    },
};

// ==================== Batch Upload Support ====================
const BATCH_MODELS = new Set([
    'topaz/image-upscale',
    'topaz/video-upscale',
    'recraft/crisp-upscale',
]);

function isBatchModel(model) {
    return model && BATCH_MODELS.has(model);
}

// ==================== State ====================

let selectedModel = null;
let selectedFile = null;
let selectedFiles = []; // For batch upload
let currentCatLabel = '';
let currentCat = ''; // Store the current internal category ID
let tasks = [];

// ==================== Pending Tasks (localStorage) ====================
const PENDING_KEY = 'kie-pending-tasks';

function loadPendingTasks() {
    try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }
    catch (e) { console.error('Pending tasks load error:', e); return []; }
}

function savePendingTasks(pending) {
    try { localStorage.setItem(PENDING_KEY, JSON.stringify(pending)); }
    catch (e) { console.error('Pending tasks save error:', e); }
}

function addPendingTask(task) {
    // Re-read from localStorage to get latest state (minimise cross-tab race window)
    const pending = loadPendingTasks();
    if (pending.some(p => p.id === task.id)) return;
    pending.push({
        id: task.id,
        model: task.model,
        mode: task.mode,
        cat: task.cat,
        _prompt: task._prompt || '',
        _inputFileUrl: task._inputFileUrl || null,
        _extraParams: task._extraParams || null,
        createdAt: Date.now()
    });
    savePendingTasks(pending);
}

function removePendingTask(taskId) {
    // Re-read from localStorage to get latest state (minimise cross-tab race window)
    const pending = loadPendingTasks().filter(p => p.id !== taskId);
    savePendingTasks(pending);
}

function clearAllPendingTasks() {
    localStorage.removeItem(PENDING_KEY);
}

// Stop all active polling timers
function stopAllPolling() {
    tasks.forEach(t => { if (t.pollTimer) clearInterval(t.pollTimer); });
}

// Stop all polling, clear the local tasks array, and remove task cards from the DOM
function clearLocalTasks() {
    stopAllPolling();
    tasks = [];
    els.tasksList.querySelectorAll('.task-card').forEach(el => el.remove());
    updateTasksEmpty();
    updateActiveCount();
}

// Sync pending-task state when another tab mutates localStorage
window.addEventListener('storage', (e) => {
    if (e.key !== PENDING_KEY) return;

    // Handle clearAllPendingTasks() from another tab (localStorage.removeItem)
    if (e.newValue === null) {
        clearLocalTasks();
        return;
    }

    const updated = loadPendingTasks();
    // Reconcile: start polling for tasks that exist in storage but not locally
    updated.forEach(p => {
        if (tasks.some(t => t.id === p.id)) return;
        const task = {
            id: p.id, model: p.model, mode: p.mode, cat: p.cat,
            state: 'processing', data: null, pollTimer: null,
            _prompt: p._prompt || '', _inputFileUrl: p._inputFileUrl || null,
            _extraParams: p._extraParams || null
        };
        tasks.unshift(task);
        renderTaskCard(task);
        startPolling(task);
    });
    updateTasksEmpty();
    updateActiveCount();
});

// ==================== History (localStorage) ====================
const HISTORY_KEY = 'kie-history';
const HISTORY_MAX = 200;

function loadHistory() {
    try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        let migrated = false;
        history.forEach(h => {
            if (!h.cat && h.model) {
                const tpl = document.getElementById('tpl-models');
                if (tpl) {
                    try {
                        const item = tpl.content.querySelector(`[data-model="${h.model}"]`);
                        if (item && item.dataset.cat) {
                            h.cat = item.dataset.cat;
                            migrated = true;
                        }
                    } catch (e) { }
                }
                if (!h.cat && h.model.startsWith('mj-')) {
                    h.cat = 'mj';
                    migrated = true;
                }
            }
        });
        if (migrated) {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_MAX)));
        }
        return history;
    } catch { return []; }
}

function saveHistory(history) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_MAX))); }
    catch (e) { console.error('History save error:', e); }
}

// Shared helper: extract all result URLs from any API response shape
function _extractResultUrls(data) {
    const urls = [];
    // Market / generic fields
    if (typeof data.output === 'string') urls.push(data.output);
    if (data.resultUrl) urls.push(data.resultUrl);
    if (data.downloadUrl) urls.push(data.downloadUrl);
    if (Array.isArray(data.resultUrls)) urls.push(...data.resultUrls);
    if (Array.isArray(data.output)) urls.push(...data.output);

    // resultJson as string (Market sometimes)
    if (typeof data.resultJson === 'string' && data.resultJson) {
        try {
            const parsed = JSON.parse(data.resultJson);
            if (Array.isArray(parsed.resultUrls)) urls.push(...parsed.resultUrls);
            if (parsed.resultUrl) urls.push(parsed.resultUrl);
            if (parsed.resultObject?.url) urls.push(parsed.resultObject.url);
        } catch { }
    } else if (data._parsedResult) {
        if (Array.isArray(data._parsedResult.resultUrls)) urls.push(...data._parsedResult.resultUrls);
        if (data._parsedResult.resultUrl) urls.push(data._parsedResult.resultUrl);
    }

    // Midjourney: resultInfoJson is an object with resultUrls array of {resultUrl: "..."}
    if (data.resultInfoJson && typeof data.resultInfoJson === 'object') {
        const rij = data.resultInfoJson;
        if (Array.isArray(rij.resultUrls)) {
            rij.resultUrls.forEach(item => {
                if (typeof item === 'string') urls.push(item);
                else if (item?.resultUrl) urls.push(item.resultUrl);
            });
        }
        if (rij.resultUrl) urls.push(rij.resultUrl);
    }

    // Suno: response.sunoData[] with audioUrl
    if (data.response && Array.isArray(data.response.sunoData)) {
        data.response.sunoData.forEach(track => {
            if (track.audioUrl) urls.push(track.audioUrl);
            if (track.sourceAudioUrl && track.sourceAudioUrl !== track.audioUrl) urls.push(track.sourceAudioUrl);
        });
    }
    return urls;
}

function addToHistory(task) {
    const data = task.data?.data || {};
    // Collect URLs
    const urls = _extractResultUrls(data);
    const uniqueUrls = [...new Set(urls.filter(u => typeof u === 'string' && u.startsWith('http')))];
    if (uniqueUrls.length === 0 && task.state !== 'success') return; // Don't save failed tasks with no output

    const entry = {
        id: task.id,
        model: task.model,
        state: task.state,
        cat: task.cat || currentCat, // Store internal category id
        urls: uniqueUrls,
        prompt: task._prompt || '',
        inputFileUrl: task._inputFileUrl || null,
        extraParams: task._extraParams || null,
        timestamp: Date.now(),
        costTime: data.costTime || null,
        // Suno cover art for thumbnail display
        coverUrl: data.response?.sunoData?.[0]?.imageUrl || null,
        trackTitle: data.response?.sunoData?.[0]?.title || null,
        sunoData: data.response?.sunoData || null,
    };

    const history = loadHistory();
    // Avoid duplicates
    const idx = history.findIndex(h => h.id === entry.id);
    if (idx >= 0) history.splice(idx, 1);
    history.unshift(entry);
    saveHistory(history);
    renderHistoryGallery();
    updateHistoryCount();
}

// ==================== DOM ====================

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const els = {
    creditsBtn: $('#btn-credits'),
    creditsDisplay: $('#credits-display'),
    lobby: $('#lobby'),
    appMain: $('#app-main'),
    headerBreadcrumb: $('#header-breadcrumb'),
    workspaceCatLabel: $('#workspace-cat-label'),
    btnBackLobby: $('#btn-back-lobby'),

    // Model picker trigger
    btnModelPicker: $('#btn-model-picker'),
    mptIcon: $('#mpt-icon'),
    mptName: $('#mpt-name'),
    mptCost: $('#mpt-cost'),
    // Model picker modal
    modalModelPicker: $('#modal-model-picker'),
    mpmBackdrop: $('#mpm-backdrop'),
    mpmClose: $('#mpm-close'),
    mpmGrid: $('#mpm-grid'),
    mpmSubtitle: $('#mpm-subtitle'),
    // Config / params (now inline in left panel)
    configPanel: $('#config-panel'),
    configParams: $('#config-model-params'),
    btnResetParams: $('#btn-reset-params'),
    configPrompt: $('#config-prompt'),
    configPromptGrp: $('#config-prompt-group'),
    btnClearPrompt: $('#btn-clear-prompt'),
    configExtraJson: $('#config-extra-json'),
    configExtraGrp: $('#config-extra-group'),
    uploadWrapper: $('#upload-zone-wrapper'),
    uploadZone: $('#upload-zone'),
    fileInput: $('#file-input'),
    filePreview: $('#file-preview'),
    filePreviewThumb: $('#file-preview-thumb'),
    filePreviewName: $('#file-preview-name'),
    filePreviewSize: $('#file-preview-size'),
    filePreviewRemove: $('#file-preview-remove'),
    btnSubmit: $('#btn-submit'),
    tasksList: $('#tasks-list'),
    tasksEmpty: $('#tasks-empty'),
    btnClearTasks: $('#btn-clear-tasks'),
    mjAr: $('#config-mj-ar'),
    mjSpeed: $('#config-mj-speed'),
    mjVersion: $('#config-mj-version'),
    tabActive: $('#tab-active'),
    tabHistory: $('#tab-history'),
    historyGallery: $('#history-gallery'),
    historyEmpty: $('#history-empty'),
    historyFilter: $('#history-filter-model'),
    btnClearHistory: $('#btn-clear-history'),
    activeCount: $('#active-count'),
    historyCount: $('#history-count'),
};

// Category labels
const CAT_LABELS = { image: 'Generate Image', 'vid-txt': 'Text → Video', 'vid-img': 'Image → Video', audio: 'Audio', music: 'Music', tools: 'Tools & Upscale', mj: 'Midjourney', veo3: 'Veo 3.1' };

// ==================== Init ====================

document.addEventListener('DOMContentLoaded', () => {
    initLobby();
    initModelPickerModal();
    initUploadZone();
    initSubmit();
    initClearTasks();
    initTabs();
    initHistory();
    restorePendingTasks();
    // If user was in a workspace before refresh, go back there
    let savedCat;
    try { savedCat = sessionStorage.getItem('kie-workspace-cat'); }
    catch (e) { console.warn('Could not read from sessionStorage:', e); }
    if (savedCat && CAT_LABELS[savedCat]) enterWorkspace(savedCat);
    fetchCredits();
    initPromptCounter();
    initResetButtons();
    initKeyboardShortcuts();
    initSocketCallbacks();
});

function restorePendingTasks() {
    const pending = loadPendingTasks();
    if (!pending.length) return;
    // Discard tasks older than 1 hour (likely already expired on the API side)
    const ONE_HOUR = 60 * 60 * 1000;
    const now = Date.now();
    const valid = pending.filter(p => (now - (p.createdAt || 0)) < ONE_HOUR);
    if (valid.length !== pending.length) savePendingTasks(valid);
    valid.forEach(p => {
        const task = {
            id: p.id,
            model: p.model,
            mode: p.mode,
            cat: p.cat,
            state: 'processing',
            data: null,
            pollTimer: null,
            _prompt: p._prompt || '',
            _inputFileUrl: p._inputFileUrl || null,
            _extraParams: p._extraParams || null
        };
        tasks.unshift(task);
        renderTaskCard(task);
        startPolling(task);
    });
    updateTasksEmpty();
    updateActiveCount();
}

// ==================== URL Extraction Helper ====================

/**
 * Collect result URLs from all possible callback/response formats.
 * Returns a de-duplicated array of unique URLs.
 */
function extractResultUrls(data) {
    const urls = [];
    const info = data.info || {};

    // Veo / Market: info.resultUrls (array)
    if (Array.isArray(info.resultUrls)) urls.push(...info.resultUrls);
    // 4o Image: info.result_urls (snake_case array)
    if (Array.isArray(info.result_urls)) urls.push(...info.result_urls);
    // Flux Kontext: info.resultImageUrl (single string)
    if (info.resultImageUrl) urls.push(info.resultImageUrl);
    // Runway: flat video_url
    if (data.video_url) urls.push(data.video_url);
    // Suno: data.data[] with audio_url
    if (Array.isArray(data.data)) {
        urls.push(...data.data.filter(d => d.audio_url).map(d => d.audio_url));
    }

    // Return unique URLs only
    return [...new Set(urls)];
}

// ==================== Socket.IO Callbacks ====================

function initSocketCallbacks() {
    if (typeof io === 'undefined') {
        console.warn('[Socket] socket.io client not loaded, callbacks disabled');
        return;
    }
    const apiKey = localStorage.getItem('kie-api-key');
    if (!apiKey) {
        console.warn('[Socket] No API key found in localStorage, socket auth may fail');
    }
    const socket = io({ auth: { apiKey }, transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
        console.log('[Socket] Connected for KIE callbacks');
    });

    socket.on('kie:task-update', (body) => {
        // taskId normalized to camelCase by server (handles Suno/Runway snake_case)
        const taskId = body?.data?.taskId;
        if (!taskId) return;

        const task = tasks.find(t => t.id === taskId);
        if (!task) return; // Not one of ours

        // Suno sends multi-stage callbacks: text → first → complete
        // Only treat 'complete' (or absent callbackType) as final
        const callbackType = body?.data?.callbackType;
        const isSunoPartial = callbackType && callbackType !== 'complete';

        console.log(`[Callback] ${taskId} code=${body.code}${callbackType ? ` stage=${callbackType}` : ''}`);

        // Map callback code to task state
        const code = body.code;
        let state;
        if (isSunoPartial) state = 'processing'; // Suno intermediate stage
        else if (code === 200) state = 'success';
        else if (code >= 400) state = 'fail';
        else state = 'processing';

        // Build a data envelope matching what poll expects
        const data = body.data || {};
        if (body.msg && code !== 200) data.failMsg = body.msg;
        // Normalize result URLs from different callback formats
        const info = data.info || {};
        if (info.originUrls) data.originUrls = info.originUrls;
        if (info.resolution) data.resolution = info.resolution;
        data.resultUrls = extractResultUrls(data);

        task.data = { code, msg: body.msg, data };
        task.state = state;

        // Stop polling — callback is authoritative (only for final states)
        if (state === 'success' || state === 'fail') {
            if (task.pollTimer) { clearInterval(task.pollTimer); task.pollTimer = null; }
            removePendingTask(task.id);
            const failInfo = data.failMsg ? ` — ${data.failMsg}` : '';
            toast(
                state === 'success' ? `✅ ${task.model} concluído!` : `❌ ${task.model} falhou${failInfo}`,
                state === 'success' ? 'success' : 'error'
            );
            if (state === 'success') addToHistory(task);
            fetchCredits();
        }

        updateTaskCard(task);
        updateActiveCount();
    });

    socket.on('disconnect', () => {
        console.log('[Socket] Disconnected — polling continues as fallback');
    });
}

// ==================== Credits ====================

async function fetchCredits() {
    els.creditsDisplay.textContent = '...';
    try {
        const resp = await fetch(`${API}/api/credits`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        // API returns { code: 200, data: 9130.0 } — data is the balance directly
        const raw = json.data;
        let bal;
        if (typeof raw === 'number') {
            bal = raw;
        } else if (typeof raw === 'object' && raw !== null) {
            bal = raw.credits ?? raw.balance ?? raw.remaining ?? '—';
        } else {
            bal = json.credits ?? json.balance ?? '—';
        }
        if (typeof bal === 'number') {
            els.creditsDisplay.textContent = Number.isInteger(bal)
                ? bal.toLocaleString('pt-BR')
                : bal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        } else {
            els.creditsDisplay.textContent = bal;
        }
    } catch (err) {
        console.error('Credits fetch error:', err);
        els.creditsDisplay.textContent = '—';
    }
}
if (els.creditsBtn) els.creditsBtn.addEventListener('click', fetchCredits);

// ==================== Lobby ====================

function initLobby() {
    $$('.lobby-card, .lobby-slim-card').forEach(card => {
        card.addEventListener('click', () => {
            const cat = card.dataset.lobbyCat;
            if (cat) enterWorkspace(cat);
        });
    });
    if (els.btnBackLobby) {
        els.btnBackLobby.addEventListener('click', () => exitWorkspace());
    }
}

function enterWorkspace(cat) {
    // Save category globally
    currentCat = cat;
    // Persist current workspace so F5 / Ctrl+R restores it
    try { sessionStorage.setItem('kie-workspace-cat', cat); } catch (e) { console.warn('Could not persist workspace to sessionStorage:', e); }

    // Hide lobby, show workspace
    els.lobby.classList.add('exit');
    setTimeout(() => {
        els.lobby.classList.add('hidden');
        els.appMain.classList.remove('hidden');
    }, 250);

    // Set breadcrumb
    const label = CAT_LABELS[cat] || cat;
    currentCatLabel = label;
    els.headerBreadcrumb.innerHTML = `<span class="breadcrumb-sep">/</span> <span class="breadcrumb-active">${label}</span>`;
    if (els.workspaceCatLabel) els.workspaceCatLabel.textContent = label;

    // Update History & Active tabs to only show tasks and history for this cat
    filterTasksByCategory();
    updateActiveCount();
    updateHistoryCount();
    renderHistoryGallery();

    // Store model data for current category
    _currentCatItems = [];
    const tpl = document.getElementById('tpl-models');
    if (tpl) {
        tpl.content.querySelectorAll(`[data-cat="${cat}"]`).forEach(item => {
            _currentCatItems.push(item.dataset);
        });
    }

    // Reset state
    selectedModel = null;
    clearFile();
    els.configPrompt.value = '';
    updateSubmitState();
    // Reset picker trigger
    els.mptName.textContent = 'Selecione um modelo';
    els.mptIcon.className = 'mpt-icon mc-purple';
    els.mptIcon.textContent = '—';
    if (els.mptCost) els.mptCost.classList.add('hidden');
    if (els.btnModelPicker) els.btnModelPicker.classList.remove('has-model');
    // Hide inline params
    if (els.configPanel) els.configPanel.classList.add('hidden');
    // Open model picker modal so user chooses a model first
    if (_currentCatItems.length > 0) {
        setTimeout(() => openModelPickerModal(), 50);
    }
}

function exitWorkspace() {
    els.appMain.classList.add('hidden');
    els.lobby.classList.remove('hidden', 'exit');
    els.headerBreadcrumb.innerHTML = '';
    selectedModel = null;
    currentCatLabel = '';
    currentCat = '';
    _currentCatItems = [];
    clearFile();
    closeModelPickerModal();
    stopAllPolling();
    // Hide V2 workspace if open
    if (typeof window._v2HideWorkspace === 'function') window._v2HideWorkspace();
    // Clear persisted workspace so reload goes to lobby
    try { sessionStorage.removeItem('kie-workspace-cat'); } catch (e) { console.warn('Could not clear workspace from sessionStorage:', e); }
}

// ==================== Model Picker Modal ====================

let _currentCatItems = [];

function initModelPickerModal() {
    if (els.btnModelPicker) {
        els.btnModelPicker.addEventListener('click', openModelPickerModal);
    }
    if (els.mpmBackdrop) {
        els.mpmBackdrop.addEventListener('click', closeModelPickerModal);
    }
    if (els.mpmClose) {
        els.mpmClose.addEventListener('click', closeModelPickerModal);
    }
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && els.modalModelPicker && !els.modalModelPicker.classList.contains('hidden')) {
            closeModelPickerModal();
        }
    });
}

function openModelPickerModal() {
    if (!els.modalModelPicker || !els.mpmGrid) return;
    // Build cards
    els.mpmGrid.innerHTML = '';
    _currentCatItems.forEach(data => {
        const cost = getModelCost(data.model);
        const isActive = selectedModel?.model === data.model;
        const card = document.createElement('button');
        const isV2 = data.design === 'v2';
        card.className = `mpm-card${isActive ? ' active' : ''}${isV2 ? ' mpm-card-v2' : ''}`;
        card.dataset.model = data.model;
        if (data.color) card.dataset.color = data.color;

        const inputTypeTag = data.input === 'file' ? 'Image/File' : data.input === 'mj' ? 'Midjourney' : 'Text';
        const costHtml = cost ? `<span class="mpm-card-cost ${costColorClass(cost)}">~${cost} cr</span>` : '';

        if (isV2) {
            card.innerHTML = `
                <div class="mpm-v2-glow-border"></div>
                <div class="mpm-v2-inner">
                    <div class="mpm-v2-header">
                        <div class="mpm-v2-icon">${data.icon}</div>
                        <div class="mpm-v2-badge">EXPERIMENTAL</div>
                    </div>
                    <div class="mpm-v2-body">
                        <div class="mpm-v2-name">${esc(data.name)}</div>
                        <div class="mpm-v2-provider">${esc(data.provider)}</div>
                        <div class="mpm-v2-desc">${esc(data.desc || '')}</div>
                    </div>
                    <div class="mpm-v2-footer">
                        <span class="mpm-v2-tag">${esc(inputTypeTag)}</span>
                        ${cost ? `<span class="mpm-v2-cost">~${cost} cr</span>` : ''}
                    </div>
                    <div class="mpm-v2-features">
                        <div class="mpm-v2-feature"><span class="mpm-v2-dot"></span>Prompt + Referência</div>
                        <div class="mpm-v2-feature"><span class="mpm-v2-dot"></span>Até 4K</div>
                        <div class="mpm-v2-feature"><span class="mpm-v2-dot"></span>Multi-formato</div>
                    </div>
                </div>
                <div class="mpm-v2-ambient"></div>
            `;
        } else {
            card.innerHTML = `
                <div class="mpm-card-accent ${data.color || ''}"></div>
                <div class="mpm-card-top">
                    <div class="mpm-card-icon ${data.color}">${data.icon}</div>
                    ${costHtml}
                </div>
                <div>
                    <div class="mpm-card-name">${esc(data.name)}</div>
                    <div class="mpm-card-provider">${esc(data.provider)}</div>
                </div>
                <div class="mpm-card-desc">${esc(data.desc || '')}</div>
                <div class="mpm-card-footer">
                    <span class="mpm-card-tag">${esc(inputTypeTag)}</span>
                </div>
                <div class="mpm-card-glow"></div>
            `;
        }
        card.addEventListener('click', () => {
            selectModelFromData(data);
            closeModelPickerModal();
            // If V2 design, open the V2 workspace overlay
            if (data.design === 'v2' && typeof window._v2ShowWorkspace === 'function') {
                window._v2ShowWorkspace();
            }
        });
        els.mpmGrid.appendChild(card);
    });

    els.modalModelPicker.classList.remove('hidden');
}

function closeModelPickerModal() {
    if (els.modalModelPicker) els.modalModelPicker.classList.add('hidden');
}

function selectModelFromData(data) {
    selectedModel = {
        model: data.model,
        input: data.input,
        field: data.field || 'image',
        shortcut: data.shortcut || null,
        mjType: data.mjType || null,
        hasPrompt: data.prompt === 'true',
    };

    // Update trigger button
    els.mptIcon.innerHTML = data.icon; // Using innerHTML as data.icon contains SVG
    els.mptIcon.className = `mpt-icon ${data.color}`;
    els.mptName.textContent = `${data.name} — ${data.provider}`;
    els.btnModelPicker.classList.add('has-model');

    // Cost in trigger
    const cost = getModelCost(selectedModel.model);
    updateCostBadge(els.mptCost, cost, 'mpt-cost', 'cr');

    // Update header breadcrumb
    els.headerBreadcrumb.innerHTML = `<span class="breadcrumb-sep">/</span> ${currentCatLabel} <span class="breadcrumb-sep">/</span> <span class="breadcrumb-active">${data.name}</span>`;

    const isMj = selectedModel.input === 'mj';
    const isMix = selectedModel.input === 'mix';
    const needsFile = selectedModel.input === 'file' || (isMj && selectedModel.mjType !== 'mj_txt2img') || isMix;
    const needsPrompt = selectedModel.input === 'text' || isMj || selectedModel.hasPrompt || isMix;

    els.configPromptGrp.classList.toggle('hidden', !needsPrompt);
    els.uploadWrapper.classList.toggle('hidden', !needsFile);

    if (els.mjAr) els.mjAr.classList.toggle('hidden', !isMj);
    if (els.mjSpeed) els.mjSpeed.classList.toggle('hidden', !isMj);
    if (els.mjVersion) els.mjVersion.classList.toggle('hidden', !isMj);

    if (selectedModel.field === 'video_url') els.fileInput.accept = 'video/*';
    else if (selectedModel.field === 'audio_url') els.fileInput.accept = 'audio/*';
    else if (['filesUrl', 'inputImage', 'image_url', 'image_urls', 'image'].includes(selectedModel.field)) els.fileInput.accept = 'image/*';
    else els.fileInput.accept = 'image/*,video/*,audio/*';

    // Enable multi-file selection for batch-capable models
    els.fileInput.multiple = isBatchModel(data.model);

    if (selectedModel.field === 'text') els.configPrompt.placeholder = 'Digite o texto para sintetizar...';
    else els.configPrompt.placeholder = 'Descreva o que deseja gerar...';

    // Render params inline
    renderModelParams(selectedModel.model);
    const cfg = MODEL_CONFIGS[selectedModel.model];
    const hasParams = !!(cfg && cfg.params.length > 0);
    if (els.configPanel) {
        els.configPanel.classList.toggle('hidden', !hasParams);
    }
    if (els.btnResetParams) els.btnResetParams.classList.toggle('hidden', !hasParams);

    // Extra JSON fallback
    if (cfg && cfg.params.length > 0) els.configExtraGrp.classList.add('hidden');
    else els.configExtraGrp.classList.remove('hidden');

    clearFile();
    updateSubmitState();
    updateCharCounter();
    if (needsPrompt) setTimeout(() => els.configPrompt.focus(), 150);
}

function initPromptCounter() {
    const counter = document.getElementById('prompt-char-counter');
    if (!counter || !els.configPrompt) return;
    els.configPrompt.addEventListener('input', () => updateCharCounter());
}

function updateCharCounter() {
    const counter = document.getElementById('prompt-char-counter');
    if (!counter) return;
    const model = selectedModel?.model;
    const limit = model ? PROMPT_CHAR_LIMITS[model] : null;
    if (!limit) { counter.classList.add('hidden'); return; }
    const len = els.configPrompt.value.length;
    counter.classList.remove('hidden');
    counter.textContent = `${len.toLocaleString('pt-BR')} / ${limit.toLocaleString('pt-BR')}`;
    const ratio = len / limit;
    counter.classList.remove('char-ok', 'char-warn', 'char-over');
    if (ratio > 1) counter.classList.add('char-over');
    else if (ratio > 0.8) counter.classList.add('char-warn');
    else counter.classList.add('char-ok');
}

function initResetButtons() {
    if (els.btnClearPrompt) {
        els.btnClearPrompt.addEventListener('click', () => {
            els.configPrompt.value = '';
            els.configPrompt.focus();

            updateSubmitState();
        });
    }
    if (els.btnResetParams) {
        els.btnResetParams.addEventListener('click', () => {
            if (selectedModel) renderModelParams(selectedModel.model);
        });
    }
}

function initKeyboardShortcuts() {
    window.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            if (!els.btnSubmit.disabled && !els.btnSubmit.classList.contains('loading')) {
                handleSubmit();
            }
        }
    });
}

// ==================== Dynamic Model Params ====================

// Keys that should only be visible when Suno custom_mode is ON
const SUNO_CUSTOM_MODE_KEYS = new Set(['style', 'title', 'instrumental']);

function renderModelParams(modelKey) {
    els.configParams.innerHTML = '';
    const cfg = MODEL_CONFIGS[modelKey];
    if (!cfg || cfg.params.length === 0) return;

    const isSunoGenerate = modelKey === 'suno/generate-music';

    cfg.params.forEach(p => {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.dataset.groupKey = p.key;

        // For suno/generate-music, hide advanced-only fields by default
        if (isSunoGenerate && SUNO_CUSTOM_MODE_KEYS.has(p.key)) {
            group.classList.add('hidden');
        }

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = p.label;
        group.appendChild(label);

        if (p.type === 'select') {
            const sel = document.createElement('select');
            sel.className = 'form-select';
            sel.dataset.paramKey = p.key;
            p.options.forEach(opt => {
                const o = document.createElement('option');
                o.value = opt; o.textContent = opt || '(auto)';
                if (opt === String(p.default)) o.selected = true;
                sel.appendChild(o);
            });
            group.appendChild(sel);

        } else if (p.type === 'radio') {
            const rg = document.createElement('div');
            rg.className = 'radio-group';
            p.options.forEach(opt => {
                const lbl = document.createElement('label');
                lbl.className = 'radio-pill';
                const inp = document.createElement('input');
                inp.type = 'radio'; inp.name = `param-${p.key}`; inp.value = opt;
                if (opt === String(p.default)) inp.checked = true;
                lbl.appendChild(inp);
                lbl.appendChild(document.createTextNode(' ' + opt));
                rg.appendChild(lbl);
            });
            rg.dataset.paramKey = p.key;
            group.appendChild(rg);

        } else if (p.type === 'number') {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex'; wrapper.style.alignItems = 'center'; wrapper.style.gap = '12px';
            const inp = document.createElement('input');
            inp.type = 'range'; inp.className = 'form-range';
            inp.min = p.min; inp.max = p.max; inp.step = p.step; inp.value = p.default;
            inp.dataset.paramKey = p.key;
            inp.style.flex = '1';
            const valSpan = document.createElement('span');
            valSpan.className = 'range-value';
            valSpan.textContent = p.default;
            valSpan.style.fontFamily = 'var(--font-mono)'; valSpan.style.fontSize = '12px';
            valSpan.style.color = 'var(--text-secondary)'; valSpan.style.minWidth = '40px';
            inp.addEventListener('input', () => { valSpan.textContent = inp.value; });
            wrapper.appendChild(inp); wrapper.appendChild(valSpan);
            group.appendChild(wrapper);

        } else if (p.type === 'bool') {
            const lbl = document.createElement('label');
            lbl.style.display = 'flex'; lbl.style.alignItems = 'center'; lbl.style.gap = '8px';
            lbl.style.cursor = 'pointer';
            const cb = document.createElement('input');
            cb.type = 'checkbox'; cb.checked = p.default;
            cb.dataset.paramKey = p.key;
            cb.style.accentColor = 'var(--accent)';
            lbl.appendChild(cb);
            const t = document.createElement('span');
            t.textContent = p.default ? 'Ativado' : 'Desativado';
            t.style.fontSize = '13px'; t.style.color = 'var(--text-secondary)';
            cb.addEventListener('change', () => { t.textContent = cb.checked ? 'Ativado' : 'Desativado'; });
            lbl.appendChild(t);
            group.appendChild(lbl);

            // Suno custom_mode toggle: show/hide advanced-only fields
            if (isSunoGenerate && p.key === 'custom_mode') {
                cb.addEventListener('change', () => {
                    console.log('[Suno] custom_mode toggled:', cb.checked);
                    SUNO_CUSTOM_MODE_KEYS.forEach(k => {
                        const g = els.configParams.querySelector(`[data-group-key="${k}"]`);
                        console.log(`[Suno] Looking for group [data-group-key="${k}"]:`, g);
                        if (g) g.classList.toggle('hidden', !cb.checked);
                    });
                    // Update prompt placeholder to reflect mode
                    if (els.configPrompt) {
                        els.configPrompt.placeholder = cb.checked
                            ? 'Cole a letra da música aqui...'
                            : 'Descreva o estilo de música que deseja gerar...';
                    }
                });
            }

        } else if (p.type === 'text') {
            const inp = document.createElement('input');
            inp.type = 'text'; inp.className = 'form-input';
            inp.value = p.default || ''; inp.placeholder = p.label;
            inp.dataset.paramKey = p.key;
            group.appendChild(inp);
        } else if (p.type === 'number_input') {
            const inp = document.createElement('input');
            inp.type = 'number'; inp.className = 'form-input';
            inp.value = p.default || '0'; inp.placeholder = p.label;
            inp.dataset.paramKey = p.key;
            group.appendChild(inp);
        }

        els.configParams.appendChild(group);
    });
}

function collectModelParams() {
    const params = {};
    const cfg = MODEL_CONFIGS[selectedModel?.model];
    if (!cfg) return params;

    cfg.params.forEach(p => {
        // Skip params whose parent group is hidden (e.g. Suno advanced-only fields)
        const groupEl = els.configParams.querySelector(`[data-group-key="${p.key}"]`);
        if (groupEl && groupEl.classList.contains('hidden')) return;

        if (p.type === 'select') {
            const el = els.configParams.querySelector(`select[data-param-key="${p.key}"]`);
            if (el) params[p.key] = el.value;
        } else if (p.type === 'radio') {
            const checked = els.configParams.querySelector(`input[name="param-${p.key}"]:checked`);
            if (checked) params[p.key] = checked.value;
        } else if (p.type === 'number') {
            const el = els.configParams.querySelector(`input[type="range"][data-param-key="${p.key}"]`);
            if (el) params[p.key] = parseFloat(el.value);
        } else if (p.type === 'bool') {
            const el = els.configParams.querySelector(`input[type="checkbox"][data-param-key="${p.key}"]`);
            if (el) params[p.key] = el.checked;
        } else if (p.type === 'text') {
            const el = els.configParams.querySelector(`input[type="text"][data-param-key="${p.key}"]`);
            if (el && el.value.trim()) params[p.key] = el.value.trim();
        } else if (p.type === 'number_input') {
            const el = els.configParams.querySelector(`input[type="number"][data-param-key="${p.key}"]`);
            if (el && el.value.trim() !== '') params[p.key] = parseInt(el.value, 10);
        }
    });

    return params;
}

// ==================== Upload Zone ====================

function initUploadZone() {
    els.uploadZone.addEventListener('click', () => els.fileInput.click());
    els.uploadZone.addEventListener('dragover', e => { e.preventDefault(); els.uploadZone.classList.add('dragover'); });
    els.uploadZone.addEventListener('dragleave', () => els.uploadZone.classList.remove('dragover'));
    els.uploadZone.addEventListener('drop', e => {
        e.preventDefault(); els.uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 1 && isBatchModel(selectedModel?.model)) {
            handleBatchFileSelect(files);
        } else if (files.length) {
            handleFileSelect(files[0]);
        }
    });
    els.fileInput.addEventListener('change', () => {
        const files = els.fileInput.files;
        if (files.length > 1 && isBatchModel(selectedModel?.model)) {
            handleBatchFileSelect(files);
        } else if (files.length) {
            handleFileSelect(files[0]);
        }
    });
    els.filePreviewRemove.addEventListener('click', clearFile);
}

function handleFileSelect(file) {
    selectedFile = file;
    els.filePreviewName.textContent = file.name;
    els.filePreviewSize.textContent = formatSize(file.size);
    els.filePreviewThumb.innerHTML = '';
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        els.filePreviewThumb.appendChild(img);
    } else if (file.type.startsWith('video/')) {
        const vid = document.createElement('video');
        vid.src = URL.createObjectURL(file); vid.muted = true; vid.preload = 'metadata';
        els.filePreviewThumb.appendChild(vid);
    } else {
        els.filePreviewThumb.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    }
    els.uploadZone.classList.add('hidden');
    els.filePreview.classList.remove('hidden');
    updateSubmitState();
}

function handleBatchFileSelect(fileList) {
    selectedFiles = Array.from(fileList);
    selectedFile = selectedFiles[0]; // Keep compat
    const count = selectedFiles.length;
    const totalSize = selectedFiles.reduce((s, f) => s + f.size, 0);
    els.filePreviewName.textContent = `${count} arquivo${count > 1 ? 's' : ''} selecionado${count > 1 ? 's' : ''}`;
    els.filePreviewSize.textContent = formatSize(totalSize);
    els.filePreviewThumb.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:20px;font-weight:700;color:var(--accent)">${count}</div>`;
    els.uploadZone.classList.add('hidden');
    els.filePreview.classList.remove('hidden');
    updateSubmitState();
}

function clearFile() {
    selectedFile = null; selectedFiles = []; els.fileInput.value = '';
    els.filePreviewThumb.innerHTML = '';
    els.filePreview.classList.add('hidden');
    els.uploadZone.classList.remove('hidden');
    updateSubmitState();
}

function formatSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
}

// ==================== Submit ====================

function _getCurrentModelCost() {
    if (!selectedModel) return null;
    let model = selectedModel.model;

    // MJ: cost depends on speed setting
    if (selectedModel.input === 'mj') {
        const speed = document.querySelector('input[name="mj-speed"]:checked')?.value || 'relaxed';
        if (speed === 'relaxed') return 3;
        if (speed === 'turbo') return 16;
        return 8; // fast
    }

    // Veo: resolve virtual models to actual cost keys
    if (model === 'veo3/text-to-video' || model === 'veo3/image-to-video') {
        const q = document.querySelector('input[name="param-quality"]:checked')?.value || 'Fast';
        const suffix = q === 'Quality' ? '-quality' : '-fast';
        const base = model.replace('veo3/', 'veo3/').replace('-video', `-video${suffix}`);
        return getModelCost(base) || getModelCost(model);
    }

    return getModelCost(model);
}

function updateSubmitState() {
    if (!selectedModel) { els.btnSubmit.disabled = true; return; }
    const isMj = selectedModel.input === 'mj';
    const isMix = selectedModel.input === 'mix';
    const needsFileStrict = selectedModel.input === 'file' || (isMj && selectedModel.mjType !== 'mj_txt2img');
    const needsPrompt = selectedModel.input === 'text' || isMj || isMix;
    let ok = true;
    if (isMix) {
        // Mix models: need at least a file OR a prompt
        const hasFile = !!selectedFile;
        const hasPrompt = !!els.configPrompt.value.trim();
        if (!hasFile && !hasPrompt) ok = false;
    } else {
        if (needsFileStrict && !selectedFile) ok = false;
        // Prompt is required for text-only & MJ, but optional for file+prompt models
        if (needsPrompt && !selectedModel.hasPrompt && !els.configPrompt.value.trim()) ok = false;
    }
    els.btnSubmit.disabled = !ok;

    // Update button label with cost
    const btnLabel = els.btnSubmit.querySelector('span');
    if (btnLabel && selectedModel) {
        const cost = _getCurrentModelCost();
        btnLabel.textContent = cost ? `Gerar (~${cost} cr)` : 'Gerar';
    }
}

function initSubmit() {
    els.btnSubmit.addEventListener('click', handleSubmit);
    els.configPrompt.addEventListener('input', updateSubmitState);

    // Update cost in button when MJ speed or any param radio changes
    document.querySelectorAll('input[name="mj-speed"]').forEach(r => r.addEventListener('change', updateSubmitState));
    // Also listen to param changes (delegated) for dynamic cost models like Veo quality
    document.addEventListener('change', e => {
        if (e.target.matches('.config-model-params input[type="radio"]')) updateSubmitState();
    });
}

async function handleSubmit() {
    if (!selectedModel || els.btnSubmit.disabled) return;
    // Visual feedback: spinner + text change
    els.btnSubmit.classList.add('loading'); els.btnSubmit.disabled = true;
    const btnSpan = els.btnSubmit.querySelector('span');
    const origText = btnSpan?.textContent;
    if (btnSpan) btnSpan.textContent = 'Enviando...';
    try {
        // Batch upload: loop through all selected files
        if (selectedFiles.length > 1 && isBatchModel(selectedModel.model)) {
            const total = selectedFiles.length;
            let ok = 0, fail = 0;
            for (let i = 0; i < total; i++) {
                if (btnSpan) btnSpan.textContent = `Enviando ${i + 1}/${total}...`;
                selectedFile = selectedFiles[i];
                try {
                    if (selectedModel.shortcut === 'topaz-upscale') {
                        const params = collectModelParams();
                        await submitShortcut('/api/shortcuts/topaz-upscale', 'videos', { factor: params.upscale_factor || '2' });
                    } else {
                        await submitFileModel();
                    }
                    ok++;
                } catch (err) {
                    fail++;
                    toast(`❌ Erro (${selectedFiles[i].name}): ${err.message}`, 'error');
                }
            }
            toast(`✅ Batch: ${ok} enviado${ok > 1 ? 's' : ''}${fail ? `, ${fail} erro${fail > 1 ? 's' : ''}` : ''}`, ok > 0 ? 'success' : 'error');
            clearFile(); updateSubmitState(); updateCharCounter();
        } else {
            // Single file / normal submit
            let response;
            if (selectedModel.input === 'mj') response = await submitMJ();
            else if (selectedModel.shortcut === 'recraft-rmbg') response = await submitShortcut('/api/shortcuts/recraft-rmbg', 'images');
            else if (selectedModel.shortcut === 'topaz-upscale') {
                const params = collectModelParams();
                response = await submitShortcut('/api/shortcuts/topaz-upscale', 'videos', { factor: params.upscale_factor || '2' });
            }
            else if (selectedModel.model.startsWith('suno/')) response = await submitSunoModel();
            else if (selectedModel.model.startsWith('veo3/')) response = await submitVeoModel();
            else if (selectedModel.model === 'gpt4o-image') response = await submitGpt4oImage();
            else if (selectedModel.model.startsWith('flux-kontext')) response = await submitFluxKontext();
            else if (selectedModel.input === 'mix') response = await submitMixMarketModel();
            else if (selectedModel.input === 'file') response = await submitFileModel();
            else response = await submitTextModel();
            if (response) {
                toast('✅ Tarefa criada!', 'success');
                clearFile(); els.configPrompt.value = ''; updateSubmitState();
                updateCharCounter();
            }
        }
    } catch (err) {
        toast(`❌ Erro: ${err.message}`, 'error');
    } finally {
        els.btnSubmit.classList.remove('loading');
        if (btnSpan) btnSpan.textContent = origText || 'Gerar';
        updateSubmitState();
    }
}

async function submitShortcut(endpoint, uploadPath, extraFields = {}) {
    const fd = new FormData();
    fd.append('file', selectedFile); fd.append('uploadPath', uploadPath);
    // Append any extra form fields (e.g. factor for topaz)
    for (const [k, v] of Object.entries(extraFields)) {
        fd.append(k, v);
    }
    const resp = await fetch(`${API}${endpoint}`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
    if (json.code && json.code !== 200) throw new Error(json.msg || `Erro da API (code ${json.code})`);

    // API might return standard structure (data.taskId) or wrapped structure (task.data.taskId)
    const taskId = json?.data?.taskId || json?.task?.data?.taskId;

    // Shortcuts might return the uploaded url if present, but we'll try to get it if they do.
    const uploadedUrl = json?.uploaded_url || null;
    if (!taskId) throw new Error(json.msg || 'Nenhum taskId retornado');
    addTask(taskId, selectedModel.model, 'market', uploadedUrl);
    return json;
}


async function submitSunoModel() {
    const fd = new FormData();
    if (selectedFile) fd.append('file', selectedFile);

    let resolvedModel = selectedModel.model;
    let extra = collectModelParams();
    const prompt = els.configPrompt.value.trim();

    // Resolve virtual consolidated models to real API models
    const SUNO_ACTION_MAP = {
        'suno/edit-audio': {
            'Extend Music': 'suno/extend-music',
            'Add Instrumental': 'suno/add-instrumental',
            'Add Vocals': 'suno/add-vocals',
            'Separate Vocals': 'suno/separate-vocals',
        },
        'suno/utilities': {
            'Music Video': 'suno/music-video',
            'Convert WAV': 'suno/convert-wav',
            'Get Lyrics': 'suno/get-lyrics',
        }
    };

    if (SUNO_ACTION_MAP[resolvedModel]) {
        const action = extra.suno_action || Object.keys(SUNO_ACTION_MAP[resolvedModel])[0];
        resolvedModel = SUNO_ACTION_MAP[resolvedModel][action] || resolvedModel;
        delete extra.suno_action;
    }

    // If "Generate Music" and there's a file, it means they want an audio Cover
    if (resolvedModel === 'suno/generate-music' && selectedFile) {
        resolvedModel = 'suno/upload-cover';
    }

    if (prompt) extra.prompt = prompt;

    if (!els.configExtraGrp.classList.contains('hidden')) {
        try { Object.assign(extra, JSON.parse(els.configExtraJson.value.trim() || '{}')); } catch { }
    }

    fd.append('model', resolvedModel);
    fd.append('input_json', JSON.stringify(extra));

    const resp = await fetch(`${API}/api/suno/create`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
    if (json.code && json.code !== 200) throw new Error(json.msg || `Erro da API (code ${json.code})`);

    let tid = json?.data?.taskId || json?.task?.data?.taskId || json?.taskId;
    if (!tid) throw new Error(json.msg || 'Nenhum taskId retornado');
    addTask(tid, resolvedModel, 'suno', json.uploaded_url, extra);
    return json;
}


async function submitVeoModel() {
    const fd = new FormData();
    if (selectedFile) fd.append('file', selectedFile);

    let resolvedModel = selectedModel.model;
    let extra = collectModelParams();
    const prompt = els.configPrompt.value.trim();

    // Veo 3 quality parsing logic from submitTextModel & submitFileModel
    if (resolvedModel === 'veo3/image-to-video' || resolvedModel === 'veo3/text-to-video') {
        const quality = (extra.quality || 'Fast').toLowerCase();
        resolvedModel = `${resolvedModel}-${quality}`;
        delete extra.quality;
    }

    if (prompt) extra.prompt = prompt;

    if (!els.configExtraGrp.classList.contains('hidden')) {
        try { Object.assign(extra, JSON.parse(els.configExtraJson.value.trim() || '{}')); } catch { }
    }

    // Strip enableFallback just in case it was passed by user JSON
    delete extra.enableFallback;

    fd.append('model', resolvedModel);
    fd.append('input_json', JSON.stringify(extra));

    const resp = await fetch(`${API}/api/veo/create`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
    if (json.code && json.code !== 200) throw new Error(json.msg || `Erro da API (code ${json.code})`);

    let tid = json?.data?.taskId || json?.task?.data?.taskId || json?.taskId
        || json?.data?.task_id || json?.task_id;
    if (!tid) {
        console.error('[Veo] taskId not found in response:', JSON.stringify(json).slice(0, 500));
        throw new Error(json.msg || 'Nenhum taskId retornado');
    }
    // Set task mode to veo so poll matches
    addTask(tid, resolvedModel, 'veo', json.uploaded_url || null, extra);
    return json;
}

async function submitFileModel() {
    const fd = new FormData();
    fd.append('file', selectedFile);
    let resolvedModel = selectedModel.model;
    let extra = collectModelParams();

    fd.append('model', resolvedModel);
    fd.append('file_field', selectedModel.field);
    fd.append('uploadPath', 'uploads');
    const prompt = els.configPrompt.value.trim();
    if (prompt) extra.prompt = prompt;
    // Merge manual JSON if visible
    if (!els.configExtraGrp.classList.contains('hidden')) {
        try { Object.assign(extra, JSON.parse(els.configExtraJson.value.trim() || '{}')); } catch { }
    }
    fd.append('input_json', JSON.stringify(extra));
    const resp = await fetch(`${API}/api/process`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
    if (json.code && json.code !== 200) throw new Error(json.msg || `Erro da API (code ${json.code})`);
    const taskId = json?.task?.data?.taskId;
    if (!taskId) throw new Error(json.msg || json?.task?.msg || 'Nenhum taskId retornado');
    addTask(taskId, resolvedModel, 'market', json.uploaded_url, extra);
    return json;
}

async function submitGpt4oImage() {
    const fd = new FormData();
    if (selectedFile) fd.append('file', selectedFile);

    let extra = collectModelParams();
    const prompt = els.configPrompt.value.trim();
    if (prompt) extra.prompt = prompt;

    if (!els.configExtraGrp.classList.contains('hidden')) {
        try { Object.assign(extra, JSON.parse(els.configExtraJson.value.trim() || '{}')); } catch { }
    }

    fd.append('model', 'gpt4o-image');
    fd.append('input_json', JSON.stringify(extra));

    const resp = await fetch(`${API}/api/gpt4o-image/create`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
    if (json.code && json.code !== 200) throw new Error(json.msg || `Erro da API (code ${json.code})`);

    let tid = json?.data?.taskId || json?.taskId;
    if (!tid) throw new Error(json.msg || 'Nenhum taskId retornado — verifique o prompt e a imagem');
    addTask(tid, 'gpt4o-image', 'gpt4o-image', json.uploaded_url || null, extra);
    return json;
}

async function submitFluxKontext() {
    const fd = new FormData();
    if (selectedFile) fd.append('file', selectedFile);

    const resolvedModel = selectedModel.model; // flux-kontext-pro or flux-kontext-max
    let extra = collectModelParams();
    const prompt = els.configPrompt.value.trim();
    if (prompt) extra.prompt = prompt;

    // Set the API model name (flux-kontext-pro or flux-kontext-max)
    extra.model = resolvedModel;

    if (!els.configExtraGrp.classList.contains('hidden')) {
        try { Object.assign(extra, JSON.parse(els.configExtraJson.value.trim() || '{}')); } catch { }
    }

    fd.append('model', resolvedModel);
    fd.append('input_json', JSON.stringify(extra));

    const resp = await fetch(`${API}/api/flux-kontext/create`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
    if (json.code && json.code !== 200) throw new Error(json.msg || `Erro da API (code ${json.code})`);

    let tid = json?.data?.taskId || json?.taskId;
    if (!tid) throw new Error(json.msg || 'Nenhum taskId retornado — verifique o prompt e a imagem');
    addTask(tid, resolvedModel, 'flux-kontext', json.uploaded_url || null, extra);
    return json;
}

async function submitMixMarketModel() {
    const fd = new FormData();
    if (selectedFile) fd.append('file', selectedFile);

    let resolvedModel = selectedModel.model;
    let extra = collectModelParams();
    const prompt = els.configPrompt.value.trim();
    if (prompt) extra.prompt = prompt;

    if (!els.configExtraGrp.classList.contains('hidden')) {
        try { Object.assign(extra, JSON.parse(els.configExtraJson.value.trim() || '{}')); } catch { }
    }

    // If there's a file, use /api/process which handles upload + task creation
    if (selectedFile) {
        fd.append('model', resolvedModel);
        fd.append('file_field', selectedModel.field);
        fd.append('uploadPath', 'images');
        fd.append('input_json', JSON.stringify(extra));
        const resp = await fetch(`${API}/api/process`, { method: 'POST', body: fd });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
        if (json.code && json.code !== 200) throw new Error(json.msg || `Erro da API (code ${json.code})`);
        const taskId = json?.task?.data?.taskId;
        if (!taskId) throw new Error(json.msg || json?.task?.msg || 'Nenhum taskId retornado');
        addTask(taskId, resolvedModel, 'market', json.uploaded_url, extra);
        return json;
    } else {
        // Text-only: use create-json
        const fd2 = new FormData();
        fd2.append('model', resolvedModel);
        fd2.append('input_json', JSON.stringify(extra));
        const resp = await fetch(`${API}/api/market/create-json`, { method: 'POST', body: fd2 });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
        if (json.code && json.code !== 200) throw new Error(json.msg || `Erro da API (code ${json.code})`);
        const taskId = json?.data?.taskId;
        if (!taskId) throw new Error(json.msg || 'Nenhum taskId retornado');
        addTask(taskId, resolvedModel, 'market', null, extra);
        return json;
    }
}

async function submitTextModel() {
    const prompt = els.configPrompt.value.trim();
    let extra = collectModelParams();
    let resolvedModel = selectedModel.model;

    if (selectedModel.field === 'text') extra.text = prompt;
    else extra.prompt = prompt;
    // Merge manual JSON
    if (!els.configExtraGrp.classList.contains('hidden')) {
        try { Object.assign(extra, JSON.parse(els.configExtraJson.value.trim() || '{}')); } catch { }
    }
    const fd = new FormData();
    fd.append('model', resolvedModel);
    fd.append('input_json', JSON.stringify(extra));
    const resp = await fetch(`${API}/api/market/create-json`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
    if (json.code && json.code !== 200) throw new Error(json.msg || `Erro da API (code ${json.code})`);
    const taskId = json?.data?.taskId;
    if (!taskId) throw new Error(json.msg || 'Nenhum taskId retornado');
    addTask(taskId, resolvedModel, 'market', null, extra);
    return json;
}

async function submitMJ() {
    const prompt = els.configPrompt.value.trim();
    const ar = document.querySelector('input[name="mj-ar"]:checked')?.value || '1:1';
    const speed = document.querySelector('input[name="mj-speed"]:checked')?.value || 'relaxed';
    const version = document.querySelector('input[name="mj-version"]:checked')?.value || '7';

    // Handle image-to-image or video generation involving an image file
    const isImageReq = selectedModel.mjType !== 'mj_txt2img';
    let payload = { taskType: selectedModel.mjType, speed, prompt, aspectRatio: ar, version };

    if (isImageReq && selectedFile) {
        // Upload the image first before triggering Midjourney
        const upFd = new FormData();
        upFd.append('file', selectedFile);
        upFd.append('uploadPath', 'images');
        const upResp = await fetch(`${API}/api/upload`, { method: 'POST', body: upFd });
        const upJson = await upResp.json();
        if (!upResp.ok) throw new Error(upJson.detail || 'Falha ao fazer upload da imagem de referência');

        const imageUrl = upJson.url;
        if (selectedModel.mjType === 'mj_img2img' || selectedModel.mjType === 'mj_video') {
            payload.prompt = `${imageUrl} ${prompt}`.trim();
        } else if (selectedModel.mjType === 'mj_style_ref') {
            payload.prompt = `${prompt} --sref ${imageUrl}`.trim();
        }
    }

    const fd = new FormData();
    fd.append('payload_json', JSON.stringify(payload));
    const resp = await fetch(`${API}/api/mj/generate`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
    if (json.code && json.code !== 200) throw new Error(json.msg || `Erro da API (code ${json.code})`);
    const taskId = json?.data?.taskId;
    if (!taskId) throw new Error(json.msg || 'Nenhum taskId retornado');
    addTask(taskId, selectedModel.model, 'midjourney', null, { ar, speed, version });
    return json;
}

// ==================== Task Management ====================

function addTask(taskId, model, mode, inputFileUrl = null, extraParams = null) {
    const promptText = els.configPrompt?.value?.trim() || '';
    const task = {
        id: taskId,
        model,
        mode,
        cat: currentCat, // Store the category the task was created in
        state: 'processing',
        data: null,
        pollTimer: null,
        _prompt: promptText,
        _inputFileUrl: inputFileUrl,
        _extraParams: extraParams
    };
    tasks.unshift(task);
    addPendingTask(task);
    renderTaskCard(task);
    startPolling(task);
    updateTasksEmpty();
    updateActiveCount();

    // Auto-switch to Ativas tab
    const activeTabBtn = document.querySelector('.panel-tab[data-tab="active"]');
    if (activeTabBtn && !activeTabBtn.classList.contains('active')) {
        activeTabBtn.click();
    }

    // Pulse feedback on active tab
    if (activeTabBtn) {
        activeTabBtn.classList.remove('tab-pulse');
        void activeTabBtn.offsetWidth; // Trigger reflow
        activeTabBtn.classList.add('tab-pulse');
    }

    // Scroll to new task card
    const newCard = document.getElementById(`task-${CSS.escape(taskId)}`);
    if (newCard) newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Filter visible task cards by current category
function filterTasksByCategory() {
    tasks.forEach(t => {
        const card = document.getElementById(`task-${CSS.escape(t.id)}`);
        if (card) card.style.display = (!currentCat || t.cat === currentCat) ? '' : 'none';
    });
    updateTasksEmpty();
    updateActiveCount();
}
function startPolling(task) {
    let pollErrors = 0;
    const MAX_POLL_ERRORS = 5;
    const poll = async () => {
        try {
            const ep = task.mode === 'midjourney' ? `/api/mj/task/${task.id}` :
                task.mode === 'suno' ? `/api/suno/task/${task.id}` :
                    task.mode === 'veo' ? `/api/veo/task/${task.id}` :
                        task.mode === 'gpt4o-image' ? `/api/gpt4o-image/task/${task.id}` :
                            task.mode === 'flux-kontext' ? `/api/flux-kontext/task/${task.id}` :
                                `/api/market/task/${task.id}`;
            const resp = await fetch(`${API}${ep}`);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();
            pollErrors = 0; // reset on success
            task.data = json;
            const data = json?.data || {};

            // Parse resultJson if it comes as string (per API docs)
            if (typeof data.resultJson === 'string' && data.resultJson) {
                try { data._parsedResult = JSON.parse(data.resultJson); } catch { }
            }

            let state;
            if (task.mode === 'midjourney') {
                const sf = data.successFlag;
                // successFlag: 1 = success, 2/3 = fail, 0/null = processing
                if (sf === 1 || data.resultUrls || data.resultInfoJson) state = 'success';
                else if (sf > 1 || data.errorCode) state = 'fail';
                else state = 'processing';
            } else {
                // Veo/Suno APIs use 'status', Market uses 'state'
                const raw = (data.status || data.state || 'processing').toString().toLowerCase();
                if (raw === 'success' || raw === 'succeeded' || raw === 'completed') state = 'success';
                else if (raw === 'fail' || raw === 'failed' || raw === 'error') state = 'fail';
                else state = 'processing';
            }
            task.state = state;
            updateTaskCard(task);
            if (state === 'success' || state === 'fail') {
                clearInterval(task.pollTimer); task.pollTimer = null;
                removePendingTask(task.id);
                const failInfo = data.failMsg ? ` — ${data.failMsg}` : '';
                toast(
                    state === 'success' ? `✅ ${task.model} concluído!` : `❌ ${task.model} falhou${failInfo}`,
                    state === 'success' ? 'success' : 'error'
                );
                // Save successful tasks to persistent history
                if (state === 'success') addToHistory(task);
                fetchCredits();
                updateActiveCount();
            }
        } catch (err) {
            pollErrors++;
            console.error(`Poll error (${pollErrors}/${MAX_POLL_ERRORS}):`, err);
            if (pollErrors >= MAX_POLL_ERRORS) {
                clearInterval(task.pollTimer); task.pollTimer = null;
                removePendingTask(task.id);
                task.state = 'fail';
                task.data = { data: { failMsg: `Erro de rede: ${err.message}`, failCode: 'NETWORK_ERROR' } };
                updateTaskCard(task);
                toast(`❌ ${task.model} — conexão perdida após ${MAX_POLL_ERRORS} tentativas`, 'error');
            }
        }
    };
    poll();
    task.pollTimer = setInterval(poll, 5000);
}

function updateTasksEmpty() { els.tasksEmpty.classList.toggle('hidden', tasks.length > 0); }

function initClearTasks() {
    els.btnClearTasks.addEventListener('click', () => {
        clearAllPendingTasks();
        clearLocalTasks();
    });
}

// ==================== Task Card Rendering ====================

function getModelDetails(modelKey) {
    const tpl = document.getElementById('tpl-models');
    if (!tpl) return null;
    const item = tpl.content.querySelector(`[data-model="${modelKey}"]`);
    return item ? item.dataset : null;
}

function renderTaskCard(task) {
    const el = document.createElement('div');
    el.className = `task-card state-${task.state}`; el.id = `task-${CSS.escape(task.id)}`;
    const promptSnippet = task._prompt ? (task._prompt.length > 50 ? task._prompt.slice(0, 50) + '…' : task._prompt) : '';

    const modelData = getModelDetails(task.model);
    const mIcon = modelData ? `<span class="card-model-icon ${modelData.color}">${modelData.icon}</span>` : '';
    const mName = modelData ? esc(`${modelData.provider} ${modelData.name}`) : esc(task.model);

    const mColor = modelData ? modelData.color : '';

    el.innerHTML = `
        <div class="task-card-accent ${mColor}"></div>
        <div class="task-card-header">
            <div class="task-card-left">
                <div class="task-card-icon ${task.state}">${stateIcon(task.state)}</div>
                <div class="task-card-info">
                    <span class="task-card-model">${mIcon}${mName}</span>
                    ${promptSnippet ? `<span class="task-card-prompt-preview">${esc(promptSnippet)}</span>` : ''}
                </div>
            </div>
            <span class="task-card-badge ${task.state}">${badgeLabel(task.state)}</span>
        </div>
        <div class="task-progress-bar ${(task.state === 'processing' || task.state === 'waiting') ? 'indeterminate' : ''}">
            <div class="task-progress-bar-fill" style="width:${task.state === 'success' ? '100' : '0'}%"></div>
        </div>
        <div class="task-result" data-task-result="${esc(task.id)}"></div>`;
    els.tasksList.insertBefore(el, els.tasksEmpty.nextSibling);
}

function updateTaskCard(task) {
    const card = document.getElementById(`task-${CSS.escape(task.id)}`);
    if (!card) return;
    // Update card state class
    card.className = `task-card state-${task.state}`;
    // Update icon
    const icon = card.querySelector('.task-card-icon');
    if (icon) { icon.className = `task-card-icon ${task.state}`; icon.innerHTML = stateIcon(task.state); }
    // Update badge
    const badge = card.querySelector('.task-card-badge');
    badge.className = `task-card-badge ${task.state}`;
    badge.textContent = badgeLabel(task.state);
    // Update progress bar
    const bar = card.querySelector('.task-progress-bar');
    const fill = card.querySelector('.task-progress-bar-fill');
    const isActive = task.state === 'processing' || task.state === 'waiting';
    if (isActive) { bar.classList.add('indeterminate'); fill.style.width = '30%'; }
    else { bar.classList.remove('indeterminate'); fill.style.width = task.state === 'success' ? '100%' : '0%'; }
    if (task.state === 'success' || task.state === 'fail') renderTaskResult(task);
}

function stateIcon(s) {
    if (s === 'processing' || s === 'waiting') return '⏳';
    if (s === 'success') return '✓';
    if (s === 'fail') return '✕';
    return '•';
}

function renderTaskResult(task) {
    const container = document.querySelector(`[data-task-result="${CSS.escape(task.id)}"]`);
    if (!container) return;
    const data = task.data?.data || {};
    let html = '';

    // Show error info for failed tasks
    if (task.state === 'fail') {
        const failMsg = data.failMsg || 'Erro desconhecido';
        const failCode = data.failCode ? ` (${data.failCode})` : '';
        html += `<div class="task-error-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--error-color, #ef4444)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>${esc(failMsg)}${esc(failCode)}</span>
        </div>`;
    }

    // Collect result URLs from all possible locations
    const urls = _extractResultUrls(data);
    const unique = [...new Set(urls.filter(u => typeof u === 'string' && u.startsWith('http')))];
    if (unique.length > 0) {
        const isVid = /\.(mp4|mov|webm|avi)($|\?)/i.test(unique[0]);
        const isAud = /\.(mp3|wav|ogg|aac)($|\?)/i.test(unique[0]);
        html += '<div class="task-result-media">';

        // Suno rich track cards
        const sunoTracks = data.response?.sunoData;
        if (sunoTracks && Array.isArray(sunoTracks) && sunoTracks.length > 0) {
            const parentTaskId = data.taskId || task.id;
            sunoTracks.forEach((track, i) => {
                const audioSrc = track.audioUrl || track.sourceAudioUrl || unique[i] || '';
                const coverSrc = track.imageUrl || track.sourceImageUrl || '';
                const title = track.title || `Faixa ${i + 1}`;
                const tags = track.tags || '';
                const lyrics = track.prompt || '';
                const audioId = track.id || '';
                const dur = track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}` : '';

                html += `<div class="suno-track-card">
                    <div class="suno-track-header">
                        ${coverSrc ? `<img src="${esc(coverSrc)}" alt="${esc(title)}" class="suno-track-cover">` : ''}
                        <div class="suno-track-info">
                            <div class="suno-track-title">${esc(title)}</div>
                            ${dur ? `<span class="suno-track-duration">${dur}</span>` : ''}
                            ${tags ? `<div class="suno-track-tags">${esc(tags.substring(0, 120))}${tags.length > 120 ? '…' : ''}</div>` : ''}
                        </div>
                    </div>
                    <audio src="${esc(audioSrc)}" controls style="width:100%"></audio>
                    ${lyrics ? `<details class="suno-track-lyrics-wrap"><summary>Ver Letra</summary><pre class="suno-track-lyrics">${esc(lyrics)}</pre></details>` : ''}
                    <div class="suno-actions-row">
                        <button class="btn-ghost btn-sm suno-action" data-suno-model="suno/extend-music" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}" title="Estender a música">🔁 Extend</button>
                        <button class="btn-ghost btn-sm suno-action" data-suno-model="suno/add-instrumental" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}" title="Adicionar instrumental">🎸 +Instr</button>
                        <button class="btn-ghost btn-sm suno-action" data-suno-model="suno/add-vocals" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}" title="Adicionar vocais">🎤 +Vocal</button>
                        <button class="btn-ghost btn-sm suno-action" data-suno-model="suno/separate-vocals" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}" title="Separar vocais/instrumental">✂️ Separar</button>
                    </div>
                    <div class="suno-actions-row">
                        <button class="btn-ghost btn-sm suno-action" data-suno-model="suno/music-video" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}" title="Gerar clipe">🎬 Clipe</button>
                        <button class="btn-ghost btn-sm suno-action" data-suno-model="suno/convert-wav" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}" title="Converter para WAV">📄 WAV</button>
                    </div>
                </div>`;
            });
        } else if (unique.length > 1 && !isVid && !isAud) {
            // Multi-image grid (e.g. MJ returns 4 images)
            html += '<div class="task-result-grid">';
            unique.forEach((u, i) => {
                html += `<img src="${esc(u)}" alt="Result ${i + 1}" loading="lazy" class="task-result-grid-img">`;
            });
            html += '</div>';
        } else if (unique.length > 1 && isAud) {
            // Multi-audio generic
            unique.forEach((u, i) => {
                html += `<div class="task-result-audio-track">
                    <span class="audio-track-label">Faixa ${i + 1}</span>
                    <audio src="${esc(u)}" controls style="width:100%"></audio>
                </div>`;
            });
        } else if (isVid) {
            html += `<video src="${esc(unique[0])}" controls preload="metadata" style="width:100%"></video>`;
        } else if (isAud) {
            html += `<audio src="${esc(unique[0])}" controls style="width:100%"></audio>`;
        } else {
            html += `<img src="${esc(unique[0])}" alt="Result" loading="lazy">`;
        }
        html += '</div>';
        html += '<div class="task-result-actions">';
        unique.forEach((u, i) => {
            html += `<a href="${esc(u)}" target="_blank" class="btn-download">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ${unique.length > 1 ? `Download ${i + 1}` : 'Download'}</a>`;
        });

        if (task.model.startsWith('veo3/')) {
            html += `<button class="btn-ghost btn-sm veo-action" data-action="veo3/get-1080p" data-task-id="${esc(task.id)}">HD</button>`;
            html += `<button class="btn-ghost btn-sm veo-action" data-action="veo3/get-4k" data-task-id="${esc(task.id)}">4K</button>`;
            html += `<button class="btn-ghost btn-sm veo-action" data-action="veo3/extend-fast" data-task-id="${esc(task.id)}">Extend</button>`;
            html += `<button class="btn-ghost btn-sm veo-action" data-action="veo3/extend-quality" data-task-id="${esc(task.id)}">Extend (Pro)</button>`;
        }

        // MJ post-generation actions (Upscale, Vary, Video Extend)
        if (task.mode === 'midjourney' && task.state === 'success') {
            const isMjVideo = task.model === 'mj-video';
            html += '<div class="mj-actions-grid">';
            if (!isMjVideo) {
                // Upscale U1–U4 (imageIndex 0-3 per docs)
                html += '<div class="mj-action-row">';
                for (let i = 0; i < 4; i++) {
                    html += `<button class="btn-ghost btn-sm mj-action" data-mj-op="upscale" data-mj-index="${i}" data-task-id="${esc(task.id)}" title="Upscale imagem ${i + 1}">U${i + 1}</button>`;
                }
                html += '</div>';
                // Vary V1–V4 (imageIndex 1-4 per docs)
                html += '<div class="mj-action-row">';
                for (let i = 1; i <= 4; i++) {
                    html += `<button class="btn-ghost btn-sm mj-action" data-mj-op="vary" data-mj-index="${i}" data-task-id="${esc(task.id)}" title="Variação da imagem ${i}">V${i}</button>`;
                }
                html += '</div>';
            }
            if (isMjVideo) {
                // Video extend options
                html += '<div class="mj-action-row">';
                html += `<button class="btn-ghost btn-sm mj-action" data-mj-op="video-extend" data-mj-extend-type="mj_video_extend_auto" data-mj-index="0" data-task-id="${esc(task.id)}">Extend (Auto)</button>`;
                html += `<button class="btn-ghost btn-sm mj-action" data-mj-op="video-extend" data-mj-extend-type="mj_video_extend_manual" data-mj-index="0" data-task-id="${esc(task.id)}">Extend (Manual)</button>`;
                html += '</div>';
            }
            html += '</div>';
        }

        html += '</div>';
    }
    // Cost/time info for completed tasks
    if (data.costTime) {
        html += `<div style="padding: 0 16px; font-size:11px;color:var(--text-muted);margin-top:12px">⏱ ${(data.costTime / 1000).toFixed(1)}s</div>`;
    }
    html += `<details style="padding: 0 16px 12px 16px; margin-top:8px"><summary style="font-size:11px;color:var(--text-muted);cursor:pointer">Ver JSON</summary><div class="task-result-json">${esc(JSON.stringify(task.data, null, 2))}</div></details>`;
    container.innerHTML = html;
}

function badgeLabel(s) {
    return { waiting: 'Na fila...', processing: 'Processando', success: 'Concluído', fail: 'Falhou', error: 'Erro' }[s] || s;
}

// ==================== Tabs ====================

function initTabs() {
    $$('.panel-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.panel-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            if (els.tabActive) els.tabActive.classList.toggle('hidden', target !== 'active');
            if (els.tabHistory) els.tabHistory.classList.toggle('hidden', target !== 'history');
            // Show/hide clear button based on tab
            if (els.btnClearTasks) els.btnClearTasks.classList.toggle('hidden', target !== 'active');
        });
    });
}

function updateActiveCount() {
    const matchedTasks = tasks.filter(t => t.cat === currentCat);
    const processing = matchedTasks.filter(t => t.state === 'processing' || t.state === 'waiting').length;
    if (els.activeCount) els.activeCount.textContent = processing;
    if (els.activeCount) els.activeCount.classList.toggle('hidden', processing === 0);

    // Also toggle visibility of tasks in the list:
    els.tasksList.querySelectorAll('.task-card').forEach(card => {
        const taskId = card.id.replace('task-', '');
        const task = tasks.find(t => t.id === taskId);
        if (task) card.style.display = task.cat === currentCat ? 'flex' : 'none';
    });
}

function updateHistoryCount() {
    const history = loadHistory().filter(h => h.cat === currentCat);
    const count = history.length;
    if (els.historyCount) els.historyCount.textContent = count;
    if (els.historyCount) els.historyCount.classList.toggle('hidden', count === 0);
}

// ==================== History ====================

function initHistory() {
    renderHistoryGallery();
    updateHistoryCount();
    updateActiveCount();

    // Filter handler
    if (els.historyFilter) {
        els.historyFilter.addEventListener('change', () => renderHistoryGallery());
    }

    // Clear history
    if (els.btnClearHistory) {
        els.btnClearHistory.addEventListener('click', () => {
            if (!confirm('Limpar histórico desta categoria?')) return;
            // Keep history from other categories, clear current
            const keptHistory = loadHistory().filter(h => h.cat !== currentCat);
            saveHistory(keptHistory);
            renderHistoryGallery();
            updateHistoryCount();
            toast('🗑️ Histórico limpo', 'info');
        });
    }
}

function renderHistoryGallery() {
    if (!els.historyGallery) return;
    const allHistory = loadHistory();
    const history = allHistory.filter(h => h.cat === currentCat); // filter to active category
    const filterModel = els.historyFilter?.value || '';

    // Populate model filter dropdown with models from this category
    const models = [...new Set(history.map(h => h.model))].sort();
    if (els.historyFilter) {
        const current = els.historyFilter.value;
        els.historyFilter.innerHTML = '<option value="">Todos os modelos</option>';
        models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m; opt.textContent = m;
            if (m === current) opt.selected = true;
            els.historyFilter.appendChild(opt);
        });
    }

    // Filter by model dropdown
    const filtered = filterModel ? history.filter(h => h.model === filterModel) : history;

    // Show/hide empty state
    if (els.historyEmpty) els.historyEmpty.classList.toggle('hidden', filtered.length > 0);

    // Render gallery
    els.historyGallery.innerHTML = '';
    filtered.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.dataset.historyId = entry.id;

        const url = entry.urls[0] || '';
        const isVid = /\.(mp4|mov|webm|avi)($|\?)/i.test(url) || entry.model === 'mj-video' || entry.model.startsWith('veo3/');
        const isSuno = entry.model.startsWith('suno/');
        const isMj = entry.model.startsWith('mj-');

        let thumbHtml;
        if (isSuno) {
            if (entry.coverUrl) {
                // Suno: show cover art as thumbnail
                thumbHtml = `<img src="${esc(entry.coverUrl)}" alt="" loading="lazy" class="history-thumb-media">
                             <div class="history-thumb-audio-badge">♫</div>`;
            } else {
                thumbHtml = `<div class="history-thumb-audio">
                                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                                     <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                                 </svg>
                             </div>`;
            }
        } else if (isMj && entry.urls.length > 1 && !isVid) {
            // Multi-image mini-grid (MJ 4 images)
            thumbHtml = '<div class="history-thumb-grid">';
            entry.urls.slice(0, 4).forEach(u => {
                thumbHtml += `<img src="${esc(u)}" alt="" loading="lazy" class="history-thumb-grid-img">`;
            });
            thumbHtml += '</div>';
        } else if (isVid) {
            thumbHtml = `<video src="${esc(url)}#t=0.001" muted preload="metadata" class="history-thumb-media"></video>
                         <div class="history-play-icon">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
                         </div>`;
        } else if (url) {
            thumbHtml = `<img src="${esc(url)}" alt="" loading="lazy" class="history-thumb-media">`;
        } else {
            thumbHtml = `<div class="history-thumb-empty">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
                                 <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                                 <polyline points="21 15 16 10 5 21"/>
                             </svg>
                         </div>`;
        }

        const timeStr = formatTimeAgo(entry.timestamp);

        const modelData = getModelDetails(entry.model);
        const mIcon = modelData ? `<span class="card-model-icon ${modelData.color}">${modelData.icon}</span>` : '';
        const mName = modelData ? esc(`${modelData.provider} ${modelData.name}`) : esc(entry.model.split('/').pop());

        const mColor = modelData ? modelData.color : '';

        card.innerHTML = `
            <div class="history-card-accent ${mColor}"></div>
            <div class="history-card-thumb">${thumbHtml}</div>
            <div class="history-card-footer">
                <span class="history-card-model">${mIcon}${mName}</span>
                <span class="history-card-time">${esc(timeStr)}</span>
            </div>`;

        // Click to open lightbox
        card.addEventListener('click', () => openHistoryLightbox(entry));
        els.historyGallery.appendChild(card);
    });
}

function formatTimeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d atrás`;
    return new Date(ts).toLocaleDateString('pt-BR');
}

// ==================== History Lightbox ====================

function openHistoryLightbox(entry) {
    // Remove existing
    const existing = document.getElementById('history-lightbox');
    if (existing) existing.remove();

    const url = entry.urls[0] || '';
    const isVid = /\.(mp4|mov|webm|avi)($|\?)/i.test(url);
    const isAud = /\.(mp3|wav|ogg|aac)($|\?)/i.test(url);

    let mediaHtml;
    if (entry.urls.length > 1 && !isVid && !isAud) {
        // Multi-image grid (MJ 4 images etc.)
        mediaHtml = '<div class="task-result-grid lightbox-grid">';
        entry.urls.forEach((u, i) => {
            mediaHtml += `<img src="${esc(u)}" alt="Result ${i + 1}" loading="lazy" class="task-result-grid-img lightbox-media">`;
        });
        mediaHtml += '</div>';
    } else if (entry.model && entry.model.startsWith('suno/')) {
        // Multi-audio (Suno tracks) with premium layout
        mediaHtml = '<div style="display:flex; flex-direction:column; gap:16px;">';
        const sunoArr = entry.sunoData || [];

        // Backward compatibility for old history items
        if (sunoArr.length === 0 && entry.urls) {
            entry.urls.forEach((u, i) => {
                sunoArr.push({ audioUrl: u, imageUrl: entry.coverUrl || '', title: entry.trackTitle || `Faixa ${i + 1}` });
            });
        }

        sunoArr.forEach((track, i) => {
            const audioSrc = track.audioUrl || track.sourceAudioUrl || '';
            const coverSrc = track.imageUrl || track.sourceImageUrl || '';
            const title = track.title || `Faixa ${i + 1}`;
            const tags = track.tags || '';
            const dur = track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}` : '';
            const lyrics = track.prompt || '';

            mediaHtml += `<div class="suno-track-card" style="border: 1px solid var(--border); border-radius: 8px;">
                <div class="suno-track-header">
                    ${coverSrc ? `<img src="${esc(coverSrc)}" alt="${esc(title)}" class="suno-track-cover">` : ''}
                    <div class="suno-track-info">
                        <div class="suno-track-title">${esc(title)}</div>
                        ${dur ? `<span class="suno-track-duration">${dur}</span>` : ''}
                        ${tags ? `<div class="suno-track-tags">${esc(tags.substring(0, 120))}${tags.length > 120 ? '…' : ''}</div>` : ''}
                    </div>
                </div>
                <audio src="${esc(audioSrc)}" controls style="width:100%"></audio>
                ${lyrics ? `<details class="suno-track-lyrics-wrap"><summary>Ver Letra</summary><pre class="suno-track-lyrics">${esc(lyrics)}</pre></details>` : ''}
            </div>`;
        });
        mediaHtml += '</div>';
    } else if (isVid) {
        mediaHtml = `<video src="${esc(url)}" controls autoplay preload="auto" class="lightbox-media" playsinline></video>`;
    } else if (isAud) {
        mediaHtml = `<audio src="${esc(url)}" controls autoplay class="lightbox-audio"></audio>`;
    } else if (url) {
        mediaHtml = `<img src="${esc(url)}" alt="Result" class="lightbox-media">`;
    } else {
        mediaHtml = '<p style="color:var(--text-muted)">Sem mídia disponível</p>';
    }

    const promptHtml = entry.prompt ? `<p class="lightbox-prompt">${esc(entry.prompt)}</p>` : '';
    const costHtml = entry.costTime ? `<span class="lightbox-cost">⏱ ${(entry.costTime / 1000).toFixed(1)}s</span>` : '';

    const overlay = document.createElement('div');
    overlay.id = 'history-lightbox';
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-content">
            <div class="lightbox-header">
                <div class="lightbox-info">
                    <span class="lightbox-model">${esc(entry.model)}</span>
                    <span class="lightbox-date">${new Date(entry.timestamp).toLocaleString('pt-BR')}</span>
                    ${costHtml}
                </div>
                <button class="lightbox-close" title="Fechar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="lightbox-body">
                ${mediaHtml}
            </div>
            ${promptHtml}
            <div class="lightbox-actions">
                ${entry.urls.map((u, i) => `<a href="${esc(u)}" target="_blank" class="btn-download">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    ${entry.urls.length > 1 ? `Download ${i + 1}` : 'Download'}
                </a>`).join('')}
                
                ${entry.model.startsWith('veo3/') ? `
                    <button class="btn-ghost btn-sm veo-action" data-action="veo3/get-1080p" data-task-id="${esc(entry.id)}">HD</button>
                    <button class="btn-ghost btn-sm veo-action" data-action="veo3/get-4k" data-task-id="${esc(entry.id)}">4K</button>
                    <button class="btn-ghost btn-sm veo-action" data-action="veo3/extend-fast" data-task-id="${esc(entry.id)}">Extend</button>
                    <button class="btn-ghost btn-sm veo-action" data-action="veo3/extend-quality" data-task-id="${esc(entry.id)}">Extend (Pro)</button>
                ` : ''}

                ${entry.model.startsWith('mj-') ? (() => {
            const isMjVideo = entry.model === 'mj-video';
            let btns = '';
            if (!isMjVideo) {
                for (let i = 0; i < 4; i++) btns += `<button class="btn-ghost btn-sm mj-action" data-mj-op="upscale" data-mj-index="${i}" data-task-id="${esc(entry.id)}">U${i + 1}</button>`;
                for (let i = 1; i <= 4; i++) btns += `<button class="btn-ghost btn-sm mj-action" data-mj-op="vary" data-mj-index="${i}" data-task-id="${esc(entry.id)}">V${i}</button>`;
            }
            if (isMjVideo) {
                btns += `<button class="btn-ghost btn-sm mj-action" data-mj-op="video-extend" data-mj-extend-type="mj_video_extend_auto" data-mj-index="0" data-task-id="${esc(entry.id)}">Extend (Auto)</button>`;
                btns += `<button class="btn-ghost btn-sm mj-action" data-mj-op="video-extend" data-mj-extend-type="mj_video_extend_manual" data-mj-index="0" data-task-id="${esc(entry.id)}">Extend (Manual)</button>`;
            }
            return btns;
        })() : ''}

                <button class="btn-ghost btn-sm lightbox-reuse" data-id="${esc(entry.id)}" title="Reutilizar Prompt e Configurações">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                    </svg>
                    Reutilizar
                </button>
                <button class="btn-ghost btn-sm btn-danger lightbox-delete" data-id="${esc(entry.id)}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/>
                    </svg>
                    Remover
                </button>
            </div>
        </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));

    // Close handlers
    overlay.querySelector('.lightbox-backdrop').addEventListener('click', () => closeLightbox(overlay));
    overlay.querySelector('.lightbox-close').addEventListener('click', () => closeLightbox(overlay));
    overlay.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(overlay); });

    // Reuse handler
    overlay.querySelector('.lightbox-reuse')?.addEventListener('click', async () => {
        const modelData = getModelDetails(entry.model);
        if (modelData) {
            if (entry.cat !== currentCat) {
                const catTab = document.querySelector(`.sidebar-nav-item[data-cat="${entry.cat}"]`);
                if (catTab) catTab.click();
            }
            selectModelFromData(modelData);

            if (entry.prompt && els.configPrompt) {
                els.configPrompt.value = entry.prompt;
                updateSubmitState();
            }
            if (entry.extraParams) {
                setTimeout(() => {
                    const ep = entry.extraParams;
                    // For Midjourney
                    if (ep.ar) { const el = document.querySelector(`input[name="mj-ar"][value="${ep.ar}"]`); if (el) el.click(); }
                    if (ep.speed) { const el = document.querySelector(`input[name="mj-speed"][value="${ep.speed}"]`); if (el) el.click(); }
                    if (ep.version) { const el = document.querySelector(`input[name="mj-version"][value="${ep.version}"]`); if (el) el.click(); }

                    // For other models
                    for (const [k, v] of Object.entries(ep)) {
                        // find input
                        const selectEl = els.configParams.querySelector(`select[data-param-key="${k}"]`);
                        if (selectEl) { selectEl.value = v; continue; }
                        const radioEl = els.configParams.querySelector(`input[type="radio"][name="param-${k}"][value="${v}"]`);
                        if (radioEl) { radioEl.click(); continue; }
                        const numEl = els.configParams.querySelector(`input[type="range"][data-param-key="${k}"], input[type="number"][data-param-key="${k}"]`);
                        if (numEl) { numEl.value = v; numEl.dispatchEvent(new Event('input', { bubbles: true })); continue; }
                        const chkEl = els.configParams.querySelector(`input[type="checkbox"][data-param-key="${k}"]`);
                        if (chkEl) { chkEl.checked = v; continue; }
                        const txtEl = els.configParams.querySelector(`input[type="text"][data-param-key="${k}"]`);
                        if (txtEl) { txtEl.value = v; continue; }
                    }
                }, 100);
            }

            if (entry.inputFileUrl) {
                try {
                    toast('Baixando mídia original...', 'info');
                    const resp = await fetch(entry.inputFileUrl);
                    if (!resp.ok) throw new Error('Download failed');
                    const blob = await resp.blob();

                    // Determine filename and type from URL if possible
                    let ext = 'jpg';
                    if (entry.inputFileUrl.includes('.mp4')) ext = 'mp4';
                    else if (entry.inputFileUrl.includes('.png')) ext = 'png';
                    else if (entry.inputFileUrl.includes('.webm')) ext = 'webm';
                    else if (entry.inputFileUrl.includes('.mp3')) ext = 'mp3';

                    const file = new File([blob], `input.${ext}`, { type: blob.type });
                    handleFileSelect(file);
                } catch (err) {
                    console.error('Failed to load input file', err);
                    toast('⚠️ Não foi possível carregar a mídia original', 'error');
                }
            }

            const activeTabBtn = document.querySelector('.panel-tab[data-tab="active"]');
            if (activeTabBtn) activeTabBtn.click();

            closeLightbox(overlay);
            toast('⚙️ Configurações prontas!', 'success');
        } else {
            toast('⚠️ Modelo não encontrado', 'error');
        }
    });

    // Delete handler
    overlay.querySelector('.lightbox-delete')?.addEventListener('click', () => {
        const history = loadHistory().filter(h => h.id !== entry.id);
        saveHistory(history);
        renderHistoryGallery();
        updateHistoryCount();
        closeLightbox(overlay);
        toast('🗑️ Geração removida do histórico', 'info');
    });

    // Trap focus
    overlay.querySelector('.lightbox-close').focus();
}

function closeLightbox(overlay) {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 300);
}

// ==================== Toast ====================

function toast(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-dot"></span>${esc(msg)}`;
    $('#toast-container').appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000);
}

function esc(s) { const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; }

// ==================== Post-Generation Actions ====================

// Veo post-actions (HD, 4K, Extend)
document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('.veo-action');
    if (!btn) return;

    const actionModel = btn.dataset.action;
    const originalTaskId = btn.dataset.taskId;
    if (!originalTaskId) return;

    // Check if task exists locally or get from history
    let existingTask = tasks.find(t => t.id === originalTaskId);
    if (!existingTask) {
        existingTask = loadHistory().find(h => h.id === originalTaskId);
    }

    // Disable button visually
    const prevText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;
    btn.classList.add('loading');

    currentCat = 'veo3';

    try {
        const fd = new FormData();
        fd.append('model', actionModel);
        fd.append('input_json', JSON.stringify({ taskId: originalTaskId }));

        // Veo actions use the dedicated Veo endpoint, not Market
        const resp = await fetch(`${API}/api/veo/create`, { method: 'POST', body: fd });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || 'Failed');

        const taskId = json?.data?.taskId || json?.task?.data?.taskId || json?.taskId;
        if (taskId) {
            addTask(taskId, actionModel, 'veo', existingTask?.inputFileUrl || null);
            toast(`✅ ${actionModel.split('/').pop()} enviado!`, 'success');

            // Switch tab to active requests if clicking from history
            const targetLightbox = e.target.closest('#history-lightbox');
            if (targetLightbox) closeLightbox(targetLightbox);
        }
    } catch (err) {
        toast(`❌ Erro: ${err.message}`, 'error');
    } finally {
        btn.textContent = prevText;
        btn.disabled = false;
        btn.classList.remove('loading');
    }
});

// MJ post-actions (Upscale, Vary, Video Extend)
document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('.mj-action');
    if (!btn) return;

    const op = btn.dataset.mjOp;            // 'upscale' | 'vary' | 'video-extend'
    const index = parseInt(btn.dataset.mjIndex, 10);
    const originalTaskId = btn.dataset.taskId;
    if (!originalTaskId || !op) return;

    // Disable button visually
    const prevText = btn.textContent;
    btn.textContent = '...';
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        let payload, endpoint, opLabel;

        if (op === 'upscale') {
            payload = { taskId: originalTaskId, imageIndex: index };
            endpoint = '/api/mj/upscale';
            opLabel = `Upscale U${index + 1}`;
        } else if (op === 'vary') {
            payload = { taskId: originalTaskId, imageIndex: index };
            endpoint = '/api/mj/vary';
            opLabel = `Variação V${index}`;
        } else if (op === 'video-extend') {
            const extendType = btn.dataset.mjExtendType || 'mj_video_extend_auto';
            payload = { taskId: originalTaskId, index: index, taskType: extendType };
            // If manual, prompt from the prompt field (if visible)
            if (extendType === 'mj_video_extend_manual') {
                const manualPrompt = prompt('Digite o prompt para extensão manual do vídeo:', '');
                if (manualPrompt === null) { btn.textContent = prevText; btn.disabled = false; btn.classList.remove('loading'); return; }
                payload.prompt = manualPrompt;
            }
            endpoint = '/api/mj/video-extend';
            opLabel = extendType === 'mj_video_extend_auto' ? 'Extend (Auto)' : 'Extend (Manual)';
        } else {
            return;
        }

        const fd = new FormData();
        fd.append('payload_json', JSON.stringify(payload));

        const resp = await fetch(`${API}${endpoint}`, { method: 'POST', body: fd });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || 'Falha ao executar ação MJ');

        const taskId = json?.data?.taskId;
        if (taskId) {
            currentCat = 'mj';
            addTask(taskId, `mj-${op}`, 'midjourney', null, { parentTaskId: originalTaskId, op, index });
            toast(`✅ ${opLabel} enviado!`, 'success');

            // Close lightbox if clicking from history
            const targetLightbox = e.target.closest('#history-lightbox');
            if (targetLightbox) closeLightbox(targetLightbox);
        }
    } catch (err) {
        toast(`❌ Erro MJ: ${err.message}`, 'error');
    } finally {
        btn.textContent = prevText;
        btn.disabled = false;
        btn.classList.remove('loading');
    }
});

// Suno post-actions (Extend, Add Instrumental, Add Vocals, Separate, Music Video, WAV)
document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('.suno-action');
    if (!btn) return;

    const model = btn.dataset.sunoModel;
    const audioId = btn.dataset.audioId;
    const taskId = btn.dataset.taskId;
    if (!model || !taskId) return;

    const prevText = btn.textContent;
    btn.textContent = '...';
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        const extra = {};
        if (audioId) extra.audioId = audioId;
        if (taskId) extra.taskId = taskId;

        // For extend-music, ask for style/tags optionally
        if (model === 'suno/extend-music') {
            const style = window.prompt('Estilo musical para extensão (opcional, deixe vazio para manter):');
            if (style === null) { btn.textContent = prevText; btn.disabled = false; btn.classList.remove('loading'); return; }
            if (style.trim()) extra.style = style.trim();
        }

        // For separate-vocals, set type=both by default
        if (model === 'suno/separate-vocals') {
            extra.type = 'both';
        }

        const fd = new FormData();
        fd.append('model', model);
        fd.append('input_json', JSON.stringify(extra));

        const resp = await fetch(`${API}/api/suno/create`, { method: 'POST', body: fd });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || 'Falha ao executar ação Suno');

        const newTaskId = json?.data?.taskId || json?.task?.data?.taskId || json?.taskId;
        if (newTaskId) {
            const label = model.split('/').pop().replace(/-/g, ' ');
            addTask(newTaskId, model, 'suno', null, { parentTaskId: taskId, audioId });
            toast(`✅ Suno ${label} enviado!`, 'success');

            const targetLightbox = e.target.closest('#history-lightbox');
            if (targetLightbox) closeLightbox(targetLightbox);
        }
    } catch (err) {
        toast(`❌ Erro Suno: ${err.message}`, 'error');
    } finally {
        btn.textContent = prevText;
        btn.disabled = false;
        btn.classList.remove('loading');
    }
});

// ==================== DEBUG / MOCK ====================
// Run mockSunoGeneration() in console to test the UI without spending credits!
window.mockSunoGeneration = function () {
    const mockTask = {
        id: 'mock-suno-task-' + Date.now(),
        model: 'suno/suno-v4',
        state: 'success',
        cat: currentCat,
        _prompt: 'Uma música épica de teste',
        timestamp: Date.now(),
        data: {
            data: {
                costTime: 12500,
                response: {
                    sunoData: [
                        {
                            id: 'track-1',
                            title: 'Cyberpunk Awakening',
                            tags: 'synthwave, cyberpunk, epic, bass',
                            lyrics: '[Verse 1]\nCity lights flashing in the dark\nNeon glowing like a spark\n\n[Chorus]\nWake up to the future now\nWe are breaking all the bounds',
                            imageUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=400&auto=format&fit=crop',
                            audioUrl: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3',
                            videoUrl: ''
                        },
                        {
                            id: 'track-2',
                            title: 'Cyberpunk Awakening (Acoustic)',
                            tags: 'acoustic, chill, synth',
                            lyrics: '[Verse 1]\nCity lights flashing in the dark\nQuiet neon like a spark...',
                            imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=400&auto=format&fit=crop',
                            audioUrl: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3',
                            videoUrl: ''
                        }
                    ]
                }
            }
        }
    };

    // Salva globalmente (memoria) e visualmente
    if (typeof window.kieActiveTasks === 'undefined') window.kieActiveTasks = {};
    window.kieActiveTasks[mockTask.id] = mockTask;

    addPendingTask(mockTask);
    addToHistory(mockTask);

    // renderTaskCard handles all DOM injection safely
    renderTaskCard(mockTask);

    toast('Simulação Suno criada! Vá para a aba Ativas.', 'success');
};

// ============================================================
//  NANO BANANA V2 — WORKSPACE OVERLAY CONTROLLER
//  Fully functional: connects to existing submit infrastructure
// ============================================================

(function initV2Workspace() {
    const ws = document.getElementById('v2-workspace');
    if (!ws) return;

    // ── DOM references ──
    const v2 = {
        ws,
        prompt: document.getElementById('v2-prompt'),
        charCounter: document.getElementById('v2-char-counter'),
        uploadZone: document.getElementById('v2-upload-zone'),
        fileInput: document.getElementById('v2-file-input'),
        filePreview: document.getElementById('v2-file-preview'),
        fileThumb: document.getElementById('v2-file-thumb'),
        fileName: document.getElementById('v2-file-name'),
        fileRemove: document.getElementById('v2-file-remove'),
        filter: document.getElementById('v2-filter'),
        btnGenerate: document.getElementById('v2-btn-generate'),
        btnBack: document.getElementById('v2-btn-back'),
        btnReset: document.getElementById('v2-btn-reset'),
        gallery: document.getElementById('v2-gallery'),
        galleryEmpty: document.getElementById('v2-gallery-empty'),
        galleryCount: document.getElementById('v2-gallery-count'),
        valDimensions: document.getElementById('v2-val-dimensions'),
        valResolution: document.getElementById('v2-val-resolution'),
        valFormat: document.getElementById('v2-val-format'),
        valSeed: document.getElementById('v2-val-seed'),
        seedInput: document.getElementById('v2-seed'),
        creditsAmount: document.getElementById('v2-credits'),
    };

    // ── State ──
    let v2File = null;
    let v2Settings = {
        aspect_ratio: '1:1',
        resolution: '1K',
        output_format: 'png',
        seed: null,
        filter: 'none'
    };
    let v2Tasks = []; // Track tasks spawned from V2 workspace

    // ── Show / Hide ──
    window._v2ShowWorkspace = function () {
        ws.classList.remove('hidden');
        document.getElementById('app-main').classList.add('hidden');
        v2.prompt.focus();
        updateV2GenerateState();
        refreshV2Gallery();
    };

    window._v2HideWorkspace = function () {
        ws.classList.add('hidden');
        document.getElementById('app-main').classList.remove('hidden');
    };

    // ── Back button ──
    v2.btnBack.addEventListener('click', () => {
        window._v2HideWorkspace();
    });

    // ── Prompt ──
    v2.prompt.addEventListener('input', () => {
        const len = v2.prompt.value.length;
        v2.charCounter.textContent = `${len.toLocaleString('pt-BR')} / 2.000`;
        updateV2GenerateState();
    });

    // ── Upload Zone ──
    v2.uploadZone.addEventListener('click', () => v2.fileInput.click());
    v2.uploadZone.addEventListener('dragover', e => { e.preventDefault(); v2.uploadZone.classList.add('dragover'); });
    v2.uploadZone.addEventListener('dragleave', () => v2.uploadZone.classList.remove('dragover'));
    v2.uploadZone.addEventListener('drop', e => {
        e.preventDefault();
        v2.uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) v2HandleFile(e.dataTransfer.files[0]);
    });
    v2.fileInput.addEventListener('change', () => {
        if (v2.fileInput.files.length) v2HandleFile(v2.fileInput.files[0]);
    });
    v2.fileRemove.addEventListener('click', () => v2ClearFile());

    function v2HandleFile(file) {
        v2File = file;
        v2.fileThumb.src = URL.createObjectURL(file);
        v2.fileName.textContent = file.name;
        v2.uploadZone.style.display = 'none';
        v2.filePreview.classList.remove('hidden');
        updateV2GenerateState();
    }

    function v2ClearFile() {
        v2File = null;
        v2.fileInput.value = '';
        v2.uploadZone.style.display = '';
        v2.filePreview.classList.add('hidden');
        updateV2GenerateState();
    }

    // ── Settings: Dimension buttons ──
    ws.querySelectorAll('.v2-dim-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            ws.querySelectorAll('.v2-dim-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            v2Settings.aspect_ratio = btn.dataset.ar;
            v2.valDimensions.textContent = btn.dataset.dim;
        });
    });

    // ── Settings: Resolution buttons ──
    ws.querySelectorAll('.v2-res-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            ws.querySelectorAll('.v2-res-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            v2Settings.resolution = btn.dataset.res;
            v2.valResolution.textContent = btn.dataset.res;
            // Update cost estimate
            const costMap = { '1K': 18, '2K': 18, '4K': 24 };
            v2.creditsAmount.textContent = `~${costMap[btn.dataset.res] || 18} credits`;
        });
    });

    // ── Settings: Format buttons ──
    ws.querySelectorAll('.v2-fmt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            ws.querySelectorAll('.v2-fmt-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            v2Settings.output_format = btn.dataset.fmt;
            v2.valFormat.textContent = btn.dataset.fmt.toUpperCase();
        });
    });

    // ── Settings: Seed ──
    v2.seedInput.addEventListener('input', () => {
        const val = v2.seedInput.value.trim();
        v2Settings.seed = val ? parseInt(val, 10) : null;
        v2.valSeed.textContent = val || 'Random';
    });

    // ── Settings: Reset ──
    v2.btnReset.addEventListener('click', () => {
        v2Settings = { aspect_ratio: '1:1', resolution: '1K', output_format: 'png', seed: null, filter: 'none' };
        ws.querySelectorAll('.v2-dim-btn').forEach(b => b.classList.remove('active'));
        ws.querySelector('.v2-dim-btn[data-ar="1:1"]').classList.add('active');
        ws.querySelectorAll('.v2-res-btn').forEach(b => b.classList.remove('active'));
        ws.querySelector('.v2-res-btn[data-res="1K"]').classList.add('active');
        ws.querySelectorAll('.v2-fmt-btn').forEach(b => b.classList.remove('active'));
        ws.querySelector('.v2-fmt-btn[data-fmt="png"]').classList.add('active');
        v2.seedInput.value = '';
        v2.filter.value = 'none';
        v2.valDimensions.textContent = '1024 × 1024';
        v2.valResolution.textContent = '1K';
        v2.valFormat.textContent = 'PNG';
        v2.valSeed.textContent = 'Random';
        v2.creditsAmount.textContent = '~18 credits';
    });

    // ── Generate button state ──
    function updateV2GenerateState() {
        const hasPrompt = v2.prompt.value.trim().length > 0;
        const hasFile = !!v2File;
        v2.btnGenerate.disabled = !(hasPrompt || hasFile);
    }

    // ── GENERATE — Functional submit using existing API infrastructure ──
    v2.btnGenerate.addEventListener('click', async () => {
        if (v2.btnGenerate.disabled) return;

        const prompt = v2.prompt.value.trim();
        const btnSpan = v2.btnGenerate.querySelector('span');
        const origText = btnSpan.textContent;

        v2.btnGenerate.classList.add('loading');
        v2.btnGenerate.disabled = true;
        btnSpan.textContent = 'Generating...';

        try {
            const extra = {
                aspect_ratio: v2Settings.aspect_ratio,
                resolution: v2Settings.resolution,
                output_format: v2Settings.output_format
            };
            if (prompt) extra.prompt = prompt;
            if (v2Settings.seed !== null && !isNaN(v2Settings.seed)) extra.seed = v2Settings.seed;
            // Append filter as style hint in prompt if not 'none'
            if (v2Settings.filter !== 'none' && prompt) {
                extra.prompt = `${prompt}, ${v2Settings.filter} style`;
            }

            const resolvedModel = 'nano-banana-v2';
            let json;

            if (v2File) {
                // File + prompt: use /api/process
                const fd = new FormData();
                fd.append('file', v2File);
                fd.append('model', resolvedModel);
                fd.append('file_field', 'image_url');
                fd.append('uploadPath', 'images');
                fd.append('input_json', JSON.stringify(extra));
                const resp = await fetch(`${API}/api/process`, { method: 'POST', body: fd });
                json = await resp.json();
                if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
                if (json.code && json.code !== 200) throw new Error(json.msg || `API error (code ${json.code})`);
                const taskId = json?.task?.data?.taskId;
                if (!taskId) throw new Error(json.msg || json?.task?.msg || 'No taskId returned');
                addTask(taskId, resolvedModel, 'market', json.uploaded_url, extra);
                v2Tasks.push(taskId);
            } else {
                // Text-only: use create-json
                const fd = new FormData();
                fd.append('model', resolvedModel);
                fd.append('input_json', JSON.stringify(extra));
                const resp = await fetch(`${API}/api/market/create-json`, { method: 'POST', body: fd });
                json = await resp.json();
                if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
                if (json.code && json.code !== 200) throw new Error(json.msg || `API error (code ${json.code})`);
                const taskId = json?.data?.taskId;
                if (!taskId) throw new Error(json.msg || 'No taskId returned');
                addTask(taskId, resolvedModel, 'market', null, extra);
                v2Tasks.push(taskId);
            }

            toast('✅ Task created!', 'success');
            v2ClearFile();
            v2.prompt.value = '';
            v2.charCounter.textContent = '0 / 2.000';
            updateV2GenerateState();

            // Add a processing item to V2 gallery immediately
            addV2GalleryItem(v2Tasks[v2Tasks.length - 1], 'processing');

        } catch (err) {
            toast(`❌ Error: ${err.message}`, 'error');
        } finally {
            v2.btnGenerate.classList.remove('loading');
            btnSpan.textContent = origText;
            updateV2GenerateState();
        }
    });

    // ── V2 Gallery Management ──
    function addV2GalleryItem(taskId, state, imageUrl) {
        v2.galleryEmpty.style.display = 'none';

        const item = document.createElement('div');
        item.className = `v2-gallery-item ${state}`;
        item.id = `v2-item-${CSS.escape(taskId)}`;
        item.dataset.taskId = taskId;

        if (state === 'success' && imageUrl) {
            item.innerHTML = `<img src="${imageUrl}" alt="Generated"><div class="v2-gallery-item-overlay"><span class="v2-gallery-item-status">Completed</span></div>`;
        } else if (state === 'failed') {
            item.innerHTML = '<span>Failed</span>';
        }
        // processing state uses CSS ::after spinner

        v2.gallery.insertBefore(item, v2.gallery.firstChild);
        updateV2GalleryCount();
    }

    function updateV2GalleryItem(taskId, state, imageUrl) {
        const item = document.getElementById(`v2-item-${CSS.escape(taskId)}`);
        if (!item) return;

        item.className = `v2-gallery-item ${state}`;

        if (state === 'success' && imageUrl) {
            item.innerHTML = `<img src="${imageUrl}" alt="Generated"><div class="v2-gallery-item-overlay"><span class="v2-gallery-item-status">Completed</span></div>`;
        } else if (state === 'fail' || state === 'failed') {
            item.className = 'v2-gallery-item failed';
            item.innerHTML = '<span>Failed</span>';
        }
        updateV2GalleryCount();
    }

    function updateV2GalleryCount() {
        const count = v2.gallery.querySelectorAll('.v2-gallery-item').length;
        v2.galleryCount.textContent = `${count} image${count !== 1 ? 's' : ''}`;
    }

    // ── Poll observer: watch tasks for state changes and update V2 gallery ──
    // Override the global updateTaskCard to also push updates to V2 gallery
    const _origUpdateTaskCard = window.updateTaskCard || (typeof updateTaskCard === 'function' ? updateTaskCard : null);

    // Patch: after each updateTaskCard call, check if the task is ours
    const checkV2TaskUpdate = (task) => {
        if (!v2Tasks.includes(task.id)) return;

        if (task.state === 'success') {
            const data = task.data?.data || {};
            const urls = _extractResultUrls(data);
            if (urls.length > 0) {
                // Remove the processing placeholder
                const existing = document.getElementById(`v2-item-${CSS.escape(task.id)}`);
                if (existing) existing.remove();
                // Add items for each result URL
                urls.forEach((url, i) => {
                    addV2GalleryItem(`${task.id}-${i}`, 'success', url);
                });
            } else {
                updateV2GalleryItem(task.id, 'success');
            }
        } else if (task.state === 'fail') {
            updateV2GalleryItem(task.id, 'failed');
        }
    };

    // Install a MutationObserver on task cards to detect state changes
    // This is non-invasive: watches the DOM instead of patching functions
    const tasksList = document.getElementById('tasks-list');
    if (tasksList) {
        const observer = new MutationObserver(() => {
            v2Tasks.forEach(taskId => {
                const taskObj = tasks.find(t => t.id === taskId);
                if (taskObj && (taskObj.state === 'success' || taskObj.state === 'fail')) {
                    checkV2TaskUpdate(taskObj);
                }
            });
        });
        observer.observe(tasksList, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    // ── Refresh gallery from existing tasks (on show) ──
    function refreshV2Gallery() {
        // Clear everything except the empty state
        v2.gallery.querySelectorAll('.v2-gallery-item').forEach(el => el.remove());

        // Find all nano-banana-v2 tasks
        const v2TaskList = tasks.filter(t => t.model === 'nano-banana-v2');
        if (v2TaskList.length === 0) {
            v2.galleryEmpty.style.display = '';
            updateV2GalleryCount();
            return;
        }

        v2.galleryEmpty.style.display = 'none';

        v2TaskList.forEach(task => {
            // Ensure tracked
            if (!v2Tasks.includes(task.id)) v2Tasks.push(task.id);

            if (task.state === 'success') {
                const data = task.data?.data || {};
                const urls = _extractResultUrls(data);
                if (urls.length > 0) {
                    urls.forEach((url, i) => {
                        addV2GalleryItem(`${task.id}-${i}`, 'success', url);
                    });
                }
            } else if (task.state === 'fail') {
                addV2GalleryItem(task.id, 'failed');
            } else {
                addV2GalleryItem(task.id, 'processing');
            }
        });
        updateV2GalleryCount();
    }

    // ── Keyboard shortcut: Cmd/Ctrl+Enter to generate ──
    v2.prompt.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!v2.btnGenerate.disabled) v2.btnGenerate.click();
        }
    });

    // ── Escape to go back ──
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !ws.classList.contains('hidden')) {
            // Only if no modal is open on top
            const picker = document.getElementById('modal-model-picker');
            if (picker && !picker.classList.contains('hidden')) return;
            window._v2HideWorkspace();
        }
    });

    console.log('[V2] Nano Banana V2 workspace initialized');
})();
