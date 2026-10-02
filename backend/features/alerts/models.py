from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.core.database import Base
import backend.features.auth.models
import backend.features.products.models

class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    target_price = Column(Float, nullable=False)
    currency = Column(String(10), default="THB")
    current_lowest_price = Column(Float, nullable=True)
    last_notified_price = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    triggered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")
    product = relationship("Product", back_populates="alerts")

    def __repr__(self):
        return f"<PriceAlert user={self.user_id} {self.email} target={self.target_price}>"

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    recipient = Column(String(255), nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    html_content = Column(Text, nullable=False)
    status = Column(String(50), default="sent", index=True)
    error_message = Column(Text, nullable=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<EmailLog {self.recipient} subject='{self.subject}' status={self.status}>"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_id = Column(Integer, ForeignKey("price_alerts.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    old_price = Column(Float, nullable=True)
    new_price = Column(Float, nullable=False)
    store_name = Column(String(100), nullable=True)
    product_url = Column(String(1000), nullable=True)
    currency = Column(String(10), default="THB")
    
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="notifications")
    product = relationship("Product")

    def __repr__(self):
        return f"<Notification {self.title} price={self.new_price} is_read={self.is_read}>"
