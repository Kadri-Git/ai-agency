# Railway Backend Setup - Step by Step

This guide will help you deploy your FastAPI backend to Railway and get the URL.

## Step 1: Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with your **GitHub account** (recommended)

## Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub if prompted
4. Select your repository: **`Kadri-Git/ai-agency`**
5. Click **"Deploy Now"**

## Step 3: Configure the Service

After Railway starts deploying, you need to configure it:

### 3.1 Set Root Directory

1. Click on your service (the deployed app)
2. Go to **Settings** tab
3. Scroll to **"Root Directory"**
4. Set it to: **`backend`**
5. Click **"Update"**

### 3.2 Set Start Command

1. Still in **Settings** tab
2. Scroll to **"Start Command"**
3. Set it to:
   ```
   cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. Click **"Update"**

### 3.3 Add Environment Variables

1. Go to **Variables** tab
2. Click **"+ New Variable"**
3. Add these variables:

   **Variable 1:**
   - Name: `DATABASE_URL`
   - Value: `sqlite:///./ai_visibility.db`
   - (Or use Supabase/Neon for production - see below)

   **Variable 2:**
   - Name: `JWT_SECRET_KEY`
   - Value: `your-strong-secret-key-min-32-characters-change-this`
   - (Generate a random string - this is important for security!)

4. Click **"Add"** for each variable

## Step 4: Wait for Deployment

1. Go to **Deployments** tab
2. Watch the build logs
3. Wait for deployment to complete (usually 2-5 minutes)
4. You should see: **"Deployment successful"**

## Step 5: Get Your Backend URL

1. Go to **Settings** tab
2. Scroll to **"Domains"** section
3. You'll see your Railway URL, something like:
   ```
   https://your-app-name.up.railway.app
   ```
4. **Copy this URL** - this is your backend URL!

## Step 6: Test Your Backend

1. Open your Railway URL in a browser
2. You should see: `{"message":"AI Shopping Visibility API","status":"running"}`
3. Try the health endpoint: `https://your-app-name.up.railway.app/health`
4. Should return: `{"status":"healthy"}`

## Step 7: Use This URL in Vercel

Now you have your Railway backend URL! Use it in Vercel:

1. Go to Vercel dashboard
2. Your project → Settings → Environment Variables
3. Add:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-app-name.up.railway.app` (your Railway URL)
4. Redeploy your Vercel app

## Optional: Custom Domain

If you want a custom domain:

1. In Railway → Settings → Domains
2. Click **"Generate Domain"** or **"Custom Domain"**
3. Follow the instructions

## Production Database (Recommended)

For production, don't use SQLite. Use a proper database:

### Option A: Supabase (Free tier)

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Update `DATABASE_URL` in Railway:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   ```

### Option B: Neon (Free tier)

1. Go to https://neon.tech
2. Create a project
3. Copy the connection string
4. Update `DATABASE_URL` in Railway

## Troubleshooting

### Build fails

- Check that Root Directory is set to `backend`
- Check that Start Command is correct
- Check build logs in Railway dashboard

### Backend not accessible

- Check that deployment completed successfully
- Verify the URL is correct
- Check Railway logs for errors

### CORS errors

- Make sure you've updated `backend/main.py` with Vercel domains
- Redeploy backend after CORS changes

## Your Railway Dashboard

Once set up, you can:

- View logs: **Deployments** tab → Click on deployment → **View Logs**
- Monitor usage: **Metrics** tab
- Manage environment variables: **Variables** tab
- View domains: **Settings** → **Domains**

## Quick Reference

- **Railway Dashboard**: https://railway.app/dashboard
- **Your Backend URL**: Found in Settings → Domains
- **Health Check**: `https://your-app.up.railway.app/health`
- **API Docs**: `https://your-app.up.railway.app/docs` (FastAPI auto-generates this)
