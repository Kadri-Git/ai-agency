from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.routers import auth, dashboard, settings, admin
from app.database import engine, Base

load_dotenv()

# Create database tables
# IMPORTANT: create_all() only creates tables if they don't exist
# It NEVER drops or deletes existing tables or data
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # This is safe - it only creates missing tables, never deletes data
    # Accounts are preserved across deployments as long as DATABASE_URL is persistent
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown

app = FastAPI(
    title="AI Shopping Visibility API",
    description="Multi-tenant GA4 dashboard API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - Allow all origins for development/production flexibility
# In production, you may want to restrict this
# Note: Cannot use allow_origins=["*"] with allow_credentials=True
# So we list specific origins for development
is_development = os.getenv("ENVIRONMENT", "development").lower() != "production"

if is_development:
    # In development, allow common localhost origins
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
else:
    # Specific origins for production
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://visibility-report.vercel.app",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
async def root():
    return {"message": "AI Shopping Visibility API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

