# Enterprise AI Visibility Analysis Platform v3.0

A comprehensive SaaS application that provides enterprise-grade AI search visibility analysis with a visually stunning, easy-to-read interface and clear, actionable recommendations.

## Features

- **Share of Voice Tracking** - Calculate market conversation percentage vs competitors
- **Query Fanout Intelligence** - See actual AI sub-queries, not just user prompts
- **Brand Narrative Analysis** - Understand AI's story about your brand
- **Historical Comparison** - Track improvement over time
- **Competitive Gap Analysis** - Identify where competitors beat you
- **Actionable Recommendations** - AI-powered improvement suggestions with Top 3 prioritized actions

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **AI Integrations**: OpenAI (ChatGPT), Anthropic (Claude), Google (Gemini)
- **UI Components**: shadcn/ui, Framer Motion
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or cloud)
- API keys for:
  - OpenAI (ChatGPT)
  - Anthropic (Claude)
  - Google AI (Gemini)

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_visibility"
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
GOOGLE_AI_API_KEY="your-google-ai-key"
```

3. **Set up the database:**
```bash
npx prisma generate
npx prisma migrate dev
```

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── analyze/      # Analysis endpoints
│   │   └── recommendations/ # Recommendations endpoint
│   ├── page.tsx          # Main dashboard
│   └── layout.tsx        # Root layout
├── components/
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── MetricCard.tsx
│   │   ├── ChartContainer.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── RecommendationsSection.tsx
│   │   └── SovChart.tsx
│   └── layout/
│       └── DashboardHeader.tsx
└── lib/
    ├── prisma.ts         # Prisma client
    └── ai-integrations.ts # AI platform integrations
```

## Database Schema

The platform uses Prisma with PostgreSQL. Key models:

- **Company** - Company profiles and settings
- **Analysis** - Analysis runs with metrics
- **Result** - Individual query results per platform
- **BrandNarrative** - Brand narrative analysis
- **TopicOpportunity** - Content opportunities
- **ShareOfVoiceHistory** - Historical SOV tracking
- **QueryFanout** - Query fanout analysis

See `prisma/schema.prisma` for full schema.

## API Endpoints

### POST `/api/analyze`
Start a new analysis for a company.

**Body:**
```json
{
  "company": "Acme Corp",
  "domain": "acme.com",
  "industry": "SaaS",
  "config": {}
}
```

**Response:**
```json
{
  "id": "analysis-id",
  "companyId": "company-id",
  "status": "completed",
  "shareOfVoice": 15.2,
  "visibilityScore": 72
}
```

### GET `/api/analyze?id=analysis-id`
Get analysis results.

### GET `/api/recommendations?analysisId=analysis-id`
Get Top 3 recommendations for an analysis.

## Design System

- **Typography**: Inter Variable for body, Display font for hero numbers
- **Colors**: Professional blue (#3b82f6) primary, semantic colors for status
- **Spacing**: 8px scale (4, 8, 12, 16, 24, 32, 48, 64, 96)
- **Animations**: 0.6s cubic-bezier transitions
- **Layout**: Max-width 1400px, responsive grid, mobile-first

## Key Metrics

The dashboard displays:

1. **Share of Voice (0-100%)** - Overall + by platform + trend
2. **AI Visibility Score (0-100)** - Normalized visibility score
3. **Monthly Audience** - Total exposure + growth rate
4. **Favorable Sentiment** - Positive recommendations percentage

## Top 3 Recommendations

Every analysis includes a prominent "Top 3 Recommendations" section with:

- Priority number (1, 2, 3) in gold badge
- Clear, actionable title
- Impact & effort badges (high/medium/low)
- Estimated SOV gain percentage
- Timeframe
- Evidence section (current metric, benchmark, gap)
- 3-5 specific action steps with checkboxes
- Business justification

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Database Migrations
```bash
npx prisma migrate dev
```

### Prisma Studio (Database GUI)
```bash
npx prisma studio
```

## Deployment

The platform is ready for Vercel deployment:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

For database, use:
- **Supabase** (recommended)
- **Neon** (serverless Postgres)
- **Railway** (simple Postgres)

## License

MIT


