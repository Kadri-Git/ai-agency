# OAuth Troubleshooting Guide

## Current Issue

The redirect URI looks correct now (no backtick):

```
https://visibility-report.vercel.app/api/auth/callback/google
```

But Google OAuth is still failing. Here's how to fix it:

## Step 1: Verify Redirect URI in Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Navigate to: **APIs & Services** → **Credentials**
4. Click on your **OAuth 2.0 Client ID**
5. **Check the "Authorized redirect URIs" section**

**Make sure this EXACT URI is listed:**

```
https://visibility-report.vercel.app/api/auth/callback/google
```

**Important checks:**

- ✅ No trailing backtick (`)
- ✅ No trailing slash (/)
- ✅ Exact match (case-sensitive)
- ✅ Must start with `https://` (not `http://`)

## Step 2: Add Yourself as Test User

If your app is in "Testing" mode:

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Scroll to **"Test users"** section
3. Click **"+ ADD USERS"**
4. Add: `kaasikkadri@gmail.com`
5. Click **"ADD"**
6. **Save** the changes

## Step 3: Verify JavaScript Origins

In the same OAuth Client settings, check **"Authorized JavaScript origins"**:

Should include:

```
https://visibility-report.vercel.app
http://localhost:3000
```

## Step 4: Check OAuth Consent Screen Status

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Check the **"Publishing status"** at the top

**If it says "Testing":**

- Either add yourself as a test user (Step 2), OR
- Click **"PUBLISH APP"** to make it public (if ready)

## Step 5: Verify Scopes

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Click **"Scopes"** tab
3. Verify these scopes are present:
   - ✅ `https://www.googleapis.com/auth/analytics.readonly`
   - ✅ `openid`
   - ✅ `email`
   - ✅ `profile`

If any are missing:

1. Click **"Add or Remove Scopes"**
2. Add the missing scopes
3. Click **"Update"** → **"Save and Continue"**

## Step 6: Wait and Clear Cache

After making changes:

1. **Wait 5-10 minutes** for Google's changes to propagate
2. **Clear your browser cache** or use incognito mode
3. Try connecting again

## Common Error Messages

### "redirect_uri_mismatch"

**Cause**: The redirect URI in the request doesn't match what's registered in Google Cloud Console.

**Fix**:

- Double-check the redirect URI is EXACTLY: `https://visibility-report.vercel.app/api/auth/callback/google`
- No trailing characters, no typos

### "access_denied"

**Cause**: User denied permission or app is in testing mode without test user.

**Fix**:

- Add yourself as a test user (Step 2)
- Or publish your app

### "invalid_client"

**Cause**: Client ID or Client Secret is incorrect.

**Fix**:

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel environment variables
- Make sure they match what's in Google Cloud Console

## Debug: Check What Error Google Returns

After trying to connect, check:

1. Browser console (F12 → Console tab)
2. Network tab → Look for `/api/auth/callback/google?error=...` requests
3. The error parameter in the URL will tell you what Google rejected

## Still Not Working?

1. **Take a screenshot** of:
   - Google Cloud Console → Credentials → Your OAuth Client (showing redirect URIs)
   - The exact error message from Google
   - Browser console errors

2. **Check Vercel environment variables**:
   - Go to Vercel → Project → Settings → Environment Variables
   - Verify all values are correct (no extra characters)
