# Google Analytics 4 OAuth2 Self-Service Integration Setup Guide

This guide will walk you through setting up OAuth2 self-service integration for Google Analytics 4 in your Next.js application.

## 📋 Table of Contents

1. [Google Cloud Console Setup](#google-cloud-console-setup)
2. [Environment Variables](#environment-variables)
3. [Database Migration](#database-migration)
4. [Testing Locally](#testing-locally)
5. [Vercel Deployment](#vercel-deployment)
6. [Troubleshooting](#troubleshooting)

---

## 1. Google Cloud Console Setup

### Step 1: Create or Select a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Either select an existing project or click "New Project"
4. If creating new: Enter project name (e.g., "AI Visibility Platform") and click "Create"

### Step 2: Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable these APIs:
   - **Google Analytics Data API** (for fetching analytics data)
   - **Google Analytics Admin API** (for listing GA4 properties)

   To enable:
   - Click on each API name
   - Click the **Enable** button
   - Wait for confirmation

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required information:
   - **App name**: AI Visibility Platform (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On **Scopes** page, click **Add or Remove Scopes**
7. Add these scopes:
   - `https://www.googleapis.com/auth/analytics.readonly`
   - `openid`
   - `email`
   - `profile`
8. Click **Update** → **Save and Continue**
9. On **Test users** page (if in testing mode):
   - Add test users who will use the app during testing
   - Click **Save and Continue**
10. Review and click **Back to Dashboard**

### Step 4: Create OAuth2 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen (follow Step 3 above)
4. Choose **Application type**: **Web application**
5. Enter a **Name**: "AI Visibility Platform Web Client"
6. **Authorized JavaScript origins**:
   - For localhost: `http://localhost:3000`
   - For production: `https://visibility-report.vercel.app`
7. **Authorized redirect URIs**:
   - For localhost: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://visibility-report.vercel.app/api/auth/callback/google`
8. Click **Create**
9. **IMPORTANT**: Copy the **Client ID** and **Client Secret** immediately
   - You'll need these for environment variables
   - The secret won't be shown again

---

## 2. Environment Variables

### Local Development (.env.local)

Create or update `.env.local` in your project root:

```env
# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth Configuration
NEXTAUTH_SECRET=generate-a-random-secret-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Backend API (existing)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

### Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

| Variable               | Value                                  | Environment                      |
| ---------------------- | -------------------------------------- | -------------------------------- |
| `GOOGLE_CLIENT_ID`     | Your Google Client ID                  | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret              | Production, Preview, Development |
| `NEXTAUTH_SECRET`      | Your generated secret (32+ chars)      | Production, Preview, Development |
| `NEXTAUTH_URL`         | `https://visibility-report.vercel.app` | Production                       |
| `NEXT_PUBLIC_API_URL`  | Your Railway backend URL               | Production, Preview, Development |

**Important**:

- Use the same `NEXTAUTH_SECRET` for all environments
- Update `NEXTAUTH_URL` to match your production domain
- After adding variables, **redeploy** your application

---

## 3. Database Migration

The database schema has been updated to support OAuth tokens. You need to add the new columns to your database.

### For SQLite (Local Development)

If using SQLite locally, the schema will be created automatically when you run the backend.

### For PostgreSQL (Production - Railway)

Run this SQL migration on your Railway PostgreSQL database:

```sql
-- Add OAuth2 token columns to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS ga4_access_token TEXT,
ADD COLUMN IF NOT EXISTS ga4_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS ga4_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ga4_connected_at TIMESTAMP WITH TIME ZONE;
```

**How to run on Railway:**

1. Go to Railway Dashboard → Your PostgreSQL service
2. Click on **Data** tab
3. Click **Open in Railway Data** or use a PostgreSQL client
4. Run the SQL above

Or use Railway CLI:

```bash
railway connect postgres
# Then run the SQL commands
```

---

## 4. Testing Locally

### Step 1: Start Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Step 2: Start Frontend

```bash
npm run dev
```

### Step 3: Test OAuth Flow

1. Navigate to `http://localhost:3000/connect-analytics`
2. Click **Connect with Google**
3. Sign in with a Google account that has access to GA4 properties
4. Grant permissions when prompted
5. Select a GA4 property from the dropdown
6. Click **Connect This Property**
7. You should be redirected to the dashboard with real data

### Step 4: Verify Connection

1. Go to `/dashboard`
2. Check that the GA4 section shows "GA4 Connected"
3. Verify that real analytics data is displayed (not mock data)

---

## 5. Vercel Deployment

### Pre-Deployment Checklist

- [ ] Google Cloud Console OAuth credentials created
- [ ] Authorized redirect URIs include production URL
- [ ] All environment variables added to Vercel
- [ ] Database migration run on production database
- [ ] Backend deployed and running on Railway

### Deployment Steps

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "feat: Add GA4 OAuth2 self-service integration"
   git push origin main
   ```

2. **Vercel will auto-deploy** (if connected to GitHub)

3. **Verify Deployment**:
   - Check Vercel deployment logs for errors
   - Test OAuth flow on production URL
   - Verify environment variables are loaded

### Post-Deployment Testing

1. Visit `https://visibility-report.vercel.app/connect-analytics`
2. Test the OAuth flow
3. Verify data is fetched correctly
4. Check browser console for errors

---

## 6. Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution**:

- Check that the redirect URI in Google Cloud Console exactly matches:
  - Production: `https://visibility-report.vercel.app/api/auth/callback/google`
  - Localhost: `http://localhost:3000/api/auth/callback/google`
- No trailing slashes, exact match required

### Issue: "Invalid client secret"

**Solution**:

- Verify `GOOGLE_CLIENT_SECRET` in Vercel environment variables
- Make sure there are no extra spaces or quotes
- Regenerate credentials if needed

### Issue: "No properties found"

**Solution**:

- Ensure the Google account has access to at least one GA4 property
- Check that Analytics Admin API is enabled
- Verify the account has proper permissions in Google Analytics

### Issue: "Token refresh failed"

**Solution**:

- Check that `refresh_token` is being stored in database
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure `prompt: 'consent'` is set in NextAuth config (already done)

### Issue: "Database column does not exist"

**Solution**:

- Run the database migration SQL (see Section 3)
- Restart the backend server
- Verify columns exist: `ga4_access_token`, `ga4_refresh_token`, etc.

### Issue: "Session not found" or "Not authenticated"

**Solution**:

- Ensure `SessionProvider` is added to `src/app/layout.tsx` (already done)
- Check that `NEXTAUTH_SECRET` is set and consistent
- Clear browser cookies and try again

### Issue: Backend can't fetch GA4 data

**Solution**:

- Verify OAuth tokens are saved in database
- Check backend logs for API errors
- Ensure the access token hasn't expired
- Check that the property ID is correct

---

## 7. How It Works

### OAuth Flow

1. User clicks "Connect with Google" on `/connect-analytics`
2. NextAuth redirects to Google OAuth consent screen
3. User grants permissions (read-only analytics access)
4. Google redirects back with authorization code
5. NextAuth exchanges code for access token and refresh token
6. Tokens are stored in NextAuth session
7. User selects a GA4 property
8. Frontend sends tokens to backend via `/api/client/save-property`
9. Backend stores tokens in database
10. Backend uses tokens to fetch GA4 data via Google Analytics Data API

### Token Refresh

- Access tokens expire after 1 hour
- Refresh tokens are long-lived
- NextAuth automatically refreshes access tokens when needed
- Backend can also refresh tokens using the stored refresh token

### Data Fetching

- Backend checks for OAuth tokens first (preferred)
- Falls back to service account JSON if OAuth not available (legacy support)
- Uses `BetaAnalyticsDataClient` with OAuth credentials
- Fetches AI traffic metrics, revenue trends, and landing pages

---

## 8. Security Best Practices

✅ **Implemented**:

- Tokens stored securely in database (encrypted at rest by PostgreSQL)
- OAuth tokens never exposed in client-side code
- Session-based authentication with NextAuth
- HTTPS required in production
- Read-only scope (`analytics.readonly`)

⚠️ **Additional Recommendations**:

- Regularly rotate `NEXTAUTH_SECRET` (every 6-12 months)
- Monitor token usage and refresh failures
- Set up alerts for authentication failures
- Consider implementing rate limiting on API endpoints
- Review OAuth consent screen periodically

---

## 9. Support

If you encounter issues not covered here:

1. Check browser console for errors
2. Check backend logs (Railway dashboard)
3. Check Vercel deployment logs
4. Verify all environment variables are set correctly
5. Test OAuth flow in incognito/private browser window

---

## 10. Next Steps

After successful setup:

1. **Test with multiple users**: Ensure each user can connect their own GA4 account
2. **Monitor token refresh**: Check that tokens refresh automatically
3. **Update documentation**: Add any custom configurations
4. **Set up monitoring**: Track OAuth success/failure rates
5. **Consider migration**: Plan to migrate existing service account users to OAuth

---

**Last Updated**: January 2025
**Version**: 1.0.0
