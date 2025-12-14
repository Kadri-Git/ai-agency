'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ChartContainer } from '@/components/dashboard/ChartContainer'
import { RecommendationsSection } from '@/components/dashboard/RecommendationsSection'
import { SovChart } from '@/components/dashboard/SovChart'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { TopCompetitors } from '@/components/dashboard/TopCompetitors'
import { AnalysisForm } from '@/components/forms/AnalysisForm'
import {
  TrendingUp,
  Eye,
  Users,
  MessageCircle,
  Target,
  BarChart3,
  Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Recommendation as RecommendationType } from '@/components/dashboard/RecommendationsSection'

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
  websiteVisibilityScore?: number | null
  visibilityByPlatform?: {
    chatgpt: number
    claude: number
    gemini: number
    perplexity: number
  }
  competitorSovByPlatform?: Record<string, Record<string, number>>
  topCompetitorByPlatform?: Record<string, { name: string; sov: number }>
  company?: {
    name: string
    domain: string
    targetRegions?: string[]
  }
  config?: {
    region?: string
    targetRegions?: string[]
  }
}

export default function DashboardPage() {
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(
    null
  )
  const [currentDomain, setCurrentDomain] = useState<string | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [previousAnalysisData, setPreviousAnalysisData] =
    useState<AnalysisData | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendationType[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(false)

  // Fetch recommendations for an analysis
  const fetchRecommendations = async (analysisId: string) => {
    try {
      const response = await fetch(
        `/api/recommendations?analysisId=${analysisId}`
      )
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching recommendations:', error)
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching analysis:', error)
      }
      toast.error('Failed to load analysis results')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch previous analysis for comparison
  const fetchPreviousAnalysis = async (domain: string) => {
    try {
      const response = await fetch(
        `/api/analyze?domain=${encodeURIComponent(domain)}&previous=true`
      )
      if (response.ok) {
        const data = await response.json()
        if (data && data.id) {
          setPreviousAnalysisData(data)
        } else {
          setPreviousAnalysisData(null)
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching previous analysis:', error)
      }
      // Not critical, so we don't show an error
      setPreviousAnalysisData(null)
    }
  }

  // Fetch latest analysis for a domain
  const fetchLatestAnalysis = async (domain: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/analyze?domain=${encodeURIComponent(domain)}&latest=true`
      )
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching latest analysis:', error)
      }
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
  const calculateChange = (
    current: number,
    previous: number | null
  ): { value: number; label: string } | undefined => {
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
  const metrics = analysisData
    ? {
        shareOfVoice: analysisData.shareOfVoice || 0,
        visibilityScore: analysisData.visibilityScore || 0,
        monthlyAudience: analysisData.monthlyAudience || 0,
        favorableSentiment:
          analysisData.mentionCount > 0
            ? Math.round(
                (analysisData.favorableMentions / analysisData.mentionCount) *
                  100
              )
            : 0,
      }
    : {
        shareOfVoice: 0,
        visibilityScore: 0,
        monthlyAudience: 0,
        favorableSentiment: 0,
      }

  // Calculate SOV by platform from analysis data with real competitor data
  // Handle both JSON string and object formats from database
  const getSovByPlatform = () => {
    if (!analysisData?.sovByPlatform) {
      return null
    }

    // Prisma returns JSON fields as objects, but handle string case too
    let sovData = analysisData.sovByPlatform
    if (typeof sovData === 'string') {
      try {
        sovData = JSON.parse(sovData)
      } catch (e) {
        return null
      }
    }

    // Ensure it's an object with the expected structure
    if (typeof sovData !== 'object' || sovData === null) {
      return null
    }

    return sovData as {
      chatgpt?: number
      claude?: number
      gemini?: number
      perplexity?: number
    }
  }

  // Calculate SOV by platform from analysis data with real competitor data
  // Get company name for labels
  const companyName = analysisData?.company?.name || 'Your Company'

  // Calculate top 5 competitors across all platforms
  const topCompetitors = (() => {
    if (!analysisData?.competitorSovByPlatform) {
      return []
    }

    const competitorSov = analysisData.competitorSovByPlatform
    const competitorMap = new Map<
      string,
      {
        name: string
        totalSov: number
        byPlatform: { chatgpt: number; claude: number; gemini: number }
        mentionCount: number
      }
    >()

    // Aggregate SOV across all platforms for each competitor
    const platforms = ['chatgpt', 'claude', 'gemini'] as const
    for (const platform of platforms) {
      const platformCompetitors = competitorSov[platform]
      if (platformCompetitors && typeof platformCompetitors === 'object') {
        for (const [competitorName, sov] of Object.entries(
          platformCompetitors
        )) {
          if (!isValidCompetitorName(competitorName)) {
            continue
          }

          if (!competitorMap.has(competitorName)) {
            competitorMap.set(competitorName, {
              name: competitorName,
              totalSov: 0,
              byPlatform: { chatgpt: 0, claude: 0, gemini: 0 },
              mentionCount: 0,
            })
          }

          const competitor = competitorMap.get(competitorName)!
          const sovValue = typeof sov === 'number' ? sov : 0
          competitor.totalSov += sovValue
          competitor.byPlatform[platform] = sovValue
          // Count platforms where competitor appears (SOV > 0)
          if (sovValue > 0) {
            competitor.mentionCount++
          }
        }
      }
    }

    // Sort by total SOV and take top 5
    return Array.from(competitorMap.values())
      .sort((a, b) => b.totalSov - a.totalSov)
      .slice(0, 5)
  })()

  // Helper function to validate competitor names (same as in API)
  function isValidCompetitorName(name: string): boolean {
    if (!name || name.trim().length < 3) {
      return false
    }

    const invalidNames = new Set([
      'nordic',
      'finland',
      'finnish',
      'sweden',
      'swedish',
      'norway',
      'norwegian',
      'denmark',
      'danish',
      'european',
      'scandinavian',
      'baltic',
      'regional',
      'global',
      'international',
      'leading',
      'top',
      'major',
      'best',
      'largest',
      'notable',
      'prominent',
      'key',
      'main',
      'primary',
      'quality',
      'reliability',
      'innovation',
      'service',
      'services',
      'solution',
      'solutions',
      'provider',
      'operators',
      'vendor',
      'brand',
      'firm',
      'business',
      'market',
      'industry',
      'region',
      'country',
      'countries',
      'area',
      'areas',
      'zone',
      'zones',
      // Common words that appear in responses (not companies)
      'their',
      'however',
      'pricing',
      'competitors',
      'competitor',
      'companies',
      'company',
      'options',
      'option',
      'choice',
      'choices',
      'selection',
      'alternatives',
      'alternative',
      'comparison',
      'compare',
      'versus',
      'overview',
      'summary',
      'conclusion',
      'recommendation',
      'recommendations',
      'consideration',
      'considerations',
      'factors',
      'factor',
      'aspects',
      'aspect',
      'features',
      'feature',
      'benefits',
      'benefit',
      'advantages',
      'advantage',
      'disadvantages',
      'disadvantage',
      'pros',
      'cons',
      'important',
      'note',
      'notes',
      'information',
      'details',
      'detail',
      'example',
      'examples',
      'instance',
      'instances',
      'case',
      'cases',
      'scenario',
      'scenarios',
      'situation',
      'situations',
      'context',
    ])

    const lowerName = name.toLowerCase().trim()
    const firstWord = lowerName.split(' ')[0]

    if (invalidNames.has(lowerName) || invalidNames.has(firstWord)) {
      return false
    }

    return true
  }

  const sovByPlatform = (() => {
    const sovData = getSovByPlatform()

    // Only include platforms that exist (excluding Perplexity)
    const platforms = [
      { key: 'chatgpt', label: 'ChatGPT' },
      { key: 'claude', label: 'Claude' },
      { key: 'gemini', label: 'Gemini' },
    ]

    return platforms.map(({ key, label }) => {
      const yourSov = sovData
        ? Number(sovData[key as keyof typeof sovData]) || 0
        : 0
      const topCompetitor = analysisData?.topCompetitorByPlatform?.[
        key as keyof typeof analysisData.topCompetitorByPlatform
      ]?.sov
        ? Number(
            analysisData.topCompetitorByPlatform[
              key as keyof typeof analysisData.topCompetitorByPlatform
            ].sov
          )
        : 0
      const competitorName =
        analysisData?.topCompetitorByPlatform?.[
          key as keyof typeof analysisData.topCompetitorByPlatform
        ]?.name || 'Top Competitor'

      return {
        platform: label,
        yourSov,
        topCompetitor,
        competitorName,
        companyName, // Add company name to each data point
      }
    })
  })()

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            <MetricCard
              title="Share of Voice"
              value={`${metrics.shareOfVoice.toFixed(1)}%`}
              change={calculateChange(
                metrics.shareOfVoice,
                previousAnalysisData?.shareOfVoice ?? null
              )}
              context="Overall market conversation share"
              icon={<Target className="h-6 w-6" />}
              description="Your brand's percentage of total market conversations across all AI platforms."
              measurementDetails="Calculated by weighting mentions by position (1st=1.0, 2nd=0.7, 3rd=0.4, 4th+=0.2), sentiment (favorable=1.5x, neutral=1.0x, negative=0.5x), and estimated search volume. Formula: (your_weighted_mentions / total_weighted_mentions) × 100. This metric shows your competitive position in AI-generated recommendations."
            />
            <MetricCard
              title="AI Visibility Score"
              value={Math.round(metrics.visibilityScore)}
              change={calculateChange(
                metrics.visibilityScore,
                previousAnalysisData?.visibilityScore ?? null
              )}
              context="Normalized visibility across all platforms"
              icon={<Eye className="h-6 w-6" />}
              description="A normalized score (0-100) representing your overall visibility across all AI platforms."
              measurementDetails="Combines multiple factors: Share of Voice (40%), mention rate (25%), average position (20%), and sentiment score (15%). The score is normalized to a 0-100 scale where 100 represents maximum possible visibility. Higher scores indicate stronger AI presence and better discoverability when users ask AI assistants about products in your category."
            />
            <MetricCard
              title="Monthly Audience"
              value={metrics.monthlyAudience.toLocaleString('en-US')}
              change={calculateChange(
                metrics.monthlyAudience,
                previousAnalysisData?.monthlyAudience ?? null
              )}
              context="Total exposure across AI platforms"
              icon={<Users className="h-6 w-6" />}
              description="Estimated total number of users who see your brand mentioned in AI responses each month."
              measurementDetails="Calculated by multiplying your mention count by estimated monthly prompt volume for each platform, then summing across all platforms (ChatGPT, Claude, Gemini, Perplexity). Each mention is weighted by position and search volume. This represents your potential reach through AI recommendations, not direct website traffic."
            />
            <MetricCard
              title="Favorable Sentiment"
              value={`${metrics.favorableSentiment}%`}
              change={
                previousAnalysisData
                  ? calculateChange(
                      metrics.favorableSentiment,
                      previousAnalysisData.mentionCount > 0
                        ? Math.round(
                            (previousAnalysisData.favorableMentions /
                              previousAnalysisData.mentionCount) *
                              100
                          )
                        : null
                    )
                  : undefined
              }
              context="Positive recommendation percentage"
              icon={<MessageCircle className="h-6 w-6" />}
              description="Percentage of your brand mentions that are positive or favorable in AI responses."
              measurementDetails="Analyzed using natural language processing to detect positive indicators (e.g., 'best', 'recommended', 'excellent') vs negative indicators (e.g., 'avoid', 'issues', 'poor') in the context around your brand name. Formula: (favorable_mentions / total_mentions) × 100. Higher sentiment increases the likelihood of AI agents recommending your brand and improves your weighted Share of Voice."
            />
            {analysisData?.websiteVisibilityScore !== null &&
              analysisData?.websiteVisibilityScore !== undefined && (
                <MetricCard
                  title="Website Visibility"
                  value={`${Math.round(analysisData.websiteVisibilityScore)}/100`}
                  change={
                    previousAnalysisData?.websiteVisibilityScore
                      ? calculateChange(
                          analysisData.websiteVisibilityScore,
                          previousAnalysisData.websiteVisibilityScore
                        )
                      : undefined
                  }
                  context="LLM-friendly website score"
                  icon={<Globe className="h-6 w-6" />}
                  description="How well your website is optimized for LLM discovery and understanding."
                  measurementDetails="Evaluates structured data (JSON-LD), meta tags, semantic HTML, sitemap availability, robots.txt configuration, mobile-friendliness, accessibility, and content quality. Score ranges from 0-100, where 70+ indicates good LLM visibility. Higher scores increase the likelihood of LLMs finding and recommending your brand based on your website content."
                />
              )}
          </div>
        </section>

        {/* Share of Voice by Platform - Single Chart */}
        <section className="mb-12 md:mb-16">
          <ChartContainer
            title="Share of Voice by Platform"
            description={`${companyName}'s Share of Voice percentage compared to top competitor across AI platforms.`}
            insight={
              analysisData
                ? (() => {
                    const hasData = sovByPlatform.some((p) => p.yourSov > 0)
                    if (!hasData) {
                      return {
                        text: 'Run an analysis to see your Share of Voice by platform.',
                        type: 'info' as const,
                      }
                    }

                    const strongest = sovByPlatform.reduce(
                      (max, p) => (p.yourSov > max.yourSov ? p : max),
                      sovByPlatform[0]
                    )
                    const platformsWithData = sovByPlatform.filter(
                      (p) => p.yourSov > 0
                    )
                    const weakest =
                      platformsWithData.length > 0
                        ? platformsWithData.reduce(
                            (min, p) => (p.yourSov < min.yourSov ? p : min),
                            platformsWithData[0]
                          )
                        : strongest
                    const hasCompetitorData = sovByPlatform.some(
                      (p) =>
                        p.topCompetitor > 0 &&
                        p.competitorName &&
                        p.competitorName !== 'Top Competitor'
                    )

                    if (hasCompetitorData) {
                      const topCompetitorPlatform = sovByPlatform.find(
                        (p) =>
                          p.topCompetitor > 0 &&
                          p.competitorName &&
                          p.competitorName !== 'Top Competitor'
                      )
                      if (topCompetitorPlatform) {
                        return {
                          text: `Your SOV is strongest on ${strongest.platform} (${strongest.yourSov.toFixed(1)}%) and weakest on ${weakest.platform} (${weakest.yourSov.toFixed(1)}%). ${topCompetitorPlatform.competitorName} leads on ${topCompetitorPlatform.platform} with ${topCompetitorPlatform.topCompetitor.toFixed(1)}% SOV.`,
                          type: 'info' as const,
                        }
                      }
                    }

                    return {
                      text: `Your SOV is strongest on ${strongest.platform} (${strongest.yourSov.toFixed(1)}%) and weakest on ${weakest.platform} (${weakest.yourSov.toFixed(1)}%). Focus on improving visibility on ${weakest.platform}.`,
                      type: 'info' as const,
                    }
                  })()
                : {
                    text: 'Run an analysis to see your Share of Voice by platform.',
                    type: 'info' as const,
                  }
            }
          >
            {sovByPlatform && sovByPlatform.length > 0 ? (
              <SovChart data={sovByPlatform} type="bar" />
            ) : (
              <div className="flex items-center justify-center h-[300px] border border-dashed rounded">
                <p className="text-muted-foreground">
                  No chart data available. Please run an analysis.
                </p>
              </div>
            )}
          </ChartContainer>
        </section>

        {/* Top Competitors Section */}
        {topCompetitors.length > 0 && (
          <section className="mb-12 md:mb-16">
            <TopCompetitors
              competitors={topCompetitors}
              companyName={companyName}
              region={
                analysisData?.config?.region ||
                analysisData?.company?.targetRegions?.[0] ||
                undefined
              }
            />
          </section>
        )}

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
                  <span className="text-sm font-medium text-black">
                    Current Score
                  </span>
                  <span className="text-2xl font-bold text-black">
                    {analysisData
                      ? `${analysisData.sourceDiversityScore.toFixed(1)} / 10`
                      : '0 / 10'}
                  </span>
                </div>
                <ProgressBar
                  value={
                    analysisData
                      ? Math.round(analysisData.sourceDiversityScore * 10)
                      : 0
                  }
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
                  <span className="text-sm font-medium text-black">
                    Mention Rate
                  </span>
                  <span className="text-2xl font-bold text-black">
                    {analysisData
                      ? `${Math.round(analysisData.mentionRate * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <ProgressBar
                  value={
                    analysisData
                      ? Math.round(analysisData.mentionRate * 100)
                      : 0
                  }
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
