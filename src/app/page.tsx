'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ChartContainer } from '@/components/dashboard/ChartContainer'
import { RecommendationsSection } from '@/components/dashboard/RecommendationsSection'
import { SovChart } from '@/components/dashboard/SovChart'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { AnalysisForm } from '@/components/forms/AnalysisForm'
import {
  TrendingUp,
  Eye,
  Users,
  MessageCircle,
  Target,
  BarChart3,
} from 'lucide-react'
import { toast } from 'sonner'

// Mock data - will be replaced with real API data
const mockRecommendations = [
  {
    priority: 1 as const,
    title: 'Optimize Content for High-Volume Queries',
    impact: 'high' as const,
    effort: 'medium' as const,
    estimatedSovGain: 12.5,
    timeframe: '2-3 months',
    evidence: {
      currentMetric: '15.2% SOV on ChatGPT',
      benchmark: '28.5% SOV (top competitor)',
      gap: '13.3 percentage points',
    },
    actionSteps: [
      'Create comprehensive product comparison guides',
      'Optimize existing content with structured data markup',
      'Build authority through industry publication citations',
      'Develop topic clusters around high-volume queries',
      'Improve citation quality with expert quotes',
    ],
    businessJustification:
      'High-volume queries represent 60% of total search volume. Improving visibility here will significantly increase brand awareness and qualified traffic.',
  },
  {
    priority: 2 as const,
    title: 'Expand Source Diversity Across Platforms',
    impact: 'high' as const,
    effort: 'low' as const,
    estimatedSovGain: 8.3,
    timeframe: '1-2 months',
    evidence: {
      currentMetric: 'Source diversity score: 4.2/10',
      benchmark: '7.8/10 (industry average)',
      gap: '3.6 points below average',
    },
    actionSteps: [
      'Submit to 5 new industry directories',
      'Secure 3 guest post opportunities',
      'Create press releases for product launches',
      'Build relationships with industry publications',
    ],
    businessJustification:
      'AI models favor diverse, authoritative sources. Increasing source diversity improves credibility and citation frequency.',
  },
  {
    priority: 3 as const,
    title: 'Improve Sentiment in Product Recommendations',
    impact: 'medium' as const,
    effort: 'high' as const,
    estimatedSovGain: 5.7,
    timeframe: '3-4 months',
    evidence: {
      currentMetric: '68% favorable sentiment',
      benchmark: '82% favorable (top performers)',
      gap: '14 percentage points',
    },
    actionSteps: [
      'Conduct customer satisfaction survey',
      'Address negative review themes in content',
      'Highlight unique value propositions more clearly',
      'Create case studies showcasing success stories',
      'Improve product descriptions with benefit-focused language',
    ],
    businessJustification:
      'Positive sentiment directly correlates with recommendation frequency. Improving sentiment will increase AI agent confidence in recommending your brand.',
  },
]

