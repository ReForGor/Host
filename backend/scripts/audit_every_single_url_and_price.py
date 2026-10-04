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

sem = asyncio.Semaphore(4)

async def check_store_url(client: httpx.AsyncClient, store: str, url: str):
    async with sem:
        try:
            resp = await client.get(url, timeout=7.0)
            status = resp.status_code
            html = resp.text
            title_m = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
            title = title_m.group(1).strip() if title_m else 'NO_TITLE'
            
            # Extract price if possible
            price = None
            if store == 'jib':
                pid = url.split('/')[-1]
                # Try JIB suggestion
                try:
                    s_resp = await client.get(f'https://www.jib.co.th/web/index.php/product/search_suggestion?term={pid}', timeout=4.0)
                    s_data = s_resp.json()
                    recs = s_data if isinstance(s_data, list) else s_data.get('rec', [])
                    for r in recs:
                        if str(r.get('id', '')).lstrip('0') == str(pid).lstrip('0'):
                            price = float(r.get('salePrice', r.get('price', 0)))
                            break
                except Exception:
                    pass
                if not price:
                    m = re.search(r'class=["\']unit["\']\s*>\s*บาท\s*</div>\s*<strong>([0-9,]+)</strong>', html)
                    if m:
                        price = float(m.group(1).replace(',', ''))

            elif store == 'advice':
                code_m = re.search(r'product/(?:detail/)?([A-Za-z0-9]+)', url)
                if code_m:
                    code = code_m.group(1)
                    # Try token + advice API or regex
                    m = re.search(r'\"price\":\s*\"?(\d+(?:\.\d+)?)\"?', html)
                    if m:
                        price = float(m.group(1))

            elif store == 'banana':
                m = re.search(r'"price":\s*"?([0-9.]+)"?', html)
                if m:
                    price = float(m.group(1))
                else:
                    m2 = re.findall(r'(\b\d{1,2},\d{3}\b)', html)
                    if m2:
                        price = float(m2[0].replace(',', ''))

            elif store == 'ihavecpu':
                m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html)
                if m:
                    try:
                        data = json.loads(m.group(1))
                        prod = data.get('props', {}).get('pageProps', {}).get('product', {})
                        if isinstance(prod, dict):
                            p_val = prod.get('price_sale') or prod.get('price')
                            if p_val:
                                price = float(p_val)
                    except Exception:
                        pass

            return {
                'store': store,
                'status': status,
                'title': title[:50],
                'price': price,
                'final_url': str(resp.url)
            }
        except Exception as e:
            return {
                'store': store,
                'status': -1,
                'title': f'ERR: {type(e).__name__}',
                'price': None,
                'final_url': url
            }

async def audit_product(client: httpx.AsyncClient, p: dict):
    slug = p['slug']
    name = p['name']
    prices = p.get('prices', {})
    res = {}
    for s in ['jib', 'advice', 'banana', 'ihavecpu']:
        p_info = prices.get(s, {})
        u = p_info.get('url', '')
        cat_p = p_info.get('price')
        check_res = await check_store_url(client, s, u)
        check_res['cat_price'] = cat_p
        res[s] = check_res
    return slug, res

async def main():
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, verify=False) as client:
        tasks = [audit_product(client, p) for p in VERIFIED_4_STORES_PRODUCTS]
        all_results = await asyncio.gather(*tasks)
        
        print("\n" + "="*110)
        print("COMPREHENSIVE AUDIT OF ALL 27 PRODUCTS: STATUS, TITLE & LIVE PRICE")
        print("="*110)
        
        mismatched_prices = []
        abnormal_links = []
        
        for slug, stores in all_results:
            print(f"\n[PRODUCT] {slug}")
            for s_name, data in stores.items():
                cat_p = data.get('cat_price')
                live_p = data.get('price')
                status = data.get('status')
                title = data.get('title')
                
                # Check price diff
                p_diff = ""
                if live_p and cat_p and abs(live_p - cat_p) > 50:
                    p_diff = f"⚠️ PRICE MISMATCH: Catalog {cat_p} vs Store {live_p}"
                    mismatched_prices.append((slug, s_name, cat_p, live_p))
                
                # Check link
                link_warn = ""
                if status != 200:
                    link_warn = f"❌ BAD STATUS {status}"
                    abnormal_links.append((slug, s_name, status, data.get('final_url')))
                elif 'search' in data.get('final_url', '').lower() or '?q=' in data.get('final_url', '').lower():
                    link_warn = "ℹ️ Search query URL"
                
                print(f"  {s_name:<8} | HTTP {status:<3} | Cat: {cat_p:<8} | Live: {str(live_p):<8} | {title} {p_diff} {link_warn}")

        print("\n" + "="*110)
        print(f"SUMMARY: {len(mismatched_prices)} Price Mismatches Found, {len(abnormal_links)} Abnormal Links Found")
        print("="*110)

if __name__ == '__main__':
    asyncio.run(main())
