# KIE AI Studio

Interface visual para as APIs da [KIE.ai](https://kie.ai) — geração de imagens, vídeos, áudio, música e ferramentas de upscale em alta resolução.

---

## Contexto: Extração do Brick_Marketing

Este repositório foi extraído do monorepo `Brick_Marketing` onde o `kie-ai` vivia como subpasta e dependia fortemente do Node.js pai para funcionar. As principais mudanças realizadas durante a extração foram:

### O que foi removido
- **Prefix middleware `/kie-ai/`**: o servidor Python reescrevia as rotas `/kie-ai/*` para `/` pois o Node.js funcionava como proxy reverso. Isso foi eliminado — o servidor agora serve na raiz diretamente.
- **Dependência do Node.js**: todo o proxy (`/kie-ai/*`), gerenciamento de histórico via PostgreSQL, callback de webhooks e spawning do processo Python ficavam no `server.js` do Node. Nada disso existe mais aqui.
- **Socket.IO**: o frontend usava Socket.IO (gerenciado pelo Node.js) para receber atualizações em tempo real. Foi substituído por **SSE (Server-Sent Events)** nativo do browser — mais simples, sem dependência extra.
- **Código morto**: scripts de patch one-off (`patch_index_logos.py`, `patch_cards.py`, `replace_colors.py`), documentos internos (`REVIEW_KIE_AI.md`, `SKILL.md`) e `import_history.py` foram deletados.

### O que foi adicionado
- **Endpoint SSE** (`GET /api/events`): substitui o Socket.IO. O frontend conecta via `EventSource` e recebe eventos `kie:task-update` quando uma tarefa é concluída.
- **Webhook callback** (`POST /api/kie-callback`): recebe callbacks da KIE.ai diretamente (antes chegavam no Node.js e eram repassados via Socket.IO). Suporta verificação HMAC opcional via `KIE_WEBHOOK_KEY`.
- **Config endpoint atualizado** (`GET /api/config`): retorna `{ apiKey }` — antes retornava `{}` e o Node.js interceptava para injetar a chave.
- **Arquivos de deploy**: `Procfile`, `railway.toml`, `.env.example`, `README.md`.

### Mudanças no frontend
| Antes | Depois |
|---|---|
| `const API = '/kie-ai'` | `const API = ''` |
| `<script src="/socket.io/socket.io.js">` | removido |
| `io().on('kie:task-update', ...)` | `new EventSource('/api/events')` |
| `/kie-ai/static/style-v2.css` | `/static/style-v2.css` |
| `/kie-ai/static/app.js` | `/static/app.js` |

---

## Stack

- **Backend**: Python (FastAPI + Uvicorn)
- **Frontend**: Vanilla JS + HTML + CSS
- **Real-time**: SSE (Server-Sent Events)
- **Histórico**: PostgreSQL (via `psycopg2` connection pool)
- **Media Storage**: Railway Volume (`/history/media/`) com download automático
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

## Testes

```bash
source .venv/bin/activate
pytest tests/ -v
```

## Variáveis de Ambiente

| Variável | Descrição | Default |
|---|---|---|
| `KIE_API_KEY` | Chave da API KIE.ai **(obrigatória)** | — |
| `DATABASE_URL` | Connection string PostgreSQL **(obrigatória em produção)** | — |
| `KIE_PORT` | Porta do servidor | `8420` |
| `API_KEY` | Chave de autenticação do frontend | `brick-squad-2026` |
| `KIE_CALLBACK_URL` | URL pública para webhooks da KIE (ex: `https://seu-app.up.railway.app/api/kie-callback`) | — |
| `KIE_WEBHOOK_KEY` | HMAC key para verificar assinatura dos webhooks (opcional) | — |
| `MEDIA_DIR` | Diretório para armazenar mídia baixada | `/history/media` |
| `ROOT_PATH` | Subpath para reverse proxy (se aplicável) | `""` |

## Estrutura

```
Brick_Kie-ai/
├── server.py              # FastAPI server standalone
├── kie_api.py             # KIE.ai API client
├── db.py                  # PostgreSQL persistence layer (connection pool + CRUD)
├── storage.py             # Media download & local serving (Railway volume)
├── requirements.txt       # Python deps (inclui pytest + httpx + psycopg2)
├── Procfile               # web: python server.py
├── railway.toml           # Config de deploy
├── .env.example           # Template de variáveis
├── frontend/
│   ├── index.html         # HTML principal
│   ├── app.js             # Lógica do frontend (SSE, modelos, upload)
│   └── style-v2.css       # Estilos
├── KIE_API_REFERENCE.md   # Referência completa da API KIE.ai
└── tests/
    └── test_server.py     # Testes pytest
```

## Deploy (Railway)

1. Criar novo projeto no Railway → conectar este repo (`Brick_Kie-ai`)
2. Adicionar variáveis de ambiente:
   - `KIE_API_KEY` (obrigatória)
   - `KIE_CALLBACK_URL` = `https://<seu-dominio>/api/kie-callback`
   - `API_KEY` (opcional, chave de login do frontend)
3. Railway detecta o `Procfile` e o `railway.toml` automaticamente
4. Deploy é iniciado via `python server.py`

> **Nota:** O histórico é persistido no PostgreSQL (Railway Postgres plugin). Para mídia local, configure um Volume montado em `/history/media` (definido por `MEDIA_DIR`).
