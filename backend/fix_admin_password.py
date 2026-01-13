#!/usr/bin/env python3
"""
Script to fix admin password in production database
This directly connects to the database and updates the password
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models import Client
from app.auth import get_password_hash, verify_password

# Get DATABASE_URL from environment (Railway sets this)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL environment variable not set")
    print("This script must be run in Railway environment or with DATABASE_URL set")
    sys.exit(1)

print(f"Connecting to database: {DATABASE_URL[:50]}...")

try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    email = "admin@visibility-report.com"
    password = "Admin123!"
    
    # Find the admin account
    admin = db.query(Client).filter(Client.email == email).first()
    
    if not admin:
        print(f"❌ Account with email {email} not found!")
        print("Creating new admin account...")
        
        admin = Client(
            email=email,
            password_hash=get_password_hash(password),
            company_name="Admin Account",
            is_admin=True,
            is_active=True,
            is_demo=False
        )
        db.add(admin)
        db.commit()
        print("✅ Admin account created!")
    else:
        print(f"✅ Found account: {email}")
        print(f"   Current is_admin: {admin.is_admin}")
        print(f"   Current is_active: {admin.is_active}")
        
        # Test current password
        current_password_works = verify_password(password, admin.password_hash)
        print(f"   Current password works: {current_password_works}")
        
        if not current_password_works:
            print("   Updating password hash...")
            admin.password_hash = get_password_hash(password)
            admin.is_admin = True
            admin.is_active = True
            db.commit()
            print("   ✅ Password updated!")
            
            # Verify new password works
            admin = db.query(Client).filter(Client.email == email).first()
            new_password_works = verify_password(password, admin.password_hash)
            print(f"   New password works: {new_password_works}")
        else:
            print("   ✅ Password is already correct!")
    
    # Final verification
    admin = db.query(Client).filter(Client.email == email).first()
    final_check = verify_password(password, admin.password_hash)
    
    print("\n" + "="*50)
    print("FINAL STATUS:")
    print(f"   Email: {admin.email}")
    print(f"   is_admin: {admin.is_admin}")
    print(f"   is_active: {admin.is_active}")
    print(f"   Password verification: {'✅ WORKS' if final_check else '❌ FAILS'}")
    print("="*50)
    
    if final_check and admin.is_admin:
        print("\n✅ SUCCESS! Admin account is ready.")
        print(f"\nLogin with:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
    else:
        print("\n❌ ERROR: Something is wrong!")
        if not final_check:
            print("   Password verification failed!")
        if not admin.is_admin:
            print("   Account is not marked as admin!")
    
    db.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)


