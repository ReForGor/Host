import urllib.request
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect iHaveCPU by fetching pages or searching specific models
def find_ihavecpu(category, kw):
    found = []
    for page in range(1, 4):
        url = f'https://ihavecpu.com/category/{category}?page={page}&search={urllib.parse.quote(kw)}'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        try:
            with urllib.request.urlopen(req, timeout=6) as resp:
                html = resp.read().decode('utf-8', errors='ignore')
                m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html)
                if m:
                    data = json.loads(m.group(1))
                    items = data.get('props', {}).get('pageProps', {}).get('product', {}).get('data', [])
                    for it in items:
                        name = it.get('name_th', '')
                        if all(w.lower() in name.lower() for w in kw.split()):
                            found.append({
                                'id': it.get('product_id'),
                                'name': name,
                                'price': float(it.get('price_sale', 0))
                            })
                    if found:
                        break
        except Exception as e:
            pass
    return found

searches = [
    ('graphic-card', 'RTX 4060 DUAL'),
    ('graphic-card', '4070 SUPER'),
    ('mainboard', 'B760M-A WIFI'),
    ('mainboard', 'B650M GAMING PLUS'),
    ('power-supply', 'RM850e'),
    ('monitor', '24U411B'),
    ('cooling-system', 'Kraken Elite')
]

for cat, kw in searches:
    res = find_ihavecpu(cat, kw)
    print(f'=== {kw} ({len(res)} matches) ===')
    for r in res[:3]:
        print(f"  ID: {r['id']} | Price: {r['price']} | {r['name']}")
