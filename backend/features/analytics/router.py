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
    metric = metric_res.scalars().first()
    if not metric:
        metric = SystemMetric(metric_key="total_pageviews", metric_value=0, updated_at=now)
        db.add(metric)
    metric.metric_value += 1
    metric.updated_at = now

    # 2. Check existing session in last 30 minutes
    rec_res = await db.execute(
        select(VisitorRecord).where(VisitorRecord.session_id == data.session_id)
    )
    visitor = rec_res.scalars().first()
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

    # 3. Calculate live stats (Real-time active window: 2 minutes)
    active_window = now - timedelta(minutes=2)
    online_count_res = await db.execute(
        select(func.count(func.distinct(VisitorRecord.session_id))).where(
            VisitorRecord.last_seen_at >= active_window
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

    # 1. Total visits
    metric_res = await db.execute(
        select(SystemMetric).where(SystemMetric.metric_key == "total_pageviews")
    )
    metric = metric_res.scalar_one_or_none()
    total_visits = metric.metric_value if metric else 0

    # 2. Unique visitors
    unique_res = await db.execute(
        select(func.count(func.distinct(VisitorRecord.session_id)))
    )
    unique_visitors = unique_res.scalar() or 1

    # 3. Online now (Real-time active window: 2 minutes)
    active_window = now - timedelta(minutes=2)
    online_res = await db.execute(
        select(func.count(func.distinct(VisitorRecord.session_id))).where(
            VisitorRecord.last_seen_at >= active_window
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


from collections import Counter, defaultdict
from sqlalchemy.orm import selectinload
from backend.features.products.models import Product, PriceListing, Store, PriceHistory

@router.get("/store-dominance")
@router.get("/market-summary")
async def get_store_dominance(db: AsyncSession = Depends(get_db)):
    """
    Computes Store Dominance Ranking, Price Consistency, Volatility Score, and Market Price Spreads
    across all 4 major IT stores (JIB, Advice, BaNANA, iHaveCPU).
    """
    store_res = await db.execute(select(Store).where(Store.is_active == True))
    stores = store_res.scalars().all()
    store_map = {s.id: s for s in stores}

    prod_res = await db.execute(
        select(Product)
        .options(
            selectinload(Product.listings).selectinload(PriceListing.store),
            selectinload(Product.price_histories)
        )
    )
    products = prod_res.scalars().all()

    total_products = len(products)
    win_counts = Counter()
    category_wins = defaultdict(Counter)
    spread_pcts = []
    spread_thbs = []
    category_spreads = defaultdict(list)
    category_cvs = defaultdict(list)

    trends = {"down": 0, "stable": 0, "up": 0}

    for prod in products:
        active_listings = [
            l for l in prod.listings 
            if l.is_available and l.price > 0 and l.store
        ]
        if not active_listings:
            continue

        sorted_listings = sorted(active_listings, key=lambda x: x.price)
        lowest_listing = sorted_listings[0]
        highest_listing = sorted_listings[-1]

        lowest_p = lowest_listing.price
        highest_p = highest_listing.price

        win_counts[lowest_listing.store_id] += 1
        category_wins[lowest_listing.store_id][prod.category] += 1

        spread_thb = max(0.0, highest_p - lowest_p)
        spread_pct = round((spread_thb / highest_p * 100), 2) if highest_p > 0 else 0.0

        spread_thbs.append(spread_thb)
        spread_pcts.append(spread_pct)
        category_spreads[prod.category].append(spread_pct)

        # Price history volatility
        hist_prices = [h.price for h in prod.price_histories]
        if len(hist_prices) > 1:
            mean_p = sum(hist_prices) / len(hist_prices)
            var_p = sum((x - mean_p) ** 2 for x in hist_prices) / (len(hist_prices) - 1)
            stdev_p = var_p ** 0.5
            cv = (stdev_p / mean_p) * 100 if mean_p > 0 else 0.0
            category_cvs[prod.category].append(cv)

        # Price trend
        if prod.msrp and lowest_p < prod.msrp * 0.95:
            trends["down"] += 1
        elif prod.msrp and lowest_p > prod.msrp * 1.02:
            trends["up"] += 1
        else:
            trends["stable"] += 1

    rankings = []
    for s_id, s in store_map.items():
        wins = win_counts[s_id]
        pct = round((wins / total_products * 100), 1) if total_products > 0 else 0.0
        top_cats = [c for c, _ in category_wins[s_id].most_common(3)]
        rankings.append({
            "store_id": s.id,
            "store_name": s.name,
            "store_slug": s.slug,
            "store_logo": s.logo_url,
            "store_color": s.color or "#06b6d4",
            "best_deal_count": wins,
            "best_deal_percentage": pct,
            "top_categories": top_cats
        })
    rankings.sort(key=lambda x: x["best_deal_count"], reverse=True)

    category_analysis = []
    for cat, pcts in category_spreads.items():
        avg_spread = round(sum(pcts) / len(pcts), 1) if pcts else 0.0
        cvs = category_cvs.get(cat, [])
        avg_cv = round(sum(cvs) / len(cvs), 2) if cvs else 0.0
        
        if avg_cv >= 6.0:
            vol_level = "High"
            vol_desc = "ความผันผวนสูง มีการลดราคาตัดราคากันชัดเจนระหว่างร้านค้า"
        elif avg_cv >= 4.0:
            vol_level = "Medium"
            vol_desc = "ความผันผวนปานกลาง ราคาอิงตามโปรโมชั่นรายสัปดาห์"
        else:
            vol_level = "Low"
            vol_desc = "ความสอดคล้องสูง ราคาเกาะกลุ่มอิงราคามาตรฐาน (MSRP)"

        category_analysis.append({
            "category": cat,
            "item_count": len(pcts),
            "avg_price_spread_percent": avg_spread,
            "volatility_score_cv": avg_cv,
            "volatility_level": vol_level,
            "volatility_description": vol_desc
        })
    category_analysis.sort(key=lambda x: x["volatility_score_cv"], reverse=True)

    avg_spread = round(sum(spread_pcts) / len(spread_pcts), 1) if spread_pcts else 0.0
    avg_savings = round(sum(spread_thbs) / len(spread_thbs), 2) if spread_thbs else 0.0
    max_spread = round(max(spread_pcts), 1) if spread_pcts else 0.0
    min_spread = round(min(spread_pcts), 1) if spread_pcts else 0.0

    return {
        "status": "success",
        "total_products": total_products,
        "total_stores": len(stores),
        "store_rankings": rankings,
        "price_spread": {
            "avg_spread_percent": avg_spread,
            "avg_savings_thb": avg_savings,
            "max_spread_percent": max_spread,
            "min_spread_percent": min_spread
        },
        "category_analysis": category_analysis,
        "trend_summary": {
            "down_trend_count": trends["down"],
            "stable_count": trends["stable"],
            "up_trend_count": trends["up"],
            "recommended_buy_count": trends["down"]
        },
        "updated_at": datetime.utcnow().isoformat()
    }


# Dedicated alias router for /api/analysis
analysis_router = APIRouter(prefix="/api/analysis", tags=["Market Analysis"])

@analysis_router.get("/store-dominance")
async def get_analysis_store_dominance(db: AsyncSession = Depends(get_db)):
    return await get_store_dominance(db)

@analysis_router.get("/market-summary")
async def get_analysis_market_summary(db: AsyncSession = Depends(get_db)):
    return await get_store_dominance(db)
