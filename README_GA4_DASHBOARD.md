# AI Shopping Visibility Dashboard

A fully working, local, runnable multi-tenant web application for tracking AI shopping traffic and revenue from Google Analytics 4.

## Features

- **Multi-tenant architecture**: Each client has isolated data access
- **JWT Authentication**: Secure login and registration
- **GA4 Integration**: Real-time data from Google Analytics 4
- **AI Traffic Detection**: Automatically filters traffic from AI assistants (ChatGPT, Claude, Gemini, Perplexity)
- **Live Dashboard**: Real-time metrics and visualizations

## Tech Stack

### Backend

- Python 3.9+
- FastAPI
- SQLAlchemy (PostgreSQL)
- JWT authentication
- Google Analytics Data API (GA4)

### Frontend

- Next.js 16 (App Router)
- React 19
- Recharts
- TailwindCSS
- Zustand (state management)

## Quick Start

### 1. Install Dependencies

**Backend:**

```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_visibility

# JWT Secret (change this in production!)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Set Up Database

The backend uses SQLAlchemy which will automatically create tables on startup. Alternatively, you can use Prisma:

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

**Terminal 2 - Frontend:**

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Getting GA4 Credentials

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Analytics Data API**

### Step 2: Create a Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Give it a name (e.g., "GA4 Dashboard Service")
4. Click **Create and Continue**
5. Skip role assignment for now
6. Click **Done**

### Step 3: Create and Download JSON Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON**
5. Download the JSON file

### Step 4: Grant Access in Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Go to **Admin** → **Property Access Management**
4. Click **+** → **Add users**
5. Add the service account email (found in the JSON file: `client_email`)
6. Grant **Viewer** role
7. Click **Add**

### Step 5: Get Your Property ID

1. In Google Analytics, go to **Admin**
2. Under **Property**, click **Property Settings**
3. Copy the **Property ID** (numeric, e.g., `123456789`)

## Registering a Client

1. Go to `http://localhost:3000/register`
2. Fill in:
   - Email
   - Password
   - Company Name
   - GA4 Property ID (from Step 5 above)
   - GA4 Service Account JSON (paste the entire contents of the JSON file from Step 3)
3. Click **Register**

You'll be automatically logged in and redirected to the dashboard.

## Dashboard Metrics

The dashboard shows 8 key metrics:

1. **AI Sessions**: Total sessions from AI assistant traffic
2. **AI Revenue**: Total revenue from AI traffic
3. **AI Conversion Rate**: Conversion rate for AI traffic
4. **AI Average Order Value**: Average order value from AI traffic
5. **AI Revenue per Session**: Revenue generated per AI session
6. **Site Avg Conversion Rate**: Overall site conversion rate
7. **AI vs Site Conversion Rate**: Difference between AI and site average
8. **AI Revenue Trend**: Time series chart of daily AI revenue
9. **Top Landing Pages**: Top landing pages for AI traffic

## AI Traffic Detection

The system automatically identifies AI traffic using this regex pattern:

```
chat\.openai|perplexity|gemini|claude
```

This matches traffic sources containing:

- `chat.openai` (ChatGPT)
- `perplexity` (Perplexity AI)
- `gemini` (Google Gemini)
- `claude` (Anthropic Claude)

## Multi-Tenancy

Each client:

- Has a unique `client_id` in the JWT token
- Can only access their own GA4 data
- Has isolated credentials stored securely in the database
- Cannot see other clients' data

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new client
- `POST /api/auth/login` - Login and get JWT token

### Dashboard

- `GET /api/dashboard/metrics?days=30` - Get dashboard metrics (requires authentication)

## Development

### Backend Structure

```
backend/
  main.py                 # FastAPI app entry point
  app/
    __init__.py
    database.py           # SQLAlchemy setup
    models.py             # Database models
    schemas.py            # Pydantic schemas
    auth.py              # JWT authentication
    ga4_service.py       # GA4 API integration
    routers/
      auth.py            # Auth endpoints
      dashboard.py       # Dashboard endpoints
```

### Frontend Structure

```
src/
  app/
    page.tsx             # Root (redirects to login/dashboard)
    login/               # Login page
    register/           # Registration page
    dashboard/          # Dashboard page
  lib/
    api.ts              # API client
  store/
    useAuthStore.ts     # Auth state management
```

## Troubleshooting

### "Could not validate credentials"

- Check that your JWT token is valid
- Try logging out and logging back in
- Check that `JWT_SECRET_KEY` is set in `.env`

### "Error fetching dashboard data"

- Verify your GA4 Property ID is correct
- Check that the service account has access to the GA4 property
- Ensure the Google Analytics Data API is enabled
- Check that your service account JSON is valid

### No AI traffic showing

- Verify that you have traffic from AI sources in GA4
- Check that the source names match the regex pattern
- Ensure you have data for the selected date range

## Production Deployment

Before deploying to production:

1. **Change JWT Secret**: Use a strong, random secret key
2. **Use Environment Variables**: Never commit secrets to git
3. **Enable HTTPS**: Use SSL/TLS certificates
4. **Database Security**: Use connection pooling and secure credentials
5. **Rate Limiting**: Add rate limiting to API endpoints
6. **Error Handling**: Implement proper error logging and monitoring

## License

MIT
