# Check Vercel Environment Variables

## The Problem

The backend login works, but frontend login fails. This usually means:

**`NEXT_PUBLIC_API_URL` is not set correctly in Vercel!**

## How to Fix

### Step 1: Go to Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click on your project: **visibility-report**
3. Go to **Settings** → **Environment Variables**

### Step 2: Check/Add NEXT_PUBLIC_API_URL

Look for `NEXT_PUBLIC_API_URL`:

- **If it exists**: Make sure the value is:

  ```
  https://ai-agency-production-12a5.up.railway.app
  ```

  (Must include `https://` and no trailing slash)

- **If it doesn't exist**: Add it:
  - **Key**: `NEXT_PUBLIC_API_URL`
  - **Value**: `https://ai-agency-production-12a5.up.railway.app`
  - **Environment**: Select all (Production, Preview, Development)

### Step 3: Redeploy

After adding/updating the variable:

1. Go to **Deployments** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 4: Test

1. Go to: https://visibility-report.vercel.app/login
2. Clear browser cache (or use incognito)
3. Try logging in with:
   - Email: `admin@visibility-report.com`
   - Password: `Admin123!`

## Verify It's Set

You can check if the variable is set by:

1. Opening browser console (F12)
2. Going to: https://visibility-report.vercel.app/login
3. In console, type:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_URL)
   ```
   Or check the Network tab to see what URL the login request goes to.

## Common Issues

### Issue 1: Missing `https://`

- ❌ Wrong: `ai-agency-production-12a5.up.railway.app`
- ✅ Correct: `https://ai-agency-production-12a5.up.railway.app`

### Issue 2: Trailing Slash

- ❌ Wrong: `https://ai-agency-production-12a5.up.railway.app/`
- ✅ Correct: `https://ai-agency-production-12a5.up.railway.app`

### Issue 3: Wrong Environment

- Make sure `NEXT_PUBLIC_API_URL` is set for **Production** environment
- Or set it for **All** environments

### Issue 4: Not Redeployed

- After adding/updating environment variables, you **must redeploy**
- Vercel doesn't automatically redeploy when env vars change

## Quick Test

To verify the API URL is correct, check the browser Network tab:

1. Open: https://visibility-report.vercel.app/login
2. Open DevTools (F12) → Network tab
3. Try to login
4. Look for the login request
5. Check the URL - it should be:
   ```
   https://ai-agency-production-12a5.up.railway.app/api/auth/login
   ```

If it's something else (like `/api/auth/login` or `localhost:8000`), then `NEXT_PUBLIC_API_URL` is not set correctly.
