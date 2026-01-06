# Deploy to Vercel - Step by Step Guide

This guide will help you deploy your AI Shopping Visibility Dashboard to https://visibility-report.vercel.app/

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Repository**: Your code should be pushed to GitHub (Kadri-Git/ai-agency)
3. **Backend Hosting**: The FastAPI backend needs separate hosting (see options below)

## Step 1: Deploy Backend First

The FastAPI backend needs to be deployed separately. Choose one:

### Option A: Railway (Recommended - Easy & Free)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add these environment variables:
   ```
   DATABASE_URL=sqlite:///./ai_visibility.db
   JWT_SECRET_KEY=your-secret-key-here
   ```
6. Set root directory to `backend`
7. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
8. Deploy!

### Option B: Render

1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Settings:
   - Build Command: `cd backend && pip install -r ../requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment: Python 3
5. Add environment variables (same as Railway)
6. Deploy!

### Option C: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# In backend directory
cd backend
fly launch
# Follow prompts, then:
fly deploy
```

## Step 2: Update Frontend API URL

Once your backend is deployed, update the API URL:

1. Get your backend URL (e.g., `https://your-app.railway.app` or `https://your-app.onrender.com`)
2. Update `src/lib/api.ts`:
   ```typescript
   const API_BASE_URL =
     process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-url.com'
   ```

## Step 3: Deploy Frontend to Vercel

### Method 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? visibility-report
# - Directory? ./
# - Override settings? No
```

### Method 2: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository: `Kadri-Git/ai-agency`
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Environment Variables**:

   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

5. Click "Deploy"

## Step 4: Update CORS in Backend

Update `backend/main.py` to allow your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://visibility-report.vercel.app",
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Step 5: Database Setup

For production, use a proper database:

1. **Supabase** (Free tier): https://supabase.com
   - Create project
   - Get connection string
   - Update `DATABASE_URL` in backend environment variables

2. **Neon** (Free tier): https://neon.tech
   - Similar setup

## Quick Deploy Commands

```bash
# 1. Push to GitHub (if not done)
git push origin main

# 2. Deploy backend to Railway
# (Use Railway dashboard)

# 3. Deploy frontend to Vercel
vercel --prod

# Or use Vercel dashboard
```

## Troubleshooting

### Frontend can't connect to backend

- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify backend CORS settings
- Check backend is running and accessible

### Build fails

- Check Node.js version (Vercel uses Node 18+)
- Ensure all dependencies are in package.json
- Check build logs in Vercel dashboard

### Database errors

- Use production database (Supabase/Neon)
- Don't use SQLite in production
- Update `DATABASE_URL` environment variable

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend API URL updated
- [ ] CORS configured in backend
- [ ] Environment variables set in Vercel
- [ ] Production database configured
- [ ] JWT_SECRET_KEY is strong and secure
- [ ] Domain configured (if using custom domain)

## Your Deployment URLs

- **Frontend**: https://visibility-report.vercel.app/
- **Backend**: (Your Railway/Render/Fly.io URL)
- **GitHub**: https://github.com/Kadri-Git/ai-agency
