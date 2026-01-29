from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest,
    DateRange,
    Dimension,
    Metric,
    FilterExpression,
    Filter,
)
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from datetime import datetime, timedelta
import json
import re
import os

# AI traffic source patterns - using CONTAINS match type instead of regex
# We'll need to make separate requests for each source or use OR logic
AI_SOURCE_PATTERNS = ["chat.openai", "perplexity", "gemini", "claude"]
AI_SOURCE_REGEX = r"chat\.openai|perplexity|gemini|claude"  # Keep for reference

def get_ga4_client(service_account_json: str = None, access_token: str = None, refresh_token: str = None):
    """
    Create GA4 client from either service account JSON or OAuth2 tokens.
    
    Args:
        service_account_json: Service account JSON string (legacy)
        access_token: OAuth2 access token
        refresh_token: OAuth2 refresh token (for token refresh)
    
    Returns:
        BetaAnalyticsDataClient instance
    """
    if service_account_json:
        # Legacy: Use service account JSON
        credentials_dict = json.loads(service_account_json)
        client = BetaAnalyticsDataClient.from_service_account_info(credentials_dict)
        return client
    elif access_token:
        # OAuth2: Use access token. To allow automatic refresh, we must provide
        # client_id and client_secret from environment when available.
        client_id = os.getenv("GOOGLE_CLIENT_ID") or None
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET") or None

        credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=client_id,
            client_secret=client_secret,
            scopes=["https://www.googleapis.com/auth/analytics.readonly"],
        )

        # #region agent log
        try:
            log_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), ".cursor", "debug.log"
            )
            with open(log_path, "a") as f:
                f.write(
                    json.dumps(
                        {
                            "location": "ga4_service.py:get_ga4_client",
                            "message": "Created OAuth2 GA4 client",
                            "data": {
                                "has_access_token": bool(access_token),
                                "has_refresh_token": bool(refresh_token),
                                "has_client_id": bool(client_id),
                                "has_client_secret": bool(client_secret),
                            },
                            "timestamp": int(datetime.now().timestamp() * 1000),
                            "sessionId": "debug-session",
                            "runId": "ga-oauth-client1",
                            "hypothesisId": "G4",
                        }
                    )
                    + "\n"
                )
        except Exception:
            pass
        # #endregion

        client = BetaAnalyticsDataClient(credentials=credentials)
        return client
    else:
        raise ValueError("Either service_account_json or access_token must be provided")

def refresh_oauth_token(refresh_token: str, client_id: str, client_secret: str) -> dict:
    """
    Refresh OAuth2 access token using refresh token.
    
    Returns:
        dict with access_token, expires_in, and optionally refresh_token
    """
    import requests
    
    url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }
    
    response = requests.post(url, data=data)
    response.raise_for_status()
    return response.json()

