# Login Debugging Guide

## New Diagnostic Tools

### 1. Detailed Error Messages

The login endpoint now provides more specific error messages:

- **"Account not found"** - No account exists with this email
- **"Incorrect password"** - Account exists but password doesn't match
- **"Account inactive"** - Account exists but is deactivated

### 2. Diagnostic Endpoint

Check account status without password:

```
POST /api/auth/diagnose-login?email=admin@visibility-report.com
```

This will return:

- Whether account exists
- Account status (active/inactive)
- Password hash information
- Account type (admin/demo)

### 3. Enhanced Logging

The backend now logs detailed information when password verification fails (if DEBUG=true is set in Railway).

## How to Debug Login Issues

### Step 1: Check if Account Exists

```bash
curl "https://ai-agency-production-12a5.up.railway.app/api/auth/diagnose-login?email=admin@visibility-report.com"
```

### Step 2: Check Password Hash

The diagnostic endpoint shows:

- Password hash scheme (bcrypt vs pbkdf2_sha256)
- Hash length
- Whether hash exists

### Step 3: Reset Password

If password hash is wrong, reset it:

```bash
curl -X POST "https://ai-agency-production-12a5.up.railway.app/api/auth/create-admin?email=admin@visibility-report.com&password=Admin123!&secret_key=change-this-secret-key"
```

### Step 4: Test Login

```bash
curl -X POST "https://ai-agency-production-12a5.up.railway.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visibility-report.com","password":"Admin123!"}'
```

## Common Issues

### Issue 1: Password Hash Mismatch

- **Symptom**: Account exists but password doesn't work
- **Solution**: Reset password using create-admin endpoint

### Issue 2: Different Databases

- **Symptom**: Works locally but not in production
- **Cause**: Local SQLite vs Production PostgreSQL
- **Solution**: Create account in production database

### Issue 3: Password Hash Scheme Mismatch

- **Symptom**: Password verification fails even with correct password
- **Cause**: Hash created with one scheme, verified with another
- **Solution**: Reset password to create new hash with current scheme

## Railway Logs

Check Railway logs for detailed error messages:

1. Go to Railway Dashboard
2. Click your backend service
3. Click "Deployments" → Latest deployment
4. Click "View Logs"
5. Look for `[ERROR]` or `[DEBUG]` messages

## Enable Debug Mode

In Railway, set environment variable:

- `DEBUG=true`

This will show detailed password verification logs.
