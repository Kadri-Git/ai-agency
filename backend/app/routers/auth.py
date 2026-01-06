from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import Client
from app.schemas import ClientRegister, ClientLogin, Token
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(client_data: ClientRegister, db: Session = Depends(get_db)):
    # Check if client already exists
    existing_client = db.query(Client).filter(Client.email == client_data.email).first()
    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate: if not demo mode, GA4 credentials are required
    if not client_data.is_demo:
        if not client_data.ga4_property_id or not client_data.ga4_service_account_json:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GA4 credentials are required for non-demo accounts"
            )
        # Validate JSON
        try:
            import json
            json.loads(client_data.ga4_service_account_json)
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid GA4 service account JSON"
            )
    
    # Create new client
    try:
        hashed_password = get_password_hash(client_data.password)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error hashing password: {str(e)}"
        )
    
    new_client = Client(
        email=client_data.email,
        password_hash=hashed_password,
        company_name=client_data.company_name,
        ga4_property_id=client_data.ga4_property_id,
        ga4_service_account_json=client_data.ga4_service_account_json,
        is_demo=client_data.is_demo
    )
    
    try:
        db.add(new_client)
        db.commit()
        db.refresh(new_client)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating client: {str(e)}"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "client_id": new_client.id,
            "email": new_client.email,
            "is_demo": new_client.is_demo
        },
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(client_data: ClientLogin, db: Session = Depends(get_db)):
    # Find client
    client = db.query(Client).filter(Client.email == client_data.email).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(client_data.password, client.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if client is active
    if not client.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client account is inactive"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "client_id": client.id,
            "email": client.email,
            "is_demo": client.is_demo
        },
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

