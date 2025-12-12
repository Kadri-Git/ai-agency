import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Recommendation } from '@/components/dashboard/RecommendationsSection'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysisId')

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      )
    }

    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
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

    // Generate recommendations based on analysis data
    const recommendations: Recommendation[] = []

    // Recommendation 1: SOV Gap
    const topCompetitorSov = 28.5 // This would come from competitor analysis
    const sovGap = topCompetitorSov - analysis.shareOfVoice
    if (sovGap > 5) {
      recommendations.push({
        priority: 1,
        title: 'Optimize Content for High-Volume Queries',
        impact: 'high',
        effort: 'medium',
        estimatedSovGain: Math.min(sovGap * 0.4, 15),
        timeframe: '2-3 months',
        evidence: {
          currentMetric: `${analysis.shareOfVoice.toFixed(1)}% SOV`,
          benchmark: `${topCompetitorSov}% SOV (top competitor)`,
          gap: `${sovGap.toFixed(1)} percentage points`,
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
      })
    }

    // Recommendation 2: Source Diversity
    if (analysis.sourceDiversityScore < 7) {
      recommendations.push({
        priority: recommendations.length + 1 as 1 | 2 | 3,
        title: 'Expand Source Diversity Across Platforms',
        impact: 'high',
        effort: 'low',
        estimatedSovGain: 8.3,
        timeframe: '1-2 months',
        evidence: {
          currentMetric: `Source diversity score: ${analysis.sourceDiversityScore.toFixed(1)}/10`,
          benchmark: '7.8/10 (industry average)',
          gap: `${(7.8 - analysis.sourceDiversityScore).toFixed(1)} points below average`,
        },
        actionSteps: [
          'Submit to 5 new industry directories',
          'Secure 3 guest post opportunities',
          'Create press releases for product launches',
          'Build relationships with industry publications',
        ],
        businessJustification:
          'AI models favor diverse, authoritative sources. Increasing source diversity improves credibility and citation frequency.',
      })
    }

    // Recommendation 3: Sentiment
    const favorableRate = analysis.favorableMentions / (analysis.favorableMentions + analysis.neutralMentions + analysis.negativeMentions) * 100
    if (favorableRate < 75) {
      recommendations.push({
        priority: recommendations.length + 1 as 1 | 2 | 3,
        title: 'Improve Sentiment in Product Recommendations',
        impact: 'medium',
        effort: 'high',
        estimatedSovGain: 5.7,
        timeframe: '3-4 months',
        evidence: {
          currentMetric: `${favorableRate.toFixed(0)}% favorable sentiment`,
          benchmark: '82% favorable (top performers)',
          gap: `${(82 - favorableRate).toFixed(0)} percentage points`,
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
      })
    }

    // Ensure we have exactly 3 recommendations
    while (recommendations.length < 3) {
      recommendations.push({
        priority: recommendations.length + 1 as 1 | 2 | 3,
        title: 'Continue Monitoring and Optimization',
        impact: 'low',
        effort: 'low',
        estimatedSovGain: 2.0,
        timeframe: 'Ongoing',
        evidence: {
          currentMetric: 'Baseline established',
          benchmark: 'Industry standards',
          gap: 'Maintain current performance',
        },
        actionSteps: [
          'Continue tracking metrics weekly',
          'Review competitor strategies monthly',
          'Update content based on query trends',
        ],
        businessJustification:
          'Consistent monitoring ensures you maintain visibility gains and identify new opportunities early.',
      })
    }

    return NextResponse.json(recommendations.slice(0, 3))
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

