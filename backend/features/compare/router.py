from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import get_db
from backend.features.compare.schemas import MultiProductCompareResponse
from backend.features.compare.service import compare_products_service

router = APIRouter(prefix="/api/compare", tags=["Comparison"])

@router.get("", response_model=MultiProductCompareResponse)
async def compare_multiple_products(
    ids: str = Query(..., description="Comma separated list of product IDs (e.g. 1,2,3)"),
    db: AsyncSession = Depends(get_db)
):
    try:
        id_list = [int(i.strip()) for i in ids.split(",") if i.strip().isdigit()]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID list format")

    if not id_list:
        raise HTTPException(status_code=400, detail="No product IDs provided")

    return await compare_products_service(id_list=id_list, db=db)
