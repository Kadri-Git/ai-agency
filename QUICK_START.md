# ⚡ Quick Start - Get Your API Keys in 10 Minutes

## 🎯 The Fastest Way

### 1. Get Your Keys (Open these links in new tabs)

**Anthropic (Claude) - FREE** ⭐ Start here!
- Link: https://console.anthropic.com/
- Time: 2 minutes
- Cost: FREE (free credits included)

**Google AI (Gemini) - FREE** ⭐ Also free!
- Link: https://makersuite.google.com/app/apikey  
- Time: 2 minutes
- Cost: FREE (generous free tier)

**OpenAI (ChatGPT) - PAID**
- Link: https://platform.openai.com/api-keys
- Time: 3 minutes
- Cost: Requires payment (~$5-10 minimum)

---

### 2. Add Your Keys

Once you have your keys, run this command (replace with your actual keys):

```bash
node scripts/setup-env.js "sk-your-openai-key" "sk-ant-your-anthropic-key" "your-google-key"
```

**Or** manually edit `.env` and add:
```env
OPENAI_API_KEY="sk-your-key"
ANTHROPIC_API_KEY="sk-ant-your-key"
GOOGLE_AI_API_KEY="your-google-key"
```

---

### 3. Verify

```bash
npm run check:keys
```

You should see all ✅ green!

---

### 4. Set Up Database (If Needed)

**Easiest Option: Supabase (Free)**

1. Go to: https://supabase.com
2. Sign up with GitHub
3. Create new project
4. Go to Settings → Database
5. Copy connection string
6. Update `DATABASE_URL` in `.env`

Then run:
```bash
npx prisma generate
npx prisma migrate dev
```

---

### 5. Start the App

```bash
npm run dev
```

Visit http://localhost:3000 🎉

---

## 💡 Pro Tips

- **Start with free keys**: Get Anthropic and Google AI first (both free!)
- **You can test with just one key**: The app will work with partial setup
- **Database can wait**: You can set up the database later if needed

---

## 🆘 Need Help?

- See `COMPLETE_SETUP.md` for detailed instructions
- See `SETUP.md` for troubleshooting
- Run `npm run check:keys` anytime to see what's missing

