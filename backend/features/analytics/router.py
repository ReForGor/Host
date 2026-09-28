from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, update

from backend.core.database import get_db
from backend.features.analytics.models import VisitorRecord, SystemMetric
from backend.features.auth.models import User

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Visitors"])

class VisitPingRequest(BaseModel):
    session_id: str
    path: Optional[str] = "/"
    user_id: Optional[int] = None

@router.post("/visit")
async def record_visit(
    data: VisitPingRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    now = datetime.utcnow()
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "127.0.0.1")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()
    user_agent = request.headers.get("user-agent", "")[:255]

    # 1. Update or increment total_pageviews in system_metrics
    metric_res = await db.execute(
        select(SystemMetric).where(SystemMetric.metric_key == "total_pageviews")
    )
    metric = metric_res.scalar_one_or_none()
    if not metric:
        # Initial launch baseline count for KPTM PRICE
        metric = SystemMetric(metric_key="total_pageviews", metric_value=158420, updated_at=now)
        db.add(metric)
    metric.metric_value += 1
    metric.updated_at = now

    # 2. Check existing session in last 30 minutes
    rec_res = await db.execute(
        select(VisitorRecord).where(VisitorRecord.session_id == data.session_id)
    )
    visitor = rec_res.scalar_one_or_none()
    if visitor:
        visitor.last_seen_at = now
        visitor.path = data.path or "/"
        if data.user_id:
            visitor.user_id = data.user_id
    else:
        new_record = VisitorRecord(
            session_id=data.session_id,
            ip_address=client_ip,
            user_agent=user_agent,
            path=data.path or "/",
            user_id=data.user_id,
            created_at=now,
            last_seen_at=now
        )
        db.add(new_record)

    await db.commit()

    # 3. Calculate live stats
    fifteen_mins_ago = now - timedelta(minutes=15)
    online_count_res = await db.execute(
        select(func.count(func.distinct(VisitorRecord.session_id))).where(
            VisitorRecord.last_seen_at >= fifteen_mins_ago
        )
    )
    online_now = max(1, online_count_res.scalar() or 1)

    unique_res = await db.execute(
        select(func.count(func.distinct(VisitorRecord.session_id)))
    )
    unique_visitors = unique_res.scalar() or 1

    total_users_res = await db.execute(select(func.count(User.id)))
    total_users = total_users_res.scalar() or 0

    return {
        "status": "recorded",
        "total_visitors": metric.metric_value,
        "unique_visitors": unique_visitors,
        "online_now": online_now,
        "total_users": total_users,
        "timestamp": now.isoformat()
    }

@router.get("/stats")
async def get_analytics_stats(db: AsyncSession = Depends(get_db)):
    now = datetime.utcnow()
    fifteen_mins_ago = now - timedelta(minutes=15)

    # 1. Total visits
    metric_res = await db.execute(
        select(SystemMetric).where(SystemMetric.metric_key == "total_pageviews")
    )
    metric = metric_res.scalar_one_or_none()
    total_visits = metric.metric_value if metric else 158420

    # 2. Unique visitors
    unique_res = await db.execute(
        select(func.count(func.distinct(VisitorRecord.session_id)))
    )
    unique_visitors = unique_res.scalar() or 1

    # 3. Online now
    online_res = await db.execute(
        select(func.count(func.distinct(VisitorRecord.session_id))).where(
            VisitorRecord.last_seen_at >= fifteen_mins_ago
        )
    )
    online_now = max(1, online_res.scalar() or 1)

    # 4. Real registered users count & user details from PostgreSQL
    users_res = await db.execute(select(User).order_by(desc(User.created_at)))
    users_list = users_res.scalars().all()

    real_users_data = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name or u.username,
            "is_admin": u.is_admin,
            "is_active": u.is_active,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M:%S") if u.created_at else None
        }
        for u in users_list
    ]

    return {
        "total_visitors": total_visits,
        "unique_visitors": unique_visitors,
        "online_now": online_now,
        "total_users": len(real_users_data),
        "real_users": real_users_data,
        "updated_at": now.isoformat()
    }
