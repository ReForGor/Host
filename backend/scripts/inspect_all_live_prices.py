import asyncio
import httpx
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.features.scrapers.verified_catalog import VERIFIED_4_STORES_PRODUCTS

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

sem = asyncio.Semaphore(5)

async def check_item(client: httpx.AsyncClient, p: dict):
    slug = p['slug']
    prices = p.get('prices', {})
    
    # 1. JIB
    jib_url = prices.get('jib', {}).get('url', '')
    jib_pid = jib_url.split('/')[-1] if jib_url else ''
    cat_jib_p = prices.get('jib', {}).get('price')
    live_jib_p = None
    if jib_pid:
        async with sem:
            try:
                resp = await client.get(f'https://www.jib.co.th/web/index.php/product/search_suggestion?term={jib_pid}', timeout=5.0)
                data = resp.json()
                recs = data.get('rec', []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
                for r in recs:
                    if str(r.get('id', '')).lstrip('0') == str(jib_pid).lstrip('0'):
                        live_jib_p = float(r.get('salePrice', r.get('price', 0)))
                        break
            except Exception as e:
                live_jib_p = f'ERR: {type(e).__name__}'

    # 2. Advice
    adv_url = prices.get('advice', {}).get('url', '')
    cat_adv_p = prices.get('advice', {}).get('price')
    live_adv_p = None
    if adv_url:
        async with sem:
            try:
                resp = await client.get(adv_url, timeout=5.0)
                html = resp.text
                m = re.search(r'\"price\":\s*\"?(\d+(?:\.\d+)?)\"?', html)
                if m:
                    live_adv_p = float(m.group(1))
            except Exception as e:
                live_adv_p = f'ERR: {type(e).__name__}'

    # Check BaNANA & iHaveCPU URLs (is it query search or direct product?)
    bnn_url = prices.get('banana', {}).get('url', '')
    ihv_url = prices.get('ihavecpu', {}).get('url', '')
    bnn_is_search = '?q=' in bnn_url
    ihv_is_search = '?search=' in ihv_url

    return {
        'slug': slug,
        'cat_jib': cat_jib_p,
        'live_jib': live_jib_p,
        'cat_adv': cat_adv_p,
        'live_adv': live_adv_p,
        'bnn_url': bnn_url,
        'bnn_is_search': bnn_is_search,
        'ihv_url': ihv_url,
        'ihv_is_search': ihv_is_search
    }

async def main():
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, verify=False) as client:
        tasks = [check_item(client, p) for p in VERIFIED_4_STORES_PRODUCTS]
        results = await asyncio.gather(*tasks)

        print(f"{'Slug':<35} | {'JIB (Cat/Live)':<18} | {'Adv (Cat/Live)':<18} | {'BNN Direct?':<12} | {'IHV Direct?'}", flush=True)
        print("-" * 105, flush=True)
        for r in results:
            slug = r['slug']
            jib_str = f"{r['cat_jib']}/{r['live_jib']}"
            adv_str = f"{r['cat_adv']}/{r['live_adv']}"
            bnn_str = "SEARCH" if r['bnn_is_search'] else "DIRECT"
            ihv_str = "SEARCH" if r['ihv_is_search'] else "DIRECT"
            print(f"{slug:<35} | {jib_str:<18} | {adv_str:<18} | {bnn_str:<12} | {ihv_str}", flush=True)

if __name__ == '__main__':
    asyncio.run(main())
