# Production Admin Setup - visibility-report.vercel.app

This guide will help you create an admin account so you can access the admin dashboard on your production domain: **https://visibility-report.vercel.app**

## Step 1: Find Your Railway Backend URL

1. Go to **Railway Dashboard**: https://railway.app
2. Click on your backend service
3. Look for the **"Domains"** or **"Settings"** section
4. Copy your Railway URL (e.g., `https://ai-agency-production-dc71.up.railway.app`)

**Note:** If you don't see a URL, Railway might have generated one. Check the service logs or the "Settings" → "Domains" section.

## Step 2: Set Admin Secret Key (Optional but Recommended)

1. In Railway Dashboard → Your Service → **Variables**
2. Add a new variable:
   - **Name**: `ADMIN_SECRET_KEY`
   - **Value**: `your-secret-key-here` (choose a strong password)
3. Click **Add**

## Step 3: Create Admin Account

### Option A: Via Browser (Easiest)

1. Open your browser
2. Visit this URL (replace with your Railway URL and secret key):

```
https://your-railway-url.up.railway.app/api/auth/create-admin?email=admin@visibility-report.com&password=Admin123!&secret_key=your-secret-key-here
```

If you didn't set `ADMIN_SECRET_KEY`, use the default:

```
https://your-railway-url.up.railway.app/api/auth/create-admin?email=admin@visibility-report.com&password=Admin123!&secret_key=change-this-secret-key
```

3. You should see a success message like:

```json
{
  "message": "Admin account created successfully",
  "email": "admin@visibility-report.com",
  "company": "Admin Account"
}
```

### Option B: Via Railway Console

1. Go to Railway Dashboard → Your Service
2. Click **"Deployments"** → Find the latest deployment
3. Click **"View Logs"** or open the **"Console"**
4. Run:

```bash
cd backend
python3 create_admin_production.py
```

## Step 4: Login on Production

1. Go to: **https://visibility-report.vercel.app/login**
2. Enter credentials:
   - **Email**: `admin@visibility-report.com`
   - **Password**: `Admin123!`
3. Click **Login**
4. You should be redirected to `/admin` dashboard

## Step 5: Verify Admin Dashboard Works

After logging in, you should see:

- Admin dashboard at `/admin`
- List of all clients
- Ability to select and view any client's dashboard

## Troubleshooting

### "Incorrect email or password"

- The admin account wasn't created in production
- Try creating it again using Step 3

### "Cannot connect to backend"

- Check that `NEXT_PUBLIC_API_URL` is set in Vercel
- Go to Vercel → Your Project → Settings → Environment Variables
- Make sure `NEXT_PUBLIC_API_URL` = your Railway backend URL (with `https://`)

### "403 Forbidden" when creating admin

- Check that `ADMIN_SECRET_KEY` matches in Railway and the URL
- Or use the default: `change-this-secret-key`

## Security Recommendation

⚠️ **After first login, change the admin password!**

You can create a new admin with a different password:

```
https://your-railway-url/api/auth/create-admin?email=admin@visibility-report.com&password=YourNewSecurePassword123!&secret_key=your-secret-key
```

## Quick Reference

- **Production Frontend**: https://visibility-report.vercel.app
- **Production Backend**: (Your Railway URL)
- **Admin Email**: `admin@visibility-report.com`
- **Admin Password**: `Admin123!` (change after first login)
