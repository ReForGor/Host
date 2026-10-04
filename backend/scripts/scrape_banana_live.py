import httpx
import asyncio
import re
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.features.scrapers.verified_catalog import VERIFIED_4_STORES_PRODUCTS

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

search_queries = {
    'asus-dual-geforce-rtx-4060-evo-oc-8gb': 'RTX 4060 EVO',
    'gigabyte-geforce-rtx-4070-super-windforce-oc-12g': 'RTX 4070 SUPER WINDFORCE',
    'amd-ryzen-7-7800x3d': '7800X3D',
    'intel-core-i5-12400f': '12400F',
    'amd-ryzen-5-5600': 'Ryzen 5 5600',
    'amd-ryzen-5-5500': 'Ryzen 5 5500',
    'kingston-nv3-1tb-pcie-4-nvme-ssd': 'Kingston NV3 1TB',
    'kingston-nv3-500gb-pcie-4-nvme-ssd': 'Kingston NV3 500GB',
    'kingston-nv3-2tb-pcie-4-nvme-ssd': 'Kingston NV3 2TB',
    'kingston-fury-beast-ddr4-16gb-3200mhz': 'Kingston FURY Beast DDR4 16GB 3200',
    'kingston-fury-beast-ddr5-32gb-5600mhz': 'Kingston FURY Beast DDR5 32GB 5600',
    'corsair-vengeance-rgb-ddr5-32gb-6000mhz': 'Corsair Vengeance RGB DDR5 32GB 6000',
    'samsung-990-pro-2tb-nvme-ssd': 'Samsung 990 PRO 2TB',
    'wd-black-sn850x-1tb-nvme-ssd': 'WD Black SN850X 1TB',
    'asus-prime-b760m-a-wifi': 'PRIME B760M-A WIFI',
    'msi-mag-b650-tomahawk-wifi': 'B650M Gaming Plus WiFi',
    'corsair-rm850e-850w-gold-atx3': 'Corsair RM850e',
    'msi-mag-a650bn-650w-bronze': 'MSI MAG A650BN',
    'corsair-cx650-650w-bronze': 'Corsair CX650',
    'lg-24u411b-b-23-8-ips-144hz-gaming-monitor': 'LG 24U411B-B',
    'dahua-dhi-lm22-b201s-21-45-ips-100hz-monitor': 'DHI-LM22-B201S',
    'asus-tuf-gaming-vg249q3a-23-8-ips-180hz': 'ASUS VG259Q5A',
    'logitech-g502-hero-high-performance': 'G502 HERO',
    'logitech-g102-lightsync-black': 'G102 LIGHTSYNC',
    'logitech-g-pro-x-superlight-2-black': 'G PRO X SUPERLIGHT 2',
    'logitech-g-pro-x-superlight-2-white': 'G PRO X SUPERLIGHT 2',
    'nzxt-kraken-elite-360-rgb-black': 'NZXT Kraken 360'
}

async def fetch_banana(client, slug, q):
    import urllib.parse
    url = f"https://www.bnn.in.th/th/p?q={urllib.parse.quote(q)}"
    try:
        r = await client.get(url, timeout=10.0)
        if r.status_code == 200:
            # find links
            links = re.findall(r'href=[\'"](/th/p/[^\'\"?#]+_[a-z0-9]+)', r.text)
            clean_links = [l for l in links if 'computer-set' not in l and 'notebook' not in l and 'laptop' not in l and 'desktops' not in l]
            if clean_links:
                direct = f"https://www.bnn.in.th{clean_links[0]}"
                # check page
                pr = await client.get(direct, timeout=8.0)
                if pr.status_code == 200:
                    for s in re.findall(r'<script[^>]*>(.*?)</script>', pr.text, re.DOTALL):
                        if '"@type":"Product"' in s:
                            p_data = json.loads(s)
                            return {
                                'slug': slug,
                                'url': direct,
                                'price': float(p_data.get('offers', {}).get('price', 0)),
                                'name': p_data.get('name'),
                                'image': p_data.get('image', [None])[0] if isinstance(p_data.get('image'), list) else p_data.get('image')
                            }
                    return {'slug': slug, 'url': direct, 'price': None, 'name': None, 'image': None}
        return {'slug': slug, 'url': url, 'price': None, 'name': None, 'image': None}
    except Exception as e:
        return {'slug': slug, 'url': f"https://www.bnn.in.th/th/p?q={q}", 'error': str(e)}

async def main():
    async with httpx.AsyncClient(headers=headers, follow_redirects=True, verify=False) as client:
        tasks = [fetch_banana(client, slug, q) for slug, q in search_queries.items()]
        results = await asyncio.gather(*tasks)
        with open('banana_live_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"Done! Collected {len(results)} BaNANA items.")

if __name__ == '__main__':
    asyncio.run(main())
