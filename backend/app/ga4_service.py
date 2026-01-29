from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest,
    DateRange,
    Dimension,
    Metric,
    FilterExpression,
    Filter,
    FilterExpressionList,
)
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from datetime import datetime, timedelta
import json
import re
import os

# AI traffic source patterns - using CONTAINS match type instead of regex
# We'll need to make separate requests for each source or use OR logic
AI_SOURCE_PATTERNS = [
    "chat.openai",  # Matches "chat.openai.com", "chat.openai", etc.
    "chatgpt",  # Matches "chatgpt.com" - ChatGPT appears as this in GA4!
    "openai",  # Also match just "openai" in case it appears that way
    "perplexity",
    "gemini",
    "claude",
    "anthropic",  # Claude's company name - might appear as source
    "claude.ai",  # Claude's domain
]
AI_SOURCE_REGEX = r"chat\.openai|chatgpt|perplexity|gemini|claude|openai"  # Keep for reference


def build_ai_source_filter() -> FilterExpression:
    """
    Build a GA4 FilterExpression that matches AI traffic from multiple sources.
    Uses OR logic over CONTAINS string filters for each pattern in AI_SOURCE_PATTERNS.
    GA4 uses "sessionSource" as the dimension and filter field name.
    """
    return FilterExpression(
        or_group=FilterExpressionList(
            expressions=[
                FilterExpression(
                    filter=Filter(
                        field_name="sessionSource",
                        string_filter=Filter.StringFilter(
                            match_type=Filter.StringFilter.MatchType.CONTAINS,
                            value=pattern,
                            case_sensitive=False,
                        ),
                    )
                )
                for pattern in AI_SOURCE_PATTERNS
            ]
        )
    )

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
    
    # AI traffic filter - use OR over multiple AI source patterns
    try:
        ai_source_filter = build_ai_source_filter()
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
    # Try "sessionSource" dimension - GA4 might use this instead of "source"
    # ChatGPT traffic appears as "chat.openai.com" in the sessionSource dimension
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

    # Additional diagnostic request: unfiltered source breakdown to see actual sources
    # Try "sessionSource" dimension (GA4 might use this instead of "source")
    # Also check "source" dimension separately to see if ChatGPT appears there
    debug_sources_request = RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[Dimension(name="sessionSource")],
        metrics=[Metric(name="sessions")],
        limit=100,  # Increased to see more sources
    )
    
    # Also check "source" dimension (different from sessionSource)
    debug_source_dimension_request = RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[Dimension(name="source")],
        metrics=[Metric(name="sessions")],
        limit=100,
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
                "location": "ga4_service.py:execute_requests",
                "message": "About to execute GA4 run_report for AI traffic",
                "data": {
                    "property_id": property_id,
                    "start_date": start_date,
                    "end_date": end_date,
                    "ai_patterns": AI_SOURCE_PATTERNS,
                },
                "timestamp": int(datetime.now().timestamp() * 1000),
                "sessionId": "debug-session",
                "runId": "run1",
                "hypothesisId": "DATE_RANGE"
            }
            f.write(json_module.dumps(log_entry) + '\n')
    except Exception:
        pass
    # #endregion
    
    debug_sources_response = None
    debug_source_dimension_response = None
    all_sources = []  # Function-level variable to track ALL sources
    try:
        # First: diagnostic unfiltered sources to see actual source values
        debug_sources_response = client.run_report(debug_sources_request)
        
        # Also check "source" dimension (different from sessionSource)
        try:
            debug_source_dimension_response = client.run_report(debug_source_dimension_request)
        except Exception as source_dim_error:
            # #region agent log
            try:
                import json as json_module
                log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.cursor', 'debug.log')
                with open(log_path, 'a') as f:
                    log_entry = {
                        "location": "ga4_service.py:debug_source_dimension",
                        "message": "Error checking 'source' dimension",
                        "data": {
                            "error": str(source_dim_error),
                        },
                        "timestamp": int(datetime.now().timestamp() * 1000),
                        "sessionId": "debug-session",
                        "runId": "ga-debug-sources",
                        "hypothesisId": "GA_SOURCES",
                    }
                    f.write(json_module.dumps(log_entry) + '\n')
            except Exception:
                pass
            # #endregion
        
        try:
            # Ensure json_module and log_path are available (they're defined earlier in the function)
            import json as json_module
            log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.cursor', 'debug.log')
            
            debug_rows = []
            # all_sources is already defined at function level
            ai_matching_sources = []  # Track sources that match AI patterns
            if debug_sources_response.rows:
                for i, row in enumerate(debug_sources_response.rows):
                    source_value = row.dimension_values[0].value if row.dimension_values else ""
                    sessions_value = row.metric_values[0].value if row.metric_values else "0"
                    
                    # Log ALL sources (not just first 10)
                    all_sources.append({
                        "source": source_value,
                        "sessions": sessions_value,
                    })
                    
                    # Log first 10 for sample
                    if i < 10:
                        debug_rows.append(
                            {
                                "row_index": i,
                                "source": source_value,
                                "sessions": sessions_value,
                            }
                        )
                    
                    # Check if this source matches any AI pattern
                    source_lower = source_value.lower()
                    matches_ai = any(pattern.lower() in source_lower for pattern in AI_SOURCE_PATTERNS)
                    if matches_ai:
                        ai_matching_sources.append({
                            "source": source_value,
                            "sessions": sessions_value,
                            "matches_patterns": [p for p in AI_SOURCE_PATTERNS if p.lower() in source_lower]
                        })
            
            # Also check "source" dimension for AI matches
            source_dim_ai_matches = []
            if debug_source_dimension_response and debug_source_dimension_response.rows:
                for row in debug_source_dimension_response.rows:
                    source_value = row.dimension_values[0].value if row.dimension_values else ""
                    sessions_value = row.metric_values[0].value if row.metric_values else "0"
                    source_lower = source_value.lower()
                    matches_ai = any(pattern.lower() in source_lower for pattern in AI_SOURCE_PATTERNS)
                    if matches_ai:
                        source_dim_ai_matches.append({
                            "source": source_value,
                            "sessions": sessions_value,
                            "matches_patterns": [p for p in AI_SOURCE_PATTERNS if p.lower() in source_lower]
                        })
            
            with open(log_path, "a") as f:
                f.write(
                    json_module.dumps(
                        {
                            "location": "ga4_service.py:debug_sources",
                            "message": "Unfiltered source breakdown",
                            "data": {
                                "sessionSource_row_count": len(
                                    debug_sources_response.rows
                                    if debug_sources_response.rows
                                    else []
                                ),
                                "source_dimension_row_count": len(
                                    debug_source_dimension_response.rows
                                    if debug_source_dimension_response
                                    else []
                                ),
                                "sample_rows": debug_rows,
                                "all_sources_complete": all_sources,  # ALL sources, not just matching
                                "ai_matching_sources_in_sessionSource": ai_matching_sources,
                                "ai_matching_sources_in_source_dim": source_dim_ai_matches,
                                "ai_patterns_used": AI_SOURCE_PATTERNS,
                                "total_sources_count": len(all_sources),
                                "total_ai_sources_found_in_sessionSource": len(ai_matching_sources),
                                "total_ai_sources_found_in_source_dim": len(source_dim_ai_matches),
                                "date_range": {"start_date": start_date, "end_date": end_date},
                            },
                            "timestamp": int(
                                datetime.now().timestamp() * 1000
                            ),
                            "sessionId": "debug-session",
                            "runId": "ga-debug-sources",
                            "hypothesisId": "GA_SOURCES",
                        }
                    )
                    + "\n"
                )
        except Exception:
            pass

        # Then: actual AI-filtered request
        try:
            ai_response = client.run_report(ai_request)
        except Exception as ai_error:
            # #region agent log
            try:
                with open(log_path, 'a') as f:
                    log_entry = {
                        "location": "ga4_service.py:ai_request_error",
                        "message": "AI-filtered GA4 request failed",
                        "data": {
                            "error_type": type(ai_error).__name__,
                            "error_message": str(ai_error),
                            "error_repr": repr(ai_error),
                            "dimension_used": "source",
                            "filter_patterns": AI_SOURCE_PATTERNS,
                        },
                        "timestamp": int(datetime.now().timestamp() * 1000),
                        "sessionId": "debug-session",
                        "runId": "run1",
                        "hypothesisId": "GA_ERROR",
                    }
                    f.write(json_module.dumps(log_entry) + '\n')
            except Exception:
                pass
            # #endregion
            raise
        # #region agent log
        try:
            row_count = len(ai_response.rows) if ai_response.rows else 0
            metric_headers = [
                h.name for h in ai_response.metric_headers
            ] if ai_response.metric_headers else []
            sample_rows = []
            if ai_response.rows:
                for i, row in enumerate(ai_response.rows[:3]):  # Log first 3 rows
                    row_data = {
                        "row_index": i,
                        "dimension_values": [
                            dv.value for dv in row.dimension_values
                        ]
                        if row.dimension_values
                        else [],
                        "metric_values": [
                            mv.value for mv in row.metric_values
                        ]
                        if row.metric_values
                        else [],
                    }
                    sample_rows.append(row_data)
            with open(log_path, "a") as f:
                log_entry = {
                    "location": "ga4_service.py:ai_response",
                    "message": "AI traffic run_report succeeded",
                    "data": {
                        "row_count": row_count,
                        "metric_headers": metric_headers,
                        "sample_rows": sample_rows,
                        "has_rows": row_count > 0,
                    },
                    "timestamp": int(datetime.now().timestamp() * 1000),
                    "sessionId": "debug-session",
                    "runId": "run1",
                    "hypothesisId": "GA_DATA",
                }
                f.write(json_module.dumps(log_entry) + "\n")
        except Exception as log_err:
            try:
                with open(log_path, "a") as f:
                    f.write(
                        json_module.dumps(
                            {
                                "location": "ga4_service.py:ai_response:log_err",
                                "message": "Failed to log AI response",
                                "data": {"error": str(log_err)},
                            }
                        )
                        + "\n"
                    )
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
    
    # #region agent log
    try:
        total_row_count = len(total_response.rows) if total_response.rows else 0
        total_metric_headers = [h.name for h in total_response.metric_headers] if total_response.metric_headers else []
        total_sample_rows = []
        if total_response.rows:
            for i, row in enumerate(total_response.rows[:3]):  # Log first 3 rows
                row_data = {
                    "row_index": i,
                    "metric_values": [mv.value for mv in row.metric_values] if row.metric_values else []
                }
                total_sample_rows.append(row_data)
        with open(log_path, 'a') as f:
            log_entry = {
                "location": "ga4_service.py:total_response",
                "message": "Total site traffic run_report succeeded",
                "data": {
                    "row_count": total_row_count,
                    "metric_headers": total_metric_headers,
                    "sample_rows": total_sample_rows,
                    "has_rows": total_row_count > 0
                },
                "timestamp": int(datetime.now().timestamp() * 1000),
                "sessionId": "debug-session",
                "runId": "run1",
                "hypothesisId": "GA_DATA"
            }
            f.write(json_module.dumps(log_entry) + '\n')
    except Exception as log_err:
        try:
            with open(log_path, 'a') as f:
                f.write(json_module.dumps({"location": "ga4_service.py:total_response:log_err", "message": "Failed to log total response", "data": {"error": str(log_err)}}) + '\n')
        except Exception:
            pass
    # #endregion
    
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
            
            # #region agent log
            try:
                with open(log_path, 'a') as f:
                    log_entry = {
                        "location": "ga4_service.py:parse_ai_metric",
                        "message": "Parsing AI metric value",
                        "data": {
                            "metric_name": metric_name,
                            "raw_value": metric_value.value,
                            "parsed_value": value,
                            "dimension_values": [dv.value for dv in row.dimension_values] if row.dimension_values else []
                        },
                        "timestamp": int(datetime.now().timestamp() * 1000),
                        "sessionId": "debug-session",
                        "runId": "run1",
                        "hypothesisId": "GA_DATA"
                    }
                    f.write(json_module.dumps(log_entry) + '\n')
            except Exception:
                pass
            # #endregion
            
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
    
    # Build debug info with sources breakdown - include ALL sources, not just top 5
    debug_sources_sample = []
    debug_sources_row_count = 0
    all_sources_list = []  # Track ALL sources for debugging
    try:
        if 'debug_sources_response' in locals() and debug_sources_response:
            debug_sources_row_count = len(debug_sources_response.rows) if debug_sources_response.rows else 0
            if debug_sources_response.rows:
                # Log first 10 for sample (frontend display)
                for row in debug_sources_response.rows[:10]:
                    debug_sources_sample.append({
                        "source": row.dimension_values[0].value if row.dimension_values else "",
                        "sessions": row.metric_values[0].value if row.metric_values else "0"
                    })
                # Log ALL sources for backend debugging
                for row in debug_sources_response.rows:
                    source_val = row.dimension_values[0].value if row.dimension_values else ""
                    sessions_val = row.metric_values[0].value if row.metric_values else "0"
                    all_sources_list.append({
                        "source": source_val,
                        "sessions": sessions_val
                    })
    except Exception:
        pass
    
    result = {
        "ai_sessions": ai_sessions,
        "ai_revenue": ai_revenue,
        "ai_conversions": ai_conversions,
        "total_sessions": total_sessions,
        "total_revenue": total_revenue,
        "total_conversions": total_conversions,
        "_debug": {
            "ai_row_count": len(ai_response.rows) if ai_response.rows else 0,
            "total_row_count": len(total_response.rows) if total_response.rows else 0,
            "debug_sources_row_count": debug_sources_row_count,
            "debug_sources_sample": debug_sources_sample,
            "all_sources": all_sources_list,  # Include ALL sources for debugging
        }
    }
    
    # #region agent log
    try:
        with open(log_path, 'a') as f:
            log_entry = {
                "location": "ga4_service.py:get_ai_traffic_metrics:result",
                "message": "Final parsed metrics result",
                "data": {
                    "ai_sessions": ai_sessions,
                    "ai_revenue": ai_revenue,
                    "ai_conversions": ai_conversions,
                    "total_sessions": total_sessions,
                    "total_revenue": total_revenue,
                    "total_conversions": total_conversions,
                    "ai_row_count": len(ai_response.rows) if ai_response.rows else 0,
                    "total_row_count": len(total_response.rows) if total_response.rows else 0,
                    "property_id": property_id,
                    "start_date": start_date,
                    "end_date": end_date
                },
                "timestamp": int(datetime.now().timestamp() * 1000),
                "sessionId": "debug-session",
                "runId": "run1",
                "hypothesisId": "GA_DATA"
            }
            f.write(json_module.dumps(log_entry) + '\n')
    except Exception:
        pass
    # #endregion
    
    return result

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
    
    # AI traffic filter - OR over multiple AI source patterns
    ai_source_filter = build_ai_source_filter()
    
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
    
    # Create a map of date -> revenue from GA4 response
    revenue_by_date = {}
    for row in response.rows:
        date_str = row.dimension_values[0].value
        revenue = float(row.metric_values[0].value) if row.metric_values[0].value else 0.0
        
        # Format date as YYYY-MM-DD
        formatted_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
        revenue_by_date[formatted_date] = revenue
    
    # Build complete trend data for all days in range, filling zeros for days with no data
    trend_data = []
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        revenue = revenue_by_date.get(date_str, 0.0)
        trend_data.append({
            "date": date_str,
            "revenue": revenue
        })
        current_date += timedelta(days=1)
    
    # Sort by date (should already be sorted, but just in case)
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
    
    # AI traffic filter - OR over multiple AI source patterns
    ai_source_filter = build_ai_source_filter()
    
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

