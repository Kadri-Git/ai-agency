'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { api, DashboardData, ClientSummary } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowLeft,
  Settings,
} from 'lucide-react'

export default function AdminClientViewPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.clientId as string
  const { isAuthenticated, isAdmin, clearAuth } = useAuthStore()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [clientInfo, setClientInfo] = useState<ClientSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

    fetchClientData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, clientId, days])

  const fetchClientData = async () => {
    try {
      setIsLoading(true)

      // Get client info from list
      const clientsData = await api.getClientsList()
      const client = clientsData.clients.find((c) => c.id === clientId)
      if (client) {
        setClientInfo(client)
      }

      // Get dashboard data
      const data = await api.getClientDashboard(clientId, days)
      setDashboardData(data)
    } catch (error) {
      if (error instanceof Error && error.message.includes('403')) {
        toast.error('Admin access required')
        clearAuth()
        router.push('/login')
      } else if (error instanceof Error && error.message.includes('404')) {
        toast.error('Client not found')
        router.push('/admin')
      } else {
        toast.error('Failed to load client dashboard')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  if (!isAuthenticated || !isAdmin || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData || !clientInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { metrics, revenue_trend, top_landing_pages } = dashboardData

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {clientInfo.company_name} Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {clientInfo.email} •{' '}
                {clientInfo.has_ga4 ? 'GA4 Connected' : 'Using Sample Data'}
              </p>
            </div>
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
            <Button variant="outline" onClick={() => router.push('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Admin Note */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Admin View:</strong> You are viewing{' '}
            {clientInfo.company_name}&apos;s dashboard. Use this data to provide
            consultation and recommendations.
          </p>
        </div>

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

        {/* Top Landing Pages */}
        <Card className="mb-8">
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
