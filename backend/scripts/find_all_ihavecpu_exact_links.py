import httpx
import asyncio
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.features.scrapers.verified_catalog import VERIFIED_4_STORES_PRODUCTS

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
}

cat_map = {
    'Graphics Cards (GPU)': ('graphic-card', '4060'),
    'Processors (CPU)': ('cpu', 'AMD'),
    'Solid State Drives (SSD)': ('storage', 'NV3'),
    'Memory (RAM)': ('ram', 'Kingston'),
    'Motherboards': ('mainboard', 'B760M'),
    'Power Supplies (PSU)': ('power-supply', 'MSI'),
    'Monitors': ('monitor', 'LG'),
    'Gaming Mice': ('mouse', 'G502'),
    'Cooling Systems': ('heat-sink', 'Kraken')
}

async def check_all_ihavecpu():
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, verify=False) as client:
        for p in VERIFIED_4_STORES_PRODUCTS:
            slug = p['slug']
            cat = p['category']
            name = p['name']
            ihv_cat, _ = cat_map.get(cat, ('category', ''))
            
            # Form search terms
            terms = []
            if '7800X3D' in name: terms = ['7800X3D']
            elif '12400F' in name: terms = ['12400F']
            elif '5600' in name: terms = ['5600']
            elif '5500' in name: terms = ['5500']
            elif 'NV3' in name: terms = ['NV3']
            elif '4060' in name: terms = ['4060']
            elif '4070' in name: terms = ['4070']
            elif '990 PRO' in name: terms = ['990+PRO']
            elif 'SN850X' in name: terms = ['SN850X']
            elif 'B760M' in name: terms = ['B760M']
            elif 'B650' in name: terms = ['B650']
            elif 'RM850' in name: terms = ['RM850']
            elif 'A650BN' in name: terms = ['A650BN']
            elif 'CX650' in name: terms = ['CX650']
            elif '24U411B' in name: terms = ['24U411B', 'LG']
            elif 'LM22-B201S' in name: terms = ['LM22-B201S', 'Dahua']
            elif 'VG249Q3A' in name: terms = ['VG249Q3A', 'ASUS']
            elif 'G502' in name: terms = ['G502']
            elif 'G102' in name: terms = ['G102']
            elif 'SUPERLIGHT 2' in name: terms = ['SUPERLIGHT']
            elif 'Kraken' in name: terms = ['Kraken']
            elif 'FURY Beast' in name: terms = ['FURY']
            elif 'VENGEANCE' in name: terms = ['VENGEANCE']

            found_direct = None
            for term in terms:
                url = f"https://ihavecpu.com/category/{ihv_cat}?search={term}"
                try:
                    r = await client.get(url, timeout=7.0)
                    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', r.text)
                    if m:
                        d = json.loads(m.group(1))
                        items = d.get('props', {}).get('pageProps', {}).get('product', {}).get('data', [])
                        # Search for best match
                        for it in items:
                            it_name = it.get('name_th', '')
                            # check if keywords match
                            kw_match = all(k.lower() in it_name.lower() for k in term.split('+'))
                            if kw_match:
                                pid = it.get('product_id')
                                p_slug = it.get('slug')
                                p_price = float(it.get('price_sale') or it.get('price') or 0)
                                direct_url = f"https://ihavecpu.com/product/{pid}/{p_slug}"
                                # verify direct url works (200)
                                r_test = await client.get(direct_url, timeout=5.0)
                                if r_test.status_code == 200:
                                    found_direct = {
                                        'url': direct_url,
                                        'price': p_price,
                                        'name': it_name
                                    }
                                    break
                    if found_direct:
                        break
                except Exception:
                    pass

            if found_direct:
                print(f"[FOUND DIRECT] {slug}: {found_direct['url']} (฿{found_direct['price']})", flush=True)
            else:
                fallback_url = f"https://ihavecpu.com/category/{ihv_cat}?search={terms[0] if terms else ''}"
                print(f"[FALLBACK CATEGORY] {slug}: {fallback_url}", flush=True)

if __name__ == '__main__':
    asyncio.run(check_all_ihavecpu())
