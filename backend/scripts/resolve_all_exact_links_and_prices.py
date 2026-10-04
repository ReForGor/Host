import asyncio
import httpx
import re
import json
import base64
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.features.scrapers.verified_catalog import VERIFIED_4_STORES_PRODUCTS

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'th,en;q=0.9'
}

async def get_advice_token(client: httpx.AsyncClient) -> str:
    try:
        r = await client.get('https://www.advice.co.th/', timeout=10.0)
        tok_m = re.search(r'\{"token"[^}]*\},"([^"]+)"', r.text)
        if tok_m:
            return tok_m.group(1)
        toks = re.findall(r'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}', r.text)
        if toks:
            return toks[0]
    except Exception as e:
        print("Error getting Advice token:", e)
    return ""

async def get_advice_product(client: httpx.AsyncClient, token: str, keyword: str):
    api_url = "https://prodbackadvice.advice.in.th/api/v1.0.0/product/get"
    h = {
        "User-Agent": headers['User-Agent'],
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Origin": "https://www.advice.co.th",
        "Referer": "https://www.advice.co.th/"
    }
    try:
        r = await client.post(api_url, json={"keyword": keyword}, headers=h, timeout=7.0)
        if r.status_code == 200:
            data = r.json()
            for grp in data.get("data", {}).get("product", []):
                for item in grp.get("product", []):
                    code = item.get("product_code")
                    p = item.get("price_sale") or item.get("price_sale_true") or item.get("price_srp")
                    p_normal = item.get("price_normal")
                    p_srp = item.get("price_srp")
                    title = item.get("product_name")
                    slug = item.get("slug", "")
                    clean_p = float(str(p).replace(',', '')) if p else None
                    return {
                        "code": code,
                        "price": clean_p,
                        "orig": float(str(p_normal or p_srp).replace(',', '')) if (p_normal or p_srp) else None,
                        "title": title,
                        "url": f"https://www.advice.co.th/product/{slug}" if slug else f"https://www.advice.co.th/product/{code}"
                    }
    except Exception as e:
        pass
    return None

async def test_advice():
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, verify=False) as client:
        token = await get_advice_token(client)
        print(f"Advice Token obtained: {token[:25]}...")
        for p in VERIFIED_4_STORES_PRODUCTS[:5]:
            slug = p['slug']
            model_no = p.get('model_no', '')
            res = await get_advice_product(client, token, model_no or slug)
            print(f"Advice for {slug}: {res}")

if __name__ == '__main__':
    asyncio.run(test_advice())
