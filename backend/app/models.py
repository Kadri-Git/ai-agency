from sqlalchemy import Column, String, DateTime, Text, Integer, Float, Boolean
from sqlalchemy.sql import func
from app.database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    ga4_property_id = Column(String, nullable=True)  # Nullable for demo mode
    ga4_service_account_json = Column(Text, nullable=True)  # Nullable for demo mode
    is_demo = Column(Boolean, default=False)  # Demo mode flag
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

