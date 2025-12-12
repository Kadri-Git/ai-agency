# Quick API Keys Setup Guide

Follow these steps to get your API keys and configure the application.

## Step 1: Update Your .env File

Open the `.env` file in the root directory and add these variables:

```env
# Database Connection
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

# OpenAI API Key (for ChatGPT)
OPENAI_API_KEY="your-openai-key-here"

# Anthropic API Key (for Claude)
ANTHROPIC_API_KEY="your-anthropic-key-here"

# Google AI API Key (for Gemini)
GOOGLE_AI_API_KEY="your-google-ai-key-here"
```

## Step 2: Get OpenAI API Key

1. **Visit**: https://platform.openai.com/api-keys
2. **Sign up or log in** to your OpenAI account
3. **Click** "Create new secret key"
4. **Name it** (e.g., "AI Visibility Platform")
5. **Copy the key** (starts with `sk-`)
6. **Paste it** into `.env` as `OPENAI_API_KEY`

⚠️ **Note**: OpenAI requires a paid account. Free tier has limited credits.

## Step 3: Get Anthropic API Key

1. **Visit**: https://console.anthropic.com/
2. **Sign up or log in** to your Anthropic account
3. **Navigate to** "API Keys" section
4. **Click** "Create Key"
5. **Copy the key** (starts with `sk-ant-`)
6. **Paste it** into `.env` as `ANTHROPIC_API_KEY`

✅ **Note**: Anthropic offers free credits for new accounts.

## Step 4: Get Google AI API Key

1. **Visit**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click** "Create API Key"
4. **Select or create** a Google Cloud project
5. **Copy the API key**
6. **Paste it** into `.env` as `GOOGLE_AI_API_KEY`

✅ **Note**: Google AI offers a generous free tier.

## Step 5: Verify Setup

Run this command to check if all keys are configured:

```bash
npm run check:keys
```

You should see all green checkmarks ✅

## Step 6: Set Up Database (if needed)

If you need a database, here are free options:

### Option A: Supabase (Recommended)
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Update `DATABASE_URL` in `.env`

### Option B: Neon
1. Go to https://neon.tech
2. Sign up and create a project
3. Copy the connection string
4. Update `DATABASE_URL` in `.env`

## Step 7: Run Database Migrations

After setting up the database:

```bash
npx prisma generate
npx prisma migrate dev
```

## Step 8: Start the Application

```bash
npm run dev
```

Visit http://localhost:3000 to see your dashboard!

---

## Troubleshooting

### "API key not found" errors
- Make sure `.env` file exists in the root directory
- Check that keys don't have quotes around them (unless the value itself needs quotes)
- Restart the dev server after adding keys

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check if database is accessible
- Ensure Prisma migrations have run

### Rate limit errors
- Each platform has rate limits
- Free tiers have lower limits
- Consider upgrading to paid tiers for production


