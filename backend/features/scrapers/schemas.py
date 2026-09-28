from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ScraperRunRequest(BaseModel):
    platform_slug: Optional[str] = None
    product_id: Optional[int] = None
    simulate_live: bool = False

class ScraperPlatformStatus(BaseModel):
    platform_name: str
    platform_slug: str
    logo_url: Optional[str] = None
    base_url: str
    color: str = "#06b6d4"
    is_active: bool = True
    total_listings: int = 0
    last_run: Optional[datetime] = None
    status: str = "ready"
    success_rate: float = 99.8

class ScrapeJobResult(BaseModel):
    job_id: str
    status: str
    started_at: datetime
    completed_at: datetime
    items_scraped: int
    prices_updated: int
    triggered_alerts: int
    errors: List[str] = []
