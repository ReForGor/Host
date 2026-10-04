import urllib.request
import json
import sys

headers = {'User-Agent': 'Mozilla/5.0'}

queries = [
    'RM850e', 'A650BN', '9800X3D', 'Kraken Elite 360', 'B650 TOMAHAWK',
    'VG249Q', 'SN850X'
]

for q in queries:
    url = f'https://www.jib.co.th/web/index.php/product/search_suggestion?term={urllib.request.quote(q)}'
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=5)
        data = json.loads(r.read().decode('utf-8'))
        sys.stdout.buffer.write(f"\n=== Query: {q} ===\n".encode('utf-8'))
        rec = data.get('rec', [])
        for item in rec:
            sys.stdout.buffer.write(f"  REC: {item}\n".encode('utf-8'))
        keywords = data.get('keyword', [])
        for item in keywords:
            sys.stdout.buffer.write(f"  KEYWORD: {item}\n".encode('utf-8'))
    except Exception as e:
        print(f"Error {q}: {e}")
