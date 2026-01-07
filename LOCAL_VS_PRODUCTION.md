# Local vs Production Database - Important!

## The Problem

Your app uses **two separate databases**:

1. **Localhost** → SQLite database (`ai_visibility.db` file on your computer)
2. **Production (Railway)** → PostgreSQL database (cloud database)

**These databases are completely separate!** Accounts created locally won't exist in production, and vice versa.

## Why This Happens

- **Local development**: Uses SQLite (a file-based database) for simplicity
- **Production (Railway)**: Uses PostgreSQL (a cloud database) for reliability

## Solution: Create Accounts in Production

### Option 1: Use the Admin Account (Already Created)

The admin account already exists in production:

- **Email**: `admin@visibility-report.com`
- **Password**: `Admin123!`

Just login at: https://visibility-report.vercel.app/login

### Option 2: Create Your Account in Production

If you want to use a different email, create it in production:

1. **Via Registration Page** (Easiest):
   - Go to: https://visibility-report.vercel.app/register
   - Register with your email/password
   - This creates the account in the production database

2. **Via API** (If you want to make it admin):
   ```bash
   curl -X POST "https://ai-agency-production-12a5.up.railway.app/api/auth/create-admin?email=YOUR_EMAIL&password=YOUR_PASSWORD&secret_key=change-this-secret-key"
   ```

### Option 3: Sync Local Account to Production

If you created an account locally and want to use it in production:

1. **Note your local credentials** (email/password)
2. **Create the same account in production**:
   - Use the registration page, OR
   - Use the create-admin API if you want admin access

## Quick Fix

**For now, just use the admin account that's already in production:**

1. Go to: https://visibility-report.vercel.app/login
2. Login with:
   - Email: `admin@visibility-report.com`
   - Password: `Admin123!`

This will work because this account exists in the production database.

## Understanding the Databases

```
┌─────────────────┐         ┌──────────────────┐
│   Localhost     │         │   Production     │
│   (Your PC)     │         │   (Railway)      │
├─────────────────┤         ├──────────────────┤
│ SQLite Database │   ❌    │ PostgreSQL DB    │
│ ai_visibility.db│  (Not   │ (Cloud Database) │
│                 │  synced)│                  │
└─────────────────┘         └──────────────────┘
```

**Key Point**: Always create accounts in production if you want to use them on the live site!
