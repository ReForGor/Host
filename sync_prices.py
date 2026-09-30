import asyncio
import sys
import os

sys.path.insert(0, r"c:\Users\AdminTemp\Documents\GitHub\Software-Proj")
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import backend.features.auth.models
import backend.features.alerts.models
import backend.features.analytics.models
from datetime import datetime
from sqlalchemy import select, update
from backend.core.database import AsyncSessionLocal
from backend.features.products.models import Product, PriceListing, Store, PriceHistory
from backend.features.scrapers.manager import scraper_manager

async def run_full_sync():
    print("=" * 80)
    print("🚀 KPTM PRICE: FULL LIVE PRICE AUDIT & SYNCHRONIZATION")
    print("Checking every product across JIB, Advice, BaNANA, and iHaveCPU...")
    print("=" * 80)

    async with AsyncSessionLocal() as db:
        prods_res = await db.execute(select(Product).order_by(Product.id.asc()))
        products = prods_res.scalars().all()
        print(f"Total Products in Catalog: {len(products)}\n")

        total_checked = 0
        total_updated = 0
        all_results = []

        for p_idx, prod in enumerate(products, 1):
            print(f"[{p_idx:02d}/{len(products)}] {prod.name}")
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
                    print(f"   ⚠️ No scraper for {store.slug}")
                    continue

                old_price = float(listing.price)
                scraped_price = 0.0
                scraped_orig = None

                try:
                    await asyncio.sleep(0.2)
                    res = await scraper.scrape_product(
                        product_name=prod.name,
                        model_no=prod.model_no,
                        product_url=listing.product_url
                    )
                    scraped_price = res.get("price", 0.0)
                    scraped_orig = res.get("original_price")
                except Exception as e:
                    print(f"   ❌ {store.name:18}: Error scraping: {e}")

                if scraped_price and scraped_price > 0:
                    diff = scraped_price - old_price
                    if abs(diff) > 0.01:
                        await db.execute(
                            update(PriceListing)
                            .where(PriceListing.id == listing.id)
                            .values(
                                price=scraped_price,
                                original_price=scraped_orig,
                                last_checked=datetime.utcnow()
                            )
                        )

                        # Add price history
                        h = PriceHistory(
                            product_id=prod.id,
                            store_id=store.id,
                            price=scraped_price,
                            currency="THB",
                            timestamp=datetime.utcnow()
                        )
                        db.add(h)
                        total_updated += 1
                        status_str = f"🔄 UPDATED: ฿{old_price:,.0f} -> ฿{scraped_price:,.0f} ({diff:+,.0f} THB)"
                    else:
                        status_str = f"✅ ACCURATE: ฿{scraped_price:,.0f}"

                    print(f"   • {store.name:18}: {status_str}")
                    all_results.append({
                        "product": prod.name,
                        "store": store.name,
                        "old_price": old_price,
                        "live_price": scraped_price,
                        "updated": abs(diff) > 0.01
                    })
                else:
                    print(f"   • {store.name:18}: ⚠️ Keeping previous: ฿{old_price:,.0f}")

            await db.execute(
                update(Product)
                .where(Product.id == prod.id)
                .values(updated_at=datetime.utcnow())
            )
            await db.commit()
            print()

        print("=" * 80)
        print("🎉 KPTM PRICE: AUDIT & SYNC COMPLETE!")
        print(f"Total Listings Audited : {total_checked}")
        print(f"Total Prices Updated   : {total_updated}")
        print("=" * 80)

asyncio.run(run_full_sync())
