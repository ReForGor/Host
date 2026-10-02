from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
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
    
    # Calculate current lowest price and best store listing
    list_res = await db.execute(
        select(PriceListing)
        .options(selectinload(PriceListing.store))
        .where(PriceListing.product_id == prod.id, PriceListing.is_available == True)
        .order_by(PriceListing.price.asc())
    )
    listings = list_res.scalars().all()
    best_listing = listings[0] if listings else None
    current_lowest = best_listing.price if best_listing else prod.msrp
    best_store_name = best_listing.store.name if best_listing and best_listing.store else "Advice IT Infinite"
    best_product_url = (best_listing.product_url if best_listing and best_listing.product_url else f"http://localhost:3000/products/{prod.id}")

    # Check if price has already reached or dropped below target price
    is_price_reached = (current_lowest is not None and current_lowest <= req.target_price)

    alert = PriceAlert(
        user_id=user_id,
        product_id=req.product_id,
        email=req.email.strip().lower(),
        target_price=req.target_price,
        currency=req.currency or "THB",
        current_lowest_price=current_lowest,
        last_notified_price=current_lowest if is_price_reached else None,
        triggered_at=datetime.utcnow() if is_price_reached else None,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(alert)
    await db.flush()

    if is_price_reached:
        # Price is ALREADY at or below target -> Send Price Drop / Reached Alert immediately!
        notif = Notification(
            user_id=user_id,
            email=req.email.strip().lower(),
            product_id=prod.id,
            alert_id=alert.id,
            title=f"🔥 ราคาถึงเป้าหมายแล้ว: {prod.name}",
            message=(
                f"ยินดีด้วย! {prod.name} ราคาปัจจุบันอยู่ที่ ฿{current_lowest:,.2f} ที่ {best_store_name} "
                f"ถึงราคาเป้าหมาย ฿{req.target_price:,.2f} ของคุณแล้ว!"
            ),
            old_price=prod.msrp or current_lowest,
            new_price=current_lowest,
            store_name=best_store_name,
            product_url=best_product_url,
            currency="THB",
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(notif)
        await db.commit()
        await db.refresh(alert)

        background_tasks.add_task(
            email_service.send_price_drop_alert,
            to_email=req.email.strip().lower(),
            product_name=prod.name,
            new_price=current_lowest,
            target_price=req.target_price,
            store_name=best_store_name,
            product_url=best_product_url,
            product_image=prod.image_url,
            product_id=prod.id,
            alert_id=alert.id,
            original_price=prod.msrp
        )
    else:
        # Price is above target -> Save alert and send confirmation that we are monitoring
        await db.commit()
        await db.refresh(alert)

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


class TestEmailRequest(BaseModel):
    email: str
    product_id: Optional[int] = 390


@router.get("/alerts/email/preview")
async def preview_price_drop_email(
    product_id: Optional[int] = Query(390),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the raw rendered HTML for the price drop alert email template (matches Figma / screenshot design).
    Can be previewed directly in browser or embedded in an iframe.
    """
    from fastapi.responses import HTMLResponse
    from backend.features.products.models import Product, PriceListing, Store

    prod = await db.get(Product, product_id)
    if not prod:
        # Fallback to first product or mock
        first_prod = (await db.execute(select(Product).limit(1))).scalars().first()
        prod = first_prod

    p_name = prod.name if prod else "AMD Ryzen 5 5500 6-Core 12-Thread Processor"
    p_img = prod.image_url if prod else "https://www.jib.co.th/img_master/product/original/2022040514004252535_1.jpg"
    p_msrp = prod.msrp if prod else 3690.0
    p_specs = prod.specs or {} if prod else {}

    # Query listings if available
    store_comparisons = []
    lowest_price = 3120.0
    best_store_name = "Advice IT Infinite"
    best_url = "https://www.advice.co.th"

    if prod:
        listings_res = await db.execute(
            select(PriceListing, Store)
            .join(Store, PriceListing.store_id == Store.id)
            .where(PriceListing.product_id == prod.id)
            .order_by(PriceListing.price.asc())
        )
        rows = listings_res.all()
        if rows:
            lowest_price = rows[0][0].price
            best_store_name = rows[0][1].name
            best_url = rows[0][0].product_url or "https://www.advice.co.th"
            for l, s in rows:
                store_comparisons.append({
                    "name": s.name,
                    "price": l.price,
                    "diff": max(0.0, l.price - lowest_price),
                    "is_best": l.price == lowest_price,
                    "in_stock": l.stock_status == "in_stock"
                })

    target_price = lowest_price  # Matched target

    badge = "AM4"
    specs_str = "Socket: AM4 | Base 3.6 GHz / Boost 4.2 GHz"
    if p_specs:
        if "Socket" in p_specs:
            badge = p_specs["Socket"]
            specs_str = f"Socket: {p_specs.get('Socket')} | Base {p_specs.get('Base Clock', '3.6 GHz')} / Boost {p_specs.get('Boost Clock', '4.2 GHz')}"
        elif "VRAM" in p_specs:
            badge = p_specs.get("VRAM", "GPU")
            specs_str = f"VRAM: {p_specs.get('VRAM')} | Interface: {p_specs.get('Memory Interface', 'PCIe 4.0')}"

    html = email_service.render_price_drop_html(
        product_name=p_name,
        new_price=lowest_price,
        target_price=target_price,
        store_name=best_store_name,
        product_url=best_url,
        product_image=p_img,
        specs_text=specs_str,
        badge_text=badge,
        original_price=p_msrp or (lowest_price + 370.0),
        store_comparisons=store_comparisons or None,
        alert_id=prod.id if prod else 883921
    )
    return HTMLResponse(content=html)


@router.post("/alerts/email/send-test")
async def send_test_price_drop_email(
    data: TestEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Sends the price drop alert email to the specified email address for testing and verification.
    """
    if not data.email or "@" not in data.email:
        raise HTTPException(status_code=400, detail="Invalid email address")

    from backend.features.products.models import Product, PriceListing, Store

    prod = await db.get(Product, data.product_id or 390)
    p_name = prod.name if prod else "AMD Ryzen 5 5500 6-Core 12-Thread Processor"
    p_img = prod.image_url if prod else "https://www.jib.co.th/img_master/product/original/2022040514004252535_1.jpg"

    lowest_price = 3120.0
    best_store = "Advice IT Infinite"
    best_url = "https://www.advice.co.th"

    if prod:
        listings_res = await db.execute(
            select(PriceListing, Store)
            .join(Store, PriceListing.store_id == Store.id)
            .where(PriceListing.product_id == prod.id)
            .order_by(PriceListing.price.asc())
        )
        rows = listings_res.all()
        if rows:
            lowest_price = rows[0][0].price
            best_store = rows[0][1].name
            best_url = rows[0][0].product_url or "https://www.advice.co.th"

    res = await email_service.send_price_drop_alert(
        to_email=data.email.strip().lower(),
        product_name=p_name,
        new_price=lowest_price,
        target_price=lowest_price,
        store_name=best_store,
        product_url=best_url,
        product_image=p_img,
        product_id=prod.id if prod else 390,
        original_price=prod.msrp if (prod and prod.msrp) else (lowest_price + 370.0)
    )

    return {
        "status": "success",
        "message": f"Test price drop email dispatched to {data.email}",
        "result": res
    }
