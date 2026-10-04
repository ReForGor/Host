import httpx
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

r = httpx.get('https://ihavecpu.com/', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
scripts = re.findall(r'src=["\'](/_next/static/chunks/[^"\']+)["\']', r.text)
print(f"Total chunks: {len(scripts)}")
apis = set()
for s in scripts:
    try:
        r_js = httpx.get('https://ihavecpu.com' + s, headers={'User-Agent': 'Mozilla/5.0'})
        for m in re.findall(r'https?://[a-zA-Z0-9_.-]+(?:ihavecpu|api)[a-zA-Z0-9_./-]+', r_js.text):
            apis.add(m)
        for m in re.findall(r'/api/[a-zA-Z0-9_/-]+', r_js.text):
            apis.add(m)
    except Exception:
        pass

for a in sorted(apis):
    if any(k in a.lower() for k in ['product', 'search', 'item', 'cate']):
        print("API:", a)
