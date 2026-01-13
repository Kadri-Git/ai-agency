# Fix Google OAuth "Access Blocked" Error

This error occurs when Google Cloud Console OAuth configuration doesn't match your app's requirements.

## Error Message

```
Access is blocked: authorization error
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy
Error 400: invalid_request
```

## Quick Fix Steps

### Step 1: Check Your Vercel Deployment URL

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your project
3. Copy the deployment URL (e.g., `https://your-app.vercel.app` or `https://your-app-name.vercel.app`)

### Step 2: Update Google Cloud Console OAuth Settings

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (the one where you created the OAuth credentials)
3. **Navigate to**: APIs & Services → Credentials
4. **Click on your OAuth 2.0 Client ID** (the one with Client ID starting with your actual ID)

### Step 3: Add Redirect URI

In the OAuth client settings, add these **Authorized redirect URIs**:

**For Production (Vercel):**

```
https://YOUR-VERCEL-URL.vercel.app/api/auth/callback/google
```

Replace `YOUR-VERCEL-URL` with your actual Vercel deployment URL.

**For Local Development:**

```
http://localhost:3000/api/auth/callback/google
```

**For All Vercel Domains (if you have preview deployments):**

```
https://*.vercel.app/api/auth/callback/google
```

### Step 4: Add Authorized JavaScript Origins

In the same OAuth client settings, add these **Authorized JavaScript origins**:

**For Production:**

```
https://YOUR-VERCEL-URL.vercel.app
```

**For Local Development:**

```
http://localhost:3000
```

**For All Vercel Domains:**

```
https://*.vercel.app
```

### Step 5: Fix OAuth Consent Screen (If App is in Testing Mode)

If your app shows "Testing" in the OAuth consent screen:

1. **Go to**: APIs & Services → OAuth consent screen
2. **Scroll to "Test users"** section
3. **Click "Add Users"**
4. **Add your email** (`kaasikkadri@gmail.com` in your case)
5. **Click "Save"**

**OR** to make it publicly available:

1. Go to **OAuth consent screen**
2. Scroll to **"Publishing status"**
3. Click **"PUBLISH APP"** (if you're ready for production)
4. Confirm publishing

**Note**: If you publish, anyone can use your app. If you keep it in testing, only test users can sign in.

### Step 6: Verify Scopes Are Added

1. **Go to**: APIs & Services → OAuth consent screen
2. **Click on "Scopes"** tab
3. **Verify these scopes are added**:
   - `https://www.googleapis.com/auth/analytics.readonly`
   - `openid`
   - `email`
   - `profile`

If any are missing:

1. Click **"Add or Remove Scopes"**
2. Add the missing scopes
3. Click **"Update"** → **"Save and Continue"**

### Step 7: Update Vercel Environment Variables

Make sure `NEXTAUTH_URL` is set in Vercel:

1. Go to your Vercel project settings
2. Go to **Environment Variables**
3. Add or update:
   - `NEXTAUTH_URL` = `https://YOUR-VERCEL-URL.vercel.app`
   - `GOOGLE_CLIENT_ID` = (your client ID)
   - `GOOGLE_CLIENT_SECRET` = (your client secret)
   - `NEXTAUTH_SECRET` = (your secret)

4. **Redeploy** your Vercel app after adding environment variables

## Common Issues

### Issue 1: "Redirect URI mismatch"

**Solution**: The redirect URI in your request doesn't exactly match what's in Google Cloud Console. Check:

- No trailing slashes
- Exact match (including `https://` vs `http://`)
- Port numbers match (if using custom ports)

### Issue 2: "App is in testing mode"

**Solution**: Either:

- Add your email as a test user in OAuth consent screen, OR
- Publish your app (if ready for production)

### Issue 3: "Missing scopes"

**Solution**: Add required scopes in OAuth consent screen → Scopes tab

### Issue 4: "Invalid client ID"

**Solution**: Verify `GOOGLE_CLIENT_ID` in Vercel environment variables matches your Google Cloud Console client ID

## Verification

After making changes:

1. **Wait 5-10 minutes** for Google's changes to propagate
2. **Clear your browser cache** or try incognito mode
3. **Try connecting with Google again**

## Need Help?

If issues persist:

1. Check the browser console for exact error messages
2. Verify all redirect URIs match exactly
3. Ensure Vercel environment variables are set correctly
4. Wait a few more minutes for Google's cache to clear
