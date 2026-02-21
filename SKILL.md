# KIE AI Studio

Web UI + CLI para a API da **KIE.ai** — geração de imagens, vídeos, áudio e música via 30+ modelos de IA.

## Requisitos

- Python 3.10+
- `pip install -r requirements.txt`
- API key em variável de ambiente `KIE_API_KEY` (ou `KIE_API`)

## Rodando o servidor web

```bash
python server.py
```

Acesse `http://localhost:8420`. Porta configurável via `KIE_PORT`.

Para uso atrás de proxy reverso (ex: `/kie-ai`), defina `ROOT_PATH=/kie-ai`.

## Arquitetura

```
server.py        — FastAPI server (proxy para KIE API + serve frontend)
kie_api.py       — Cliente Python / CLI para todas as APIs KIE
frontend/
  index.html     — Interface web (lobby + workspace)
  app.js         — Lógica do frontend (model configs, polling, history)
  styles.css     — Estilos
```

## APIs suportadas

| API | Base URL | Uso |
|---|---|---|
| Market (Unified) | `https://api.kie.ai/api/v1/jobs/` | Modelos de imagem, vídeo, áudio via endpoint unificado |
| Midjourney | `https://api.kie.ai/api/v1/mj/` | txt2img, img2img, video, style ref |
| Veo 3.1 (Google) | `https://api.kie.ai/api/v1/veo/` | Text/image→video, extend, 1080p, 4K |
| Suno (Music) | `https://api.kie.ai/api/v1/generate/` | Música, letras, extend, cover, stems, WAV |
| File Upload | `https://kieai.redpandaai.co/api/` | Upload de arquivos (stream, base64, URL) |
| Common | `https://api.kie.ai/api/v1/common/` | Créditos, download URLs |

Bases configuráveis via `KIE_BASE_URL` e `KIE_UPLOAD_BASE_URL`.

## Modelos disponíveis no frontend

### Imagem
- **Nano Banana Pro** (Kie.ai) — text/image→image
- **Nano Banana Edit** (Google) — edição de imagem
- **ByteDance 4.5** — text→image
- **Flux-2 Pro** — text→image
- **Ideogram V3** — text→image
- **Qwen** — text→image
- **Grok Imagine** (xAI) — text→image, image→image

### Vídeo (Text→Video)
- **Sora 2 Pro** (OpenAI)
- **Kling 3.0** (Kling)
- **Wan 2.2 Turbo** (Wan)
- **Grok Video** (xAI)

### Vídeo (Image→Video)
- **Grok VidGen** (xAI)
- **Sora 2 Pro** (OpenAI)
- **Hailuo 2.3 Pro** (Hailuo)

### Veo 3.1 (Google)
- Text→Video (Fast / Quality)
- Image→Video (Fast / Quality)
- Extend, 1080p, 4K

### Áudio (ElevenLabs)
- TTS Turbo 2.5, Dialogue V3, Sound Effect V2
- Speech-to-Text, Audio Isolation

### Música (Suno)
- Criar Música (V3.5–V5), Criar Letras
- Editar Áudio (extend, instrumental, vocals, separação)
- Utilitários (music video, WAV, timestamped lyrics)

### Midjourney
- Text→Image, Image→Image, Video, Style Reference

### Tools
- **Recraft** — Remove BG, Crisp Upscale
- **Topaz** — Image Upscale, Video Upscale
- **Ideogram V3** — Reframe

## Endpoints do servidor (FastAPI)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Serve o frontend |
| GET | `/api/credits` | Créditos restantes |
| POST | `/api/upload` | Upload de arquivo |
| POST | `/api/market/create` | Criar task Market (form) |
| POST | `/api/market/create-json` | Criar task Market (JSON, sem file) |
| GET | `/api/market/task/{id}` | Status de task Market |
| POST | `/api/process` | Upload + criar task Market |
| POST | `/api/mj/generate` | Criar task Midjourney |
| GET | `/api/mj/task/{id}` | Status de task MJ |
| POST | `/api/suno/create` | Criar task Suno |
| GET | `/api/suno/task/{id}` | Status de task Suno |
| POST | `/api/veo/create` | Criar task Veo 3.1 |
| GET | `/api/veo/task/{id}` | Status de task Veo |
| GET | `/api/veo/1080p/{id}` | Veo 1080p |
| POST | `/api/veo/4k` | Veo 4K |
| POST | `/api/shortcuts/recraft-rmbg` | Upload + remove background |
| POST | `/api/shortcuts/topaz-upscale` | Upload + video upscale |

## CLI (kie_api.py)

```bash
# Créditos
python kie_api.py credits

# Market — criar task
python kie_api.py create --model sora-2-pro-text-to-video --input '{"prompt":"..."}'
python kie_api.py task <TASK_ID>
python kie_api.py wait <TASK_ID>

# Midjourney
python kie_api.py mj-generate --json '{"taskType":"mj_txt2img","speed":"relaxed","prompt":"...","aspectRatio":"16:9","version":"7"}'
python kie_api.py mj-task <TASK_ID>
python kie_api.py mj-wait <TASK_ID>

# Upload
python kie_api.py upload-stream --path "./image.png" --uploadPath "images"
python kie_api.py upload-url --fileUrl "https://example.com/img.jpg"

# Atalhos (upload + modelo)
python kie_api.py recraft-rmbg --path "./photo.png"
python kie_api.py topaz-upscale --path "./video.mp4" --factor 2
```

## Modelo assíncrono

Todas as gerações são assíncronas. O frontend faz polling a cada 5s. Estados:

- **Market**: `waiting` → `queuing` → `generating` → `success` / `fail`
- **Veo/Suno**: campo `status`
- **Midjourney**: `successFlag` (1=ok, >1=erro)

O frontend persiste tasks pendentes em `localStorage` e retoma polling ao recarregar.

## Referência completa

Ver [KIE_API_REFERENCE.md](./KIE_API_REFERENCE.md) para documentação detalhada de todos os endpoints, parâmetros e pricing.
