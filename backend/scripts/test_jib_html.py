import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')
url = 'https://www.jib.co.th/web/product/readProduct/58961'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
idx = html.find('14,990')
print(html[idx-250:idx+50])
