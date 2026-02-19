/**
 * KIE AI Studio — Application Logic v3
 * Full model parameter configuration from KIE docs.
 */

const API = '';

// ==================== MODEL PARAMETER REGISTRY ====================
// Each model defines its 'params' — array of { key, label, type, options, default, min, max, step }
// 'cost' is the estimated credits per generation (from KIE API docs)

// Credit cost estimates (1 credit ≈ $0.005 USD)
const MODEL_COST_ESTIMATES = {
    // ── Image (20-40 credits) ──
    'bytedance/4.5-text-to-image': 25,
    'flux-2/pro-text-to-image': 40,
    'google/imagen4': 30,
    'ideogram/v3-text-to-image': 35,
    'qwen/text-to-image': 20,
    // ── Image Tools (10-100) ──
    'recraft/remove-background': 10,
    'recraft/crisp-upscale': 15,
    'topaz/image-upscale': 15,
    'topaz/video-upscale': 100,
    // ── Video (100-500 credits) ──
    'sora-2-pro-text-to-video': 500,
    'kling-3.0/video': 350,
    'wan/2-2-a14b-text-to-video-turbo': 100,
    'grok-imagine/text-to-video': 200,
    'grok-imagine/image-to-video': 200,
    'hailuo/2-3-image-to-video-pro': 200,
    // ── Audio (15-20) ──
    'elevenlabs/text-to-speech-turbo-2-5': 15,
    'infinitalk/from-audio': 20,
    // ── Music / Suno (30-50) ──
    'suno/generate-music': 50,
    'suno/generate-lyrics': 30,
    // ── MJ (30-50) ──
    'mj': 40,
};

function getModelCost(model) {
    return MODEL_COST_ESTIMATES[model] || null;
}

function costColorClass(cost) {
    if (cost <= 30) return 'cost-low';
    if (cost <= 200) return 'cost-mid';
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
    'bytedance/4.5-text-to-image': {
        params: [
            { key: 'image_size', label: 'Tamanho', type: 'select', options: ['square_hd', 'square', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9'], default: 'square_hd' },
            { key: 'guidance_scale', label: 'Guidance', type: 'number', default: 2.5, min: 1, max: 20, step: 0.5 },
            { key: 'enable_safety_checker', label: 'Safety', type: 'bool', default: true },
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
    'topaz/video-upscale': { params: [] },

    // ──── VIDEO MODELS ────
    'sora-2-pro-text-to-video': {
        params: [
            { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['landscape', 'portrait', 'square'], default: 'landscape' },
            { key: 'n_frames', label: 'Frames', type: 'select', options: ['5', '10', '20'], default: '10' },
            { key: 'size', label: 'Qualidade', type: 'select', options: ['low', 'medium', 'high'], default: 'high' },
            { key: 'remove_watermark', label: 'Sem Watermark', type: 'bool', default: true },
            { key: 'upload_method', label: 'Upload Method', type: 'select', options: ['s3', ''], default: 's3' },
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
            { key: 'mode', label: 'Modo', type: 'select', options: ['normal', 'fast'], default: 'normal' },
            { key: 'duration', label: 'Duração (s)', type: 'select', options: ['4', '6', '8'], default: '6' },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['480p', '720p', '1080p'], default: '480p' },
        ]
    },
    'grok-imagine/image-to-video': {
        params: [
            { key: 'mode', label: 'Modo', type: 'select', options: ['normal', 'fast'], default: 'normal' },
            { key: 'duration', label: 'Duração (s)', type: 'select', options: ['4', '6', '8'], default: '6' },
            { key: 'resolution', label: 'Resolução', type: 'select', options: ['480p', '720p', '1080p'], default: '480p' },
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
    'infinitalk/from-audio': { params: [] },

    // ──── SUNO / MUSIC ────
    'suno/generate-music': {
        params: [
            { key: 'custom_mode', label: 'Modo Avançado', type: 'bool', default: false },
            { key: 'style', label: 'Estilo Musical', type: 'text', default: '' },
            { key: 'title', label: 'Título', type: 'text', default: '' },
            { key: 'instrumental', label: 'Só Instrumental', type: 'bool', default: false },
        ]
    },
    'suno/generate-lyrics': { params: [] },
};

// ==================== State ====================

let selectedModel = null;
let selectedFile = null;
let currentCatLabel = '';
let tasks = [];

// ==================== History (localStorage) ====================
const HISTORY_KEY = 'kie-history';
const HISTORY_MAX = 200;

function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch { return []; }
}

function saveHistory(history) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_MAX))); }
    catch (e) { console.error('History save error:', e); }
}

