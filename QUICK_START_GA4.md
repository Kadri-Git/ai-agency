# Quick Start Guide - AI Shopping Visibility Dashboard

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies

**Backend:**

```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**

```bash
npm install
```

### Step 2: Set Up Environment

Create `.env` file in the root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_visibility
JWT_SECRET_KEY=your-secret-key-min-32-chars
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3: Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

### Step 4: Register Your First Client

1. Go to `http://localhost:3000/register`
2. Fill in:
   - Email & Password
   - Company Name
   - GA4 Property ID (from Google Analytics)
   - GA4 Service Account JSON (see README_GA4_DASHBOARD.md for instructions)

3. You'll be automatically logged in and redirected to the dashboard!

## ✅ That's It!

The dashboard will show:

- AI Sessions
- AI Revenue
- AI Conversion Rate
- AI Average Order Value
- AI Revenue per Session
- Site Average Conversion Rate
- AI vs Site Conversion Rate Comparison
- Revenue Trend Chart
- Top Landing Pages

## 📚 Full Documentation

See `README_GA4_DASHBOARD.md` for:

- Detailed GA4 setup instructions
- Troubleshooting
- Production deployment guide
