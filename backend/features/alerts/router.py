from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from backend.core.database import get_db
from backend.core.security import get_current_user_optional, get_current_admin
from backend.features.products.models import Product, PriceListing
from backend.features.alerts.models import PriceAlert, Notification, EmailLog
from backend.features.alerts.schemas import AlertCreate, AlertOut, NotificationOut, EmailLogOut
from backend.features.alerts.email_service import email_service

router = APIRouter(prefix="/api", tags=["Alerts & Notifications"])

@router.post("/alerts", response_model=AlertOut)
async def create_price_alert(
    req: AlertCreate,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    if not req.email or "@" not in req.email or "." not in req.email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="กรุณากรอกรูปแบบอีเมลให้ถูกต้อง (Invalid email format)")

    prod = await db.get(Product, req.product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    user_id = current_user.id if current_user else None
    
    # Calculate current lowest price
    list_res = await db.execute(
        select(PriceListing.price).where(PriceListing.product_id == prod.id, PriceListing.is_available == True)
    )
    prices = list_res.scalars().all()
    current_lowest = min(prices) if prices else prod.msrp

    alert = PriceAlert(
        user_id=user_id,
        product_id=req.product_id,
        email=req.email,
        target_price=req.target_price,
        currency=req.currency or "THB",
        current_lowest_price=current_lowest,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)

    # Send confirmation email in background
    background_tasks.add_task(
        email_service.send_alert_confirmation,
        to_email=req.email,
        product_name=prod.name,
        target_price=req.target_price,
        current_lowest_price=current_lowest or req.target_price,
        product_image=prod.image_url,
        product_id=prod.id
    )

    return AlertOut(
        id=alert.id,
        user_id=alert.user_id,
        product_id=alert.product_id,
        email=alert.email,
        target_price=alert.target_price,
        currency=alert.currency,
        current_lowest_price=alert.current_lowest_price,
        last_notified_price=alert.last_notified_price,
        is_active=alert.is_active,
        triggered_at=alert.triggered_at,
        created_at=alert.created_at,
        product_name=prod.name,
        product_image=prod.image_url
    )

@router.get("/alerts", response_model=List[AlertOut])
async def list_alerts(
    email: Optional[str] = Query(None),
    current_user = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    query = select(PriceAlert).options(selectinload(PriceAlert.product)).order_by(desc(PriceAlert.created_at))
    if current_user:
        query = query.where(PriceAlert.user_id == current_user.id)
    elif email:
        query = query.where(PriceAlert.email == email)

    res = await db.execute(query)
    alerts = res.scalars().all()

    return [
        AlertOut(
            id=a.id,
            user_id=a.user_id,
            product_id=a.product_id,
            email=a.email,
            target_price=a.target_price,
            currency=a.currency,
            current_lowest_price=a.current_lowest_price,
            last_notified_price=a.last_notified_price,
            is_active=a.is_active,
            triggered_at=a.triggered_at,
            created_at=a.created_at,
            product_name=a.product.name if a.product else None,
            product_image=a.product.image_url if a.product else None
        )
        for a in alerts
    ]

@router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    alert = await db.get(PriceAlert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await db.delete(alert)
    await db.commit()
    return {"status": "success", "message": "Alert deleted"}

@router.patch("/alerts/{alert_id}/toggle")
async def toggle_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    alert = await db.get(PriceAlert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_active = not alert.is_active
    await db.commit()
    return {"status": "success", "is_active": alert.is_active}

@router.get("/notifications", response_model=List[NotificationOut])
async def list_notifications(
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Notification).order_by(desc(Notification.created_at)).limit(limit)
    )
    return res.scalars().all()

@router.post("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: int, db: AsyncSession = Depends(get_db)):
    notif = await db.get(Notification, notif_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    await db.commit()
    return {"status": "success"}

@router.get("/emails/logs", response_model=List[EmailLogOut])
async def list_email_logs(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(EmailLog).order_by(desc(EmailLog.created_at)).limit(limit)
    )
    return res.scalars().all()
