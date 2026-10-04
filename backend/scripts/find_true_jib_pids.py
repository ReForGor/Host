import urllib.request
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

targets = [
    ("asus-tuf-gaming-vg249q3a-23-8-ips-180hz", "VG249Q3A"),
    ("logitech-g502-hero-high-performance", "G502 HERO"),
    ("logitech-g-pro-x-superlight-2-black", "SUPERLIGHT 2"),
    ("logitech-g-pro-x-superlight-2-white", "SUPERLIGHT 2"),
    ("msi-mag-a650bn-650w-bronze", "A650BN"),
    ("corsair-cx650-650w-bronze", "CX650"),
    ("lg-24u411b-b-23-8-ips-144hz-gaming-monitor", "24U411B"),
    ("dahua-dhi-lm22-b201s-21-45-ips-100hz-monitor", "LM22-B201S"),
    ("nzxt-kraken-elite-360-rgb-black", "Kraken Elite 360")
]

for slug, query in targets:
    url = f'https://www.jib.co.th/web/index.php/product/search_suggestion?term={urllib.request.quote(query)}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        data = json.loads(urllib.request.urlopen(req, timeout=5).read().decode('utf-8'))
        recs = data.get('rec', [])
        print(f"\n=== {slug} (query: {query}) -> {len(recs)} recs ===")
        for r in recs:
            pid = str(r.get('id', '')).lstrip('0')
            name = r.get('name')
            price = r.get('price')
            
            # verify on JIB readProduct
            p_url = f'https://www.jib.co.th/web/product/readProduct/{pid}'
            p_req = urllib.request.Request(p_url, headers={'User-Agent': 'Mozilla/5.0'})
            p_html = urllib.request.urlopen(p_req, timeout=5).read().decode('utf-8', 'ignore')
            t_m = re.search(r'<title>(.*?)</title>', p_html)
            title = t_m.group(1)[:60] if t_m else 'No title'
            print(f"  PID {pid} | Price {price} | Title: {title}")
            print(f"    URL: {p_url}")
    except Exception as e:
        print(f"Err {slug}: {e}")
