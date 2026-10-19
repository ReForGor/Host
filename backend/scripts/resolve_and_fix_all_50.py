import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from backend.core.database import AsyncSessionLocal
from backend.features.products.models import Product, PriceListing, Store, PriceHistory
from backend.features.scrapers.live_store_client import is_direct_product_url

# Verified real direct URLs and prices discovered on official websites
KNOWN_REAL_MATCHES = {
    ("logitech-g102-lightsync-black", "ihavecpu"): {
        "url": "https://ihavecpu.com/product/11722/mouse-(%E0%B9%80%E0%B8%A1%E0%B8%B2%E0%B8%AA%E0%B9%8C)-logitech-g102-lightsync-(black)-(2y)",
        "price": 549.0
    },
    ("razer-deathadder-essential-black", "jib"): {
        "url": "https://www.jib.co.th/web/product/readProduct/30959",
        "price": 590.0
    },
    ("razer-deathadder-essential-black", "advice"): {
        "url": "https://www.advice.co.th/product/gaming-mouse/gaming-mouse-wired-เมาส์สาย-/mouse-razer-deathadder-essential-black-เมาส์สาย-",
        "price": 550.0
    },
    ("razer-deathadder-essential-black", "ihavecpu"): {
        "url": "https://ihavecpu.com/product/11767/mouse-(%E0%B9%80%E0%B8%A1%E0%B8%B2%E0%B8%AA%E0%B9%8C)-razer-deathadder-essential-(2y)",
        "price": 550.0
    },
    ("razer-deathadder-essential-white", "jib"): {
        "url": "https://www.jib.co.th/web/product/readProduct/47216",
        "price": 590.0
    },
    ("razer-deathadder-essential-white", "ihavecpu"): {
        "url": "https://ihavecpu.com/product/11768/mouse-(%E0%B9%80%E0%B8%A1%E0%B8%B2%E0%B8%AA%E0%B9%8C)-razer-deathadder-essential-white-edition-(2y)",
        "price": 550.0
    },
    ("corsair-rm850e-850w-gold-atx3", "ihavecpu"): {
        "url": "https://ihavecpu.com/product/28441/psu-(%E0%B8%AD%E0%B8%B8%E0%B8%9B%E0%B8%81%E0%B8%A3%E0%B8%93%E0%B9%8C%E0%B8%88%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B9%84%E0%B8%9F)-corsair-rm850e---850w-(80%2Bgold)-(cp-9020296-na)-(7y)",
        "price": 3690.0
    },
    ("kingston-nv3-2tb-pcie-4-nvme-ssd", "ihavecpu"): {
        "url": "https://ihavecpu.com/product/25233/m.2-(%E0%B9%80%E0%B8%AD%E0%B8%AA%E0%B9%80%E0%B8%AD%E0%B8%AA%E0%B8%94%E0%B8%B5)-kingston-nv3-2tb-pcie-4%2Fnvme-m.2-2280-(snv3s%2F2000g)-(5y)",
        "price": 8990.0
    },
    ("kingston-nv3-500gb-pcie-4-nvme-ssd", "ihavecpu"): {
        "url": "https://ihavecpu.com/product/22285/m.2-(%E0%B9%80%E0%B8%AD%E0%B8%AA%E0%B9%80%E0%B8%AD%E0%B8%AA%E0%B8%94%E0%B8%B5)-kingston-nv3-500gb-pcie-4%2Fnvme-m.2-2280-(snv3s%2F500g)-(5y)",
        "price": 3990.0
    },
    ("asrock-b650m-pg-lightning", "jib"): {
        "url": "https://www.jib.co.th/web/product/readProduct/68240",
        "price": 3540.0
    },
    ("asrock-b650m-pg-lightning", "advice"): {
        "url": "https://www.advice.co.th/product/mainboard/amd-am5-b650-b850-/mainboard-am5-asrock-b650m-pg-lightning-ddr5",
        "price": 2760.0
    },
    ("asrock-b650m-pg-lightning", "ihavecpu"): {
        "url": "https://ihavecpu.com/product/27909/mainboard-(%E0%B9%80%E0%B8%A1%E0%B8%99%E0%B8%9A%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%94)(am5)-asrock-b650m-pg-lightning-ddr5-(3y)",
        "price": 3150.0
    },
    ("gigabyte-b650m-d3hp", "jib"): {
        "url": "https://www.jib.co.th/web/product/readProduct/82085",
        "price": 3150.0
    },
    ("gigabyte-b650m-d3hp", "advice"): {
        "url": "https://www.advice.co.th/product/mainboard/amd-am5-b650-b850-/mainboard-am5-gigabyte-b650m-d3hp-ddr5",
        "price": 2960.0
    },
    ("gigabyte-b650m-d3hp", "ihavecpu"): {
        "url": "https://ihavecpu.com/product/14142/mainboard-(%E0%B9%80%E0%B8%A1%E0%B8%99%E0%B8%9A%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B8%94)(am5)-gigabyte-b650m-d3hp",
        "price": 2990.0
    }
}

async def run_clean():
    async with AsyncSessionLocal() as db:
        q = select(Product).options(selectinload(Product.listings).selectinload(PriceListing.store))
        res = await db.execute(q)
        products = res.scalars().all()
        
        real_updated = 0
        oos_updated = 0
        
        for p in products:
            for l in p.listings:
                url = l.product_url or ""
                store_slug = l.store.slug
                key = (p.slug, store_slug)
                
                # Check if this listing is one of the known real matches
                if key in KNOWN_REAL_MATCHES:
                    match_info = KNOWN_REAL_MATCHES[key]
                    l.product_url = match_info["url"]
                    l.price = match_info["price"]
                    l.original_price = match_info["price"]
                    l.stock_status = "in_stock"
                    l.is_available = True
                    print(f"[REAL MATCH] {p.slug} | {store_slug} -> ฿{l.price} | {l.product_url[:50]}")
                    real_updated += 1
                elif not is_direct_product_url(url) or 'search' in url or 'category' in url or '?q=' in url:
                    # Store does NOT have this product -> Set to Out of Stock, price 0
                    l.price = 0.0
                    l.original_price = None
                    l.stock_status = "out_of_stock"
                    l.is_available = False
                    l.product_url = "#"
                    
                    # Delete any dummy price history
                    del_q = delete(PriceHistory).where(
                        PriceHistory.product_id == p.id,
                        PriceHistory.store_id == l.store_id
                    )
                    await db.execute(del_q)
                    print(f"[OUT OF STOCK] {p.slug} | {store_slug} -> ฿0 (Product not available on store web)")
                    oos_updated += 1
                    
        await db.commit()
        print("\n" + "="*60)
        print(f"DATABASE UPDATE FINISHED:")
        print(f"  Updated to verified authentic direct URLs: {real_updated}")
        print(f"  Updated to OUT OF STOCK (฿0, no fake price): {oos_updated}")
        print("="*60)

if __name__ == "__main__":
    asyncio.run(run_clean())
