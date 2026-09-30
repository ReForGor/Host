import re
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, delete
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from backend.core.database import get_db
from backend.core.security import get_current_admin
from backend.features.products.models import Product, Store, PriceListing, PriceHistory
from backend.features.alerts.models import PriceAlert, Notification
from backend.features.auth.models import User
from backend.features.admin.service import get_admin_dashboard_stats

router = APIRouter(prefix="/api/admin", tags=["Admin Management"])

class ProductCreateAdmin(BaseModel):
    name: str
    category: str
    brand: str
    model_no: Optional[str] = None
    msrp: float
    image_url: Optional[str] = None
    description: Optional[str] = None
    specs: Dict[str, Any] = {}

class ProductUpdateAdmin(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    model_no: Optional[str] = None
    msrp: Optional[float] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    specs: Optional[Dict[str, Any]] = None

class BroadcastNotificationRequest(BaseModel):
    product_id: Optional[int] = None
    title: str
    message: str
    new_price: Optional[float] = None
    store_name: Optional[str] = "JIB / Advice"

@router.get("/stats")
async def get_admin_stats(db: AsyncSession = Depends(get_db)):
    return await get_admin_dashboard_stats(db)

@router.get("/products")
async def list_admin_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).options(
        selectinload(Product.listings).selectinload(PriceListing.store)
    ).order_by(desc(Product.created_at))

    if q:
        search_pat = f"%{q.lower()}%"
        query = query.where(
            func.lower(Product.name).like(search_pat) |
            func.lower(Product.brand).like(search_pat)
        )
    if category and category != "All":
        query = query.where(Product.category == category)

    res = await db.execute(query)
    prods = res.scalars().all()

    results = []
    for p in prods:
        active = [l for l in p.listings if l.is_available and l.price > 0]
        min_p = min((l.price for l in active), default=p.msrp)
        max_p = max((l.price for l in active), default=p.msrp)
        best = min(active, key=lambda x: x.price) if active else None

        results.append({
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "category": p.category,
            "brand": p.brand,
            "model_no": p.model_no,
            "msrp": p.msrp,
            "image_url": p.image_url,
            "description": p.description,
            "specs": p.specs or {},
            "lowest_price": min_p,
            "highest_price": max_p,
            "store_count": len(active),
            "best_store": best.store.name if best and best.store else None,
            "listings": [
                {
                    "id": l.id,
                    "store_id": l.store_id,
                    "store_name": l.store.name if l.store else "Unknown",
                    "store_color": l.store.color if l.store else "#06b6d4",
                    "price": l.price,
                    "original_price": l.original_price,
                    "stock_status": l.stock_status,
                    "product_url": l.product_url,
                    "last_checked": l.last_checked
                }
                for l in p.listings
            ]
        })
    return results

@router.post("/products")
async def create_product(
    data: ProductCreateAdmin,
    db: AsyncSession = Depends(get_db)
):
    slug_base = re.sub(r'[^a-zA-Z0-9]+', '-', data.name.lower()).strip('-')
    existing_slug = await db.execute(select(Product).where(Product.slug == slug_base))
    if existing_slug.scalar_one_or_none():
        slug_base = f"{slug_base}-{int(datetime.utcnow().timestamp())}"

    prod = Product(
        name=data.name.strip(),
        slug=slug_base,
        category=data.category,
        brand=data.brand.strip(),
        model_no=data.model_no,
        msrp=data.msrp,
        image_url=data.image_url or "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400",
        description=data.description,
        specs=data.specs or {},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(prod)
    await db.commit()
    await db.refresh(prod)

    stores_res = await db.execute(select(Store).where(Store.is_active == True))
    stores = stores_res.scalars().all()
    now = datetime.utcnow()
    for s in stores:
        listing = PriceListing(
            product_id=prod.id,
            store_id=s.id,
            price=data.msrp,
            original_price=data.msrp,
            currency="THB",
            product_url=f"{s.base_url}/search?q={prod.name.replace(' ', '+')}",
            stock_status="in_stock",
            shipping_cost=0.0,
            last_checked=now
        )
        db.add(listing)

    await db.commit()
    return {"message": "Product created successfully", "id": prod.id, "slug": prod.slug}

@router.put("/products/{product_id}")
async def update_product(
    product_id: int,
    data: ProductUpdateAdmin,
    db: AsyncSession = Depends(get_db)
):
    prod = await db.get(Product, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    if data.name is not None: prod.name = data.name.strip()
    if data.category is not None: prod.category = data.category
    if data.brand is not None: prod.brand = data.brand.strip()
    if data.model_no is not None: prod.model_no = data.model_no
    if data.msrp is not None: prod.msrp = data.msrp
    if data.image_url is not None: prod.image_url = data.image_url
    if data.description is not None: prod.description = data.description
    if data.specs is not None: prod.specs = data.specs
    prod.updated_at = datetime.utcnow()

    await db.commit()
    return {"message": "Product updated successfully", "id": product_id}

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    prod = await db.get(Product, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.delete(prod)
    await db.commit()
    return {"message": "Product deleted successfully", "id": product_id}

@router.get("/users")
async def list_admin_users(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).order_by(desc(User.created_at)))
    users = res.scalars().all()

    results = []
    for u in users:
        alerts_cnt = (await db.execute(
            select(func.count(PriceAlert.id)).where(PriceAlert.user_id == u.id)
        )).scalar() or 0

        results.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "alerts_count": alerts_cnt,
            "created_at": u.created_at
        })
    return results

@router.post("/broadcast-notification")
async def broadcast_notification(
    data: BroadcastNotificationRequest,
    db: AsyncSession = Depends(get_db)
):
    users_res = await db.execute(select(User))
    users = users_res.scalars().all()

    now = datetime.utcnow()
    prod = await db.get(Product, data.product_id) if data.product_id else None
    prod_id = prod.id if prod else 1
    price_val = data.new_price or (prod.msrp if prod else 10000.0)

    count = 0
    for u in users:
        notif = Notification(
            user_id=u.id,
            email=u.email,
            product_id=prod_id,
            title=data.title,
            message=data.message,
            new_price=price_val,
            store_name=data.store_name,
            product_url=f"https://www.jib.co.th",
            currency="THB",
            is_read=False,
            created_at=now
        )
        db.add(notif)
        count += 1

    await db.commit()
    return {"message": f"Broadcast notification sent to {count} users", "dispatched_count": count}


class StoreCreateAdmin(BaseModel):
    name: str
    slug: str
    base_url: str
    logo_url: Optional[str] = None
    color: Optional[str] = "#3b82f6"

@router.get("/stores")
async def list_admin_stores(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Store).order_by(Store.id))
    stores = res.scalars().all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "slug": s.slug,
            "base_url": s.base_url,
            "logo_url": s.logo_url,
            "color": s.color,
            "is_active": s.is_active,
            "created_at": s.created_at
        }
        for s in stores
    ]

@router.post("/stores")
async def create_admin_store(
    data: StoreCreateAdmin,
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(Store).where(Store.slug == data.slug.strip().lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Store with this slug already exists")
    
    store = Store(
        name=data.name.strip(),
        slug=data.slug.strip().lower(),
        base_url=data.base_url.strip(),
        logo_url=data.logo_url,
        color=data.color or "#3b82f6",
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(store)
    await db.commit()
    await db.refresh(store)
    return {
        "message": "Store platform created successfully",
        "store": {
            "id": store.id,
            "name": store.name,
            "slug": store.slug,
            "base_url": store.base_url,
            "color": store.color
        }
    }
