from typing import List, Set
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.features.products.service import get_product_detail_service
from backend.features.compare.schemas import MultiProductCompareResponse, SpecRow

SPEC_LABELS = {
    "vram": "Video Memory (VRAM)",
    "bus_width": "Memory Bus Width",
    "cuda_cores": "CUDA Cores",
    "stream_processors": "Stream Processors",
    "boost_clock": "Boost Clock Speed",
    "base_clock": "Base Clock Speed",
    "cores_threads": "Cores / Threads",
    "cache": "L2 / L3 Cache",
    "socket": "CPU Socket",
    "tdp": "Thermal Design Power (TDP)",
    "interface": "Host Interface",
    "outputs": "Display Outputs",
    "power_connector": "Power Connector",
    "display": "Display Specs",
    "processor": "Processor / SoC",
    "gpu": "Dedicated Graphics",
    "memory": "RAM / Memory",
    "storage": "Storage / SSD",
    "battery": "Battery Capacity",
    "weight": "Weight",
    "capacity": "Storage / RAM Capacity",
    "speed": "Speed / Frequency",
    "seq_read": "Sequential Read Speed",
    "seq_write": "Sequential Write Speed",
    "tbw": "Endurance (TBW)",
    "screen_size": "Screen Size",
    "resolution_refresh": "Resolution & Refresh Rate",
    "response_time": "Response Time",
    "hdr": "HDR Certification",
    "sync": "Adaptive Sync Support",
    "wattage": "Power Output (Watts)",
    "efficiency": "Efficiency Rating",
    "modularity": "Cable Modularity"
}

async def compare_products_service(id_list: List[int], db: AsyncSession) -> MultiProductCompareResponse:
    product_details = []
    all_spec_keys: Set[str] = set()

    for pid in id_list:
        try:
            pdetail = await get_product_detail_service(pid, db)
            product_details.append(pdetail)
            if pdetail.specs:
                all_spec_keys.update(pdetail.specs.keys())
        except HTTPException:
            continue

    if not product_details:
        raise HTTPException(status_code=404, detail="No valid products found to compare")

    spec_matrix = []
    brand_row = SpecRow(
        spec_key="brand",
        spec_label="Brand",
        values={p.id: p.brand for p in product_details}
    )
    category_row = SpecRow(
        spec_key="category",
        spec_label="Category",
        values={p.id: p.category for p in product_details}
    )
    msrp_row = SpecRow(
        spec_key="msrp",
        spec_label="MSRP (฿ THB)",
        values={p.id: f"฿{p.msrp:,.2f}" if p.msrp else "N/A" for p in product_details}
    )
    lowest_price_row = SpecRow(
        spec_key="lowest_price",
        spec_label="Lowest Current Price (฿ THB)",
        values={p.id: f"฿{p.lowest_price:,.2f}" if p.lowest_price else "N/A" for p in product_details}
    )
    best_store_row = SpecRow(
        spec_key="best_store",
        spec_label="Best Deal Store",
        values={p.id: p.best_store or "N/A" for p in product_details}
    )
    spec_matrix.extend([brand_row, category_row, msrp_row, lowest_price_row, best_store_row])

    for key in sorted(all_spec_keys):
        label = SPEC_LABELS.get(key, key.replace("_", " ").title())
        val_map = {}
        for p in product_details:
            val_map[p.id] = (p.specs or {}).get(key, "—")
        spec_matrix.append(SpecRow(spec_key=key, spec_label=label, values=val_map))

    priced_products = [p for p in product_details if p.lowest_price is not None]
    price_winner_id = min(priced_products, key=lambda x: x.lowest_price).id if priced_products else None

    return MultiProductCompareResponse(
        products=product_details,
        spec_matrix=spec_matrix,
        price_winner_id=price_winner_id,
        value_score_leader_id=price_winner_id
    )
