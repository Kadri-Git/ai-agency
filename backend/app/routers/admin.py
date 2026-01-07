from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Client
from app.auth import get_current_admin
from app.schemas import DashboardData, AITrafficMetrics, RevenueTrend, RevenueTrendPoint, TopLandingPage
from app.ga4_service import (
    get_ai_traffic_metrics,
    get_revenue_trend,
    get_top_landing_pages
)
from app.mock_data import generate_mock_dashboard_data
from datetime import datetime, timedelta
from pydantic import BaseModel

router = APIRouter()

class ClientSummary(BaseModel):
    id: str
    email: str
    company_name: str
    has_ga4: bool
    is_demo: bool
    is_active: bool
    created_at: datetime
    ai_sessions: int = 0
    ai_revenue: float = 0.0
    ai_conversion_rate: float = 0.0

class ClientsList(BaseModel):
    clients: List[ClientSummary]
    total: int

@router.get("/clients", response_model=ClientsList)
async def list_all_clients(
    current_admin: Client = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all registered clients with summary metrics"""
    clients = db.query(Client).filter(Client.is_admin == False).all()
    
    client_summaries = []
    for client in clients:
        # Get recent metrics for each client
        has_ga4 = bool(client.ga4_property_id and client.ga4_service_account_json)
        
        # Try to get metrics (use mock if no GA4)
        try:
            if has_ga4:
                end_date = datetime.now()
                start_date = end_date - timedelta(days=30)
                start_date_str = start_date.strftime("%Y-%m-%d")
                end_date_str = end_date.strftime("%Y-%m-%d")
                
                metrics_data = get_ai_traffic_metrics(
                    property_id=client.ga4_property_id,
                    service_account_json=client.ga4_service_account_json,
                    start_date=start_date_str,
                    end_date=end_date_str
                )
                
                ai_sessions = metrics_data["ai_sessions"]
                ai_revenue = metrics_data["ai_revenue"]
                ai_conversions = metrics_data["ai_conversions"]
                ai_conversion_rate = (ai_conversions / ai_sessions * 100) if ai_sessions > 0 else 0.0
            else:
                # Use mock data for clients without GA4
                mock_data = generate_mock_dashboard_data(30)
                ai_sessions = mock_data["metrics"]["ai_sessions"]
                ai_revenue = mock_data["metrics"]["ai_revenue"]
                ai_conversion_rate = mock_data["metrics"]["ai_conversion_rate"]
        except Exception as e:
            # If error, use zeros
            ai_sessions = 0
            ai_revenue = 0.0
            ai_conversion_rate = 0.0
        
        client_summaries.append(ClientSummary(
            id=client.id,
            email=client.email,
            company_name=client.company_name,
            has_ga4=has_ga4,
            is_demo=client.is_demo,
            is_active=client.is_active,
            created_at=client.created_at,
            ai_sessions=ai_sessions,
            ai_revenue=ai_revenue,
            ai_conversion_rate=round(ai_conversion_rate, 2)
        ))
    
    return ClientsList(clients=client_summaries, total=len(client_summaries))

@router.get("/clients/{client_id}/dashboard", response_model=DashboardData)
async def get_client_dashboard(
    client_id: str,
    days: int = 30,
    current_admin: Client = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard data for a specific client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    if client.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view admin dashboard"
        )
    
    try:
        # If GA4 credentials are missing, return mock data
        if not client.ga4_property_id or not client.ga4_service_account_json:
            mock_data = generate_mock_dashboard_data(days)
            return DashboardData(
                metrics=AITrafficMetrics(**mock_data["metrics"]),
                revenue_trend=RevenueTrend(
                    data=[RevenueTrendPoint(**d) for d in mock_data["revenue_trend"]["data"]]
                ),
                top_landing_pages=[
                    TopLandingPage(**lp) for lp in mock_data["top_landing_pages"]
                ]
            )
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        start_date_str = start_date.strftime("%Y-%m-%d")
        end_date_str = end_date.strftime("%Y-%m-%d")
        
        # Get AI traffic metrics
        metrics_data = get_ai_traffic_metrics(
            property_id=client.ga4_property_id,
            service_account_json=client.ga4_service_account_json,
            start_date=start_date_str,
            end_date=end_date_str
        )
        
        # Calculate derived metrics
        ai_sessions = metrics_data["ai_sessions"]
        ai_revenue = metrics_data["ai_revenue"]
        ai_conversions = metrics_data["ai_conversions"]
        total_sessions = metrics_data["total_sessions"]
        total_revenue = metrics_data["total_revenue"]
        total_conversions = metrics_data["total_conversions"]
        
        # AI conversion rate
        ai_conversion_rate = (ai_conversions / ai_sessions * 100) if ai_sessions > 0 else 0.0
        
        # AI average order value
        ai_average_order_value = (ai_revenue / ai_conversions) if ai_conversions > 0 else 0.0
        
        # AI revenue per session
        ai_revenue_per_session = (ai_revenue / ai_sessions) if ai_sessions > 0 else 0.0
        
        # Site average conversion rate
        site_avg_conversion_rate = (total_conversions / total_sessions * 100) if total_sessions > 0 else 0.0
        
        # AI vs Site conversion rate (difference)
        ai_vs_site_conversion_rate = ai_conversion_rate - site_avg_conversion_rate
        
        # Build metrics object
        metrics = AITrafficMetrics(
            ai_sessions=ai_sessions,
            ai_revenue=ai_revenue,
            ai_conversion_rate=round(ai_conversion_rate, 2),
            ai_average_order_value=round(ai_average_order_value, 2),
            ai_revenue_per_session=round(ai_revenue_per_session, 2),
            site_avg_conversion_rate=round(site_avg_conversion_rate, 2),
            ai_vs_site_conversion_rate=round(ai_vs_site_conversion_rate, 2)
        )
        
        # Get revenue trend
        trend_data = get_revenue_trend(
            property_id=client.ga4_property_id,
            service_account_json=client.ga4_service_account_json,
            days=days
        )
        
        revenue_trend = RevenueTrend(
            data=[RevenueTrendPoint(date=d["date"], revenue=d["revenue"]) for d in trend_data]
        )
        
        # Get top landing pages
        landing_pages_data = get_top_landing_pages(
            property_id=client.ga4_property_id,
            service_account_json=client.ga4_service_account_json,
            start_date=start_date_str,
            end_date=end_date_str,
            limit=10
        )
        
        top_landing_pages = [
            TopLandingPage(
                page_path=lp["page_path"],
                sessions=lp["sessions"],
                revenue=lp["revenue"],
                conversion_rate=round(lp["conversion_rate"], 2)
            )
            for lp in landing_pages_data
        ]
        
        return DashboardData(
            metrics=metrics,
            revenue_trend=revenue_trend,
            top_landing_pages=top_landing_pages
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}"
        )

