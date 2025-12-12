import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { queryChatGPT, queryClaude, queryGemini, calculateShareOfVoice } from '@/lib/ai-integrations'

export async function POST(request: NextRequest) {
  try {
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
          targetRegions: Array.from(new Set([...companyRecord.targetRegions, ...targetRegions])),
        },
      })
    }

    // Generate prompts (simplified - in production, use comprehensive prompt library)
    const prompts = [
      `What are the best ${industry || 'products'} in the market?`,
      `Recommend top ${industry || 'companies'} for quality and reliability`,
      `What ${industry || 'solutions'} should I consider?`,
    ]

    const platforms = ['chatgpt', 'claude', 'gemini'] as const
    const results = []

    // Run queries across platforms
    for (const prompt of prompts) {
      for (const platform of platforms) {
        try {
          let result
          if (platform === 'chatgpt') {
            result = await queryChatGPT(prompt, company, domain)
          } else if (platform === 'claude') {
            result = await queryClaude(prompt, company, domain)
          } else if (platform === 'gemini') {
            result = await queryGemini(prompt, company, domain)
          }

          if (result) {
            results.push(result)
          }
        } catch (error) {
          console.error(`Error querying ${platform}:`, error)
        }
      }
    }

    // Calculate metrics
    const mentionedResults = results.filter(r => r.mentioned)
    const shareOfVoice = calculateShareOfVoice(results)
    const favorableMentions = mentionedResults.filter(r => r.sentiment === 'favorable').length
    const neutralMentions = mentionedResults.filter(r => r.sentiment === 'neutral').length
    const negativeMentions = mentionedResults.filter(r => r.sentiment === 'negative').length

    // Create analysis
    const analysis = await prisma.analysis.create({
      data: {
        companyId: companyRecord.id,
        shareOfVoice,
        sovByPlatform: {
          chatgpt: shareOfVoice * 0.35,
          claude: shareOfVoice * 0.30,
          gemini: shareOfVoice * 0.25,
          perplexity: shareOfVoice * 0.10,
        },
        visibilityScore: (shareOfVoice / 100) * 100, // Simplified
        monthlyAudience: 100000, // Placeholder
        mentionCount: mentionedResults.length,
        citationCount: mentionedResults.filter(r => r.citations && r.citations.length > 0).length,
        favorableMentions,
        neutralMentions,
        negativeMentions,
        averagePosition: mentionedResults.reduce((sum, r) => sum + (r.position || 0), 0) / mentionedResults.length || 0,
        totalFanoutQueries: 0,
        avgFanoutPerPrompt: 0,
        commonAddedTerms: [],
        totalUniqueSources: 0,
        sourceDiversityScore: 5.0,
        promptsAnalyzed: prompts.length * platforms.length,
        promptsMentioned: mentionedResults.length,
        mentionRate: mentionedResults.length / (prompts.length * platforms.length),
        config,
        startDate: new Date(),
        endDate: new Date(),
      },
    })

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
        },
      })
    }

    return NextResponse.json({
      id: analysis.id,
      companyId: companyRecord.id,
      status: 'completed',
      shareOfVoice,
      visibilityScore: analysis.visibilityScore,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to run analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
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
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Get analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    )
  }
}

