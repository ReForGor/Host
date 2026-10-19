import asyncio
import sys
import os
sys.path.insert(0, '.')
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv('backend/.env')

from sqlalchemy import select, update
from backend.core.database import AsyncSessionLocal
from backend.features.products.models import Product, PriceListing, PriceHistory

RAM_DATA = [
    {
        "id": 395,
        "slug": "kingston-fury-beast-ddr4-16gb-3200mhz",
        "name": "Kingston FURY Beast DDR4 16GB (8GBx2) 3200MHz Black",
        "brand": "Kingston",
        "category": "Memory (RAM)",
        "model_no": "KF432C16BBK2/16",
        "msrp": 5890.0,
        "image_url": "https://www.jib.co.th/img_master/product/original/2021080209232447899_1.jpg",
        "description": "High-performance DDR4 dual-channel memory kit with low-profile heat spreader and Intel XMP / AMD Ryzen certification.",
        "specs": {
            "Type": "DDR4",
            "Capacity": "16GB (2x8GB)",
            "Speed": "3200MHz",
            "Latency": "CL16",
            "Voltage": "1.35V"
        },
        "listings": {
            "Advice IT Infinite": {
                "price": 5290.0,
                "orig": 5590.0,
                "url": "https://www.advice.co.th/product/ram-for-pc/pc-ddr4-3200-/ram-ddr4-3200-16gb-8gbx2-kingston-fury-beast-black-kf432c16bbk2-16-",
                "stock": "in_stock"
            },
            "JIB Computer Group": {
                "price": 5890.0,
                "orig": 6190.0,
                "url": "https://www.jib.co.th/web/product/readProduct/82172",
                "stock": "in_stock"
            },
            "BaNANA IT": {
                "price": 7540.0,
                "orig": 7990.0,
                "url": "https://www.bnn.in.th/th/p/kingston-ram-pc-ddr4-16gb3200mhz-cl16-8gbx2-fury-beast-black-kf432c16bbk216wp-740617351897_zew6o3",
                "stock": "in_stock"
            },
            "iHaveCPU": {
                "price": 4990.0,
                "orig": 5490.0,
                "url": "https://ihavecpu.com/product/48148",
                "stock": "in_stock"
            }
        }
    },
    {
        "id": 396,
        "slug": "kingston-fury-beast-ddr5-32gb-5600mhz",
        "name": "Kingston FURY Beast DDR5 32GB (16GBx2) 5600MHz Black",
        "brand": "Kingston",
        "category": "Memory (RAM)",
        "model_no": "KF556C40BBK2-32",
        "msrp": 17990.0,
        "image_url": "https://www.jib.co.th/img_master/product/original/2022012415202651146_1.jpg",
        "description": "Next-generation DDR5 memory delivering massive speed and stability improvements for the latest Intel and AMD platforms.",
        "specs": {
            "Type": "DDR5",
            "Capacity": "32GB (2x16GB)",
            "Speed": "5600MHz",
            "Latency": "CL40",
            "Voltage": "1.25V"
        },
        "listings": {
            "Advice IT Infinite": {
                "price": 6920.0,
                "orig": 7540.0,
                "url": "https://www.advice.co.th/product/ram-for-pc/pc-ddr5-5600-/ram-ddr5-5600-32gb-16gbx2-kingston-fury-beast-black-kf556c40bbk2-32-",
                "stock": "in_stock"
            },
            "BaNANA IT": {
                "price": 16900.0,
                "orig": 17900.0,
                "url": "https://www.bnn.in.th/th/p/kingston-ram-pc-ddr5-32gb5600mhz-cl40-16gbx2-fury-beast-kf556c40bbk2-32-740617325706_dk0o12",
                "stock": "in_stock"
            },
            "iHaveCPU": {
                "price": 17990.0,
                "orig": 19429.0,
                "url": "https://ihavecpu.com/product/4812/ram-(%E0%B9%81%E0%B8%A3%E0%B8%A1)-kingston-fury-beast-32gb-(16x2)-ddr5-5600mhz-black-(kf556c40bbk2-32)",
                "stock": "in_stock"
            },
            "JIB Computer Group": {
                "price": 19900.0,
                "orig": 20895.0,
                "url": "https://www.jib.co.th/web/product/readProduct/59281",
                "stock": "in_stock"
            }
        }
    },
    {
        "id": 433,
        "slug": "adata-xpg-gammix-d35-ddr4-16gb-3200mhz",
        "name": "ADATA XPG Gammix D35 DDR4 16GB (8GBx2) 3200MHz Black",
        "brand": "ADATA",
        "category": "Memory (RAM)",
        "model_no": "AX4U32008G16A-DTBKD35",
        "msrp": 4990.0,
        "image_url": "https://www.jib.co.th/img_master/product/original/2023053110484559888_1.jpg",
        "description": "Compact, low-profile DDR4 memory module featuring a triangular-cut armor design, high durability, and effortless Intel XMP 2.0 overclocking.",
        "specs": {
            "Type": "DDR4",
            "Capacity": "16GB (2x8GB)",
            "Speed": "3200MHz",
            "Latency": "CL16",
            "Voltage": "1.35V"
        },
        "listings": {
            "JIB Computer Group": {
                "price": 4390.0,
                "orig": 4690.0,
                "url": "https://www.jib.co.th/web/product/readProduct/82607",
                "stock": "in_stock"
            },
            "Advice IT Infinite": {
                "price": 4390.0,
                "orig": 4690.0,
                "url": "https://www.advice.co.th/product/ram-for-pc/pc-ddr4-3200-/ram-ddr4-3200-16gb-8gbx2-adata-xpg-gammix-d35-black-ax4u32008g16a-dtbkd35-",
                "stock": "in_stock"
            },
            "iHaveCPU": {
                "price": 4990.0,
                "orig": 5290.0,
                "url": "https://ihavecpu.com/product/48141",
                "stock": "in_stock"
            },
            "BaNANA IT": {
                "price": 5440.0,
                "orig": 5790.0,
                "url": "https://www.bnn.in.th/th/p/adata-ram-pc-ddr4-16gb3200mhz-cl16-8gbx2-d35-xpg-gammix-dual-pack-black-4711085942807_zpy76k",
                "stock": "in_stock"
            }
        }
    }
]

