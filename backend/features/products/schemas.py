from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class StoreBase(BaseModel):
    name: str
    slug: str
    logo_url: Optional[str] = None
    base_url: str
    color: Optional[str] = "#06b6d4"
    scraper_type: Optional[str] = "generic"
    is_active: bool = True

class StoreCreate(StoreBase):
    pass

class StoreOut(StoreBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PriceListingBase(BaseModel):
    product_id: int
    store_id: int
    price: float
    original_price: Optional[float] = None
    currency: str = "THB"
    product_url: str
    stock_status: str = "in_stock"
    shipping_cost: float = 0.0
    seller_name: Optional[str] = None
    rating: float = 4.8
    review_count: int = 0
    is_available: bool = True

class PriceListingCreate(PriceListingBase):
    pass

class PriceListingOut(PriceListingBase):
    id: int
    last_checked: datetime
    store: Optional[StoreOut] = None
    model_config = ConfigDict(from_attributes=True)

class PlatformComparisonItem(BaseModel):
    store_id: int
    store_name: str
    store_slug: str
    store_logo: Optional[str] = None
    store_color: str = "#06b6d4"
    price: float
    original_price: Optional[float] = None
    currency: str = "THB"
    discount_percent: float = 0.0
    price_diff_from_lowest: float = 0.0
    is_lowest: bool = False
    stock_status: str = "in_stock"
    shipping_cost: float = 0.0
    total_price: float
    product_url: str
    rating: float = 4.8
    review_count: int = 0
    last_checked: datetime

class ProductBase(BaseModel):
    name: str
    slug: str
    category: str
    brand: str
    model_no: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    msrp: Optional[float] = None
    specs: Dict[str, Any] = {}

class ProductCreate(ProductBase):
    pass

class ProductSummaryOut(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    lowest_price: Optional[float] = None
    highest_price: Optional[float] = None
    store_count: int = 0
    best_store_name: Optional[str] = None
    best_store_logo: Optional[str] = None
    best_product_url: Optional[str] = None
    max_discount_percent: float = 0.0
    savings_amount: Optional[float] = 0.0
    savings_percent: Optional[float] = 0.0
    price_trend: Optional[str] = "stable"
    price_trend_text: Optional[str] = "ราคาคงที่"
    volatility_score: Optional[float] = 0.0
    suggested_target_price: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)

class ProductDetailOut(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    lowest_price: Optional[float] = None
    highest_price: Optional[float] = None
    avg_price: Optional[float] = None
    total_savings: Optional[float] = None
    savings_percent: Optional[float] = 0.0
    best_store: Optional[str] = None
    price_trend: Optional[str] = "stable"
    price_trend_text: Optional[str] = "ราคาคงที่"
    volatility_score: Optional[float] = 0.0
    suggested_target_price: Optional[float] = None
    platforms: List[PlatformComparisonItem] = []
    model_config = ConfigDict(from_attributes=True)

class StoreHistorySeries(BaseModel):
    store_name: str
    store_id: int
    store_color: str
    data_points: List[Dict[str, Any]]

class ProductPriceHistoryOut(BaseModel):
    product_id: int
    product_name: str
    lowest_historical_price: float
    highest_historical_price: float
    current_lowest_price: float
    series: List[StoreHistorySeries]
    market_average_series: Optional[List[Dict[str, Any]]] = []
    suggested_target_price: Optional[float] = None
    volatility_cv_percent: Optional[float] = 0.0
