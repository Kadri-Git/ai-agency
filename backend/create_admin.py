"""
Script to create an admin account.
Run this script to create the first admin user.

Usage:
    python create_admin.py
    or
    python create_admin.py --email admin@example.com --password yourpassword --company "Admin Company"
"""

import sys
import os
import argparse
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import Client
from app.auth import get_password_hash

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def create_admin(email: str, password: str, company_name: str = "Admin"):
    db: Session = SessionLocal()
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
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create an admin account")
    parser.add_argument("--email", default="admin@example.com", help="Admin email")
    parser.add_argument("--password", default="admin123", help="Admin password")
    parser.add_argument("--company", default="Admin", help="Company name")
    
    args = parser.parse_args()
    
    print("Creating admin account...")
    create_admin(args.email, args.password, args.company)


