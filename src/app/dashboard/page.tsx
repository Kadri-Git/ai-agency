'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { api, DashboardData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectGA4 } from '@/components/dashboard/ConnectGA4'
import { SuggestionsSection } from '@/components/dashboard/SuggestionsSection'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { toast } from 'sonner'
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Target,
  BarChart3,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

// Simple sample dashboard data used when GA4 is not connected or GA returns an auth error.
function createSampleDashboardData(days: number): DashboardData {
  const now = new Date()
  const revenue_trend = {
    data: Array.from({ length: days }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (days - 1 - i))
      return {
        date: d.toISOString().slice(0, 10),
        revenue: 500 + i * 20,
      }
    }),
  }

  const metrics = {
    ai_sessions: 250,
    ai_revenue: 7500,
    ai_conversion_rate: 4.2,
    ai_average_order_value: 180,
    ai_revenue_per_session: 30,
    site_avg_conversion_rate: 2.5,
    ai_vs_site_conversion_rate: 1.7,
  }

  const top_landing_pages = [
    {
      page_path: '/products/laptop',
      sessions: 80,
      revenue: 1800,
      conversion_rate: 6.2,
    },
    {
      page_path: '/products/phone',
      sessions: 60,
      revenue: 1400,
      conversion_rate: 4.8,
    },
    {
      page_path: '/products/headphones',
      sessions: 40,
      revenue: 900,
      conversion_rate: 3.9,
    },
  ]

  return {
    metrics,
    revenue_trend,
    top_landing_pages,
  }
}

