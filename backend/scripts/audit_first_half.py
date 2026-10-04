import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.features.scrapers.verified_catalog import VERIFIED_4_STORES_PRODUCTS

for i, p in enumerate(VERIFIED_4_STORES_PRODUCTS[:18], 1):
    print(f"#{i} [{p['slug']}]")
    print(f"   Name:     {p['name']}")
    print(f"   Model:    {p.get('model_no', '-')}")
    print(f"   Image:    {p['image_url']}")
    prices = p.get('prices', {})
    for s in ['advice', 'jib', 'banana', 'ihavecpu']:
        print(f"   {s:8}: {prices.get(s, {}).get('url')}")
    print("-" * 50)