function addToHistory(task) {
    const data = task.data?.data || {};
    // Collect URLs
    const urls = [];
    if (typeof data.output === 'string') urls.push(data.output);
    if (data.resultUrl) urls.push(data.resultUrl);
    if (data.downloadUrl) urls.push(data.downloadUrl);
    if (Array.isArray(data.resultUrls)) urls.push(...data.resultUrls);
    if (Array.isArray(data.output)) urls.push(...data.output);
    if (typeof data.resultJson === 'string' && data.resultJson) {
        try {
            const parsed = JSON.parse(data.resultJson);
            if (Array.isArray(parsed.resultUrls)) urls.push(...parsed.resultUrls);
            if (parsed.resultUrl) urls.push(parsed.resultUrl);
            if (parsed.resultObject?.url) urls.push(parsed.resultObject.url);
        } catch { }
    }
    const uniqueUrls = [...new Set(urls.filter(u => typeof u === 'string' && u.startsWith('http')))];
    if (uniqueUrls.length === 0 && task.state !== 'success') return; // Don't save failed tasks with no output

    const entry = {
        id: task.id,
        model: task.model,
        state: task.state,
        urls: uniqueUrls,
        prompt: task._prompt || '',
        timestamp: Date.now(),
        costTime: data.costTime || null,
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
    breadcrumbRoot: $('#breadcrumb-root'),
    breadcrumbCat: $('#breadcrumb-cat'),
    modelSelectorGrid: $('#model-selector-grid'),
    modelContextDesc: $('#model-context-desc'),
    workspaceCatLabel: $('#workspace-cat-label'),
    btnBackLobby: $('#btn-back-lobby'),
    promptWordCount: $('#prompt-word-count'),
    paramsEmpty: $('#params-empty'),
    configPanel: $('#config-panel'),
    configIcon: $('#config-icon'),
    configName: $('#config-model-name'),
    configProvider: $('#config-model-provider'),
    configPrompt: $('#config-prompt'),
    configPromptGrp: $('#config-prompt-group'),
    btnClearPrompt: $('#btn-clear-prompt'),
    configExtraJson: $('#config-extra-json'),
    configExtraGrp: $('#config-extra-group'),
    configParams: $('#config-model-params'),
    btnResetParams: $('#btn-reset-params'),
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
    masEmpty: $('#mas-empty'),
    masModel: $('#mas-model'),
    masIcon: $('#mas-icon'),
    masName: $('#mas-name'),
    masProvider: $('#mas-provider'),
    masCost: $('#mas-cost'),
};

// Category labels
const CAT_LABELS = { image: 'Generate Image', 'vid-txt': 'Text → Video', 'vid-img': 'Image → Video', audio: 'Audio', music: 'Music', tools: 'Tools & Upscale', mj: 'Midjourney' };

// ==================== Init ====================

document.addEventListener('DOMContentLoaded', () => {
    initLobby();
    initUploadZone();
    initSubmit();
    initClearTasks();
    initTabs();
    initHistory();
    fetchCredits();
    initPromptCounter();
    initResetButtons();
    initKeyboardShortcuts();
    initBreadcrumb();
});

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
    $$('.lobby-card').forEach(card => {
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

    // Populate model chips from template
    populateModelChips(cat);

    // Reset state
    selectedModel = null;
    clearFile();
    els.configPrompt.value = '';
    updateSubmitState();
    hideParamsPanel();
}

function exitWorkspace() {
    els.appMain.classList.add('hidden');
    els.lobby.classList.remove('hidden', 'exit');
    els.headerBreadcrumb.innerHTML = '';
    selectedModel = null;
    currentCatLabel = '';
    clearFile();
    // Reset model strip
    if (els.masEmpty && els.masModel) {
        els.masEmpty.classList.remove('hidden');
        els.masModel.classList.add('hidden');
    }
}

function populateModelChips(cat) {
    const tpl = document.getElementById('tpl-models');
    if (!tpl || !els.modelSelectorGrid) return;
    els.modelSelectorGrid.innerHTML = '';

    const items = tpl.content.querySelectorAll(`[data-cat="${cat}"]`);
    items.forEach(item => {
        const chip = document.createElement('button');
        chip.className = 'model-chip';
        chip.dataset.model = item.dataset.model;
        chip.dataset.input = item.dataset.input;
        chip.dataset.field = item.dataset.field || '';
        chip.dataset.shortcut = item.dataset.shortcut || '';
        chip.dataset.mjType = item.dataset.mjType || '';
        chip.dataset.prompt = item.dataset.prompt || '';
        chip.dataset.desc = item.dataset.desc || ''; // Meta desc
        chip.innerHTML = `<div class="mc-icon ${item.dataset.color}">${item.dataset.icon}</div><span class="model-chip-name">${item.dataset.name}</span>`;
        chip.addEventListener('click', () => selectModelChip(chip, item));
        els.modelSelectorGrid.appendChild(chip);
    });

    // Auto-select first with a small delay to ensure DOM is ready
    setTimeout(() => {
        const first = els.modelSelectorGrid.querySelector('.model-chip');
        if (first) first.click();
    }, 50);
}

function hideParamsPanel() {
    if (els.paramsEmpty) {
        els.paramsEmpty.innerHTML = '<div style="opacity:0.2; transform:scale(1.2); margin-bottom:12px"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2"/></svg></div><p>Selecione um modelo para ver os parâmetros disponíveis.</p>';
        els.paramsEmpty.classList.remove('hidden');
    }
    els.configParams.innerHTML = '';
    const costEl = document.getElementById('config-cost-tag');
    if (costEl) costEl.classList.add('hidden');
    if (els.btnResetParams) els.btnResetParams.classList.add('hidden');
}

function selectModelChip(chip, dataEl) {
    els.modelSelectorGrid.querySelectorAll('.model-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    selectedModel = {
        model: dataEl.dataset.model,
        input: dataEl.dataset.input,
        field: dataEl.dataset.field || 'image',
        shortcut: dataEl.dataset.shortcut || null,
        mjType: dataEl.dataset.mjType || null,
        hasPrompt: dataEl.dataset.prompt === 'true',
    };

    // Update context desc
    if (els.modelContextDesc) {
        els.modelContextDesc.textContent = dataEl.dataset.desc || '';
    }

    // Update header breadcrumb: / Category / Model Name
    els.headerBreadcrumb.innerHTML = `<span class="breadcrumb-sep">/</span> ${currentCatLabel} <span class="breadcrumb-sep">/</span> <span class="breadcrumb-active">${dataEl.dataset.name}</span>`;

    // Populate model active strip
    if (els.masEmpty && els.masModel) {
        els.masEmpty.classList.add('hidden');
        els.masModel.classList.remove('hidden');
        els.masIcon.textContent = dataEl.dataset.icon;
        els.masIcon.className = `mas-icon ${dataEl.dataset.color}`;
        els.masName.textContent = dataEl.dataset.name;
        els.masProvider.textContent = dataEl.dataset.provider;
    }

    // Populate right panel config header
    els.configIcon.textContent = dataEl.dataset.icon;
    els.configIcon.className = `mc-icon ${dataEl.dataset.color}`;
    els.configName.textContent = dataEl.dataset.name;
    els.configProvider.textContent = dataEl.dataset.provider;

    // Cost
    const costEl = document.getElementById('config-cost-tag');
    const cost = getModelCost(selectedModel.model);
    updateCostBadge(costEl, cost, 'config-cost-tag', 'créditos');
    updateCostBadge(els.masCost, cost, 'mas-cost', 'cr');

    const isMj = selectedModel.input === 'mj';
    const needsFile = selectedModel.input === 'file' || (isMj && selectedModel.mjType !== 'mj_txt2img');
    const needsPrompt = selectedModel.input === 'text' || isMj || selectedModel.hasPrompt;

    els.configPromptGrp.classList.toggle('hidden', !needsPrompt);
    els.uploadWrapper.classList.toggle('hidden', !needsFile);

    if (els.mjAr) els.mjAr.classList.toggle('hidden', !isMj);
    if (els.mjSpeed) els.mjSpeed.classList.toggle('hidden', !isMj);
    if (els.mjVersion) els.mjVersion.classList.toggle('hidden', !isMj);

    if (selectedModel.field === 'video_url') els.fileInput.accept = 'video/*';
    else if (selectedModel.field === 'audio_url') els.fileInput.accept = 'audio/*';
    else els.fileInput.accept = 'image/*,video/*,audio/*';

    if (selectedModel.field === 'text') els.configPrompt.placeholder = 'Digite o texto para sintetizar...';
    else els.configPrompt.placeholder = 'Descreva o que deseja gerar...';

    // Render params in right panel
    renderModelParams(selectedModel.model);

    // Fix: Clear and update params empty state
    if (els.paramsEmpty) {
        const cfg = MODEL_CONFIGS[selectedModel.model];
        const hasParams = !!(cfg && cfg.params.length > 0);
        els.paramsEmpty.classList.toggle('hidden', hasParams);

        if (!hasParams) {
            // Static text to avoid HTML rendering bug
            els.paramsEmpty.innerHTML = `
                <div style="opacity:0.6;font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:0.1em">Zero-Config</div>
                <p style="margin-top:8px;font-size:11px;color:var(--text-muted)">Este modelo não possui configurações adicionais.</p>
            `;
        }
        if (els.btnResetParams) els.btnResetParams.classList.toggle('hidden', !hasParams);
    }

    // Hide extra JSON when proper params exist
    const cfg = MODEL_CONFIGS[selectedModel.model];
    if (cfg && cfg.params.length > 0) els.configExtraGrp.classList.add('hidden');
    else els.configExtraGrp.classList.remove('hidden');

    clearFile();
    updateSubmitState();
    if (needsPrompt) setTimeout(() => els.configPrompt.focus(), 150);
}

function initPromptCounter() {
    if (!els.configPrompt || !els.promptWordCount) return;
    const updateCount = () => {
        const val = els.configPrompt.value.trim();
        const words = val ? val.split(/\s+/).filter(Boolean).length : 0;
        els.promptWordCount.textContent = `${words} palavra${words !== 1 ? 's' : ''}`;
    };
    els.configPrompt.addEventListener('input', updateCount);
}

function initResetButtons() {
    if (els.btnClearPrompt) {
        els.btnClearPrompt.addEventListener('click', () => {
            els.configPrompt.value = '';
            els.configPrompt.focus();
            const words = 0;
            els.promptWordCount.textContent = `${words} palavra${words !== 1 ? 's' : ''}`;
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

function renderModelParams(modelKey) {
    els.configParams.innerHTML = '';
    const cfg = MODEL_CONFIGS[modelKey];
    if (!cfg || cfg.params.length === 0) return;

    cfg.params.forEach(p => {
        const group = document.createElement('div');
        group.className = 'form-group';

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

        } else if (p.type === 'text') {
            const inp = document.createElement('input');
            inp.type = 'text'; inp.className = 'form-input';
            inp.value = p.default || ''; inp.placeholder = p.label;
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
        if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files[0]);
    });
    els.fileInput.addEventListener('change', () => {
        if (els.fileInput.files.length) handleFileSelect(els.fileInput.files[0]);
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

function clearFile() {
    selectedFile = null; els.fileInput.value = '';
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

function updateSubmitState() {
    if (!selectedModel) { els.btnSubmit.disabled = true; return; }
    const isMj = selectedModel.input === 'mj';
    const needsFile = selectedModel.input === 'file' || (isMj && selectedModel.mjType !== 'mj_txt2img');
    const needsPrompt = selectedModel.input === 'text' || isMj;
    let ok = true;
    if (needsFile && !selectedFile) ok = false;
    // Prompt is required for text-only & MJ, but optional for file+prompt models
    if (needsPrompt && !selectedModel.hasPrompt && !els.configPrompt.value.trim()) ok = false;
    els.btnSubmit.disabled = !ok;
}

function initSubmit() {
    els.btnSubmit.addEventListener('click', handleSubmit);
    els.configPrompt.addEventListener('input', updateSubmitState);
}

async function handleSubmit() {
    if (!selectedModel || els.btnSubmit.disabled) return;
    els.btnSubmit.classList.add('loading'); els.btnSubmit.disabled = true;
    try {
        let response;
        if (selectedModel.input === 'mj') response = await submitMJ();
        else if (selectedModel.shortcut === 'recraft-rmbg') response = await submitShortcut('/api/shortcuts/recraft-rmbg', 'images');
        else if (selectedModel.shortcut === 'topaz-upscale') response = await submitShortcut('/api/shortcuts/topaz-upscale', 'videos');
        else if (selectedModel.input === 'file') response = await submitFileModel();
        else response = await submitTextModel();
        if (response) {
            toast('✅ Tarefa criada!', 'success');
            clearFile(); els.configPrompt.value = ''; updateSubmitState();
        }
    } catch (err) {
        toast(`❌ Erro: ${err.message}`, 'error');
    } finally { els.btnSubmit.classList.remove('loading'); updateSubmitState(); }
}

async function submitShortcut(endpoint, uploadPath) {
    const fd = new FormData();
    fd.append('file', selectedFile); fd.append('uploadPath', uploadPath);
    const resp = await fetch(`${API}${endpoint}`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || 'Failed');
    const taskId = json?.data?.taskId;
    if (taskId) addTask(taskId, selectedModel.model, 'market');
    return json;
}

async function submitFileModel() {
    const fd = new FormData();
    fd.append('file', selectedFile);
    fd.append('model', selectedModel.model);
    fd.append('file_field', selectedModel.field);
    fd.append('uploadPath', 'uploads');
    const prompt = els.configPrompt.value.trim();
    let extra = collectModelParams();
    if (prompt) extra.prompt = prompt;
    // Merge manual JSON if visible
    if (!els.configExtraGrp.classList.contains('hidden')) {
        try { Object.assign(extra, JSON.parse(els.configExtraJson.value.trim() || '{}')); } catch { }
    }
    fd.append('input_json', JSON.stringify(extra));
    const resp = await fetch(`${API}/api/process`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || 'Failed');
    const taskId = json?.task?.data?.taskId;
    if (taskId) addTask(taskId, selectedModel.model, 'market');
    return json;
}

async function submitTextModel() {
    const prompt = els.configPrompt.value.trim();
    let extra = collectModelParams();
    if (selectedModel.field === 'text') extra.text = prompt;
    else extra.prompt = prompt;
    // Merge manual JSON
    if (!els.configExtraGrp.classList.contains('hidden')) {
        try { Object.assign(extra, JSON.parse(els.configExtraJson.value.trim() || '{}')); } catch { }
    }
    const fd = new FormData();
    fd.append('model', selectedModel.model);
    fd.append('input_json', JSON.stringify(extra));
    const resp = await fetch(`${API}/api/market/create-json`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || 'Failed');
    const taskId = json?.data?.taskId;
    if (taskId) addTask(taskId, selectedModel.model, 'market');
    return json;
}

async function submitMJ() {
    const prompt = els.configPrompt.value.trim();
    const ar = document.querySelector('input[name="mj-ar"]:checked')?.value || '1:1';
    const speed = document.querySelector('input[name="mj-speed"]:checked')?.value || 'relaxed';
    const version = document.querySelector('input[name="mj-version"]:checked')?.value || '7';
    const payload = { taskType: selectedModel.mjType, speed, prompt, aspectRatio: ar, version };
    const fd = new FormData();
    fd.append('payload_json', JSON.stringify(payload));
    const resp = await fetch(`${API}/api/mj/generate`, { method: 'POST', body: fd });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.detail || 'Failed');
    const taskId = json?.data?.taskId;
    if (taskId) addTask(taskId, `MJ ${selectedModel.mjType}`, 'midjourney');
    return json;
}

// ==================== Task Management ====================

function addTask(taskId, model, mode) {
    const promptText = els.configPrompt?.value?.trim() || '';
    const task = { id: taskId, model, mode, state: 'processing', data: null, pollTimer: null, _prompt: promptText };
    tasks.unshift(task);
    renderTaskCard(task);
    startPolling(task);
    updateTasksEmpty();
    updateActiveCount();

    // Pulse feedback on active tab
    const activeTabBtn = document.querySelector('.panel-tab[data-tab="active"]');
    if (activeTabBtn) {
        activeTabBtn.classList.remove('tab-pulse');
        void activeTabBtn.offsetWidth; // Trigger reflow
        activeTabBtn.classList.add('tab-pulse');
    }
}

function startPolling(task) {
    let pollErrors = 0;
    const MAX_POLL_ERRORS = 5;
    const poll = async () => {
        try {
            const ep = task.mode === 'midjourney' ? `/api/mj/task/${task.id}` : `/api/market/task/${task.id}`;
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
                const st = (data.status || data.state || '').toLowerCase();
                if (['success', 'succeeded', 'completed', 'done'].includes(st) || data.resultUrls) state = 'success';
                else if (['fail', 'failed', 'error'].includes(st)) state = 'fail';
                else state = 'processing';
            } else { state = data.state || 'processing'; }
            task.state = state;
            updateTaskCard(task);
            if (state === 'success' || state === 'fail') {
                clearInterval(task.pollTimer); task.pollTimer = null;
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
        tasks.forEach(t => { if (t.pollTimer) clearInterval(t.pollTimer); });
        tasks = [];
        els.tasksList.querySelectorAll('.task-card').forEach(el => el.remove());
        updateTasksEmpty();
        updateActiveCount();
    });
}

// ==================== Task Card Rendering ====================

function renderTaskCard(task) {
    const el = document.createElement('div');
    el.className = 'task-card'; el.id = `task-${CSS.escape(task.id)}`;
    el.innerHTML = `
        <div class="task-card-header">
            <div class="task-card-left">
                <div class="task-status-dot ${task.state}"></div>
                <div class="task-card-info">
                    <span class="task-card-model">${esc(task.model)}</span>
                    <span class="task-card-id">${esc(task.id)}</span>
                </div>
            </div>
            <span class="task-card-badge ${task.state}">${badgeLabel(task.state)}</span>
        </div>
        <div class="task-progress-bar ${task.state === 'processing' ? 'indeterminate' : ''}">
            <div class="task-progress-bar-fill" style="width:${task.state === 'success' ? '100' : '0'}%"></div>
        </div>
        <div class="task-result" data-task-result="${esc(task.id)}"></div>`;
    els.tasksList.insertBefore(el, els.tasksEmpty.nextSibling);
}

function updateTaskCard(task) {
    const card = document.getElementById(`task-${CSS.escape(task.id)}`);
    if (!card) return;
    card.querySelector('.task-status-dot').className = `task-status-dot ${task.state}`;
    const badge = card.querySelector('.task-card-badge');
    badge.className = `task-card-badge ${task.state}`;
    badge.textContent = badgeLabel(task.state);
    const bar = card.querySelector('.task-progress-bar');
    const fill = card.querySelector('.task-progress-bar-fill');
    if (task.state === 'processing') { bar.classList.add('indeterminate'); fill.style.width = '30%'; }
    else { bar.classList.remove('indeterminate'); fill.style.width = task.state === 'success' ? '100%' : '0%'; }
    if (task.state === 'success' || task.state === 'fail') renderTaskResult(task);
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
    const urls = [];
    if (typeof data.output === 'string') urls.push(data.output);
    if (data.resultUrl) urls.push(data.resultUrl);
    if (data.downloadUrl) urls.push(data.downloadUrl);
    if (Array.isArray(data.resultUrls)) urls.push(...data.resultUrls);
    if (Array.isArray(data.output)) urls.push(...data.output);
    // Parse resultJson (API may return it as a JSON string)
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
    const unique = [...new Set(urls.filter(u => typeof u === 'string' && u.startsWith('http')))];
    if (unique.length > 0) {
        const url = unique[0];
        const isVid = /\.(mp4|mov|webm|avi)($|\?)/i.test(url);
        const isAud = /\.(mp3|wav|ogg|aac)($|\?)/i.test(url);
        html += '<div class="task-result-media">';
        if (isVid) html += `<video src="${esc(url)}" controls preload="metadata" style="width:100%"></video>`;
        else if (isAud) html += `<audio src="${esc(url)}" controls style="width:100%"></audio>`;
        else html += `<img src="${esc(url)}" alt="Result" loading="lazy">`;
        html += '</div>';
        html += '<div class="task-result-actions">';
        unique.forEach((u, i) => {
            html += `<a href="${esc(u)}" target="_blank" class="btn-download">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ${unique.length > 1 ? `Download ${i + 1}` : 'Download'}</a>`;
        });
        html += '</div>';
    }
    // Cost/time info for completed tasks
    if (data.costTime) {
        html += `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">⏱ ${(data.costTime / 1000).toFixed(1)}s</div>`;
    }
    html += `<details style="margin-top:4px"><summary style="font-size:11px;color:var(--text-muted);cursor:pointer">Ver JSON</summary><div class="task-result-json">${esc(JSON.stringify(task.data, null, 2))}</div></details>`;
    container.innerHTML = html;
}

function badgeLabel(s) {
    return { processing: 'Processando', success: 'Concluído', fail: 'Falhou', error: 'Erro' }[s] || s;
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
    const processing = tasks.filter(t => t.state === 'processing').length;
    if (els.activeCount) els.activeCount.textContent = processing;
    if (els.activeCount) els.activeCount.classList.toggle('hidden', processing === 0);
}

function updateHistoryCount() {
    const count = loadHistory().length;
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
            if (!confirm('Limpar todo o histórico de gerações?')) return;
            saveHistory([]);
            renderHistoryGallery();
            updateHistoryCount();
            toast('🗑️ Histórico limpo', 'info');
        });
    }
}

function renderHistoryGallery() {
    if (!els.historyGallery) return;
    const history = loadHistory();
    const filterModel = els.historyFilter?.value || '';

    // Populate model filter dropdown
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

    // Filter
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
        const isVid = /\.(mp4|mov|webm|avi)($|\?)/i.test(url);
        const isAud = /\.(mp3|wav|ogg|aac)($|\?)/i.test(url);

        let thumbHtml;
        if (isVid) {
            thumbHtml = `<video src="${esc(url)}" muted preload="metadata" class="history-thumb-media"></video>
                         <div class="history-play-icon">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
                         </div>`;
        } else if (isAud) {
            thumbHtml = `<div class="history-thumb-audio">
                             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                                 <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                             </svg>
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
        const modelShort = entry.model.split('/').pop();

        card.innerHTML = `
            <div class="history-thumb">${thumbHtml}</div>
            <div class="history-meta">
                <span class="history-model">${esc(modelShort)}</span>
                <span class="history-time">${esc(timeStr)}</span>
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
    if (isVid) mediaHtml = `<video src="${esc(url)}" controls autoplay preload="auto" class="lightbox-media"></video>`;
    else if (isAud) mediaHtml = `<audio src="${esc(url)}" controls autoplay class="lightbox-audio"></audio>`;
    else if (url) mediaHtml = `<img src="${esc(url)}" alt="Result" class="lightbox-media">`;
    else mediaHtml = '<p style="color:var(--text-muted)">Sem mídia disponível</p>';

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
