import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.features.scrapers.verified_catalog import VERIFIED_4_STORES_PRODUCTS, AUTO_INGEST_DISCOVERY_POOL

prods = VERIFIED_4_STORES_PRODUCTS + AUTO_INGEST_DISCOVERY_POOL
print(f"Total products: {len(prods)}\n")

for i, p in enumerate(prods, 1):
    print(f"#{i} [{p['slug']}]")
    print(f"   Name:     {p['name']}")
    print(f"   Category: {p['category']}")
    print(f"   Brand:    {p['brand']} | Model: {p.get('model_no', '-')}")
    print(f"   Image:    {p['image_url']}")
    prices = p.get('prices', {})
    print(f"   Advice:   {prices.get('advice', {}).get('price')} THB -> {prices.get('advice', {}).get('url')}")
    print(f"   JIB:      {prices.get('jib', {}).get('price')} THB -> {prices.get('jib', {}).get('url')}")
    print(f"   BaNANA:   {prices.get('banana', {}).get('price')} THB -> {prices.get('banana', {}).get('url')}")
    print(f"   iHaveCPU: {prices.get('ihavecpu', {}).get('price')} THB -> {prices.get('ihavecpu', {}).get('url')}")
    print("-" * 80)
