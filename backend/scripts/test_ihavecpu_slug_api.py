import httpx
import asyncio
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def test():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
    }
    async with httpx.AsyncClient(headers=headers, verify=False) as client:
        # test /api/products/slug
        r1 = await client.get('https://ihavecpu.com/api/products/slug?slug=17689', timeout=5.0)
        print("slug status:", r1.status_code)
        if r1.status_code == 200:
            print("slug resp:", r1.text[:200])

        r2 = await client.get('https://ihavecpu.com/api/products/slug-list', timeout=5.0)
        print("slug-list status:", r2.status_code)
        if r2.status_code == 200:
            print("slug-list resp len:", len(r2.text), "snippet:", r2.text[:200])

if __name__ == '__main__':
    asyncio.run(test())
