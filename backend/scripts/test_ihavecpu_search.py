import urllib.request
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

import httpx
import asyncio

async def test():
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, verify=False) as client:
        searches = [
            ('mouse', 'G502'),
            ('mouse', 'G102'),
            ('mouse', 'Superlight'),
            ('power-supply', 'A650BN'),
            ('power-supply', 'CX650'),
            ('power-supply', 'RM850e'),
            ('monitor', 'VG249Q3A'),
            ('monitor', '24U411B'),
            ('monitor', 'LM22-B201S'),
            ('heat-sink', 'Kraken Elite'),
            ('graphic-card', '4060 EVO'),
            ('graphic-card', '4070 SUPER'),
            ('mainboard', 'B760M-A'),
            ('mainboard', 'B650M')
        ]
        for cat, q in searches:
            url = f"https://ihavecpu.com/category/{cat}?search={q.replace(' ', '+')}"
            r = await client.get(url, timeout=10.0)
            m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', r.text)
            if m:
                d = json.loads(m.group(1))
                items = d.get('props', {}).get('pageProps', {}).get('product', {}).get('data', [])
                print(f"=== {cat} / {q} -> Found {len(items)} items ===")
                for it in items[:2]:
                    pid = it.get('product_id')
                    name = it.get('name_th')
                    price = it.get('price_sale') or it.get('price')
                    slug = it.get('slug')
                    print(f"  {pid} | ฿{price} | {name}")
                    print(f"    https://ihavecpu.com/product/{pid}/{slug}")

if __name__ == '__main__':
    asyncio.run(test())
