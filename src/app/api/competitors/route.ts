import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  queryChatGPT,
  queryClaude,
  queryGemini,
  type QueryResult,
  type Platform,
} from '@/lib/ai-integrations'
import { generateCompetitorPrompts } from '@/lib/prompt-templates'
import {
  getLocationFromRegion,
  getRegionDisplayName,
} from '@/lib/region-mapping'

/**
 * Check if a competitor name is valid (not a geographical term or description)
 */
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

  // Skip if it's an invalid name
  if (invalidNames.has(lowerName) || invalidNames.has(firstWord)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ Skipping invalid competitor name: "${name}"`)
    }
    return false
  }

  return true
}

interface CompetitorData {
  name: string
  mentionCount: number
  averagePosition: number
  platforms: string[]
  visibilityScore: number // Visibility score (0-100) based on LLM mentions
  sov: number // For backward compatibility (same as visibilityScore)
  totalSov: number // For backward compatibility (same as visibilityScore)
  byPlatform: {
    chatgpt: number // Visibility on ChatGPT (0-100)
    claude: number // Visibility on Claude (0-100)
    gemini: number // Visibility on Gemini (0-100)
  }
}

/**
 * POST /api/competitors
 * Discover competitors for a company in a specific region
 *
 * Body: {
 *   companyId: string (optional)
 *   companyName: string
 *   companyDomain: string
 *   industry: string
 *   region: string (e.g., 'ee', 'fi', 'us')
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, companyName, companyDomain, industry, region } = body

    if (!companyName || !companyDomain || !industry || !region) {
      return NextResponse.json(
        { error: 'Company name, domain, industry, and region are required' },
        { status: 400 }
      )
    }

    // Check API keys
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    const hasGoogle = !!process.env.GOOGLE_AI_API_KEY

    if (!hasOpenAI && !hasAnthropic && !hasGoogle) {
      return NextResponse.json(
        { error: 'No API keys configured. Please add at least one API key.' },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🔍 Starting competitor discovery for: ${companyName} in ${getRegionDisplayName(region)}`
      )
    }

    // Generate region-specific prompts
    const prompts = generateCompetitorPrompts(industry, region, 3)
    const platforms = ['chatgpt', 'claude', 'gemini'] as const
    const results: QueryResult[] = []

    // Query all platforms with all prompts
    for (const prompt of prompts) {
      for (const platform of platforms) {
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `📡 Querying ${platform} with: "${prompt.substring(0, 80)}..."`
            )
          }

          let result: QueryResult | null = null
          if (platform === 'chatgpt' && hasOpenAI) {
            result = await queryChatGPT(prompt, companyName, companyDomain)
          } else if (platform === 'claude' && hasAnthropic) {
            result = await queryClaude(prompt, companyName, companyDomain)
          } else if (platform === 'gemini' && hasGoogle) {
            result = await queryGemini(prompt, companyName, companyDomain)
          }

          if (result) {
            results.push(result)
            if (process.env.NODE_ENV === 'development') {
              console.log(
                `✅ ${platform} result: ${result.competitorsMentioned?.length || 0} competitors found`
              )
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          console.error(`❌ Error querying ${platform}:`, errorMessage)
          // Continue with other platforms
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Total results: ${results.length}`)
    }

    // Extract and aggregate competitors
    const competitorMap = new Map<
      string,
      {
        results: QueryResult[]
        positions: number[]
        platforms: Set<string>
      }
    >()

    for (const result of results) {
      if (
        result.competitorsMentioned &&
        result.competitorsMentioned.length > 0
      ) {
        for (const competitorName of result.competitorsMentioned) {
          if (!isValidCompetitorName(competitorName)) {
            continue
          }

          if (!competitorMap.has(competitorName)) {
            competitorMap.set(competitorName, {
              results: [],
              positions: [],
              platforms: new Set(),
            })
          }

          const competitor = competitorMap.get(competitorName)!
          competitor.results.push(result)
          competitor.platforms.add(result.platform)

          // Add position if available
          if (result.competitorPositions?.[competitorName]) {
            competitor.positions.push(
              result.competitorPositions[competitorName]
            )
          }
        }
      }
    }

    // Calculate visibility score for each competitor and build response
    // Visibility is based on: mention count, average position, and platform coverage
    const competitors: CompetitorData[] = []

    for (const [competitorName, data] of competitorMap) {
      const averagePosition =
        data.positions.length > 0
          ? data.positions.reduce((sum, p) => sum + p, 0) /
            data.positions.length
          : 0

      // Calculate visibility score (0-100)
      // Higher mention count = higher visibility
      // Better positions (lower number) = higher visibility
      // More platforms = higher visibility
      const mentionCount = data.results.length
      const platformCount = data.platforms.size
      const totalQueries = results.length

      // Mention rate (0-1): how often competitor is mentioned
      const mentionRate = totalQueries > 0 ? mentionCount / totalQueries : 0

      // Position score: better positions (1, 2, 3) = higher score
      // Position 1 = 100, Position 2 = 50, Position 3 = 33, etc.
      const positionScore =
        averagePosition > 0 ? Math.max(0, 100 / averagePosition) : 0

      // Platform coverage score: more platforms = higher score
      // 1 platform = 33, 2 platforms = 67, 3 platforms = 100
      const platformCoverageScore = (platformCount / platforms.length) * 100

      // Calculate overall visibility score
      // 50% from mention rate, 30% from position, 20% from platform coverage
      const visibilityScore = Math.min(
        100,
        mentionRate * 100 * 0.5 + // 50% from mention frequency
          positionScore * 0.3 + // 30% from position quality
          platformCoverageScore * 0.2 // 20% from platform coverage
      )

      // Calculate visibility by platform (simplified - just mention rate per platform)
      const visibilityByPlatform: Record<string, number> = {
        chatgpt: 0,
        claude: 0,
        gemini: 0,
      }

      for (const platform of platforms) {
        const platformResults = results.filter((r) => r.platform === platform)
        if (platformResults.length === 0) continue

        const platformMentions = platformResults.filter((r) =>
          r.competitorsMentioned?.includes(competitorName)
        ).length
        const platformMentionRate = platformMentions / platformResults.length

        // Platform visibility: mention rate * 100
        visibilityByPlatform[platform] = platformMentionRate * 100
      }

      competitors.push({
        name: competitorName,
        mentionCount,
        averagePosition,
        platforms: Array.from(data.platforms),
        visibilityScore,
        sov: visibilityScore, // For backward compatibility
        totalSov: visibilityScore, // For backward compatibility
        byPlatform: {
          chatgpt: visibilityByPlatform.chatgpt,
          claude: visibilityByPlatform.claude,
          gemini: visibilityByPlatform.gemini,
        },
      })
    }

    // Sort by visibility score (highest first) and take top 5
    const topCompetitors = competitors
      .sort((a, b) => b.totalSov - a.totalSov)
      .slice(0, 5)

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Found ${topCompetitors.length} top competitors`)
      topCompetitors.forEach((c, i) => {
        console.log(
          `  ${i + 1}. ${c.name} (Visibility: ${c.totalSov.toFixed(1)}%, Mentions: ${c.mentionCount}, Position: ${c.averagePosition.toFixed(1)})`
        )
      })
    }

    return NextResponse.json({
      region,
      regionDisplayName: getRegionDisplayName(region),
      location: getLocationFromRegion(region),
      industry,
      competitors: topCompetitors,
      totalCompetitorsFound: competitors.length,
      promptsUsed: prompts,
    })
  } catch (error) {
    console.error('Competitor discovery error:', error)

    let errorMessage = 'Failed to discover competitors'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
