import urllib.request
import re
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.features.scrapers.verified_catalog import VERIFIED_4_STORES_PRODUCTS, AUTO_INGEST_DISCOVERY_POOL

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}

all_prods = VERIFIED_4_STORES_PRODUCTS + AUTO_INGEST_DISCOVERY_POOL

def get_title(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        html = urllib.request.urlopen(req, timeout=6).read().decode('utf-8', 'ignore')
        m = re.findall(r'<title>([^<]+)</title>', html)
        if m:
            return m[0].strip()
        # check h1
        h1 = re.findall(r'<h1[^>]*>([^<]+)</h1>', html)
        if h1:
            return h1[0].strip()
        return "NO_TITLE"
    except Exception as e:
        return f"ERROR: {e}"

def main():
    print(f"Deep Checking all {len(all_prods)} products...")
    for idx, p in enumerate(all_prods, 1):
        slug = p["slug"]
        name = p["name"]
        model = p.get("model_no", "")
        print(f"\n[{idx}/28] {slug}")
        print(f"Product: {name} (Model: {model})")
        
        # Check JIB
        jib_url = p.get("prices", {}).get("jib", {}).get("url")
        if jib_url:
            t = get_title(jib_url)
            sys.stdout.buffer.write(f"  JIB     [{jib_url}]: {t}\n".encode('utf-8'))
            
        # Check Advice
        adv_url = p.get("prices", {}).get("advice", {}).get("url")
        if adv_url:
            t = get_title(adv_url)
            sys.stdout.buffer.write(f"  Advice  [{adv_url}]: {t}\n".encode('utf-8'))

if __name__ == "__main__":
    main()
