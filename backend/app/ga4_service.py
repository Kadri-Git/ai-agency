from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest,
    DateRange,
    Dimension,
    Metric,
    FilterExpression,
    Filter,
)
from datetime import datetime, timedelta
import json
import re

# AI traffic source regex pattern
AI_SOURCE_REGEX = r"chat\.openai|perplexity|gemini|claude"

def get_ga4_client(service_account_json: str):
    """Create GA4 client from service account JSON"""
    credentials_dict = json.loads(service_account_json)
    client = BetaAnalyticsDataClient.from_service_account_info(credentials_dict)
    return client

def get_ai_traffic_metrics(
    property_id: str,
    service_account_json: str,
    start_date: str = None,
    end_date: str = None
) -> dict:
    """
    Fetch AI traffic metrics from GA4
    
    Returns:
        {
            "ai_sessions": int,
            "ai_revenue": float,
            "ai_conversions": int,
            "total_sessions": int,
            "total_revenue": float,
            "total_conversions": int
        }
    """
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    
    client = get_ga4_client(service_account_json)
    
    # AI traffic filter
    ai_source_filter = FilterExpression(
        filter=Filter(
            field_name="sessionSource",
            string_filter=Filter.StringFilter(
                match_type=Filter.StringFilter.MatchType.CONTAINS_REGEX,
                value=AI_SOURCE_REGEX,
                case_sensitive=False
            )
        )
    )
    
    # Request for AI traffic
    ai_request = RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[Dimension(name="sessionSource")],
        metrics=[
            Metric(name="sessions"),
            Metric(name="totalRevenue"),
            Metric(name="conversions"),
        ],
        dimension_filter=ai_source_filter,
    )
    
    # Request for total site traffic
    total_request = RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        metrics=[
            Metric(name="sessions"),
            Metric(name="totalRevenue"),
            Metric(name="conversions"),
        ],
    )
    
    # Execute requests
    ai_response = client.run_report(ai_request)
    total_response = client.run_report(total_request)
    
    # Parse AI traffic metrics
    ai_sessions = 0
    ai_revenue = 0.0
    ai_conversions = 0
    
    for row in ai_response.rows:
        for metric_value in row.metric_values:
            metric_name = metric_value.name
            value = float(metric_value.value) if metric_value.value else 0
            
            if metric_name == "sessions":
                ai_sessions += int(value)
            elif metric_name == "totalRevenue":
                ai_revenue += value
            elif metric_name == "conversions":
                ai_conversions += int(value)
    
    # Parse total site metrics
    total_sessions = 0
    total_revenue = 0.0
    total_conversions = 0
    
    for row in total_response.rows:
        for metric_value in row.metric_values:
            metric_name = metric_value.name
            value = float(metric_value.value) if metric_value.value else 0
            
            if metric_name == "sessions":
                total_sessions += int(value)
            elif metric_name == "totalRevenue":
                total_revenue += value
            elif metric_name == "conversions":
                total_conversions += int(value)
    
    return {
        "ai_sessions": ai_sessions,
        "ai_revenue": ai_revenue,
        "ai_conversions": ai_conversions,
        "total_sessions": total_sessions,
        "total_revenue": total_revenue,
        "total_conversions": total_conversions,
    }

def get_revenue_trend(
    property_id: str,
    service_account_json: str,
    days: int = 30
) -> list:
    """Get daily revenue trend for AI traffic"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    client = get_ga4_client(service_account_json)
    
    # AI traffic filter - using sessionSource dimension
    ai_source_filter = FilterExpression(
        filter=Filter(
            field_name="sessionSource",
            string_filter=Filter.StringFilter(
                match_type=Filter.StringFilter.MatchType.CONTAINS_REGEX,
                value=AI_SOURCE_REGEX,
                case_sensitive=False
            )
        )
    )
    
    request = RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(
            start_date=start_date.strftime("%Y-%m-%d"),
            end_date=end_date.strftime("%Y-%m-%d")
        )],
        dimensions=[Dimension(name="date")],
        metrics=[Metric(name="totalRevenue")],
        dimension_filter=ai_source_filter,
    )
    
    response = client.run_report(request)
    
    trend_data = []
    for row in response.rows:
        date_str = row.dimension_values[0].value
        revenue = float(row.metric_values[0].value) if row.metric_values[0].value else 0.0
        
        # Format date as YYYY-MM-DD
        formatted_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
        trend_data.append({
            "date": formatted_date,
            "revenue": revenue
        })
    
    # Sort by date
    trend_data.sort(key=lambda x: x["date"])
    
    return trend_data

def get_top_landing_pages(
    property_id: str,
    service_account_json: str,
    start_date: str = None,
    end_date: str = None,
    limit: int = 10
) -> list:
    """Get top landing pages for AI traffic"""
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    
    client = get_ga4_client(service_account_json)
    
    # AI traffic filter - using sessionSource dimension
    ai_source_filter = FilterExpression(
        filter=Filter(
            field_name="sessionSource",
            string_filter=Filter.StringFilter(
                match_type=Filter.StringFilter.MatchType.CONTAINS_REGEX,
                value=AI_SOURCE_REGEX,
                case_sensitive=False
            )
        )
    )
    
    request = RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[Dimension(name="landingPagePlusQueryString")],
        metrics=[
            Metric(name="sessions"),
            Metric(name="totalRevenue"),
            Metric(name="conversions"),
        ],
        dimension_filter=ai_source_filter,
        limit=limit,
    )
    
    response = client.run_report(request)
    
    landing_pages = []
    for row in response.rows:
        if len(row.dimension_values) > 0 and len(row.metric_values) >= 3:
            page_path = row.dimension_values[0].value
            sessions = int(float(row.metric_values[0].value)) if row.metric_values[0].value else 0
            revenue = float(row.metric_values[1].value) if row.metric_values[1].value else 0.0
            conversions = int(float(row.metric_values[2].value)) if row.metric_values[2].value else 0
            
            conversion_rate = (conversions / sessions * 100) if sessions > 0 else 0.0
            
            landing_pages.append({
                "page_path": page_path,
                "sessions": sessions,
                "revenue": revenue,
                "conversion_rate": conversion_rate
            })
    
    return landing_pages

