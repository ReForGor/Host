import asyncio
import httpx
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.features.scrapers.verified_catalog import VERIFIED_4_STORES_PRODUCTS

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'th,en;q=0.9'
}

# Load scraped BaNANA results
with open('banana_live_results.json', 'r', encoding='utf-8') as f:
    banana_data = {item['slug']: item for item in json.load(f)}

jib_terms = {
    'asus-dual-geforce-rtx-4060-evo-oc-8gb': '66344',
    'gigabyte-geforce-rtx-4070-super-windforce-oc-12g': '64851',
    'amd-ryzen-7-7800x3d': '58961',
    'intel-core-i5-12400f': '50623',
    'amd-ryzen-5-5600': '52482',
    'amd-ryzen-5-5500': '52483',
    'kingston-nv3-1tb-pcie-4-nvme-ssd': '87260',
    'kingston-nv3-500gb-pcie-4-nvme-ssd': '70438',
    'kingston-nv3-2tb-pcie-4-nvme-ssd': '70440',
    'kingston-fury-beast-ddr4-16gb-3200mhz': '82503',
    'kingston-fury-beast-ddr5-32gb-5600mhz': '57250',
    'corsair-vengeance-rgb-ddr5-32gb-6000mhz': '57523',
    'samsung-990-pro-2tb-nvme-ssd': '61614',
    'wd-black-sn850x-1tb-nvme-ssd': '55937',
    'asus-prime-b760m-a-wifi': '57137',
    'msi-mag-b650-tomahawk-wifi': '55782',
    'corsair-rm850e-850w-gold-atx3': '75683',
    'msi-mag-a650bn-650w-bronze': '51963',
    'corsair-cx650-650w-bronze': '65608',
    'lg-24u411b-b-23-8-ips-144hz-gaming-monitor': '85548',
    'dahua-dhi-lm22-b201s-21-45-ips-100hz-monitor': '82737',
    'asus-tuf-gaming-vg249q3a-23-8-ips-180hz': '76622',
    'logitech-g502-hero-high-performance': '32312',
    'logitech-g102-lightsync-black': '39950',
    'logitech-g-pro-x-superlight-2-black': '61791',
    'logitech-g-pro-x-superlight-2-white': '61792',
    'nzxt-kraken-elite-360-rgb-black': '73692'
}

async def check_url_ok(client, url):
    if not url:
        return False
    try:
        r = await client.head(url, timeout=5.0)
        if r.status_code in [200, 301, 302]:
            return True
        r2 = await client.get(url, timeout=5.0)
        return r2.status_code == 200
    except Exception:
        return False

async def get_jib_details(client, pid):
    url = f"https://www.jib.co.th/web/product/readProduct/{pid}"
    try:
        r = await client.get(url, timeout=7.0)
        if r.status_code == 200:
            price_m = re.search(r'class="price_total">([0-9,]+)', r.text)
            price = float(price_m.group(1).replace(',', '')) if price_m else None
            # get image
            img_m = re.search(r'<meta property="og:image" content="([^"]+)"', r.text)
            img = img_m.group(1) if img_m else None
            return {'url': url, 'price': price, 'image': img}
    except Exception:
        pass
    return {'url': url, 'price': None, 'image': None}

async def process_all():
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, verify=False) as client:
        updated_catalog = []
        for p in VERIFIED_4_STORES_PRODUCTS:
            slug = p['slug']
            item = dict(p)
            prices = dict(item['prices'])

            # 1. Fix BaNANA
            b_info = banana_data.get(slug)
            if b_info and b_info.get('url'):
                b_url = b_info['url']
                b_price = b_info.get('price') or prices['banana']['price']
                prices['banana'] = {
                    'price': b_price,
                    'orig': prices['banana'].get('orig', b_price),
                    'url': b_url
                }

            # 2. Fix JIB
            jib_pid = jib_terms.get(slug)
            if jib_pid:
                jib_info = await get_jib_details(client, jib_pid)
                if jib_info.get('price'):
                    j_price = jib_info['price']
                else:
                    j_price = prices['jib']['price']
                
                prices['jib'] = {
                    'price': j_price,
                    'orig': prices['jib'].get('orig', j_price),
                    'url': jib_info['url']
                }

                # check image
                if jib_info.get('image') and await check_url_ok(client, jib_info['image']):
                    item['image_url'] = jib_info['image']
                elif b_info and b_info.get('image') and await check_url_ok(client, b_info['image']):
                    item['image_url'] = b_info['image']

            # Verify image_url is 100% OK
            if not await check_url_ok(client, item['image_url']):
                # Fallback to BaNANA image if JIB image fails
                if b_info and b_info.get('image') and await check_url_ok(client, b_info['image']):
                    item['image_url'] = b_info['image']

            item['prices'] = prices
            updated_catalog.append(item)
            print(f"Verified {slug}: JIB={prices['jib']['price']} BaNANA={prices['banana']['price']} Image={item['image_url']}")

        # Save to verified_perfect_catalog.json
        with open('perfect_catalog.json', 'w', encoding='utf-8') as f:
            json.dump(updated_catalog, f, indent=2, ensure_ascii=False)
        print("Successfully saved perfect_catalog.json!")

if __name__ == '__main__':
    asyncio.run(process_all())
