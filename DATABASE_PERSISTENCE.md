# Database Persistence Guide

## ⚠️ CRITICAL: Account Data Must Be Preserved

**All user accounts (including admin accounts) MUST be preserved across deployments.**

## How Database Persistence Works

### 1. Database Connection

The application uses SQLAlchemy with PostgreSQL (production) or SQLite (local development).

**IMPORTANT**: The `DATABASE_URL` environment variable in Railway must point to a **persistent database**.

### 2. Table Creation (Safe)

The `Base.metadata.create_all()` function in `backend/main.py` is **SAFE**:

- ✅ Only creates tables if they don't exist
- ✅ Never drops or deletes existing tables
- ✅ Never deletes data
- ✅ Preserves all accounts across deployments

### 3. Railway Database Configuration

**CRITICAL**: Ensure your Railway service has a **persistent PostgreSQL database**:

1. **Add PostgreSQL Service in Railway**:
   - Go to Railway Dashboard
   - Add a PostgreSQL service to your project
   - Railway will automatically set `DATABASE_URL` environment variable

2. **Verify DATABASE_URL is Set**:
   - Go to Railway → Your Service → Variables
   - Ensure `DATABASE_URL` is set and points to the PostgreSQL service
   - The URL should look like: `postgresql://postgres:password@host:port/railway`

3. **Never Use Ephemeral Databases**:
   - ❌ Don't use temporary databases
   - ❌ Don't recreate the database on each deployment
   - ✅ Use Railway's PostgreSQL service (persistent)

### 4. Account Deletion

**Only admins can delete user accounts**:

- Endpoint: `DELETE /api/admin/clients/{client_id}`
- Requires: Admin authentication
- Restrictions:
  - ❌ Cannot delete admin accounts
  - ❌ Cannot delete your own admin account
  - ✅ Can only delete regular client accounts

### 5. What Happens on Deployment

When you deploy a new version:

1. ✅ Application starts
2. ✅ `Base.metadata.create_all()` runs
3. ✅ Missing tables are created (if any)
4. ✅ **Existing tables and data are preserved**
5. ✅ All accounts remain intact

### 6. Troubleshooting: Accounts Disappear After Deployment

If accounts disappear after deployment, check:

1. **DATABASE_URL Changed**:
   - Railway might have created a new database
   - Solution: Use the same PostgreSQL service for all deployments

2. **Database Service Recreated**:
   - If you delete and recreate the PostgreSQL service, data is lost
   - Solution: Never delete the PostgreSQL service

3. **Wrong Database URL**:
   - Check Railway Variables → `DATABASE_URL`
   - Ensure it points to the correct PostgreSQL service

4. **Database Service Not Attached**:
   - Ensure PostgreSQL service is attached to your backend service
   - Railway should automatically set `DATABASE_URL`

### 7. Best Practices

✅ **DO**:

- Use Railway's PostgreSQL service (persistent)
- Keep the same database across all deployments
- Verify `DATABASE_URL` is set correctly
- Test account persistence after deployment

❌ **DON'T**:

- Delete and recreate the PostgreSQL service
- Use temporary/ephemeral databases
- Change `DATABASE_URL` between deployments
- Manually drop tables or databases

### 8. Verifying Persistence

After deployment, verify accounts are preserved:

1. Login with existing admin account
2. Check admin dashboard for all clients
3. Verify all accounts are still present

If accounts are missing, check Railway logs and `DATABASE_URL` configuration.

## Summary

- ✅ `Base.metadata.create_all()` is safe - never deletes data
- ✅ Accounts are preserved if `DATABASE_URL` points to the same database
- ✅ Only admins can delete user accounts (via API endpoint)
- ⚠️ Ensure Railway PostgreSQL service is persistent and not recreated
