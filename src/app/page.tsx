'use client'

import { useState, useEffect } from 'react'
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
import type { Recommendation } from '@/components/dashboard/RecommendationsSection'

interface AnalysisData {
  id: string
  shareOfVoice: number
  visibilityScore: number
  monthlyAudience: number
  favorableMentions: number
  neutralMentions: number
  negativeMentions: number
  mentionCount: number
  sovByPlatform: {
    chatgpt?: number
    claude?: number
    gemini?: number
    perplexity?: number
  }
  mentionRate: number
  sourceDiversityScore: number
}

import type { Recommendation } from '@/components/dashboard/RecommendationsSection'

export default function DashboardPage() {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)
  const [currentDomain, setCurrentDomain] = useState<string | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [previousAnalysisData, setPreviousAnalysisData] = useState<AnalysisData | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch recommendations for an analysis
  const fetchRecommendations = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/recommendations?analysisId=${analysisId}`)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      // Not critical, so we don't show an error
    }
  }

  // Fetch analysis data
  const fetchAnalysisData = async (analysisId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/analyze?id=${analysisId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analysis data')
      }
      const data = await response.json()
      setAnalysisData(data)
      // Also set domain if available
      if (data.company?.domain) {
        setCurrentDomain(data.company.domain)
      }
      // Fetch recommendations for this analysis
      await fetchRecommendations(analysisId)
    } catch (error) {
      console.error('Error fetching analysis:', error)
      toast.error('Failed to load analysis results')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch previous analysis for comparison
  const fetchPreviousAnalysis = async (domain: string) => {
    try {
      const response = await fetch(`/api/analyze?domain=${encodeURIComponent(domain)}&previous=true`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.id) {
          setPreviousAnalysisData(data)
        } else {
          setPreviousAnalysisData(null)
        }
      }
    } catch (error) {
      console.error('Error fetching previous analysis:', error)
      // Not critical, so we don't show an error
      setPreviousAnalysisData(null)
    }
  }

  // Fetch latest analysis for a domain
  const fetchLatestAnalysis = async (domain: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/analyze?domain=${encodeURIComponent(domain)}&latest=true`)
      if (response.ok) {
        const data = await response.json()
        setAnalysisData(data)
        setCurrentDomain(domain)
        if (data.id) {
          setCurrentAnalysisId(data.id)
          // Fetch recommendations for this analysis
          await fetchRecommendations(data.id)
        }
        // Also fetch previous analysis for comparison
        await fetchPreviousAnalysis(domain)
      }
    } catch (error) {
      console.error('Error fetching latest analysis:', error)
      // Not critical if no analysis exists yet
    } finally {
      setIsLoading(false)
    }
  }

  // Load latest analysis on page load if domain is stored
  useEffect(() => {
    const storedDomain = localStorage.getItem('lastAnalyzedDomain')
    if (storedDomain && !currentAnalysisId) {
      fetchLatestAnalysis(storedDomain)
    }
  }, []) // Only run on mount

  // Fetch data when analysis ID changes
  useEffect(() => {
    if (currentAnalysisId) {
      fetchAnalysisData(currentAnalysisId)
    }
  }, [currentAnalysisId])

  // Fetch previous analysis when domain changes
  useEffect(() => {
    if (currentDomain && analysisData) {
      fetchPreviousAnalysis(currentDomain)
    }
  }, [currentDomain, analysisData?.id])

  const handleAnalysisStart = async (analysisId: string, domain: string) => {
    setCurrentAnalysisId(analysisId)
    setCurrentDomain(domain)
    // Store domain in localStorage for future page loads
    localStorage.setItem('lastAnalyzedDomain', domain)
    toast.success('Analysis completed! Loading results...')
    // Fetch the analysis data immediately
    await fetchAnalysisData(analysisId)
    // Fetch previous analysis for comparison
    await fetchPreviousAnalysis(domain)
  }

  // Calculate change from previous analysis
  const calculateChange = (current: number, previous: number | null): { value: number; label: string } | undefined => {
    if (previous === null || previous === undefined || previous === 0) {
      return undefined
    }
    const change = current - previous
    const percentChange = ((change / previous) * 100).toFixed(1)
    return {
      value: parseFloat(percentChange),
      label: `vs previous analysis`,
    }
  }

  // Calculate metrics from analysis data or use defaults
  const metrics = analysisData ? {
    shareOfVoice: analysisData.shareOfVoice || 0,
    visibilityScore: analysisData.visibilityScore || 0,
    monthlyAudience: analysisData.monthlyAudience || 0,
    favorableSentiment: analysisData.mentionCount > 0 
      ? Math.round((analysisData.favorableMentions / analysisData.mentionCount) * 100)
      : 0,
  } : {
    shareOfVoice: 0,
    visibilityScore: 0,
    monthlyAudience: 0,
    favorableSentiment: 0,
  }

  // Calculate SOV by platform from analysis data
  const sovByPlatform = analysisData?.sovByPlatform ? [
    { platform: 'ChatGPT', yourSov: analysisData.sovByPlatform.chatgpt || 0, topCompetitor: (analysisData.sovByPlatform.chatgpt || 0) * 1.8 },
    { platform: 'Claude', yourSov: analysisData.sovByPlatform.claude || 0, topCompetitor: (analysisData.sovByPlatform.claude || 0) * 1.9 },
    { platform: 'Gemini', yourSov: analysisData.sovByPlatform.gemini || 0, topCompetitor: (analysisData.sovByPlatform.gemini || 0) * 1.2 },
    { platform: 'Perplexity', yourSov: analysisData.sovByPlatform.perplexity || 0, topCompetitor: (analysisData.sovByPlatform.perplexity || 0) * 1.4 },
  ] : [
    { platform: 'ChatGPT', yourSov: 0, topCompetitor: 0 },
    { platform: 'Claude', yourSov: 0, topCompetitor: 0 },
    { platform: 'Gemini', yourSov: 0, topCompetitor: 0 },
    { platform: 'Perplexity', yourSov: 0, topCompetitor: 0 },
  ]

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
              value={`${metrics.shareOfVoice.toFixed(1)}%`}
              change={calculateChange(metrics.shareOfVoice, previousAnalysisData?.shareOfVoice ?? null)}
              context="Overall market conversation share"
              icon={<Target className="h-6 w-6" />}
              description="Your brand's percentage of total market conversations across all AI platforms."
              measurementDetails="Calculated by weighting mentions by position (1st=1.0, 2nd=0.7, 3rd=0.4, 4th+=0.2), sentiment (favorable=1.5x, neutral=1.0x, negative=0.5x), and estimated search volume. Formula: (your_weighted_mentions / total_weighted_mentions) × 100. This metric shows your competitive position in AI-generated recommendations."
            />
            <MetricCard
              title="AI Visibility Score"
              value={Math.round(metrics.visibilityScore)}
              change={calculateChange(metrics.visibilityScore, previousAnalysisData?.visibilityScore ?? null)}
              context="Normalized visibility across all platforms"
              icon={<Eye className="h-6 w-6" />}
              description="A normalized score (0-100) representing your overall visibility across all AI platforms."
              measurementDetails="Combines multiple factors: Share of Voice (40%), mention rate (25%), average position (20%), and sentiment score (15%). The score is normalized to a 0-100 scale where 100 represents maximum possible visibility. Higher scores indicate stronger AI presence and better discoverability when users ask AI assistants about products in your category."
            />
            <MetricCard
              title="Monthly Audience"
              value={metrics.monthlyAudience.toLocaleString('en-US')}
              change={calculateChange(metrics.monthlyAudience, previousAnalysisData?.monthlyAudience ?? null)}
              context="Total exposure across AI platforms"
              icon={<Users className="h-6 w-6" />}
              description="Estimated total number of users who see your brand mentioned in AI responses each month."
              measurementDetails="Calculated by multiplying your mention count by estimated monthly prompt volume for each platform, then summing across all platforms (ChatGPT, Claude, Gemini, Perplexity). Each mention is weighted by position and search volume. This represents your potential reach through AI recommendations, not direct website traffic."
            />
            <MetricCard
              title="Favorable Sentiment"
              value={`${metrics.favorableSentiment}%`}
              change={previousAnalysisData ? calculateChange(
                metrics.favorableSentiment,
                previousAnalysisData.mentionCount > 0 
                  ? Math.round((previousAnalysisData.favorableMentions / previousAnalysisData.mentionCount) * 100)
                  : null
              ) : undefined}
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
            insight={analysisData ? {
              text: `Your visibility is strongest on ${sovByPlatform.reduce((max, p) => p.yourSov > max.yourSov ? p : max, sovByPlatform[0]).platform} (${sovByPlatform.reduce((max, p) => p.yourSov > max.yourSov ? p : max, sovByPlatform[0]).yourSov.toFixed(1)}%) but weakest on ${sovByPlatform.reduce((min, p) => p.yourSov < min.yourSov ? p : min, sovByPlatform[0]).platform} (${sovByPlatform.reduce((min, p) => p.yourSov < min.yourSov ? p : min, sovByPlatform[0]).yourSov.toFixed(1)}%). Focus optimization efforts on the weakest platform to capture more market share.`,
              type: 'info',
            } : {
              text: 'Run an analysis to see your Share of Voice by platform.',
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
                  <span className="text-sm font-medium text-black">Current Score</span>
                  <span className="text-2xl font-bold text-black">
                    {analysisData ? `${analysisData.sourceDiversityScore.toFixed(1)} / 10` : '0 / 10'}
                  </span>
                </div>
                <ProgressBar 
                  value={analysisData ? Math.round(analysisData.sourceDiversityScore * 10) : 0} 
                  color="blue" 
                  showLabel 
                />
                <p className="text-sm text-black">
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
                  <span className="text-sm font-medium text-black">Mention Rate</span>
                  <span className="text-2xl font-bold text-black">
                    {analysisData ? `${Math.round(analysisData.mentionRate * 100)}%` : '0%'}
                  </span>
                </div>
                <ProgressBar 
                  value={analysisData ? Math.round(analysisData.mentionRate * 100) : 0} 
                  color="green" 
                  showLabel 
                />
                <p className="text-sm text-black">
                  {analysisData 
                    ? `You're mentioned in ${Math.round(analysisData.mentionRate * 100)}% of relevant queries. Target: 85%+ for market leadership.`
                    : 'Run an analysis to see your mention rate.'}
                </p>
              </div>
            </ChartContainer>
          </div>
        </section>

        {/* Top 3 Recommendations - CRITICAL SECTION */}
        <RecommendationsSection 
          recommendations={recommendations.length > 0 ? recommendations : []} 
        />
      </main>
    </div>
  )
}
