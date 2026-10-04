"""
Fast Async URL and Image Checker for IT Price Products.
Checks all 28 products and their store links concurrently with polite concurrency limit.
"""
import asyncio
import httpx
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.core.database import AsyncSessionLocal
from backend.features.products.models import Product, PriceListing

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
}

sem = asyncio.Semaphore(6)

async def check_url(client: httpx.AsyncClient, url: str, kind: str):
    async with sem:
        try:
            r = await client.get(url, timeout=10.0)
            return url, r.status_code, None
        except Exception as e:
            return url, -1, type(e).__name__

async def main():
    async with AsyncSessionLocal() as session:
        res = await session.execute(
            select(Product).options(
                selectinload(Product.listings).selectinload(PriceListing.store)
            )
        )
        prods = res.scalars().all()
        print(f"Loaded {len(prods)} products from Database.")

        async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, verify=False) as client:
            # Check Images
            print("\n--- CHECKING PRODUCT IMAGES ---")
            tasks = [check_url(client, p.image_url, "img") for p in prods]
            results = await asyncio.gather(*tasks)
            bad_images = []
            for p, (url, code, err) in zip(prods, results):
                status_str = f"HTTP {code}" if code > 0 else f"ERR: {err}"
                ok = code in [200, 304]
                mark = "[OK]" if ok else "[FAIL]"
                print(f"{mark} [{status_str}] {p.slug} -> {url}")
                if not ok:
                    bad_images.append((p, url, code, err))

            # Check Store Links
            print("\n--- CHECKING STORE PRODUCT URLS ---")
            all_listings = []
            for p in prods:
                for l in p.listings:
                    all_listings.append((p, l))

            tasks = [check_url(client, l.product_url, "store") for p, l in all_listings]
            results = await asyncio.gather(*tasks)
            bad_links = []
            for (p, l), (url, code, err) in zip(all_listings, results):
                ok = code in [200, 301, 302, 304, 403, 429]
                mark = "[OK]" if ok else "[FAIL]"
                status_str = f"HTTP {code}" if code > 0 else f"ERR: {err}"
                if not ok:
                    print(f"{mark} [{status_str}] {p.slug} | {l.store.slug} -> {url}")
                    bad_links.append((p, l, url, code, err))

            print(f"\n==========================================")
            print(f"SUMMARY: Bad Images: {len(bad_images)} | Bad Store Links: {len(bad_links)}")
            print(f"==========================================")

if __name__ == "__main__":
    asyncio.run(main())
