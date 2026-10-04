import httpx
import asyncio
import re
import json

import sys
sys.stdout.reconfigure(encoding='utf-8')

async def test():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
    async with httpx.AsyncClient(headers=headers, verify=False) as c:
        r = await c.get('https://www.advice.co.th/')
        tok_m = re.search(r'\{"token"[^}]*\},"([^"]+)"', r.text)
        tok = tok_m.group(1) if tok_m else None
        print("Token:", tok[:20] if tok else None)
        h = {
            'User-Agent': headers['User-Agent'],
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {tok}',
            'Origin': 'https://www.advice.co.th',
            'Referer': 'https://www.advice.co.th/'
        }
        queries = [
            '7800X3D', '12400F', 'Ryzen 5600', 'NV3 1TB', 'NV3 2TB', 'NV3 500GB',
            'G502 HERO', 'G102', 'SUPERLIGHT 2', 'RM850e', 'A650BN', 'CX650',
            '24U411B', 'LM22-B201S', 'VG249Q3A', 'B760M-A', 'B650M GAMING PLUS',
            'RTX 4060', 'RTX 4070'
        ]
        for q in queries:
            res = await c.post('https://prodbackadvice.advice.in.th/api/v1.0.0/product/get', json={'keyword': q}, headers=h)
            d = res.json()
            found = []
            for g in d.get('data', {}).get('product', []):
                for it in g.get('product', []):
                    found.append((it.get('code'), it.get('price_sale_true') or it.get('price_sale'), it.get('product'), it.get('product_url')))
            print(f"=== Query '{q}' ({len(found)} results) ===")
            for item in found[:3]:
                print(f"  {item[0]} | {item[1]} | {item[2]}")
                print(f"    https://www.advice.co.th/product/{item[3]}")

if __name__ == '__main__':
    asyncio.run(test())
