/**
 * KIE AI Studio — Application Logic v3
 * Full model parameter configuration from KIE docs.
 */

const API = '';

// Global error handler for expired tempfile media URLs
window.handleExpiredMedia = function(el) {
    if (!el || !el.parentElement) return;
    el.outerHTML = `<div class="history-thumb-empty" style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;min-height:100px;gap:6px;opacity:0.5;background:rgba(0,0,0,0.3);border-radius:8px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="3" x2="21" y2="21"/>
        </svg>
        <span style="font-size:10px;color:var(--text-muted);font-family:var(--mono);">Mídia Expirada</span>
    </div>`;
};

// ==================== MODEL PARAMETER REGISTRY ====================
// Each model defines its 'params' — array of { key, label, type, options, default, min, max, step }
// 'cost' is the estimated credits per generation (from KIE API docs)

// Shared category constants
const VIDEO_CATS = ['video', 'seedance2'];

// Topaz video upscale model identifier and accepted MIME types
const TOPAZ_VIDEO_UPSCALE_MODEL = 'topaz/video-upscale';
const TOPAZ_VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm', 'video/x-msvideo'];
const TOPAZ_VIDEO_ACCEPT = 'video/*,.mp4,.mov,.mkv,.avi,.webm';

// Maximum file size for video references (Seedance 2.0)
const MAX_VIDEO_REF_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Maximum file size for video references (Seedance 2.0 Fast)
const MAX_VIDEO_REF_SIZE_FAST_BYTES = 50 * 1024 * 1024; // 50MB

// Maximum file size for image references (Seedance 2.0 Fast)
const MAX_IMAGE_REF_SIZE_BYTES = 30 * 1024 * 1024; // 30MB

// Default maximum file size for images (non-Fast models)
const MAX_IMAGE_DEFAULT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Credit cost estimates (1 credit ≈ $0.005 USD)
const MODEL_COST_ESTIMATES = {
    // ── Image ──
    'nano-banana-2': 8,                   // 1K = 8, 2K = 12, 4K = 18
    'nano-banana-pro': 4,          // image editing
    'seedream/5-lite': 5.5,               // base UI key
    'seedream/5-lite-text-to-image': 5.5, // per image
    'seedream/5-lite-image-to-image': 5.5,  // 5.5 cr/image ($0.0275)
    'flux-2/pro-text-to-image': 5,        // 1K = 5, 2K = 7

    'qwen/text-to-image': 5.6,            // 5.6 cr/image ($0.028)
    'grok-imagine/text-to-image': 4,     // 4 cr/image
    'grok-imagine/image-to-image': 4,    // 4 cr/image
    'gpt4o-image': 22,                   // high=22, medium=4 cr/image
    'flux-kontext-pro': 5,               // 5.0 cr/image ($0.025)
    'flux-kontext-max': 10,              // 10.0 cr/image ($0.05)
    // ── Image Tools ──
    'recraft/remove-background': 1,      // 1.0 cr/image
    'recraft/crisp-upscale': 0.5,        // 0.5 cr/image ($0.0025)
    'topaz/image-upscale': 10,

    'topaz/video-upscale': 12,             // 12 cr/s
    // ── Video (costs vary by duration/resolution, showing default config) ──
    'sora-2-pro-text-to-video': 330,     // Pro High-10s=330, High-15s=630, Standard-10s=150, Standard-15s=270
    'sora-2-pro-image-to-video': 150,     // Pro Standard-10s=150, Standard-15s=270, High-10s=330, High-15s=630
    'kling-3.0/video': 135,               // 27 cr/s × 5s default (1080p+audio)
    'wan/2-7-text-to-video': 40,             // 5s 480p = 40
    'wan/2-7-image-to-video': 40,            // 5s 480p = 40
    'wan/2-7-videoedit': 40,                 // 5s 480p = 40
    'wan/2-7-r2v': 40,                       // 5s 480p = 40
    'grok-imagine/text-to-video': 10,     // 6s 480p = 10, 10s 720p = 30
    'grok-imagine/image-to-video': 10,    // 6s 480p = 10, 10s 720p = 30
    'hailuo/2-3-image-to-video-pro': 45,  // Pro-6s-768p=45, Pro-6s-1080p=80, Pro-10s-768p=90
    // ── Seedance 2.0 (ByteDance) ──
    'bytedance/seedance-2-frames': 375,
    'bytedance/seedance-2-multi': 375,
    'bytedance/seedance-2-video': 375,
    'bytedance/seedance-2-fast': 330,     // 33 cr/s × 10s (720p, no video input)
    // ── Audio (ElevenLabs) ──
    'elevenlabs/text-to-speech-turbo-2-5': 6,   // 6 cr / 1000 chars
    'elevenlabs/text-to-dialogue-v3': 14,       // 14 cr / 1000 chars
    'elevenlabs/sound-effect-v2': 1.2,          // 0.24 cr/s × 5s default = 1.2
    'elevenlabs/speech-to-text': 3.5,            // 3.5 cr/min
    'elevenlabs/audio-isolation': 1,            // 0.2 cr/s
    // ── Music / Suno ──
    'suno/generate-music': 12,            // mashup = 12
    'suno/generate-lyrics': 0.4,          // 0.4 cr/request
    'suno/edit-audio': 12,                // extend/instrumental/vocals/separate
    'suno/utilities': 2,                  // music-video/convert-wav/get-lyrics
    // ── Veo 3.1 (Google) ──
    'veo3/text-to-video': 60,             // Base display cost 
    'veo3/image-to-video': 60,            // Base display cost (fast=60)
    'veo3/text-to-video-fast': 60,        // 60 cr/video
    'veo3/text-to-video-quality': 250,    // 250 cr/video
    'veo3/image-to-video-fast': 60,       // 60 cr/video
    'veo3/image-to-video-quality': 250,   // 250 cr/video
    'veo3/extend-fast': 60,               // 60 cr/video
    'veo3/extend-quality': 250,           // 250 cr/video
    'veo3/get-1080p': 5,                  // 5 cr/video
    'veo3/get-4k': 120,                   // 120 cr/video
};

// ==================== BRAND SVG LOGOS ====================
// Used to override HTML data-icons directly for crisp rendering
const BRAND_LOGOS = {
    'kie.ai': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/></svg>`,
    'bytedance': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M19 12h-3c-1.1 0-2-.9-2-2V7c0-1.1-.9-2-2-2S10 5.9 10 7v3c0 1.1-.9 2-2 2H5c-1.1 0-2 .9-2 2s.9 2 2 2h3c1.1 0 2 .9 2 2v3c0 1.1.9 2 2 2s2-.9 2-2v-3c0-1.1.9-2 2-2h3c1.1 0 2-.9 2-2s-.9-2-2-2z" fill="currentColor"/></svg>`,
    'flux.2': `<svg viewBox="0 0 24 24" fill="none" class="brand-logo-svg"><path d="M5 5h14v3H9v3h8v3H9v5H5V5z" fill="currentColor"/></svg>`,

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
};

