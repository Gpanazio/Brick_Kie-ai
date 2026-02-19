# KIE AI — Skill (Market + MJ + Upload)

CLI em Python pra chamar a API da **KIE.ai**, do jeito “perfeito”: você aponta arquivo local e ele faz **upload → pega URL → chama o modelo**.

## Requisitos
- Python 3.10+
- `pip install -r requirements.txt`
- API key em variável de ambiente `KIE_API_KEY`

## Bases
- **Market/MJ:** `https://api.kie.ai`
- **Upload:** `https://kieai.redpandaai.co` (docs do File Upload API)

Você pode sobrescrever:
- `KIE_BASE_URL`
- `KIE_UPLOAD_BASE_URL`

---

## Upload (transforma arquivo local em URL)

### Upload local (stream)
```powershell
python .\kie_api.py upload-stream --path "C:\\path\\file.png" --uploadPath "images" 
```

### Upload a partir de uma URL
```powershell
python .\kie_api.py upload-url --fileUrl "https://exemplo.com/a.png" --uploadPath "images"
```

Docs (upload):
- https://docs.kie.ai/file-upload-api/quickstart.md
- https://docs.kie.ai/file-upload-api/upload-file-stream.md
- https://docs.kie.ai/file-upload-api/upload-file-url.md

---

## Market (Unified API)
Endpoints:
- `POST https://api.kie.ai/api/v1/jobs/createTask`
- `GET  https://api.kie.ai/api/v1/jobs/recordInfo?taskId=...`

Payload (Market):
```json
{ "model": "...", "callBackUrl": "https://...", "input": { } }
```

Exemplo:
```powershell
python .\kie_api.py create --model sora-2-pro-text-to-video --input '{"prompt":"..."}'
python .\kie_api.py wait <TASK_ID>
```

Docs (market):
- https://docs.kie.ai/market/quickstart
- https://docs.kie.ai/market/common/get-task-detail

---

## MJ API (Midjourney)
Endpoints:
- `POST https://api.kie.ai/api/v1/mj/generate`
- `GET  https://api.kie.ai/api/v1/mj/record-info?taskId=...`

Exemplo:
```powershell
python .\kie_api.py mj-generate --json '{"taskType":"mj_txt2img","speed":"relaxed","prompt":"...","aspectRatio":"16:9","version":"7"}'
```

Fonte dos params: https://kie.ai/model-preview/features/mj-api (aba API)

---

## Atalhos “perfeitos” (upload + modelo)

### Recraft remove background (arquivo local)
```powershell
python .\kie_api.py recraft-rmbg --path "C:\\path\\img.png"
```
Model: `recraft/remove-background`
Doc: https://docs.kie.ai/market/recraft/remove-background

### Topaz video upscale (arquivo local)
```powershell
python .\kie_api.py topaz-upscale --path "C:\\path\\video.mp4" --factor 2
```
Model: `topaz/video-upscale`
Doc: https://docs.kie.ai/market/topaz/video-upscale
