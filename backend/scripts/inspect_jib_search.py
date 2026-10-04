import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0'}
for s in ['/web/assets/js/template.js?v=1016', '/web/assets/js/home.js?v=1026']:
    url = 'https://www.jib.co.th' + s
    js = urllib.request.urlopen(urllib.request.Request(url, headers=headers)).read().decode('utf-8', 'ignore')
    for m in re.finditer(r'productTitle', js):
        start = max(0, m.start() - 100)
        end = min(len(js), m.end() + 200)
        print("MATCH:", js[start:end])
        print("="*40)
