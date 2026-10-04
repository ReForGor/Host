import urllib.request
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = 'https://www.bnn.in.th/th/p?q=MSI+A650BN'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=8) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        # find product links in html
        links = re.findall(r'href=[\"\'](/th/p/[^\"\'?]+)[\"\']', html)
        print('Found product links in BaNANA search:', len(links))
        for l in set(links):
            print('  https://www.bnn.in.th' + l)
except Exception as e:
    print('Err:', e)
