from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Client
from app.auth import get_current_client
from pydantic import BaseModel
import json

router = APIRouter()

class UpdateGA4Credentials(BaseModel):
    ga4_property_id: str
    ga4_service_account_json: str

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

@router.get("/ga4-status")
async def get_ga4_status(
    current_client: Client = Depends(get_current_client)
):
    """
    Check if GA4 credentials are configured.
    """
    has_credentials = bool(
        current_client.ga4_property_id and current_client.ga4_service_account_json
    )
    
    return {
        "has_credentials": has_credentials,
        "ga4_property_id": current_client.ga4_property_id if has_credentials else None
    }

