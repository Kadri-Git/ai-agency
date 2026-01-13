# Google OAuth Configuration for visibility-report.vercel.app

## Exact URLs to Add in Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project (where you created the OAuth credentials)
3. Navigate to: **APIs & Services** → **Credentials**
4. Click on your **OAuth 2.0 Client ID**

### Step 2: Add Authorized Redirect URIs

Add these **exact** URIs (one per line):

```
https://visibility-report.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

**Important**: Copy these exactly - no trailing slashes, exact casing.

### Step 3: Add Authorized JavaScript Origins

Add these origins:

```
https://visibility-report.vercel.app
http://localhost:3000
```

### Step 4: Add Test User

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Scroll to **"Test users"** section
3. Click **"+ ADD USERS"**
4. Add: `kaasikkadri@gmail.com`
5. Click **"ADD"**

### Step 5: Verify Vercel Environment Variables

Go to Vercel dashboard → Your Project → Settings → Environment Variables

Make sure these are set:

```
NEXTAUTH_URL=https://visibility-report.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
```

**After adding/updating environment variables:**

- Click **"Save"**
- Go to **Deployments** tab
- Click **"Redeploy"** on the latest deployment (or create a new deployment)

### Step 6: Verify Scopes

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Click **"Scopes"** tab
3. Verify these scopes are present:
   - `https://www.googleapis.com/auth/analytics.readonly`
   - `openid`
   - `email`
   - `profile`

If missing, click **"Add or Remove Scopes"** and add them.

### Step 7: Wait and Test

1. **Wait 5-10 minutes** after making changes (Google's cache needs to update)
2. **Clear browser cache** or use incognito mode
3. Try connecting with Google again

## Troubleshooting

### Still getting error after 10 minutes?

1. **Double-check the redirect URI matches exactly**:
   - Go to Google Cloud Console → Credentials → Your OAuth Client
   - Verify `https://visibility-report.vercel.app/api/auth/callback/google` is listed
   - Check for typos, extra spaces, or wrong protocol (http vs https)

2. **Verify Vercel environment variables**:
   - Go to Vercel → Project → Settings → Environment Variables
   - Ensure `NEXTAUTH_URL` is exactly: `https://visibility-report.vercel.app`
   - Redeploy if you just added it

3. **Check if app is published**:
   - If your app is in "Testing" mode, make sure `kaasikkadri@gmail.com` is in test users
   - OR publish your app: OAuth consent screen → "PUBLISH APP"

4. **Check browser console**:
   - Open browser dev tools (F12)
   - Check Console tab for exact error message
   - Share the error if it's different from the original

## Quick Checklist

- [ ] Added redirect URI: `https://visibility-report.vercel.app/api/auth/callback/google`
- [ ] Added JavaScript origin: `https://visibility-report.vercel.app`
- [ ] Added test user: `kaasikkadri@gmail.com`
- [ ] Verified scopes are added (analytics.readonly, openid, email, profile)
- [ ] Set `NEXTAUTH_URL` in Vercel to: `https://visibility-report.vercel.app`
- [ ] Redeployed Vercel app after environment variable changes
- [ ] Waited 5-10 minutes for Google's cache to update
- [ ] Tried again in incognito/private browser mode
