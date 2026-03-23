# KIE AI Studio

Interface visual para as APIs da [KIE.ai](https://kie.ai) — geração de imagens, vídeos, áudio, música e ferramentas de upscale.

## Stack

- **Backend**: Python (FastAPI + Uvicorn)
- **Frontend**: Vanilla JS + HTML + CSS
- **Real-time**: SSE (Server-Sent Events)
- **API**: KIE.ai Market API

## Setup Local

```bash
# 1. Criar ambiente virtual
python3 -m venv .venv
source .venv/bin/activate

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Configurar .env
cp .env.example .env
# Editar .env com sua KIE_API_KEY

# 4. Rodar
python server.py
# Acesse http://localhost:8420
```

## Variáveis de Ambiente

| Variável | Descrição | Default |
|---|---|---|
| `KIE_API_KEY` | Chave da API KIE.ai (obrigatória) | — |
| `KIE_PORT` | Porta do servidor | `8420` |
| `API_KEY` | Chave de autenticação do frontend | `brick-squad-2026` |
| `KIE_CALLBACK_URL` | URL para receber webhooks da KIE | — |
| `KIE_WEBHOOK_KEY` | HMAC key para verificar webhooks | — |

## Estrutura

```
kie-ai/
├── server.py          # FastAPI server (standalone)
├── kie_api.py         # KIE.ai API client
├── requirements.txt   # Python deps
├── frontend/
│   ├── index.html     # Main HTML
│   ├── app.js         # Frontend logic
│   └── style-v2.css   # Styles
├── data/              # JSON history storage
└── tests/
    └── test_server.py # Pytest suite
```

## Deploy (Railway)

1. Criar novo projeto no Railway
2. Conectar este repo
3. Adicionar variáveis de ambiente (`KIE_API_KEY`, etc.)
4. Railway detecta o `Procfile` automaticamente
