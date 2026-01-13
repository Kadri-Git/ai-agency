"""
Mock data generator for demo mode
"""
from datetime import datetime, timedelta
import random

def generate_mock_dashboard_data(days: int = 30) -> dict:
    """Generate realistic mock dashboard data"""
    
    # Base metrics with some randomness
    base_sessions = random.randint(500, 2000)
    base_revenue = random.uniform(5000, 25000)
    base_conversions = random.randint(20, 100)
    
    # AI-specific metrics (typically lower than site average)
    ai_sessions = random.randint(50, 300)
    ai_conversions = random.randint(2, 15)
    ai_revenue = random.uniform(500, 3000)
    
    # Calculate derived metrics
    ai_conversion_rate = (ai_conversions / ai_sessions * 100) if ai_sessions > 0 else 0.0
    ai_average_order_value = (ai_revenue / ai_conversions) if ai_conversions > 0 else 0.0
    ai_revenue_per_session = (ai_revenue / ai_sessions) if ai_sessions > 0 else 0.0
    
    site_avg_conversion_rate = (base_conversions / base_sessions * 100) if base_sessions > 0 else 0.0
    ai_vs_site_conversion_rate = ai_conversion_rate - site_avg_conversion_rate
    
    # Generate revenue trend data
    trend_data = []
    end_date = datetime.now()
    for i in range(days):
        date = end_date - timedelta(days=days - i - 1)
        # Add some daily variation
        daily_revenue = ai_revenue / days * random.uniform(0.5, 1.5)
        trend_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "revenue": round(daily_revenue, 2)
        })
    
    # Generate top landing pages
    landing_pages = [
        {
            "page_path": "/products/laptop",
            "sessions": random.randint(20, 80),
            "revenue": random.uniform(200, 800),
            "conversion_rate": random.uniform(2.0, 8.0)
        },
        {
            "page_path": "/products/phone",
            "sessions": random.randint(15, 60),
            "revenue": random.uniform(150, 600),
            "conversion_rate": random.uniform(1.5, 7.0)
        },
        {
            "page_path": "/products/tablet",
            "sessions": random.randint(10, 50),
            "revenue": random.uniform(100, 500),
            "conversion_rate": random.uniform(1.0, 6.0)
        },
        {
            "page_path": "/products/headphones",
            "sessions": random.randint(8, 40),
            "revenue": random.uniform(80, 400),
            "conversion_rate": random.uniform(0.8, 5.0)
        },
        {
            "page_path": "/products/smartwatch",
            "sessions": random.randint(5, 30),
            "revenue": random.uniform(50, 300),
            "conversion_rate": random.uniform(0.5, 4.0)
        },
    ]
    
    # Sort by revenue descending
    landing_pages.sort(key=lambda x: x["revenue"], reverse=True)
    
    return {
        "metrics": {
            "ai_sessions": ai_sessions,
            "ai_revenue": round(ai_revenue, 2),
            "ai_conversion_rate": round(ai_conversion_rate, 2),
            "ai_average_order_value": round(ai_average_order_value, 2),
            "ai_revenue_per_session": round(ai_revenue_per_session, 2),
            "site_avg_conversion_rate": round(site_avg_conversion_rate, 2),
            "ai_vs_site_conversion_rate": round(ai_vs_site_conversion_rate, 2)
        },
        "revenue_trend": {
            "data": trend_data
        },
        "top_landing_pages": landing_pages
    }


