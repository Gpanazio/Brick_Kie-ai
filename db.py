"""
db.py — PostgreSQL persistence layer for Kie-AI history.

Uses a ThreadedConnectionPool so all existing sync FastAPI endpoints
can call these helpers without any async changes.
"""

import json
import logging
import os
from contextlib import contextmanager

import psycopg2
import psycopg2.pool
from psycopg2.extras import RealDictCursor

logger = logging.getLogger(__name__)

_pool: psycopg2.pool.ThreadedConnectionPool | None = None

HISTORY_MAX = 500  # hard cap kept for import/insert guard


# ==================== Connection Pool ====================


def _build_pool() -> psycopg2.pool.ThreadedConnectionPool:
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    return psycopg2.pool.ThreadedConnectionPool(1, 10, url)


def get_pool() -> psycopg2.pool.ThreadedConnectionPool:
    global _pool
    if _pool is None:
        _pool = _build_pool()
        _init_schema()
    return _pool


@contextmanager
def _conn():
    """Yield a connection from the pool, returning it on exit."""
    p = get_pool()
    conn = p.getconn()
    try:
        yield conn
    except Exception:
        conn.rollback()
        raise
    finally:
        p.putconn(conn)


# ==================== Schema Init ====================


def _init_schema() -> None:
    """Create the kie_history table if it does not exist."""
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS kie_history (
                    id          TEXT PRIMARY KEY,
                    model       TEXT        DEFAULT '',
                    state       TEXT        DEFAULT '',
                    cat         TEXT        DEFAULT '',
                    urls        JSONB       DEFAULT '[]'::jsonb,
                    prompt      TEXT        DEFAULT '',
                    ts          TEXT,
                    local_urls  JSONB       DEFAULT '[]'::jsonb,
                    meta        JSONB       DEFAULT '{}'::jsonb,
                    created_at  TIMESTAMPTZ DEFAULT NOW()
                )
            """)
            # Migrations for existing tables
            cur.execute("""
                ALTER TABLE kie_history
                ADD COLUMN IF NOT EXISTS local_urls JSONB DEFAULT '[]'::jsonb
            """)
            cur.execute("""
                ALTER TABLE kie_history
                ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb
            """)
        conn.commit()
    logger.info("[db] Schema ready")


# ==================== CRUD ====================


def upsert_entry(entry: dict) -> None:
    """Insert or update a history entry (keyed by id)."""
    # Collect extra fields into meta blob (inputFileUrl, extraParams, coverUrl, etc.)
    core_keys = {"id", "model", "state", "cat", "urls", "prompt", "timestamp"}
    meta = {k: v for k, v in entry.items() if k not in core_keys and v is not None}

    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO kie_history (id, model, state, cat, urls, prompt, ts, meta)
                VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s, %s::jsonb)
                ON CONFLICT (id) DO UPDATE SET
                    model  = EXCLUDED.model,
                    state  = EXCLUDED.state,
                    cat    = EXCLUDED.cat,
                    urls   = EXCLUDED.urls,
                    prompt = EXCLUDED.prompt,
                    ts     = EXCLUDED.ts,
                    meta   = EXCLUDED.meta
                """,
                (
                    entry.get("id"),
                    entry.get("model", ""),
                    entry.get("state", ""),
                    entry.get("cat", ""),
                    json.dumps(entry.get("urls", [])),
                    entry.get("prompt", ""),
                    entry.get("timestamp"),
                    json.dumps(meta),
                ),
            )
        conn.commit()


def load_history(cat: str | None = None, limit: int = 100) -> list[dict]:
    """Return history rows ordered newest-first."""
    limit = min(limit, HISTORY_MAX)
    with _conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if cat:
                cur.execute(
                    """
                    SELECT id, model, state, cat, urls, prompt, ts AS "timestamp", local_urls, meta
                    FROM kie_history
                    WHERE cat = %s
                    ORDER BY COALESCE(
                        CASE
                            WHEN ts ~ '^[0-9]+$' AND length(ts) >= 13 THEN to_timestamp(ts::bigint / 1000.0)
                            WHEN ts ~ '^[0-9]+$' THEN to_timestamp(ts::bigint)
                            ELSE NULL
                        END,
                        created_at
                    ) DESC
                    LIMIT %s
                    """,
                    (cat, limit),
                )
            else:
                cur.execute(
                    """
                    SELECT id, model, state, cat, urls, prompt, ts AS "timestamp", local_urls, meta
                    FROM kie_history
                    ORDER BY COALESCE(
                        CASE
                            WHEN ts ~ '^[0-9]+$' AND length(ts) >= 13 THEN to_timestamp(ts::bigint / 1000.0)
                            WHEN ts ~ '^[0-9]+$' THEN to_timestamp(ts::bigint)
                            ELSE NULL
                        END,
                        created_at
                    ) DESC
                    LIMIT %s
                    """,
                    (limit,),
                )
            rows = cur.fetchall()

    result = []
    for r in rows:
        entry = dict(r)
        # urls is already a Python list when coming from JSONB
        if isinstance(entry.get("urls"), str):
            entry["urls"] = json.loads(entry["urls"])
        # Merge meta fields back into the entry (inputFileUrl, extraParams, etc.)
        meta = entry.pop("meta", None)
        if isinstance(meta, dict):
            entry.update(meta)
        result.append(entry)
    return result


def count_history(cat: str | None = None) -> int:
    """Return total history count, optionally filtered by category."""
    with _conn() as conn:
        with conn.cursor() as cur:
            if cat:
                cur.execute("SELECT COUNT(*) FROM kie_history WHERE cat = %s", (cat,))
            else:
                cur.execute("SELECT COUNT(*) FROM kie_history")
            return cur.fetchone()[0]


def delete_entry(entry_id: str) -> None:
    """Delete a single history entry by id."""
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM kie_history WHERE id = %s", (entry_id,))
        conn.commit()


def clear_history(cat: str | None = None) -> None:
    """Delete all (or category-filtered) history entries."""
    with _conn() as conn:
        with conn.cursor() as cur:
            if cat:
                cur.execute("DELETE FROM kie_history WHERE cat = %s", (cat,))
            else:
                cur.execute("DELETE FROM kie_history")
        conn.commit()


def entry_exists(entry_id: str) -> bool:
    """Check if an entry already exists in the DB."""
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM kie_history WHERE id = %s LIMIT 1", (entry_id,))
            return cur.fetchone() is not None


def update_local_urls(entry_id: str, local_urls: list[str]) -> None:
    """Update the local_urls for an entry after media download."""
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE kie_history SET local_urls = %s::jsonb WHERE id = %s",
                (json.dumps(local_urls), entry_id),
            )
        conn.commit()


def entries_needing_backfill(limit: int = 50) -> list[dict]:
    """Return entries that have KIE URLs but no local copies yet."""
    with _conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, urls
                FROM kie_history
                WHERE urls != '[]'::jsonb
                  AND (local_urls IS NULL OR local_urls = '[]'::jsonb)
                  AND state = 'success'
                ORDER BY created_at DESC
                LIMIT %s
                """,
                (limit,),
            )
            return [dict(r) for r in cur.fetchall()]
