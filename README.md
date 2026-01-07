# AI Shopping Visibility Dashboard

A multi-tenant SaaS application that provides e-commerce clients with real-time analytics on AI assistant traffic and revenue. Track how AI assistants (ChatGPT, Perplexity, Gemini, Claude) drive traffic and conversions to your online store.

## Features

- **Multi-Tenant Architecture** - Each client has isolated data and GA4 credentials
- **Real-Time GA4 Integration** - Connect Google Analytics 4 to see live data
- **AI Traffic Analytics** - Track sessions, revenue, and conversions from AI assistants
- **Admin Dashboard** - View and manage all client dashboards
- **Mock Data Support** - Test the platform without GA4 credentials
- **Responsive Design** - Beautiful UI with dark mode support
- **AI Visibility Recommendations** - Data-driven suggestions to improve AI discoverability

## Tech Stack

### Frontend

- **Next.js 16** (App Router)
- **React** with TypeScript
- **TailwindCSS 4** for styling
- **Recharts** for data visualization
- **shadcn/ui** components
- **Zustand** for state management
- **React Hook Form** + **Zod** for forms

### Backend

- **FastAPI** (Python)
- **SQLAlchemy** ORM
- **JWT Authentication**
- **Google Analytics Data API (GA4)**
- **SQLite** (local) / **PostgreSQL** (production)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Google Analytics 4 account (optional - mock data available)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Kadri-Git/ai-agency.git
cd ai-agency
```

2. **Install frontend dependencies:**

```bash
npm install
```

3. **Install backend dependencies:**

```bash
cd backend
pip install -r requirements.txt
```

4. **Set up environment variables:**

Create `backend/.env`:

```env
DATABASE_URL=sqlite:///./ai_visibility.db
JWT_SECRET_KEY=your-secret-key-here-change-in-production
ADMIN_SECRET_KEY=change-this-secret-key
```

Create `.env.local` in root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

5. **Run the backend:**

```bash
cd backend
uvicorn main:app --reload
```

6. **Run the frontend:**

```bash
npm run dev
```

7. **Open your browser:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Usage

### For Clients

1. **Register** a new account at `/register`
2. **Login** at `/login`
3. **Connect GA4** on the dashboard (or use sample data)
4. **View your AI Shopping Visibility metrics:**
   - AI Sessions
   - AI Revenue
   - AI Conversion Rate
   - AI Average Order Value
   - Revenue Trends
   - Top Landing Pages
   - AI Visibility Recommendations

### For Admins

1. **Create admin account:**

```bash
cd backend
python3 create_admin.py --email admin@example.com --password YourPassword123!
```

2. **Login** with admin credentials
3. **View all clients** in the admin dashboard
4. **Select any client** to view their dashboard
5. **Provide consultation** based on their metrics

## Dashboard Metrics

The dashboard displays:

1. **AI Sessions** - Total sessions from AI assistant traffic
2. **AI Revenue** - Revenue generated from AI traffic
3. **AI Conversion Rate** - Conversion rate for AI traffic
4. **AI Average Order Value** - AOV from AI traffic
5. **AI Revenue per Session** - Revenue efficiency metric
6. **AI vs Site Avg Conversion Rate** - Performance comparison
7. **AI Revenue Trend** - Time series chart
8. **Top Landing Pages** - Pages receiving AI traffic

## AI Traffic Definition

AI traffic is identified by session source matching:

```
chat.openai|perplexity|gemini|claude
```

## Project Structure

```
.
├── src/                    # Frontend (Next.js)
│   ├── app/               # Pages and routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── dashboard/     # Client dashboard
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── components/        # React components
│   │   ├── dashboard/     # Dashboard components
│   │   └── ui/            # shadcn/ui components
│   ├── lib/               # Utilities
│   │   └── api.ts         # API client
│   └── store/             # Zustand stores
│       └── useAuthStore.ts
├── backend/               # Backend (FastAPI)
│   ├── app/
│   │   ├── routers/       # API routes
│   │   │   ├── auth.py    # Authentication
│   │   │   ├── dashboard.py # Dashboard metrics
│   │   │   ├── admin.py   # Admin endpoints
│   │   │   └── settings.py # GA4 settings
│   │   ├── models.py      # Database models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── auth.py        # JWT & password hashing
│   │   ├── ga4_service.py # GA4 integration
│   │   └── mock_data.py   # Mock data generator
│   ├── main.py            # FastAPI app
│   └── requirements.txt   # Python dependencies
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new client
- `POST /api/auth/login` - Login
- `POST /api/auth/create-admin` - Create admin account (requires secret key)

### Dashboard

- `GET /api/dashboard/metrics?days=30` - Get dashboard metrics
- `GET /api/settings/ga4-status` - Check GA4 connection status
- `PUT /api/settings/ga4-credentials` - Update GA4 credentials

### Admin

- `GET /api/admin/clients` - List all clients
- `GET /api/admin/clients/{client_id}/dashboard?days=30` - Get client dashboard

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = Your Railway backend URL
4. Deploy

### Backend (Railway)

1. Connect GitHub repository
2. Set Root Directory to `backend`
3. Set environment variables:
   - `DATABASE_URL` = PostgreSQL connection string
   - `JWT_SECRET_KEY` = Secure random string
   - `ADMIN_SECRET_KEY` = Secret for admin creation
4. Deploy

### Create Admin in Production

After deployment, create admin account:

```bash
# Option 1: Via API endpoint
curl -X POST "https://your-railway-url/api/auth/create-admin?email=admin@example.com&password=YourPassword&secret_key=your-admin-secret-key"

# Option 2: Via Railway console
cd backend
python3 create_admin_production.py
```

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
```

### Backend (.env)

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET_KEY=your-secret-key-here
ADMIN_SECRET_KEY=your-admin-secret-key
```

## Security

- JWT tokens expire after 30 days
- Passwords are hashed using pbkdf2_sha256
- GA4 credentials are stored encrypted in database
- Admin endpoints require authentication
- CORS configured for production domains

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
