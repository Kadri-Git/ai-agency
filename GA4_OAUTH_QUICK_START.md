# GA4 OAuth2 Integration - Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Google Cloud Console (2 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Library** → Enable:
   - Google Analytics Data API
   - Google Analytics Admin API
3. **APIs & Services** → **OAuth consent screen**:
   - Choose External
   - Add scopes: `https://www.googleapis.com/auth/analytics.readonly`, `openid`, `email`, `profile`
4. **APIs & Services** → **Credentials** → **Create OAuth client ID**:
   - Type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (local)
     - `https://visibility-report.vercel.app/api/auth/callback/google` (production)
   - Copy **Client ID** and **Client Secret**

### 2. Environment Variables (1 min)

**Local (.env.local)**:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

**Vercel** (add in Settings → Environment Variables):

- Same variables as above
- `NEXTAUTH_URL=https://visibility-report.vercel.app` (production)

### 3. Database Migration (1 min)

Run on your PostgreSQL database:

```sql
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS ga4_access_token TEXT,
ADD COLUMN IF NOT EXISTS ga4_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS ga4_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ga4_connected_at TIMESTAMP WITH TIME ZONE;
```

### 4. Test (1 min)

1. Visit `/connect-analytics`
2. Click "Connect with Google"
3. Select a GA4 property
4. Done! ✅

---

## 📝 Full Documentation

See [GA4_OAUTH_SETUP.md](./GA4_OAUTH_SETUP.md) for detailed instructions.

---

## 🔧 Troubleshooting

**"Redirect URI mismatch"**
→ Check redirect URI in Google Cloud Console matches exactly

**"No properties found"**
→ Ensure Google account has access to GA4 properties

**"Token refresh failed"**
→ Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

**"Database column does not exist"**
→ Run the migration SQL above

---

## ✨ Features

- ✅ One-click Google OAuth connection
- ✅ Automatic token refresh
- ✅ Property selection dropdown
- ✅ Secure token storage
- ✅ Backward compatible with service account JSON (legacy)
