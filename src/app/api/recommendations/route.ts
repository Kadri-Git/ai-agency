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

    // Calculate actual metrics from results
    const totalMentions = analysis.mentionCount
    const totalResults = analysis.results.length
    const mentionRate = analysis.mentionRate
    const avgPosition = analysis.averagePosition
    const totalMentioned = analysis.results.filter(r => r.mentioned).length
    
    // Calculate platform-specific metrics
    const platformStats = {
      chatgpt: { mentioned: 0, total: 0, avgPosition: 0 },
      claude: { mentioned: 0, total: 0, avgPosition: 0 },
      gemini: { mentioned: 0, total: 0, avgPosition: 0 },
      perplexity: { mentioned: 0, total: 0, avgPosition: 0 },
    }
    
    analysis.results.forEach(result => {
      const platformKey = result.platform as keyof typeof platformStats
      if (platformStats[platformKey]) {
        platformStats[platformKey].total++
        if (result.mentioned) {
          platformStats[platformKey].mentioned++
          if (result.position) {
            const stats = platformStats[platformKey]
            const prevMentioned = stats.mentioned - 1
            stats.avgPosition = prevMentioned > 0 
              ? (stats.avgPosition * prevMentioned + result.position) / stats.mentioned
              : result.position
          }
        }
      }
    })

    // Find weakest platform
    const platformSov = analysis.sovByPlatform as { chatgpt?: number; claude?: number; gemini?: number; perplexity?: number }
    const platforms = [
      { name: 'ChatGPT', sov: platformSov.chatgpt || 0, key: 'chatgpt' },
      { name: 'Claude', sov: platformSov.claude || 0, key: 'claude' },
      { name: 'Gemini', sov: platformSov.gemini || 0, key: 'gemini' },
      { name: 'Perplexity', sov: platformSov.perplexity || 0, key: 'perplexity' },
    ]
    const weakestPlatform = platforms.reduce((min, p) => p.sov < min.sov ? p : min, platforms[0])
    const strongestPlatform = platforms.reduce((max, p) => p.sov > max.sov ? p : max, platforms[0])

    // Recommendation 1: Low Share of Voice
    if (analysis.shareOfVoice < 20) {
      const estimatedGain = Math.min((20 - analysis.shareOfVoice) * 0.5, 12)
      recommendations.push({
        priority: 1,
        title: 'Increase Overall Share of Voice',
        impact: 'high',
        effort: 'medium',
        estimatedSovGain: estimatedGain,
        timeframe: '2-3 months',
        evidence: {
          currentMetric: `${analysis.shareOfVoice.toFixed(1)}% overall SOV`,
          benchmark: '20%+ SOV (competitive threshold)',
          gap: `${(20 - analysis.shareOfVoice).toFixed(1)} percentage points below threshold`,
        },
        actionSteps: [
          'Create comprehensive product comparison guides',
          'Optimize existing content with structured data markup',
          'Build authority through industry publication citations',
          'Develop topic clusters around high-volume queries',
          'Improve citation quality with expert quotes',
        ],
        businessJustification:
          'Your current Share of Voice is below the competitive threshold. Increasing SOV will significantly improve brand visibility and recommendation frequency across AI platforms.',
      })
    }

    // Recommendation 2: Weak Platform Performance
    if (weakestPlatform.sov < strongestPlatform.sov * 0.6 && weakestPlatform.sov < 15) {
      const platformGap = strongestPlatform.sov - weakestPlatform.sov
      recommendations.push({
        priority: recommendations.length + 1 as 1 | 2 | 3,
        title: `Improve Visibility on ${weakestPlatform.name}`,
        impact: 'high',
        effort: 'medium',
        estimatedSovGain: Math.min(platformGap * 0.4, 10),
        timeframe: '2-3 months',
        evidence: {
          currentMetric: `${weakestPlatform.sov.toFixed(1)}% SOV on ${weakestPlatform.name}`,
          benchmark: `${strongestPlatform.sov.toFixed(1)}% SOV on ${strongestPlatform.name} (your best platform)`,
          gap: `${platformGap.toFixed(1)} percentage points difference`,
        },
        actionSteps: [
          `Research ${weakestPlatform.name}-specific content preferences`,
          'Optimize content for platform-specific query patterns',
          'Increase citation frequency on this platform',
          'Build platform-specific authority signals',
          'Create content that aligns with platform algorithms',
        ],
        businessJustification:
          `Your visibility on ${weakestPlatform.name} is significantly lower than your best-performing platform. Improving this will increase overall market coverage and reach more users.`,
      })
    }

    // Recommendation 3: Source Diversity
    if (analysis.sourceDiversityScore < 7) {
      const diversityGap = 7.8 - analysis.sourceDiversityScore
      const estimatedGain = Math.min(diversityGap * 1.2, 10)
      recommendations.push({
        priority: recommendations.length + 1 as 1 | 2 | 3,
        title: 'Expand Source Diversity Across Platforms',
        impact: 'high',
        effort: 'low',
        estimatedSovGain: estimatedGain,
        timeframe: '1-2 months',
        evidence: {
          currentMetric: `Source diversity score: ${analysis.sourceDiversityScore.toFixed(1)}/10`,
          benchmark: '7.8/10 (industry average)',
          gap: `${diversityGap.toFixed(1)} points below average`,
        },
        actionSteps: [
          'Submit to 5 new industry directories',
          'Secure 3 guest post opportunities',
          'Create press releases for product launches',
          'Build relationships with industry publications',
          `Currently cited by ${analysis.totalUniqueSources} unique sources - target 15+`,
        ],
        businessJustification:
          'AI models favor diverse, authoritative sources. Increasing source diversity improves credibility and citation frequency, leading to more recommendations.',
      })
    }

    // Recommendation 4: Low Mention Rate
    if (mentionRate < 0.5 && totalResults > 0) {
      const mentionGap = 0.5 - mentionRate
      recommendations.push({
        priority: recommendations.length + 1 as 1 | 2 | 3,
        title: 'Improve Mention Rate in AI Responses',
        impact: 'high',
        effort: 'medium',
        estimatedSovGain: Math.min(mentionGap * 15, 12),
        timeframe: '2-3 months',
        evidence: {
          currentMetric: `${(mentionRate * 100).toFixed(1)}% mention rate (${totalMentioned}/${totalResults} queries)`,
          benchmark: '50%+ mention rate (competitive standard)',
          gap: `${(mentionGap * 100).toFixed(1)} percentage points below target`,
        },
        actionSteps: [
          'Optimize content for high-volume search queries',
          'Improve brand visibility in industry discussions',
          'Create content that answers common user questions',
          'Build topical authority in your industry',
          'Increase brand mentions in authoritative sources',
        ],
        businessJustification:
          'Your brand is mentioned in less than half of relevant queries. Improving mention rate will significantly increase overall visibility and recommendation opportunities.',
      })
    }

    // Recommendation 5: Sentiment
    const totalSentimentMentions = analysis.favorableMentions + analysis.neutralMentions + analysis.negativeMentions
    if (totalSentimentMentions > 0) {
      const favorableRate = (analysis.favorableMentions / totalSentimentMentions) * 100
      if (favorableRate < 75) {
        const sentimentGap = 82 - favorableRate
        recommendations.push({
          priority: recommendations.length + 1 as 1 | 2 | 3,
          title: 'Improve Sentiment in Product Recommendations',
          impact: 'medium',
          effort: 'high',
          estimatedSovGain: Math.min(sentimentGap * 0.3, 8),
          timeframe: '3-4 months',
          evidence: {
            currentMetric: `${favorableRate.toFixed(0)}% favorable sentiment (${analysis.favorableMentions} favorable, ${analysis.negativeMentions} negative)`,
            benchmark: '82% favorable (top performers)',
            gap: `${sentimentGap.toFixed(0)} percentage points below target`,
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
    }

    // Recommendation 6: Average Position
    if (avgPosition > 3 && totalMentioned > 0) {
      recommendations.push({
        priority: recommendations.length + 1 as 1 | 2 | 3,
        title: 'Improve Average Position in Recommendations',
        impact: 'medium',
        effort: 'medium',
        estimatedSovGain: Math.min((avgPosition - 2) * 2, 10),
        timeframe: '2-3 months',
        evidence: {
          currentMetric: `Average position: ${avgPosition.toFixed(1)} (when mentioned)`,
          benchmark: 'Position 1-2 (top recommendations)',
          gap: `${(avgPosition - 2).toFixed(1)} positions lower than ideal`,
        },
        actionSteps: [
          'Optimize content for first-position visibility',
          'Improve brand authority signals',
          'Increase citation quality and frequency',
          'Create more comprehensive, authoritative content',
          'Build stronger topical relevance',
        ],
        businessJustification:
          'When your brand is mentioned, it appears lower in the recommendation list. Improving position increases visibility and click-through rates.',
      })
    }

    // Sort recommendations by priority (impact and estimated gain)
    recommendations.sort((a, b) => {
      // First sort by impact (high > medium > low)
      const impactOrder = { high: 3, medium: 2, low: 1 }
      if (impactOrder[a.impact] !== impactOrder[b.impact]) {
        return impactOrder[b.impact] - impactOrder[a.impact]
      }
      // Then by estimated SOV gain
      return b.estimatedSovGain - a.estimatedSovGain
    })

    // Assign priorities 1, 2, 3 to top recommendations
    const topRecommendations = recommendations.slice(0, 3).map((rec, index) => ({
      ...rec,
      priority: (index + 1) as 1 | 2 | 3,
    }))

    // If we have fewer than 3, add a generic monitoring recommendation
    while (topRecommendations.length < 3) {
      topRecommendations.push({
        priority: (topRecommendations.length + 1) as 1 | 2 | 3,
        title: 'Continue Monitoring and Optimization',
        impact: 'low' as const,
        effort: 'low' as const,
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

    return NextResponse.json(topRecommendations)
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}


