from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from backend.features.products.models import Product, PriceListing, Store, PriceHistory
from backend.features.products.schemas import (
    ProductSummaryOut, ProductDetailOut, PlatformComparisonItem,
    ProductPriceHistoryOut, StoreHistorySeries
)
from backend.features.products.store_urls import generate_store_product_url

REQUIRED_STORES = {"jib", "ihavecpu", "banana", "advice"}

async def list_products_service(
    db: AsyncSession,
    q: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    store_slug: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "cheapest",
    limit: int = 500,
    offset: int = 0
) -> Tuple[List[ProductSummaryOut], int]:
    query = select(Product).options(
        selectinload(Product.listings).selectinload(PriceListing.store)
    )

    if q:
        search_pattern = f"%{q.lower()}%"
        query = query.where(
            func.lower(Product.name).like(search_pattern) | 
            func.lower(Product.brand).like(search_pattern) |
            func.lower(Product.description).like(search_pattern)
        )

    if category and category != "All":
        query = query.where(Product.category == category)

    if brand and brand != "All":
        query = query.where(Product.brand == brand)

    res = await db.execute(query)
    all_products = res.scalars().all()

    results = []

    for prod in all_products:
        all_active_listings = [
            l for l in prod.listings 
            if l.is_available and l.price > 0 and l.store and l.product_url
        ]
        unique_store_slugs = {l.store.slug for l in all_active_listings}
        
        # We require availability across all 4 key stores
        if not REQUIRED_STORES.issubset(unique_store_slugs):
            continue

        if store_slug and store_slug not in unique_store_slugs:
            continue

        sorted_listings = sorted(all_active_listings, key=lambda x: x.price)
        lowest_p = sorted_listings[0].price
        highest_p = max(l.price for l in all_active_listings)
        
        if store_slug:
            store_specific = [l for l in all_active_listings if l.store.slug == store_slug]
            best_listing = store_specific[0] if store_specific else sorted_listings[0]
        else:
            best_listing = sorted_listings[0]
            
        discounts = [
            ((l.original_price - l.price) / l.original_price * 100)
            for l in all_active_listings if l.original_price and l.original_price > l.price
        ]
        max_discount = max(discounts) if discounts else 0.0

        if min_price is not None and lowest_p is not None and lowest_p < min_price:
            continue
        if max_price is not None and lowest_p is not None and lowest_p > max_price:
            continue

        savings_amt = round(highest_p - lowest_p, 2)
        savings_pct = round((savings_amt / highest_p * 100), 1) if highest_p > 0 else 0.0

        if prod.msrp and lowest_p < prod.msrp * 0.95:
            price_trend = "down"
            price_trend_text = "Trend ขาลง (แนะนำซื้อ)"
        elif prod.msrp and lowest_p > prod.msrp * 1.02:
            price_trend = "up"
            price_trend_text = "Trend ขาขึ้น"
        else:
            price_trend = "stable"
            price_trend_text = "ราคาคงที่"

        suggested_target = round(lowest_p * 0.95, -1) if lowest_p else None

        item = ProductSummaryOut(
            id=prod.id,
            name=prod.name,
            slug=prod.slug,
            category=prod.category,
            brand=prod.brand,
            model_no=prod.model_no,
            image_url=prod.image_url,
            description=prod.description,
            msrp=prod.msrp,
            specs=prod.specs or {},
            created_at=prod.created_at,
            updated_at=prod.updated_at,
            lowest_price=lowest_p,
            highest_price=highest_p,
            store_count=len(all_active_listings),
            best_store_name=best_listing.store.name if best_listing and best_listing.store else None,
            best_store_logo=best_listing.store.logo_url if best_listing and best_listing.store else None,
            best_product_url=(
                generate_store_product_url(
                    best_listing.store.slug,
                    prod.name,
                    prod.brand,
                    prod.model_no,
                    best_listing.product_url,
                    product_slug=prod.slug
                )
                if best_listing and best_listing.store
                else None
            ),
            max_discount_percent=round(max_discount, 1),
            savings_amount=savings_amt,
            savings_percent=savings_pct,
            price_trend=price_trend,
            price_trend_text=price_trend_text,
            volatility_score=savings_pct,
            suggested_target_price=suggested_target
        )
        results.append(item)

    if sort_by == "cheapest":
        results.sort(key=lambda x: (x.lowest_price or 999999))
    elif sort_by == "expensive":
        results.sort(key=lambda x: (x.lowest_price or 0), reverse=True)
    elif sort_by == "discount":
        results.sort(key=lambda x: x.max_discount_percent, reverse=True)
    elif sort_by == "name":
        results.sort(key=lambda x: x.name)
    elif sort_by == "newest":
        results.sort(key=lambda x: x.created_at, reverse=True)

    total_count = len(results)
    paginated = results[offset : offset + limit]
    return paginated, total_count