def get_users_per_page_trend(
    property_id: str,
    service_account_json: str = None,
    access_token: str = None,
    refresh_token: str = None,
    days: int = 30
) -> list:
    """Get daily users per page trend for ALL traffic (not filtered by AI sources)"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    client = get_ga4_client(
        service_account_json=service_account_json,
        access_token=access_token,
        refresh_token=refresh_token
    )
    
    # No filter - get ALL traffic to verify GA4 is working
    request = RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(
            start_date=start_date.strftime("%Y-%m-%d"),
            end_date=end_date.strftime("%Y-%m-%d")
        )],
        dimensions=[Dimension(name="date")],
        metrics=[Metric(name="activeUsers")],
    )
    
    response = client.run_report(request)
    
    # Create a map of date -> users from GA4 response
    users_by_date = {}
    for row in response.rows:
        date_str = row.dimension_values[0].value
        users = int(float(row.metric_values[0].value)) if row.metric_values[0].value else 0
        
        # Format date as YYYY-MM-DD
        formatted_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
        users_by_date[formatted_date] = users
    
    # Build complete trend data for all days in range, filling zeros for days with no data
    trend_data = []
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        users = users_by_date.get(date_str, 0)
        trend_data.append({
            "date": date_str,
            "users": users
        })
        current_date += timedelta(days=1)
    
    # Sort by date (should already be sorted, but just in case)
    trend_data.sort(key=lambda x: x["date"])
    
    return trend_data

