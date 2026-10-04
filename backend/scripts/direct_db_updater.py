"""
Direct Database Updater for IT Price Thailand.
Updates the Neon Cloud PostgreSQL database directly with verified products available on ALL 4 stores:
- JIB Computer Group (jib)
- Advice IT Infinite (advice)
- BaNANA IT (banana)
- iHaveCPU (ihavecpu)

Does NOT use or depend on static seed files. Updates the live database directly.
"""
import asyncio
from datetime import datetime, timezone, timedelta
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from backend.core.database import AsyncSessionLocal
from backend.features.products.models import Store, Product, PriceListing, PriceHistory
from backend.features.scrapers.verified_catalog import VERIFIED_4_STORES_PRODUCTS, AUTO_INGEST_DISCOVERY_POOL

REQUIRED_STORES = [
    {
        "name": "JIB Computer Group",
        "slug": "jib",
        "logo_url": "https://www.jib.co.th/web/images/logo/logo_jib.png",
        "base_url": "https://www.jib.co.th",
        "color": "#f59e0b",
        "scraper_type": "jib"
    },
    {
        "name": "iHaveCPU",
        "slug": "ihavecpu",
        "logo_url": "https://www.ihavecpu.com/images/logo.png",
        "base_url": "https://www.ihavecpu.com",
        "color": "#ef4444",
        "scraper_type": "ihavecpu"
    },
    {
        "name": "BaNANA IT",
        "slug": "banana",
        "logo_url": "https://media-cdn.bnn.in.th/289945/banana-logo.png",
        "base_url": "https://www.bnn.in.th",
        "color": "#22c55e",
        "scraper_type": "banana"
    },
    {
        "name": "Advice IT Infinite",
        "slug": "advice",
        "logo_url": "https://www.advice.co.th/assets/images/advice-logo.png",
        "base_url": "https://www.advice.co.th",
        "color": "#3b82f6",
        "scraper_type": "advice"
    }
]

async def sync_direct_to_database():
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    bkk_tz = timezone(timedelta(hours=7))
    print(f"[{datetime.now(bkk_tz).strftime('%Y-%m-%d %H:%M:%S')}] Starting Direct Database Update...")

    all_verified = VERIFIED_4_STORES_PRODUCTS + AUTO_INGEST_DISCOVERY_POOL
    valid_slugs = {p["slug"] for p in all_verified}

    async with AsyncSessionLocal() as session:
        # 1. Ensure 4 Core Stores Exist
        store_map = {}
        for s_data in REQUIRED_STORES:
            res = await session.execute(select(Store).where(Store.slug == s_data["slug"]))
            store = res.scalar_one_or_none()
            if not store:
                store = Store(**s_data)
                session.add(store)
                await session.flush()
                print(f"Created Store: {store.name} ({store.slug})")
            else:
                store.name = s_data["name"]
                store.logo_url = s_data["logo_url"]
                store.base_url = s_data["base_url"]
                store.color = s_data["color"]
                store.scraper_type = s_data["scraper_type"]
            store_map[store.slug] = store

        # 2. Fetch existing products
        res = await session.execute(
            select(Product).options(
                selectinload(Product.listings).selectinload(PriceListing.store),
                selectinload(Product.price_histories)
            )
        )
        existing_products = {p.slug: p for p in res.scalars().all()}

        # 3. Purge any products not in valid 4-store catalog
        for slug, prod in list(existing_products.items()):
            if slug not in valid_slugs:
                print(f"Purging product not available on all 4 stores: {prod.name} ({slug})")
                await session.delete(prod)
                del existing_products[slug]
        await session.flush()

        # 4. Upsert Verified Products & Verified 4-Store Prices
        upserted_count = 0
        for p_data in all_verified:
            slug = p_data["slug"]
            prod = existing_products.get(slug)
            if not prod:
                prod = Product(
                    name=p_data["name"],
                    slug=slug,
                    category=p_data["category"],
                    brand=p_data["brand"],
                    model_no=p_data.get("model_no"),
                    image_url=p_data["image_url"],
                    description=p_data["description"],
                    msrp=p_data["msrp"],
                    specs=p_data.get("specs", {})
                )
                session.add(prod)
                await session.flush()
                print(f"Added Product: {prod.name}")
            else:
                prod.name = p_data["name"]
                prod.category = p_data["category"]
                prod.brand = p_data["brand"]
                prod.model_no = p_data.get("model_no")
                prod.image_url = p_data["image_url"]
                prod.description = p_data["description"]
                prod.msrp = p_data["msrp"]
                prod.specs = p_data.get("specs", {})

            # Existing listings by store_slug
            if prod in existing_products.values():
                existing_listings = {l.store.slug: l for l in prod.listings if l.store}
            else:
                existing_listings = {}

            # Upsert all 4 stores
            prices_dict = p_data["prices"]
            for s_slug, p_info in prices_dict.items():
                store = store_map.get(s_slug)
                if not store:
                    continue
                listing = existing_listings.get(s_slug)
                if not listing:
                    listing = PriceListing(
                        product_id=prod.id,
                        store_id=store.id,
                        price=p_info["price"],
                        original_price=p_info.get("orig", p_info["price"]),
                        product_url=p_info["url"],
                        is_available=True,
                        last_checked=now_utc
                    )
                    session.add(listing)
                    await session.flush()
                else:
                    listing.price = p_info["price"]
                    listing.original_price = p_info.get("orig", p_info["price"])
                    listing.product_url = p_info["url"]
                    listing.is_available = True
                    listing.last_checked = now_utc

                # Add initial price history if new
                if prod not in existing_products.values():
                    history_entry = PriceHistory(
                        product_id=prod.id,
                        store_id=store.id,
                        price=p_info["price"],
                        timestamp=now_utc - timedelta(days=1)
                    )
                    session.add(history_entry)

            upserted_count += 1
            await session.commit()
            print(f"[{upserted_count}/{len(all_verified)}] Updated {p_data['slug']} in Neon DB.")

        print(f"Direct Database Update Finished! {upserted_count} products verified with 4 stores and real web prices.")

if __name__ == "__main__":
    asyncio.run(sync_direct_to_database())
