from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Client
from app.schemas import TokenData
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Use pbkdf2_sha256 as primary (more compatible) with bcrypt as fallback
# This avoids bcrypt initialization issues on some systems
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    # Test bcrypt works
    test_hash = pwd_context.hash("test")
except:
    # Fallback to pbkdf2_sha256 if bcrypt has issues
    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Validate inputs
        if not plain_password:
            print("[ERROR] verify_password: plain_password is empty")
            return False
        if not hashed_password:
            print("[ERROR] verify_password: hashed_password is empty")
            return False
        
        # Ensure password is a string and not too long
        if not isinstance(plain_password, str):
            plain_password = str(plain_password)
        if not isinstance(hashed_password, str):
            hashed_password = str(hashed_password)
        
        # Bcrypt has a 72 byte limit
        if len(plain_password.encode('utf-8')) > 72:
            plain_password = plain_password[:72]
        
        # Try to verify password
        result = pwd_context.verify(plain_password, hashed_password)
        
        # Log for debugging if verification fails
        if not result:
            import os
            if os.getenv("DEBUG", "false").lower() == "true":
                print(f"[DEBUG] Password verification failed")
                print(f"[DEBUG] Hash scheme: {hashed_password[:30]}...")
                print(f"[DEBUG] Hash length: {len(hashed_password)}")
                print(f"[DEBUG] Password length: {len(plain_password)}")
        
        return result
    except Exception as e:
        # Log detailed error for debugging
        print(f"[ERROR] Password verification exception: {type(e).__name__}: {e}")
        print(f"[ERROR] Hash scheme detected: {hashed_password[:30] if hashed_password else 'None'}...")
        import traceback
        traceback.print_exc()
        return False

def get_password_hash(password: str) -> str:
    try:
        # Ensure password is a string
        if not isinstance(password, str):
            password = str(password)
        # Bcrypt has a 72 byte limit
        if len(password.encode('utf-8')) > 72:
            password = password[:72]
        return pwd_context.hash(password)
    except Exception as e:
        raise ValueError(f"Error hashing password: {e}")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_client_from_token(token: str, db: Session) -> Client:
    """Get client from JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        client_id: str = payload.get("client_id")
        if client_id is None:
            return None
        return db.query(Client).filter(Client.id == client_id).first()
    except JWTError:
        return None

def get_current_client(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Client:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        client_id: str = payload.get("client_id")
        email: str = payload.get("email")
        
        if client_id is None or email is None:
            raise credentials_exception
            
        token_data = TokenData(client_id=client_id, email=email)
    except JWTError:
        raise credentials_exception
    
    client = db.query(Client).filter(Client.id == token_data.client_id).first()
    if client is None:
        raise credentials_exception
    
    if not client.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client account is inactive"
        )
    
    return client

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Client:
    """Get current admin user - must be authenticated and have is_admin=True"""
    client = get_current_client(credentials, db)
    
    if not client.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return client

