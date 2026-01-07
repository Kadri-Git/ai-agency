# Create Admin Account in Production

The admin account was created in your **local database** only. To use it in production (Vercel/Railway), you need to create it in the production database.

## Option 1: Using Railway Console (Easiest)

1. Go to Railway Dashboard: https://railway.app
2. Click on your backend service
3. Click on "Data" tab or find your database
4. Click "Query" or "Console"
5. Run this SQL (replace with your desired credentials):

```sql
-- For PostgreSQL
INSERT INTO clients (id, email, password_hash, company_name, is_admin, is_active, is_demo, created_at)
VALUES (
    gen_random_uuid()::text,
    'admin@visibility-report.com',
    '$pbkdf2-sha256$29000$...',  -- You'll need to generate this
    'Admin Account',
    true,
    true,
    false,
    NOW()
);
```

**Better approach:** Use the Python script below.

## Option 2: Using Python Script with Railway Environment

1. Get your Railway DATABASE_URL:
   - Go to Railway → Your Service → Variables
   - Copy the `DATABASE_URL` value

2. Run the script locally with production DATABASE_URL:

```bash
cd backend
DATABASE_URL="your_railway_database_url" python3 create_admin_production.py
```

Or set environment variables:

```bash
export DATABASE_URL="your_railway_database_url"
export ADMIN_EMAIL="admin@visibility-report.com"
export ADMIN_PASSWORD="YourSecurePassword123!"
python3 create_admin_production.py
```

## Option 3: SSH into Railway and Run Script

1. In Railway, go to your service
2. Open the terminal/console
3. Run:

```bash
cd backend
python3 create_admin_production.py
```

## Option 4: Quick SQL Insert (If you have database access)

If you can access your production database directly, you can insert the admin manually. First, generate a password hash:

```python
from app.auth import get_password_hash
print(get_password_hash("Admin123!"))
```

Then insert into database with that hash.

## Default Credentials (Local)

For your **local** database, the admin account is:

- **Email:** `admin@visibility-report.com`
- **Password:** `Admin123!`

## Verify Admin Account

After creating, test login:

1. Go to your production login page
2. Enter admin credentials
3. You should be redirected to `/admin`
