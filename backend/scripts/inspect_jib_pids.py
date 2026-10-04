import urllib.request
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pids = ['60683', '32338', '39950', '61822', '61823', '75683', '59235', '50019', '64380', '75080', '70364']
for pid in pids:
    url = f'https://www.jib.co.th/web/product/readProduct/{pid}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8', 'ignore')
        t_m = re.search(r'<title>(.*?)</title>', html)
        title = t_m.group(1)[:45] if t_m else 'No title'
        # look for price
        p_m = re.findall(r'(\d{1,2},\d{3})\s*(?:บาท|.-)', html)
        p_strong = re.search(r'<strong>([0-9,]+)</strong>', html)
        p_val = p_strong.group(1) if p_strong else (p_m[0] if p_m else 'None')
        print(f"PID {pid} -> ฿{p_val} | {title}")
    except Exception as e:
        print(f"PID {pid} -> Error: {e}")
