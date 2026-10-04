import urllib.request
import re
import sys
import json
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

url = 'https://www.advice.co.th/product/graphic-card/nvidia-4060/vga-asus-dual-geforce-rtx-4060-evo-oc-8gb-gddr6'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req).read().decode('utf-8', 'ignore')

print("Status: 200, length:", len(html))

lines = html.split('\n')
print(f"Total lines: {len(lines)}")
nuxt_m = re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
if nuxt_m:
    print("FOUND NUXT DATA, length:", len(nuxt_m.group(1)))
    nuxt_data = json.loads(nuxt_m.group(1))
    print("Nuxt data item count:", len(nuxt_data))
    import pprint
    pprint.pprint(nuxt_data)

