# 🚀 Complete Setup Guide - AI Visibility Platform

This guide will help you get everything set up in the right order.

## 📋 Setup Checklist

- [ ] Get OpenAI API Key
- [ ] Get Anthropic API Key  
- [ ] Get Google AI API Key
- [ ] Set up Database (if needed)
- [ ] Add all keys to .env file
- [ ] Run database migrations
- [ ] Verify setup
- [ ] Start the application

---

## Step 1: Get Your API Keys

### 🔵 OpenAI (ChatGPT) - ~3 minutes

**Link**: https://platform.openai.com/api-keys

1. Sign up or log in
2. Add payment method (minimum $5-10)
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**Cost**: Requires paid account

---

### 🟣 Anthropic (Claude) - ~2 minutes

**Link**: https://console.anthropic.com/

1. Sign up or log in (free account works!)
2. Click "API Keys" in sidebar
3. Click "Create Key"
4. Copy the key (starts with `sk-ant-`)

**Cost**: Free credits for new accounts ✅

---

### 🟢 Google AI (Gemini) - ~2 minutes

**Link**: https://makersuite.google.com/app/apikey

1. Sign in with Google
2. Click "Create API Key"
3. Select a project (or create new)
4. Copy the API key

**Cost**: Generous free tier ✅

---

## Step 2: Add Keys to .env File

Once you have your keys, you have two options:

### Option A: Use the Setup Script (Easiest)

```bash
node scripts/setup-env.js "sk-your-openai-key" "sk-ant-your-anthropic-key" "your-google-key"
```

### Option B: Manual Edit

Open `.env` file and add:

```env
OPENAI_API_KEY="sk-your-key-here"
ANTHROPIC_API_KEY="sk-ant-your-key-here"
GOOGLE_AI_API_KEY="your-google-key-here"
```

---

## Step 3: Set Up Database

You need a PostgreSQL database. Here are free options:

### Option A: Supabase (Recommended - Free)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (easiest)
4. Create a new project
5. Wait 2 minutes for setup
6. Go to **Settings** → **Database**
7. Copy the **Connection string** (URI format)
8. Update `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

Replace `[YOUR-PASSWORD]` with your database password (shown when you create the project).

### Option B: Neon (Serverless - Free)

1. Go to https://neon.tech
2. Sign up
3. Create a project
4. Copy the connection string
5. Update `DATABASE_URL` in `.env`

---

## Step 4: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

This will create all the database tables.

---

## Step 5: Verify Everything

```bash
npm run check:keys
```

You should see all ✅ green checkmarks!

---

## Step 6: Start the Application

```bash
npm run dev
```

Visit http://localhost:3000 🎉

---

## 🆘 Troubleshooting

### "API key not found"
- Make sure `.env` file is in the root directory
- Check that keys don't have extra spaces
- Restart the dev server after adding keys

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check if database is accessible
- Make sure migrations have run

### Rate limit errors
- Free tiers have lower limits
- Consider upgrading for production use

---

## 💡 Quick Tips

1. **Start with free keys**: Get Anthropic and Google AI first (both free)
2. **Test incrementally**: You can test with just one API key
3. **Keep keys secret**: Never commit `.env` to git (already in `.gitignore`)
4. **Cost estimates**: Each analysis costs ~$3-8 depending on usage

---

## ✅ You're Done!

Once all steps are complete, you can:
- Run analyses on the dashboard
- Track AI visibility metrics
- Get actionable recommendations

Happy analyzing! 🚀


