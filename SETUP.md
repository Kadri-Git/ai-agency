# API Keys Setup Guide

This guide will help you set up the required API keys for the AI Visibility Analysis Platform.

## Required API Keys

The platform requires API keys from three AI providers:

1. **OpenAI** (for ChatGPT)
2. **Anthropic** (for Claude)
3. **Google AI** (for Gemini)

## Step-by-Step Setup

### 1. Create `.env` file

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Get OpenAI API Key (ChatGPT)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

**Note:** OpenAI requires a paid account for API access. Free tier has limited credits.

### 3. Get Anthropic API Key (Claude)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to "API Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)
6. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

**Note:** Anthropic offers free credits for new accounts.

### 4. Get Google AI API Key (Gemini)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Select or create a Google Cloud project
5. Copy the API key
6. Add to `.env`:
   ```
   GOOGLE_AI_API_KEY=your-key-here
   ```

**Note:** Google AI offers free tier with generous limits.

### 5. Set Up Database

You need a PostgreSQL database. Options:

#### Option A: Supabase (Recommended - Free tier available)
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the "Connection string" (URI format)
5. Add to `.env`:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

#### Option B: Neon (Serverless PostgreSQL - Free tier)
1. Go to [Neon](https://neon.tech)
2. Sign up and create a project
3. Copy the connection string
4. Add to `.env`:
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
   ```

#### Option C: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb ai_visibility
   ```
3. Add to `.env`:
   ```
   DATABASE_URL=postgresql://localhost:5432/ai_visibility
   ```

### 6. Run Database Migrations

After setting up the database:

```bash
npx prisma migrate dev
```

This will create all the necessary tables.

### 7. Verify Setup

Start the development server:

```bash
npm run dev
```

The application should start without errors. If you see API key errors, double-check your `.env` file.

## Cost Estimates

Approximate costs per analysis (200 prompts across 3 platforms):

- **OpenAI GPT-4**: ~$2-5 per analysis
- **Anthropic Claude**: ~$1-3 per analysis  
- **Google Gemini**: Free tier usually covers this

**Total per analysis**: ~$3-8 depending on usage

## Troubleshooting

### "API key not found" errors
- Ensure `.env` file exists in the root directory
- Check that keys don't have quotes around them
- Restart the dev server after adding keys

### Database connection errors
- Verify DATABASE_URL is correct
- Check if database is accessible
- Ensure Prisma migrations have run

### Rate limit errors
- Each platform has rate limits
- Free tiers have lower limits
- Consider upgrading to paid tiers for production

## Security Notes

⚠️ **Never commit `.env` file to git!**

The `.env` file is already in `.gitignore`. Always keep your API keys secret.

## Testing Without API Keys

You can test the UI without API keys, but the analysis will fail. The form will still work and show error messages, allowing you to test the user experience.


