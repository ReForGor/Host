import httpx
import asyncio
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
}

async def check_banana_api():
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, verify=False) as client:
        url = 'https://www.bnn.in.th/th/p/logitech-gaming-mouse-g502-hero-high-performance-097855142009_xzo50d'
        r = await client.get(url, timeout=10.0)
        print("Product page status:", r.status_code)
        for s in re.findall(r'<script[^>]*>(.*?)</script>', r.text, re.DOTALL):
            if '"@type":"Product"' in s:
                p_data = json.loads(s)
                print("PRODUCT NAME:", p_data.get('name'))
                print("OFFERS:", p_data.get('offers'))

if __name__ == '__main__':
    asyncio.run(check_banana_api())
