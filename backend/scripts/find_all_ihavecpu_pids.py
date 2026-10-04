import urllib.request
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

targets = [
    ('asus-dual-geforce-rtx-4060-evo-oc-8gb', 'graphic-card', '4060'),
    ('gigabyte-geforce-rtx-4070-super-windforce-oc-12g', 'graphic-card', '4070'),
    ('asus-prime-b760m-a-wifi', 'mainboard', 'B760M'),
    ('msi-mag-b650-tomahawk-wifi', 'mainboard', 'B650'),
    ('corsair-rm850e-850w-gold-atx3', 'power-supply', 'RM850'),
    ('lg-24u411b-b-23-8-ips-144hz-gaming-monitor', 'monitor', 'LG'),
    ('dahua-dhi-lm22-b201s-21-45-ips-100hz-monitor', 'monitor', 'Dahua'),
    ('nzxt-kraken-elite-360-rgb-black', 'cooling-system', 'Kraken')
]

for slug, cat, query in targets:
    url = f'https://ihavecpu.com/category/{cat}?search={urllib.parse.quote(query)}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html)
            if m:
                data = json.loads(m.group(1))
                items = data.get('props', {}).get('pageProps', {}).get('product', {}).get('data', [])
                print(f'=== {slug} ({len(items)} found) ===')
                for it in items[:4]:
                    pid = it.get('product_id')
                    name = it.get('name_th')
                    price = it.get('price_sale')
                    print(f'  ID: {pid} | Price: {price} | {name}')
    except Exception as e:
        print(f'{slug} Err: {e}')
