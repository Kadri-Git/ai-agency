# 🗄️ Database Setup - Step by Step Guide

Let's set up a free PostgreSQL database for your AI Visibility Platform!

## Option 1: Supabase (Recommended - Easiest) ⭐

**Time**: ~5 minutes | **Cost**: FREE | **Link**: https://supabase.com

### Step-by-Step Instructions:

1. **Go to Supabase**
   - Visit: https://supabase.com
   - Click "Start your project" or "Sign in"

2. **Sign Up**
   - Click "Sign up" (top right)
   - Choose "Continue with GitHub" (easiest) or use email
   - Complete the signup process

3. **Create a New Project**
   - Click "New Project" button
   - Fill in the details:
     - **Name**: `AI Visibility Platform` (or any name you like)
     - **Database Password**: Create a strong password (⚠️ **SAVE THIS!** You'll need it)
     - **Region**: Choose the closest to you (e.g., `West US`, `East US`, `Europe`)
     - Click "Create new project"

4. **Wait for Setup**
   - Supabase will set up your project (takes ~2 minutes)
   - You'll see a progress indicator

5. **Get Your Connection String**
   - Once setup is complete, go to **Settings** (gear icon in left sidebar)
   - Click **Database** in the settings menu
   - Scroll down to **Connection string** section
   - Find **URI** tab (not Session mode)
   - You'll see something like:
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - **Copy this connection string**

6. **Replace the Password**
   - The connection string has `[YOUR-PASSWORD]` placeholder
   - Replace it with the password you created in step 3
   - Final format should be:
     ```
     postgresql://postgres.[PROJECT-REF]:your-actual-password@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```

7. **Add to Your Project**
   - Paste the connection string here and I'll add it to your `.env` file
   - Or run: `node scripts/setup-database.js "your-connection-string"`

---

## Option 2: Neon (Serverless - Also Free)

**Time**: ~3 minutes | **Cost**: FREE | **Link**: https://neon.tech

### Steps:

1. **Go to Neon**
   - Visit: https://neon.tech
   - Click "Sign up"

2. **Sign Up**
   - Use GitHub (easiest) or email

3. **Create Project**
   - Click "Create a project"
   - Name it: `AI Visibility Platform`
   - Choose region
   - Click "Create project"

4. **Get Connection String**
   - After creation, you'll see the connection string
   - It looks like: `postgresql://user:password@host.neon.tech/dbname`
   - Copy it

5. **Add to Your Project**
   - Paste it here or use the setup script

---

## After Getting Your Connection String

Once you have your database connection string, I'll:

1. ✅ Add it to your `.env` file
2. ✅ Generate Prisma client
3. ✅ Run database migrations
4. ✅ Verify everything works
5. ✅ Start the development server

---

## Quick Reference

**Supabase Connection String Format:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Neon Connection String Format:**
```
postgresql://[user]:[password]@[host].neon.tech/[database]
```

---

## Need Help?

If you get stuck at any step, just let me know what step you're on and I'll help you through it!