// Dashboard data with all zeros – used when GA is not connected or GA errors
// for real (non-demo) accounts, so they can still see the UI without fake data.
function createZeroDashboardData(days: number): DashboardData {
  const now = new Date()
  const revenue_trend = {
    data: Array.from({ length: days }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (days - 1 - i))
      return {
        date: d.toISOString().slice(0, 10),
        revenue: 0,
      }
    }),
  }

  const metrics = {
    ai_sessions: 0,
    ai_revenue: 0,
    ai_conversion_rate: 0,
    ai_average_order_value: 0,
    ai_revenue_per_session: 0,
    site_avg_conversion_rate: 0,
    ai_vs_site_conversion_rate: 0,
  }

  return {
    metrics,
    revenue_trend,
    top_landing_pages: [],
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, clearAuth, isDemo } = useAuthStore()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [hasGA4Credentials, setHasGA4Credentials] = useState(false)
  const [isCheckingGA4, setIsCheckingGA4] = useState(true)

  useEffect(() => {
    // Check if we have a token in localStorage (for initial load)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (!token && !isAuthenticated) {
        // #region agent log
        fetch(
          'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'dashboard/page.tsx:49',
              message: 'No auth token found, redirecting to login',
              data: { isAuthenticated },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'demo-run',
              hypothesisId: 'DL3',
            }),
          }
        ).catch(() => {})
        // #endregion
        router.push('/login')
        return
      }
    }

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    checkGA4Status()
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, days])

  const checkGA4Status = async () => {
    try {
      const status = await api.getGA4Status()
      setHasGA4Credentials(status.has_credentials)
    } catch (error) {
      console.error('Failed to check GA4 status:', error)
    } finally {
      setIsCheckingGA4(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'dashboard/page.tsx:fetchDashboardData:entry',
            message: 'Starting dashboard data fetch',
            data: { days, isAuthenticated, isDemo },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'H4',
          }),
        }
      ).catch(() => {})
      // #endregion
      const data = await api.getDashboardMetrics(days)
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'dashboard/page.tsx:80',
            message: 'Dashboard data loaded successfully',
            data: { hasData: !!data },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'demo-run',
            hypothesisId: 'DL3',
          }),
        }
      ).catch(() => {})
      // #endregion
      setDashboardData(data)
    } catch (error) {
      // If we hit an authentication error from our backend, redirect to login.
      // If the error is coming from Google Analytics (e.g. invalid GA credentials),
      // we should NOT log the user out – just show a GA-specific error.
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'dashboard/page.tsx:83',
            message: 'Dashboard data load error',
            data: {
              errorMessage,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'demo-run',
            hypothesisId: 'DL3',
          }),
        }
      ).catch(() => {})
      // #endregion

      const isGoogleGAError =
        errorMessage.includes(
          'Request had invalid authentication credentials. Expected OAuth 2 access token'
        ) || errorMessage.includes('developers.google.com')

      const isBackendAuthError =
        !isGoogleGAError &&
        (errorMessage.includes('Could not validate credentials') ||
          errorMessage.includes('Client account is inactive') ||
          errorMessage.includes('Session expired'))

      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'dashboard/page.tsx:95',
            message: 'Dashboard error classification',
            data: {
              isGoogleGAError,
              isBackendAuthError,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'demo-run',
            hypothesisId: 'DL5',
          }),
        }
      ).catch(() => {})
      // #endregion

      if (isBackendAuthError) {
        clearAuth()
        router.push('/login')
        toast.error('Session expired. Please login again.')
        return
      }

      if (isGoogleGAError) {
        if (isDemo) {
          // For demo users, silently fall back to sample data so the experience
          // is always interactive even if GA is misconfigured.
          const sample = createSampleDashboardData(days)
          setDashboardData(sample)

          // #region agent log
          fetch(
            'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'dashboard/page.tsx:186',
                message: 'Using sample data after GA auth error (demo user)',
                data: {
                  isDemo,
                  days,
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'demo-run',
                hypothesisId: 'DL7',
              }),
            }
          ).catch(() => {})
          // #endregion
        } else {
          // For real (non-demo) users, keep the dashboard visible with zeros
          // instead of random sample data, so they can still use the app even
          // if GA is not connected or has an auth issue.
          const zeroData = createZeroDashboardData(days)
          setDashboardData(zeroData)

          toast.message(
            'Google Analytics is not available yet. Metrics are shown as 0 until GA is connected.',
            {
              description:
                'You can connect or fix GA4 from Connect Analytics or Settings at any time.',
            }
          )

          // #region agent log
          fetch(
            'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'dashboard/page.tsx:198',
                message:
                  'GA auth error for non-demo user, using zero dashboard data',
                data: {
                  isDemo,
                  days,
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'demo-run',
                hypothesisId: 'DL7',
              }),
            }
          ).catch(() => {})
          // #endregion
        }
        return
      }

      // For other errors, show error but keep trying
      console.error('Failed to load dashboard data:', error)
      // #region agent log
      const errorMsg = error instanceof Error ? error.message : String(error)
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'dashboard/page.tsx:fetchDashboardData:otherError',
            message: 'Other error (not GA or auth)',
            data: {
              errorMessage: errorMsg,
              isGoogleGAError,
              isBackendAuthError,
              isDemo,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'H5',
          }),
        }
      ).catch(() => {})
      // #endregion
      toast.error('Failed to load dashboard data. Please try again.')

      // Set empty data to prevent "No data available" screen
      // The error toast will inform the user
      setDashboardData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  // Show loading while checking auth or fetching data
  if (!isAuthenticated || isLoading || isCheckingGA4) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If no data and not loading, show error state with retry button
  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Unable to Load Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We couldn&apos;t load your dashboard data. This might be due to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Network connection issues</li>
              <li>Backend server not responding</li>
              <li>Session expired</li>
            </ul>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsLoading(true)
                  fetchDashboardData()
                }}
                className="flex-1"
              >
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearAuth()
                  router.push('/login')
                }}
                className="flex-1"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { metrics, revenue_trend, top_landing_pages, users_per_page_trend } =
    dashboardData

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              AI Shopping Visibility Dashboard
            </h1>
            {!hasGA4Credentials && (
              <p className="text-sm text-muted-foreground mt-1">
                Showing sample data - Connect GA4 to see real analytics
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <Link href="/settings">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Connect GA4 Section - Compact and collapsible */}
        <ConnectGA4 hasCredentials={hasGA4Credentials} />

        {/* Sample Data Banner - Only show when GA4 not connected */}
        {!hasGA4Credentials && (
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Sample Data:</strong> You&apos;re viewing sample data.
              Connect GA4 above for real analytics.
            </p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="AI Sessions"
            value={metrics.ai_sessions.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
            description="Total sessions from AI assistants"
          />
          <MetricCard
            title="AI Revenue"
            value={`$${metrics.ai_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<DollarSign className="h-5 w-5" />}
            description="Revenue from AI traffic"
          />
          <MetricCard
            title="AI Conversion Rate"
            value={`${metrics.ai_conversion_rate.toFixed(2)}%`}
            icon={<Target className="h-5 w-5" />}
            description="AI traffic conversion rate"
            change={metrics.ai_vs_site_conversion_rate}
            changeLabel="vs Site Avg"
          />
          <MetricCard
            title="AI AOV"
            value={`$${metrics.ai_average_order_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<ShoppingCart className="h-5 w-5" />}
            description="Average order value from AI"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MetricCard
            title="AI Revenue per Session"
            value={`$${metrics.ai_revenue_per_session.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<TrendingUp className="h-5 w-5" />}
            description="Revenue generated per AI session"
          />
          <MetricCard
            title="Site Avg Conversion Rate"
            value={`${metrics.site_avg_conversion_rate.toFixed(2)}%`}
            icon={<BarChart3 className="h-5 w-5" />}
            description="Overall site conversion rate"
          />
        </div>

        {/* Revenue Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>AI Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenue_trend.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    `$${Math.round(value).toLocaleString()}`
                  }
                />
                <Tooltip
                  formatter={(value: number) =>
                    `$${Math.round(value).toLocaleString()}`
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="AI Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users per Page Trend Chart - ALL Traffic */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Active Users (All Traffic)</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              This chart shows regular GA4 data to verify connection is working
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={users_per_page_trend.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    Math.round(value).toLocaleString()
                  }
                />
                <Tooltip
                  formatter={(value: number) =>
                    Math.round(value).toLocaleString()
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Landing Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Landing Pages (AI Traffic)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={top_landing_pages.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickFormatter={(value: number) =>
                    `$${Math.round(value).toLocaleString()}`
                  }
                />
                <YAxis
                  dataKey="page_path"
                  type="category"
                  width={200}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Revenue ($)') {
                      return `$${Math.round(value).toLocaleString()}`
                    }
                    return value.toLocaleString()
                  }}
                />
                <Legend />
                <Bar dataKey="sessions" fill="#8884d8" name="Sessions" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Visibility Recommendations */}
        <SuggestionsSection data={dashboardData} />
      </main>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  description: string
  change?: number
  changeLabel?: string
}

function MetricCard({
  title,
  value,
  icon,
  description,
  change,
  changeLabel,
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {change !== undefined && (
          <div className="flex items-center mt-2 text-xs">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
              {change > 0 ? '+' : ''}
              {change.toFixed(2)}% {changeLabel || ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
