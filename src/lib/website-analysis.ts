/**
 * Website Analysis Module
 * Analyzes company websites for LLM visibility and crawlability
 */

export interface WebsiteAnalysis {
  url: string
  isAccessible: boolean
  hasStructuredData: boolean
  structuredDataTypes: string[]
  hasMetaDescription: boolean
  hasOpenGraphTags: boolean
  hasTwitterCards: boolean
  semanticHTMLScore: number // 0-100
  contentQualityScore: number // 0-100
  hasSitemap: boolean
  sitemapUrl?: string
  hasRobotsTxt: boolean
  robotsTxtAllowsCrawling: boolean
  pageLoadSpeed: number // milliseconds
  mobileFriendly: boolean
  accessibilityScore: number // 0-100
  hasGoogleSearchConsole: boolean // Detected via verification meta tag or file
  overallVisibilityScore: number // 0-100
  issues: string[]
  recommendations: string[]
}

/**
 * Analyze a website for LLM visibility
 */
export async function analyzeWebsite(domain: string): Promise<WebsiteAnalysis> {
  const url = domain.startsWith('http') ? domain : `https://${domain}`
  const issues: string[] = []
  const recommendations: string[] = []
  
  try {
    // Fetch the homepage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Visibility-Bot/1.0; +https://ai-visibility.com/bot)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      issues.push(`Website returned status code ${response.status}`)
      return createDefaultAnalysis(url, false, issues, recommendations)
    }

    const html = await response.text()
    const startTime = Date.now()
    const pageLoadSpeed = Date.now() - startTime

    // Analyze structured data
    const structuredData = extractStructuredData(html)
    const hasStructuredData = structuredData.length > 0
    const structuredDataTypes = structuredData.map(sd => sd.type)

    if (!hasStructuredData) {
      issues.push('No structured data (JSON-LD) found')
      recommendations.push('Add JSON-LD structured data using Schema.org vocabulary')
    }

    // Check for meta description
    const hasMetaDescription = /<meta\s+name=["']description["']/i.test(html)
    if (!hasMetaDescription) {
      issues.push('Missing meta description tag')
      recommendations.push('Add a meta description tag for better search visibility')
    }

    // Check for Open Graph tags
    const hasOpenGraphTags = /<meta\s+property=["']og:/i.test(html)
    if (!hasOpenGraphTags) {
      issues.push('Missing Open Graph tags')
      recommendations.push('Add Open Graph tags (og:title, og:description, og:image) for better social and AI visibility')
    }

    // Check for Twitter Cards
    const hasTwitterCards = /<meta\s+name=["']twitter:/i.test(html)
    if (!hasTwitterCards) {
      recommendations.push('Add Twitter Card meta tags for better social visibility')
    }

    // Analyze semantic HTML
    const semanticHTMLScore = analyzeSemanticHTML(html)

    // Analyze content quality
    const contentQualityScore = analyzeContentQuality(html)

    // Check for sitemap
    const sitemapInfo = await checkSitemap(url)
    const hasSitemap = sitemapInfo.exists

    if (!hasSitemap) {
      issues.push('No sitemap.xml found')
      recommendations.push('Create and submit a sitemap.xml to help search engines and AI crawlers discover your pages')
    }

    // Check for robots.txt
    const robotsInfo = await checkRobotsTxt(url)
    const hasRobotsTxt = robotsInfo.exists
    const robotsTxtAllowsCrawling = robotsInfo.allowsCrawling

    if (!robotsTxtAllowsCrawling && hasRobotsTxt) {
      issues.push('robots.txt may be blocking crawlers')
      recommendations.push('Review robots.txt to ensure it allows AI crawlers and search engines')
    }

    // Check for Google Search Console verification
    const hasGoogleSearchConsole = await checkGoogleSearchConsole(url, html)

    // Basic mobile friendliness check (simplified)
    const mobileFriendly = /<meta\s+name=["']viewport["']/i.test(html)

    if (!mobileFriendly) {
      issues.push('Missing viewport meta tag for mobile responsiveness')
      recommendations.push('Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">')
    }

    // Accessibility score (simplified)
    const accessibilityScore = analyzeAccessibility(html)

    // Calculate overall visibility score
    const overallVisibilityScore = calculateVisibilityScore({
      hasStructuredData,
      hasMetaDescription,
      hasOpenGraphTags,
      semanticHTMLScore,
      contentQualityScore,
      hasSitemap,
      robotsTxtAllowsCrawling,
      mobileFriendly,
      accessibilityScore,
      pageLoadSpeed,
    })

    return {
      url,
      isAccessible: true,
      hasStructuredData,
      structuredDataTypes,
      hasMetaDescription,
      hasOpenGraphTags,
      hasTwitterCards,
      semanticHTMLScore,
      contentQualityScore,
      hasSitemap,
      sitemapUrl: sitemapInfo.url,
      hasRobotsTxt,
      robotsTxtAllowsCrawling,
      pageLoadSpeed,
      mobileFriendly,
      accessibilityScore,
      hasGoogleSearchConsole,
      overallVisibilityScore,
      issues,
      recommendations,
    }
  } catch (error) {
    console.error('Website analysis error:', error)
    issues.push(`Failed to analyze website: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return createDefaultAnalysis(url, false, issues, recommendations)
  }
}

/**
 * Extract structured data from HTML
 */
function extractStructuredData(html: string): Array<{ type: string; data: unknown }> {
  const structuredData: Array<{ type: string; data: unknown }> = []

  // Extract JSON-LD scripts
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  if (jsonLdMatches) {
    for (const match of jsonLdMatches) {
      try {
        const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '')
        const data = JSON.parse(jsonContent)
        
        // Determine type
        let type = 'Unknown'
        if (Array.isArray(data)) {
          type = data[0]?.['@type'] || 'Array'
        } else if (data['@type']) {
          type = data['@type']
        } else if (data['@context']) {
          type = 'Schema.org'
        }
        
        structuredData.push({ type, data })
      } catch (e) {
        // Invalid JSON, skip
      }
    }
  }

  // Check for microdata
  if (html.includes('itemscope') || html.includes('itemtype')) {
    structuredData.push({ type: 'Microdata', data: {} })
  }

  // Check for RDFa
  if (html.includes('typeof') || html.includes('property')) {
    structuredData.push({ type: 'RDFa', data: {} })
  }

  return structuredData
}

/**
 * Analyze semantic HTML usage
 */
function analyzeSemanticHTML(html: string): number {
  let score = 0
  const semanticElements = [
    'header', 'nav', 'main', 'article', 'section', 'aside', 'footer',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'figure', 'figcaption', 'time', 'mark', 'address'
  ]

  for (const element of semanticElements) {
    if (new RegExp(`<${element}[\\s>]`, 'i').test(html)) {
      score += 5
    }
  }

  // Check for proper heading hierarchy
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length
  if (h1Count === 1) score += 10
  else if (h1Count > 1) score -= 5

  return Math.min(100, score)
}

/**
 * Analyze content quality
 */
function analyzeContentQuality(html: string): number {
  let score = 0

  // Remove script and style tags for content analysis
  const contentOnly = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .trim()

  const wordCount = contentOnly.split(/\s+/).filter(w => w.length > 0).length

  // Content length scoring
  if (wordCount > 1000) score += 30
  else if (wordCount > 500) score += 20
  else if (wordCount > 200) score += 10

  // Check for headings
  const headingCount = (html.match(/<h[1-6][^>]*>/gi) || []).length
  if (headingCount >= 3) score += 20
  else if (headingCount >= 1) score += 10

  // Check for images with alt text
  const images = html.match(/<img[^>]*>/gi) || []
  const imagesWithAlt = images.filter(img => /alt=["'][^"']+["']/i.test(img)).length
  if (images.length > 0) {
    const altTextRatio = imagesWithAlt / images.length
    score += altTextRatio * 20
  }

  // Check for links
  const links = (html.match(/<a[^>]*href=["'][^"']+["'][^>]*>/gi) || []).length
  if (links > 5) score += 10
  else if (links > 0) score += 5

  return Math.min(100, score)
}

/**
 * Check for sitemap
 */
async function checkSitemap(baseUrl: string): Promise<{ exists: boolean; url?: string }> {
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap1.xml`,
  ]

  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await fetch(sitemapUrl, {
        signal: AbortSignal.timeout(5000),
      })
      if (response.ok) {
        return { exists: true, url: sitemapUrl }
      }
    } catch (e) {
      // Continue to next URL
    }
  }

  return { exists: false }
}

/**
 * Check robots.txt
 */
async function checkRobotsTxt(baseUrl: string): Promise<{ exists: boolean; allowsCrawling: boolean }> {
  try {
    const robotsUrl = `${baseUrl}/robots.txt`
    const response = await fetch(robotsUrl, {
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      const content = await response.text()
      const hasDisallowAll = /User-agent:\s*\*\s*Disallow:\s*\/\s*$/m.test(content)
      return { exists: true, allowsCrawling: !hasDisallowAll }
    }
  } catch (e) {
    // robots.txt doesn't exist or is inaccessible
  }

  return { exists: false, allowsCrawling: true } // Default: allow crawling if no robots.txt
}

/**
 * Check for Google Search Console verification
 * Detects verification via meta tags, HTML files, Google Tag Manager, and Google Analytics
 */
async function checkGoogleSearchConsole(baseUrl: string, html: string): Promise<boolean> {
  // Check for Google Search Console verification meta tag
  // Common patterns: google-site-verification, google-site-verification-code
  const metaTagPatterns = [
    /<meta\s+name=["']google-site-verification["'][^>]*>/i,
    /<meta\s+name=["']google-site-verification-code["'][^>]*>/i,
    /<meta\s+content=["'][^"']*["']\s+name=["']google-site-verification["'][^>]*>/i,
  ]
  
  const hasMetaTag = metaTagPatterns.some(pattern => pattern.test(html))
  if (hasMetaTag) {
    return true
  }

  // Check for Google Tag Manager - if GTM is present, site is likely verified in Search Console
  // GTM is commonly used alongside Search Console
  const hasGTM = /googletagmanager\.com/i.test(html) || /GTM-[A-Z0-9]+/i.test(html)
  if (hasGTM) {
    return true
  }

  // Check for Google Analytics - if GA is present, site is likely verified in Search Console
  // GA is commonly linked with Search Console
  const hasGA = /google-analytics\.com/i.test(html) || /ga\(['"]/i.test(html) || /gtag\(['"]/i.test(html) || /UA-\d+-\d+/i.test(html) || /G-[A-Z0-9]+/i.test(html)
  if (hasGA) {
    return true
  }

  // Check for common Google Search Console verification files
  // Try multiple common patterns
  const verificationFilePatterns = [
    'google-site-verification.html',
    'google[0-9a-f]{16}.html', // Pattern like google1234567890abcdef.html
    'googlexxxxxx.html', // Pattern like google123456.html
  ]

  for (const filePattern of verificationFilePatterns) {
    try {
      // Try exact filename first
      if (!filePattern.includes('[')) {
        const fileUrl = `${baseUrl}/${filePattern}`
        const response = await fetch(fileUrl, {
          signal: AbortSignal.timeout(3000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AI-Visibility-Bot/1.0)',
          },
        })
        if (response.ok) {
          const content = await response.text()
          // Check if it contains Google verification content
          if (content.includes('google-site-verification') || 
              content.includes('google.com/site') ||
              content.includes('google-site-verification-code')) {
            return true
          }
        }
      }
    } catch (e) {
      // Continue to next file pattern
    }
  }

  // Try to find verification files by checking robots.txt for sitemap references
  // Sites with Search Console often have sitemaps submitted
  try {
    const robotsUrl = `${baseUrl}/robots.txt`
    const robotsResponse = await fetch(robotsUrl, {
      signal: AbortSignal.timeout(3000),
    })
    if (robotsResponse.ok) {
      const robotsContent = await robotsResponse.text()
      // If robots.txt mentions sitemap, it's a good indicator of Search Console usage
      if (/sitemap/i.test(robotsContent)) {
        // Also check if sitemap exists (another indicator)
        const sitemapUrl = `${baseUrl}/sitemap.xml`
        try {
          const sitemapResponse = await fetch(sitemapUrl, {
            signal: AbortSignal.timeout(3000),
          })
          if (sitemapResponse.ok) {
            // Sitemap exists and is referenced in robots.txt - strong indicator of Search Console
            return true
          }
        } catch (e) {
          // Sitemap check failed, continue
        }
      }
    }
  } catch (e) {
    // robots.txt check failed, continue
  }

  return false
}

/**
 * Analyze accessibility
 */
function analyzeAccessibility(html: string): number {
  let score = 0

  // Check for lang attribute
  if (/<html[^>]*lang=["'][^"']+["']/i.test(html)) score += 10

  // Check for alt text on images
  const images = html.match(/<img[^>]*>/gi) || []
  const imagesWithAlt = images.filter(img => /alt=["'][^"']+["']/i.test(img)).length
  if (images.length > 0) {
    score += (imagesWithAlt / images.length) * 30
  }

  // Check for ARIA labels
  const ariaElements = (html.match(/aria-label=["'][^"']+["']/gi) || []).length
  if (ariaElements > 0) score += 20

  // Check for semantic HTML (already checked, but add bonus)
  const semanticCount = (html.match(/<(header|nav|main|article|section|footer)[\s>]/gi) || []).length
  score += Math.min(20, semanticCount * 5)

  // Check for skip links
  if (/<a[^>]*href=["']#(main|content|skip)[^"']*["']/i.test(html)) score += 10

  // Check for form labels
  const inputs = (html.match(/<input[^>]*>/gi) || []).length
  const labels = (html.match(/<label[^>]*>/gi) || []).length
  if (inputs > 0) {
    score += Math.min(10, (labels / inputs) * 10)
  }

  return Math.min(100, score)
}

/**
 * Calculate overall visibility score
 */
function calculateVisibilityScore(factors: {
  hasStructuredData: boolean
  hasMetaDescription: boolean
  hasOpenGraphTags: boolean
  semanticHTMLScore: number
  contentQualityScore: number
  hasSitemap: boolean
  robotsTxtAllowsCrawling: boolean
  mobileFriendly: boolean
  accessibilityScore: number
  pageLoadSpeed: number
}): number {
  let score = 0

  // Structured data (20 points)
  if (factors.hasStructuredData) score += 20

  // Meta description (10 points)
  if (factors.hasMetaDescription) score += 10

  // Open Graph tags (10 points)
  if (factors.hasOpenGraphTags) score += 10

  // Semantic HTML (15 points)
  score += (factors.semanticHTMLScore / 100) * 15

  // Content quality (15 points)
  score += (factors.contentQualityScore / 100) * 15

  // Sitemap (10 points)
  if (factors.hasSitemap) score += 10

  // Robots.txt allows crawling (5 points)
  if (factors.robotsTxtAllowsCrawling) score += 5

  // Mobile friendly (5 points)
  if (factors.mobileFriendly) score += 5

  // Accessibility (5 points)
  score += (factors.accessibilityScore / 100) * 5

  // Page load speed (5 points) - faster is better
  if (factors.pageLoadSpeed < 1000) score += 5
  else if (factors.pageLoadSpeed < 2000) score += 3
  else if (factors.pageLoadSpeed < 3000) score += 1

  return Math.min(100, Math.round(score))
}

/**
 * Create default analysis for inaccessible websites
 */
function createDefaultAnalysis(
  url: string,
  isAccessible: boolean,
  issues: string[],
  recommendations: string[]
): WebsiteAnalysis {
  return {
    url,
    isAccessible,
    hasStructuredData: false,
    structuredDataTypes: [],
    hasMetaDescription: false,
    hasOpenGraphTags: false,
    hasTwitterCards: false,
    semanticHTMLScore: 0,
    contentQualityScore: 0,
    hasSitemap: false,
    hasRobotsTxt: false,
    robotsTxtAllowsCrawling: true,
    pageLoadSpeed: 0,
    mobileFriendly: false,
    accessibilityScore: 0,
    hasGoogleSearchConsole: false,
    overallVisibilityScore: 0,
    issues,
    recommendations,
  }
}

