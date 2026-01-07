# Quick Admin Setup

## Current Admin Credentials (Local Database)

✅ **Admin account is created in your LOCAL database:**

- **Email:** `admin@visibility-report.com`
- **Password:** `Admin123!`

**To use locally:**

1. Make sure backend is running: `cd backend && uvicorn main:app --reload`
2. Go to `http://localhost:3000/login`
3. Login with the credentials above

## Create Admin in Production (Railway/Vercel)

### Method 1: API Endpoint (Easiest)

1. Set `ADMIN_SECRET_KEY` environment variable in Railway:
   - Go to Railway → Your Service → Variables
   - Add: `ADMIN_SECRET_KEY` = `your-secret-key-here`

2. Call the API endpoint:

```bash
curl -X POST "https://your-railway-url.up.railway.app/api/auth/create-admin?email=admin@visibility-report.com&password=Admin123!&secret_key=your-secret-key-here"
```

Or visit in browser:

```
https://your-railway-url.up.railway.app/api/auth/create-admin?email=admin@visibility-report.com&password=Admin123!&secret_key=your-secret-key-here
```

### Method 2: Railway Console

1. Go to Railway Dashboard
2. Click your backend service
3. Click "Data" or find database
4. Open database console
5. Run the Python script:

```bash
cd backend
python3 create_admin_production.py
```

### Method 3: Direct Database Access

If you have direct database access, you can insert the admin manually using SQL.

## After Creating Admin

1. Go to your production login page (Vercel URL)
2. Login with: `admin@visibility-report.com` / `Admin123!`
3. You'll be redirected to `/admin` dashboard

## Security Note

⚠️ **Change the password after first login!**

You can create a new admin with a different password:

```bash
curl -X POST "https://your-railway-url/api/auth/create-admin?email=new-admin@email.com&password=YourSecurePassword123!&secret_key=your-secret-key"
```
