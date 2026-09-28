import asyncio
import sys
from datetime import datetime

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import backend.features.auth.models
import backend.features.alerts.models
import backend.features.analytics.models
from backend.core.database import AsyncSessionLocal
from backend.features.products.models import Product, PriceListing, Store, PriceHistory
from backend.features.scrapers.manager import scraper_manager
from sqlalchemy import select

async def sync_all_prices():
    print("=" * 70)
    print("⚡ TechPrice Live Price Synchronizer (Syncing with Source Stores)")
    print("=" * 70)
    started_at = datetime.utcnow()
    total_updated = 0
    total_checked = 0
    errors = []

    async with AsyncSessionLocal() as db:
        prods_res = await db.execute(select(Product).order_by(Product.id.asc()))
        products = prods_res.scalars().all()
        print(f"Found {len(products)} products in catalog. Starting live sync...\n")

        for idx, prod in enumerate(products, 1):
            print(f"[{idx}/{len(products)}] {prod.name}")
            listings_res = await db.execute(
                select(PriceListing, Store)
                .join(Store)
                .where(PriceListing.product_id == prod.id)
            )
            listings = listings_res.all()

            for listing, store in listings:
                total_checked += 1
                scraper = scraper_manager.scrapers.get(store.slug)
                if not scraper:
                    continue

                try:
                    await asyncio.sleep(0.2)
                    scraped = await scraper.scrape_product(
                        product_name=prod.name,
                        model_no=prod.model_no,
                        product_url=listing.product_url
                    )

                    new_price = scraped.get("price", 0)
                    if new_price and new_price > 0:
                        old_price = listing.price
                        listing.price = new_price
                        if scraped.get("original_price"):
                            listing.original_price = scraped.get("original_price")
                        listing.last_checked = datetime.utcnow()

                        # Add history record
                        history = PriceHistory(
                            product_id=prod.id,
                            store_id=store.id,
                            price=new_price,
                            currency="THB",
                            timestamp=datetime.utcnow()
                        )
                        db.add(history)
                        total_updated += 1

                        diff_str = ""
                        if old_price != new_price:
                            diff = new_price - old_price
                            diff_str = f" [CHANGED: {old_price:,.0f} -> {new_price:,.0f} ({diff:+,.0f} THB)]"
                        else:
                            diff_str = f" [EXACT MATCH: {new_price:,.0f} THB]"

                        print(f"    • {store.name:20}: ฿{new_price:,.2f}{diff_str}")
                    else:
                        print(f"    • {store.name:20}: (Kept previous: ฿{listing.price:,.2f})")
                except Exception as ex:
                    errors.append(f"{prod.name} on {store.name}: {ex}")
                    print(f"    • {store.name:20}: [Error: {ex}]")

            prod.updated_at = datetime.utcnow()
            await db.commit()
            print()

        elapsed = (datetime.utcnow() - started_at).total_seconds()
        print("=" * 70)
        print(f"✅ Sync complete in {elapsed:.1f}s!")
        print(f"Total listings checked: {total_checked}")
        print(f"Total prices updated to live: {total_updated}")
        if errors:
            print(f"Warnings/Errors: {len(errors)}")
        print("=" * 70)

if __name__ == "__main__":
    asyncio.run(sync_all_prices())