async def get_product_detail_service(product_id: int, db: AsyncSession) -> ProductDetailOut:
    query = (
        select(Product)
        .options(selectinload(Product.listings).selectinload(PriceListing.store))
        .where(Product.id == product_id)
    )
    res = await db.execute(query)
    prod = res.scalar_one_or_none()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    active_listings = [
        l for l in prod.listings 
        if l.is_available and l.price > 0 and l.store and l.product_url
    ]
    
    # We no longer enforce REQUIRED_STORES strictly with 404
    # Instead we will generate out of stock entries for missing ones
    sorted_listings = sorted(active_listings, key=lambda x: (x.price + x.shipping_cost))
    
    lowest_total = sorted_listings[0].price + sorted_listings[0].shipping_cost if sorted_listings else 0
    lowest_raw_price = sorted_listings[0].price if sorted_listings else 0
    highest_price = max((l.price for l in active_listings), default=0)
    avg_price = round(sum(l.price for l in active_listings) / len(active_listings), 2) if active_listings else 0
    max_savings = round(highest_price - lowest_raw_price, 2) if active_listings else 0

    platform_items = []
    found_stores = set()
    
    for l in sorted_listings:
        store = l.store
        found_stores.add(store.slug)
        total_p = round(l.price + l.shipping_cost, 2)
        diff_from_lowest = round(total_p - lowest_total, 2)
        disc_pct = (
            round(((l.original_price - l.price) / l.original_price) * 100, 1)
            if l.original_price and l.original_price > l.price
            else 0.0
        )

        platform_items.append(
            PlatformComparisonItem(
                store_id=l.store_id,
                store_name=store.name if store else "Unknown",
                store_slug=store.slug if store else "unknown",
                store_logo=store.logo_url if store else None,
                store_color=store.color if store else "#06b6d4",
                price=l.price,
                original_price=l.original_price,
                currency=l.currency,
                discount_percent=disc_pct,
                price_diff_from_lowest=diff_from_lowest,
                is_lowest=(l.id == sorted_listings[0].id) if sorted_listings else False,
                stock_status=l.stock_status,
                shipping_cost=l.shipping_cost,
                total_price=total_p,
                product_url=generate_store_product_url(
                    store.slug if store else "jib",
                    prod.name,
                    prod.brand,
                    prod.model_no,
                    l.product_url,
                    product_slug=prod.slug
                ),
                rating=l.rating,
                review_count=l.review_count,
                last_checked=l.last_checked
            )
        )
        
    # Inject out of stock for missing required stores
    store_meta = {
        'jib': {'id': 1, 'name': 'JIB Computer Official', 'color': '#10b981'},
        'ihavecpu': {'id': 2, 'name': 'iHaveCPU Official', 'color': '#8b5cf6'},
        'advice': {'id': 3, 'name': 'Advice IT Infinite', 'color': '#06b6d4'},
        'banana': {'id': 4, 'name': 'BaNANA IT Online', 'color': '#f59e0b'}
    }
    
    for req_slug in REQUIRED_STORES:
        if req_slug not in found_stores:
            meta = store_meta.get(req_slug, {'id': 99, 'name': req_slug, 'color': '#ccc'})
            platform_items.append(
                PlatformComparisonItem(
                    store_id=meta['id'],
                    store_name=meta['name'],
                    store_slug=req_slug,
                    store_logo=None,
                    store_color=meta['color'],
                    price=0,
                    original_price=None,
                    currency="THB",
                    discount_percent=0.0,
                    price_diff_from_lowest=0.0,
                    is_lowest=False,
                    stock_status="out_of_stock",
                    shipping_cost=0.0,
                    total_price=0.0,
                    product_url="#",
                    rating=0.0,
                    review_count=0,
                    last_checked=prod.updated_at
                )
            )

    savings_pct = round((max_savings / highest_price * 100), 1) if highest_price > 0 else 0.0
    if prod.msrp and lowest_raw_price < prod.msrp * 0.95:
        price_trend = "down"
        price_trend_text = "Trend ขาลง (แนะนำซื้อ)"
    elif prod.msrp and lowest_raw_price > prod.msrp * 1.02:
        price_trend = "up"
        price_trend_text = "Trend ขาขึ้น"
    else:
        price_trend = "stable"
        price_trend_text = "ราคาคงที่"

    suggested_target = round(lowest_raw_price * 0.95, -1) if lowest_raw_price else None

    return ProductDetailOut(
        id=prod.id,
        name=prod.name,
        slug=prod.slug,
        category=prod.category,
        brand=prod.brand,
        model_no=prod.model_no,
        image_url=prod.image_url,
        description=prod.description,
        msrp=prod.msrp,
        specs=prod.specs or {},
        created_at=prod.created_at,
        updated_at=prod.updated_at,
        lowest_price=lowest_raw_price,
        highest_price=highest_price,
        avg_price=avg_price,
        total_savings=max_savings,
        savings_percent=savings_pct,
        best_store=sorted_listings[0].store.name if sorted_listings[0].store else None,
        price_trend=price_trend,
        price_trend_text=price_trend_text,
        volatility_score=savings_pct,
        suggested_target_price=suggested_target,
        platforms=platform_items
    )