// Default V2 settings (used for initialization and reset)
const DEFAULT_V2_SETTINGS = {
    aspect_ratio: '1:1',
    resolution: '1K',
    output_format: 'png',
    seed: null,
    filter: 'none',
    duration: 5,
    videoAr: '16:9',
    mjSpeed: 'relaxed',
    mjVersion: '7',
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

// Shared parameters for all Seedance 2.0 workflows (Frames, Multi, Video)
const SEEDANCE_2_PARAMS = [
    { key: 'seedance_speed', label: 'Velocidade', type: 'radio', options: ['Normal', 'Fast'], default: 'Normal' },
    { key: 'duration', label: 'Duração (s)', type: 'number', default: 10, min: 4, max: 15, step: 1 },
    { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9'], default: '16:9' },
    { key: 'resolution', label: 'Resolução', type: 'select', options: ['480p', '720p'], default: '720p' },
    { key: 'generate_audio', label: 'Gerar Áudio', type: 'bool', default: true },
    { key: 'return_last_frame', label: 'Retornar Último Frame', type: 'bool', default: false },
    { key: 'web_search', label: 'Web Search', type: 'bool', default: false },
];

const MODEL_CONFIGS = {
    // ──── IMAGE MODELS ────
    'nano-banana-2': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['1:8', '1:4', '9:16', '2:3', '3:4', '4:5', '1:1', '5:4', '4:3', '3:2', '16:9', '21:9', '4:1', '8:1', 'auto'], default: '1:1' },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['1K', '2K', '4K'], default: '1K' },
        ]
    },
    'nano-banana-pro': {
        params: [
            { key: 'image_size', label: 'Aspect Ratio', type: 'select', options: ['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9', 'auto'], default: '1:1' },
        ]
    },
    'grok-imagine/text-to-image': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '2:3', '3:2', '16:9', '9:16'], default: '1:1' },
        ]
    },

    'gpt4o-image': {
        params: [
            { key: 'size', label: 'Aspect Ratio', type: 'select', options: ['1:1', '3:2', '2:3'], default: '1:1' },
            { key: 'isEnhance', label: 'Enhance Prompt', type: 'bool', default: false },
        ]
    },
    'flux-kontext-pro': {
        params: [
            { key: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'], default: '1:1' },
            { key: 'promptUpsampling', label: 'Prompt Upsampling', type: 'bool', default: false },
            { key: 'safetyTolerance', label: 'Safety Tolerance', type: 'number', default: 2, min: 0, max: 6, step: 1 },
        ]
    },
    'flux-kontext-max': {
        params: [
            { key: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'], default: '1:1' },
            { key: 'promptUpsampling', label: 'Prompt Upsampling', type: 'bool', default: false },
            { key: 'safetyTolerance', label: 'Safety Tolerance', type: 'number', default: 2, min: 0, max: 6, step: 1 },
        ]
    },
    'seedream/5-lite': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'], default: '1:1' },
            { key: 'quality', label: 'Quality', type: 'select', options: ['basic', 'high'], default: 'basic' },
        ]
    },
    'flux-2/pro-text-to-image': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3'], default: '1:1' },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['1K', '2K'], default: '1K' },
        ]
    },

    'qwen/text-to-image': {
        params: [
            { key: 'acceleration', label: 'Speed', type: 'select', options: ['none', 'regular', 'high'], default: 'none' },
            { key: 'num_images', label: 'Quantidade', type: 'select', options: ['1', '2', '3', '4'], default: '1' },
            { key: 'image_size', label: 'Tamanho', type: 'select', options: ['square', 'square_hd', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9'], default: 'landscape_4_3' },
            { key: 'num_inference_steps', label: 'Steps', type: 'number', default: 25, min: 2, max: 49, step: 1 },
            { key: 'guidance_scale', label: 'Guidance', type: 'number', default: 4, min: 0, max: 20, step: 0.1 },
            { key: 'enable_safety_checker', label: 'Safety', type: 'bool', default: true },
            { key: 'negative_prompt', label: 'Prompt Negativo', type: 'text', default: 'blurry, ugly' },
        ]
    },

    // ──── IMAGE TOOLS ────
    'recraft/remove-background': { params: [] },
    'recraft/crisp-upscale': { params: [] },
    'topaz/image-upscale': {
        params: [
            { key: 'upscale_factor', label: 'Fator de Upscale', type: 'select', options: ['1', '2', '4', '8'], default: '2' },
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
            { key: 'n_frames', label: 'Duração (s)', type: 'select', options: ['10', '15'], default: '10' },
            { key: 'size', label: 'Qualidade', type: 'select', options: ['standard', 'high'], default: 'high' },
            { key: 'remove_watermark', label: 'Sem Watermark', type: 'bool', default: true }
        ]
    },
    'kling-3.0/video': {
        params: [
            { key: 'mode', label: 'Modo', type: 'select', options: ['std', 'pro'], default: 'pro' },
            { key: 'duration', label: 'Duração (s)', type: 'number', default: 5, min: 3, max: 15, step: 1 },
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16', '1:1'], default: '16:9' },
            { key: 'sound', label: 'Som', type: 'bool', default: true },
            { key: 'negative_prompt', label: 'Prompt Negativo', type: 'text', default: '' },
            { key: 'multi_shots', label: 'Multi-Shot', type: 'bool', default: false },
        ]
    },
    'wan/2-7-text-to-video': {
        params: [
            { key: 'negative_prompt', label: 'Prompt Negativo', type: 'text', default: '' },
            { key: 'duration', label: 'Duração (s)', type: 'number', default: 5, min: 3, max: 15, step: 1 },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['720p', '1080p'], default: '1080p' },
            { key: 'ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16', '1:1', '4:3', '3:4'], default: '16:9' },
            { key: 'prompt_extend', label: 'Prompt Extend', type: 'bool', default: true },
            { key: 'watermark', label: 'Watermark', type: 'bool', default: false },
        ]
    },
    'wan/2-7-image-to-video': {
        params: [
            { key: 'negative_prompt', label: 'Prompt Negativo', type: 'text', default: '' },
            { key: 'duration', label: 'Duração (s)', type: 'number', default: 5, min: 3, max: 15, step: 1 },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['720p', '1080p'], default: '1080p' },
            { key: 'prompt_extend', label: 'Prompt Extend', type: 'bool', default: true },
            { key: 'watermark', label: 'Watermark', type: 'bool', default: false },
        ]
    },
    'wan/2-7-videoedit': {
        params: [
            { key: 'negative_prompt', label: 'Prompt Negativo', type: 'text', default: '' },
            { key: 'duration', label: 'Duração (s)', type: 'number', default: 5, min: 3, max: 15, step: 1 },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['720p', '1080p'], default: '1080p' },
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16', '1:1', '4:3', '3:4'], default: '16:9' },
            { key: 'audio_setting', label: 'Audio', type: 'select', options: ['auto', 'origin'], default: 'auto' },
            { key: 'prompt_extend', label: 'Prompt Extend', type: 'bool', default: true },
            { key: 'watermark', label: 'Watermark', type: 'bool', default: false },
        ]
    },
    'wan/2-7-r2v': {
        params: [
            { key: 'negative_prompt', label: 'Prompt Negativo', type: 'text', default: '' },
            { key: 'duration', label: 'Duração (s)', type: 'number', default: 5, min: 3, max: 15, step: 1 },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['720p', '1080p'], default: '1080p' },
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16', '1:1', '4:3', '3:4'], default: '16:9' },
            { key: 'prompt_extend', label: 'Prompt Extend', type: 'bool', default: true },
            { key: 'watermark', label: 'Watermark', type: 'bool', default: false },
        ]
    },
    'grok-imagine/text-to-video': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '16:9', '9:16', '2:3', '3:2', '4:3', '3:4'], default: '16:9' },
            { key: 'mode', label: 'Modo', type: 'select', options: ['fun', 'normal', 'spicy'], default: 'normal' },
            { key: 'duration', label: 'Duração (s)', type: 'number', default: 6, min: 6, max: 30, step: 1 },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['480p', '720p'], default: '480p' },
        ]
    },
    'grok-imagine/image-to-video': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '16:9', '9:16', '2:3', '3:2', '4:3', '3:4'], default: '16:9', hint: 'Só em modo multi-imagem' },
            { key: 'mode', label: 'Modo', type: 'select', options: ['fun', 'normal', 'spicy'], default: 'normal' },
            { key: 'duration', label: 'Duração (s)', type: 'number', default: 6, min: 6, max: 30, step: 1 },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['480p', '720p'], default: '480p' },
        ]
    },
    'sora-2-pro-image-to-video': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['landscape', 'portrait'], default: 'landscape' },
            { key: 'n_frames', label: 'Duração (s)', type: 'select', options: ['10', '15'], default: '10' },
            { key: 'size', label: 'Qualidade', type: 'select', options: ['standard', 'high'], default: 'standard' },
            { key: 'remove_watermark', label: 'Sem Watermark', type: 'bool', default: true }
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
            {
                key: 'voice', label: 'Voz', type: 'select', options: [
                    // ── Featured ──
                    'Rachel', 'Aria', 'Roger', 'Sarah', 'Laura', 'Charlie', 'George', 'Callum', 'River', 'Liam', 'Charlotte', 'Alice', 'Matilda', 'Will', 'Jessica', 'Eric', 'Chris', 'Brian', 'Daniel', 'Lily', 'Bill',
                    // ── Professional & Narration ──
                    'BIvP0GN1cAtSRTxNHnWS', // Ellen - Serious, Direct
                    'aMSt68OGf4xUZAnLpTU8', // Juniper - Grounded
                    'RILOU7YmBhvwJGDGjNmP', // Jane - Professional Audiobook
                    'EkK5I93UQWFDigLMpZcX', // James - Husky, Bold
                    'KoQQbl9zjAdLgKZjm8Ol', // Pro Narrator
                    '6aDn1KB0hjpdcocrUkmq', // Tiffany - Natural
                    'hpp4J3VqNfWAUOO0d1Us', // Bella - Professional
                    'DYkrAHD8iwork3YSUBbs', // Tom - Conversations & Books
                    'eR40ATw9ArzDf9h3v7t7', // Addison 2.0 - Audiobook
                    '1hlpeD1ydbI2ow0Tt3EW', // Olivia - Smooth, Warm
                    'wJqPPQ618aTW29mptyoc', // Ana Rita - Expressive
                    '6F5Zhi321D3Oq7v1oNT4', // Hank - Deep Narrator
                    '8JVbfL6oEdmuxKn5DK2C', // Johnny Kid - Calm Narrator
                    // ── Conversational ──
                    'exsUS4vynmxd379XN4yO', // Blondie - Conversational
                    'BpjGufoPiobT79j2vtj4', // Priyanka - Calm, Neutral
                    '2zRM7PkgwBPiau2jvVXc', // Monika Sogam - Deep
                    '1SM7GgM6IMuvQlz2BwM3', // Mark - Casual
                    '5l5f8iK3YPeGga21rQIX', // Adeline - Feminine
                    'scOwDtmlUjD3prqpp97I', // Sam - Support Agent
                    'BZgkqPqms7Kj9ulSkVzn', // Eve - Energetic
                    'wo6udizrrtpIxWGp2qJk', // Northern Terry
                    'Bj9UqZbhQsanLzgalpEG', // Austin - Raspy
                    'c6SfcYrb2t09NHXiT80T', // Jarnathan - Versatile
                    'B8gJV1IhpuegLxdpXFOE', // Kuon - Cheerful
                    'IjnA9kwZJHJ20Fp7Vmy6', // Matthew - Friendly
                    'UgBBYS2sOqTuMpoF3BR0', // Mark - Natural
                    'lcMyyd2HUfFzxdCaC4Ta', // Lucy - Fresh
                    'cgSgspJ2msm6clMCkdW9', // Jessica - Playful
                    'MnUw1cSnpiLoLhpd3Hqp', // Heather Rey - Friendly
                    'FUfBrNit0NNZAwb58KWH', // Angela - Conversational
                    'g6xIsTj2HwM6VR4iXFCw', // Jessica Anne Bogart - Chatty
                    'ZF6FPAbjXT4488VcRRnw', // Amelia - Expressive
                    'DTKMou8ccj1ZaWGBiotd', // Jamahal - Vibrant
                    'Tsns2HvNFKfGiNjllgqo', // Sven - Emotional
                    '56AoDkrOh6qfVPDXZ7Pt', // Cassidy - Crisp
                    'pPdl9cQBQq4p6mRkZy2Z', // Emma - Adorable
                    // ── Social Media & Energetic ──
                    'kPzsL2i3teMYv0FxEYQ6', // Brittney - Social Media
                    'TX3LPaxmHKxFdv7VOQHJ', // Liam - Social Media Creator
                    'iP95p4xoKVk53GoZ742B', // Chris - Down-to-Earth
                    'vBKc2FfBKJfcZNyEt1n6', // Finn - Youthful
                    'FGY2WhTYpPnrIDTdsKH5', // Laura - Quirky
                    'uYXf8XasLslADfZ2MB4u', // Hope - Bubbly
                    'tnSpp4vdxKPjI9w0GnoV', // Hope - Upbeat
                    // ── Announcers & Radio ──
                    'YOq2y2Up4RgXP2HyXjE5', // Xavier - Metalic Announcer
                    'NNl6r8mD7vthiJatiJt1', // Bradford - Expressive
                    'LG95yZDEHg6fCZdQjLqj', // Phil - Explosive Announcer
                    'CeNX9CMwmxDxUF5Q2Inm', // Johnny Dynamite - Radio DJ
                    'st7NwhTPEzqo2riw7qWC', // Blondie - Radio Host
                    'aD6riP1btT197c6dACmy', // Rachel M - British Radio
                    'x70vRnQBMBu4FAYhjJbO', // Nathan - Virtual Radio
                    'cTNP6ZM2mLTKj2BFhxEh', // Paul French - Podcaster
                    'gU0LNdkMOQCOrPrwtbee', // British Football Announcer
                    'dHd5gvgSOzSfduK4CvEg', // Ed - Late Night Announcer
                    'FF7KdobWPaiR0vkcALHF', // David - Movie Trailer
                    'mtrellq69YZsNwzUSyXh', // Rex Thunder - Deep N Tough
                    // ── Deep & Commanding ──
                    'pNInz6obpgDQGcFmaJgB', // Adam - Dominant, Firm
                    'nPczCjzI2devNBz1zQrb', // Brian - Deep, Resonant
                    'DGzg6RaUqxGRTHSBjfgF', // Brock - Commanding Sergeant
                    'gs0tAILXbY5DNrJrsM6F', // Jeff - Classy, Strong
                    'TmNe0cCqkZBMwPWOd3RD', // Smith - Mellow, Bassy
                    'EiNlNiXeDU1pqqOPrYMO', // John Doe - Deep
                    'U1Vk2oyatMdYs096Ety7', // Michael - Deep, Dark
                    'qNkzaJoHLLdpvgh5tISm', // Carter - Rich, Rugged
                    'L0Dsvb3SLTyegXwtm47J', // Archer
                    'zYcjlYFOd3taleS0gkk3', // Edward - Loud, Cocky
                    // ── International & Documentary ──
                    'DGTOOUoGpoP6UZ9uSWfA', // Célian - Documentary
                    'P1bg08DkjqiVEzOn76yG', // Viraj - Rich, Soft
                    'qDuRKMlYmrm8trt5QyBn', // Taksh - Calm, Smooth
                    'Sq93GQT4X1lKDXsQcixO', // Felix - Warm RP
                    'AeRdCCKzvd23BpJoofzx', // Nathaniel - British, Calm
                    '4YYIPFl9wE5c4L2eu2Gb', // Burt Reynolds™ - Deep
                    '1U02n4nD6AdIZ9CjF053', // Viraj - Smooth, Gentle
                    // ── Cowboy & Western ──
                    'KTPVrSVAEUSJRClDzBw7', // Bob - Warm Cowboy
                    'OYWwCdDHouzDwiZJWOOu', // David - Gruff Cowboy
                    'YXpFCvM1S3JbWEJhoskW', // Wyatt - Rustic Cowboy
                    '9PVP7ENhDskL0KYHAKtD', // Jerry B. - Southern
                    'ruirxsoakN0GWmGNIo04', // John Morgan - Gritty Cowboy
                    // ── Characters & Villains ──
                    'Z3R5wn05IrDiVCyEkUrK', // Arabella - Mysterious
                    'ouL9IsyrSnUkCmfnD02u', // Grimblewood - Snarky Gnome
                    'NOpBlnGInO9m6vDvFkFC', // Spuds Oxley - Wise
                    'yjJ45q8TVCrtMhEKurxY', // Dr. Von - Mad Scientist
                    'kUUTqKQ05NMGulF08DDf', // Guadeloupe - Emotional
                    'qXpMhyvQqiRxWQs4qSSB', // Horatius - Energetic
                    'SOYHLrjzK2X1ezoPC6cr', // Harry - Fierce Warrior
                    'N2lVS1w4EtoT3dr4eOWO', // Callum - Husky Trickster
                    'XB0fDUnXU5powFXDhCwa', // Charlotte
                    '0SpgpJ3D3MpHCiWdyTg3', // Matthew Schmitz - Tyrant
                    'UFO0Yv86wqRxAt1DmXUu', // Sarcastic Sultry Villain
                    'TC0Zp7WVFzhA8zpTlRqV', // Aria - Sultry Villain
                    'esy0r39YPLQjOczyOib8', // Britney - Calculative Villain
                    'bwCXcoVxWNYMlC6Esa8u', // Matthew Schmitz - Anti-Hero
                    'flHkNRp1BlvT73UL6gyz', // Jessica A.B. - Villain
                    'eVItLK1UvXctxuaRV2Oq', // Jean - Femme Fatale
                    'nzeAacJi50IvxcyDnMXa', // Marshal - Funny Professor
                    '9yzdeviXkFddZ4Oz8Mok', // Lutz - Giggly
                    'PPzYpIqttlTYA83688JI', // Pirate Marshal
                    // ── Fantasy & Sci-Fi ──
                    'vfaqCOvlrKi4Zp7C2IAm', // Malyx - Deep Demon
                    'piI8Kku0DcvcL6TTSeQt', // Flicker - Cheerful Fairy
                    'oR4uRy4fHDUGGISL0Rev', // Myrrdin - Magical Narrator
                    'ljo9gAlSqKOvF6D8sOsX', // Viking Bjorn - Medieval
                    '1KFdM0QCwQn4rmn5nn9C', // Parasyte - Whispers
                    'D2jw4N9m4xePLTQ3IHjU', // Ian - Alien
                    // ── Meditation & ASMR ──
                    'Atp5cNFg1Wj5gyKD7HWV', // Natasha - Gentle Meditation
                    '1cxc5c3E9K6F1wlqOJGV', // Emily - Soft, Meditative
                    'HgyIHe81F3nXywNwkraY', // Nate - Sultry, Seductive
                    'LruHrtVF6PSyGItzMNHS', // Benjamin - Calming
                    'Qggl4b0xRMiqOwhPtVWT', // Clara - Relaxing
                    'zA6D7RyKdc2EClouEMkP', // AImee - ASMR
                    '1wGbFxmAM3Fgw63G1zZJ', // Allison - Soothing
                    'hqfrgApggtO1785R4Fsn', // Theodore HQ - Serene
                    'sH0WdfE5fsKuM2otdQZr', // Koraly - Soft-spoken
                    'MJ0RnG71ty4LH3dvNfSd', // Leon - Grounded
                    'iCrDUkL56s3C8sCRl7wb', // Hope - Poetic
                ], default: 'Rachel'
            },
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
            { key: 'stability', label: 'Estabilidade da Voz', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05 },
            {
                key: 'language_code', label: 'Idioma', type: 'select',
                options: [
                    { id: 'auto', label: 'Auto (Detectar)' },
                    { id: 'pt', label: 'Português' },
                    { id: 'en', label: 'Inglês' },
                    { id: 'es', label: 'Espanhol' },
                    { id: 'fr', label: 'Francês' },
                    { id: 'de', label: 'Alemão' },
                    { id: 'it', label: 'Italiano' },
                    { id: 'ja', label: 'Japonês' },
                    { id: 'ko', label: 'Coreano' },
                    { id: 'zh', label: 'Chinês (Mandarim)' },
                    { id: 'af', label: 'Africâner' },
                    { id: 'ar', label: 'Árabe' },
                    { id: 'hy', label: 'Armênio' },
                    { id: 'as', label: 'Assamês' },
                    { id: 'az', label: 'Azerbaijano' },
                    { id: 'be', label: 'Bielorrusso' },
                    { id: 'bn', label: 'Bengali' },
                    { id: 'bs', label: 'Bósnio' },
                    { id: 'bg', label: 'Búlgaro' },
                    { id: 'ca', label: 'Catalão' },
                    { id: 'ceb', label: 'Cebuano' },
                    { id: 'ny', label: 'Chichewa' },
                    { id: 'hr', label: 'Croata' },
                    { id: 'cs', label: 'Tcheco' },
                    { id: 'da', label: 'Dinamarquês' },
                    { id: 'nl', label: 'Holandês' },
                    { id: 'et', label: 'Estoniano' },
                    { id: 'fil', label: 'Filipino' },
                    { id: 'fi', label: 'Finlandês' },
                    { id: 'gl', label: 'Galego' },
                    { id: 'ka', label: 'Georgiano' },
                    { id: 'el', label: 'Grego' },
                    { id: 'gu', label: 'Gujarati' },
                    { id: 'ha', label: 'Hausa' },
                    { id: 'he', label: 'Hebraico' },
                    { id: 'hi', label: 'Hindi' },
                    { id: 'hu', label: 'Húngaro' },
                    { id: 'is', label: 'Islandês' },
                    { id: 'id', label: 'Indonésio' },
                    { id: 'ga', label: 'Irlandês' },
                    { id: 'jv', label: 'Javanês' },
                    { id: 'kn', label: 'Kannada' },
                    { id: 'kk', label: 'Cazaque' },
                    { id: 'ky', label: 'Quirguiz' },
                    { id: 'lv', label: 'Letão' },
                    { id: 'ln', label: 'Lingala' },
                    { id: 'lt', label: 'Lituano' },
                    { id: 'lb', label: 'Luxemburguês' },
                    { id: 'mk', label: 'Macedônio' },
                    { id: 'ms', label: 'Malaio' },
                    { id: 'ml', label: 'Malaiala' },
                    { id: 'mr', label: 'Marata' },
                    { id: 'ne', label: 'Nepalês' },
                    { id: 'no', label: 'Norueguês' },
                    { id: 'ps', label: 'Pashto' },
                    { id: 'fa', label: 'Persa' },
                    { id: 'pl', label: 'Polonês' },
                    { id: 'pa', label: 'Punjabi' },
                    { id: 'ro', label: 'Romeno' },
                    { id: 'ru', label: 'Russo' },
                    { id: 'sr', label: 'Sérvio' },
                    { id: 'sd', label: 'Sindi' },
                    { id: 'sk', label: 'Eslovaco' },
                    { id: 'sl', label: 'Esloveno' },
                    { id: 'so', label: 'Somali' },
                    { id: 'sw', label: 'Suaíli' },
                    { id: 'sv', label: 'Sueco' },
                    { id: 'ta', label: 'Tâmil' },
                    { id: 'te', label: 'Telugu' },
                    { id: 'th', label: 'Tailandês' },
                    { id: 'tr', label: 'Turco' },
                    { id: 'uk', label: 'Ucraniano' },
                    { id: 'ur', label: 'Urdu' },
                    { id: 'vi', label: 'Vietnamita' },
                    { id: 'cy', label: 'Galês' }
                ],
                default: 'auto'
            },
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
            { key: 'suno_mode', label: 'Modo', type: 'select', options: ['Música', 'Letra'], default: 'Música' },
{ key: 'model', label: 'Modelo Suno', type: 'select', options: ['V4', 'V4_5', 'V4_5PLUS', 'V4_5ALL', 'V5', 'V5_5'], default: 'V5_5' },
            { key: 'custom_mode', label: 'Modo Avançado', type: 'bool', default: false },
            { key: 'style', label: 'Estilo Musical', type: 'text', default: '' },
            { key: 'title', label: 'Título', type: 'text', default: '' },
            { key: 'instrumental', label: 'Só Instrumental', type: 'bool', default: false },
        ]
    },
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
            { key: 'suno_action', label: 'Ação', type: 'select', options: ['Music Video', 'Convert WAV', 'Get Lyrics', 'Generate Persona', 'Cover Image', 'Generate MIDI'], default: 'Music Video' },
            { key: 'taskId', label: 'Task ID (da geração anterior)', type: 'text', default: '' },
            { key: 'audioId', label: 'Audio ID', type: 'text', default: '' },
            { key: 'author', label: 'Autor (opcional)', type: 'text', default: '' },
            { key: 'personaName', label: 'Nome da Persona (opcional)', type: 'text', default: '' },
            { key: 'personaDescription', label: 'Descrição da Persona (opcional)', type: 'text', default: '' },
        ]
    },

    // ──── SEEDANCE 2.0 (ByteDance) ────
    'bytedance/seedance-2-frames': { params: SEEDANCE_2_PARAMS },
    'bytedance/seedance-2-multi':  { params: SEEDANCE_2_PARAMS },
    'bytedance/seedance-2-video':  { params: SEEDANCE_2_PARAMS },
    'bytedance/seedance-2-fast': {
        params: [
            { key: 'duration', label: 'Duração (s)', type: 'number', default: 10, min: 4, max: 15, step: 1 },
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9'], default: '16:9' },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['480p', '720p'], default: '720p' },
            { key: 'generate_audio', label: 'Gerar Áudio', type: 'bool', default: true },
            { key: 'return_last_frame', label: 'Retornar Último Frame', type: 'bool', default: false },
            { key: 'web_search', label: 'Web Search', type: 'bool', default: false },
        ]
    },

    // ──── VEO 3.1 (Google) ────
    'veo3/text-to-video': {
        params: [
            { key: 'quality', label: 'Quality', type: 'radio', options: ['Fast', 'Quality'], default: 'Fast' },
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16'], default: '16:9' },
        ]
    },
    'veo3/image-to-video': {
        params: [
            { key: 'quality', label: 'Quality', type: 'radio', options: ['Fast', 'Quality'], default: 'Fast' },
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16'], default: '16:9' },
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

// ==================== State ====================

let selectedModel = null;
let currentCatLabel = '';
let currentCat = ''; // Store the current internal category ID
let tasks = [];

// ==================== Pending Tasks (localStorage) ====================
const PENDING_KEY = 'kie-pending-tasks';
const VALID_PENDING_TASK_STATES = new Set(['processing', 'success', 'fail']);

function loadPendingTasks() {
    try {
        const raw = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
        if (!Array.isArray(raw)) { console.warn('[pending] Expected array, got:', typeof raw); return []; }
        return raw.filter(p => p
            && typeof p === 'object'
            && typeof p.id === 'string' && p.id.length > 0
            && typeof p.model === 'string' && p.model.length > 0
            && (p.cat === undefined || typeof p.cat === 'string')
            && (p.state === undefined || VALID_PENDING_TASK_STATES.has(p.state))
        );
    }
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
    tasks.forEach(t => { if (t.pollTimer) { clearTimeout(t.pollTimer); t.pollTimer = null; } });
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

// ==================== History (server-only, in-memory cache) ====================
const HISTORY_MAX = 500;

// In-memory cache — populated from server on init, updated locally on each new entry
let _historyCache = null; // null = not yet loaded from server

// Tombstone set: IDs deleted during this session.
// Prevents deleted items from reappearing via async server fetches or SSE callbacks.
const _deletedIds = new Set();

// API key for authenticated history requests (fetched from server config on init)
let _kieApiKey = null;

let _kieApiKeyPromise = null;

async function initApiKey() {
    if (_kieApiKey) return _kieApiKey;
    if (_kieApiKeyPromise) return _kieApiKeyPromise;
    _kieApiKeyPromise = fetch(`${API}/api/config?_t=${Date.now()}`)
        .then(r => r.ok ? r.json() : {})
        .then(j => {
            _kieApiKey = j.apiKey || '';
            _kieApiKeyPromise = null;
            return _kieApiKey;
        })
        .catch(e => {
            console.warn('[auth] Failed to fetch API key:', e);
            _kieApiKeyPromise = null;
            return '';
        });
    return _kieApiKeyPromise;
}

function _kieAuthHeaders() {
    return _kieApiKey ? { 'x-api-key': _kieApiKey } : {};
}

function _migrateHistoryEntry(h) {
    if (h.cat || !h.model) return false;
    let migrated = false;
    const tpl = document.getElementById('tpl-models');
    if (tpl) {
        try {
            const item = tpl.content.querySelector(`[data-model="${h.model}"]`);
            if (item && item.dataset.cat) { h.cat = item.dataset.cat; migrated = true; }
        } catch (e) { console.warn('[history] Failed to migrate entry model:', h.model, e); }
    }
    if (!h.cat && h.model) {
        const m = h.model;
        if (m.includes('suno')) { h.cat = 'music'; migrated = true; }
        else if (m.includes('elevenlabs')) { h.cat = 'audio'; migrated = true; }
        else if (m.includes('topaz') || m.includes('crisp') || m.includes('recraft')) { h.cat = 'tools'; migrated = true; }
        else if (m.includes('video') || m.includes('kling') || m.includes('wan') || m.includes('hailuo') || m.includes('sora') || m.includes('veo')) { h.cat = 'video'; migrated = true; }
        else if (m.includes('grok-imagine') || m.includes('flux') || m.includes('nano-banana') || m.includes('imagen') || m.includes('qwen') || m.includes('seedream') || m.includes('bytedance') || m.includes('gpt4o')) { h.cat = 'image'; migrated = true; }
    }
    return migrated;
}

function loadHistory() {
    return _historyCache || [];
}

function saveHistory(history) {
    _historyCache = history.slice(0, HISTORY_MAX);
}

// Load history from server into in-memory cache (server is the only source of truth)
async function syncHistoryFromServer() {
    await initApiKey();
    fetch(`${API}/api/history?limit=${HISTORY_MAX}`, { headers: _kieAuthHeaders() })
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(json => {
            const serverHistory = (json.history || []).filter(h => !_deletedIds.has(h.id));
            serverHistory.forEach(h => _migrateHistoryEntry(h));
            _historyCache = serverHistory.slice(0, HISTORY_MAX);
            renderHistoryGallery();
            updateHistoryCount();
            console.log(`[history] Loaded ${_historyCache.length} entries from server`);
        })
        .catch(err => {
            console.warn('[history] Failed to load from server:', err);
            if (!_historyCache) _historyCache = [];
        });
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

    // Callback format: data.info.* (Market/Veo/Flux callbacks put URLs here)
    const info = data.info || {};
    if (Array.isArray(info.resultUrls)) urls.push(...info.resultUrls);
    if (Array.isArray(info.result_urls)) urls.push(...info.result_urls);
    if (info.resultImageUrl) urls.push(info.resultImageUrl);
    if (info.resultUrl) urls.push(info.resultUrl);
    if (Array.isArray(info.originUrls)) urls.push(...info.originUrls);

    // resultJson as string (Market polling)
    if (typeof data.resultJson === 'string' && data.resultJson) {
        try {
            const parsed = JSON.parse(data.resultJson);
            if (Array.isArray(parsed.resultUrls)) urls.push(...parsed.resultUrls);
            if (parsed.resultUrl) urls.push(parsed.resultUrl);
            if (parsed.resultObject?.url) urls.push(parsed.resultObject.url);
        } catch (e) { console.warn('[extractResultUrls] Failed to parse resultJson:', e); }
    } else if (data._parsedResult) {
        if (Array.isArray(data._parsedResult.resultUrls)) urls.push(...data._parsedResult.resultUrls);
        if (data._parsedResult.resultUrl) urls.push(data._parsedResult.resultUrl);
    }

    // resultInfoJson: object with resultUrls array of {resultUrl: "..."}
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

    // Veo 3: response.resultUrls / response.originUrls
    if (data.response) {
        if (Array.isArray(data.response.resultUrls)) urls.push(...data.response.resultUrls);
        if (Array.isArray(data.response.originUrls)) urls.push(...data.response.originUrls);
    }
    // Suno: response.sunoData[] with audioUrl (camelCase) OR audio_url (snake_case)
    if (data.response && Array.isArray(data.response.sunoData)) {
        data.response.sunoData.forEach(track => {
            if (track.audioUrl) urls.push(track.audioUrl);
            else if (track.audio_url) urls.push(track.audio_url);
            if (track.sourceAudioUrl && track.sourceAudioUrl !== track.audioUrl) urls.push(track.sourceAudioUrl);
            else if (track.source_audio_url && track.source_audio_url !== track.audio_url) urls.push(track.source_audio_url);
        });
    }
    // Suno alternative shape: data.data[] = array of tracks (some API versions)
    if (Array.isArray(data.data)) {
        data.data.forEach(track => {
            if (typeof track === 'object' && track !== null) {
                const au = track.audioUrl || track.audio_url || track.sourceAudioUrl || track.source_audio_url;
                if (au && typeof au === 'string' && au.startsWith('http')) urls.push(au);
            }
        });
    }
    // Flat video_url (Runway etc)
    if (data.video_url) urls.push(data.video_url);
    return urls;
}

function addToHistory(task) {
    // Never re-add an item the user explicitly deleted during this session
    if (_deletedIds.has(task.id)) {
        console.log(`[history] Skipping addToHistory for deleted task ${task.id}`);
        return;
    }

    const data = task.data?.data || {};
    // Collect URLs
    const urls = _extractResultUrls(data);
    const uniqueUrls = [...new Set(urls.filter(u => typeof u === 'string' && u.startsWith('http')))];
    // Allow saving failed tasks even with no output so we can view the failMsg in the lightbox

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
        // Suno: normalise track data regardless of API response shape
        coverUrl: data.response?.sunoData?.[0]?.image_large_url || data.response?.sunoData?.[0]?.imageLargeUrl || data.response?.sunoData?.[0]?.imageUrl
            || data.response?.sunoData?.[0]?.image_url
            || (Array.isArray(data.data) ? data.data[0]?.image_large_url || data.data[0]?.imageLargeUrl || data.data[0]?.imageUrl || data.data[0]?.image_url : null)
            || null,
        trackTitle: data.response?.sunoData?.[0]?.title
            || (Array.isArray(data.data) ? data.data[0]?.title : null)
            || null,
        sunoData: data.response?.sunoData
            || (Array.isArray(data.data) && data.data[0]?.audioUrl !== undefined ? data.data : null)
            || (Array.isArray(data.data) && data.data[0]?.audio_url !== undefined ?
                data.data.map(t => ({ ...t, audioUrl: t.audio_url || t.audioUrl, imageUrl: t.image_large_url || t.imageLargeUrl || t.image_url || t.imageUrl })) : null)
            || null,
    };

    if (!_historyCache) _historyCache = [];
    const idx = _historyCache.findIndex(h => h.id === entry.id);
    if (idx >= 0) _historyCache.splice(idx, 1);
    _historyCache.unshift(entry);
    saveHistory(_historyCache);
    renderHistoryGallery();
    updateHistoryCount();

    // Save to server (permanent storage in PostgreSQL)
    const fd = new FormData();
    fd.append('entry_json', JSON.stringify(entry));
    fetch(`${API}/api/history`, { method: 'POST', body: fd, headers: _kieAuthHeaders() })
        .then(r => { if (!r.ok) console.error('[history] Server save failed:', r.status); })
        .catch(err => console.error('[history] Server save error:', err));
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

    // Settings panel
    panelSettings: $('#panel-settings'),
    panelSettingsScroll: $('#panel-settings-scroll'),
    btnResetSettings: $('#btn-reset-settings'),

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
    tasksList: $('#tasks-list'),
    tasksEmpty: $('#tasks-empty'),
    btnClearTasks: $('#btn-clear-tasks'),
    tabActive: $('#tab-active'),
    tabHistory: $('#tab-history'),
    historyGallery: $('#history-gallery'),
    historyEmpty: $('#history-empty'),
    historyFilter: $('#history-filter-model'),
    btnClearHistory: $('#btn-clear-history'),
    btnImportHistory: $('#btn-import-history'),
    activeCount: $('#active-count'),
    historyCount: $('#history-count'),
};

// Category labels
const CAT_LABELS = { image: 'Generate Image', video: 'Generate Video', audio: 'Audio', music: 'Music', tools: 'Tools & Upscale', seedance2: 'Seedance 2.0' };

// ==================== Init ====================

// ==================== Auth Guard ====================

// Interceptor global: injeta credentials + redireciona em 401
(function installAuthInterceptor() {
    const _origFetch = window.fetch.bind(window);
    window.fetch = async function(input, init = {}) {
        const url = typeof input === 'string' ? input : (input?.url || '');

        // Injeta credentials: 'same-origin' para todas as chamadas /api/
        // Isso garante que o cookie JWT httpOnly seja enviado automaticamente
        if (url.startsWith('/api/') || url.includes(window.location.host + '/api/')) {
            init = { credentials: 'same-origin', ...init };
        }

        const response = await _origFetch(input, init);

        if (
            response.status === 401 &&
            url.includes('/api/') &&
            !url.includes('/api/auth/')
        ) {
            console.warn('[auth] 401 — redirecionando para login');
            window.location.replace('/login');
        }
        return response;
    };
})();

async function initAuth() {
    try {
        const r = await fetch('/api/auth/verify');
        if (!r.ok) {
            window.location.replace('/login');
            return false;
        }
        const d = await r.json();
        if (!d.valid) {
            window.location.replace('/login');
            return false;
        }
        // Guarda user no window para componentes que precisem
        window._kieUser = d.user;
        return true;
    } catch (e) {
        console.error('[auth] Falha ao verificar sessão:', e);
        window.location.replace('/login');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const authenticated = await initAuth();
    if (!authenticated) return; // redireciona para /login

    initApiKey(); // fetch API key early so history requests are authenticated
    initLobby();
    initModelPickerModal();
    initClearTasks();
    initTabs();
    initHistory();
    restorePendingTasks();
    // Always start at lobby — don't auto-restore last workspace
    try { sessionStorage.removeItem('kie-workspace-cat'); sessionStorage.removeItem('kie-workspace-model'); } catch (e) { /* ignore */ }
    fetchCredits();
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
    // Generic: info.resultUrl (singular — Topaz video etc)
    if (info.resultUrl) urls.push(info.resultUrl);
    // Origin URLs from callback
    if (Array.isArray(info.originUrls)) urls.push(...info.originUrls);
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
    // Use SSE (Server-Sent Events) instead of Socket.IO
    const evtSource = new EventSource(`${API}/api/events`);

    evtSource.addEventListener('kie:task-update', (event) => {
        let body;
        try { body = JSON.parse(event.data); } catch { return; }

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
            if (task.pollTimer) { clearTimeout(task.pollTimer); task.pollTimer = null; }
            removePendingTask(task.id);
            const failInfo = data.failMsg ? ` — ${data.failMsg}` : '';
            toast(
                state === 'success' ? `✅ ${task.model} concluído!` : `❌ ${task.model} falhou${failInfo}`,
                state === 'success' ? 'success' : 'error'
            );
            addToHistory(task);
            fetchCredits();
        }

        updateTaskCard(task);
        updateActiveCount();
    });

    evtSource.onerror = () => {
        console.log('[SSE] Connection lost — polling continues as fallback');
    };
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

    // Hide lobby — do NOT show app-main (V1 shell); V2 workspace handles everything
    els.lobby.classList.add('exit');
    setTimeout(() => {
        els.lobby.classList.add('hidden');
    }, 250);

    // Set breadcrumb
    const label = CAT_LABELS[cat] || cat;
    currentCatLabel = label;
    els.headerBreadcrumb.innerHTML = `<span class="breadcrumb-sep">/</span> <span class="breadcrumb-active">${esc(label)}</span>`;
    if (els.workspaceCatLabel) els.workspaceCatLabel.textContent = label;

    // Update History & Active tabs to only show tasks and history for this cat
    filterTasksByCategory();
    updateActiveCount();
    renderHistoryGallery();
    updateHistoryCount(); // Call after renderHistoryGallery to ensure filter is applied

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
    // Reset picker trigger
    els.mptName.textContent = 'Selecione um modelo';
    els.mptIcon.className = 'mpt-icon mc-purple';
    els.mptIcon.textContent = '—';
    if (els.mptCost) els.mptCost.classList.add('hidden');
    if (els.btnModelPicker) els.btnModelPicker.classList.remove('has-model');

    // Single-model categories go straight to V2 workspace
    if (cat === 'music') {
        const tplItem = tpl?.content.querySelector('[data-model="suno/generate-music"]');
        if (tplItem && typeof window._v2ShowWorkspace === 'function') {
            setTimeout(() => window._v2ShowWorkspace({ ...tplItem.dataset }), 60);
        }
        return;
    }

    // Seedance 2.0 → open workflow picker modal instead of model picker
    if (cat === 'seedance2') {
        setTimeout(() => _openSeedance2Picker(), 50);
        return;
    }

    // Restore previously selected model (F5 / Ctrl+R)
    let savedModel;
    try { savedModel = sessionStorage.getItem('kie-workspace-model'); } catch (e) { /* ignore */ }
    if (savedModel) {
        const tplItem = tpl?.content.querySelector(`[data-model="${CSS.escape(savedModel)}"][data-cat="${cat}"]`);
        if (tplItem && typeof window._v2ShowWorkspace === 'function') {
            setTimeout(() => {
                selectModelFromData(tplItem.dataset);
                window._v2ShowWorkspace({ ...tplItem.dataset });
            }, 60);
            return;
        }
    }

    // Open model picker modal so user chooses a model first
    if (_currentCatItems.length > 0) {
        setTimeout(() => openModelPickerModal(), 50);
    }

    if (els.panelSettings) els.panelSettings.classList.add('hidden');
}

function exitWorkspace() {
    if (els.appMain) els.appMain.classList.add('hidden');
    els.lobby.classList.remove('hidden', 'exit');
    els.headerBreadcrumb.innerHTML = '';
    selectedModel = null;
    currentCatLabel = '';
    currentCat = '';
    _currentCatItems = [];
    closeModelPickerModal();
    _closeSeedance2Picker();
    stopAllPolling();
    // Hide V2 workspace if open
    if (typeof window._v2HideWorkspace === 'function') window._v2HideWorkspace();
    // Clear persisted workspace so reload goes to lobby
    try {
        sessionStorage.removeItem('kie-workspace-cat');
        sessionStorage.removeItem('kie-workspace-model');
    } catch (e) { console.warn('Could not clear workspace from sessionStorage:', e); }
}

// ==================== Seedance 2.0 Workflow Picker ====================

// Shared close handler — used by backdrop click, close button, and Escape key
function _handleCloseSeedancePicker() {
    _closeSeedance2Picker();
    if (!selectedModel) exitWorkspace();
}

// Named handler so it can be added/removed with the picker lifecycle
function _seedance2EscapeHandler(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal-seedance2-picker');
        if (modal && !modal.classList.contains('hidden')) {
            _handleCloseSeedancePicker();
        }
    }
}

function _openSeedance2Picker() {
    const modal = document.getElementById('modal-seedance2-picker');
    if (!modal) return;
    modal.classList.remove('hidden');

    // Wire close handlers
    const backdrop = document.getElementById('seedance2-backdrop');
    const closeBtn = document.getElementById('seedance2-close');
    if (backdrop) backdrop.onclick = () => _handleCloseSeedancePicker();
    if (closeBtn) closeBtn.onclick = () => _handleCloseSeedancePicker();

    // Scoped Escape key listener (added on open, removed on close)
    document.addEventListener('keydown', _seedance2EscapeHandler);

    // Wire workflow cards
    modal.querySelectorAll('.seedance2-wf-card').forEach(card => {
        card.onclick = () => {
            const wf = card.dataset.seedanceWf;
            const modelMap = {
                frames: 'bytedance/seedance-2-frames',
                multi: 'bytedance/seedance-2-multi',
                video: 'bytedance/seedance-2-video',
            };
            const modelId = modelMap[wf];
            if (!modelId) return;

            const tpl = document.getElementById('tpl-models');
            const tplItem = tpl?.content.querySelector(`[data-model="${CSS.escape(modelId)}"]`);
            if (tplItem) {
                selectModelFromData(tplItem.dataset);
                _closeSeedance2Picker();
                if (typeof window._v2ShowWorkspace === 'function') {
                    window._v2ShowWorkspace({ ...tplItem.dataset });
                }
            }
        };
    });
}

function _closeSeedance2Picker() {
    const modal = document.getElementById('modal-seedance2-picker');
    if (modal) modal.classList.add('hidden');
    // Remove scoped Escape listener
    document.removeEventListener('keydown', _seedance2EscapeHandler);
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

const WAN_MODE_OPTIONS = [
    {
        model: 'wan/2-7-text-to-video',
        name: 'Wan 2.7 — Text',
        provider: 'Wan',
        input: 'text',
        field: 'prompt',
        prompt: 'true',
        color: 'mc-wan',
        desc: 'Text to Video com prompt puro.'
    },
    {
        model: 'wan/2-7-image-to-video',
        name: 'Wan 2.7 — Image',
        provider: 'Wan',
        input: 'file',
        field: 'first_frame_url',
        prompt: 'true',
        color: 'mc-wan',
        desc: 'Image to Video usando imagem inicial.'
    },
    {
        model: 'wan/2-7-videoedit',
        name: 'Wan 2.7 — Video Edit',
        provider: 'Wan',
        input: 'file',
        field: 'video_url',
        prompt: 'true',
        color: 'mc-wan',
        desc: 'Edição de vídeo com instruções de prompt.'
    },
    {
        model: 'wan/2-7-r2v',
        name: 'Wan 2.7 — R2V',
        provider: 'Wan',
        input: 'mix',
        field: 'reference_image',
        prompt: 'true',
        color: 'mc-wan',
        desc: 'Reference to Video com imagens e/ou vídeos.'
    },
];

function _buildModelPickerCard(data) {
    const cost = getModelCost(data.model);
    const isActive = selectedModel?.model === data.model;
    const card = document.createElement('button');
    card.className = `mpm-card${isActive ? ' active' : ''} mpm-card-v2`;
    card.dataset.model = data.model;
    if (data.color) card.dataset.color = data.color;

    const inputTypeTag = data.input === 'file' ? 'Image/File' : data.input === 'mix' ? 'Mix' : 'Text';
    const features = [];
    if (data.input === 'text' || data.input === 'mix' || data.prompt === 'true') features.push('Prompt');
    if (data.input === 'file' || data.input === 'mix') features.push('Referência');
    const featuresHtml = features.length ? `
            <div class="mpm-v2-features">
                ${features.map(f => `<div class="mpm-v2-feature"><span class="mpm-v2-dot"></span>${f}</div>`).join('')}
            </div>` : '';

    card.innerHTML = `
        <div class="mpm-v2-glow-border"></div>
        <div class="mpm-v2-inner">
            <div class="mpm-v2-header">
                <div class="mpm-v2-icon">${sanitizeSvg(data.icon)}</div>
                <div class="mpm-v2-badge">${esc(data.provider)}</div>
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
            ${featuresHtml}
        </div>
        <div class="mpm-v2-ambient"></div>
    `;
    return card;
}

function _renderWanModeSubmenu(baseWanData) {
    if (!els.mpmGrid) return;
    els.mpmGrid.innerHTML = '';

    const backCard = document.createElement('button');
    backCard.className = 'mpm-card mpm-card-v2';
    backCard.innerHTML = `
        <div class="mpm-v2-inner">
            <div class="mpm-v2-body">
                <div class="mpm-v2-name">← Voltar</div>
                <div class="mpm-v2-desc">Escolher outro modelo de vídeo</div>
            </div>
        </div>
    `;
    backCard.addEventListener('click', () => openModelPickerModal());
    els.mpmGrid.appendChild(backCard);

    WAN_MODE_OPTIONS.forEach(mode => {
        const modeData = { ...baseWanData, ...mode };
        const card = _buildModelPickerCard(modeData);
        card.addEventListener('click', () => {
            selectModelFromData(modeData);
            closeModelPickerModal();
            if (typeof window._v2ShowWorkspace === 'function') {
                window._v2ShowWorkspace(modeData);
            }
        });
        els.mpmGrid.appendChild(card);
    });
}

function openModelPickerModal() {
    if (!els.modalModelPicker || !els.mpmGrid) return;
    // Build cards
    els.mpmGrid.innerHTML = '';
    _currentCatItems.forEach(data => {
        const card = _buildModelPickerCard(data);
        card.addEventListener('click', () => {
            if (data.provider === 'Wan' && data.model === 'wan/2-7-text-to-video') {
                _renderWanModeSubmenu(data);
                return;
            }
            selectModelFromData(data);
            closeModelPickerModal();
            if (typeof window._v2ShowWorkspace === 'function') {
                window._v2ShowWorkspace(data);
            }
        });
        els.mpmGrid.appendChild(card);
    });

    els.modalModelPicker.classList.remove('hidden');
}

function closeModelPickerModal() {
    if (els.modalModelPicker) els.modalModelPicker.classList.add('hidden');
    // If no model was selected and we're in a workspace, go back to lobby
    if (!selectedModel && currentCat) {
        exitWorkspace();
    }
}

function selectModelFromData(data) {
    selectedModel = {
        model: data.model,
        input: data.input,
        field: data.field || 'image',
        shortcut: data.shortcut || null,
        hasPrompt: data.prompt === 'true',
    };
    // Persist selected model so F5 restores to same model
    try { sessionStorage.setItem('kie-workspace-model', data.model); } catch (e) { /* ignore */ }

    // Update trigger button
    els.mptIcon.innerHTML = sanitizeSvg(data.icon);
    els.mptIcon.className = `mpt-icon ${data.color}`;
    els.mptName.textContent = `${data.name} — ${data.provider}`;
    els.btnModelPicker.classList.add('has-model');

    // Cost in trigger
    const cost = getModelCost(selectedModel.model);
    updateCostBadge(els.mptCost, cost, 'mpt-cost', 'cr');

    // Update header breadcrumb
    els.headerBreadcrumb.innerHTML = `<span class="breadcrumb-sep">/</span> ${esc(currentCatLabel)} <span class="breadcrumb-sep">/</span> <span class="breadcrumb-active">${esc(data.name)}</span>`;
}

function setupPasteImageHandler(promptElement, fileHandler, conditionCheck) {
    if (!promptElement) return;
    promptElement.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (!file) continue;
                if (conditionCheck()) {
                    e.preventDefault();
                    fileHandler(file);
                    toast('Imagem colada como referência', 'success');
                }
                break;
            }
        }
    });
}

