# 🗄️ Database Setup - Quick Guide

Your database URL is currently a placeholder. Let's set up a free cloud database!

## Option 1: Supabase (Recommended - Easiest) ⭐

**Time**: ~5 minutes | **Cost**: FREE

1. **Go to**: https://supabase.com
2. **Click** "Start your project"
3. **Sign up** with GitHub (easiest) or email
4. **Create a new project**:
   - Name: "AI Visibility Platform" (or any name)
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to you
   - Click "Create new project"
5. **Wait 2 minutes** for setup
6. **Go to Settings** → **Database**
7. **Find "Connection string"** section
8. **Copy the URI** (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
9. **Replace `[YOUR-PASSWORD]`** with the password you created
10. **Update `.env` file** with the connection string

**Example**:
```env
DATABASE_URL="postgresql://postgres:yourpassword123@db.abcdefgh.supabase.co:5432/postgres"
```

---

## Option 2: Neon (Serverless - Also Free)

**Time**: ~3 minutes | **Cost**: FREE

1. **Go to**: https://neon.tech
2. **Sign up** with GitHub
3. **Create a project**
4. **Copy the connection string**
5. **Update `.env` file**

---

## After Setting Up Database

Once you have your database connection string, I'll:
1. Update the `.env` file
2. Run database migrations
3. Verify everything works
4. Start the application

---

## Quick Command

Once you have your connection string, you can update it by running:

```bash
# Edit .env and replace DATABASE_URL with your connection string
```

Or just paste the connection string here and I'll add it for you!

