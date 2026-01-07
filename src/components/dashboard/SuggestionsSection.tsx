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
  Search,
  FileText,
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

    // AI Visibility recommendations based on landing pages
    const lowTrafficPages = top_landing_pages.filter(
      (page) => page.sessions < 10 && page.revenue === 0
    )
    const highTrafficPages = top_landing_pages.filter(
      (page) => page.sessions > 50
    )

    if (lowTrafficPages.length > 0) {
      suggestions.push({
        title: 'Increase AI Visibility for Underperforming Pages',
        description: `${lowTrafficPages.length} landing page${lowTrafficPages.length > 1 ? 's' : ''} are receiving minimal AI traffic. Optimize these pages with clear product descriptions, structured data, and AI-friendly content to improve discoverability.`,
        priority: 'high',
        icon: <Lightbulb className="h-5 w-5" />,
        action: `Review pages: ${lowTrafficPages
          .slice(0, 3)
          .map((p) => p.page_path.split('/').pop() || p.page_path)
          .join(', ')}`,
      })
    }

    if (highTrafficPages.length > 0) {
      const bestPage = highTrafficPages[0]
      suggestions.push({
        title: 'Scale AI Visibility from Top Performers',
        description: `"${bestPage.page_path.split('/').pop() || bestPage.page_path}" is your top AI landing page with ${bestPage.sessions} sessions. Apply similar optimization strategies (clear descriptions, structured data, FAQ sections) to other product pages.`,
        priority: 'medium',
        icon: <TrendingUp className="h-5 w-5" />,
      })
    }

    // Check for pages with good traffic but low conversion
    const highTrafficLowConversion = top_landing_pages.filter(
      (page) => page.sessions > 20 && page.conversion_rate < 1
    )
    if (highTrafficLowConversion.length > 0) {
      suggestions.push({
        title: 'Improve Conversion on High-Traffic AI Pages',
        description: `${highTrafficLowConversion.length} page${highTrafficLowConversion.length > 1 ? 's' : ''} receive good AI traffic but convert poorly. Add clear pricing, product benefits, and trust signals to these pages.`,
        priority: 'high',
        icon: <Target className="h-5 w-5" />,
      })
    }
  }

  // General AI Visibility recommendations based on landing page analysis
  const totalPages = top_landing_pages.length
  const pagesWithRevenue = top_landing_pages.filter((p) => p.revenue > 0).length
  const avgSessionsPerPage =
    top_landing_pages.reduce((sum, p) => sum + p.sessions, 0) / totalPages

  if (metrics.ai_sessions < 500 || avgSessionsPerPage < 5) {
    suggestions.push({
      title: 'Optimize Content for AI Discovery',
      description: `Only ${pagesWithRevenue}/${totalPages} landing pages are generating revenue from AI traffic. Ensure all product pages include: clear product names, detailed descriptions, pricing, and FAQ sections. AI assistants need structured, informative content.`,
      priority: 'high',
      icon: <Search className="h-5 w-5" />,
      action: 'Review all product pages and add missing information',
    })

    suggestions.push({
      title: 'Add Structured Data (Schema.org)',
      description:
        'Implement Product schema markup on your pages. This helps AI assistants understand your products better and increases the likelihood of being recommended. Start with your top landing pages.',
      priority: 'high',
      icon: <FileText className="h-5 w-5" />,
      action: `Add schema to: ${top_landing_pages
        .slice(0, 3)
        .map((p) => p.page_path.split('/').pop() || p.page_path)
        .join(', ')}`,
    })

    suggestions.push({
      title: 'Create AI-Friendly Product Descriptions',
      description:
        'Write clear, concise product descriptions that answer common questions. Include key features, use cases, benefits, and specifications. AI assistants prefer detailed, factual content over marketing fluff.',
      priority: 'medium',
      icon: <Lightbulb className="h-5 w-5" />,
    })

    // Check if pages have good content structure
    const pagesNeedingOptimization = top_landing_pages.filter(
      (page) => page.sessions > 0 && page.conversion_rate === 0
    )
    if (pagesNeedingOptimization.length > 0) {
      suggestions.push({
        title: 'Improve Content Quality on Non-Converting Pages',
        description: `${pagesNeedingOptimization.length} page${pagesNeedingOptimization.length > 1 ? 's' : ''} receive AI traffic but don't convert. These pages likely need better product information, clearer pricing, or improved user experience.`,
        priority: 'high',
        icon: <Target className="h-5 w-5" />,
      })
    }
  }

  // Recommendations for pages with good performance
  if (pagesWithRevenue > 0 && pagesWithRevenue < totalPages / 2) {
    suggestions.push({
      title: 'Replicate Success from Converting Pages',
      description: `${pagesWithRevenue} of your ${totalPages} landing pages are generating revenue. Analyze what makes these pages successful and apply the same strategies (content structure, pricing clarity, CTAs) to underperforming pages.`,
      priority: 'medium',
      icon: <TrendingUp className="h-5 w-5" />,
    })
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
