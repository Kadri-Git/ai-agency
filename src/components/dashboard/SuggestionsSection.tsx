'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardData } from '@/lib/api'
import {
  TrendingUp,
  Target,
  DollarSign,
  Lightbulb,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'

interface SuggestionsSectionProps {
  data: DashboardData
}

interface Suggestion {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  icon: React.ReactNode
  action?: string
}

export function SuggestionsSection({ data }: SuggestionsSectionProps) {
  const { metrics, revenue_trend, top_landing_pages } = data

  const suggestions: Suggestion[] = []

  // Analyze AI conversion rate vs site average
  if (metrics.ai_conversion_rate < metrics.site_avg_conversion_rate) {
    suggestions.push({
      title: 'Improve AI Traffic Conversion Rate',
      description: `Your AI traffic converts at ${metrics.ai_conversion_rate.toFixed(2)}%, which is ${Math.abs(metrics.ai_vs_site_conversion_rate).toFixed(2)}% below your site average. Optimize landing pages that AI assistants link to.`,
      priority: 'high',
      icon: <Target className="h-5 w-5" />,
      action: 'Review top landing pages below',
    })
  } else if (metrics.ai_vs_site_conversion_rate > 2) {
    suggestions.push({
      title: 'AI Traffic is Performing Well',
      description: `Your AI traffic converts ${metrics.ai_vs_site_conversion_rate.toFixed(2)}% better than average. Consider increasing AI visibility to drive more traffic.`,
      priority: 'low',
      icon: <TrendingUp className="h-5 w-5" />,
    })
  }

  // Analyze revenue per session
  if (metrics.ai_revenue_per_session < 10) {
    suggestions.push({
      title: 'Increase Revenue per AI Session',
      description: `Current revenue per session is $${metrics.ai_revenue_per_session.toFixed(2)}. Improve product recommendations and upsell strategies for AI-referred visitors.`,
      priority: 'high',
      icon: <DollarSign className="h-5 w-5" />,
    })
  }

  // Analyze average order value
  if (metrics.ai_average_order_value < 50) {
    suggestions.push({
      title: 'Boost Average Order Value',
      description: `AOV from AI traffic is $${metrics.ai_average_order_value.toFixed(2)}. Create bundle offers and highlight higher-value products to AI assistants.`,
      priority: 'medium',
      icon: <DollarSign className="h-5 w-5" />,
    })
  }

  // Analyze session volume
  if (metrics.ai_sessions < 100) {
    suggestions.push({
      title: 'Increase AI Traffic Volume',
      description: `You're receiving ${metrics.ai_sessions} AI sessions. Optimize your content for AI discovery and ensure your products are mentioned in AI responses.`,
      priority: 'high',
      icon: <TrendingUp className="h-5 w-5" />,
    })
  } else if (metrics.ai_sessions > 1000) {
    suggestions.push({
      title: 'Scale Successful AI Traffic',
      description: `You're receiving ${metrics.ai_sessions.toLocaleString()} AI sessions. Consider creating AI-specific landing pages and optimizing top performers.`,
      priority: 'medium',
      icon: <Lightbulb className="h-5 w-5" />,
    })
  }

  // Analyze revenue trend
  if (revenue_trend.data.length >= 7) {
    const recentRevenue = revenue_trend.data
      .slice(-7)
      .reduce((sum, point) => sum + point.revenue, 0)
    const previousRevenue = revenue_trend.data
      .slice(-14, -7)
      .reduce((sum, point) => sum + point.revenue, 0)

    if (previousRevenue > 0) {
      const trendChange =
        ((recentRevenue - previousRevenue) / previousRevenue) * 100

      if (trendChange < -10) {
        suggestions.push({
          title: 'AI Revenue Declining',
          description: `AI revenue has decreased by ${Math.abs(trendChange).toFixed(1)}% in the last 7 days. Review recent changes and optimize underperforming pages.`,
          priority: 'high',
          icon: <AlertCircle className="h-5 w-5" />,
        })
      } else if (trendChange > 20) {
        suggestions.push({
          title: 'AI Revenue Growing',
          description: `AI revenue has increased by ${trendChange.toFixed(1)}% in the last 7 days. Double down on what's working and scale successful strategies.`,
          priority: 'low',
          icon: <TrendingUp className="h-5 w-5" />,
        })
      }
    }
  }

  // Analyze top landing pages
  if (top_landing_pages.length > 0) {
    const topPage = top_landing_pages[0]
    if (topPage.conversion_rate < 2) {
      suggestions.push({
        title: 'Optimize Top Landing Page',
        description: `Your top landing page "${topPage.page_path}" has a ${topPage.conversion_rate.toFixed(2)}% conversion rate. Improve CTAs, reduce friction, and enhance product visibility.`,
        priority: 'medium',
        icon: <Target className="h-5 w-5" />,
      })
    }
  }

  // If no specific suggestions, provide general ones
  if (suggestions.length === 0) {
    suggestions.push({
      title: 'Maintain Current Performance',
      description:
        'Your AI visibility metrics are performing well. Continue monitoring and optimize based on trends.',
      priority: 'low',
      icon: <Lightbulb className="h-5 w-5" />,
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  suggestions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  )

  // Limit to top 5 suggestions
  const topSuggestions = suggestions.slice(0, 5)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800'
      case 'medium':
        return 'border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800'
      case 'low':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800'
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            High Priority
          </span>
        )
      case 'medium':
        return (
          <span className="text-xs font-medium px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            Medium Priority
          </span>
        )
      case 'low':
        return (
          <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Low Priority
          </span>
        )
      default:
        return null
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Visibility Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getPriorityColor(
                suggestion.priority
              )}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  {suggestion.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm">
                      {suggestion.title}
                    </h4>
                    {getPriorityBadge(suggestion.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {suggestion.description}
                  </p>
                  {suggestion.action && (
                    <div className="flex items-center gap-1 text-xs text-primary mt-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>{suggestion.action}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
