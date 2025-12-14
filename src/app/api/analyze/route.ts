import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  queryChatGPT,
  queryClaude,
  queryGemini,
  calculateShareOfVoice,
  type QueryResult,
  type Platform,
} from '@/lib/ai-integrations'
import { analyzeWebsite } from '@/lib/website-analysis'
import { generateCompetitorPrompts } from '@/lib/prompt-templates'

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

/**
 * Calculate visibility score per platform from stored results
 */
function calculateVisibilityByPlatform(
  results: Array<{
    platform: string
    mentioned: boolean
    position: number | null
    sentiment: string | null
  }>,
  sovByPlatform: {
    chatgpt?: number
    claude?: number
    gemini?: number
    perplexity?: number
  }
): { chatgpt: number; claude: number; gemini: number; perplexity: number } {
  const visibilityByPlatform = {
    chatgpt: 0,
    claude: 0,
    gemini: 0,
    perplexity: 0,
  }

  const platforms = ['chatgpt', 'claude', 'gemini', 'perplexity'] as const
  for (const platform of platforms) {
    const platformResults = results.filter((r) => r.platform === platform)
    const platformMentioned = platformResults.filter((r) => r.mentioned)
    if (platformResults.length === 0) continue

    const platformMentionRate =
      platformMentioned.length / platformResults.length
    const platformSovValue = sovByPlatform[platform] || 0
    const platformPositions = platformMentioned
      .map((r) => r.position)
      .filter((p): p is number => p !== null && p > 0)
    const platformAvgPosition =
      platformPositions.length > 0
        ? platformPositions.reduce((sum, p) => sum + p, 0) /
          platformPositions.length
        : 0
    const platformFavorable = platformMentioned.filter(
      (r) => r.sentiment === 'favorable'
    ).length

    visibilityByPlatform[platform] = Math.min(
      100,
      platformSovValue * 0.4 + // 40% from SOV
        platformMentionRate * 100 * 0.3 + // 30% from mention rate
        (platformAvgPosition > 0 ? (1 / platformAvgPosition) * 30 * 0.2 : 0) + // 20% from position
        (platformFavorable / Math.max(1, platformMentioned.length)) * 100 * 0.1 // 10% from sentiment
    )
  }

  return visibilityByPlatform
}

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    await prisma.$connect()

    // Check API keys
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    const hasGoogle = !!process.env.GOOGLE_AI_API_KEY

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🔑 API Keys status: OpenAI=${hasOpenAI ? '✅' : '❌'}, Anthropic=${hasAnthropic ? '✅' : '❌'}, Google=${hasGoogle ? '✅' : '❌'}`
      )
    }

    if (!hasOpenAI && !hasAnthropic && !hasGoogle) {
      return NextResponse.json(
        {
          error:
            'No API keys configured. Please add at least one API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_API_KEY) to your .env file.',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { company, domain, industry, config = {} } = body

    if (!company || !domain) {
      return NextResponse.json(
        { error: 'Company name and domain are required' },
        { status: 400 }
      )
    }

    const region = config.region || 'global'
    const targetRegions = config.targetRegions || [region]

    // Find or create company
    let companyRecord = await prisma.company.findUnique({
      where: { domain },
    })

    if (!companyRecord) {
      companyRecord = await prisma.company.create({
        data: {
          name: company,
          domain,
          industry: industry || null,
          targetRegions,
        },
      })
    } else {
      // Update existing company with new regions if needed
      companyRecord = await prisma.company.update({
        where: { id: companyRecord.id },
        data: {
          targetRegions: Array.from(
            new Set([...companyRecord.targetRegions, ...targetRegions])
          ),
        },
      })
    }

    // Generate industry-specific prompts with region context
    // Use region-specific prompts if industry and region are provided
    let prompts: string[]
    if (industry && region && region !== 'global') {
      // Use region-specific competitor discovery prompts
      prompts = generateCompetitorPrompts(industry, region, 3)
      // Also include prompts that explicitly mention the company
      prompts.push(
        `List the top 5 ${industry} companies in ${region}. Include ${company} in your list and explain why each company is notable.`,
        `Which ${industry} brands are best for quality and reliability in ${region}? Please mention ${company} and compare it with others.`
      )
    } else if (industry) {
      // Generic industry prompts with company mention
      prompts = [
        `List the top 5 ${industry} companies. Include ${company} in your list and explain why each company is notable.`,
        `Which ${industry} brands are best for quality and reliability? Please mention ${company} and compare it with others.`,
        `What are the leading ${industry} solutions? Specifically discuss ${company} and how it compares to competitors.`,
      ]
    } else {
      // Fallback to generic tech prompts
      prompts = [
        `List the top 5 technology companies in the market. Include ${company} in your list and explain why each company is notable.`,
        `Which tech brands are best for quality and innovation? Please mention ${company} and compare it with others.`,
        `What are the leading technology solutions? Specifically discuss ${company} and how it compares to competitors.`,
      ]
    }

    const platforms = ['chatgpt', 'claude', 'gemini'] as const
    const results: QueryResult[] = []

    // Run queries across platforms
    // Note: This can take a while, so we'll run them sequentially for now
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Starting analysis for: ${company} (${domain})`)
    }
    for (const prompt of prompts) {
      for (const platform of platforms) {
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `📡 Querying ${platform} with: "${prompt.substring(0, 80)}..."`
            )
          }
          let result
          if (platform === 'chatgpt') {
            result = await queryChatGPT(prompt, company, domain)
          } else if (platform === 'claude') {
            result = await queryClaude(prompt, company, domain)
          } else if (platform === 'gemini') {
            result = await queryGemini(prompt, company, domain)
          }

          if (result) {
            if (process.env.NODE_ENV === 'development') {
              console.log(
                `✅ ${platform} result: mentioned=${result.mentioned}, position=${result.position || 'N/A'}, response length=${result.response.length}`
              )
              if (result.mentioned) {
                console.log(
                  `   Response snippet: ${result.response.substring(0, 150)}...`
                )
              } else {
                console.log(
                  `   ⚠️ Company NOT mentioned. Response preview: ${result.response.substring(0, 200)}...`
                )
                console.log(
                  `   Looking for: "${company}" or domain "${domain}"`
                )
              }
            }
            results.push(result)
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.log(`❌ ${platform} returned null/undefined result`)
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          console.error(
            `❌ Error querying ${platform} with prompt "${prompt}":`,
            errorMessage
          )

          // Check for specific error types
          if (
            errorMessage.includes('API key') ||
            errorMessage.includes('authentication')
          ) {
            console.error(
              `   ⚠️ API key issue for ${platform}. Check your .env file.`
            )
          } else if (
            errorMessage.includes('rate limit') ||
            errorMessage.includes('quota')
          ) {
            console.error(`   ⚠️ Rate limit exceeded for ${platform}.`)
          }

          // Continue with other platforms even if one fails
          // Add a placeholder result to maintain structure
          results.push({
            platform,
            prompt,
            response: `Error: ${errorMessage}`,
            mentioned: false,
          })
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `📊 Analysis complete. Total results: ${results.length}, Mentioned: ${results.filter((r) => r.mentioned).length}`
      )
      // Log detailed results
      results.forEach((r, idx) => {
        console.log(
          `  Result ${idx + 1}: platform=${r.platform}, mentioned=${r.mentioned}, position=${r.position || 'N/A'}, response_length=${r.response.length}`
        )
        if (r.mentioned && r.response) {
          console.log(
            `    Response snippet: ${r.response.substring(0, 200)}...`
          )
        } else if (!r.mentioned) {
          console.log(
            `    ⚠️ NOT MENTIONED - Response preview: ${r.response.substring(0, 300)}...`
          )
        }
      })

      // Log platform breakdown
      const platformBreakdown = ['chatgpt', 'claude', 'gemini'] as const
      platformBreakdown.forEach((platform) => {
        const platformResults = results.filter((r) => r.platform === platform)
        const mentioned = platformResults.filter((r) => r.mentioned).length
        console.log(
          `  ${platform}: ${mentioned}/${platformResults.length} mentions`
        )
      })
    }

    // Calculate metrics from actual results
    const mentionedResults = results.filter((r) => r.mentioned)
    const totalQueries = results.length
    const mentionRate =
      totalQueries > 0 ? mentionedResults.length / totalQueries : 0

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `📊 Metrics: mentionRate=${(mentionRate * 100).toFixed(1)}%, mentionedResults=${mentionedResults.length}, totalQueries=${totalQueries}`
      )
    }

    // Calculate Share of Voice based on actual performance
    const shareOfVoice = calculateShareOfVoice(results)

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Overall SOV: ${shareOfVoice.toFixed(1)}%`)
    }

    // Calculate platform-specific SOV
    const platformSov: {
      chatgpt: number
      claude: number
      gemini: number
      perplexity: number
    } = {
      chatgpt: 0,
      claude: 0,
      gemini: 0,
      perplexity: 0,
    }

    // Calculate platform-specific SOV
    // Need to pass ALL results for the platform (not just mentioned) so calculateShareOfVoice can work properly
    platforms.forEach((platform) => {
      const platformResults = results.filter((r) => r.platform === platform)
      if (platformResults.length > 0) {
        // Pass all platform results (mentioned + not mentioned) to calculate SOV properly
        const sov = calculateShareOfVoice(platformResults)
        platformSov[platform] = sov
        if (process.env.NODE_ENV === 'development') {
          const mentioned = platformResults.filter((r) => r.mentioned).length
          console.log(
            `📊 ${platform} SOV calculation: ${mentioned}/${platformResults.length} mentioned, SOV=${sov.toFixed(1)}%`
          )
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚠️ ${platform}: No results found`)
        }
      }
    })

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `📊 Platform SOV Summary: ChatGPT=${platformSov.chatgpt.toFixed(1)}%, Claude=${platformSov.claude.toFixed(1)}%, Gemini=${platformSov.gemini.toFixed(1)}%`
      )
      console.log(`📊 Overall SOV: ${shareOfVoice.toFixed(1)}%`)
    }

    // Calculate competitor SOV by platform
    const competitorSovByPlatform: Record<string, Record<string, number>> = {
      chatgpt: {},
      claude: {},
      gemini: {},
      perplexity: {},
    }
    const topCompetitorByPlatform: Record<
      string,
      { name: string; sov: number }
    > = {
      chatgpt: { name: '', sov: 0 },
      claude: { name: '', sov: 0 },
      gemini: { name: '', sov: 0 },
      perplexity: { name: '', sov: 0 },
    }

    // Group results by platform and extract competitor data
    for (const platform of platforms) {
      const platformResults = results.filter((r) => r.platform === platform)

      // Collect all competitors mentioned across all results for this platform
      const competitorMap = new Map<string, QueryResult[]>()

      for (const result of platformResults) {
        if (
          result.competitorsMentioned &&
          result.competitorsMentioned.length > 0
        ) {
          for (const competitorName of result.competitorsMentioned) {
            // Filter out invalid competitor names (geographical terms, descriptions, etc.)
            if (!isValidCompetitorName(competitorName)) {
              continue
            }

            if (!competitorMap.has(competitorName)) {
              competitorMap.set(competitorName, [])
            }
            // Create a pseudo-QueryResult for the competitor based on this result
            // The competitor is "mentioned" if they appear in competitorsMentioned
            const competitorResult: QueryResult = {
              platform: result.platform,
              prompt: result.prompt,
              response: result.response,
              mentioned: true, // Competitor is mentioned
              position:
                result.competitorPositions?.[competitorName] || undefined,
              sentiment: 'neutral', // Default sentiment for competitors
              sentimentScore: 0,
            }
            competitorMap.get(competitorName)!.push(competitorResult)
          }
        }
      }

      // Calculate SOV for each competitor on this platform
      for (const [competitorName, competitorResults] of competitorMap) {
        // We need to include all platform results (mentioned + not mentioned) for proper SOV calculation
        // Create a full set of results where competitor is either mentioned or not
        const allPlatformResultsForCompetitor: QueryResult[] =
          platformResults.map((result: any) => {
            const isMentioned =
              result.competitorsMentioned?.includes(competitorName) || false
            return {
              platform: result.platform as Platform,
              prompt: result.prompt,
              response: result.response,
              mentioned: isMentioned,
              position: isMentioned
                ? result.competitorPositions?.[competitorName] || undefined
                : undefined,
              sentiment: 'neutral' as const,
              sentimentScore: 0,
            }
          })

        const competitorSov = calculateShareOfVoice(
          allPlatformResultsForCompetitor
        )
        competitorSovByPlatform[platform][competitorName] = competitorSov

        // Track top competitor for this platform
        if (competitorSov > topCompetitorByPlatform[platform].sov) {
          topCompetitorByPlatform[platform] = {
            name: competitorName,
            sov: competitorSov,
          }
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      for (const platform of platforms) {
        const top = topCompetitorByPlatform[platform]
        if (top.name) {
          console.log(
            `📊 Top competitor on ${platform}: ${top.name} (${top.sov.toFixed(1)}%)`
          )
        }
      }
    }

    // Calculate sentiment breakdown
    const favorableMentions = mentionedResults.filter(
      (r) => r.sentiment === 'favorable'
    ).length
    const neutralMentions = mentionedResults.filter(
      (r) => r.sentiment === 'neutral'
    ).length
    const negativeMentions = mentionedResults.filter(
      (r) => r.sentiment === 'negative'
    ).length

    // Calculate average position (only for mentioned results)
    const positions = mentionedResults
      .map((r) => r.position)
      .filter((p): p is number => p !== undefined && p > 0)
    const averagePosition =
      positions.length > 0
        ? positions.reduce((sum, p) => sum + p, 0) / positions.length
        : 0

    // Calculate visibility score (0-100) based on multiple factors
    const visibilityScore = Math.min(
      100,
      shareOfVoice * 0.4 + // 40% from SOV
        mentionRate * 100 * 0.3 + // 30% from mention rate
        (averagePosition > 0 ? (1 / averagePosition) * 30 * 0.2 : 0) + // 20% from position (better position = higher score)
        (favorableMentions / Math.max(1, mentionedResults.length)) * 100 * 0.1 // 10% from sentiment
    )

    // Calculate visibility score per platform
    const visibilityByPlatform: {
      chatgpt: number
      claude: number
      gemini: number
      perplexity: number
    } = {
      chatgpt: 0,
      claude: 0,
      gemini: 0,
      perplexity: 0,
    }

    for (const platform of platforms) {
      const platformResults = results.filter((r) => r.platform === platform)
      const platformMentioned = platformResults.filter((r) => r.mentioned)
      if (platformResults.length === 0) continue

      const platformMentionRate =
        platformMentioned.length / platformResults.length
      const platformSovValue = platformSov[platform]
      const platformPositions = platformMentioned
        .map((r) => r.position)
        .filter((p): p is number => p !== undefined && p > 0)
      const platformAvgPosition =
        platformPositions.length > 0
          ? platformPositions.reduce((sum, p) => sum + p, 0) /
            platformPositions.length
          : 0
      const platformFavorable = platformMentioned.filter(
        (r) => r.sentiment === 'favorable'
      ).length

      visibilityByPlatform[platform] = Math.min(
        100,
        platformSovValue * 0.4 + // 40% from SOV
          platformMentionRate * 100 * 0.3 + // 30% from mention rate
          (platformAvgPosition > 0 ? (1 / platformAvgPosition) * 30 * 0.2 : 0) + // 20% from position
          (platformFavorable / Math.max(1, platformMentioned.length)) *
            100 *
            0.1 // 10% from sentiment
      )
    }

    // Estimate monthly audience based on mention count and position
    // Rough estimate: each mention seen by ~10k-50k users depending on position
    const audiencePerMention = mentionedResults.reduce((sum, r) => {
      const pos = r.position || 5
      const baseAudience =
        pos === 1 ? 50000 : pos === 2 ? 30000 : pos === 3 ? 15000 : 5000
      return sum + baseAudience
    }, 0)
    const monthlyAudience = Math.round(audiencePerMention * 1.2) // Add 20% for multiple queries

    // Calculate source diversity (simplified - would need actual source analysis)
    const uniquePlatforms = new Set(mentionedResults.map((r) => r.platform))
      .size
    const sourceDiversityScore = Math.min(
      10,
      5 + uniquePlatforms * 1.5 + mentionRate * 2
    )

    // Analyze website for LLM visibility
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 Analyzing website: ${domain}`)
    }
    let websiteAnalysis = null
    let websiteVisibilityScore = null
    try {
      websiteAnalysis = await analyzeWebsite(domain)
      websiteVisibilityScore = websiteAnalysis.overallVisibilityScore
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `✅ Website analysis complete. Visibility score: ${websiteVisibilityScore}/100`
        )
      }
    } catch (error) {
      console.error('❌ Website analysis failed:', error)
      // Continue with analysis even if website analysis fails
    }

    // Create analysis
    if (process.env.NODE_ENV === 'development') {
      console.log(`💾 Saving analysis to database...`)
      console.log(`   Share of Voice: ${shareOfVoice.toFixed(1)}%`)
      console.log(`   Platform SOV: ${JSON.stringify(platformSov)}`)
      console.log(
        `   Mention count: ${mentionedResults.length}/${totalQueries}`
      )
      console.log(`   Visibility score: ${visibilityScore.toFixed(1)}`)
    }

    const analysis = await prisma.analysis.create({
      data: {
        companyId: companyRecord.id,
        shareOfVoice,
        sovByPlatform: platformSov,
        visibilityScore,
        monthlyAudience,
        mentionCount: mentionedResults.length,
        citationCount: mentionedResults.filter(
          (r) =>
            r.citations && Array.isArray(r.citations) && r.citations.length > 0
        ).length,
        favorableMentions,
        neutralMentions,
        negativeMentions,
        averagePosition,
        totalFanoutQueries: 0,
        avgFanoutPerPrompt: 0,
        commonAddedTerms: [],
        totalUniqueSources: uniquePlatforms,
        sourceDiversityScore,
        websiteVisibilityScore,
        websiteAnalysis: websiteAnalysis
          ? JSON.parse(JSON.stringify(websiteAnalysis))
          : null,
        promptsAnalyzed: totalQueries,
        promptsMentioned: mentionedResults.length,
        mentionRate,
        config: {
          ...config,
          visibilityByPlatform, // Store visibility per platform in config
        },
        startDate: new Date(),
        endDate: new Date(),
      },
    })

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Analysis saved with ID: ${analysis.id}`)
    }

    // Create result records
    for (const result of results) {
      await prisma.result.create({
        data: {
          analysisId: analysis.id,
          platform: result.platform,
          prompt: result.prompt,
          promptCategory: 'general',
          response: result.response,
          mentioned: result.mentioned,
          position: result.position || null,
          contextSnippet: result.contextSnippet || null,
          sentiment: result.sentiment || null,
          sentimentScore: result.sentimentScore || null,
          citations: result.citations || [],
          competitorsMentioned: result.competitorsMentioned || [],
          competitorPositions: result.competitorPositions || undefined,
        },
      })
    }

    return NextResponse.json({
      id: analysis.id,
      companyId: companyRecord.id,
      status: 'completed',
      shareOfVoice,
      visibilityScore: analysis.visibilityScore,
      visibilityByPlatform,
      competitorSovByPlatform,
      topCompetitorByPlatform,
    })
  } catch (error) {
    console.error('Analysis error:', error)

    // Provide more detailed error information
    let errorMessage = 'Failed to run analysis'
    let errorDetails = 'Unknown error'

    if (error instanceof Error) {
      errorDetails = error.message
      errorMessage = error.message

      // Check for specific error types
      if (
        error.message.includes('Prisma') ||
        error.message.includes('database')
      ) {
        errorMessage =
          'Database connection error. Please check your database configuration.'
      } else if (
        error.message.includes('API key') ||
        error.message.includes('authentication')
      ) {
        errorMessage =
          'API key error. Please check your API keys in the .env file.'
      } else if (
        error.message.includes('rate limit') ||
        error.message.includes('quota')
      ) {
        errorMessage = 'API rate limit exceeded. Please try again later.'
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        stack:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const domain = searchParams.get('domain')
    const latest = searchParams.get('latest') === 'true'

    // Get latest analysis for a domain
    if (latest && domain) {
      const company = await prisma.company.findUnique({
        where: { domain },
        include: {
          analyses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              results: true,
            },
          },
        },
      })

      if (!company || company.analyses.length === 0) {
        return NextResponse.json(
          { error: 'No analysis found for this domain' },
          { status: 404 }
        )
      }

      const analysis = company.analyses[0]

      // Calculate competitor SOV by platform from stored results
      const competitorSovByPlatform: Record<string, Record<string, number>> = {
        chatgpt: {},
        claude: {},
        gemini: {},
        perplexity: {},
      }
      const topCompetitorByPlatform: Record<
        string,
        { name: string; sov: number }
      > = {
        chatgpt: { name: '', sov: 0 },
        claude: { name: '', sov: 0 },
        gemini: { name: '', sov: 0 },
        perplexity: { name: '', sov: 0 },
      }

      // Group results by platform
      const platforms = ['chatgpt', 'claude', 'gemini'] as const
      for (const platform of platforms) {
        const platformResults = analysis.results.filter(
          (r: { platform: string }) => r.platform === platform
        )

        // Collect all competitors mentioned across all results for this platform
        const competitorMap = new Map<string, typeof platformResults>()

        for (const result of platformResults) {
          const competitorsMentioned = Array.isArray(
            result.competitorsMentioned
          )
            ? result.competitorsMentioned
            : []
          const competitorPositions =
            result.competitorPositions &&
            typeof result.competitorPositions === 'object'
              ? (result.competitorPositions as Record<string, number>)
              : {}

          for (const competitorName of competitorsMentioned) {
            if (!competitorMap.has(competitorName)) {
              competitorMap.set(competitorName, [])
            }
            competitorMap.get(competitorName)!.push(result)
          }
        }

        // Calculate SOV for each competitor on this platform
        for (const [competitorName, competitorResults] of competitorMap) {
          // Create QueryResult-like objects for SOV calculation
          const queryResultsForCompetitor: QueryResult[] = platformResults.map(
            (result: any) => {
              const competitorsMentioned = Array.isArray(
                result.competitorsMentioned
              )
                ? result.competitorsMentioned
                : []
              const competitorPositions =
                result.competitorPositions &&
                typeof result.competitorPositions === 'object'
                  ? (result.competitorPositions as Record<string, number>)
                  : {}
              const isMentioned = competitorsMentioned.includes(competitorName)

              return {
                platform: result.platform as Platform,
                prompt: result.prompt,
                response: result.response,
                mentioned: isMentioned,
                position: isMentioned
                  ? competitorPositions[competitorName] || undefined
                  : undefined,
                sentiment: 'neutral' as const,
                sentimentScore: 0,
              }
            }
          )

          const competitorSov = calculateShareOfVoice(queryResultsForCompetitor)
          competitorSovByPlatform[platform][competitorName] = competitorSov

          // Track top competitor for this platform
          if (competitorSov > topCompetitorByPlatform[platform].sov) {
            topCompetitorByPlatform[platform] = {
              name: competitorName,
              sov: competitorSov,
            }
          }
        }
      }

      // Calculate visibility per platform
      const visibilityByPlatform = calculateVisibilityByPlatform(
        analysis.results,
        analysis.sovByPlatform as {
          chatgpt?: number
          claude?: number
          gemini?: number
          perplexity?: number
        }
      )

      return NextResponse.json({
        ...analysis,
        visibilityByPlatform,
        competitorSovByPlatform,
        topCompetitorByPlatform,
      })
    }

    // Get previous analysis for comparison (second most recent)
    if (domain && searchParams.get('previous') === 'true') {
      const company = await prisma.company.findUnique({
        where: { domain },
        include: {
          analyses: {
            orderBy: { createdAt: 'desc' },
            take: 2,
            include: {
              results: true,
            },
          },
        },
      })

      if (!company || company.analyses.length < 2) {
        return NextResponse.json(null) // No previous analysis
      }

      const analysis = company.analyses[1]
      // Add company reference for consistency
      const analysisWithCompany = { ...analysis, company }

      // Calculate competitor SOV by platform from stored results
      const competitorSovByPlatform: Record<string, Record<string, number>> = {
        chatgpt: {},
        claude: {},
        gemini: {},
        perplexity: {},
      }
      const topCompetitorByPlatform: Record<
        string,
        { name: string; sov: number }
      > = {
        chatgpt: { name: '', sov: 0 },
        claude: { name: '', sov: 0 },
        gemini: { name: '', sov: 0 },
        perplexity: { name: '', sov: 0 },
      }

      // Group results by platform
      const platforms = ['chatgpt', 'claude', 'gemini'] as const
      for (const platform of platforms) {
        const platformResults = analysis.results.filter(
          (r: { platform: string }) => r.platform === platform
        )

        // Collect all competitors mentioned across all results for this platform
        const competitorMap = new Map<string, typeof platformResults>()

        for (const result of platformResults) {
          const competitorsMentioned = Array.isArray(
            result.competitorsMentioned
          )
            ? result.competitorsMentioned
            : []
          const competitorPositions =
            result.competitorPositions &&
            typeof result.competitorPositions === 'object'
              ? (result.competitorPositions as Record<string, number>)
              : {}

          for (const competitorName of competitorsMentioned) {
            if (!competitorMap.has(competitorName)) {
              competitorMap.set(competitorName, [])
            }
            competitorMap.get(competitorName)!.push(result)
          }
        }

        // Calculate SOV for each competitor on this platform
        for (const [competitorName, competitorResults] of competitorMap) {
          // Create QueryResult-like objects for SOV calculation
          const queryResultsForCompetitor: QueryResult[] = platformResults.map(
            (result: any) => {
              const competitorsMentioned = Array.isArray(
                result.competitorsMentioned
              )
                ? result.competitorsMentioned
                : []
              const competitorPositions =
                result.competitorPositions &&
                typeof result.competitorPositions === 'object'
                  ? (result.competitorPositions as Record<string, number>)
                  : {}
              const isMentioned = competitorsMentioned.includes(competitorName)

              return {
                platform: result.platform as Platform,
                prompt: result.prompt,
                response: result.response,
                mentioned: isMentioned,
                position: isMentioned
                  ? competitorPositions[competitorName] || undefined
                  : undefined,
                sentiment: 'neutral' as const,
                sentimentScore: 0,
              }
            }
          )

          const competitorSov = calculateShareOfVoice(queryResultsForCompetitor)
          competitorSovByPlatform[platform][competitorName] = competitorSov

          // Track top competitor for this platform
          if (competitorSov > topCompetitorByPlatform[platform].sov) {
            topCompetitorByPlatform[platform] = {
              name: competitorName,
              sov: competitorSov,
            }
          }
        }
      }

      // Calculate visibility per platform
      const visibilityByPlatform = calculateVisibilityByPlatform(
        analysis.results,
        analysis.sovByPlatform as {
          chatgpt?: number
          claude?: number
          gemini?: number
          perplexity?: number
        }
      )

      // Extract region from config if available
      const config =
        analysisWithCompany.config &&
        typeof analysisWithCompany.config === 'object'
          ? (analysisWithCompany.config as {
              region?: string
              targetRegions?: string[]
            })
          : {}
      const region =
        config.region ||
        analysisWithCompany.company?.targetRegions?.[0] ||
        'global'

      return NextResponse.json({
        ...analysisWithCompany,
        visibilityByPlatform,
        competitorSovByPlatform,
        topCompetitorByPlatform,
        config: {
          ...config,
          region,
        },
      })
    }

    // Get analysis by ID
    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID or domain is required' },
        { status: 400 }
      )
    }

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        company: true,
        results: true,
      },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // Calculate competitor SOV by platform from stored results
    const competitorSovByPlatform: Record<string, Record<string, number>> = {
      chatgpt: {},
      claude: {},
      gemini: {},
      perplexity: {},
    }
    const topCompetitorByPlatform: Record<
      string,
      { name: string; sov: number }
    > = {
      chatgpt: { name: '', sov: 0 },
      claude: { name: '', sov: 0 },
      gemini: { name: '', sov: 0 },
      perplexity: { name: '', sov: 0 },
    }

    // Group results by platform
    const platforms = ['chatgpt', 'claude', 'gemini'] as const
    for (const platform of platforms) {
      const platformResults = analysis.results.filter(
        (r: { platform: string }) => r.platform === platform
      )

      // Collect all competitors mentioned across all results for this platform
      const competitorMap = new Map<string, typeof platformResults>()

      for (const result of platformResults) {
        const competitorsMentioned = Array.isArray(result.competitorsMentioned)
          ? result.competitorsMentioned
          : []
        const competitorPositions =
          result.competitorPositions &&
          typeof result.competitorPositions === 'object'
            ? (result.competitorPositions as Record<string, number>)
            : {}

        for (const competitorName of competitorsMentioned) {
          // Filter out invalid competitor names
          if (!isValidCompetitorName(competitorName)) {
            continue
          }

          if (!competitorMap.has(competitorName)) {
            competitorMap.set(competitorName, [])
          }
          competitorMap.get(competitorName)!.push(result)
        }
      }

      // Calculate SOV for each competitor on this platform
      for (const [competitorName, competitorResults] of competitorMap) {
        // Create QueryResult-like objects for SOV calculation
        const queryResultsForCompetitor: QueryResult[] = platformResults.map(
          (result: any) => {
            const competitorsMentioned = Array.isArray(
              result.competitorsMentioned
            )
              ? result.competitorsMentioned
              : []
            const competitorPositions =
              result.competitorPositions &&
              typeof result.competitorPositions === 'object'
                ? (result.competitorPositions as Record<string, number>)
                : {}
            const isMentioned = competitorsMentioned.includes(competitorName)

            return {
              platform: result.platform as Platform,
              prompt: result.prompt,
              response: result.response,
              mentioned: isMentioned,
              position: isMentioned
                ? competitorPositions[competitorName] || undefined
                : undefined,
              sentiment: 'neutral' as const,
              sentimentScore: 0,
            }
          }
        )

        const competitorSov = calculateShareOfVoice(queryResultsForCompetitor)
        competitorSovByPlatform[platform][competitorName] = competitorSov

        // Track top competitor for this platform
        if (competitorSov > topCompetitorByPlatform[platform].sov) {
          topCompetitorByPlatform[platform] = {
            name: competitorName,
            sov: competitorSov,
          }
        }
      }
    }

    // Calculate visibility per platform
    const visibilityByPlatform = calculateVisibilityByPlatform(
      analysis.results,
      analysis.sovByPlatform as {
        chatgpt?: number
        claude?: number
        gemini?: number
        perplexity?: number
      }
    )

    // Extract region from config if available
    const config =
      analysis.config && typeof analysis.config === 'object'
        ? (analysis.config as { region?: string; targetRegions?: string[] })
        : {}
    const region =
      config.region || analysis.company.targetRegions?.[0] || 'global'

    // Return analysis with competitor data
    return NextResponse.json({
      ...analysis,
      visibilityByPlatform,
      competitorSovByPlatform,
      topCompetitorByPlatform,
      config: {
        ...config,
        region,
      },
    })
  } catch (error) {
    console.error('Get analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    )
  }
}
