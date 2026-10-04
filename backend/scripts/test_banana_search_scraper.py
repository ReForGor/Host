import httpx
import asyncio
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

async def test():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, verify=False) as client:
        # Check BaNANA search page
        r = await client.get('https://www.bnn.in.th/th/p?q=12400F', timeout=10.0)
        print('Status:', r.status_code)
        links = set(re.findall(r'href=[\'"](/th/p/[^\'"]+)[\'"]', r.text))
        print('Found links in page:', len(links))
        for l in list(links)[:10]:
            print(l)
        
        # Check if next_data or window.__INITIAL_STATE__ is present
        m = re.search(r'id="__NEXT_DATA__"[^>]*>(.*?)</script>', r.text)
        if m:
            print("Found __NEXT_DATA__!")
            data = json.loads(m.group(1))
            props = data.get('props', {}).get('pageProps', {})
            print("pageProps keys:", list(props.keys()))
            # check products
            prods = props.get('initialState', {}).get('products', {}).get('data', [])
            if not prods:
                prods = props.get('products', {}).get('data', [])
            print("Found products in next_data:", len(prods))
            for p in prods[:3]:
                print(p.get('name'), p.get('url_key'), p.get('price'))

if __name__ == '__main__':
    asyncio.run(test())
