from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from backend.core.database import get_db
from backend.features.products.models import Product
from backend.features.products.schemas import ProductSummaryOut, ProductDetailOut, ProductPriceHistoryOut
from backend.features.products.service import (
    list_products_service, get_product_detail_service,
    get_price_history_service, search_suggestions_service
)

router = APIRouter(prefix="/api", tags=["Products & Search"])

@router.get("/products", response_model=List[ProductSummaryOut])
async def list_products(
    response: Response,
    q: Optional[str] = Query(None, description="Search keyword in name or description"),
    category: Optional[str] = Query(None, description="Filter by IT equipment category"),
    brand: Optional[str] = Query(None, description="Filter by brand name"),
    store_slug: Optional[str] = Query(None, description="Filter by store slug"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    sort_by: str = Query("cheapest", description="cheapest, expensive, discount, name, newest"),
    limit: int = Query(500, ge=1, le=2000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    items, total_count = await list_products_service(
        db=db,
        q=q,
        category=category,
        brand=brand,
        store_slug=store_slug,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )
    response.headers["X-Total-Count"] = str(total_count)
    response.headers["Access-Control-Expose-Headers"] = "X-Total-Count"
    return items

@router.get("/products/{product_id}", response_model=ProductDetailOut)
async def get_product_detail(product_id: int, db: AsyncSession = Depends(get_db)):
    return await get_product_detail_service(product_id=product_id, db=db)

@router.get("/products/{product_id}/history", response_model=ProductPriceHistoryOut)
async def get_product_price_history(product_id: int, db: AsyncSession = Depends(get_db)):
    return await get_price_history_service(product_id=product_id, db=db)

@router.get("/search/suggestions")
async def search_suggestions(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(8, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
):
    return await search_suggestions_service(q=q, limit=limit, db=db)

@router.get("/categories")
@router.get("/products/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Product.category, func.count(Product.id)).group_by(Product.category)
    )
    data = res.all()
    return [{"category": row[0], "count": row[1]} for row in data]

@router.get("/brands")
@router.get("/products/brands")
async def get_brands(db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Product.brand, func.count(Product.id)).group_by(Product.brand)
    )
    data = res.all()
    return [{"brand": row[0], "count": row[1]} for row in data]

