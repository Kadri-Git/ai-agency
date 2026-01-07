# Repository Information

## GitHub Repository

**Repository URL:** https://github.com/Kadri-Git/ai-agency

**Current Status:** Private (needs to be made public)

## How to Make Repository Public

1. Go to: https://github.com/Kadri-Git/ai-agency
2. Click on **Settings** (top menu)
3. Scroll down to **"Danger Zone"** section
4. Click **"Change visibility"**
5. Select **"Make public"**
6. Type the repository name to confirm: `Kadri-Git/ai-agency`
7. Click **"I understand, change repository visibility"**

## Repository Contents

This repository contains:

- **Frontend**: Next.js 16 with App Router, React, TypeScript, TailwindCSS
- **Backend**: FastAPI with Python, JWT authentication, GA4 integration
- **Features**:
  - Multi-tenant AI Shopping Visibility Dashboard
  - Google Analytics 4 integration
  - Admin dashboard for viewing all client dashboards
  - Mock data support for testing
  - JWT-based authentication
  - Responsive design with dark mode support

## Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Railway

## Environment Variables Needed

### Frontend (Vercel)

- `NEXT_PUBLIC_API_URL` - Railway backend URL

### Backend (Railway)

- `DATABASE_URL` - PostgreSQL or SQLite connection string
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- `ADMIN_SECRET_KEY` - (Optional) Secret key for admin creation endpoint

## License

Add your license here if needed.
