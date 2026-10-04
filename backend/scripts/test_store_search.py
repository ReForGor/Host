import urllib.request
import re
import json

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}

def search_jib(keyword):
    # JIB search endpoint
    url = f"https://www.jib.co.th/web/product/searchProduct/{urllib.request.quote(keyword)}"
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8', 'ignore')
        # find product links
        items = re.findall(r'href="https://www\.jib\.co\.th/web/product/readProduct/([0-9]+)"[^>]*>([^<]+)</a>', html)
        if not items:
            items = re.findall(r'/web/product/readProduct/([0-9]+)', html)
            print(f"JIB raw pids for {keyword}:", items[:5])
        else:
            print(f"JIB items for {keyword}:", items[:3])
    except Exception as e:
        print(f"JIB search fail: {e}")

def search_advice(keyword):
    url = f"https://www.advice.co.th/search?keyword={urllib.request.quote(keyword)}"
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8', 'ignore')
        items = re.findall(r'href="https://www\.advice\.co\.th/product/([A-Z0-9]+)"', html)
        print(f"Advice items for {keyword}:", set(items))
    except Exception as e:
        print(f"Advice search fail: {e}")

if __name__ == "__main__":
    search_jib("DUAL-RTX4060-O8G-EVO")
    search_advice("DUAL-RTX4060-O8G-EVO")
    search_jib("SNV3S/1000G")
    search_advice("SNV3S/1000G")
