# Vercel Environment Variables

## Required Environment Variables

Set these in your Vercel project dashboard:

### 1. NEXT_PUBLIC_API_URL (Required)

**Key:** `NEXT_PUBLIC_API_URL`

**Value:** `https://ai-agency-production-12a5.up.railway.app`

**Description:** The URL of your Railway backend API. This is required for the frontend to communicate with the backend.

**Important Notes:**

- Must include `https://` protocol
- No trailing slash
- Must be accessible from the internet

---

## How to Set in Vercel

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Click on your project: **visibility-report**

### Step 2: Navigate to Environment Variables

1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)

### Step 3: Add/Update Variable

1. Click **Add New**
2. Enter:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://ai-agency-production-12a5.up.railway.app`
   - **Environment:** Select all (Production, Preview, Development)
3. Click **Save**

### Step 4: Redeploy

After adding/updating environment variables:

1. Go to **Deployments** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## Quick Copy-Paste

```
NEXT_PUBLIC_API_URL=https://ai-agency-production-12a5.up.railway.app
```

---

## Verification

After setting the variable and redeploying:

1. Go to: https://visibility-report.vercel.app/login
2. Open browser DevTools (F12) → **Console** tab
3. Type: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. Should show: `https://ai-agency-production-12a5.up.railway.app`

Or check the **Network** tab when logging in - the request should go to:

```
https://ai-agency-production-12a5.up.railway.app/api/auth/login
```

---

## Troubleshooting

### Issue: Login still fails

- ✅ Check that `NEXT_PUBLIC_API_URL` is set correctly
- ✅ Make sure you **redeployed** after adding the variable
- ✅ Verify the Railway backend is running: https://ai-agency-production-12a5.up.railway.app/health
- ✅ Clear browser cache and try again

### Issue: Variable not showing in code

- Environment variables starting with `NEXT_PUBLIC_` are available in the browser
- You must **redeploy** after adding/updating them
- Variables are baked into the build at deployment time

---

## Current Configuration

**Frontend (Vercel):**

- URL: https://visibility-report.vercel.app
- Environment Variable: `NEXT_PUBLIC_API_URL`

**Backend (Railway):**

- URL: https://ai-agency-production-12a5.up.railway.app
- Environment Variables (set in Railway):
  - `DATABASE_URL` (PostgreSQL connection string)
  - `JWT_SECRET_KEY` (Secret for JWT tokens)
  - `ADMIN_SECRET_KEY` (Optional - for admin creation endpoint)
