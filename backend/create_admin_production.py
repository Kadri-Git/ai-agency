"""
Script to create admin account in production database.
This uses the DATABASE_URL environment variable.

Usage:
    DATABASE_URL=your_production_db_url python create_admin_production.py
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models import Client, Base
from app.auth import get_password_hash

def create_admin_production(email: str, password: str, company_name: str = "Admin"):
    # Get DATABASE_URL from environment
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ Error: DATABASE_URL environment variable not set")
        print("Usage: DATABASE_URL=your_db_url python create_admin_production.py")
        sys.exit(1)
    
    print(f"Connecting to database: {database_url[:30]}...")
    
    # Create engine
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Check if is_admin column exists, if not add it
    try:
        with engine.connect() as conn:
            # Check if column exists (PostgreSQL)
            if database_url.startswith("postgresql"):
                result = conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='clients' AND column_name='is_admin'
                """))
                if not result.fetchone():
                    print("Adding is_admin column...")
                    conn.execute(text("ALTER TABLE clients ADD COLUMN is_admin BOOLEAN DEFAULT FALSE"))
                    conn.commit()
                    print("✅ Column added")
            else:
                # SQLite
                result = conn.execute(text("PRAGMA table_info(clients)"))
                columns = [row[1] for row in result.fetchall()]
                if 'is_admin' not in columns:
                    print("Adding is_admin column...")
                    conn.execute(text("ALTER TABLE clients ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
                    conn.commit()
                    print("✅ Column added")
    except Exception as e:
        print(f"Note: {e}")
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(Client).filter(Client.email == email).first()
        if existing:
            if existing.is_admin:
                print(f"✅ Admin account with email {email} already exists!")
                return
            else:
                # Update existing account to admin
                existing.is_admin = True
                existing.password_hash = get_password_hash(password)
                existing.company_name = company_name
                db.commit()
                print(f"✅ Updated existing account to admin: {email}")
                return
        
        # Create new admin account
        admin = Client(
            email=email,
            password_hash=get_password_hash(password),
            company_name=company_name,
            is_admin=True,
            is_active=True,
            is_demo=False
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print(f"✅ Admin account created successfully!")
        print(f"   Email: {email}")
        print(f"   Company: {company_name}")
        print(f"\nYou can now login at /login with these credentials.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    email = os.getenv("ADMIN_EMAIL", "admin@visibility-report.com")
    password = os.getenv("ADMIN_PASSWORD", "Admin123!")
    company = os.getenv("ADMIN_COMPANY", "Admin Account")
    
    create_admin_production(email, password, company)



