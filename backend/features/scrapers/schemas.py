from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ScraperRunRequest(BaseModel):
    platform_slug: Optional[str] = None
    product_id: Optional[int] = None
    simulate_live: bool = False

class ScraperPlatformStatus(BaseModel):
    platform_name: str
    name: str = ""
    platform_slug: str
    slug: str = ""
    logo_url: Optional[str] = None
    base_url: str
    color: str = "#06b6d4"
    is_active: bool = True
    total_listings: int = 0
    products_count: int = 0
    last_run: Optional[datetime] = None
    last_scraped: Optional[datetime] = None
    thai_time_str: Optional[str] = None
    status: str = "ONLINE"
    mode: str = "REST / HTML Pipeline"
    response_time_ms: int = 210
    success_rate: float = 99.8


class ScrapeJobResult(BaseModel):
    job_id: str
    status: str
    started_at: datetime
    completed_at: datetime
    timestamp: Optional[datetime] = None
    thai_time_str: Optional[str] = None
    items_scraped: int
    products_scraped: int = 0
    prices_updated: int
    triggered_alerts: int
    auto_ingested_count: int = 0
    errors: List[str] = []