// ==================== Submit ====================

// Model display name mappings when files are attached vs text-only
const V2_FILE_MODEL_MAP = {
    'grok-imagine/text-to-video': 'grok-imagine/image-to-video',
    'grok-imagine/text-to-image': 'grok-imagine/image-to-image',
    'sora-2-pro-text-to-video': 'sora-2-pro-image-to-video',
    'seedream/5-lite': 'seedream/5-lite-image-to-image',
};
const V2_TEXT_MODEL_MAP = {
    'seedream/5-lite': 'seedream/5-lite-text-to-image',
};

function resolveVeoModelByInput(model, hasImage) {
    if (!model || !model.startsWith('veo3/')) return model;

    // Auto-switch between text/image Veo families while preserving quality suffix, if present.
    const m = model.match(/^veo3\/(text|image)-to-video(?:-(fast|quality))?$/);
    if (!m) return model;

    const qualitySuffix = m[2] ? `-${m[2]}` : '';
    return `veo3/${hasImage ? 'image' : 'text'}-to-video${qualitySuffix}`;
}

function resolveSeedreamModel(model, extra, hasFile) {
    if (model === 'seedream/5-lite') {
        // Preserve user-selected quality (default: 'basic'); do not override.
        if (!extra.quality) extra.quality = 'basic';
        return hasFile ? 'seedream/5-lite-image-to-image' : 'seedream/5-lite-text-to-image';
    }
    return model;
}

// ==================== Task Management ====================

