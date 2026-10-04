import urllib.request
import re

u = 'https://www.advice.co.th/product/graphic-card/nvidia-4060/vga-asus-dual-geforce-rtx-4060-evo-oc-8gb-gddr6'
req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', 'ignore')

print("HTML length:", len(html))
print("Scripts found:", re.findall(r'<script[^>]*src="([^"]+)"', html)[:5])
print("Any A01 codes:", set(re.findall(r'A[0-9]{7}', html)))
for line in html.split('\n'):
    if 'DUAL' in line or '4060' in line or 'ASUS' in line:
        print(line[:100])
        break
