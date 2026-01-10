from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# SQLite database path
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./farm_context.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class FarmContext(Base):
    __tablename__ = "farm_contexts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)  # Can be phone number or session ID
    crop_type = Column(String)
    crop_name = Column(String)
    quantity = Column(Float)
    location = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    storage_type = Column(String)
    storage_capacity = Column(Float)
    risk_tolerance = Column(String, default="medium")
    preferred_markets = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    context_data = Column(JSON, default=dict)  # Store full context as JSON

class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_context_id = Column(Integer, index=True)
    recommendation_type = Column(String)  # sell_now, store, sell_later
    target_market = Column(String)
    expected_revenue = Column(Float)
    net_profit = Column(Float)
    confidence = Column(Float)
    reasoning = Column(JSON)
    risks = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