function addTask(taskId, model, mode, inputFileUrl = null, extraParams = null, overrideCat = null) {
    const v2PromptEl = document.getElementById('v2-prompt');
    const promptText = v2PromptEl?.value?.trim() || '';
    const task = {
        id: taskId,
        model,
        mode,
        cat: overrideCat || currentCat, // Store the category the task was created in
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
    const MAX_POLL_DURATION_MS = 15 * 60 * 1000; // 15 min absolute cap
    const BASE_INTERVAL = 5000;
    let currentInterval = BASE_INTERVAL;
    const pollStart = Date.now();

    const schedulePoll = () => {
        task.pollTimer = setTimeout(poll, currentInterval);
    };

    const poll = async () => {
        // Circuit breaker: give up after absolute max duration even if API never errors
        if (Date.now() - pollStart > MAX_POLL_DURATION_MS) {
            task.pollTimer = null;
            removePendingTask(task.id);
            task.state = 'fail';
            task.data = { data: { failMsg: 'Timeout: task não concluída em 15 minutos', failCode: 'POLL_TIMEOUT' } };
            updateTaskCard(task);
            toast(`❌ ${task.model} — timeout após 15 min`, 'error');
            return;
        }
        try {
            const safeId = encodeURIComponent(task.id);
            const ep = task.mode === 'suno' ? `/api/suno/task/${safeId}` :
                task.mode === 'veo' ? `/api/veo/task/${safeId}` :
                    task.mode === 'gpt4o-image' ? `/api/gpt4o-image/task/${safeId}` :
                        task.mode === 'flux-kontext' ? `/api/flux-kontext/task/${safeId}` :
                            `/api/market/task/${safeId}`;
            const controller = new AbortController();
            const fetchTimer = setTimeout(() => controller.abort(), 30000);
            let resp;
            try {
                resp = await fetch(`${API}${ep}`, { signal: controller.signal });
            } finally {
                clearTimeout(fetchTimer);
            }
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();
            pollErrors = 0; // reset on success
            currentInterval = BASE_INTERVAL; // reset backoff on success
            task.data = json;
            const data = json?.data || {};

            // Parse resultJson if it comes as string (per API docs)
            if (typeof data.resultJson === 'string' && data.resultJson) {
                try { data._parsedResult = JSON.parse(data.resultJson); } catch (e) { console.warn('[poll] Failed to parse resultJson:', e.message); }
            }

            // Normalize failMsg from various API response formats (like callback handler does)
            if (!data.failMsg) {
                data.failMsg = data.failReason || data.errorMessage || data.error_msg
                    || (json.msg && json.code !== 200 ? json.msg : '') || '';
            }
            if (!data.failCode && data.errorCode) data.failCode = data.errorCode;

            let state;
            if (task.mode === 'veo') {
                // Veo 3 uses successFlag: 0=processing, 1=success, 2/3=fail
                const sf = data.successFlag;
                const respUrls = data.response?.resultUrls || data.resultUrls;
                if (sf === 1 || respUrls?.length || data.resultInfoJson) state = 'success';
                else if (sf > 1 || data.errorCode) state = 'fail';
                else state = 'processing';
            } else {
                // Suno/Market APIs use 'status' or 'state'
                const raw = (data.status || data.state || 'processing').toString().toLowerCase();
                if (raw === 'success' || raw === 'succeeded' || raw === 'completed') state = 'success';
                else if (raw === 'fail' || raw === 'failed' || raw === 'error') state = 'fail';
                else state = 'processing';
            }
            task.state = state;
            updateTaskCard(task);
            if (state === 'success' || state === 'fail') {
                task.pollTimer = null;
                removePendingTask(task.id);
                const failInfo = data.failMsg ? ` — ${data.failMsg}` : '';
                toast(
                    state === 'success' ? `✅ ${task.model} concluído!` : `❌ ${task.model} falhou${failInfo}`,
                    state === 'success' ? 'success' : 'error'
                );
                // Save completed tasks (success or fail) to persistent history
                addToHistory(task);
                fetchCredits();
                updateActiveCount();
            } else {
                schedulePoll();
            }
        } catch (err) {
            pollErrors++;
            // Exponential backoff: 5s → 10s → 20s → 40s → give up
            currentInterval = Math.min(BASE_INTERVAL * Math.pow(2, pollErrors), 60000);
            console.error(`[poll] Error ${pollErrors}/${MAX_POLL_ERRORS} for ${task.id}, next retry in ${currentInterval / 1000}s:`, err.message);
            if (pollErrors >= MAX_POLL_ERRORS) {
                task.pollTimer = null;
                removePendingTask(task.id);
                task.state = 'fail';
                task.data = { data: { failMsg: `Erro de rede: ${err.message}`, failCode: 'NETWORK_ERROR' } };
                updateTaskCard(task);
                toast(`❌ ${task.model} — conexão perdida após ${MAX_POLL_ERRORS} tentativas`, 'error');
            } else {
                schedulePoll();
            }
        }
    };
    poll();
}

function updateTasksEmpty() { els.tasksEmpty.classList.toggle('hidden', tasks.length > 0); }

function initClearTasks() {
    els.btnClearTasks.addEventListener('click', () => {
        clearAllPendingTasks();
        clearLocalTasks();
    });
}

// ==================== Task Card Rendering ====================

// Map resolved/variant model names back to the template's base model name
const MODEL_REVERSE_MAP = {
    'seedream/5-lite-image-to-image': 'seedream/5-lite',
    'seedream/5-lite-text-to-image': 'seedream/5-lite',
    'bytedance/4.5-text-to-image': 'seedream/5-lite',
    'seedream/4.5-edit': 'seedream/5-lite',
    'grok-imagine/image-to-image': 'grok-imagine/text-to-image',
    'grok-imagine/image-to-video': 'grok-imagine/text-to-video',
    'sora-2-pro-image-to-video': 'sora-2-pro-text-to-video',
    'wan/2-7-image-to-video': 'wan/2-7-text-to-video',
    'wan/2-7-videoedit': 'wan/2-7-text-to-video',
    'wan/2-7-r2v': 'wan/2-7-text-to-video',
    'veo3/text-to-video-fast': 'veo3/text-to-video',
    'veo3/text-to-video-quality': 'veo3/text-to-video',
    'veo3/image-to-video-fast': 'veo3/text-to-video',
    'veo3/image-to-video-quality': 'veo3/text-to-video',
    'veo3/image-to-video': 'veo3/text-to-video',
    'veo3/extend-fast': 'veo3/text-to-video',
    'veo3/extend-quality': 'veo3/text-to-video',
    'suno/generate-lyrics': 'suno/generate-music',
    'suno/extend-music': 'suno/generate-music',
    'suno/upload-cover': 'suno/generate-music',
    'suno/upload-extend': 'suno/generate-music',
    'suno/add-instrumental': 'suno/generate-music',
    'suno/add-vocals': 'suno/generate-music',
    'suno/separate-vocals': 'suno/generate-music',
    'suno/music-video': 'suno/generate-music',
    'suno/convert-wav': 'suno/generate-music',
    'suno/get-lyrics': 'suno/generate-music',
    'suno/generate-persona': 'suno/generate-music',
    'suno/cover-suno': 'suno/generate-music',
    'suno/generate-midi': 'suno/generate-music',
};

function getModelDetails(modelKey) {
    const tpl = document.getElementById('tpl-models');
    if (!tpl) return null;
    // Try exact match first, then reverse-mapped fallback
    let item = tpl.content.querySelector(`[data-model="${modelKey}"]`);
    if (!item && MODEL_REVERSE_MAP[modelKey]) {
        item = tpl.content.querySelector(`[data-model="${MODEL_REVERSE_MAP[modelKey]}"]`);
    }
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

// ==================== Custom Music Player Builder ====================

/** Generate a unique ID for each music player instance */
let _mpIdCounter = 0;
function _nextMpId() { return `mp-${++_mpIdCounter}`; }

/**
 * Build the HTML for a custom music player.
 * @param {string} audioSrc  - URL of the audio file
 * @param {string} title     - Track title
 * @param {string} artist    - Artist / tags label
 * @param {string} coverSrc  - Cover image URL (optional)
 * @param {string} extraId   - A unique ID suffix for this player
 * @returns {string}  HTML string
 */
function _buildMusicPlayerHtml(audioSrc, title, artist, coverSrc, extraId) {
    const pid = _nextMpId();
    const albumStyle = coverSrc ? `background-image:url('${esc(coverSrc)}')` : '';
    return `<div class="music-player-container">
        <div class="main-music-card" data-mp-id="${pid}" data-mp-src="${esc(audioSrc)}">
            <div class="track-info">
                <div class="album-art" style="${albumStyle}"></div>
                <div class="track-details">
                    <div class="track-title">${esc(title || 'Untitled')}</div>
                    <div class="artist-name">${esc(artist || 'Suno AI')}</div>
                </div>
                <div class="volume-bars">
                    <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
                    <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
                </div>
            </div>
            <div class="playback-controls">
                <div class="time-info">
                    <span class="current-time">0:00</span>
                    <span class="remaining-time">0:00</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                    <div class="progress-handle"></div>
                </div>
                <div class="button-row">
                    <div class="main-control-btns">
                        <button class="control-button back" title="-10s">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 3.5A.5.5 0 0 0 0 4v8a.5.5 0 0 0 1 0V8.753l6.267 3.636c.54.313 1.233-.066 1.233-.697v-2.94l6.267 3.636c.54.314 1.233-.065 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L8.5 7.248v-2.94c0-.63-.692-1.01-1.233-.696L1 7.248V4a.5.5 0 0 0-.5-.5"/>
                            </svg>
                        </button>
                        <div class="play-pause-btns">
                            <button class="control-button play-pause-button" title="Play / Pause">
                                <svg class="icon-play" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.596 8.697l-6.363 3.692c-.54.314-1.233-.065-1.233-.696V4.308c0-.63.693-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                                </svg>
                                <svg class="icon-pause" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
    'veo3/text-to-video-fast': 'veo3/text-to-video',
    'veo3/text-to-video-quality': 'veo3/text-to-video',
    'veo3/image-to-video-fast': 'veo3/text-to-video',
    'veo3/image-to-video-quality': 'veo3/text-to-video',
    'veo3/image-to-video': 'veo3/text-to-video',
    'veo3/extend-fast': 'veo3/text-to-video',
    'veo3/extend-quality': 'veo3/text-to-video',
    'suno/generate-lyrics': 'suno/generate-music',
    'suno/extend-music': 'suno/generate-music',
    'suno/upload-cover': 'suno/generate-music',
    'suno/upload-extend': 'suno/generate-music',
    'suno/add-instrumental': 'suno/generate-music',
    'suno/add-vocals': 'suno/generate-music',
    'suno/separate-vocals': 'suno/generate-music',
    'suno/music-video': 'suno/generate-music',
    'suno/convert-wav': 'suno/generate-music',
    'suno/get-lyrics': 'suno/generate-music',
    'suno/generate-persona': 'suno/generate-music',
    'suno/cover-suno': 'suno/generate-music',
    'suno/generate-midi': 'suno/generate-music',
};

function getModelDetails(modelKey) {
    const tpl = document.getElementById('tpl-models');
    if (!tpl) return null;
    // Try exact match first, then reverse-mapped fallback
    let item = null;
    try {
        if (modelKey) item = tpl.content.querySelector(`[data-model="${CSS.escape(modelKey)}"]`);
        if (!item && MODEL_REVERSE_MAP[modelKey]) {
            item = tpl.content.querySelector(`[data-model="${CSS.escape(MODEL_REVERSE_MAP[modelKey])}"]`);
        }
    } catch (e) {
        console.warn('Selector error in getModelDetails:', e);
    }
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

// ==================== Custom Music Player Builder ====================

/** Generate a unique ID for each music player instance */
let _mpIdCounter = 0;
function _nextMpId() { return `mp-${++_mpIdCounter}`; }

/**
 * Build the HTML for a custom music player.
 * @param {string} audioSrc  - URL of the audio file
 * @param {string} title     - Track title
 * @param {string} artist    - Artist / tags label
 * @param {string} coverSrc  - Cover image URL (optional)
 * @param {string} extraId   - A unique ID suffix for this player
 * @returns {string}  HTML string
 */
function _buildMusicPlayerHtml(audioSrc, title, artist, coverSrc, extraId) {
    const pid = _nextMpId();
    const albumStyle = coverSrc ? `background-image:url('${esc(coverSrc)}')` : '';
    return `<div class="music-player-container">
        <div class="main-music-card" data-mp-id="${pid}" data-mp-src="${esc(audioSrc)}">
            <div class="track-info">
                <div class="album-art" style="${albumStyle}"></div>
                <div class="track-details">
                    <div class="track-title">${esc(title || 'Untitled')}</div>
                    <div class="artist-name">${esc(artist || 'Suno AI')}</div>
                </div>
                <div class="volume-bars">
                    <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
                    <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
                </div>
            </div>
            <div class="playback-controls">
                <div class="time-info">
                    <span class="current-time">0:00</span>
                    <span class="remaining-time">0:00</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                    <div class="progress-handle"></div>
                </div>
                <div class="button-row">
                    <div class="main-control-btns">
                        <button class="control-button back" title="-10s">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.5 3.5A.5.5 0 0 0 0 4v8a.5.5 0 0 0 1 0V8.753l6.267 3.636c.54.313 1.233-.066 1.233-.697v-2.94l6.267 3.636c.54.314 1.233-.065 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L8.5 7.248v-2.94c0-.63-.692-1.01-1.233-.696L1 7.248V4a.5.5 0 0 0-.5-.5"/>
                            </svg>
                        </button>
                        <div class="play-pause-btns">
                            <button class="control-button play-pause-button" title="Play / Pause">
                                <svg class="icon-play" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.596 8.697l-6.363 3.692c-.54.314-1.233-.065-1.233-.696V4.308c0-.63.693-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
                                </svg>
                                <svg class="icon-pause" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
                                </svg>
                            </button>
                        </div>
                        <button class="control-button next" title="+10s">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M15.5 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V8.753l-6.267 3.636c-.54.313-1.233-.066-1.233-.697v-2.94l-6.267 3.636C.693 12.703 0 12.324 0 11.693V4.308c0-.63.693-1.01 1.233-.696L7.5 7.248v-2.94c0-.63.693-1.01 1.233-.696L15 7.248V4a.5.5 0 0 1 .5-.5"/>
                            </svg>
                        </button>
                    </div>
                    <a href="${esc(audioSrc)}" download target="_blank" rel="noopener" class="control-button d" title="Download áudio">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </a>
                </div>
            </div>
            </div>
        </div>
    </div>`;
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
        const isVidModel = task.cat === 'video' || task.cat === 'veo3';
        const isVid = /\.(mp4|mov|webm|avi)($|\?)/i.test(unique[0]) || isVidModel;
        const isAud = /\.(mp3|wav|ogg|aac)($|\?)/i.test(unique[0]) || task.model?.startsWith('suno/');
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
                    ${_buildMusicPlayerHtml(audioSrc, title, tags || 'Suno AI', coverSrc, `task-${esc(task.id)}-${i}`)}
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
                    ${_buildMusicPlayerHtml(u, `Faixa ${i + 1}`, task.model || '', '', `gen-${esc(task.id)}-${i}`)}
                </div>`;
            });
        } else if (isVid) {
            html += `<video src="${esc(unique[0])}" controls preload="metadata" style="width:100%" onerror="window.handleExpiredMedia(this)"></video>`;
        } else if (isAud) {
            html += _buildMusicPlayerHtml(unique[0], 'Áudio Gerado', task.model || '', '', `single-${esc(task.id)}`);
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

        // GPT4o Image: Add "Download HD" button using the download-url endpoint
        if (task.mode === 'gpt4o-image' && task.state === 'success') {
            unique.forEach((u, i) => {
                html += `<button class="btn-ghost btn-sm gpt4o-download-action" data-task-id="${esc(task.id)}" data-url="${esc(u)}" title="Obter URL de download direto (válida por 20 min)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    ${unique.length > 1 ? `HD ${i + 1}` : 'Download HD'}</button>`;
            });
        }

        if (task.model.startsWith('veo3/')) {
            html += `<button class="btn-ghost btn-sm veo-action" data-action="veo3/get-1080p" data-task-id="${esc(task.id)}">HD</button>`;
            html += `<button class="btn-ghost btn-sm veo-action" data-action="veo3/get-4k" data-task-id="${esc(task.id)}">4K</button>`;
            html += `<button class="btn-ghost btn-sm veo-action" data-action="veo3/extend-fast" data-task-id="${esc(task.id)}">Extend</button>`;
            html += `<button class="btn-ghost btn-sm veo-action" data-action="veo3/extend-quality" data-task-id="${esc(task.id)}">Extend (Pro)</button>`;
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

    // Fetch from cloud and merge (async, re-renders when done)
    syncHistoryFromServer();

    // Filter handler
    if (els.historyFilter) {
        els.historyFilter.addEventListener('change', () => renderHistoryGallery());
    }

    // Clear history
    if (els.btnClearHistory) {
        els.btnClearHistory.addEventListener('click', async () => {
            if (!confirm('Limpar histórico desta categoria?')) return;
            // Mark all items of this category as deleted before server call
            loadHistory().filter(h => h.cat === currentCat).forEach(h => _deletedIds.add(h.id));
            // Delete from server (await to prevent reappearance on reload)
            try {
                const resp = await fetch(`${API}/api/history?cat=${encodeURIComponent(currentCat)}`, { method: 'DELETE', headers: _kieAuthHeaders() });
                if (!resp.ok) console.error('[history] Server clear returned', resp.status);
            } catch (err) {
                console.warn('[history] Server clear failed:', err.message);
            }
            const keptHistory = loadHistory().filter(h => h.cat !== currentCat);
            saveHistory(keptHistory);
            renderHistoryGallery();
            updateHistoryCount();
            toast('🗑️ Histórico limpo', 'info');
        });
    }

    // Import history from KIE
    if (els.btnImportHistory) {
        const modal = document.getElementById('modal-import-history');
        const backdrop = document.getElementById('import-backdrop');
        const closeBtn = document.getElementById('import-close');
        const cancelBtn = document.getElementById('btn-import-cancel');
        const submitBtn = document.getElementById('btn-import-submit');
        const textarea = document.getElementById('import-task-ids');
        const status = document.getElementById('import-status');

        function openImportModal() { modal?.classList.remove('hidden'); textarea.value = ''; status.textContent = ''; }
        function closeImportModal() { modal?.classList.add('hidden'); }

        els.btnImportHistory.addEventListener('click', openImportModal);
        backdrop?.addEventListener('click', closeImportModal);
        closeBtn?.addEventListener('click', closeImportModal);
        cancelBtn?.addEventListener('click', closeImportModal);

        submitBtn?.addEventListener('click', async () => {
            const raw = textarea.value.trim();
            if (!raw) { status.textContent = 'Cole ao menos um task ID.'; return; }
            const ids = raw.split(/[\n,\s]+/).map(s => s.trim()).filter(Boolean);
            if (!ids.length) { status.textContent = 'Nenhum ID válido encontrado.'; return; }

            submitBtn.disabled = true;
            status.textContent = `Importando ${ids.length} task(s)...`;

            try {
                const fd = new FormData();
                fd.append('task_ids_json', JSON.stringify(ids));
                const resp = await fetch(`${API}/api/history/import`, { method: 'POST', body: fd, headers: _kieAuthHeaders() });
                const json = await resp.json();
                if (json.success) {
                    status.textContent = `✅ ${json.imported} importado(s)` + (json.errors?.length ? `, ${json.errors.length} erro(s)` : '');
                    syncHistoryFromServer();
                    if (json.imported > 0) toast(`✅ ${json.imported} task(s) importada(s)`, 'success');
                } else {
                    status.textContent = `❌ Erro: ${json.error || 'Falha na importação'}`;
                }
            } catch (err) {
                status.textContent = `❌ Erro: ${err.message}`;
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
}

/**
 * Resolve the best available URL for a history entry's media.
 * Prefers local copies (persisted on our server) over KIE CDN URLs.
 */
function _resolveMediaUrl(entry, index = 0) {
    // Check for locally-stored copy first
    if (Array.isArray(entry.local_urls) && entry.local_urls[index]) {
        return `${API}/media/${entry.id}/${entry.local_urls[index]}`;
    }
    // Fallback to KIE CDN URL
    return (entry.urls && entry.urls[index]) || '';
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

    // Sort newest-first (by timestamp descending — coerce strings to numbers)
    filtered.sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));

    // Show/hide empty state
    if (els.historyEmpty) els.historyEmpty.classList.toggle('hidden', filtered.length > 0);

    // Render gallery
    els.historyGallery.innerHTML = '';
    filtered.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.dataset.historyId = entry.id;

        const url = _resolveMediaUrl(entry, 0);
        const isVid = /\.(mp4|mov|webm|avi)($|\?)/i.test(url) || entry.model.startsWith('veo3/');
        const isSuno = entry.model.startsWith('suno/');

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
        } else if (isVid) {
            thumbHtml = `<video src="${esc(url)}#t=0.001" muted preload="metadata" class="history-thumb-media" onerror="window.handleExpiredMedia(this)"></video>
                         <div class="history-play-icon">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
                         </div>`;
        } else if (url) {
            thumbHtml = `<img src="${esc(url)}" alt="" loading="lazy" class="history-thumb-media" onerror="window.handleExpiredMedia(this)">`;
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

        // Direct download button for upscale models (Topaz, Recraft crisp)
        const isUpscale = entry.model.startsWith('topaz/') || entry.model === 'recraft/crisp-upscale';
        const dlBtnHtml = (isUpscale && entry.urls?.length)
            ? `<button class="history-card-dl" data-dl-url="${esc(_resolveMediaUrl(entry, 0))}" title="Download direto">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                       <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                   </svg>
               </button>`
            : '';

        card.innerHTML = `
            <div class="history-card-accent ${mColor}"></div>
            <div class="history-card-thumb">${thumbHtml}${dlBtnHtml}</div>
            <div class="history-card-footer">
                <span class="history-card-model">${mIcon}${mName}</span>
                <span class="history-card-time">${esc(timeStr)}</span>
            </div>`;

        // Direct download click handler (prevent lightbox open)
        const dlBtn = card.querySelector('.history-card-dl');
        if (dlBtn) {
            dlBtn.addEventListener('click', e => {
                e.stopPropagation();
                const url = dlBtn.dataset.dlUrl;
                const a = document.createElement('a');
                a.href = url;
                a.download = '';
                a.target = '_blank';
                a.rel = 'noopener';
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
        }

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

function getLightboxNavigableEntries() {
    const allHistory = loadHistory();
    const byCategory = allHistory.filter(h => h.cat === currentCat);
    const filterModel = els.historyFilter?.value || '';
    return filterModel ? byCategory.filter(h => h.model === filterModel) : byCategory;
}

function openHistoryLightbox(entry) {
    // Remove existing
    const existing = document.getElementById('history-lightbox');
    if (existing) existing.remove();

    const navEntries = getLightboxNavigableEntries();
    const currentIdx = navEntries.findIndex(h => h.id === entry.id);
    const prevEntry = currentIdx > 0 ? navEntries[currentIdx - 1] : null;
    const nextEntry = currentIdx >= 0 && currentIdx < navEntries.length - 1 ? navEntries[currentIdx + 1] : null;

    const url = _resolveMediaUrl(entry, 0);
    const isVidModel = entry.cat === 'video' || entry.cat === 'veo3';
    const isVid = /\.(mp4|mov|webm|avi)($|\?)/i.test(url) || isVidModel;
    const isAud = /\.(mp3|wav|ogg|aac)($|\?)/i.test(url) || entry.model?.startsWith('suno/');

    let mediaHtml;
    if (entry.urls.length > 1 && !isVid && !isAud) {
        // Multi-image grid (MJ 4 images etc.)
        mediaHtml = '<div class="task-result-grid lightbox-grid">';
        entry.urls.forEach((u, i) => {
            const resolvedUrl = _resolveMediaUrl(entry, i);
            mediaHtml += `<img src="${esc(resolvedUrl)}" alt="Result ${i + 1}" loading="lazy" class="task-result-grid-img lightbox-media">`;
        });
        mediaHtml += '</div>';
    } else if (entry.model && entry.model.startsWith('suno/')) {
        // Multi-audio (Suno tracks) with premium layout
        mediaHtml = '<div class="suno-lightbox-list">';
        const sunoArr = entry.sunoData || [];

        // Backward compatibility for old history items — also handle empty sunoData
        if (sunoArr.length === 0 && entry.urls && entry.urls.length > 0) {
            entry.urls.forEach((u, i) => {
                sunoArr.push({ audioUrl: u, imageUrl: entry.coverUrl || '', title: entry.trackTitle || `Faixa ${i + 1}` });
            });
        }
        if (sunoArr.length === 0) {
            sunoArr.push({ audioUrl: '', imageUrl: '', title: 'Áudio Gerado' });
        }

        sunoArr.forEach((track, i) => {
            const audioSrc = track.audioUrl || track.sourceAudioUrl || '';
            const coverSrc = track.imageUrl || track.sourceImageUrl || '';
            const title = track.title || `Faixa ${i + 1}`;
            const tags = track.tags || '';
            const dur = track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}` : '';
            const lyrics = track.prompt || '';
            const audioId = track.id || '';
            const parentTaskId = entry.id || '';

            // No-cover: animated gradient background
            const bgStyle = coverSrc
                ? ''
                : 'background: linear-gradient(135deg, #1a0a0a 0%, #2d0d0d 40%, #1c1c1c 100%);';

            mediaHtml += `<div class="suno-lb-card">
                <div class="suno-lb-hero" style="${bgStyle}">
                    ${coverSrc ? `<img src="${esc(coverSrc)}" alt="${esc(title)}" class="suno-lb-cover">` : ''}
                    <div class="suno-lb-hero-overlay"></div>
                    <div class="suno-lb-meta">
                        <div class="suno-lb-track-num">Track ${i + 1}</div>
                        <div class="suno-lb-title">${esc(title)}</div>
                        ${tags ? `<div class="suno-lb-tags">${esc(tags.substring(0, 100))}${tags.length > 100 ? '…' : ''}</div>` : ''}
                        ${dur ? `<div class="suno-lb-dur">${dur}</div>` : ''}
                    </div>
                    ${!coverSrc ? `<div class="suno-lb-waveform">
                        ${Array.from({ length: 28 }, (_, k) => `<span style="height:${20 + Math.sin(k * 0.8 + i) * 14 + Math.sin(k * 1.7) * 8}%"></span>`).join('')}
                    </div>` : ''}
                </div>
                <div class="suno-lb-player">
                    ${_buildMusicPlayerHtml(audioSrc, title, tags || 'Suno AI', coverSrc, `lb-${parentTaskId}-${i}`)}
                </div>
                ${lyrics ? `<details class="suno-track-lyrics-wrap"><summary>Ver Letra</summary><pre class="suno-track-lyrics">${esc(lyrics)}</pre></details>` : ''}
                <div class="suno-lb-actions">
                    <button class="suno-lb-btn suno-action" data-suno-model="suno/extend-music" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}">🔁 Extend</button>
                    <button class="suno-lb-btn suno-action" data-suno-model="suno/add-instrumental" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}">🎸 +Instr</button>
                    <button class="suno-lb-btn suno-action" data-suno-model="suno/add-vocals" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}">🎤 +Vocal</button>
                    <button class="suno-lb-btn suno-action" data-suno-model="suno/separate-vocals" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}">✂️ Sep</button>
                    <button class="suno-lb-btn suno-action" data-suno-model="suno/music-video" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}">🎬 Clipe</button>
                    <button class="suno-lb-btn suno-action" data-suno-model="suno/convert-wav" data-audio-id="${esc(audioId)}" data-task-id="${esc(parentTaskId)}">📄 WAV</button>
                </div>
            </div>`;
        });
        mediaHtml += '</div>';
    } else if (isVid) {
        mediaHtml = `<video src="${esc(url)}" controls autoplay preload="auto" class="lightbox-media" playsinline onerror="window.handleExpiredMedia(this)"></video>`;
    } else if (isAud) {
        mediaHtml = _buildMusicPlayerHtml(url, 'Áudio', '', '', `lb-gen-${entry.id}`);
    } else if (url) {
        mediaHtml = `<img src="${esc(url)}" alt="Result" class="lightbox-media" onerror="window.handleExpiredMedia(this)">`;
    } else if (entry.state === 'fail' || entry.state === 'failed') {
        mediaHtml = `<div class="lightbox-error">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--error)" stroke-width="1.5" style="margin-bottom:12px;">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <h3 style="color:var(--text); margin-bottom:8px;">Tarefa Falhou</h3>
                        <p style="color:var(--text-muted)">${entry.data?.failMsg || 'Erro desconhecido durante o processamento.'}</p>
                     </div>`;
    } else {
        mediaHtml = '<p style="color:var(--text-muted)">Sem mídia disponível</p>';
    }

    const promptHtml = entry.prompt ? `<p class="lightbox-prompt">${esc(entry.prompt)}</p>` : '';
    const costHtml = entry.costTime ? `<span class="lightbox-cost">⏱ ${(entry.costTime / 1000).toFixed(1)}s</span>` : '';

    const overlay = document.createElement('div');
    overlay.id = 'history-lightbox';
    overlay.className = `lightbox-overlay${isVid ? ' video-mode' : ''}`;
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
                ${prevEntry ? `<button class="lightbox-nav lightbox-nav-prev" title="Anterior (←)">‹</button>` : ''}
                ${mediaHtml}
                ${nextEntry ? `<button class="lightbox-nav lightbox-nav-next" title="Próximo (→)">›</button>` : ''}
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

    const prevBtn = overlay.querySelector('.lightbox-nav-prev');
    const nextBtn = overlay.querySelector('.lightbox-nav-next');
    if (prevBtn && prevEntry) prevBtn.addEventListener('click', e => { e.stopPropagation(); openHistoryLightbox(prevEntry); });
    if (nextBtn && nextEntry) nextBtn.addEventListener('click', e => { e.stopPropagation(); openHistoryLightbox(nextEntry); });

    overlay.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeLightbox(overlay);
        if (e.key === 'ArrowLeft' && prevEntry) openHistoryLightbox(prevEntry);
        if (e.key === 'ArrowRight' && nextEntry) openHistoryLightbox(nextEntry);
    });

    // Reuse handler
    overlay.querySelector('.lightbox-reuse')?.addEventListener('click', async () => {
        const modelData = getModelDetails(entry.model);
        if (modelData) {
            if (entry.cat !== currentCat) {
                const catTab = document.querySelector(`.sidebar-nav-item[data-cat="${entry.cat}"]`);
                if (catTab) catTab.click();
            }
            selectModelFromData(modelData);

      // Populate V2 prompt
      const v2PromptEl = document.getElementById('v2-prompt');
      if (entry.prompt && v2PromptEl) {
        v2PromptEl.value = entry.prompt;
        v2PromptEl.dispatchEvent(new Event('input'));
      }

      // Populate negative prompt
      const v2NegPromptEl = document.getElementById('v2-negative-prompt');
      if (entry.extraParams?.negative_prompt && v2NegPromptEl) {
        v2NegPromptEl.value = entry.extraParams.negative_prompt;
        v2NegPromptEl.dispatchEvent(new Event('input'));
      }

      // Restore extra params into V2 workspace dynamic params
      if (entry.extraParams) {
                setTimeout(() => {
                    const ep = entry.extraParams;
                    const v2Params = document.getElementById('v2-dynamic-params');
                    if (!v2Params) return;
                    for (const [k, v] of Object.entries(ep)) {
                        const selectEl = v2Params.querySelector(`select[data-param-key="${CSS.escape(k)}"]`);
                        if (selectEl) { selectEl.value = v; continue; }
                        const radios = v2Params.querySelectorAll(`input[type="radio"][name="param-${CSS.escape(k)}"]`);
                        const radioEl = Array.from(radios).find(r => r.value === v);
                        if (radioEl) { radioEl.click(); continue; }
                        const numEl = v2Params.querySelector(`input[type="range"][data-param-key="${CSS.escape(k)}"], input[type="number"][data-param-key="${CSS.escape(k)}"]`);
                        if (numEl) { numEl.value = v; numEl.dispatchEvent(new Event('input', { bubbles: true })); continue; }
                        const chkEl = v2Params.querySelector(`input[type="checkbox"][data-param-key="${CSS.escape(k)}"]`);
                        if (chkEl) { chkEl.checked = v; continue; }
                        const txtEl = v2Params.querySelector(`input[type="text"][data-param-key="${CSS.escape(k)}"]`);
                        if (txtEl) { txtEl.value = v; continue; }
                    }
                }, 100);
            }

            if (entry.inputFileUrl) {
                const inputUrls = Array.isArray(entry.inputFileUrl) ? entry.inputFileUrl : [entry.inputFileUrl];
                const mimeToExt = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm', 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3' };
                toast(`Baixando ${inputUrls.length > 1 ? inputUrls.length + ' imagens' : 'mídia'} original...`, 'info');
                const results = await Promise.allSettled(inputUrls.map(async (url) => {
                    const resp = await fetch(url);
                    if (!resp.ok) throw new Error(`Download failed: ${url}`);
                    const blob = await resp.blob();
                    const ext = mimeToExt[blob.type] || 'jpg';
                    return new File([blob], `input.${ext}`, { type: blob.type });
                }));
                const files = results.filter(r => r.status === 'fulfilled').map(r => r.value);
                const failed = results.filter(r => r.status === 'rejected').length;
                if (failed > 0) {
                    console.warn(`${failed} file(s) failed to download`);
                    toast(`⚠️ ${failed} arquivo(s) não puderam ser carregados`, 'error');
                }
                if (files.length > 0 && typeof v2Registry.addFilesFromReuse === 'function') {
                    v2Registry.addFilesFromReuse(files);
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
    overlay.querySelector('.lightbox-delete')?.addEventListener('click', async () => {
        // Mark as deleted FIRST — blocks all async re-insertion paths
        _deletedIds.add(entry.id);
        // Delete from server (await + verify)
        try {
            const resp = await fetch(`${API}/api/history/${encodeURIComponent(entry.id)}`, { method: 'DELETE', headers: _kieAuthHeaders() });
            if (!resp.ok) console.error('[history] Server delete returned', resp.status);
        } catch (err) {
            console.warn('[history] Server delete failed:', err.message);
        }
        const history = loadHistory().filter(h => h.id !== entry.id);
        saveHistory(history);
        // Also remove from V2 server history cache
        if (typeof _serverHistoryCache !== 'undefined') _serverHistoryCache.delete(entry.id);
        // Remove V2 gallery item DOM element if visible
        document.querySelectorAll(`.v2-gallery-item[data-base-task-id="${entry.id}"]`).forEach(el => el.remove());
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

/** Sanitize SVG string — only allow safe SVG elements, strip everything else */
function sanitizeSvg(raw) {
    if (!raw || typeof raw !== 'string') return '';
    const ALLOWED = new Set([
        'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse',
        'g', 'defs', 'use', 'text', 'tspan', 'clippath', 'mask', 'pattern',
        'lineargradient', 'radialgradient', 'stop'
    ]);
    try {
        const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
        const err = doc.querySelector('parsererror');
        if (err) return esc(raw);
        // Walk all elements, remove any not in allowlist
        doc.querySelectorAll('*').forEach(el => {
            if (!ALLOWED.has(el.tagName.toLowerCase())) el.remove();
        });
        const svg = doc.documentElement;
        return svg.tagName.toLowerCase() === 'svg' ? svg.outerHTML : esc(raw);
    } catch (e) { console.warn('[sanitizeSvg] Failed to parse SVG:', e.message); return esc(raw); }
}

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

    try {
        let resp, json;

        if (actionModel === 'veo3/get-1080p') {
            // 1080p uses a dedicated GET endpoint
            resp = await fetch(`${API}/api/veo/1080p/${encodeURIComponent(originalTaskId)}`);
            json = await resp.json();
            if (!resp.ok) throw new Error(json.detail || 'Failed');

            // 1080p returns the video URL directly — show it as a toast with link
            const hdUrl = json?.data?.resultUrl || json?.data?.downloadUrl
                || (Array.isArray(json?.data?.resultUrls) ? json.data.resultUrls[0] : null);
            if (hdUrl && (hdUrl.startsWith('http://') || hdUrl.startsWith('https://'))) {
                toast('✅ Vídeo 1080p disponível! URL copiada.', 'success');
                try { await navigator.clipboard.writeText(hdUrl); } catch (e) { console.warn('[clipboard] Failed to copy 1080p URL:', e.message); }
                // Open in new tab
                window.open(hdUrl, '_blank');
            } else {
                // It might start a new task (async processing)
                const taskId = json?.data?.taskId || json?.taskId;
                if (taskId) {
                    const veoInputUrl = Array.isArray(existingTask?.inputFileUrl) ? existingTask.inputFileUrl[0] : (existingTask?.inputFileUrl || null);
                    addTask(taskId, actionModel, 'veo', veoInputUrl, null, 'veo3');
                    toast('✅ Processando 1080p...', 'success');
                } else {
                    toast('✅ Requisição 1080p enviada! Verifique o JSON para detalhes.', 'success');
                    console.log('[Veo 1080p] Response:', json);
                }
            }
        } else if (actionModel === 'veo3/get-4k') {
            // 4K uses a dedicated POST endpoint
            const fd = new FormData();
            fd.append('task_id', originalTaskId);
            resp = await fetch(`${API}/api/veo/4k`, { method: 'POST', body: fd });
            json = await resp.json();
            if (!resp.ok) throw new Error(json.detail || 'Failed');

            // 4K is async — check if it returns a new taskId or direct URL
            const url4k = json?.data?.resultUrl || json?.data?.downloadUrl
                || (Array.isArray(json?.data?.resultUrls) ? json.data.resultUrls[0] : null);
            if (url4k && (url4k.startsWith('http://') || url4k.startsWith('https://'))) {
                toast('✅ Vídeo 4K disponível! URL copiada.', 'success');
                try { await navigator.clipboard.writeText(url4k); } catch (e) { console.warn('[clipboard] Failed to copy 4K URL:', e.message); }
                window.open(url4k, '_blank');
            } else {
                const taskId = json?.data?.taskId || json?.taskId;
                if (taskId) {
                    const veoInputUrl = Array.isArray(existingTask?.inputFileUrl) ? existingTask.inputFileUrl[0] : (existingTask?.inputFileUrl || null);
                    addTask(taskId, actionModel, 'veo', veoInputUrl, null, 'veo3');
                    toast('✅ Processando 4K... (pode demorar)', 'success');
                } else {
                    toast('✅ Requisição 4K enviada! Verifique o JSON para detalhes.', 'success');
                    console.log('[Veo 4K] Response:', json);
                }
            }
        } else {
            // Extend actions use the standard Veo create endpoint
            const fd = new FormData();
            fd.append('model', actionModel);
            fd.append('input_json', JSON.stringify({ taskId: originalTaskId }));

            resp = await fetch(`${API}/api/veo/create`, { method: 'POST', body: fd });
            json = await resp.json();
            if (!resp.ok) throw new Error(json.detail || 'Failed');

            const taskId = json?.data?.taskId || json?.task?.data?.taskId || json?.taskId;
            if (taskId) {
                const veoInputUrl = Array.isArray(existingTask?.inputFileUrl) ? existingTask.inputFileUrl[0] : (existingTask?.inputFileUrl || null);
                addTask(taskId, actionModel, 'veo', veoInputUrl, null, 'veo3');
                toast(`✅ ${actionModel.split('/').pop()} enviado!`, 'success');
            }
        }

        // Switch tab to active requests if clicking from history lightbox
        const targetLightbox = e.target.closest('#history-lightbox');
        if (targetLightbox) closeLightbox(targetLightbox);
    } catch (err) {
        toast(`❌ Erro: ${err.message}`, 'error');
    } finally {
        btn.textContent = prevText;
        btn.disabled = false;
        btn.classList.remove('loading');
    }
});

// GPT4o Image: Download HD (signed URL) action
document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('.gpt4o-download-action');
    if (!btn) return;

    const taskId = btn.dataset.taskId;
    const imageUrl = btn.dataset.url;
    if (!taskId || !imageUrl) return;

    const prevText = btn.textContent;
    btn.textContent = 'Obtendo...';
    btn.disabled = true;
    btn.classList.add('loading');

    try {
        const fd = new FormData();
        fd.append('taskId', taskId);
        fd.append('url', imageUrl);

        const resp = await fetch(`${API}/api/gpt4o-image/download-url`, { method: 'POST', body: fd });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || 'Failed');

        // Extract the signed download URL from response
        const downloadUrl = json?.data?.downloadUrl || json?.data?.url || json?.downloadUrl;
        if (downloadUrl) {
            toast('✅ URL de download obtida! Válida por 20 min.', 'success');
            window.open(downloadUrl, '_blank');
        } else {
            toast('⚠️ Resposta recebida mas sem URL. Verifique o console.', 'warning');
            console.log('[GPT4o Download] Response:', json);
        }
    } catch (err) {
        toast(`❌ Erro download: ${err.message}`, 'error');
    } finally {
        btn.textContent = prevText;
        btn.disabled = false;
        btn.classList.remove('loading');
    }
});

// ── Suno post-actions (Extend, Separate, +Instr, +Vocal, Clipe, WAV) ──
// Actions needing extra params expand an inline panel inside the track card;
// simple actions submit immediately.
const SUNO_NEEDS_PANEL = new Set(['suno/extend-music', 'suno/separate-vocals']);

async function _submitSunoAction(model, audioId, taskId, extra, lightboxEl) {
    const fd = new FormData();
    fd.append('model', model);
    fd.append('input_json', JSON.stringify({ audioId, taskId, ...extra }));
    const resp = await fetch(`${API}/api/suno/create`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || 'Falha ao executar ação Suno');
    const newTaskId = json?.data?.taskId || json?.task?.data?.taskId || json?.taskId;
    if (newTaskId) {
        const label = model.split('/').pop().replace(/-/g, ' ');
        addTask(newTaskId, model, 'suno', null, { parentTaskId: taskId, audioId });
        toast(`✅ Suno ${label} enviado!`, 'success');
        if (lightboxEl) closeLightbox(lightboxEl);
    }
}

function _buildSunoPanel(model, audioId, taskId, lightboxEl) {
    const panel = document.createElement('div');
    panel.className = 'suno-inline-panel';
    panel.dataset.model = model;

    if (model === 'suno/extend-music') {
        panel.innerHTML = `
            <div class="suno-panel-fields">
                <div class="suno-panel-field">
                    <label class="suno-panel-label">Estilo <span class="suno-panel-hint">— opcional</span></label>
                    <input class="suno-panel-input" id="sp-style" type="text" placeholder="ex: synthwave, epic, dark...">
                </div>
                <div class="suno-panel-field">
                    <label class="suno-panel-label">Continuar em (seg) <span class="suno-panel-hint">— 0 = fim</span></label>
                    <input class="suno-panel-input" id="sp-continue" type="number" min="0" max="600" placeholder="0" value="0">
                </div>
                <div class="suno-panel-field">
                    <label class="suno-panel-label">Tags <span class="suno-panel-hint">— opcional</span></label>
                    <input class="suno-panel-input" id="sp-tags" type="text" placeholder="ex: bass, guitar...">
                </div>
            </div>
            <div class="suno-panel-actions">
                <button class="suno-panel-confirm">🔁 Gerar Extend</button>
                <button class="suno-panel-cancel">Cancelar</button>
            </div>`;

        panel.querySelector('.suno-panel-confirm').addEventListener('click', async (ev) => {
            const confirmBtn = ev.currentTarget;
            const extra = {};
            const style = panel.querySelector('#sp-style').value.trim();
            const cont = parseInt(panel.querySelector('#sp-continue').value) || 0;
            const tags = panel.querySelector('#sp-tags').value.trim();
            if (style) extra.style = style;
            if (cont > 0) extra.continueAt = cont;
            if (tags) extra.tags = tags;
            confirmBtn.textContent = '⏳ Enviando...';
            confirmBtn.disabled = true;
            try { await _submitSunoAction(model, audioId, taskId, extra, lightboxEl); panel.remove(); }
            catch (err) { toast(`❌ ${err.message}`, 'error'); confirmBtn.textContent = '🔁 Gerar Extend'; confirmBtn.disabled = false; }
        });

    } else if (model === 'suno/separate-vocals') {
        panel.innerHTML = `
            <div class="suno-panel-fields">
                <div class="suno-panel-field">
                    <label class="suno-panel-label">Separar</label>
                    <div class="suno-panel-radios">
                        <label class="suno-panel-radio"><input type="radio" name="sp-type" value="vocals"> Só Vocais</label>
                        <label class="suno-panel-radio"><input type="radio" name="sp-type" value="instrumental"> Só Instrumental</label>
                        <label class="suno-panel-radio"><input type="radio" name="sp-type" value="both" checked> Ambos</label>
                    </div>
                </div>
            </div>
            <div class="suno-panel-actions">
                <button class="suno-panel-confirm">✂️ Separar</button>
                <button class="suno-panel-cancel">Cancelar</button>
            </div>`;

        panel.querySelector('.suno-panel-confirm').addEventListener('click', async (ev) => {
            const confirmBtn = ev.currentTarget;
            const type = panel.querySelector('input[name="sp-type"]:checked')?.value || 'both';
            confirmBtn.textContent = '⏳ Enviando...';
            confirmBtn.disabled = true;
            try { await _submitSunoAction(model, audioId, taskId, { type }, lightboxEl); panel.remove(); }
            catch (err) { toast(`❌ ${err.message}`, 'error'); confirmBtn.textContent = '✂️ Separar'; confirmBtn.disabled = false; }
        });
    }

    panel.querySelector('.suno-panel-cancel').addEventListener('click', () => panel.remove());
    return panel;
}

document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('.suno-action');
    if (!btn) return;

    const model = btn.dataset.sunoModel;
    const audioId = btn.dataset.audioId;
    const taskId = btn.dataset.taskId;
    if (!model || !taskId) return;

    const trackCard = btn.closest('.suno-track-card');
    const lightboxEl = btn.closest('#history-lightbox');

    // Toggle inline panel for actions needing extra params
    if (SUNO_NEEDS_PANEL.has(model)) {
        const existing = trackCard?.querySelector(`.suno-inline-panel[data-model="${model}"]`);
        if (existing) { existing.remove(); return; } // toggle off
        trackCard?.querySelectorAll('.suno-inline-panel').forEach(p => p.remove()); // close others
        const panel = _buildSunoPanel(model, audioId, taskId, lightboxEl);
        // Insert after last action row
        const lastRow = trackCard?.querySelector('.suno-actions-row:last-of-type') || btn.parentElement;
        lastRow.after(panel);
        panel.querySelector('input:not([type="radio"])')?.focus();
        return;
    }

    // Simple actions — submit immediately
    const prevText = btn.textContent;
    btn.textContent = '⏳';
    btn.disabled = true;
    try {
        await _submitSunoAction(model, audioId, taskId, {}, lightboxEl);
    } catch (err) {
        toast(`❌ Erro Suno: ${err.message}`, 'error');
    } finally {
        btn.textContent = prevText;
        btn.disabled = false;
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
//  IMAGE V2 — WORKSPACE OVERLAY CONTROLLER
//  Fully functional: connects to existing submit infrastructure
// ============================================================

// Registry for cross-closure communication with v2 workspace
const v2Registry = {};

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
        filesGrid: document.getElementById('v2-files-grid'),
        fileCounter: document.getElementById('v2-file-counter'),

        // Frames reference
        uploadFramesGroup: document.getElementById('v2-group-upload-frames'),
        frameInitialZone: document.getElementById('v2-upload-zone-initial'),
        frameInitialInput: document.getElementById('v2-file-input-initial'),
        frameInitialGrid: document.getElementById('v2-files-grid-initial'),
        frameFinalZone: document.getElementById('v2-upload-zone-final'),
        frameFinalInput: document.getElementById('v2-file-input-final'),
        frameFinalGrid: document.getElementById('v2-files-grid-final'),

        btnGenerate: document.getElementById('v2-btn-generate'),
        btnBack: document.getElementById('v2-btn-back'),
        btnReset: document.getElementById('v2-btn-reset'),
        gallery: document.getElementById('v2-gallery'),
        galleryEmpty: document.getElementById('v2-gallery-empty'),
        galleryCount: document.getElementById('v2-gallery-count'),
        dynamicParams: document.getElementById('v2-dynamic-params'),
        creditsAmount: document.getElementById('v2-credits'),

        // Video reference (Seedance 2.0)
        uploadVideoGroup: document.getElementById('v2-group-upload-videos'),
        uploadVideoZone: document.getElementById('v2-upload-zone-video'),
        videoFileInput: document.getElementById('v2-file-input-video'),
        videoFilesGrid: document.getElementById('v2-files-grid-video'),
        videoCounter: document.getElementById('v2-video-counter'),
    };

    // ── State ──
    let v2MaxFiles = 8; // Adjustable per model (1 for image-to-video, 8 for image)
    let v2Files = []; // Array of File objects
    let v2FrameInitial = null; // File object for Initial Frame
    let v2FrameFinal = null;   // File object for Final Frame
    let v2VideoFiles = [];     // Array of File objects for video references (Seedance 2.0)
    let v2VideoDurations = []; // Measured durations of v2VideoFiles
    let v2MaxVideoFiles = 3;   // Max video references
    let v2Settings = { ...DEFAULT_V2_SETTINGS };
    let v2Tasks = JSON.parse(sessionStorage.getItem('v2_tasks') || '[]'); // Track tasks spawned from V2 workspace

    // ── Current model state for V2 workspace ──
    let v2Model = null; // Will hold { model, name, provider, icon, input, field, color, ... }

    // ── Show / Hide ──
    window._v2ShowWorkspace = function (modelData) {
        if (modelData) {
            const prevModel = v2Model?.model;
            v2Model = modelData;
            if (prevModel && prevModel !== modelData.model) {
                v2ClearAllFiles();
            }
            v2UpdateModelUI(modelData);
        }
        ws.classList.remove('hidden');
        document.getElementById('app-main').classList.add('hidden');
        v2.prompt.focus();
        updateV2GenerateState();
        refreshV2Gallery();
    };

    // Helper: detect video URL by extension
    function isVideoUrl(url) {
        return /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(url);
    }

    // Helper: detect audio URL by extension
    function isAudioUrl(url) {
        return /\.(mp3|wav|flac|m4a|ogg)(\?|$)/i.test(url);
    }

    // ── Update workspace UI to reflect selected model ──
    function v2UpdateModelUI(data) {
        const isVideo = VIDEO_CATS.includes(currentCat);

        // ── Model badge ──
        const badgeIcon = ws.querySelector('.v2-model-badge-icon');
        const badgeName = ws.querySelector('.v2-model-badge-name');
        const badgeProvider = ws.querySelector('.v2-model-badge-provider');
        const badgeTag = ws.querySelector('.v2-model-badge-tag');
        if (badgeIcon) badgeIcon.innerHTML = data.icon || '';
        if (badgeName) badgeName.textContent = data.name || '';
        if (badgeProvider) badgeProvider.textContent = data.provider || '';
        const inputLabel = data.input === 'file' ? (isVideo ? 'VÍDEO' : 'IMAGEM')
            : data.input === 'mix' ? 'MIX' : 'TEXTO';
        if (badgeTag) badgeTag.textContent = inputLabel;

        // ── Model info ──
        const modelInfoEl = ws.querySelector('.v2-model-info');
        const modelInfoValue = ws.querySelector('.v2-model-info-value');
        if (modelInfoValue) modelInfoValue.textContent = data.model || '';
        if (modelInfoEl) modelInfoEl.style.display = (data.model === 'seedream/5-lite') ? 'none' : '';

        // ── Gallery title & empty hint ──
        const galleryTitle = document.getElementById('v2-gallery-title');
        if (galleryTitle) galleryTitle.textContent = isVideo ? 'Vídeos Gerados' : 'Gerado';
        const emptyHint = ws.querySelector('.v2-gallery-empty-hint');
        if (emptyHint) emptyHint.textContent = isVideo
            ? 'Configure o modo e clique em Gerar'
            : 'Escreva um prompt e clique em Gerar';

        // ── Dynamic settings from MODEL_CONFIGS (must render before cost calc) ──
        v2RenderModelParams(data.model);

        // ── Cost (after params are rendered so MJ cost can read speed) ──
        v2UpdateCost();

        // ── Generate button label ──
        const btnSpan = v2.btnGenerate.querySelector('span');
        const isAudioCat = currentCat === 'audio' || currentCat === 'music';
        const isSunoMain = data.model === 'suno/generate-music';
        if (btnSpan) {
            if (isVideo) btnSpan.textContent = 'Gerar Vídeo';
            else if (isSunoMain) btnSpan.textContent = 'Gerar Música';
            else if (isAudioCat) btnSpan.textContent = 'Gerar';
            else btnSpan.textContent = 'Gerar Imagem';
        }

        // ── Prompt show/hide ──
        const promptGroup = v2.prompt?.closest('.v2-form-group');
        const needsPrompt = data.input === 'text' || data.input === 'mix' || data.prompt === 'true';
        if (promptGroup) promptGroup.style.display = needsPrompt ? '' : 'none';

        // ── Upload zone show/hide + label + max files ──
        const isAudio = currentCat === 'audio' || currentCat === 'music';
        const needsFile = !isAudio && (data.input === 'file' || data.input === 'mix');
        const uploadGroup = document.getElementById('v2-group-upload');
        const uploadFramesGroup = v2.uploadFramesGroup;

        // Seedance 2.0 workflow detection
        const isSeedanceFrames = data.model === 'bytedance/seedance-2-frames';
        const isSeedanceMulti = data.model === 'bytedance/seedance-2-multi';
        const isSeedanceVideo = data.model === 'bytedance/seedance-2-video';

        const isFramesModel = (data.model && (data.model.startsWith('veo3/') || data.model.includes('kling-3.0/video') || isSeedanceFrames));

        // Show/hide upload zones based on workflow
        if (uploadFramesGroup) uploadFramesGroup.classList.toggle('hidden', !(needsFile && isFramesModel));
        if (uploadGroup) uploadGroup.classList.toggle('hidden', !(needsFile && !isFramesModel && !isSeedanceVideo));
        if (v2.uploadVideoGroup) v2.uploadVideoGroup.classList.toggle('hidden', !isSeedanceVideo);

        // ── Update file input accept for video models ──
        if (v2.fileInput) {
            if (data.model === TOPAZ_VIDEO_UPSCALE_MODEL || data.model === 'wan/2-7-videoedit') {
                v2.fileInput.accept = TOPAZ_VIDEO_ACCEPT;
            } else if (data.model === 'wan/2-7-r2v') {
                v2.fileInput.accept = 'image/*,video/*';
            } else {
                v2.fileInput.accept = 'image/*';
            }
        }

        // ── Dialogue group show/hide (ElevenLabs Dialogue V3) ──
        const isDialogue = data.model === 'elevenlabs/text-to-dialogue-v3';
        const dialogueGroup = document.getElementById('v2-group-dialogue');
        if (dialogueGroup) {
            dialogueGroup.classList.toggle('hidden', !isDialogue);
            if (isDialogue) {
                // Also hide main prompt for dialogue mode
                if (promptGroup) promptGroup.style.display = 'none';
                // Initialize with 2 lines if empty
                const diagList = document.getElementById('v2-dialogue-list');
                if (diagList && diagList.children.length === 0) {
                    _addDialogueLine(diagList);
                    _addDialogueLine(diagList);
                }
                _updateDialogueCounter();
            }
        }

        // Per-model max reference files (from API docs)
        const MODEL_MAX_FILES = {
            'nano-banana-2': 14,               // up to 14 images
            'google/nano-banana-edit': 10,      // up to 10 images
            'seedream/5-lite': 14,              // up to 14 images
            'gpt4o-image': 5,                   // up to 5 image URLs
            'qwen/image-edit': 1,               // single image_url
            'grok-imagine/text-to-image': 1,    // max one per request
            'grok-imagine/text-to-video': 7,    // up to 7 images, ref with @image(n)
            'flux-kontext-pro': 1,              // single inputImage
            'flux-kontext-max': 1,              // single inputImage
            'flux-2/pro-text-to-image': 0,      // text only
            'kling-3.0/video': 2,              // first + last frame
            'wan/2-7-image-to-video': 1,
            'wan/2-7-videoedit': 1,
            'wan/2-7-r2v': 5,
            'bytedance/seedance-2-frames': 2,  // initial + final frame
            'bytedance/seedance-2-multi': 9,   // up to 9 reference images
            'bytedance/seedance-2-video': 0,   // video refs use separate v2VideoFiles array
            'bytedance/seedance-2-fast': 9,    // up to 9 reference images
        };
        const modelKey = data.model || '';
        // Check per-model override first, then fall back to category defaults
        if (modelKey in MODEL_MAX_FILES) {
            v2MaxFiles = MODEL_MAX_FILES[modelKey];
        } else if (isVideo || isAudio) {
            v2MaxFiles = 1;
        } else {
            v2MaxFiles = 1; // safe default
        }

        const isVideoUpscale = modelKey === TOPAZ_VIDEO_UPSCALE_MODEL;
        const uploadLabel = document.getElementById('v2-upload-label');
        if (uploadLabel) {
            const isImageEdit = ['qwen/image-edit', 'google/nano-banana-edit'].includes(modelKey);
            if (modelKey === 'wan/2-7-videoedit') {
                uploadLabel.innerHTML = 'Vídeo de referência <span class="v2-label-hint">— obrigatório</span>';
            } else if (modelKey === 'wan/2-7-r2v') {
                uploadLabel.innerHTML = 'Referências (imagem/vídeo) <span class="v2-label-hint">— até 5 arquivos</span>';
            } else if (isVideoUpscale) {
                uploadLabel.innerHTML = 'Vídeo para upscale <span class="v2-label-hint">— MP4, MOV ou MKV, máx. 50MB</span>';
            } else if (isImageEdit) {
                uploadLabel.innerHTML = 'Imagem para editar <span class="v2-label-hint">— obrigatória</span>';
            } else if (v2MaxFiles <= 1) {
                uploadLabel.innerHTML = 'Imagem de referência <span class="v2-label-hint">— opcional</span>';
            } else {
                uploadLabel.innerHTML = `Imagens de referência <span class="v2-label-hint">— opcional, até ${v2MaxFiles}</span>`;
            }
        }
        const uploadZoneHint = document.querySelector('#v2-upload-zone .v2-upload-hint');
        if (uploadZoneHint) {
            if (modelKey === 'wan/2-7-videoedit') uploadZoneHint.textContent = 'MP4, MOV, MKV, AVI';
            else if (modelKey === 'wan/2-7-r2v') uploadZoneHint.textContent = 'PNG, JPG, WEBP, MP4, MOV';
            else if (isVideoUpscale) uploadZoneHint.textContent = 'MP4, MOV, MKV, AVI';
            else uploadZoneHint.textContent = 'PNG, JPG, WEBP';
        }

        const emptyGalleryHint = document.querySelector('#v2-gallery-empty .v2-gallery-empty-hint');
        if (emptyGalleryHint) {
            if (!needsPrompt && needsFile) emptyGalleryHint.textContent = 'Faça o upload do arquivo e clique em Generate';
            else emptyGalleryHint.textContent = 'Escreva um prompt e clique em Generate';
        }

        // Trim files if over new max, always re-render counter
        if (v2Files.length > v2MaxFiles) v2Files = v2Files.slice(0, v2MaxFiles);
        v2RenderFilesGrid(); // updates file counter to N / v2MaxFiles
        updateV2GenerateState();

        // ── Negative prompt show/hide ──
        const negPromptGroup = document.getElementById('v2-group-negative-prompt');
        const cfg = MODEL_CONFIGS[modelKey];
        const hasNegPrompt = cfg && cfg.params.some(p => p.key === 'negative_prompt');
        if (negPromptGroup) negPromptGroup.classList.toggle('hidden', !hasNegPrompt);
    }

    // ── Dynamic V2 Model Params ──
    const SUNO_CUSTOM_MODE_KEYS = new Set(['style', 'title', 'instrumental']);

    function v2RenderModelParams(modelKey) {
        const container = v2.dynamicParams;
        if (!container) return;
        container.innerHTML = '';

        const cfg = MODEL_CONFIGS[modelKey];
        if (!cfg || cfg.params.length === 0) {
            container.innerHTML = '<div class="v2-no-params">Sem configurações adicionais</div>';
            return;
        }

        const isSunoGenerate = modelKey === 'suno/generate-music';

        cfg.params.forEach(p => {
            // Skip negative_prompt — rendered in dedicated form field below prompt
            if (p.key === 'negative_prompt') return;

            const group = document.createElement('div');
            group.className = 'v2-param-group';
            group.dataset.paramGroupKey = p.key;

            if (isSunoGenerate && SUNO_CUSTOM_MODE_KEYS.has(p.key)) {
                group.classList.add('hidden');
            }

            if (p.type === 'radio') {
                // Header label only (no redundant value span)
                const header = document.createElement('div');
                header.className = 'v2-param-header';
                const label = document.createElement('label');
                label.className = 'v2-label';
                label.textContent = p.label;
                header.appendChild(label);
                group.appendChild(header);

                // Pill grid
                const pills = document.createElement('div');
                pills.className = 'v2-param-pills';
                p.options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'v2-param-pill';
                    btn.dataset.paramKey = p.key;
                    btn.dataset.value = opt;
                    btn.textContent = opt;
                    if (opt === String(p.default)) btn.classList.add('active');
                    btn.addEventListener('click', () => {
                        pills.querySelectorAll('.v2-param-pill').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        v2UpdateCost();
                    });
                    pills.appendChild(btn);
                });
                group.appendChild(pills);

            } else if (p.type === 'select') {
                const header = document.createElement('div');
                header.className = 'v2-param-header';
                const label = document.createElement('label');
                label.className = 'v2-label';
                label.textContent = p.label;
                header.appendChild(label);
                group.appendChild(header);

                const sel = document.createElement('select');
                sel.className = 'v2-param-select';
                sel.dataset.paramKey = p.key;
                p.options.forEach(opt => {
                    const o = document.createElement('option');
                    // Handle objects {id, label} or strings
                    const val = typeof opt === 'string' ? opt : opt.id;
                    const lab = typeof opt === 'string' ? (opt || '(auto)') : opt.label;
                    o.value = val;
                    o.textContent = lab;
                    if (val === String(p.default)) o.selected = true;
                    sel.appendChild(o);
                });
    sel.addEventListener('change', () => {
      requestAnimationFrame(() => v2UpdateCost());
      if (p.key === 'suno_mode') {
                        const isLyrics = sel.value === 'Letra';
                        const MUSIC_ONLY = new Set(['model', 'custom_mode', 'style', 'title', 'instrumental']);
                        container.querySelectorAll('.v2-param-group').forEach(g => {
                            if (MUSIC_ONLY.has(g.dataset.paramGroupKey)) {
                                g.classList.toggle('hidden', isLyrics);
                            }
                        });
                        const btnSpan = v2.btnGenerate?.querySelector('span');
                        if (btnSpan) btnSpan.textContent = isLyrics ? 'Gerar Letra' : 'Gerar Música';
                        if (v2.prompt) v2.prompt.placeholder = isLyrics
                            ? 'Descreva o tema, vibe ou história da letra...'
                            : 'Descreva o estilo, vibe ou letra da música...';
                    }
                });
                group.appendChild(sel);

            } else if (p.type === 'number') {
                const header = document.createElement('div');
                header.className = 'v2-param-header';
                const label = document.createElement('label');
                label.className = 'v2-label';
                label.textContent = p.label;
                header.appendChild(label);
                group.appendChild(header);

                const wrap = document.createElement('div');
                wrap.className = 'v2-param-range-wrap';
                const inp = document.createElement('input');
                inp.type = 'range';
                inp.className = 'v2-param-range';
                inp.min = p.min;
                inp.max = p.max;
                inp.step = p.step;
                inp.value = p.default;
                inp.dataset.paramKey = p.key;
                const rangeVal = document.createElement('span');
                rangeVal.className = 'v2-param-range-val';
                rangeVal.textContent = String(p.default);
                inp.addEventListener('input', () => {
                    rangeVal.textContent = inp.value;
                    v2UpdateCost();
                });
                wrap.appendChild(inp);
                wrap.appendChild(rangeVal);
                group.appendChild(wrap);

            } else if (p.type === 'bool') {
                const toggle = document.createElement('div');
                toggle.className = 'v2-param-toggle' + (p.default ? ' active' : '');
                toggle.dataset.paramKey = p.key;
                toggle.dataset.value = p.default ? 'true' : 'false';

                const header = document.createElement('div');
                header.className = 'v2-param-header';
                const label = document.createElement('label');
                label.className = 'v2-label';
                label.textContent = p.label;
                header.appendChild(label);
                group.appendChild(header);

                const track = document.createElement('div');
                track.className = 'v2-param-toggle-track';
                const lbl = document.createElement('span');
                lbl.className = 'v2-param-toggle-label';
                lbl.textContent = p.default ? 'Ativado' : 'Desativado';
                toggle.appendChild(track);
                toggle.appendChild(lbl);
                toggle.addEventListener('click', () => {
                    const isActive = toggle.classList.toggle('active');
                    toggle.dataset.value = isActive ? 'true' : 'false';
                    lbl.textContent = isActive ? 'Ativado' : 'Desativado';

                    if (isSunoGenerate && p.key === 'custom_mode') {
                        SUNO_CUSTOM_MODE_KEYS.forEach(k => {
                            const g = container.querySelector(`[data-param-group-key="${k}"]`);
                            if (g) g.classList.toggle('hidden', !isActive);
                        });
                        if (v2.prompt) {
                            v2.prompt.placeholder = isActive
                                ? 'Cole a letra da música aqui...'
                                : 'Descreva o estilo de música que deseja gerar...';
                        }
                    }

                    // Kling multi_shots toggle
                    if (modelKey === 'kling-3.0/video' && p.key === 'multi_shots') {
                        const promptGroup = v2.prompt?.closest('.v2-form-group');
                        const msGroup = document.getElementById('v2-group-multishot');
                        if (promptGroup) promptGroup.style.display = isActive ? 'none' : '';
                        if (msGroup) msGroup.classList.toggle('hidden', !isActive);
                        if (isActive) {
                            // Also hide the duration select since each shot has its own
                            const durGroup = container.querySelector('[data-param-group-key="duration"]');
                            if (durGroup) durGroup.classList.add('hidden');
                            // Initialize with 2 shots if empty
                            const msList = document.getElementById('v2-multishot-list');
                            if (msList && msList.children.length === 0) {
                                _addMultiShot(msList);
                                _addMultiShot(msList);
                            }
                        } else {
                            const durGroup = container.querySelector('[data-param-group-key="duration"]');
                            if (durGroup) durGroup.classList.remove('hidden');
                        }
                    }

                    v2UpdateCost();
                });
                group.appendChild(toggle);

            } else if (p.type === 'text') {
                const label = document.createElement('label');
                label.className = 'v2-label';
                label.textContent = p.label;
                group.appendChild(label);

                const inp = document.createElement('input');
                inp.type = 'text';
                inp.className = 'v2-param-text';
                inp.value = p.default || '';
                inp.placeholder = p.label;
                inp.dataset.paramKey = p.key;
                inp.addEventListener('input', () => v2UpdateCost());
                inp.addEventListener('change', () => v2UpdateCost());
                group.appendChild(inp);

            } else if (p.type === 'number_input') {
                const header = document.createElement('div');
                header.className = 'v2-param-header';
                const label = document.createElement('label');
                label.className = 'v2-label';
                label.textContent = p.label;
                header.appendChild(label);
                group.appendChild(header);

                const inp = document.createElement('input');
                inp.type = 'number';
                inp.className = 'v2-param-text';
                inp.value = p.default || '0';
                inp.placeholder = p.label;
                inp.dataset.paramKey = p.key;
                inp.addEventListener('input', () => v2UpdateCost());
                group.appendChild(inp);
            }

            container.appendChild(group);
        });
    }

    function v2CollectModelParams() {
        const params = {};
        const modelKey = v2Model?.model;
        const cfg = MODEL_CONFIGS[modelKey];
        if (!cfg || !v2.dynamicParams) return params;

        cfg.params.forEach(p => {
            const group = v2.dynamicParams.querySelector(`[data-param-group-key="${p.key}"]`);
            if (!group) return;

            if (p.type === 'radio') {
                const active = group.querySelector('.v2-param-pill.active');
                if (active) {
                    let val = active.dataset.value;
                    // Auto-convert numbers if possible
                    if (!isNaN(val) && val.trim() !== '') {
                        val = parseFloat(val);
                    }
                    params[p.key] = val;
                }
            } else if (p.type === 'select') {
                const sel = group.querySelector('.v2-param-select');
                if (sel) params[p.key] = sel.value;
            } else if (p.type === 'number') {
                const inp = group.querySelector('.v2-param-range');
                if (inp) params[p.key] = parseFloat(inp.value);
            } else if (p.type === 'bool') {
                const toggle = group.querySelector('.v2-param-toggle');
                if (toggle) params[p.key] = toggle.dataset.value === 'true';
            } else if (p.type === 'text') {
                const inp = group.querySelector('.v2-param-text');
                if (inp && inp.value.trim()) params[p.key] = inp.value.trim();
            } else if (p.type === 'number_input') {
                const inp = group.querySelector('input[type="number"]');
                if (inp && inp.value.trim() !== '') {
                    params[p.key] = parseInt(inp.value, 10);
                }
            }
        });

        // Collect dialogue for ElevenLabs Dialogue V3
        if (modelKey === 'elevenlabs/text-to-dialogue-v3') {
            const diagList = document.getElementById('v2-dialogue-list');
            if (diagList) {
                const dialogue = [];
                diagList.querySelectorAll('.v2-dialogue-card').forEach(card => {
                    const text = card.querySelector('textarea').value.trim();
                    const voice = card.dataset.voice;
                    if (text) dialogue.push({ text, voice });
                });
                params.dialogue = dialogue;
            }
        }

        // Collect negative_prompt from dedicated form field
        const negPromptEl = document.getElementById('v2-negative-prompt');
        if (negPromptEl && negPromptEl.value.trim()) {
            params.negative_prompt = negPromptEl.value.trim();
        }

        // Collect multi_prompt for Kling multi-shots
        if (params.multi_shots === true) {
            const msList = document.getElementById('v2-multishot-list');
            if (msList) {
                const multiPrompt = [];
                msList.querySelectorAll('.v2-multishot-card').forEach(card => {
                    const textarea = card.querySelector('textarea');
                    const durSlider = card.querySelector('input[type="range"]');
                    if (textarea) {
                        multiPrompt.push({
                            prompt: textarea.value.trim(),
                            duration: durSlider ? parseInt(durSlider.value) : 5
                        });
                    }
                });
                params.multi_prompt = multiPrompt;
                delete params.duration; // duration is per-shot in multi-shot mode
            }
        }

        return params;
    }

    // ── Multi-Shot helpers (Kling 3.0) ──
    function _addMultiShot(container) {
        const idx = container.children.length + 1;
        const card = document.createElement('div');
        card.className = 'v2-multishot-card';
        card.style.cssText = 'background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px;';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 600; font-size: 13px; color: var(--text-primary);">Shot ${idx}</span>
                <button type="button" class="v2-multishot-remove" style="background: none; border: none; color: var(--accent-red, #e74c3c); cursor: pointer; font-size: 16px; padding: 2px 6px;" title="Remover">🗑️</button>
            </div>
            <textarea class="v2-textarea" placeholder="Prompt do shot ${idx} (máx 2500 chars)" rows="3" maxlength="2500" style="min-height: 70px; margin-bottom: 8px; font-size: 13px;"></textarea>
            <div style="display: flex; align-items: center; gap: 10px;">
                <label style="font-size: 12px; color: var(--text-muted); white-space: nowrap;">Duração</label>
                <input type="range" min="1" max="12" step="1" value="5" style="flex: 1; accent-color: var(--accent-red, #c0392b);">
                <span class="v2-ms-dur-val" style="font-size: 13px; color: var(--text-primary); min-width: 24px; text-align: center;">5s</span>
            </div>
        `;

        // Duration slider update
        const slider = card.querySelector('input[type="range"]');
        const durVal = card.querySelector('.v2-ms-dur-val');
        slider.addEventListener('input', () => {
            durVal.textContent = slider.value + 's';
            _updateMultiShotTotal();
        });

        // Remove button
        card.querySelector('.v2-multishot-remove').addEventListener('click', () => {
            card.remove();
            _renumberMultiShots();
            _updateMultiShotTotal();
        });

        container.appendChild(card);
        _updateMultiShotTotal();
    }

    function _renumberMultiShots() {
        const cards = document.querySelectorAll('#v2-multishot-list .v2-multishot-card');
        cards.forEach((card, i) => {
            const title = card.querySelector('span');
            if (title) title.textContent = `Shot ${i + 1}`;
        });
    }

    function _updateMultiShotTotal() {
        const cards = document.querySelectorAll('#v2-multishot-list .v2-multishot-card');
        let total = 0;
        cards.forEach(card => {
            const slider = card.querySelector('input[type="range"]');
            if (slider) total += parseInt(slider.value);
        });
        const remaining = Math.max(0, 15 - total);
        const el = document.getElementById('v2-multishot-total');
        if (el) {
            el.textContent = `Total: ${total}s / 15s (Restante: ${remaining}s)`;
            el.style.color = total > 15 ? 'var(--accent-red, #e74c3c)' : '';
        }

        v2UpdateCost();
    }

    // + Add Shot button
    const addShotBtn = document.getElementById('v2-multishot-add');
    if (addShotBtn) {
        addShotBtn.addEventListener('click', () => {
            const msList = document.getElementById('v2-multishot-list');
            if (msList) _addMultiShot(msList);
        });
    }

    // ── Dialogue helpers (ElevenLabs V3) ──
    function _addDialogueLine(container) {
        const idx = container.children.length + 1;
        const card = document.createElement('div');
        card.className = 'v2-dialogue-card';
        card.dataset.voice = 'Adam'; // Default voice

        card.innerHTML = `
            <div class="v2-dialogue-header">
                <span class="v2-dialogue-label">Fala ${idx}</span>
                <button type="button" class="v2-dialogue-remove" title="Remover">🗑️</button>
            </div>
            <div class="v2-voice-selector">
                <div class="v2-voice-icon">A</div>
                <span class="v2-voice-name">Adam</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
            <textarea class="v2-textarea" placeholder="O que este personagem vai falar..." rows="2" style="min-height: 50px; font-size: 13px;"></textarea>
        `;

        // Voice selector click
        card.querySelector('.v2-voice-selector').addEventListener('click', () => {
            _openVoicePicker(card);
        });

        // Remove button
        card.querySelector('.v2-dialogue-remove').addEventListener('click', () => {
            card.remove();
            _renumberDialogueLines();
            _updateDialogueCounter();
            updateV2GenerateState();
        });

        card.querySelector('textarea').addEventListener('input', () => {
            _updateDialogueCounter();
            updateV2GenerateState();
        });

        container.appendChild(card);
        _renumberDialogueLines();
        _updateDialogueCounter();
    }

    function _updateDialogueCounter() {
        const totalHint = document.getElementById('v2-dialogue-total');
        if (!totalHint) return;
        const textareas = document.querySelectorAll('#v2-dialogue-list textarea');
        let totalChars = 0;
        textareas.forEach(tx => totalChars += tx.value.length);
        totalHint.textContent = `${totalChars} / 5000 chars`;
        totalHint.style.color = totalChars > 5000 ? '#ef4444' : '';
    }

    function _renumberDialogueLines() {
        const cards = document.querySelectorAll('#v2-dialogue-list .v2-dialogue-card');
        cards.forEach((card, i) => {
            const title = card.querySelector('.v2-dialogue-label');
            if (title) title.textContent = `Fala ${i + 1}`;
        });
    }

    function _openVoicePicker(targetCard) {
        const modal = document.getElementById('modal-voice-picker');
        const grid = document.getElementById('voice-picker-grid');
        if (!modal || !grid) return;

        const currentVoice = targetCard.dataset.voice;
        grid.innerHTML = '';

        const voices = [
            { id: 'Adam', name: 'Adam', desc: 'Narrador Profundo' },
            { id: 'Rachel', name: 'Rachel', desc: 'Conversacional Suave' },
            { id: 'Aria', name: 'Aria', desc: 'Expressiva & Doce' },
            { id: 'Brian', name: 'Brian', desc: 'Profundo & Calmo' },
            { id: 'Sarah', name: 'Sarah', desc: 'Suave & Clara' },
            { id: 'Laura', name: 'Laura', desc: 'Energética & Animada' },
            { id: 'Charlie', name: 'Charlie', desc: 'Amigável & Casual' },
            { id: 'George', name: 'George', desc: 'Ressonante & Firme' },
            { id: 'Callum', name: 'Callum', desc: 'Interessante & Rouco' },
            { id: 'River', name: 'River', desc: 'Jovem & Fresco' },
            { id: 'Liam', name: 'Liam', desc: 'Articulado' },
            { id: 'Charlotte', name: 'Charlotte', desc: 'Personagem Jovem' },
            { id: 'Alice', name: 'Alice', desc: 'Natural & Calma' },
            { id: 'Matilda', name: 'Matilda', desc: 'Expressiva' },
            { id: 'Will', name: 'Will', desc: 'Confiável' },
            { id: 'Jessica', name: 'Jessica', desc: 'Brincalhona' },
            { id: 'Eric', name: 'Eric', desc: 'Maduro' },
            { id: 'Chris', name: 'Chris', desc: 'Amigável' },
            { id: 'Daniel', name: 'Daniel', desc: 'Autoritário' },
            { id: 'Lily', name: 'Lily', desc: 'Doce' },
            { id: 'Bill', name: 'Bill', desc: 'Sério' },
            { id: 'Harry', name: 'Harry', desc: 'Guerreiro' },
            { id: 'Roger', name: 'Roger', desc: 'Pai Amigável' }
        ];

        voices.forEach(v => {
            const card = document.createElement('div');
            card.className = 'voice-card' + (v.id === currentVoice ? ' active' : '');
            card.innerHTML = `
                <div class="voice-card-icon">${v.name.charAt(0)}</div>
                <div class="voice-card-info">
                    <span class="voice-card-name">${v.name}</span>
                    <span class="voice-card-desc">${v.desc}</span>
                </div>
            `;
            card.addEventListener('click', () => {
                targetCard.dataset.voice = v.id;
                targetCard.querySelector('.v2-voice-name').textContent = v.name;
                targetCard.querySelector('.v2-voice-icon').textContent = v.name.charAt(0);
                modal.classList.add('hidden');
                updateV2GenerateState();
            });
            grid.appendChild(card);
        });

        modal.classList.remove('hidden');
    }

    // Dialogue Add button
    const addDiagBtn = document.getElementById('v2-dialogue-add');
    if (addDiagBtn) {
        addDiagBtn.addEventListener('click', () => {
            const diagList = document.getElementById('v2-dialogue-list');
            if (diagList) _addDialogueLine(diagList);
        });
    }

    // Modal close events
    const vpClose = document.getElementById('voice-picker-close');
    const vpBackdrop = document.getElementById('voice-picker-backdrop');
    if (vpClose) vpClose.addEventListener('click', () => document.getElementById('modal-voice-picker').classList.add('hidden'));
    if (vpBackdrop) vpBackdrop.addEventListener('click', () => document.getElementById('modal-voice-picker').classList.add('hidden'));

    function v2UpdateCost() {
        const model = v2Model?.model;
        if (!model) {
            if (v2.creditsAmount) v2.creditsAmount.textContent = '—';
            return;
        }

        const params = v2CollectModelParams();
        let cost = null;

        // ── Veo 3.1 (quality-dependent) ──
        if (model.startsWith('veo3/')) {
            const quality = (params.quality || 'Fast').toLowerCase();
            const base = model.replace('-video', `-video-${quality}`);
            cost = getModelCost(base) || getModelCost(model);

        // ── Kling 3.0 (resolution + audio + duration) ──
        } else if (model === 'kling-3.0/video') {
            const hasSound = params.sound !== false;
            // KIE rates per second: 1080P+audio=27, 1080P-audio=18, 720P+audio=20, 720P-audio=14
            const rate = hasSound ? 27 : 18; // default 1080P rates (pro mode)
            let dur = params.duration || 5;
            if (params.multi_shots && params.multi_prompt) {
                dur = params.multi_prompt.reduce((sum, s) => sum + (s.duration || 5), 0);
            }
            cost = rate * dur;

        // ── Sora 2 Pro (quality + duration) ──
        } else if (model === 'sora-2-pro-text-to-video' || model === 'sora-2-pro-image-to-video') {
            const quality = (params.size || 'standard').toLowerCase();
            const dur = parseInt(params.n_frames) || 10;
            // KIE: Pro Standard 10s=150, 15s=270; Pro High 10s=330, 15s=630
            if (quality === 'high') {
                cost = dur >= 15 ? 630 : 330;
            } else {
                cost = dur >= 15 ? 270 : 150;
            }

        // ── Wan 2.7 (resolution-dependent) ──
        } else if (model.startsWith('wan/')) {
            const res = params.resolution || '720p';
            // Wan 2.7: 720p=70, 1080p=104.5
            cost = res === '1080p' ? 104.5 : 70;

        // ── Grok video (resolution + duration) ──
        } else if (model.startsWith('grok-imagine/') && model.includes('video')) {
            const res = params.resolution || '480p';
            const dur = parseInt(params.duration) || 6;
            // 480p 6s=10, 10s=20; 720p 6s=20, 10s=30
            if (res === '720p') {
                cost = dur <= 6 ? 20 : 30;
            } else {
                cost = dur <= 6 ? 10 : 20;
            }

        // ── Nano Banana 2 (resolution-dependent) ──
        } else if (model === 'nano-banana-2') {
            const res = params.resolution || '1K';
            cost = res === '4K' ? 18 : res === '2K' ? 12 : 8;

        // ── Topaz Image Upscale (factor-dependent) ──
        } else if (model === 'topaz/image-upscale') {
            const factor = parseInt(params.upscale_factor) || 2;
            // KIE: 2x(2K)=10, 4x(4K)=20, 8x(8K)=40
            cost = factor >= 8 ? 40 : factor >= 4 ? 20 : 10;

        // ── Flux-2 Pro (resolution-dependent) ──
        } else if (model === 'flux-2/pro-text-to-image') {
            const res = params.resolution || '1K';
            cost = res === '2K' ? 7 : 5;

        // ── ElevenLabs Sound Effect V2 (duration-dependent) ──
        } else if (model === 'elevenlabs/sound-effect-v2') {
            const dur = parseFloat(params.duration_seconds) || 5;
            cost = Math.round(0.24 * dur * 100) / 100; // 0.24 cr/s

        // ── Hailuo 2.3 Pro (resolution + duration) ──
        } else if (model === 'hailuo/2-3-image-to-video-pro') {
            const res = (params.resolution || '768P').toUpperCase();
            const dur = parseInt(params.duration) || 6;
            // KIE Pro: 6s-768p=45, 6s-1080p=80, 10s-768p=90; Standard: 6s-768p=30, 6s-1080p=50, 10s-768p=50
            if (res === '1080P') {
                cost = dur >= 10 ? 80 : 80; // Pro 1080p
            } else if (res === '768P') {
                cost = dur >= 10 ? 90 : 45; // Pro 768p
            } else {
                cost = 30; // 480p standard
            }

        // ── Seedance 2.0 (resolution + duration + video input + speed toggle) ──
        } else if (model.includes('seedance-2')) {
            const res = params.resolution || '720p';
            const dur = params.duration || 15;
            const hasVideo = v2VideoFiles.length > 0;
            const isFast = params.seedance_speed === 'Fast';

            if (res === '480p') {
                const rate = isFast 
                    ? (hasVideo ? 8 : 15.5) 
                    : (hasVideo ? 11.5 : 19);
                const totalInputDur = v2VideoDurations.reduce((a, b) => a + b, 0);
                cost = hasVideo ? (totalInputDur + dur) * rate : dur * rate;
            } else {
                // 720p
                const rate = isFast 
                    ? (hasVideo ? 20 : 33) 
                    : (hasVideo ? 25 : 41);
                const totalInputDur = v2VideoDurations.reduce((a, b) => a + b, 0);
                cost = hasVideo ? (totalInputDur + dur) * rate : dur * rate;
            }

        // ── Suno (mode-dependent) ──
        } else if (model === 'suno/generate-music') {
            const mode = params.suno_mode || 'Música';
            cost = mode === 'Letra' ? 0.4 : 12;
        } else if (model === 'suno/edit-audio') {
            cost = 12;  // all edit actions (extend/instrumental/vocals/separate) cost ~12
        } else if (model === 'suno/utilities') {
            cost = 2;   // utility actions (music-video/wav/lyrics/persona/cover/midi) cost ~2

        // ── Google Imagen 4 (no dynamic param but note tiers) ──
        // ── Default: flat cost from MODEL_COST_ESTIMATES ──
        } else {
            cost = getModelCost(model);
        }

        if (v2.creditsAmount) {
            v2.creditsAmount.textContent = cost ? `~${cost} créditos` : '—';
        }
    }

    window._v2HideWorkspace = function () {
        ws.classList.add('hidden');
        // Note: does not reveal app-main — exitWorkspace() handles lobby transition
    };

    // ── Back button ──
    v2.btnBack.addEventListener('click', () => {
        if (typeof exitWorkspace === 'function') exitWorkspace();
    });

    // ── Prompt ──
    v2.prompt.addEventListener('input', () => {
        const len = v2.prompt.value.length;
        v2.charCounter.textContent = `${len.toLocaleString('pt-BR')} / 2.000`;
        updateV2GenerateState();
    });

    // ── Upload Zone (multi-image, up to 8) ──
    v2.uploadZone.addEventListener('click', () => {
        if (v2Files.length >= v2MaxFiles) return;
        v2.fileInput.click();
    });
    v2.uploadZone.addEventListener('dragover', e => { e.preventDefault(); v2.uploadZone.classList.add('dragover'); });
    v2.uploadZone.addEventListener('dragleave', () => v2.uploadZone.classList.remove('dragover'));
    v2.uploadZone.addEventListener('drop', e => {
        e.preventDefault();
        v2.uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) v2AddFiles(Array.from(e.dataTransfer.files));
    });
    v2.fileInput.addEventListener('change', () => {
        const selectedFiles = Array.from(v2.fileInput.files);
        v2.fileInput.value = ''; // reset early so same files can be re-added
        if (selectedFiles.length) v2AddFiles(selectedFiles);
    });

    // ── Frames Upload Zone (Initial / Final) ──
    function handleFrameUpload(zone, input, type) {
        zone.addEventListener('click', () => {
            if (type === 'initial' && v2FrameInitial) return;
            if (type === 'final' && v2FrameFinal) return;
            input.click();
        });
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('dragover');
            if (e.dataTransfer.files.length) v2AddFrameFile(Array.from(e.dataTransfer.files), type);
        });
        input.addEventListener('change', () => {
            const selectedFiles = Array.from(input.files);
            input.value = '';
            if (selectedFiles.length) v2AddFrameFile(selectedFiles, type);
        });
    }

    if (v2.frameInitialZone && v2.frameInitialInput) {
        handleFrameUpload(v2.frameInitialZone, v2.frameInitialInput, 'initial');
    }
    if (v2.frameFinalZone && v2.frameFinalInput) {
        handleFrameUpload(v2.frameFinalZone, v2.frameFinalInput, 'final');
    }

    function v2AddFrameFile(newFiles, type) {
        const images = newFiles.filter(f => f.type.startsWith('image/'));
        if (!images.length) return;
        if (type === 'initial') {
            v2FrameInitial = images[0];
            console.log('[KLING-DEBUG] v2AddFrameFile INITIAL set:', images[0].name, images[0].size, 'bytes, type:', images[0].type);
        } else {
            v2FrameFinal = images[0];
            console.log('[KLING-DEBUG] v2AddFrameFile FINAL set:', images[0].name, images[0].size, 'bytes, type:', images[0].type);
        }
        v2RenderFrameGrid(type);
        updateV2GenerateState();
    }

    function v2RenderFrameGrid(type) {
        const grid = type === 'initial' ? v2.frameInitialGrid : v2.frameFinalGrid;
        const file = type === 'initial' ? v2FrameInitial : v2FrameFinal;
        const zone = type === 'initial' ? v2.frameInitialZone : v2.frameFinalZone;
        const dropzone = zone.closest('.v2-frame-dropzone');

        grid.innerHTML = '';
        if (!file) {
            zone.classList.remove('v2-upload-full', 'v2-frame-has-file');
            // Empty zone still accepts drops (move frame here)
            if (dropzone) dropzone.classList.remove('v2-frame-dragging');
            return;
        }

        zone.classList.add('v2-upload-full', 'v2-frame-has-file');

        const card = document.createElement('div');
        card.className = 'v2-file-card v2-frame-card';
        card.style.width = '100%';

        // ── Drag: make the card draggable ──
        card.draggable = true;
        card.dataset.frameType = type;
        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', type);
            e.dataTransfer.effectAllowed = 'move';
            card.classList.add('v2-frame-drag-source');
            // Mark both dropzones as potential targets
            document.querySelectorAll('.v2-frame-dropzone').forEach(dz => {
                dz.classList.add('v2-frame-drop-target');
            });
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('v2-frame-drag-source');
            document.querySelectorAll('.v2-frame-dropzone').forEach(dz => {
                dz.classList.remove('v2-frame-drop-target', 'v2-frame-drop-hover');
            });
        });

        const img = document.createElement('img');
        const objUrl = URL.createObjectURL(file);
        img.src = objUrl;
        img.alt = file.name;
        img.draggable = false; // prevent native image drag

        const removeBtn = document.createElement('button');
        removeBtn.className = 'v2-file-card-remove';
        removeBtn.title = 'Remover';
        removeBtn.innerHTML = '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        removeBtn.addEventListener('click', e => {
            e.stopPropagation();
            URL.revokeObjectURL(objUrl);
            if (type === 'initial') v2FrameInitial = null;
            else v2FrameFinal = null;
            v2RenderFrameGrid(type);
            updateV2GenerateState();
        });

        card.appendChild(img);
        card.appendChild(removeBtn);
        grid.appendChild(card);
    }

    // ── Drag-and-drop swap between Initial ↔ Final frame slots ──
    function _setupFrameSwapDropzone(dropzone, targetType) {
        // These events cover both the empty upload zone AND the filled grid
        dropzone.addEventListener('dragover', e => {
            const sourceType = e.dataTransfer.types.includes('text/plain') ? true : false;
            if (!sourceType) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            dropzone.classList.add('v2-frame-drop-hover');
        });
        dropzone.addEventListener('dragleave', e => {
            // Only remove hover if actually leaving the dropzone (not entering a child)
            if (!dropzone.contains(e.relatedTarget)) {
                dropzone.classList.remove('v2-frame-drop-hover');
            }
        });
        dropzone.addEventListener('drop', e => {
            e.preventDefault();
            dropzone.classList.remove('v2-frame-drop-hover');
            document.querySelectorAll('.v2-frame-dropzone').forEach(dz => {
                dz.classList.remove('v2-frame-drop-target', 'v2-frame-drop-hover');
            });

            const sourceType = e.dataTransfer.getData('text/plain');
            if (!sourceType || sourceType === targetType) return; // dropped on itself

            // Swap the file references
            const tempInitial = v2FrameInitial;
            const tempFinal = v2FrameFinal;
            v2FrameInitial = tempFinal;
            v2FrameFinal = tempInitial;

            // Re-render both grids
            v2RenderFrameGrid('initial');
            v2RenderFrameGrid('final');
            updateV2GenerateState();
        });
    }

    // Attach swap drop targets to both frame dropzone wrappers
    const _frameInitialDropzone = v2.frameInitialZone?.closest('.v2-frame-dropzone');
    const _frameFinalDropzone = v2.frameFinalZone?.closest('.v2-frame-dropzone');
    if (_frameInitialDropzone) _setupFrameSwapDropzone(_frameInitialDropzone, 'initial');
    if (_frameFinalDropzone) _setupFrameSwapDropzone(_frameFinalDropzone, 'final');

    // Ctrl+V paste image in v2 prompt → add as reference image
    setupPasteImageHandler(
        v2.prompt,
        (file) => {
            const isFramesModel = (v2Model?.model && (v2Model.model.startsWith('veo3/') || v2Model.model.includes('kling-3.0/video')));
            if (isFramesModel) {
                if (!v2FrameInitial) v2AddFrameFile([file], 'initial');
                else if (!v2FrameFinal) v2AddFrameFile([file], 'final');
                else toast('Ambos frames já preenchidos', 'error');
            } else {
                v2AddFiles([file]);
            }
        },
        () => {
            const g1 = document.getElementById('v2-group-upload');
            const g2 = document.getElementById('v2-group-upload-frames');
            return !!((g1 && g1.style.display !== 'none') || (g2 && g2.style.display !== 'none'));
        }
    );

    // Helper: Get max file sizes for Seedance 2.0 based on speed toggle
    function _getSeedanceMaxSizes() {
        const SEEDANCE_SPEED_SELECTOR = '[data-param-group-key="seedance_speed"] .v2-param-pill.active';
        const SEEDANCE_SPEED_FAST_VALUE = 'Fast';

        const isSeedance = v2Model?.model?.startsWith('bytedance/seedance-2');
        if (!isSeedance) return { image: MAX_IMAGE_DEFAULT_SIZE_BYTES, video: MAX_VIDEO_REF_SIZE_BYTES };
        
        // Check speed toggle — seedance-2-fast is resolved at submit time
        const isFast = document.querySelector(SEEDANCE_SPEED_SELECTOR)?.dataset?.value === SEEDANCE_SPEED_FAST_VALUE;
        return {
            image: isFast ? MAX_IMAGE_REF_SIZE_FAST_BYTES : MAX_IMAGE_DEFAULT_SIZE_BYTES,
            video: isFast ? MAX_VIDEO_REF_SIZE_FAST_BYTES : MAX_VIDEO_REF_SIZE_BYTES
        };
    }

    function v2AddFiles(newFiles) {
        const isVideoUpscale = v2Model?.model === TOPAZ_VIDEO_UPSCALE_MODEL;
        const { image: maxImageSize } = _getSeedanceMaxSizes();
        const accepted = newFiles.filter(f => {
            if (isVideoUpscale) {
                return f.type.startsWith('video/') || f.name.match(/\.(mp4|mov|mkv|avi|webm)$/i);
            }
            if (!f.type.startsWith('image/')) return false;
            if (f.size > maxImageSize) {
                toast(`Arquivo muito grande (máx. ${maxImageSize / (1024 * 1024)}MB)`, 'error');
                return false;
            }
            return true;
        });
        if (!accepted.length) {
            if (isVideoUpscale) toast('Formato inválido. Use MP4, MOV, MKV, etc. (máx. 50MB)', 'error');
            return;
        }

        const remaining = v2MaxFiles - v2Files.length;
        if (remaining <= 0) {
            toast('Limite de arquivos atingido', 'error');
            return;
        }
        const toAdd = accepted.slice(0, remaining);
        if (accepted.length > remaining) {
            toast(`Apenas ${remaining} arquivo(s) adicionado(s) — limite: ${v2MaxFiles}`, 'error');
        }
        v2Files.push(...toAdd);
        v2RenderFilesGrid();
        updateV2GenerateState();
    }

    // Register handler for reuse from lightbox (outside this closure)
    v2Registry.addFilesFromReuse = function (files) {
        v2ClearAllFiles();
        const isFramesModel = (v2Model?.model && (v2Model.model.startsWith('veo3/') || v2Model.model.includes('kling-3.0/video')));
        if (isFramesModel) {
            if (files[0]) v2AddFrameFile([files[0]], 'initial');
            if (files[1]) v2AddFrameFile([files[1]], 'final');
        } else {
            v2AddFiles(files);
        }
    };

    function v2RemoveFile(index) {
        v2Files.splice(index, 1);
        v2RenderFilesGrid();
        updateV2GenerateState();
    }

    function v2RenderFilesGrid() {
        if (!v2.filesGrid) return;
        v2.filesGrid.innerHTML = '';
        // Update counter
        if (v2.fileCounter) {
            if (v2MaxFiles <= 1) {
                v2.fileCounter.style.display = 'none';
            } else {
                v2.fileCounter.style.display = '';
                v2.fileCounter.textContent = `${v2Files.length} / ${v2MaxFiles}`;
                v2.fileCounter.classList.toggle('has-files', v2Files.length > 0);
                v2.fileCounter.classList.toggle('full', v2Files.length >= v2MaxFiles);
            }
        }
        if (v2Files.length === 0) {
            v2.uploadZone.classList.remove('v2-upload-full');
            return;
        }

        v2.uploadZone.classList.add('v2-upload-full');

        v2Files.forEach((file, index) => {
            const card = document.createElement('div');
            card.className = 'v2-file-card';

            const objUrl = URL.createObjectURL(file);
            let mediaEl;
            if (file.type.startsWith('video/')) {
                mediaEl = document.createElement('video');
                mediaEl.src = objUrl;
                mediaEl.muted = true;
                mediaEl.preload = 'metadata';
            } else {
                mediaEl = document.createElement('img');
                mediaEl.src = objUrl;
                mediaEl.alt = file.name;
            }

            const removeBtn = document.createElement('button');
            removeBtn.className = 'v2-file-card-remove';
            removeBtn.title = 'Remover';
            removeBtn.innerHTML = '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            removeBtn.addEventListener('click', e => {
                e.stopPropagation();
                URL.revokeObjectURL(objUrl);
                v2RemoveFile(index);
            });

            card.appendChild(mediaEl);
            card.appendChild(removeBtn);
            v2.filesGrid.appendChild(card);
        });
    }

    function v2ClearAllFiles() {
        v2Files = [];
        v2FrameInitial = null;
        v2FrameFinal = null;
        v2VideoFiles = [];
        v2VideoDurations = [];
        v2.fileInput.value = '';
        if (v2.frameInitialInput) v2.frameInitialInput.value = '';
        if (v2.frameFinalInput) v2.frameFinalInput.value = '';
        if (v2.videoFileInput) v2.videoFileInput.value = '';
        v2RenderFilesGrid();
        v2RenderFrameGrid('initial');
        v2RenderFrameGrid('final');
        v2RenderVideoFilesGrid();
        updateV2GenerateState();
    }

    // ── Video Reference Upload (Seedance 2.0) ──
    async function v2AddVideoFiles(newFiles) {
        const { video: maxVideoSize } = _getSeedanceMaxSizes();
        const accepted = newFiles.filter(f =>
            f.type.startsWith('video/') || f.name.match(/\.(mp4|mov|mkv|webm)$/i)
        );
        if (!accepted.length) {
            toast('Formato inválido. Use MP4, MOV ou MKV', 'error');
            return;
        }
        // Size check based on model
        const oversized = accepted.filter(f => f.size > maxVideoSize);
        if (oversized.length) {
            toast(`Vídeo excede ${maxVideoSize / (1024 * 1024)}MB. Reduza o tamanho.`, 'error');
            return;
        }
        const remaining = v2MaxVideoFiles - v2VideoFiles.length;
        if (remaining <= 0) {
            toast(`Máximo de ${v2MaxVideoFiles} vídeos atingido`, 'error');
            return;
        }
        const toAdd = accepted.slice(0, remaining);
        v2VideoFiles.push(...toAdd);

        // Measure and store durations (needed for accurate pricing)
        const durPromises = toAdd.map(f => _v2GetVideoDuration(f));
        const durations = await Promise.all(durPromises);
        v2VideoDurations.push(...durations);

        v2RenderVideoFilesGrid();
        updateV2GenerateState();
    }

    function _v2GetVideoDuration(file) {
        return new Promise(resolve => {
            const vid = document.createElement('video');
            vid.preload = 'metadata';
            vid.onloadedmetadata = () => {
                window.URL.revokeObjectURL(vid.src);
                resolve(vid.duration || 0);
            };
            vid.onerror = () => {
                window.URL.revokeObjectURL(vid.src);
                resolve(0);
            };
            vid.src = window.URL.createObjectURL(file);
        });
    }

    function v2RenderVideoFilesGrid() {
        if (!v2.videoFilesGrid) return;
        v2.videoFilesGrid.innerHTML = '';
        if (v2.videoCounter) {
            v2.videoCounter.textContent = `${v2VideoFiles.length} / ${v2MaxVideoFiles}`;
            v2.videoCounter.classList.toggle('has-files', v2VideoFiles.length > 0);
            v2.videoCounter.classList.toggle('full', v2VideoFiles.length >= v2MaxVideoFiles);
        }
        if (v2VideoFiles.length === 0) {
            if (v2.uploadVideoZone) v2.uploadVideoZone.classList.remove('v2-upload-full');
            return;
        }
        if (v2.uploadVideoZone) v2.uploadVideoZone.classList.add('v2-upload-full');

        v2VideoFiles.forEach((file, index) => {
            const card = document.createElement('div');
            card.className = 'v2-file-card';
            const objUrl = URL.createObjectURL(file);
            const vidEl = document.createElement('video');
            vidEl.src = objUrl;
            vidEl.muted = true;
            vidEl.preload = 'metadata';

            const nameEl = document.createElement('span');
            nameEl.className = 'v2-file-card-name';
            nameEl.textContent = file.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'v2-file-card-remove';
            removeBtn.title = 'Remover';
            removeBtn.innerHTML = '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            removeBtn.addEventListener('click', e => {
                e.stopPropagation();
                v2VideoFiles.splice(index, 1);
                v2VideoDurations.splice(index, 1);
                URL.revokeObjectURL(objUrl);
                v2RenderVideoFilesGrid();
                updateV2GenerateState();
            });

            card.appendChild(vidEl);
            card.appendChild(nameEl);
            card.appendChild(removeBtn);
            v2.videoFilesGrid.appendChild(card);
        });
    }

    // Wire video upload zone click/drag
    if (v2.uploadVideoZone) {
        v2.uploadVideoZone.addEventListener('click', () => v2.videoFileInput?.click());
        v2.uploadVideoZone.addEventListener('dragover', e => { e.preventDefault(); v2.uploadVideoZone.classList.add('dragover'); });
        v2.uploadVideoZone.addEventListener('dragleave', () => v2.uploadVideoZone.classList.remove('dragover'));
        v2.uploadVideoZone.addEventListener('drop', e => {
            e.preventDefault();
            v2.uploadVideoZone.classList.remove('dragover');
            v2AddVideoFiles([...e.dataTransfer.files]);
        });
    }
    if (v2.videoFileInput) {
        v2.videoFileInput.addEventListener('change', () => {
            if (v2.videoFileInput.files.length) {
                v2AddVideoFiles([...v2.videoFileInput.files]);
                v2.videoFileInput.value = '';
            }
        });
    }

    // ── Settings: Reset — re-render dynamic params with defaults ──
    v2.btnReset.addEventListener('click', () => {
        v2Settings = { ...DEFAULT_V2_SETTINGS };
        if (v2Model?.model) v2RenderModelParams(v2Model.model);
        if (v2.creditsAmount) v2.creditsAmount.textContent = '—';
        v2ClearAllFiles();
    });

    // ── Generate button state ──
    function updateV2GenerateState() {
        const hasPrompt = v2.prompt.value.trim().length > 0;
        const hasFiles = v2Files.length > 0;
        const hasFrames = v2FrameInitial !== null || v2FrameFinal !== null;
        const hasVideoFiles = v2VideoFiles.length > 0;

        // Refresh credit estimate whenever generate state changes (file added/removed, etc.)
        v2UpdateCost();

        if (v2Model?.model === 'elevenlabs/text-to-dialogue-v3') {
            const diagList = document.getElementById('v2-dialogue-list');
            let hasAnyDialogue = false;
            if (diagList) {
                diagList.querySelectorAll('textarea').forEach(tx => {
                    if (tx.value.trim()) hasAnyDialogue = true;
                });
            }
            v2.btnGenerate.disabled = !hasAnyDialogue;
        } else {
            v2.btnGenerate.disabled = !(hasPrompt || hasFiles || hasFrames || hasVideoFiles);
        }

        // Update model info label with resolved model (reflects image-to-video when file attached)
        const modelInfoValue = document.querySelector('#v2-workspace .v2-model-info-value');
        if (modelInfoValue && v2Model?.model) {
            let displayModel = v2Model.model;
            const hasAnyFile = hasFiles || hasFrames;
            if (hasAnyFile) {
                displayModel = V2_FILE_MODEL_MAP[displayModel] || displayModel;
                if (displayModel.startsWith('veo3/')) displayModel = resolveVeoModelByInput(displayModel, true);
            } else {
                displayModel = V2_TEXT_MODEL_MAP[displayModel] || displayModel;
                if (displayModel.startsWith('veo3/')) displayModel = resolveVeoModelByInput(displayModel, false);
            }
            modelInfoValue.textContent = displayModel;
        }
    }

    // ── Helper: upload a single file via /api/upload and return URL ──
    async function v2UploadSingleFile(file, index, total) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('uploadPath', file.type.startsWith('video/') ? 'videos' : 'images');
        const resp = await fetch(`${API}/api/upload`, { method: 'POST', body: fd });
        const json = await resp.json();
        if (!resp.ok || !json.success) throw new Error(json.detail || json.msg || `Upload failed (${file.name})`);
        return json.url;
    }

    // ── Submission helpers ──
    async function _handleVeo3Submission(prompt, btnSpan) {
        const extra = {};
        if (prompt) extra.prompt = prompt;
        extra.aspect_ratio = v2Settings.videoAr || '16:9';

        const hasImageInput = v2FrameInitial !== null || v2FrameFinal !== null;
        let resolvedModel = v2Model?.model || 'veo3/text-to-video';
        resolvedModel = resolveVeoModelByInput(resolvedModel, hasImageInput);

        // Resolve quality suffix (Fast → -fast, Quality → -quality)
        if (resolvedModel === 'veo3/text-to-video' || resolvedModel === 'veo3/image-to-video') {
            const quality = (v2CollectModelParams()?.quality || 'Fast').toLowerCase();
            resolvedModel = `${resolvedModel}-${quality}`;
        }

        if (hasImageInput) {
            btnSpan.textContent = 'Uploading frames...';
            let initialUrl = "";
            let finalUrl = "";
            let uploadedUrlForPreview = null;
            if (v2FrameInitial) {
                initialUrl = await v2UploadSingleFile(v2FrameInitial, 0, 1);
                uploadedUrlForPreview = initialUrl;
            }
            if (v2FrameFinal) {
                finalUrl = await v2UploadSingleFile(v2FrameFinal, 0, 1);
                if (!uploadedUrlForPreview) uploadedUrlForPreview = finalUrl;
            }
            const urls = [];
            if (initialUrl) {
                urls.push(encodeURI(initialUrl));
            }
            if (finalUrl) {
                if (!initialUrl) {
                    urls.push(""); // Veo requires empty string if final frame is provided without initial
                }
                urls.push(encodeURI(finalUrl));
            }
            if (urls.length > 0) {
                extra.imageUrls = urls;
                extra.generationType = 'FIRST_AND_LAST_FRAMES_2_VIDEO';
            }

            // Re-store URL for UI thumbnail
            extra._uploaded_url_override = uploadedUrlForPreview;
            btnSpan.textContent = 'Creating task...';
        } else {
            extra.generationType = 'TEXT_2_VIDEO';
        }

        const fd = new FormData();
        fd.append('model', resolvedModel);
        fd.append('input_json', JSON.stringify(extra));
        const resp = await fetch(`${API}/api/veo/create`, { method: 'POST', body: fd });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
        if (json.code && json.code !== 200) throw new Error(json.msg || `Erro da API (code ${json.code})`);

        let tid = json?.data?.taskId || json?.task?.data?.taskId || json?.taskId
            || json?.data?.task_id || json?.task_id;
        if (!tid) throw new Error(json.msg || 'Nenhum taskId retornado');

        addTask(tid, resolvedModel, 'veo', json.uploaded_url || extra._uploaded_url_override || null, extra);
        v2Tasks.push(tid);
        v2ClearAllFiles();
        toast('✅ Veo 3 task created!', 'success');
    }

    async function _handleStandardSubmission(prompt, btnSpan, modelParams) {
        const extra = { ...modelParams };
        
        // KIE API (e.g. Kling, Grok) strictly requires a prompt for text-to-video endpoints
        // even when an image is supplied. Provide a safe default if user left it blank.
        // Skip for file-only models (e.g. Topaz upscale) that don't accept a prompt field.
        const modelNeedsPrompt = v2Model?.prompt === 'true' || selectedModel?.hasPrompt;
        if (!prompt && modelNeedsPrompt && (v2Files.length > 0 || v2FrameInitial || v2FrameFinal || v2VideoFiles.length > 0)) {
            prompt = 'Mantenha os detalhes originais, proporções e faça uma animação suave.';
        }
        if (prompt && modelNeedsPrompt) extra.prompt = prompt;

        let resolvedModel = v2Model?.model || selectedModel?.model || 'nano-banana-2';

        // Suno always needs the prompt (Suno models don't use data-prompt flag)
        if (resolvedModel.startsWith('suno/') && prompt) {
            extra.prompt = prompt;
        }

        // Suno mode toggle: 'Letra' → suno/generate-lyrics
        if (resolvedModel === 'suno/generate-music' && extra.suno_mode === 'Letra') {
            resolvedModel = 'suno/generate-lyrics';
        }
        delete extra.suno_mode;

        // Normalize Suno parameters to camelCase for API compatibility
        if (resolvedModel.startsWith('suno/')) {
            // Convert snake_case to camelCase for Suno API
            const snakeToCamel = {
                'custom_mode': 'customMode',
                'style_weight': 'styleWeight',
                'vocal_gender': 'vocalGender',
                'negative_tags': 'negativeTags',
                'weirdness_constraint': 'weirdnessConstraint',
                'persona_id': 'personaId',
                'persona_model': 'personaModel'
            };
            
            for (const [snake, camel] of Object.entries(snakeToCamel)) {
                if (Object.prototype.hasOwnProperty.call(extra, snake)) {
                    extra[camel] = extra[snake];
                    delete extra[snake];
                }
            }
            
            // Provide defaults for required fields when customMode is enabled
            const customModeEnabled = extra.customMode === true || extra.customMode === 'true';
            if (customModeEnabled) {
                if (typeof extra.style !== 'string' || extra.style.trim() === '') extra.style = 'General';
                if (typeof extra.title !== 'string' || extra.title.trim() === '') extra.title = 'Generated Track';
            }

        }

        // suno/edit-audio → resolve suno_action to actual Suno API model
        if (resolvedModel === 'suno/edit-audio') {
            const SUNO_EDIT_MAP = {
                'Extend Music': 'suno/extend-music',
                'Add Instrumental': 'suno/add-instrumental',
                'Add Vocals': 'suno/add-vocals',
                'Separate Vocals': 'suno/separate-vocals',
            };
            resolvedModel = SUNO_EDIT_MAP[extra.suno_action] || 'suno/extend-music';
            delete extra.suno_action;
        }

        // suno/utilities → resolve suno_action to actual Suno API model
        if (resolvedModel === 'suno/utilities') {
            const SUNO_UTIL_MAP = {
                'Music Video': 'suno/music-video',
                'Convert WAV': 'suno/convert-wav',
                'Get Lyrics': 'suno/get-lyrics',
                'Generate Persona': 'suno/generate-persona',
                'Cover Image': 'suno/cover-suno',
                'Generate MIDI': 'suno/generate-midi',
            };
            resolvedModel = SUNO_UTIL_MAP[extra.suno_action] || 'suno/music-video';
            delete extra.suno_action;
        }

        // Seedance 2.0: detect speed toggle and resolve model
        const isSeedance = resolvedModel.startsWith('bytedance/seedance-2');
        const isSeedanceFrames = resolvedModel === 'bytedance/seedance-2-frames';
        const isSeedanceVideo = resolvedModel === 'bytedance/seedance-2-video';
        const seedanceSpeedFast = isSeedance && extra.seedance_speed === 'Fast';
        if (isSeedance) delete extra.seedance_speed; // not an API param

        const isFramesModel = resolvedModel.includes('kling-3.0/video') || isSeedanceFrames;
        const hasVideoRefs = (isSeedanceVideo || resolvedModel === 'bytedance/seedance-2-fast') && v2VideoFiles.length > 0;
        const hasFiles = isFramesModel ? (v2FrameInitial !== null || v2FrameFinal !== null) : (v2Files.length > 0);

        // Remap model names based on whether files are present
        if (!isSeedance) {
            if (hasFiles) {
                if (resolvedModel === 'grok-imagine/text-to-image') resolvedModel = 'grok-imagine/image-to-image';
                if (resolvedModel === 'sora-2-pro-text-to-video') resolvedModel = 'sora-2-pro-image-to-video';
                if (resolvedModel === 'grok-imagine/text-to-video') resolvedModel = 'grok-imagine/image-to-video';
                resolvedModel = resolveSeedreamModel(resolvedModel, extra, true);
            } else {
                // Text-only: remap to correct API model names
                resolvedModel = resolveSeedreamModel(resolvedModel, extra, false);
            }
        }

        // Resolve Seedance sub-models → 'seedance-2' or 'seedance-2-fast'
        if (isSeedance) resolvedModel = seedanceSpeedFast ? 'bytedance/seedance-2-fast' : 'bytedance/seedance-2';

        let imgField = v2Model?.field || selectedModel?.field || 'image_input';
        if (resolvedModel === 'wan/2-7-videoedit') {
            imgField = 'video_url';
        }

        if (hasFiles) {
            if (isFramesModel) {
                btnSpan.textContent = 'Uploading frames...';
                let initialUrl = "";
                let finalUrl = "";
                if (v2FrameInitial) {
                    initialUrl = await v2UploadSingleFile(v2FrameInitial, 0, 1);
                }
                if (v2FrameFinal) {
                    finalUrl = await v2UploadSingleFile(v2FrameFinal, 0, 1);
                }
                if (resolvedModel.includes("kling")) {
                    const urls = [];
                    if (initialUrl) urls.push(encodeURI(initialUrl));
                    if (finalUrl) {
                        if (!initialUrl) urls.push(""); // Kling expects empty string if only last frame is provided
                        urls.push(encodeURI(finalUrl));
                    }
                    if (urls.length > 0) extra.image_urls = urls;
                } else if (resolvedModel === "bytedance/seedance-2-frames") {
                    const urls = [];
                    if (initialUrl) urls.push(encodeURI(initialUrl));
                    if (finalUrl) {
                        if (!initialUrl) urls.push("");
                        urls.push(encodeURI(finalUrl));
                    }
                    if (urls.length > 0) extra.reference_image_urls = urls;
                } else {
                    if (initialUrl) extra.first_frame_url = encodeURI(initialUrl);
                    if (finalUrl) extra.last_frame_url = encodeURI(finalUrl);
                }
            } else {
                if (resolvedModel === 'wan/2-7-r2v') {
                    btnSpan.textContent = `Uploading ${v2Files.length} referência${v2Files.length > 1 ? 's' : ''}...`;
                    const uploaded = await Promise.all(
                        v2Files.map(async (file, i) => ({
                            type: file.type,
                            url: encodeURI(await v2UploadSingleFile(file, i, v2Files.length))
                        }))
                    );
                    const imageRefs = uploaded.filter(f => f.type.startsWith('image/')).map(f => f.url);
                    const videoRefs = uploaded.filter(f => f.type.startsWith('video/')).map(f => f.url);
                    if (imageRefs.length > 0) extra.reference_image = imageRefs;
                    if (videoRefs.length > 0) extra.reference_video = videoRefs;
                    btnSpan.textContent = 'Creating task...';
                } else {
                const isVideo = v2Files.some(f => f.type.startsWith('video/'));
                btnSpan.textContent = isVideo
                    ? 'Uploading video...'
                    : `Uploading ${v2Files.length} image${v2Files.length > 1 ? 's' : ''}...`;
                const imageUrls = await Promise.all(
                    v2Files.map(async (file, i) => {
                        const url = await v2UploadSingleFile(file, i, v2Files.length);
                        return encodeURI(url);
                    })
                );
                // Fields that expect a single string rather than an array
                const singleStringFields = ['image_url', 'video_url', 'audio_url', 'image', 'inputImage', 'first_frame_url', 'first_clip_url'];
                extra[imgField] = (singleStringFields.includes(imgField) && imageUrls.length === 1) ? imageUrls[0] : imageUrls;
                }
            }
            btnSpan.textContent = 'Creating task...';
        }

        // Seedance 2.0 Video Reference: upload video files to reference_video_urls
        if (hasVideoRefs) {
            btnSpan.textContent = `Uploading ${v2VideoFiles.length} vídeo${v2VideoFiles.length > 1 ? 's' : ''}...`;
            const videoUrls = await Promise.all(
                v2VideoFiles.map(async (file, i) => {
                    const url = await v2UploadSingleFile(file, i, v2VideoFiles.length);
                    return encodeURI(url);
                })
            );
            extra.reference_video_urls = videoUrls;
            btnSpan.textContent = 'Creating task...';
        }

        const fd = new FormData();
        fd.append('model', resolvedModel);
        fd.append('input_json', JSON.stringify(extra));

        // Route to correct API endpoint based on model
        const isSuno = resolvedModel.startsWith('suno/');
        const isGpt4o = resolvedModel === 'gpt4o-image';
        const isFluxKontext = resolvedModel.startsWith('flux-kontext');
        let endpoint, mode;
        if (isSuno) {
            endpoint = `${API}/api/suno/create`;
            mode = 'suno';
        } else if (isGpt4o) {
            endpoint = `${API}/api/gpt4o-image/create`;
            mode = 'gpt4o-image';
        } else if (isFluxKontext) {
            // Flux Kontext needs the model name in the input
            extra.model = resolvedModel;
            fd.set('input_json', JSON.stringify(extra));
            endpoint = `${API}/api/flux-kontext/create`;
            mode = 'flux-kontext';
        } else {
            endpoint = `${API}/api/market/create-json`;
            mode = 'market';
        }

        const resp = await fetch(endpoint, { method: 'POST', body: fd });
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || json.msg || 'Failed');
        if (json.code && json.code !== 200) throw new Error(json.msg || `API error (code ${json.code})`);
        const taskId =
            json?.data?.taskId ||
            json?.task?.data?.taskId ||
            json?.taskId ||
            json?.data?.task_id ||
            json?.task_id ||
            json?.data?.recordId ||
            json?.recordId;
        if (!taskId) throw new Error(json.msg || 'No taskId/recordId returned');

    // ── V2 Gallery Management ──
    function v2MediaHtml(url, coverUrl, isSuno, isVid) {
        const safeUrl = esc(url || '');
        const safeCoverUrl = esc(coverUrl || '');
        let html = '';
        if (isVid || isVideoUrl(url)) {
            html += `<video src="${safeUrl}" autoplay loop muted playsinline onerror="window.handleExpiredMedia(this)"></video>
                    <div class="v2-gallery-item-overlay"><span class="v2-gallery-item-status">Concluído</span></div>`;
        } else if (isSuno || isAudioUrl(url)) {
            if (coverUrl) {
                // Suno with cover art: use aspect-ratio wrapper so img has a real height
                html += `<div style="position:relative;width:100%;aspect-ratio:1;overflow:hidden;">
                    <img src="${safeCoverUrl}" alt="Capa" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;" onerror="window.handleExpiredMedia(this)">
                    <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%);pointer-events:none;"></div>
                    <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style="opacity:0.9;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6));"><polygon points="5 3 19 12 5 21"/></svg>
                    </div>
                    <div class="v2-gallery-item-overlay"><span class="v2-gallery-item-status">♫ Suno</span></div>
                </div>`;
            } else {
                html += `<div style="width:100%;height:100%;background:linear-gradient(135deg,rgba(220,38,38,0.15),rgba(15,15,15,0.9));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        <span style="font-family:var(--mono);font-size:10px;color:rgba(148,163,184,0.7);">Áudio Gerado</span>
                    </div>`;
            }
        } else {
            html += `<img src="${safeUrl}" alt="Gerado" onerror="window.handleExpiredMedia(this)">
                    <div class="v2-gallery-item-overlay"><span class="v2-gallery-item-status">Concluído</span></div>`;
        }
        return html;
    }

    const ITEM_FADE_MS = 200; // gallery item fade-out duration

    function _renderFailedItemUI(item, failMsg) {
        item.className = 'v2-gallery-item failed'; // normalize class (works for both new & existing items)
        const msgHtml = failMsg ? `<span class="v2-fail-detail">${esc(failMsg)}</span>` : '';
        item.innerHTML = `<div class="v2-fail-body"><span class="v2-fail-title">❌ Falhou</span>${msgHtml}</div>`;
        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'v2-item-btn v2-item-del v2-fail-dismiss';
        dismissBtn.title = 'Remover';
        dismissBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/></svg>';
        dismissBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            item.style.transition = `opacity ${ITEM_FADE_MS / 1000}s`;
            item.style.opacity = '0';
            const bid = item.dataset.baseTaskId || item.dataset.taskId;
            if (bid) {
                _deletedIds.add(bid);
                const history = loadHistory().filter(h => h.id !== bid);
                saveHistory(history);
                if (typeof _serverHistoryCache !== 'undefined') _serverHistoryCache.delete(bid);
                fetch(`${API}/api/history/${encodeURIComponent(bid)}`, { method: 'DELETE', headers: _kieAuthHeaders() }).catch(() => {});
            }
            setTimeout(() => { item.remove(); updateV2GalleryCount(); renderHistoryGallery(); updateHistoryCount(); }, ITEM_FADE_MS + 20);
        });
        item.appendChild(dismissBtn);
    }

    function addV2GalleryItem(elementId, state, mediaUrl, baseTaskId, coverUrl, taskModel, failMsg, batch) {
        v2.galleryEmpty.style.display = 'none';

        const item = document.createElement('div');
        const isSunoItem = (taskModel || '').startsWith('suno/');
        const isVid = (mediaUrl && isVideoUrl(mediaUrl)) || currentCat === 'video' || (taskModel || '').includes('video');
        item.className = `v2-gallery-item ${state}${isVid ? ' video-item' : ''}`;
        item.id = `v2-item-${CSS.escape(elementId)}`;
        item.dataset.taskId = elementId;
        item.dataset.baseTaskId = baseTaskId || elementId;

        if (state === 'success' && mediaUrl) {
            item.innerHTML = v2MediaHtml(mediaUrl, coverUrl, isSunoItem, isVid);
        } else if (state === 'failed' || state === 'fail') {
            _renderFailedItemUI(item, failMsg);
        }
        // processing state uses CSS ::after spinner

        // Hover action bar: Download + Delete
        if (state === 'success' && mediaUrl) {
            const actionsBar = document.createElement('div');
            actionsBar.className = 'v2-item-actions';
            actionsBar.innerHTML = `
                <a href="${mediaUrl}" download target="_blank" rel="noopener" class="v2-item-btn v2-item-dl" title="Download" onclick="event.stopPropagation()">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="v2-item-btn v2-item-del" title="Remover" data-base-id="${baseTaskId || elementId}">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14H7L5 6"/></svg>
                </button>`;
            item.appendChild(actionsBar);

            // Delete from history + remove item
            actionsBar.querySelector('.v2-item-del').addEventListener('click', async (e) => {
                e.stopPropagation();
                const bid = e.currentTarget.dataset.baseId;
                // Mark as deleted FIRST — blocks all async re-insertion paths
                _deletedIds.add(bid);
                // Delete from server (await + verify)
                try {
                    const resp = await fetch(`${API}/api/history/${encodeURIComponent(bid)}`, { method: 'DELETE', headers: _kieAuthHeaders() });
                    if (!resp.ok) console.error('[history] Server delete returned', resp.status);
                } catch (err) {
                    console.warn('[history] Server delete failed:', err.message);
                }
                // Then remove from local cache
                const history = loadHistory().filter(h => h.id !== bid);
                saveHistory(history);
                // Also remove from V2 server history cache
                _serverHistoryCache.delete(bid);
                item.style.transition = `opacity ${ITEM_FADE_MS / 1000}s, transform ${ITEM_FADE_MS / 1000}s`;
                item.style.opacity = '0';
                item.style.transform = 'scale(0.9)';
                setTimeout(() => { item.remove(); updateV2GalleryCount(); renderHistoryGallery(); updateHistoryCount(); }, ITEM_FADE_MS + 20);
            });
        }

        // Allow opening lightbox by clicking the item
        item.addEventListener('click', (e) => {
            // Do not trigger if clicking an action button/link or interacting with video controls
            // Note: do NOT block on .v2-item-actions itself - only on interactive children inside it
            if (e.target.closest('button') || e.target.closest('a') || (e.target.tagName.toLowerCase() === 'video' && e.offsetX > e.target.clientWidth - 40)) return;
            // Search in-memory tasks first, fall back to history cache, then server cache
            let t = tasks.find(x => x.id === item.dataset.baseTaskId);
            let fromHistory = false;
            if (!t) {
                t = loadHistory().find(x => x.id === item.dataset.baseTaskId);
                fromHistory = true;
            }
            if (!t) {
                t = _serverHistoryCache.get(item.dataset.baseTaskId);
                fromHistory = true;
            }
            if (t) {
                let entry;
                if (fromHistory) {
                    entry = t; // history entries already have the right shape
                } else {
                    const data = t.data?.data || {};
                    // Normalise sunoData — handle both response shapes and camelCase vs snake_case
                    const rawSunoData = data.response?.sunoData
                        || (Array.isArray(data.data) && (data.data[0]?.audioUrl || data.data[0]?.audio_url) ? data.data : null);
                    const normSunoData = rawSunoData?.map(s => ({
                        ...s,
                        audioUrl: s.audioUrl || s.audio_url || '',
                        imageUrl: s.image_large_url || s.imageLargeUrl || s.imageUrl || s.image_url || '',
                        sourceAudioUrl: s.sourceAudioUrl || s.source_audio_url || '',
                    })) || null;
                    entry = {
                        id: t.id,
                        model: t.model,
                        state: t.state,
                        cat: t.cat || currentCat,
                        urls: _extractResultUrls(data),
                        prompt: t._prompt || '',
                        inputFileUrl: t._inputFileUrl || null,
                        extraParams: t._extraParams || null,
                        timestamp: Date.now(),
                        costTime: data.costTime || null,
                        coverUrl: normSunoData?.[0]?.imageUrl || null,
                        trackTitle: normSunoData?.[0]?.title || null,
                        sunoData: normSunoData,
                        data: data
                    };
                }
                openHistoryLightbox(entry);
            }
        });

        // When batch=true, append to end (caller controls order); otherwise prepend (single new item)
        if (batch) {
            v2.gallery.appendChild(item);
        } else {
            v2.gallery.insertBefore(item, v2.gallery.firstChild);
        }
        updateV2GalleryCount();
    }

    function updateV2GalleryItem(elementId, state, mediaUrl, baseTaskId, coverUrl, taskModel, failMsg) {
        const item = document.getElementById(`v2-item-${CSS.escape(elementId)}`);
        if (!item) return;

        const isSunoItem = (taskModel || '').startsWith('suno/');
        const isVid = (mediaUrl && isVideoUrl(mediaUrl)) || currentCat === 'video' || (taskModel || '').includes('video');
        item.className = `v2-gallery-item ${state}${isVid ? ' video-item' : ''}`;
        // Ensure baseTaskId is set if missing
        if (!item.dataset.baseTaskId) item.dataset.baseTaskId = baseTaskId || elementId;

        if (state === 'success' && mediaUrl) {
            item.innerHTML = v2MediaHtml(mediaUrl, coverUrl, isSunoItem, isVid);
        } else if (state === 'fail' || state === 'failed') {
            _renderFailedItemUI(item, failMsg);
        }
        updateV2GalleryCount();
    }

    function updateV2GalleryCount() {
        const count = v2.gallery.querySelectorAll('.v2-gallery-item').length;
        const isVid = (currentCat === 'video') || (v2Model?.model && v2Model.model.includes('video'));
        const label = isVid ? (count === 1 ? 'vídeo' : 'vídeos') : (count === 1 ? 'imagem' : 'imagens');
        v2.galleryCount.textContent = `${count} ${label}`;
    }

    // ── Poll observer: watch tasks for state changes and update V2 gallery ──
    // Override the global updateTaskCard to also push updates to V2 gallery
    const _origUpdateTaskCard = window.updateTaskCard || (typeof updateTaskCard === 'function' ? updateTaskCard : null);

    // Patch: after each updateTaskCard call, check if the task is ours
    const _v2CompletedTasks = new Set();
    const checkV2TaskUpdate = (task) => {
        if (!v2Tasks.includes(task.id)) return;
        if (_v2CompletedTasks.has(task.id)) return; // Already processed — prevent MutationObserver duplicates

        if (task.state === 'success') {
            _v2CompletedTasks.add(task.id);
            const data = task.data?.data || {};
            const urls = _extractResultUrls(data);
            if (urls.length > 0) {
                // Remove the processing placeholder
                const existing = document.getElementById(`v2-item-${CSS.escape(task.id)}`);
                if (existing) existing.remove();
                const coverU = data.response?.sunoData?.[0]?.image_large_url || data.response?.sunoData?.[0]?.imageLargeUrl || data.response?.sunoData?.[0]?.imageUrl || data.response?.sunoData?.[0]?.image_url || null;
                const maxUrls = task.model.startsWith('suno/') ? 1 : urls.length;
                urls.slice(0, maxUrls).forEach((url, i) => {
                    addV2GalleryItem(`${task.id}-${i}`, 'success', url, task.id, coverU, task.model);
                });
            } else {
                updateV2GalleryItem(task.id, 'success');
            }
        } else if (task.state === 'fail') {
            _v2CompletedTasks.add(task.id);
            const failMsg = task.data?.data?.failMsg || task.data?.data?.failReason || task.data?.data?.errorMessage || '';
            updateV2GalleryItem(task.id, 'failed', null, null, null, null, failMsg);
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

    // ── Fetch server-side history ──
    // Cache for server-side history items (not in localStorage, need special lookup on click)
    const _serverHistoryCache = new Map(); // taskId -> entry object

    async function _fetchServerHistory(cat) {
        try {
            await initApiKey();
            const resp = await fetch(`${API}/api/history?cat=${encodeURIComponent(cat)}&limit=100`, { headers: _kieAuthHeaders() });
            if (!resp.ok) return [];
            const json = await resp.json();
            // Filter out any items that were deleted during this session
            return (json.history || []).filter(h => !_deletedIds.has(h.id));
        } catch (e) { console.warn('[v2] Failed to fetch server history:', e.message); return []; }
    }

    // ── Refresh gallery from existing tasks (on show) ──
    function refreshV2Gallery() {
        // Clear everything except the empty state
        v2.gallery.querySelectorAll('.v2-gallery-item').forEach(el => el.remove());

        // Find all tasks created via V2 workspace (tracked by v2Tasks array) or from history matching the current category
        // Check both active tasks and history so finished/failed tasks don't disappear
        const allTracked = [...tasks, ...loadHistory()];

        // Also fetch server-side history (async merge) — filter by model too
        _fetchServerHistory(currentCat).then(serverItems => {
            if (!serverItems.length) return;
            const existingIds = new Set(v2.gallery.querySelectorAll('.v2-gallery-item').length ?
                [...v2.gallery.querySelectorAll('.v2-gallery-item')].map(el => el.dataset.baseTaskId || el.dataset.taskId) : []);

            const MULTI_MODEL_CATS_SRV = ['image', 'tools', 'audio', 'video'];
            const amNorm = v2Model?.model ? modelFamily(v2Model.model) : null;

            // Sort server items newest-first before inserting
            const sortedItems = serverItems.slice().sort((a, b) =>
                (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0)
            );

            sortedItems.forEach(task => {
                if (existingIds.has(task.id)) return;
                // Filter by model family for shared categories
                if (amNorm && MULTI_MODEL_CATS_SRV.includes(currentCat)) {
                    if (modelFamily(task.model) !== amNorm) return;
                }
                // Cache this server item so the click handler can find it
                _serverHistoryCache.set(task.id, task);
                if (task.state === 'success' && Array.isArray(task.urls) && task.urls.length > 0) {
                    const coverU = task.coverUrl || null;
                    const maxUrls = (task.model || '').startsWith('suno/') ? 1 : task.urls.length;
                    task.urls.slice(0, maxUrls).forEach((url, i) => {
                        addV2GalleryItem(`${task.id}-${i}`, 'success', url, task.id, coverU, task.model, null, true);
                    });
                }
            });
            updateV2GalleryCount();
        }).catch(err => console.warn('[history] Server history load failed:', err.message));

        // Categories that share a cat value across multiple model families
        // Use family-prefix matching so veo3/text-to-video-fast still shows in veo3 workspace
        const MULTI_MODEL_CATS = ['image', 'tools', 'audio', 'video'];
        const activeModel = v2Model?.model || null;

        // Extract the model 'family' prefix for loose matching:
        // veo3/text-to-video-fast → veo3, grok-imagine/image-to-video → grok-imagine, nano-banana-2 → nano-banana
        function modelFamily(m) {
            if (!m) return '';
            const s = m.toLowerCase();
            // Known vendor prefixes
            if (s.startsWith('nano-banana')) return 'nano-banana';
            if (s.startsWith('google/nano-banana')) return 'nano-banana';
            if (s.startsWith('google/imagen')) return 'imagen';
            if (s.startsWith('grok-imagine')) return 'grok-imagine';
            if (s.startsWith('gpt4o')) return 'gpt4o';
            if (s.startsWith('bytedance/') || s.startsWith('seedream/')) return 'seedream';
            if (s.startsWith('qwen/')) return 'qwen';
            if (s.startsWith('flux-kontext')) return 'flux-kontext';
            if (s.startsWith('flux-2/')) return 'flux-2';
            if (s.startsWith('veo3')) return 'veo3';
            if (s.startsWith('sora')) return 'sora';
            if (s.startsWith('kling')) return 'kling';
            if (s.startsWith('wan/')) return 'wan';
            if (s.startsWith('hailuo')) return 'hailuo';
            if (s.startsWith('elevenlabs')) return 'elevenlabs';
            if (s.startsWith('topaz/video')) return 'topaz-video';
            if (s.startsWith('topaz/image')) return 'topaz-image';
            if (s.startsWith('recraft/crisp')) return 'recraft-crisp';
            if (s.startsWith('recraft/remove')) return 'recraft-bg';
            if (s.startsWith('suno/')) return 'suno';
            // Fallback: first path segment or whole string
            return s.split('/')[0].split('-')[0];
        }
        const activeFamily = activeModel ? modelFamily(activeModel) : null;

        const v2TaskList = allTracked.filter(t => {
            let tc = t.cat;
            // Map legacy category names from V1 to V2 standards
            if (tc === 'suno') tc = 'music';
            if (tc === 'veo') tc = 'video';
            if (tc === 'veo3') tc = 'video';
            if (tc === 'vid-txt') tc = 'video';
            if (tc === 'vid-img') tc = 'video';

            // Fallback: if no cat, try to infer from mode
            if (!tc && t.mode === 'market') {
                // Try to infer from model name
                const m = t.model || '';
                if (m.includes('suno')) tc = 'music';
                else if (m.includes('elevenlabs')) tc = 'audio';
                else if (m.includes('topaz') || m.includes('crisp') || m.includes('recraft')) tc = 'tools';
                else if (m.includes('video') || m.includes('kling') || m.includes('wan') || m.includes('hailuo') || m.includes('sora') || m.includes('veo')) tc = 'video';
                else tc = 'image';
            }

            // Show any task matching the current category
            if (tc !== currentCat) return false;

            // For categories shared by many models, filter by model family
            // so Grok tasks don't bleed into Nano Banana, and veo3-fast still shows in veo3 workspace
            if (activeFamily && MULTI_MODEL_CATS.includes(currentCat)) {
                if (modelFamily(t.model) !== activeFamily) return false;
            }

            return true;
        });

        if (v2TaskList.length === 0) {
            v2.galleryEmpty.style.display = '';
            updateV2GalleryCount();
            return;
        }

        v2.galleryEmpty.style.display = 'none';

        // Deduplicate by task id (active tasks take priority over history entries)
        const seen = new Set();
        const deduped = v2TaskList.filter(t => {
            if (seen.has(t.id)) return false;
            seen.add(t.id);
            return true;
        });

        // Sort deduped newest-first by timestamp so gallery order is correct
        deduped.sort((a, b) => {
            const tsA = Number(a.timestamp || a.data?.data?.createTime || 0) || 0;
            const tsB = Number(b.timestamp || b.data?.data?.createTime || 0) || 0;
            return tsB - tsA;
        });

        deduped.forEach(task => {
            // Ensure tracked
            // Only track active (processing) tasks for MutationObserver — history items don't need watching
            if (task.state === 'processing' && !v2Tasks.includes(task.id)) {
                v2Tasks.push(task.id);
            }

            if (task.state === 'success') {
                // Active tasks have data.data; history entries have urls[] directly
                const data = task.data?.data || {};
                let urls = _extractResultUrls(data);
                // Fallback: history items from localStorage store URLs in task.urls
                if (urls.length === 0 && Array.isArray(task.urls) && task.urls.length > 0) {
                    urls = task.urls;
                }
                if (urls.length > 0) {
                    const data2 = task.data?.data || {};
                    const coverU = data2.response?.sunoData?.[0]?.image_large_url || data2.response?.sunoData?.[0]?.imageLargeUrl || data2.response?.sunoData?.[0]?.imageUrl || data2.response?.sunoData?.[0]?.image_url || task.coverUrl || null;
                    const maxUrls = (task.model || '').startsWith('suno/') ? 1 : urls.length;
                    urls.slice(0, maxUrls).forEach((url, i) => {
                        addV2GalleryItem(`${task.id}-${i}`, 'success', url, task.id, coverU, task.model, null, true);
                    });
                }
            } else if (task.state === 'fail') {
                const errorData = task.data?.data || {};
                const fm = errorData.failMsg || errorData.failReason || errorData.errorMessage || '';
                addV2GalleryItem(task.id, 'failed', null, null, null, null, fm, true);
            } else {
                addV2GalleryItem(task.id, 'processing', null, null, null, null, null, true);
            }
        });
        sessionStorage.setItem('v2_tasks', JSON.stringify(v2Tasks));
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
            if (typeof exitWorkspace === 'function') exitWorkspace();
        }
    });

    console.log('[V2] Image workspace initialized');
})();

