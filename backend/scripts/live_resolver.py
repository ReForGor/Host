import asyncio
import httpx
import re
import json
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

async def resolve_jib(client: httpx.AsyncClient, query: str, slug: str):
    search_url = f"https://www.jib.co.th/web/index.php/product/search_suggestion?term={query}"
    try:
        r = await client.get(search_url, timeout=8.0)
        if r.status_code == 200:
            data = r.json()
            rec = data.get('rec', [])
            for item in rec:
                title = item.get('title', '')
                pid = str(int(item.get('id', '0')))
                # Exclude computer sets, prebuilts unless intended
                if 'COMPUTER SET' in title.upper() or 'NOTEBOOK' in title.upper():
                    continue
                # check image
                img = item.get('link', '')
                orig_img = img.replace('/icon/', '/original/')
                price = float(item.get('salePrice') or item.get('price', 0))
                
                # verify image HTTP 200
                img_to_use = orig_img
                try:
                    img_resp = await client.head(orig_img, timeout=4.0)
                    if img_resp.status_code != 200:
                        img_resp = await client.head(img, timeout=4.0)
                        if img_resp.status_code == 200:
                            img_to_use = img
                except Exception:
                    img_to_use = img

                return {
                    'pid': pid,
                    'title': title,
                    'price': price,
                    'url': f"https://www.jib.co.th/web/product/readProduct/{pid}",
                    'image': img_to_use
                }
    except Exception as e:
        # print(f"JIB error for {query}: {e}")
        pass
    return None

async def resolve_banana(client: httpx.AsyncClient, query: str):
    search_url = f"https://www.bnn.in.th/th/p?q={query}"
    try:
        r = await client.get(search_url, timeout=10.0)
        if r.status_code == 200:
            links = re.findall(r'href=[\'"](/th/p/[^\'\"?#]+_[a-z0-9]+)', r.text)
            clean_links = [l for l in links if 'computer-set' not in l and 'notebook' not in l and 'laptop' not in l]
            if clean_links:
                direct_url = f"https://www.bnn.in.th{clean_links[0]}"
                # Fetch product page to get accurate price & title
                pr = await client.get(direct_url, timeout=8.0)
                if pr.status_code == 200:
                    for s in re.findall(r'<script[^>]*>(.*?)</script>', pr.text, re.DOTALL):
                        if '"@type":"Product"' in s:
                            p_data = json.loads(s)
                            name = p_data.get('name')
                            offers = p_data.get('offers', {})
                            price = float(offers.get('price', 0))
                            image = p_data.get('image')
                            if isinstance(image, list) and image:
                                image = image[0]
                            return {
                                'title': name,
                                'price': price,
                                'url': direct_url,
                                'image': image
                            }
                return {
                    'url': direct_url,
                    'price': None
                }
    except Exception as e:
        # print(f"BaNANA error for {query}: {e}")
        pass
    return None

async def resolve_advice(client: httpx.AsyncClient, token: str, query: str):
    api_url = "https://prodbackadvice.advice.in.th/api/v1.0.0/product/get"
    h = {
        "User-Agent": headers['User-Agent'],
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "Origin": "https://www.advice.co.th",
        "Referer": "https://www.advice.co.th/"
    }
    try:
        r = await client.post(api_url, json={"keyword": query}, headers=h, timeout=7.0)
        if r.status_code == 200:
            data = r.json()
            for grp in data.get("data", {}).get("product", []):
                for item in grp.get("product", []):
                    code = item.get("product_code")
                    p = item.get("price_sale") or item.get("price_sale_true") or item.get("price_srp")
                    title = item.get("product_name")
                    slug = item.get("slug", "")
                    clean_p = float(str(p).replace(',', '')) if p else None
                    return {
                        "code": code,
                        "price": clean_p,
                        "title": title,
                        "url": f"https://www.advice.co.th/product/{slug}" if slug else f"https://www.advice.co.th/product/{code}"
                    }
    except Exception:
        pass
    return None

async def main():
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, verify=False) as client:
        # Advice Token
        advice_token = ""
        try:
            r = await client.get('https://www.advice.co.th/', timeout=10.0)
            toks = re.findall(r'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}', r.text)
            if toks:
                advice_token = toks[0]
        except Exception as e:
            print("Failed to get Advice token:", e)

        print(f"Advice token obtained: {bool(advice_token)}")
        
        results = []
        for p in VERIFIED_4_STORES_PRODUCTS:
            slug = p['slug']
            model_no = p.get('model_no', '')
            print(f"\n================ Resolving {slug} ({model_no}) ================")
            
            # 1. JIB
            jib_res = await resolve_jib(client, model_no or slug, slug)
            print("JIB:", jib_res)

            # 2. BaNANA
            banana_res = await resolve_banana(client, model_no or slug)
            print("BaNANA:", banana_res)

            # 3. Advice
            adv_res = None
            if advice_token:
                adv_res = await resolve_advice(client, advice_token, model_no or slug)
            print("Advice:", adv_res)

if __name__ == '__main__':
    asyncio.run(main())
