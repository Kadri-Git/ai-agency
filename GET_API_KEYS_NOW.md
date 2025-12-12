# 🚀 Get Your API Keys - Quick Start

Follow these steps to get all three API keys. This should take about 10-15 minutes.

## ⚡ Quick Links

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Google AI**: https://makersuite.google.com/app/apikey

---

## 1️⃣ OpenAI API Key (ChatGPT)

**Time**: ~3 minutes | **Cost**: Requires paid account (~$5 minimum)

1. **Go to**: https://platform.openai.com/api-keys
2. **Sign up or log in** (you'll need to add payment method)
3. **Click** "Create new secret key" button
4. **Name it**: "AI Visibility Platform" (or any name you like)
5. **Click** "Create secret key"
6. **⚠️ IMPORTANT**: Copy the key immediately - you won't see it again!
   - Key format: `sk-proj-...` or `sk-...`
7. **Add to `.env` file**:
   ```env
   OPENAI_API_KEY="sk-your-actual-key-here"
   ```

**Note**: You'll need to add credits to your OpenAI account. Minimum is usually $5-10.

---

## 2️⃣ Anthropic API Key (Claude)

**Time**: ~2 minutes | **Cost**: Free credits available for new accounts

1. **Go to**: https://console.anthropic.com/
2. **Sign up or log in** (free account works)
3. **Navigate to** "API Keys" in the left sidebar
4. **Click** "Create Key" button
5. **Name it**: "AI Visibility Platform"
6. **Click** "Create Key"
7. **Copy the key** (starts with `sk-ant-`)
8. **Add to `.env` file**:
   ```env
   ANTHROPIC_API_KEY="sk-ant-your-actual-key-here"
   ```

**Note**: Anthropic gives free credits to new accounts, so this one is free to start!

---

## 3️⃣ Google AI API Key (Gemini)

**Time**: ~2 minutes | **Cost**: Free tier with generous limits

1. **Go to**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click** "Create API Key" button
4. **Select or create** a Google Cloud project (you can use default)
5. **Copy the API key** (long string, no prefix)
6. **Add to `.env` file**:
   ```env
   GOOGLE_AI_API_KEY="your-actual-key-here"
   ```

**Note**: Google AI has a very generous free tier - you likely won't need to pay!

---

## ✅ After Adding All Keys

1. **Verify your setup**:
   ```bash
   npm run check:keys
   ```

2. **You should see**:
   ```
   ✅ OPENAI_API_KEY: sk-proj...xxxx
   ✅ ANTHROPIC_API_KEY: sk-ant...xxxx
   ✅ GOOGLE_AI_API_KEY: AIza...xxxx
   ✅ DATABASE_URL: postgresql...blic
   ```

3. **If all keys are configured**, you're ready to go! 🎉

---

## 🛠️ Alternative: Use the Helper Script

You can also use the interactive helper script:

```bash
node scripts/add-api-keys.js
```

This will guide you through adding each key step by step.

---

## 💡 Tips

- **Keep your keys secret**: Never commit `.env` to git (it's already in `.gitignore`)
- **Start with free tiers**: Anthropic and Google AI have free tiers, so start there
- **Test one at a time**: You can test the app with just one API key if needed
- **Cost estimates**: Each analysis costs ~$3-8 depending on usage

---

## 🆘 Need Help?

- Check `SETUP.md` for detailed instructions
- Check `API_KEYS_SETUP.md` for troubleshooting
- Run `npm run check:keys` to see what's missing