export default function DashboardPage() {
  // Mock metrics - will be replaced with real data
  const metrics = {
    shareOfVoice: 15.2,
    visibilityScore: 72,
    monthlyAudience: 125000,
    favorableSentiment: 68,
  }

  const sovByPlatform = [
    { platform: 'ChatGPT', yourSov: 15.2, topCompetitor: 28.5 },
    { platform: 'Claude', yourSov: 12.8, topCompetitor: 24.3 },
    { platform: 'Gemini', yourSov: 18.5, topCompetitor: 22.1 },
    { platform: 'Perplexity', yourSov: 14.3, topCompetitor: 19.8 },
  ]

  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)

  const handleAnalysisStart = async (analysisId: string) => {
    setCurrentAnalysisId(analysisId)
    toast.success('Analysis started! Results will appear shortly.')
    
    // Poll for results (in a real app, you might use WebSockets or Server-Sent Events)
    // For now, we'll just show a message
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 md:py-12">
        {/* Analysis Form Section */}
        <section className="mb-12 md:mb-16">
          <AnalysisForm onAnalysisStart={handleAnalysisStart} />
        </section>

        {/* Hero Metrics Grid */}
        <section className="mb-12 md:mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <MetricCard
              title="Share of Voice"
              value={`${metrics.shareOfVoice}%`}
              change={{ value: 2.3, label: 'vs last month' }}
              context="Overall market conversation share"
              icon={<Target className="h-6 w-6" />}
              description="Your brand's percentage of total market conversations across all AI platforms."
              measurementDetails="Calculated by weighting mentions by position (1st=1.0, 2nd=0.7, 3rd=0.4, 4th+=0.2), sentiment (favorable=1.5x, neutral=1.0x, negative=0.5x), and estimated search volume. Formula: (your_weighted_mentions / total_weighted_mentions) × 100. This metric shows your competitive position in AI-generated recommendations."
            />
            <MetricCard
              title="AI Visibility Score"
              value={metrics.visibilityScore}
              change={{ value: 5.1, label: 'vs last month' }}
              context="Normalized visibility across all platforms"
              icon={<Eye className="h-6 w-6" />}
              description="A normalized score (0-100) representing your overall visibility across all AI platforms."
              measurementDetails="Combines multiple factors: Share of Voice (40%), mention rate (25%), average position (20%), and sentiment score (15%). The score is normalized to a 0-100 scale where 100 represents maximum possible visibility. Higher scores indicate stronger AI presence and better discoverability when users ask AI assistants about products in your category."
            />
            <MetricCard
              title="Monthly Audience"
              value={metrics.monthlyAudience.toLocaleString()}
              change={{ value: 12.5, label: 'growth' }}
              context="Total exposure across AI platforms"
              icon={<Users className="h-6 w-6" />}
              description="Estimated total number of users who see your brand mentioned in AI responses each month."
              measurementDetails="Calculated by multiplying your mention count by estimated monthly prompt volume for each platform, then summing across all platforms (ChatGPT, Claude, Gemini, Perplexity). Each mention is weighted by position and search volume. This represents your potential reach through AI recommendations, not direct website traffic."
            />
            <MetricCard
              title="Favorable Sentiment"
              value={`${metrics.favorableSentiment}%`}
              change={{ value: -3.2, label: 'vs last month' }}
              context="Positive recommendation percentage"
              icon={<MessageCircle className="h-6 w-6" />}
              description="Percentage of your brand mentions that are positive or favorable in AI responses."
              measurementDetails="Analyzed using natural language processing to detect positive indicators (e.g., 'best', 'recommended', 'excellent') vs negative indicators (e.g., 'avoid', 'issues', 'poor') in the context around your brand name. Formula: (favorable_mentions / total_mentions) × 100. Higher sentiment increases the likelihood of AI agents recommending your brand and improves your weighted Share of Voice."
            />
          </div>
        </section>

        {/* Share of Voice by Platform */}
        <section className="mb-12 md:mb-16">
          <ChartContainer
            title="Share of Voice by Platform"
            insight={{
              text: 'Your visibility is strongest on Gemini (18.5%) but weakest on ChatGPT (15.2%). Focus optimization efforts on ChatGPT to capture the largest market share.',
              type: 'info',
            }}
          >
            <SovChart data={sovByPlatform} type="bar" />
          </ChartContainer>
        </section>

        {/* Secondary Metrics Grid */}
        <section className="mb-12 md:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer
              title="Source Diversity Score"
              description="Measures the variety and authority of sources that cite your brand."
              measurementDetails="Calculated on a 1-10 scale by analyzing the number of unique domains citing your brand, the authority of those domains (using domain authority/domain rating metrics), and the distribution across different source types (news sites, directories, blogs, etc.). Higher scores indicate better source diversity, which AI models favor for establishing credibility. Formula considers: unique source count (30%), source authority average (40%), and source type distribution (30%)."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Score</span>
                  <span className="text-2xl font-bold">4.2 / 10</span>
                </div>
                <ProgressBar value={42} color="blue" showLabel />
                <p className="text-sm text-muted-foreground">
                  Industry average: 7.8/10. Focus on diversifying citation
                  sources to improve authority.
                </p>
              </div>
            </ChartContainer>

            <ChartContainer
              title="Mention Rate Trend"
              description="Percentage of relevant queries where your brand is mentioned in AI responses."
              measurementDetails="Calculated by dividing the number of queries where you're mentioned by the total number of relevant queries analyzed, then multiplying by 100. A query is considered relevant if it matches your industry, product category, or target keywords. Formula: (prompts_mentioned / prompts_analyzed) × 100. Higher mention rates indicate better coverage of your market space. Industry leaders typically achieve 85%+ mention rates."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mention Rate</span>
                  <span className="text-2xl font-bold">68%</span>
                </div>
                <ProgressBar value={68} color="green" showLabel />
                <p className="text-sm text-muted-foreground">
                  You're mentioned in 68% of relevant queries. Target: 85%+
                  for market leadership.
                </p>
              </div>
            </ChartContainer>
          </div>
        </section>

        {/* Top 3 Recommendations - CRITICAL SECTION */}
        <RecommendationsSection recommendations={mockRecommendations} />
      </main>
    </div>
  )
}
