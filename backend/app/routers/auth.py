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
    
    # Validate GA4 JSON if provided
    if client_data.ga4_service_account_json:
        try:
            import json
            json.loads(client_data.ga4_service_account_json)
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid GA4 service account JSON"
            )
    
    # Create new client (GA4 credentials optional - can be added later)
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
        is_demo=False  # All accounts start with mock data, not demo mode
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
            "is_demo": False,  # Always False now - mock data shown if GA4 not connected
            "is_admin": new_client.is_admin
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
            detail="Account not found: No account exists with this email address. Please check your email or register a new account."
        )
    
    # Check if client is active
    if not client.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account inactive: Your account has been deactivated. Please contact support."
        )
    
    # Verify password with detailed error handling
    try:
        password_valid = verify_password(client_data.password, client.password_hash)
        if not password_valid:
            # Log for debugging (helps identify password hash issues)
            import os
            if os.getenv("DEBUG", "false").lower() == "true":
                print(f"[DEBUG] Password verification failed for {client.email}")
                print(f"[DEBUG] Password hash scheme: {client.password_hash[:30] if client.password_hash else 'None'}...")
                print(f"[DEBUG] Password hash length: {len(client.password_hash) if client.password_hash else 0}")
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password: The password you entered is incorrect. Please check your password or use the 'Forgot Password' option if available."
            )
    except HTTPException:
        # Re-raise HTTP exceptions (like the one above)
        raise
    except Exception as e:
        # Catch any other errors during password verification
        print(f"[ERROR] Password verification error for {client.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password verification failed: {str(e)}. Please try again or contact support."
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "client_id": client.id,
            "email": client.email,
            "is_demo": client.is_demo,
            "is_admin": client.is_admin
        },
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/create-admin")
async def create_admin_endpoint(
    email: str = "admin@visibility-report.com",
    password: str = "Admin123!",
    company_name: str = "Admin Account",
    secret_key: str = None,
    db: Session = Depends(get_db)
):
    """
    Create admin account endpoint.
    For security, requires a secret key (set ADMIN_SECRET_KEY env var).
    """
    import os
    required_secret = os.getenv("ADMIN_SECRET_KEY", "change-this-secret-key")
    
    if secret_key != required_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid secret key"
        )
    
    # Check if admin already exists
    existing = db.query(Client).filter(Client.email == email).first()
    if existing:
        if existing.is_admin:
            # Update password even if already admin (for password reset)
            existing.password_hash = get_password_hash(password)
            if company_name:
                existing.company_name = company_name
            db.commit()
            return {"message": f"Admin account password updated: {email}", "email": email}
        else:
            # Update to admin
            existing.is_admin = True
            existing.password_hash = get_password_hash(password)
            existing.company_name = company_name
            db.commit()
            return {"message": f"Updated account to admin: {email}", "email": email}
    
    # Create new admin
    try:
        hashed_password = get_password_hash(password)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error hashing password: {str(e)}"
        )
    
    admin = Client(
        email=email,
        password_hash=hashed_password,
        company_name=company_name,
        is_admin=True,
        is_active=True,
        is_demo=False
    )
    
    try:
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return {
            "message": "Admin account created successfully",
            "email": email,
            "company": company_name
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating admin: {str(e)}"
        )