async def get_price_history_service(product_id: int, db: AsyncSession) -> ProductPriceHistoryOut:
    prod = await db.get(Product, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    query = (
        select(PriceHistory)
        .options(selectinload(PriceHistory.store))
        .where(PriceHistory.product_id == product_id)
        .order_by(asc(PriceHistory.timestamp))
    )
    res = await db.execute(query)
    records = res.scalars().all()

    # Group records by store and date
    store_map: Dict[int, Dict[str, Any]] = {}
    date_prices: Dict[str, List[float]] = {}
    all_prices = []

    for rec in records:
        all_prices.append(rec.price)
        d_str = rec.timestamp.strftime("%Y-%m-%d")
        if d_str not in date_prices:
            date_prices[d_str] = []
        date_prices[d_str].append(rec.price)

        st = rec.store
        if not st:
            continue
        if st.id not in store_map:
            store_map[st.id] = {
                "store_name": st.name,
                "store_id": st.id,
                "store_color": st.color or "#06b6d4",
                "data_points": []
            }
        store_map[st.id]["data_points"].append({
            "date": d_str,
            "price": rec.price
        })

    lowest_hist = min(all_prices) if all_prices else (prod.msrp or 0)
    highest_hist = max(all_prices) if all_prices else (prod.msrp or 0)
    current_lowest = lowest_hist

    # Calculate Market Average Line (daily average across all stores)
    market_average_series = [
        {
            "date": d,
            "price": round(sum(plist) / len(plist), 2)
        }
        for d, plist in sorted(date_prices.items())
    ]

    # Calculate Price Volatility Score (Coefficient of Variation: CV %)
    if len(all_prices) > 1:
        mean_p = sum(all_prices) / len(all_prices)
        variance = sum((x - mean_p) ** 2 for x in all_prices) / (len(all_prices) - 1)
        stdev_p = variance ** 0.5
        cv_pct = round((stdev_p / mean_p) * 100, 2) if mean_p > 0 else 0.0
    else:
        cv_pct = 0.0

    suggested_target = round(lowest_hist * 0.95, -1) if lowest_hist else None

    series_list = [
        StoreHistorySeries(
            store_name=v["store_name"],
            store_id=v["store_id"],
            store_color=v["store_color"],
            data_points=v["data_points"]
        )
        for v in store_map.values()
    ]

    return ProductPriceHistoryOut(
        product_id=prod.id,
        product_name=prod.name,
        lowest_historical_price=lowest_hist,
        highest_historical_price=highest_hist,
        current_lowest_price=current_lowest,
        series=series_list,
        market_average_series=market_average_series,
        suggested_target_price=suggested_target,
        volatility_cv_percent=cv_pct
    )

async def search_suggestions_service(q: str, limit: int, db: AsyncSession):
    search_term = f"%{q.lower()}%"
    query = (
        select(Product)
        .options(selectinload(Product.listings).selectinload(PriceListing.store))
        .where(
            func.lower(Product.name).like(search_term) |
            func.lower(Product.brand).like(search_term) |
            func.lower(Product.category).like(search_term)
        )
        .limit(limit)
    )
    res = await db.execute(query)
    prods = res.scalars().all()

    suggestions = []
    for p in prods:
        active = [l for l in p.listings if l.is_available and l.price > 0 and l.store and l.product_url]
        unique_stores = {l.store.slug for l in active}
        if not REQUIRED_STORES.issubset(unique_stores):
            continue
        min_p = min((l.price for l in active), default=p.msrp)
        suggestions.append({
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "brand": p.brand,
            "image_url": p.image_url,
            "lowest_price": min_p,
            "store_count": 4
        })
    return suggestions
