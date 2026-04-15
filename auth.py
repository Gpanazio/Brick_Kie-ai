"""
auth.py — Autenticação JWT para KIE AI War Room.
Usa a tabela master_users compartilhada com o ecossistema BRICK (brickreview, etc).
"""

import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import jwt
import psycopg2
import psycopg2.pool
from contextlib import contextmanager
from fastapi import APIRouter, Cookie, HTTPException, Request
from fastapi.responses import JSONResponse
from psycopg2.extras import RealDictCursor
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET: str = os.environ.get("JWT_SECRET", "brick-kie-dev-secret-change-me-prod-32b!")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

# ─── Conexão com o banco do Kie-ai (contém master_users + kie_history) ───────
_master_pool: psycopg2.pool.ThreadedConnectionPool | None = None

def _get_master_pool() -> psycopg2.pool.ThreadedConnectionPool:
    global _master_pool
    if _master_pool is None:
        url = os.environ.get("DATABASE_URL")
        if not url:
            raise RuntimeError("DATABASE_URL não configurada")
        # Força SSL para Railway
        if ("railway.net" in url or "railway.app" in url) and "sslmode" not in url:
            sep = "&" if "?" in url else "?"
            url = f"{url}{sep}sslmode=require"
        _master_pool = psycopg2.pool.ThreadedConnectionPool(1, 5, url)
        logger.info("[auth] DB pool criado")
    return _master_pool

@contextmanager
def _master_conn():
    pool = _get_master_pool()
    conn = pool.getconn()
    try:
        yield conn
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)

# ─── Paths that skip JWT auth ────────────────────────────────────────────────
PUBLIC_PATHS: set[str] = {"/", "/login", "/favicon.ico", "/api/kie-callback"}
PUBLIC_PREFIXES: tuple[str, ...] = ("/static/", "/media/", "/api/auth/")


# ==================== Helpers ====================


def _get_user(username: str) -> Optional[dict]:
    """Busca usuário na tabela master_users pelo username."""
    with _master_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, email, username, password_hash, role "
                "FROM master_users WHERE username = %s",
                (username,),
            )
            row = cur.fetchone()
            return dict(row) if row else None


def _create_token(user: dict) -> str:
    """Gera um JWT com os dados do usuário."""
    payload = {
        "id": str(user["id"]),
        "email": user.get("email", ""),
        "username": user["username"],
        "role": user.get("role", "client"),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decodifica e valida um JWT. Levanta HTTPException se inválido."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado. Faça login novamente.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Token inválido.")


def extract_token(request: Request) -> Optional[str]:
    """Extrai token do cookie httpOnly ou do header Authorization."""
    token = request.cookies.get("token")
    if not token:
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    return token or None


def is_protected(path: str) -> bool:
    """Retorna True se o path precisa de autenticação."""
    if path in PUBLIC_PATHS:
        return False
    if any(path.startswith(p) for p in PUBLIC_PREFIXES):
        return False
    if path.startswith("/api/"):
        return True
    return False


# ==================== Routes ====================


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login(body: LoginRequest, response: JSONResponse = None):
    """
    Autentica usuário e seta cookie httpOnly com JWT.
    Usa a tabela master_users (compartilhada com brickreview).
    """
    if not body.username or not body.password:
        raise HTTPException(status_code=400, detail="Username e senha são obrigatórios")

    logger.info("[auth] Tentativa de login: %s", body.username)

    # Busca usuário
    try:
        user = _get_user(body.username)
    except Exception as e:
        logger.error("[auth] Erro ao buscar usuário: %s", e)
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco de dados")

    if not user:
        logger.warning("[auth] Usuário não encontrado: %s", body.username)
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    if not user.get("password_hash"):
        logger.error("[auth] Usuário sem password_hash: %s", body.username)
        raise HTTPException(status_code=500, detail="Erro de integridade de dados")

    # Verifica senha com bcrypt
    try:
        pwd_hash = user["password_hash"]
        if isinstance(pwd_hash, str):
            pwd_hash = pwd_hash.encode("utf-8")
        valid = bcrypt.checkpw(body.password.encode("utf-8"), pwd_hash)
    except Exception as e:
        logger.error("[auth] Erro ao verificar senha: %s", e)
        raise HTTPException(status_code=500, detail="Erro interno de autenticação")

    if not valid:
        logger.warning("[auth] Senha inválida para: %s", body.username)
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    # Gera token
    token = _create_token(user)
    logger.info("[auth] Login bem-sucedido: %s (role=%s)", body.username, user.get("role"))

    resp = JSONResponse(content={
        "user": {
            "id": str(user["id"]),
            "email": user.get("email", ""),
            "username": user["username"],
            "role": user.get("role", "client"),
        }
    })

    is_production = os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("NODE_ENV") == "production"
    resp.set_cookie(
        key="token",
        value=token,
        httponly=True,
        secure=bool(is_production),
        samesite="strict",
        max_age=JWT_EXPIRY_HOURS * 3600,
        path="/",
    )
    return resp


@router.get("/verify")
async def verify(request: Request):
    """Verifica se o token JWT no cookie (ou header) é válido."""
    token = extract_token(request)
    if not token:
        return JSONResponse({"valid": False}, status_code=401)

    try:
        user = decode_token(token)
        return {"valid": True, "user": user}
    except HTTPException:
        return JSONResponse({"valid": False}, status_code=401)


@router.post("/logout")
async def logout():
    """Limpa o cookie de autenticação."""
    resp = JSONResponse({"message": "Logout realizado com sucesso"})
    resp.delete_cookie(key="token", path="/")
    return resp