STORE_ID_MAP = {
    "JIB Computer Group": 1,
    "iHaveCPU": 2,
    "BaNANA IT": 3,
    "Advice IT Infinite": 4
}

async def sync_ram():
    async with AsyncSessionLocal() as session:
        for rdata in RAM_DATA:
            pid = rdata["id"]
            # 1. Update Product
            prod = await session.get(Product, pid)
            if prod:
                prod.slug = rdata["slug"]
                prod.name = rdata["name"]
                prod.brand = rdata["brand"]
                prod.category = rdata["category"]
                prod.model_no = rdata["model_no"]
                prod.msrp = rdata["msrp"]
                prod.image_url = rdata["image_url"]
                prod.description = rdata["description"]
                prod.specs = rdata["specs"]
                print(f"Updated Product {pid}: {prod.name}")

            # 2. Update Listings
            l_res = await session.execute(
                select(PriceListing).where(PriceListing.product_id == pid)
            )
            existing_listings = l_res.scalars().all()
            
            store_names = ["Advice IT Infinite", "JIB Computer Group", "BaNANA IT", "iHaveCPU"]
            for idx, sname in enumerate(store_names):
                sdata = rdata["listings"][sname]
                store_id = STORE_ID_MAP[sname]
                listing = None
                for el in existing_listings:
                    if el.store_id == store_id or el.seller_name == sname:
                        listing = el
                        break
                if not listing and idx < len(existing_listings):
                    listing = existing_listings[idx]
                
                if listing:
                    listing.store_id = store_id
                    listing.seller_name = sname
                    listing.price = sdata["price"]
                    listing.original_price = sdata["orig"]
                    listing.product_url = sdata["url"]
                    listing.stock_status = sdata["stock"]
                    listing.is_available = True
                    listing.shipping_cost = 0.0
                    listing.rating = 4.9
                    listing.review_count = 1200
                    print(f"  Updated Listing for {sname} (store_id={store_id}): ฿{listing.price} -> {listing.product_url}")
                else:
                    new_listing = PriceListing(
                        product_id=pid,
                        store_id=store_id,
                        seller_name=sname,
                        price=sdata["price"],
                        original_price=sdata["orig"],
                        product_url=sdata["url"],
                        stock_status=sdata["stock"],
                        is_available=True,
                        shipping_cost=0.0,
                        rating=4.9,
                        review_count=1200
                    )
                    session.add(new_listing)
                    print(f"  Created new Listing for {sname}: ฿{sdata['price']}")

            # 3. Add PriceHistory record
            for sname, sdata in rdata["listings"].items():
                store_id = STORE_ID_MAP[sname]
                history = PriceHistory(
                    product_id=pid,
                    store_id=store_id,
                    price=sdata["price"]
                )
                session.add(history)

        await session.commit()
        print("\nSUCCESS: All RAM products successfully synced into Neon Database!")

if __name__ == '__main__':
    asyncio.run(sync_ram())
