# Quick Admin Creation - No CORS Issues

Since the HTML file has CORS issues, use one of these methods:

## Method 1: Direct Browser URL (Easiest)

1. **Get your Railway URL** from https://railway.app
2. **Open this URL in your browser** (replace with your Railway URL):

```
https://YOUR-RAILWAY-URL/api/auth/create-admin?email=admin@visibility-report.com&password=Admin123!&secret_key=change-this-secret-key
```

Example:

```
https://ai-agency-production-dc71.up.railway.app/api/auth/create-admin?email=admin@visibility-report.com&password=Admin123!&secret_key=change-this-secret-key
```

3. You should see a JSON response like:

```json
{
  "message": "Admin account created successfully",
  "email": "admin@visibility-report.com",
  "company": "Admin Account"
}
```

## Method 2: Terminal Script

Run this in your terminal:

```bash
./create-admin.sh
```

Or if that doesn't work:

```bash
bash create-admin.sh
```

## Method 3: curl Command

Replace `YOUR-RAILWAY-URL` with your actual Railway URL:

```bash
curl -X POST "https://YOUR-RAILWAY-URL/api/auth/create-admin?email=admin@visibility-report.com&password=Admin123!&secret_key=change-this-secret-key"
```

## Method 4: Node.js Script

```bash
node create-admin-production.js
```

## After Creating Admin

1. Go to: **https://visibility-report.vercel.app/login**
2. Login with:
   - Email: `admin@visibility-report.com`
   - Password: `Admin123!`
3. You'll be redirected to `/admin` dashboard

## Troubleshooting

### "Invalid secret key"

- Check that `ADMIN_SECRET_KEY` in Railway matches the secret key you're using
- Or use the default: `change-this-secret-key`

### "Cannot connect"

- Verify your Railway URL is correct
- Check Railway deployment is running
- Test: Visit `https://YOUR-RAILWAY-URL/health` in browser

### "Email already exists"

- The admin account was already created
- Try logging in directly
