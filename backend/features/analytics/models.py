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
