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
    const companyName = analysis.company.name
    const companyIndustry = analysis.company.industry || 'your industry'
    
    // Calculate actual metrics from results
    const totalMentions = analysis.mentionCount
    const totalResults = analysis.results.length
    const mentionRate = analysis.mentionRate
    const avgPosition = analysis.averagePosition
    const totalMentioned = analysis.results.filter((r: { mentioned: boolean }) => r.mentioned).length
    
    // Analyze actual query results to understand what was asked and how the company was mentioned
    const mentionedResults = analysis.results.filter((r: { mentioned: boolean }) => r.mentioned)
    const notMentionedResults = analysis.results.filter((r: { mentioned: boolean }) => !r.mentioned)
    
    // Extract actual prompts that didn't mention the company
    const promptsWithoutMention = notMentionedResults.map((r: { prompt: string }) => r.prompt).slice(0, 3)
    
    // Analyze sentiment breakdown for specific recommendations
    const sentimentBreakdown = {
      favorable: analysis.favorableMentions,
      neutral: analysis.neutralMentions,
      negative: analysis.negativeMentions,
    }
    
    // Calculate platform-specific metrics
    const platformStats = {
      chatgpt: { mentioned: 0, total: 0, avgPosition: 0 },
      claude: { mentioned: 0, total: 0, avgPosition: 0 },
      gemini: { mentioned: 0, total: 0, avgPosition: 0 },
      perplexity: { mentioned: 0, total: 0, avgPosition: 0 },
    }
    
    analysis.results.forEach((result: { platform: string; mentioned: boolean; position: number | null }) => {
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
        title: `Increase ${companyName}'s Overall Share of Voice`,
        impact: 'high',
        effort: 'medium',
        estimatedSovGain: estimatedGain,
        timeframe: '2-3 months',
        evidence: {
          currentMetric: `${companyName}'s overall SOV: ${analysis.shareOfVoice.toFixed(1)}%`,
          benchmark: '20%+ SOV (competitive threshold)',
          gap: `${(20 - analysis.shareOfVoice).toFixed(1)} percentage points below threshold`,
        },
        actionSteps: [
          ...(companyIndustry !== 'your industry' ? [
            `Create ${companyIndustry}-specific comparison content where ${companyName} is featured alongside competitors`,
            `Publish ${companyIndustry} industry guides and resources that position ${companyName} as a thought leader`,
          ] : [
            `Create industry-specific comparison content where ${companyName} is featured alongside competitors`,
            `Publish industry guides and resources that position ${companyName} as a thought leader`,
          ]),
          ...(mentionedResults.length > 0 ? [
            `Analyze the ${mentionedResults.length} queries where ${companyName} was mentioned to identify successful content patterns`,
            `Replicate successful mention patterns across ${totalResults - mentionedResults.length} queries where ${companyName} wasn't mentioned`,
          ] : [
            `Analyze why ${companyName} wasn't mentioned in any of the ${totalResults} queries tested`,
            `Create content that directly addresses the query types tested: ${promptsWithoutMention.slice(0, 2).join(', ')}`,
          ]),
          `Build authoritative backlinks from ${companyIndustry} industry publications and directories`,
          `Optimize existing ${companyName} content with structured data (JSON-LD) to improve AI discoverability`,
        ].filter(Boolean),
        businessJustification:
          `${companyName}'s current Share of Voice is below the competitive threshold. Increasing ${companyName}'s SOV will significantly improve brand visibility and recommendation frequency across AI platforms.`,
      })
    }

    // Recommendation 2: Weak Platform Performance
    if (weakestPlatform.sov < strongestPlatform.sov * 0.6 && weakestPlatform.sov < 15) {
      const platformGap = strongestPlatform.sov - weakestPlatform.sov
      recommendations.push({
        priority: recommendations.length + 1 as 1 | 2 | 3,
        title: `Improve ${companyName}'s Visibility on ${weakestPlatform.name}`,
        impact: 'high',
        effort: 'medium',
        estimatedSovGain: Math.min(platformGap * 0.4, 10),
        timeframe: '2-3 months',
        evidence: {
          currentMetric: `${companyName}'s SOV on ${weakestPlatform.name}: ${weakestPlatform.sov.toFixed(1)}%`,
          benchmark: `${companyName}'s best platform: ${strongestPlatform.sov.toFixed(1)}% SOV on ${strongestPlatform.name}`,
          gap: `${platformGap.toFixed(1)} percentage points difference`,
        },
        actionSteps: [
          `Research ${weakestPlatform.name}-specific content preferences for ${companyName}'s industry`,
          `Optimize ${companyName}'s content for ${weakestPlatform.name}-specific query patterns`,
          `Increase ${companyName}'s citation frequency on ${weakestPlatform.name}`,
          `Build ${companyName}'s platform-specific authority signals for ${weakestPlatform.name}`,
          `Create ${companyName} content that aligns with ${weakestPlatform.name} algorithms`,
        ],
        businessJustification:
          `${companyName}'s visibility on ${weakestPlatform.name} is significantly lower than ${companyName}'s best-performing platform. Improving ${companyName}'s presence on ${weakestPlatform.name} will increase overall market coverage and reach more users.`,
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
          ...(companyIndustry !== 'your industry' ? [
            `Submit ${companyName} to ${companyIndustry}-specific directories and listings`,
            `Secure guest post opportunities on ${companyIndustry} industry blogs and publications`,
          ] : [
            `Submit ${companyName} to industry-specific directories and listings`,
            `Secure guest post opportunities on industry blogs and publications`,
          ]),
          `Create press releases and news content about ${companyName} for industry publications`,
          `Build relationships with ${companyIndustry} industry publications and journalists`,
          `Currently cited by ${analysis.totalUniqueSources} unique sources - target 15+ unique authoritative sources`,
          ...(analysis.totalUniqueSources < 5 ? [
            `Focus on getting ${companyName} mentioned in at least 5-10 new authoritative sources in the next month`,
          ] : []),
        ].filter(Boolean),
        businessJustification:
          'AI models favor diverse, authoritative sources. Increasing source diversity improves credibility and citation frequency, leading to more recommendations.',
      })
    }

    // Recommendation 4: Low Mention Rate
    if (mentionRate < 0.5 && totalResults > 0) {
      const mentionGap = 0.5 - mentionRate
      recommendations.push({
        priority: recommendations.length + 1 as 1 | 2 | 3,
        title: `Improve ${companyName}'s Mention Rate in AI Responses`,
        impact: 'high',
        effort: 'medium',
        estimatedSovGain: Math.min(mentionGap * 15, 12),
        timeframe: '2-3 months',
        evidence: {
          currentMetric: `${companyName}'s mention rate: ${(mentionRate * 100).toFixed(1)}% (${totalMentioned}/${totalResults} queries)`,
          benchmark: '50%+ mention rate (competitive standard)',
          gap: `${(mentionGap * 100).toFixed(1)} percentage points below target`,
        },
        actionSteps: [
          ...(promptsWithoutMention.length > 0 ? [
            `Create content specifically addressing queries where ${companyName} wasn't mentioned: "${promptsWithoutMention[0]?.substring(0, 80)}..."`,
            ...(promptsWithoutMention.length > 1 ? [
              `Address query patterns like: "${promptsWithoutMention[1]?.substring(0, 60)}..."`,
            ] : []),
          ] : [
            `Analyze the ${totalResults} queries tested to identify content gaps for ${companyName}`,
          ]),
          ...(companyIndustry !== 'your industry' ? [
            `Build ${companyName}'s authority in ${companyIndustry} through expert content and industry participation`,
            `Create ${companyIndustry}-focused content that answers questions users ask about ${companyName}'s services`,
          ] : [
            `Build ${companyName}'s industry authority through expert content and industry participation`,
            `Create content that answers questions users ask about ${companyName}'s services`,
          ]),
          `Increase ${companyName} brand mentions in authoritative ${companyIndustry} sources`,
        ].filter(Boolean),
        businessJustification:
          `${companyName} is mentioned in less than half of relevant queries. Improving ${companyName}'s mention rate will significantly increase overall visibility and recommendation opportunities.`,
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
            ...(sentimentBreakdown.negative > 0 ? [
              `Address the ${sentimentBreakdown.negative} negative mention(s) by creating content that counters negative themes`,
              `Monitor and respond to negative sentiment about ${companyName} in ${companyIndustry} discussions`,
            ] : []),
            `Conduct ${companyName} customer satisfaction research to identify improvement areas`,
            `Create ${companyName} case studies and success stories showcasing positive outcomes`,
            `Highlight ${companyName}'s unique value propositions in ${companyIndustry} more clearly in all content`,
            `Improve ${companyName} product/service descriptions with benefit-focused language that emphasizes positive outcomes`,
            ...(mentionedResults.length > 0 ? [
              `Analyze the ${sentimentBreakdown.favorable} favorable mentions to understand what makes ${companyName} stand out positively`,
            ] : []),
          ].filter(Boolean),
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
          ...(mentionedResults.length > 0 ? [
            `Analyze the ${mentionedResults.filter((r: { position?: number | null }) => r.position !== null && r.position !== undefined && r.position <= 2).length} mentions where ${companyName} appeared in positions 1-2 to replicate successful patterns`,
            `Improve content for the ${mentionedResults.filter((r: { position?: number | null }) => r.position !== null && r.position !== undefined && r.position > 3).length} mentions where ${companyName} appeared in position ${avgPosition.toFixed(0)}+`,
          ] : []),
          ...(companyIndustry !== 'your industry' ? [
            `Build ${companyName}'s authority in ${companyIndustry} through expert content, industry awards, and thought leadership`,
            `Create comprehensive ${companyIndustry} content that positions ${companyName} as the top choice`,
          ] : [
            `Build ${companyName}'s industry authority through expert content, industry awards, and thought leadership`,
            `Create comprehensive content that positions ${companyName} as the top choice`,
          ]),
          `Increase high-quality citations from authoritative ${companyIndustry} sources`,
          `Optimize ${companyName} content to directly answer the specific queries tested in this analysis`,
        ].filter(Boolean),
        businessJustification:
          'When your brand is mentioned, it appears lower in the recommendation list. Improving position increases visibility and click-through rates.',
      })
    }

    // Recommendation 7: Website Visibility for LLMs (ALWAYS generate if website analysis exists)
    // This recommendation is generated for ALL companies with website analysis data
    const websiteAnalysis = analysis.websiteAnalysis as {
      overallVisibilityScore?: number
      issues?: string[]
      recommendations?: string[]
      hasStructuredData?: boolean
      hasMetaDescription?: boolean
      hasOpenGraphTags?: boolean
      hasSitemap?: boolean
      hasGoogleSearchConsole?: boolean
      semanticHTMLScore?: number
      contentQualityScore?: number
      accessibilityScore?: number
    } | null

    // Only generate website recommendation if there are actual issues to fix
    // Don't generate if website is already well-optimized (score >= 85) or if no issues exist
    const hasWebsiteIssues = websiteAnalysis && (
      websiteAnalysis.overallVisibilityScore === undefined || 
      websiteAnalysis.overallVisibilityScore === null ||
      websiteAnalysis.overallVisibilityScore < 85 ||
      (websiteAnalysis.issues && websiteAnalysis.issues.length > 0) ||
      !websiteAnalysis.hasStructuredData ||
      !websiteAnalysis.hasMetaDescription ||
      !websiteAnalysis.hasOpenGraphTags ||
      !websiteAnalysis.hasSitemap ||
      (websiteAnalysis.semanticHTMLScore !== undefined && websiteAnalysis.semanticHTMLScore < 50) ||
      (websiteAnalysis.contentQualityScore !== undefined && websiteAnalysis.contentQualityScore < 50) ||
      (websiteAnalysis.accessibilityScore !== undefined && websiteAnalysis.accessibilityScore < 50)
    )
    
    if (hasWebsiteIssues && websiteAnalysis && websiteAnalysis.overallVisibilityScore !== undefined && websiteAnalysis.overallVisibilityScore !== null) {
      const websiteScore = websiteAnalysis.overallVisibilityScore
      const scoreGap = Math.max(0, 70 - websiteScore)
      const websiteIssues = websiteAnalysis.issues || []
      const websiteRecs = websiteAnalysis.recommendations || []
      
      // Build company-specific action steps
      const actionSteps: string[] = []
      
      if (!websiteAnalysis.hasStructuredData) {
        actionSteps.push(`Add JSON-LD structured data to ${companyName}'s website using Schema.org vocabulary (Organization, WebSite, WebPage)`)
      }
      if (!websiteAnalysis.hasMetaDescription) {
        actionSteps.push(`Add meta description tags to all pages on ${companyName}'s website for better search visibility`)
      }
      if (!websiteAnalysis.hasOpenGraphTags) {
        actionSteps.push(`Add Open Graph tags (og:title, og:description, og:image) to ${companyName}'s homepage and key pages`)
      }
      if (!websiteAnalysis.hasSitemap) {
        actionSteps.push(`Create and submit sitemap.xml for ${companyName}'s website to help AI crawlers discover all pages`)
      }
      
      // Add specific recommendations from website analysis
      // Filter out sitemap-related recommendations since we handle those above
      const filteredRecs = websiteRecs.filter(rec => 
        !rec.toLowerCase().includes('sitemap') && 
        !rec.toLowerCase().includes('submit sitemap')
      )
      if (filteredRecs.length > 0) {
        actionSteps.push(...filteredRecs.slice(0, 3).map(rec => `${companyName}: ${rec}`))
      }
      
      // Add quality improvements if scores are low
      if (websiteAnalysis.semanticHTMLScore !== undefined && websiteAnalysis.semanticHTMLScore < 50) {
        actionSteps.push(`Improve semantic HTML structure on ${companyName}'s website (use proper heading hierarchy, semantic tags like <header>, <nav>, <main>, <article>)`)
      }
      if (websiteAnalysis.contentQualityScore !== undefined && websiteAnalysis.contentQualityScore < 50) {
        actionSteps.push(`Enhance content quality on ${companyName}'s website (add more descriptive text, improve headings, add alt text to images)`)
      }
      if (websiteAnalysis.accessibilityScore !== undefined && websiteAnalysis.accessibilityScore < 50) {
        actionSteps.push(`Improve accessibility on ${companyName}'s website (add ARIA labels, ensure proper contrast, add skip links)`)
      }
      
      // Only recommend Google Search Console if not already verified
      if (!websiteAnalysis.hasGoogleSearchConsole) {
        if (websiteAnalysis.hasSitemap) {
          // Sitemap exists but Search Console not verified - recommend adding to Search Console
          actionSteps.push(`Add ${companyName}'s website to Google Search Console and submit the existing sitemap for better indexing`)
        } else {
          // No sitemap and no Search Console - recommend both
          actionSteps.push(`Add ${companyName}'s website to Google Search Console for better indexing`)
        }
      }
      // If Search Console is verified, we assume sitemap is already submitted if it exists
      // No need to recommend submitting it again
      
      // Determine impact and effort based on score
      let impact: 'high' | 'medium' | 'low' = 'medium'
      let effort: 'high' | 'medium' | 'low' = 'medium'
      
      if (websiteScore < 50) {
        impact = 'high'
        effort = 'high'
      } else if (websiteScore < 70) {
        impact = 'high'
        effort = 'medium'
      } else if (websiteScore < 85) {
        impact = 'medium'
        effort = 'low'
      } else {
        impact = 'low'
        effort = 'low'
      }
      
      recommendations.push({
        priority: recommendations.length + 1 as 1 | 2 | 3,
        title: websiteScore < 70 
          ? `Improve ${companyName}'s Website Visibility for LLMs`
          : `Optimize ${companyName}'s Website for Better LLM Discovery`,
        impact,
        effort,
        estimatedSovGain: websiteScore < 70 ? Math.min(scoreGap * 0.3, 15) : Math.min((100 - websiteScore) * 0.1, 5),
        timeframe: websiteScore < 40 ? '3-4 months' : websiteScore < 70 ? '1-2 months' : '2-4 weeks',
        evidence: {
          currentMetric: `${companyName}'s website visibility score: ${websiteScore.toFixed(0)}/100`,
          benchmark: '70+/100 (good LLM visibility)',
          gap: websiteScore < 70 
            ? `${scoreGap.toFixed(0)} points below target`
            : `${(100 - websiteScore).toFixed(0)} points to perfect score`,
        },
        actionSteps: actionSteps.length > 0 ? actionSteps.slice(0, 7) : [], // Only include if there are actual steps
        businessJustification: websiteScore < 70
          ? `${companyName}'s website needs optimization for LLM discovery. LLMs rely on structured data and well-optimized websites to understand and recommend brands. Improving ${companyName}'s website visibility will directly increase the likelihood of being mentioned in AI responses.`
          : `${companyName}'s website is well-optimized, but further improvements can enhance LLM understanding and recommendation frequency. Small optimizations can still provide incremental gains in AI visibility.`,
      })
    }

    // Sort recommendations by priority (impact and estimated gain)
    // ALWAYS prioritize website recommendations for ALL companies (they're critical for LLM visibility)
    const websiteRecIndex = recommendations.findIndex(rec => 
      rec.title.includes("Website Visibility") || rec.title.includes("Website for Better")
    )
    const hasWebsiteRec = websiteRecIndex >= 0
    const hasLowWebsiteScore = hasWebsiteRec && 
      websiteAnalysis && 
      websiteAnalysis.overallVisibilityScore !== undefined && 
      websiteAnalysis.overallVisibilityScore < 70

    recommendations.sort((a, b) => {
      // ALWAYS prioritize website recommendations for ALL companies (they apply to every website analyzed)
      const aIsWebsite = a.title.includes("Website Visibility") || a.title.includes("Website for Better")
      const bIsWebsite = b.title.includes("Website Visibility") || b.title.includes("Website for Better")
      
      // Website recommendations get priority, especially if score < 70
      if (aIsWebsite && !bIsWebsite) {
        return hasLowWebsiteScore ? -2 : -1 // Extra priority if score is low
      }
      if (!aIsWebsite && bIsWebsite) {
        return hasLowWebsiteScore ? 2 : 1 // Extra priority if score is low
      }
      
      // If both are website or both are not, sort by impact and gain
      // First sort by impact (high > medium > low)
      const impactOrder = { high: 3, medium: 2, low: 1 }
      if (impactOrder[a.impact] !== impactOrder[b.impact]) {
        return impactOrder[b.impact] - impactOrder[a.impact]
      }
      // Then by estimated SOV gain
      return b.estimatedSovGain - a.estimatedSovGain
    })

    // Assign priorities 1, 2, 3 to top recommendations
    // Ensure website recommendation is ALWAYS in top 3 for ALL companies (if it exists)
    let topRecommendations = recommendations.slice(0, 3).map((rec, index) => ({
      ...rec,
      priority: (index + 1) as 1 | 2 | 3,
    }))

    // If website recommendation exists but isn't in top 3, ensure it's included
    if (hasWebsiteRec && websiteRecIndex >= 0) {
      const websiteRec = recommendations[websiteRecIndex]
      const isInTop3 = topRecommendations.some(rec => 
        rec.title === websiteRec.title
      )
      
      if (!isInTop3 && topRecommendations.length >= 3) {
        // Replace the lowest priority recommendation with website recommendation
        topRecommendations[2] = {
          ...websiteRec,
          priority: 3 as 1 | 2 | 3,
        }
      } else if (!isInTop3 && topRecommendations.length < 3) {
        // Add website recommendation if we have fewer than 3
        topRecommendations.push({
          ...websiteRec,
          priority: (topRecommendations.length + 1) as 1 | 2 | 3,
        })
      }
    }

    // Only return recommendations that are actually relevant - no generic fallbacks
    // Return top 3 if we have them, otherwise return what we have
    return NextResponse.json(topRecommendations.slice(0, 3))
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}