def get_ai_traffic_metrics(
    property_id: str,
    service_account_json: str = None,
    access_token: str = None,
    refresh_token: str = None,
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
    
    client = get_ga4_client(
        service_account_json=service_account_json,
        access_token=access_token,
        refresh_token=refresh_token
    )
    
    # #region agent log
    import json as json_module
    log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.cursor', 'debug.log')
    try:
        # Get available match types
        match_type_attrs = [attr for attr in dir(Filter.StringFilter.MatchType) if not attr.startswith('_')]
        with open(log_path, 'a') as f:
            log_entry = {
                "location": "ga4_service.py:103",
                "message": "Creating AI source filter - checking available match types",
                "data": {
                    "available_match_types": match_type_attrs,
                    "regex_pattern": AI_SOURCE_REGEX,
                    "field_name": "sessionSource"
                },
                "timestamp": int(datetime.now().timestamp() * 1000),
                "sessionId": "debug-session",
                "runId": "run1",
                "hypothesisId": "A"
            }
            f.write(json_module.dumps(log_entry) + '\n')
    except Exception as log_err:
        # Log the logging error too
        try:
            with open(log_path, 'a') as f:
                f.write(json_module.dumps({"location": "ga4_service.py:log_err", "message": "Failed to log match types", "data": {"error": str(log_err)}}) + '\n')
        except Exception:
            pass
    # #endregion
    
    # AI traffic filter - try using CONTAINS instead of regex for better compatibility
    # We'll filter for each AI source individually and combine results
    # For now, let's use a simpler approach with CONTAINS match type
    try:
        # Try using CONTAINS match type which is more widely supported
        ai_source_filter = FilterExpression(
            filter=Filter(
                field_name="sessionSource",
                string_filter=Filter.StringFilter(
                    match_type=Filter.StringFilter.MatchType.CONTAINS,
                    value="chat.openai",  # Using CONTAINS - will match chat.openai.com, etc.
                    case_sensitive=False
                )
            )
        )
        # #region agent log
        try:
            with open(log_path, 'a') as f:
                log_entry = {
                    "location": "ga4_service.py:140",
                    "message": "AI source filter created with CONTAINS",
                    "data": {"filter_created": True, "match_type": "CONTAINS"},
                    "timestamp": int(datetime.now().timestamp() * 1000),
                    "sessionId": "debug-session",
                    "runId": "run1",
                    "hypothesisId": "A"
                }
                f.write(json_module.dumps(log_entry) + '\n')
        except Exception:
            pass
        # #endregion
    except Exception as filter_error:
        # #region agent log
        try:
            with open(log_path, 'a') as f:
                log_entry = {
                    "location": "ga4_service.py:155",
                    "message": "Error creating AI source filter",
                    "data": {
                        "error_type": type(filter_error).__name__,
                        "error_message": str(filter_error),
                        "error_repr": repr(filter_error),
                        "match_type_attempted": "CONTAINS"
                    },
                    "timestamp": int(datetime.now().timestamp() * 1000),
                    "sessionId": "debug-session",
                    "runId": "run1",
                    "hypothesisId": "A"
                }
                f.write(json_module.dumps(log_entry) + '\n')
        except Exception:
            pass
        # #endregion
        raise
    
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
    # #region agent log
    try:
        with open(log_path, 'a') as f:
            log_entry = {
                "location": "ga4_service.py:140",
                "message": "About to execute GA4 run_report for AI traffic",
                "data": {"property_id": property_id},
                "timestamp": int(datetime.now().timestamp() * 1000),
                "sessionId": "debug-session",
                "runId": "run1",
                "hypothesisId": "B"
            }
            f.write(json_module.dumps(log_entry) + '\n')
    except Exception:
        pass
    # #endregion
    
    try:
        ai_response = client.run_report(ai_request)
        # #region agent log
        try:
            with open(log_path, 'a') as f:
                log_entry = {
                    "location": "ga4_service.py:150",
                    "message": "AI traffic run_report succeeded",
                    "data": {"row_count": len(ai_response.rows) if ai_response.rows else 0},
                    "timestamp": int(datetime.now().timestamp() * 1000),
                    "sessionId": "debug-session",
                    "runId": "run1",
                    "hypothesisId": "B"
                }
                f.write(json_module.dumps(log_entry) + '\n')
        except Exception:
            pass
        # #endregion
    except Exception as run_error:
        # #region agent log
        try:
            with open(log_path, 'a') as f:
                log_entry = {
                    "location": "ga4_service.py:165",
                    "message": "Error executing AI traffic run_report",
                    "data": {
                        "error_type": type(run_error).__name__,
                        "error_message": str(run_error),
                        "error_repr": repr(run_error)
                    },
                    "timestamp": int(datetime.now().timestamp() * 1000),
                    "sessionId": "debug-session",
                    "runId": "run1",
                    "hypothesisId": "B"
                }
                f.write(json_module.dumps(log_entry) + '\n')
        except Exception:
            pass
        # #endregion
        raise
    
    total_response = client.run_report(total_request)
    
    # Parse AI traffic metrics
    ai_sessions = 0
    ai_revenue = 0.0
    ai_conversions = 0
    
    # Get metric names from response headers (metric_values don't have .name attribute)
    # Metric headers contain the names in the same order as metric_values
    metric_names = [header.name for header in ai_response.metric_headers] if ai_response.metric_headers else []
    
    if not metric_names:
        # Fallback: use expected order if headers are missing
        metric_names = ["sessions", "totalRevenue", "conversions"]
    
    for row in ai_response.rows:
        for idx, metric_value in enumerate(row.metric_values):
            if idx >= len(metric_names):
                continue  # Skip if index is out of range
            metric_name = metric_names[idx]
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
    
    # Get metric names from response headers (metric_values don't have .name attribute)
    # Metric headers contain the names in the same order as metric_values
    total_metric_names = [header.name for header in total_response.metric_headers] if total_response.metric_headers else []
    
    if not total_metric_names:
        # Fallback: use expected order if headers are missing
        total_metric_names = ["sessions", "totalRevenue", "conversions"]
    
    for row in total_response.rows:
        for idx, metric_value in enumerate(row.metric_values):
            if idx >= len(total_metric_names):
                continue  # Skip if index is out of range
            metric_name = total_metric_names[idx]
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
    service_account_json: str = None,
    access_token: str = None,
    refresh_token: str = None,
    days: int = 30
) -> list:
    """Get daily revenue trend for AI traffic"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    client = get_ga4_client(
        service_account_json=service_account_json,
        access_token=access_token,
        refresh_token=refresh_token
    )
    
    # AI traffic filter - using CONTAINS match type (regex not supported)
    # For now, using a single pattern - we can expand to OR logic later if needed
    ai_source_filter = FilterExpression(
        filter=Filter(
            field_name="sessionSource",
            string_filter=Filter.StringFilter(
                match_type=Filter.StringFilter.MatchType.CONTAINS,
                value="chat.openai",  # Will match chat.openai.com, etc.
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
    service_account_json: str = None,
    access_token: str = None,
    refresh_token: str = None,
    start_date: str = None,
    end_date: str = None,
    limit: int = 10
) -> list:
    """Get top landing pages for AI traffic"""
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    
    client = get_ga4_client(
        service_account_json=service_account_json,
        access_token=access_token,
        refresh_token=refresh_token
    )
    
    # AI traffic filter - using CONTAINS match type (regex not supported)
    # For now, using a single pattern - we can expand to OR logic later if needed
    ai_source_filter = FilterExpression(
        filter=Filter(
            field_name="sessionSource",
            string_filter=Filter.StringFilter(
                match_type=Filter.StringFilter.MatchType.CONTAINS,
                value="chat.openai",  # Will match chat.openai.com, etc.
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

