from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from datetime import datetime

# Auth schemas
class ClientRegister(BaseModel):
    email: EmailStr
    password: str
    company_name: str
    ga4_property_id: Optional[str] = None
    ga4_service_account_json: Optional[str] = None
    is_demo: bool = False

class ClientLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    client_id: str
    email: str

# Dashboard schemas
class AITrafficMetrics(BaseModel):
    ai_sessions: int
    ai_revenue: float
    ai_conversion_rate: float
    ai_average_order_value: float
    ai_revenue_per_session: float
    site_avg_conversion_rate: float
    ai_vs_site_conversion_rate: float  # Difference/ratio

class RevenueTrendPoint(BaseModel):
    date: str
    revenue: float

class RevenueTrend(BaseModel):
    data: list[RevenueTrendPoint]

class TopLandingPage(BaseModel):
    page_path: str
    sessions: int
    revenue: float
    conversion_rate: float

class DashboardData(BaseModel):
    metrics: AITrafficMetrics
    revenue_trend: RevenueTrend
    top_landing_pages: list[TopLandingPage]

