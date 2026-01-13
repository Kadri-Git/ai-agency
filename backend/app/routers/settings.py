from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Client
from app.auth import get_current_client, verify_password, get_password_hash
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import json

router = APIRouter()

class UpdateGA4Credentials(BaseModel):
    ga4_property_id: str
    ga4_service_account_json: str

class UpdateGA4OAuth(BaseModel):
    ga4_property_id: str
    ga4_access_token: str
    ga4_refresh_token: str
    ga4_token_expires_at: Optional[str] = None
    ga4_connected_at: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.put("/ga4-credentials", status_code=status.HTTP_200_OK)
async def update_ga4_credentials(
    credentials: UpdateGA4Credentials,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """
    Update GA4 credentials for the current client.
    """
    # Validate JSON
    try:
        json.loads(credentials.ga4_service_account_json)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid GA4 service account JSON"
        )
    
    # Update client credentials
    try:
        current_client.ga4_property_id = credentials.ga4_property_id
        current_client.ga4_service_account_json = credentials.ga4_service_account_json
        db.commit()
        db.refresh(current_client)
        
        return {
            "message": "GA4 credentials updated successfully",
            "ga4_property_id": current_client.ga4_property_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating GA4 credentials: {str(e)}"
        )

@router.post("/ga4-oauth", status_code=status.HTTP_200_OK)
async def update_ga4_oauth(
    oauth_data: UpdateGA4OAuth,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """
    Update GA4 OAuth2 credentials for the current client.
    """
    try:
        current_client.ga4_property_id = oauth_data.ga4_property_id
        current_client.ga4_access_token = oauth_data.ga4_access_token
        current_client.ga4_refresh_token = oauth_data.ga4_refresh_token
        
        if oauth_data.ga4_token_expires_at:
            current_client.ga4_token_expires_at = datetime.fromisoformat(
                oauth_data.ga4_token_expires_at.replace('Z', '+00:00')
            )
        
        if oauth_data.ga4_connected_at:
            current_client.ga4_connected_at = datetime.fromisoformat(
                oauth_data.ga4_connected_at.replace('Z', '+00:00')
            )
        else:
            current_client.ga4_connected_at = datetime.utcnow()
        
        db.commit()
        db.refresh(current_client)
        
        return {
            "message": "GA4 OAuth credentials updated successfully",
            "ga4_property_id": current_client.ga4_property_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating GA4 OAuth credentials: {str(e)}"
        )

@router.get("/ga4-status")
async def get_ga4_status(
    current_client: Client = Depends(get_current_client)
):
    """
    Check if GA4 credentials are configured.
    Supports both OAuth2 tokens and service account JSON (legacy).
    """
    # Check for OAuth2 tokens (preferred)
    has_oauth = bool(
        current_client.ga4_property_id 
        and current_client.ga4_access_token 
        and current_client.ga4_refresh_token
    )
    
    # Check for service account JSON (legacy)
    has_service_account = bool(
        current_client.ga4_property_id and current_client.ga4_service_account_json
    )
    
    has_credentials = has_oauth or has_service_account
    
    return {
        "has_credentials": has_credentials,
        "ga4_property_id": current_client.ga4_property_id if has_credentials else None,
        "connection_type": "oauth" if has_oauth else "service_account" if has_service_account else None
    }

@router.put("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: ChangePasswordRequest,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """
    Change password for the current client.
    Requires current password for security.
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_client.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if len(password_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long"
        )
    
    # Update password
    try:
        current_client.password_hash = get_password_hash(password_data.new_password)
        db.commit()
        db.refresh(current_client)
        
        return {
            "message": "Password changed successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error changing password: {str(e)}"
        )

