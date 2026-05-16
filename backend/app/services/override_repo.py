"""Active overrides + feedback persistence."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Feedback, Override

DEFAULT_TTL_HOURS = 24


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


async def add_override(
    session: AsyncSession,
    *,
    parcel_id: int,
    field: str,
    text_value: str,
    num_value: float | None = None,
    source: str = "whatsapp",
    confidence: float = 1.0,
    ttl_hours: int = DEFAULT_TTL_HOURS,
) -> Override:
    """Store a farmer-reported correction with a TTL."""
    row = Override(
        parcel_id=parcel_id,
        field=field,
        farmer_value_text=text_value,
        farmer_value_num=num_value,
        source=source,
        confidence=confidence,
        expires_at=_now() + timedelta(hours=ttl_hours),
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return row


async def active_overrides(
    session: AsyncSession, parcel_id: int,
) -> list[Override]:
    stmt = (
        select(Override)
        .where(Override.parcel_id == parcel_id, Override.expires_at > _now())
        .order_by(Override.created_at.desc())
    )
    rows = (await session.execute(stmt)).scalars().all()
    # If two overrides on the same field, the newest wins. Dedupe.
    seen: dict[str, Override] = {}
    for r in rows:
        seen.setdefault(r.field, r)
    return list(seen.values())


async def overrides_as_dict(
    session: AsyncSession, parcel_id: int,
) -> dict[str, dict[str, Any]]:
    """Return {field: {text, num, expires_at_iso, hours_left}} for the decision engine."""
    rows = await active_overrides(session, parcel_id)
    out: dict[str, dict[str, Any]] = {}
    for r in rows:
        delta = r.expires_at - _now()
        hours_left = max(0, int(delta.total_seconds() / 3600))
        out[r.field] = {
            "text": r.farmer_value_text,
            "num": r.farmer_value_num,
            "source": r.source,
            "expires_at": r.expires_at.isoformat(),
            "hours_left": hours_left,
        }
    return out


async def add_feedback(
    session: AsyncSession,
    *,
    parcel_id: int,
    vote: str,
    message_excerpt: str | None = None,
    note: str | None = None,
) -> Feedback:
    if vote not in {"up", "down"}:
        raise ValueError("vote must be 'up' or 'down'")
    row = Feedback(
        parcel_id=parcel_id,
        vote=vote,
        message_excerpt=message_excerpt,
        note=note,
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return row
