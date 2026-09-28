from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class AlertCreate(BaseModel):
    product_id: int
    email: str
    target_price: float
    currency: str = "THB"

class AlertOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    product_id: int
    email: str
    target_price: float
    currency: str
    current_lowest_price: Optional[float] = None
    last_notified_price: Optional[float] = None
    is_active: bool
    triggered_at: Optional[datetime] = None
    created_at: datetime
    product_name: Optional[str] = None
    product_image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class NotificationOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    email: Optional[str] = None
    product_id: int
    alert_id: Optional[int] = None
    title: str
    message: str
    old_price: Optional[float] = None
    new_price: float
    store_name: Optional[str] = None
    product_url: Optional[str] = None
    currency: str = "THB"
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EmailLogOut(BaseModel):
    id: int
    recipient: str
    subject: str
    status: str
    error_message: Optional[str] = None
    product_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
