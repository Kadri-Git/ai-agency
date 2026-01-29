from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Client
from app.schemas import (
    DashboardData,
    AITrafficMetrics,
    RevenueTrend,
    RevenueTrendPoint,
    TopLandingPage,
)
from app.auth import get_current_client
from app.ga4_service import (
    get_ai_traffic_metrics,
    get_revenue_trend,
    get_top_landing_pages,
    refresh_oauth_token,
)
from app.mock_data import generate_mock_dashboard_data
from datetime import datetime, timedelta
import json as json_module

router = APIRouter()

@router.get("/metrics", response_model=DashboardData)
async def get_dashboard_metrics(
    days: int = 30,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """
    Get AI shopping visibility dashboard metrics for the current client.
    Client data is automatically isolated based on JWT token.
    """
    try:
        # #region agent log
        try:
            log_path = "/Users/kadri/Desktop/Vibe-coding/ai-visibility report/.cursor/debug.log"
            with open(log_path, "a") as f:
                f.write(
                    json_module.dumps(
                        {
                            "location": "dashboard.py:get_dashboard_metrics:start",
                            "message": "Dashboard metrics called",
                            "data": {
                                "client_email": getattr(current_client, "email", None),
                                "is_demo": getattr(current_client, "is_demo", None),
                                "has_property_id": bool(
                                    getattr(current_client, "ga4_property_id", None)
                                ),
                            },
                            "timestamp": int(datetime.utcnow().timestamp() * 1000),
                            "sessionId": "debug-session",
                            "runId": "demo-run",
                            "hypothesisId": "DL4",
                        }
                    )
                    + "\n"
                )
        except Exception:
            pass
        # #endregion

        # For demo accounts, always return mock data and avoid real GA4 calls
        if getattr(current_client, "is_demo", False):
            # #region agent log
            try:
                log_path = "/Users/kadri/Desktop/Vibe-coding/ai-visibility report/.cursor/debug.log"
                with open(log_path, "a") as f:
                    f.write(
                        json_module.dumps(
                            {
                                "location": "dashboard.py:get_dashboard_metrics:demo_mock",
                                "message": "Using mock dashboard data for demo client",
                                "data": {
                                    "client_email": getattr(
                                        current_client, "email", None
                                    ),
                                },
                                "timestamp": int(
                                    datetime.utcnow().timestamp() * 1000
                                ),
                                "sessionId": "debug-session",
                                "runId": "demo-run",
                                "hypothesisId": "DL4",
                            }
                        )
                        + "\n"
                    )
            except Exception:
                pass
            # #endregion
            mock_data = generate_mock_dashboard_data(days)
            return DashboardData(
                metrics=AITrafficMetrics(**mock_data["metrics"]),
                revenue_trend=RevenueTrend(
                    data=[
                        RevenueTrendPoint(**d)
                        for d in mock_data["revenue_trend"]["data"]
                    ]
                ),
                top_landing_pages=[
                    TopLandingPage(**lp) for lp in mock_data["top_landing_pages"]
                ],
            )

        # Check if GA4 credentials are available (OAuth or service account)
        has_oauth = bool(
            current_client.ga4_property_id 
            and current_client.ga4_access_token 
            and current_client.ga4_refresh_token
        )
        has_service_account = bool(
            current_client.ga4_property_id and current_client.ga4_service_account_json
        )
        
        # If GA4 credentials are missing, return mock data
        if not has_oauth and not has_service_account:
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
        
        # If we are using OAuth tokens, proactively refresh the GA4 access token
        # to avoid "invalid authentication credentials" errors when tokens expire.
        if has_oauth and current_client.ga4_refresh_token:
            try:
                import os
                from datetime import datetime as dt

                client_id = os.getenv("GOOGLE_CLIENT_ID", "")
                client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")

                # Only attempt refresh if we have client credentials configured
                if client_id and client_secret:
                    token_response = refresh_oauth_token(
                        refresh_token=current_client.ga4_refresh_token,
                        client_id=client_id,
                        client_secret=client_secret,
                    )

                    new_access_token = token_response.get("access_token")
                    new_expires_in = token_response.get("expires_in")
                    new_refresh_token = token_response.get("refresh_token")

                    if new_access_token:
                        current_client.ga4_access_token = new_access_token
                    if new_refresh_token:
                        current_client.ga4_refresh_token = new_refresh_token
                    if new_expires_in:
                        current_client.ga4_token_expires_at = dt.utcnow() + timedelta(
                            seconds=int(new_expires_in)
                        )

                    current_client.ga4_connected_at = current_client.ga4_connected_at or dt.utcnow()
                    db.commit()
                    db.refresh(current_client)

                    # #region agent log
                    try:
                        log_path = "/Users/kadri/Desktop/Vibe-coding/ai-visibility report/.cursor/debug.log"
                        with open(log_path, "a") as f:
                            f.write(
                                json_module.dumps(
                                    {
                                        "location": "dashboard.py:get_dashboard_metrics:ga4_token_refreshed",
                                        "message": "Refreshed GA4 OAuth access token",
                                        "data": {
                                            "client_email": getattr(current_client, "email", None),
                                            "ga4_property_id": current_client.ga4_property_id,
                                            "has_new_refresh_token": bool(new_refresh_token),
                                            "has_expires_in": bool(new_expires_in),
                                        },
                                        "timestamp": int(dt.utcnow().timestamp() * 1000),
                                        "sessionId": "debug-session",
                                        "runId": "ga-refresh1",
                                        "hypothesisId": "G3",
                                    }
                                )
                                + "\n"
                            )
                    except Exception:
                        pass
                    # #endregion
            except Exception as refresh_error:
                # #region agent log
                try:
                    log_path = "/Users/kadri/Desktop/Vibe-coding/ai-visibility report/.cursor/debug.log"
                    with open(log_path, "a") as f:
                        f.write(
                            json_module.dumps(
                                {
                                    "location": "dashboard.py:get_dashboard_metrics:ga4_token_refresh_error",
                                    "message": "Failed to refresh GA4 OAuth access token",
                                    "data": {
                                        "client_email": getattr(current_client, "email", None),
                                        "error_type": type(refresh_error).__name__,
                                        "error_message": str(refresh_error),
                                    },
                                    "timestamp": int(dt.utcnow().timestamp() * 1000),
                                    "sessionId": "debug-session",
                                    "runId": "ga-refresh1",
                                    "hypothesisId": "G3",
                                }
                            )
                            + "\n"
                        )
                except Exception:
                    pass
                # #endregion
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        start_date_str = start_date.strftime("%Y-%m-%d")
        end_date_str = end_date.strftime("%Y-%m-%d")
        
        # Get AI traffic metrics (use OAuth if available, otherwise service account)
        metrics_data = get_ai_traffic_metrics(
            property_id=current_client.ga4_property_id,
            service_account_json=current_client.ga4_service_account_json if has_service_account else None,
            access_token=current_client.ga4_access_token if has_oauth else None,
            refresh_token=current_client.ga4_refresh_token if has_oauth else None,
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
        
        # Get revenue trend (use OAuth if available, otherwise service account)
        trend_data = get_revenue_trend(
            property_id=current_client.ga4_property_id,
            service_account_json=current_client.ga4_service_account_json if has_service_account else None,
            access_token=current_client.ga4_access_token if has_oauth else None,
            refresh_token=current_client.ga4_refresh_token if has_oauth else None,
            days=days
        )
        
        revenue_trend = RevenueTrend(
            data=[RevenueTrendPoint(date=d["date"], revenue=d["revenue"]) for d in trend_data]
        )
        
        # Get top landing pages (use OAuth if available, otherwise service account)
        landing_pages_data = get_top_landing_pages(
            property_id=current_client.ga4_property_id,
            service_account_json=current_client.ga4_service_account_json if has_service_account else None,
            access_token=current_client.ga4_access_token if has_oauth else None,
            refresh_token=current_client.ga4_refresh_token if has_oauth else None,
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
        # #region agent log
        import os
        import json as json_module
        from datetime import datetime as dt
        log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.cursor', 'debug.log')
        try:
            with open(log_path, 'a') as f:
                log_entry = {
                    "location": "dashboard.py:141",
                    "message": "Dashboard metrics error caught",
                    "data": {
                        "error_type": type(e).__name__,
                        "error_message": str(e),
                        "error_repr": repr(e),
                        "has_oauth": has_oauth,
                        "has_service_account": has_service_account
                    },
                    "timestamp": int(dt.now().timestamp() * 1000),
                    "sessionId": "debug-session",
                    "runId": "run1",
                    "hypothesisId": "C"
                }
                f.write(json_module.dumps(log_entry) + '\n')
        except Exception:
            pass
        # #endregion
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}"
        )

