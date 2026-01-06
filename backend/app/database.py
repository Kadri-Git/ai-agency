from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Use SQLite for easier local development, PostgreSQL for production
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or DATABASE_URL.startswith("postgresql"):
    # Default to SQLite for local development if no DATABASE_URL or if PostgreSQL fails
    try:
        # Try to use provided DATABASE_URL if it's PostgreSQL
        if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
            # Will fail if psycopg2 not installed, then fall back to SQLite
            pass
        else:
            DATABASE_URL = "sqlite:///./ai_visibility.db"
    except:
        DATABASE_URL = "sqlite:///./ai_visibility.db"

# Default to SQLite if not set
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./ai_visibility.db"

# Create engine with check_same_thread=False for SQLite
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif DATABASE_URL.startswith("postgresql"):
    # Try to import psycopg2, if not available, fall back to SQLite
    try:
        import psycopg2
    except ImportError:
        print("Warning: psycopg2 not installed, falling back to SQLite")
        DATABASE_URL = "sqlite:///./ai_visibility.db"
        connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

