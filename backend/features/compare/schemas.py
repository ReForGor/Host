from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.features.products.schemas import ProductDetailOut

class SpecRow(BaseModel):
    spec_key: str
    spec_label: str
    values: Dict[int, Any]

class MultiProductCompareResponse(BaseModel):
    products: List[ProductDetailOut]
    spec_matrix: List[SpecRow]
    price_winner_id: Optional[int] = None
    value_score_leader_id: Optional[int] = None
