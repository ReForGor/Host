from datetime import datetime
from sqlalchemy import Column, Integer, BigInteger, String, DateTime, Text, func, UniqueConstraint
from backend.core.database import Base

class VisitorRecord(Base):
    __tablename__ = "visitor_records"
    __table_args__ = (UniqueConstraint("session_id", name="uq_visitor_records_session_id"),)

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), index=True, nullable=False)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(255), nullable=True)
    path = Column(String(255), default="/")
    user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow, index=True)

class SystemMetric(Base):
    __tablename__ = "system_metrics"

    metric_key = Column(String(50), primary_key=True)
    metric_value = Column(BigInteger, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class OutboundClickLog(Base):
    __tablename__ = "outbound_click_logs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=True, index=True)
    product_name = Column(String(255), nullable=True)
    store_name = Column(String(100), nullable=True, index=True)
    target_url = Column(String(1000), nullable=False)
    price = Column(BigInteger, nullable=True)
    user_id = Column(Integer, nullable=True, index=True)
    session_id = Column(String(64), nullable=True, index=True)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(255), nullable=True)
    source_page = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