// ==================== Custom Music Player Controller ====================
// Each .main-music-card with data-mp-src creates a JS Audio object on first interaction.
// Only one player is active at a time (global singleton pattern).

(function () {
    'use strict';

    /** @type {HTMLAudioElement|null} */
    let _activeAudio = null;
    /** @type {Element|null} */
    let _activeCard = null;
    let _rafId = null;

    function _fmt(secs) {
        if (!isFinite(secs) || secs < 0) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function _stopCurrent() {
        if (_activeAudio) {
            _activeAudio.pause();
            _activeAudio.removeAttribute('src');
            _activeAudio.load();
            _activeAudio = null;
        }
        if (_activeCard) {
            _activeCard.classList.remove('is-playing');
            _activeCard = null;
        }
        if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    }

    function _updateUI(card, audio) {
        const fill = card.querySelector('.progress-fill');
        const handle = card.querySelector('.progress-handle');
        const curTime = card.querySelector('.current-time');
        const remTime = card.querySelector('.remaining-time');
        if (!audio || audio.paused) return;

        const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        if (fill) fill.style.width = pct + '%';
        if (handle) handle.style.left = pct + '%';
        if (curTime) curTime.textContent = _fmt(audio.currentTime);
        if (remTime) remTime.textContent = '-' + _fmt(audio.duration - audio.currentTime);

        _rafId = requestAnimationFrame(() => _updateUI(card, audio));
    }

    function _initPlayer(card) {
        const src = card.dataset.mpSrc;
        if (!src) return;

        // If same card = toggle play/pause
        if (_activeCard === card && _activeAudio) {
            if (_activeAudio.paused) {
                _activeAudio.play();
                card.classList.add('is-playing');
                _rafId = requestAnimationFrame(() => _updateUI(card, _activeAudio));
            } else {
                _activeAudio.pause();
                card.classList.remove('is-playing');
                if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
            }
            return;
        }

        // Stop any other playing track
        _stopCurrent();

        const audio = new Audio(src);
        audio.preload = 'metadata';
        _activeAudio = audio;
        _activeCard = card;

        audio.addEventListener('loadedmetadata', () => {
            const remTime = card.querySelector('.remaining-time');
            if (remTime) remTime.textContent = _fmt(audio.duration);
        });

        audio.addEventListener('ended', () => {
            card.classList.remove('is-playing');
            const fill = card.querySelector('.progress-fill');
            const handle = card.querySelector('.progress-handle');
            if (fill) fill.style.width = '0%';
            if (handle) handle.style.left = '0%';
            if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
        });

        audio.play().then(() => {
            card.classList.add('is-playing');
            _rafId = requestAnimationFrame(() => _updateUI(card, audio));
        }).catch(e => console.warn('[MusicPlayer] Play blocked:', e.message));
    }

    function _seek(card, audio, clientX) {
        const bar = card.querySelector('.progress-bar');
        if (!bar || !audio || !audio.duration) return;
        const rect = bar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        audio.currentTime = ratio * audio.duration;
        const pct = ratio * 100;
        const fill = card.querySelector('.progress-fill');
        const handle = card.querySelector('.progress-handle');
        if (fill) fill.style.width = pct + '%';
        if (handle) handle.style.left = pct + '%';
        const curTime = card.querySelector('.current-time');
        const remTime = card.querySelector('.remaining-time');
        if (curTime) curTime.textContent = _fmt(audio.currentTime);
        if (remTime) remTime.textContent = '-' + _fmt(audio.duration - audio.currentTime);
    }

    // ── Event delegation on document ──
    document.addEventListener('click', e => {
        // Play/pause button
        const ppBtn = e.target.closest('.main-music-card .play-pause-button');
        if (ppBtn) {
            e.preventDefault();
            const card = ppBtn.closest('.main-music-card');
            if (card) _initPlayer(card);
            return;
        }

        // Skip back button (-10s)
        const backBtn = e.target.closest('.main-music-card .control-button.back');
        if (backBtn) {
            const card = backBtn.closest('.main-music-card');
            if (card === _activeCard && _activeAudio) {
                _activeAudio.currentTime = Math.max(0, _activeAudio.currentTime - 10);
            }
            return;
        }

        // Skip forward button (+10s)
        const nextBtn = e.target.closest('.main-music-card .control-button.next');
        if (nextBtn) {
            const card = nextBtn.closest('.main-music-card');
            if (card === _activeCard && _activeAudio) {
                _activeAudio.currentTime = Math.min(_activeAudio.duration || 0, _activeAudio.currentTime + 10);
            }
            return;
        }

        // Progress bar click to seek
        const bar = e.target.closest('.main-music-card .progress-bar');
        if (bar) {
            const card = bar.closest('.main-music-card');
            if (card === _activeCard && _activeAudio) {
                _seek(card, _activeAudio, e.clientX);
            }
            return;
        }
    });

    // ── Drag-to-scrub on progress bar ──
    let _scrubbing = false;
    document.addEventListener('mousedown', e => {
        const bar = e.target.closest('.main-music-card .progress-bar');
        if (!bar) return;
        const card = bar.closest('.main-music-card');
        if (card !== _activeCard || !_activeAudio) return;
        _scrubbing = true;
        card.classList.add('is-scrubbing');
        _seek(card, _activeAudio, e.clientX);
    });

    document.addEventListener('mousemove', e => {
        if (!_scrubbing || !_activeCard || !_activeAudio) return;
        _seek(_activeCard, _activeAudio, e.clientX);
    });

    document.addEventListener('mouseup', () => {
        if (_scrubbing && _activeCard) {
            _activeCard.classList.remove('is-scrubbing');
        }
        _scrubbing = false;
    });

    console.log('[MusicPlayer] Custom player controller initialized');
})();
