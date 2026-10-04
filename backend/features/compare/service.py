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

    import re

    # Calculate Spec-to-Price Value Score (e.g. THB per Core, THB per GB, THB per Hz)
    value_scores_map = {}
    value_numeric_scores = {}
    metric_label = "ความคุ้มค่าราคาต่อหน่วย"

    for p in product_details:
        if not p.lowest_price or p.lowest_price <= 0:
            continue
        specs = p.specs or {}
        cat = (p.category or "").lower()

        calculated = False
        if "cpu" in cat or "processor" in cat:
            cores_val = specs.get("Cores") or specs.get("cores_threads") or ""
            match = re.search(r"(\d+)\s*(?:cores|p-cores|core)", cores_val, re.IGNORECASE)
            if match:
                cores = float(match.group(1))
                if cores > 0:
                    cost_per_core = p.lowest_price / cores
                    value_numeric_scores[p.id] = cost_per_core
                    value_scores_map[p.id] = f"฿{cost_per_core:,.0f} / Core"
                    metric_label = "ต้นทุนต่อ Core (฿/Core - ยิ่งต่ำยิ่งคุ้ม)"
                    calculated = True

        elif "gpu" in cat or "graphics" in cat:
            vram_val = specs.get("VRAM") or specs.get("vram") or ""
            match = re.search(r"(\d+)\s*gb", vram_val, re.IGNORECASE)
            if match:
                vram = float(match.group(1))
                if vram > 0:
                    cost_per_gb = p.lowest_price / vram
                    value_numeric_scores[p.id] = cost_per_gb
                    value_scores_map[p.id] = f"฿{cost_per_gb:,.0f} / GB VRAM"
                    metric_label = "ต้นทุนต่อ GB VRAM (฿/GB - ยิ่งต่ำยิ่งคุ้ม)"
                    calculated = True

        elif "ram" in cat or "memory" in cat:
            cap_val = specs.get("Capacity") or specs.get("capacity") or ""
            match = re.search(r"(\d+)\s*gb", cap_val, re.IGNORECASE)
            if match:
                ram_gb = float(match.group(1))
                if ram_gb > 0:
                    cost_per_gb = p.lowest_price / ram_gb
                    value_numeric_scores[p.id] = cost_per_gb
                    value_scores_map[p.id] = f"฿{cost_per_gb:,.1f} / GB"
                    metric_label = "ต้นทุนต่อ GB RAM (฿/GB - ยิ่งต่ำยิ่งคุ้ม)"
                    calculated = True

        elif "storage" in cat or "ssd" in cat or "hdd" in cat:
            cap_val = specs.get("Capacity") or specs.get("capacity") or ""
            gb = 0
            if "tb" in cap_val.lower():
                tb_match = re.search(r"(\d+)\s*tb", cap_val, re.IGNORECASE)
                if tb_match:
                    gb = float(tb_match.group(1)) * 1000
            else:
                gb_match = re.search(r"(\d+)\s*gb", cap_val, re.IGNORECASE)
                if gb_match:
                    gb = float(gb_match.group(1))
            if gb > 0:
                cost_per_gb = p.lowest_price / gb
                value_numeric_scores[p.id] = cost_per_gb
                value_scores_map[p.id] = f"฿{cost_per_gb:,.2f} / GB"
                metric_label = "ต้นทุนต่อความจุ (฿/GB - ยิ่งต่ำยิ่งคุ้ม)"
                calculated = True

        elif "monitor" in cat or "display" in cat:
            hz_val = specs.get("Refresh Rate") or specs.get("refresh_rate") or ""
            match = re.search(r"(\d+)\s*hz", hz_val, re.IGNORECASE)
            if match:
                hz = float(match.group(1))
                if hz > 0:
                    cost_per_hz = p.lowest_price / hz
                    value_numeric_scores[p.id] = cost_per_hz
                    value_scores_map[p.id] = f"฿{cost_per_hz:,.1f} / Hz"
                    metric_label = "ต้นทุนต่อรีเฟรชเรท (฿/Hz - ยิ่งต่ำยิ่งคุ้ม)"
                    calculated = True

        if not calculated:
            # General fallback: discount percentage from MSRP or lowest price
            disc = ((p.msrp - p.lowest_price) / p.msrp * 100) if (p.msrp and p.msrp > p.lowest_price) else 0.0
            value_numeric_scores[p.id] = p.lowest_price
            value_scores_map[p.id] = f"฿{p.lowest_price:,.0f} (-{disc:.0f}%)" if disc > 0 else f"฿{p.lowest_price:,.0f}"

    if value_numeric_scores:
        value_score_leader_id = min(value_numeric_scores, key=value_numeric_scores.get)
    else:
        value_score_leader_id = price_winner_id

    # Add Value Score row to spec matrix
    spec_matrix.insert(4, SpecRow(
        spec_key="value_score",
        spec_label=f"Value Score ({metric_label})",
        values={p.id: value_scores_map.get(p.id, "N/A") for p in product_details}
    ))

    return MultiProductCompareResponse(
        products=product_details,
        spec_matrix=spec_matrix,
        price_winner_id=price_winner_id,
        value_score_leader_id=value_score_leader_id,
        value_score_reason=metric_label,
        value_scores=value_scores_map
    )
