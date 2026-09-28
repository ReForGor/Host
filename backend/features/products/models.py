from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.core.database import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    logo_url = Column(String(500), nullable=True)
    base_url = Column(String(500), nullable=False)
    color = Column(String(20), default="#06b6d4")  # Cyan accent for modern UI
    scraper_type = Column(String(50), default="generic")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship("PriceListing", back_populates="store", cascade="all, delete-orphan")
    price_histories = relationship("PriceHistory", back_populates="store", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Store {self.name}>"

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    category = Column(String(100), nullable=False, index=True)
    brand = Column(String(100), nullable=False, index=True)
    model_no = Column(String(100), nullable=True)
    image_url = Column(String(1000), nullable=True)
    description = Column(Text, nullable=True)
    msrp = Column(Float, nullable=True)
    specs = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    listings = relationship("PriceListing", back_populates="product", cascade="all, delete-orphan")
    price_histories = relationship("PriceHistory", back_populates="product", cascade="all, delete-orphan")
    alerts = relationship("PriceAlert", back_populates="product", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Product {self.name}>"

class PriceListing(Base):
    __tablename__ = "price_listings"
    __table_args__ = (
        UniqueConstraint('product_id', 'store_id', name='_product_store_uc'),
    )

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    
    price = Column(Float, nullable=False, index=True)
    original_price = Column(Float, nullable=True)
    currency = Column(String(10), default="THB")
    product_url = Column(String(1000), nullable=False)
    
    stock_status = Column(String(50), default="in_stock")
    shipping_cost = Column(Float, default=0.0)
    seller_name = Column(String(100), nullable=True)
    rating = Column(Float, default=4.8)
    review_count = Column(Integer, default=0)
    
    last_checked = Column(DateTime, default=datetime.utcnow, index=True)
    is_available = Column(Boolean, default=True)

    product = relationship("Product", back_populates="listings")
    store = relationship("Store", back_populates="listings")

    def __repr__(self):
        return f"<PriceListing product_id={self.product_id} store_id={self.store_id} price={self.price}>"

class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False, index=True)
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="THB")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    product = relationship("Product", back_populates="price_histories")
    store = relationship("Store", back_populates="price_histories")

    def __repr__(self):
        return f"<PriceHistory prod={self.product_id} store={self.store_id} price={self.price}>"
