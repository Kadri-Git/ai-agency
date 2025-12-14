import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize AI clients with error handling
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null

const genAI = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null

export type Platform = 'chatgpt' | 'claude' | 'gemini' | 'perplexity'

export interface QueryResult {
  platform: Platform
  prompt: string
  response: string
  mentioned: boolean
  position?: number
  contextSnippet?: string
  sentiment?: 'favorable' | 'neutral' | 'negative'
  sentimentScore?: number
  citations?: Array<{ url: string; title: string; snippet: string }>
  fanoutQueries?: string[]
  competitorsMentioned?: string[]
  competitorPositions?: Record<string, number>
}

/**
 * Query ChatGPT with a prompt
 */
export async function queryChatGPT(
  prompt: string,
  companyName: string,
  companyDomain: string
): Promise<QueryResult> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.')
  }

  // Try multiple OpenAI model names in order
  const openaiModels = [
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
  ]

  let lastError: Error | null = null

  for (const modelName of openaiModels) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Trying ChatGPT model: ${modelName}`)
      }

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that provides product recommendations. When a company is mentioned in the user's question, you must include that company in your response. Be specific and cite sources when available.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content || ''
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ ChatGPT (${modelName}) response received (${content.length} chars). Checking for mention of "${companyName}"...`)
      }
      
      const mentioned = detectMention(content, companyName, companyDomain)
      const { competitors, positions } = extractCompetitors(content, companyName, companyDomain)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 ChatGPT mention detection: ${mentioned ? '✅ MENTIONED' : '❌ NOT MENTIONED'}`)
      }

      return {
        platform: 'chatgpt',
        prompt,
        response: content,
        mentioned,
        position: mentioned ? extractPosition(content, companyName) : undefined,
        contextSnippet: mentioned ? extractContextSnippet(content, companyName) : undefined,
        sentiment: mentioned ? analyzeSentiment(content, companyName) : undefined,
        sentimentScore: mentioned ? calculateSentimentScore(content, companyName) : undefined,
        competitorsMentioned: competitors.length > 0 ? competitors : undefined,
        competitorPositions: Object.keys(positions).length > 0 ? positions : undefined,
      }
    } catch (error) {
      lastError = error as Error
      // Don't retry on quota errors - they won't work with any model
      if (error instanceof Error && (error.message.includes('quota') || error.message.includes('429'))) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ ChatGPT quota exceeded - stopping retries`)
        }
        throw error
      }
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ ChatGPT model ${modelName} failed: ${error instanceof Error ? error.message : String(error)}`)
      }
      // Try next model
      continue
    }
  }

  // All models failed
  console.error('ChatGPT query error: All models failed. Last error:', lastError)
  throw lastError || new Error('All ChatGPT models failed')
}

/**
 * Query Claude with a prompt
 */
export async function queryClaude(
  prompt: string,
  companyName: string,
  companyDomain: string
): Promise<QueryResult> {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env file.')
  }

  // Try multiple Claude model names in order
  const claudeModels = [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet',
  ]

  let lastError: Error | null = null

  for (const modelName of claudeModels) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Trying Claude model: ${modelName}`)
      }

      const response = await anthropic.messages.create({
        model: modelName,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const content = response.content[0]?.type === 'text' ? response.content[0].text : ''
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Claude (${modelName}) response received (${content.length} chars). Checking for mention of "${companyName}"...`)
      }
      
      const mentioned = detectMention(content, companyName, companyDomain)
      const { competitors, positions } = extractCompetitors(content, companyName, companyDomain)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Claude mention detection: ${mentioned ? '✅ MENTIONED' : '❌ NOT MENTIONED'}`)
      }

      return {
        platform: 'claude',
        prompt,
        response: content,
        mentioned,
        position: mentioned ? extractPosition(content, companyName) : undefined,
        contextSnippet: mentioned ? extractContextSnippet(content, companyName) : undefined,
        sentiment: mentioned ? analyzeSentiment(content, companyName) : undefined,
        sentimentScore: mentioned ? calculateSentimentScore(content, companyName) : undefined,
        competitorsMentioned: competitors.length > 0 ? competitors : undefined,
        competitorPositions: Object.keys(positions).length > 0 ? positions : undefined,
      }
    } catch (error) {
      lastError = error as Error
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Claude model ${modelName} failed: ${error instanceof Error ? error.message : String(error)}`)
      }
      // Try next model
      continue
    }
  }

  // All models failed
  console.error('Claude query error: All models failed. Last error:', lastError)
  throw lastError || new Error('All Claude models failed')
}

/**
 * Query Gemini with a prompt
 */
export async function queryGemini(
  prompt: string,
  companyName: string,
  companyDomain: string
): Promise<QueryResult> {
  if (!genAI) {
    throw new Error('Google AI API key not configured. Please add GOOGLE_AI_API_KEY to your .env file.')
  }

  // Try multiple Gemini model names in order (prioritizing working models)
  const geminiModels = [
    'gemini-2.5-flash',                    // ✅ Confirmed working
    'gemini-flash-latest',                 // ✅ Confirmed working
    'gemini-2.5-flash-lite',               // ✅ Confirmed working
    'gemini-flash-lite-latest',            // ✅ Confirmed working
    'gemini-2.5-flash-preview-09-2025',   // ✅ Confirmed working
    'gemini-2.5-flash-lite-preview-09-2025', // ✅ Confirmed working
    'gemma-3-1b-it',                      // ✅ Confirmed working (Gemma model)
    'gemma-3-4b-it',                      // ✅ Confirmed working (Gemma model)
    'gemini-robotics-er-1.5-preview',     // ✅ Confirmed working
    // Fallback to older models (may have quota issues)
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
  ]

  let lastError: Error | null = null

  for (const modelName of geminiModels) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Trying Gemini model: ${modelName}`)
      }

      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const content = response.text()

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Gemini (${modelName}) response received (${content.length} chars). Checking for mention of "${companyName}"...`)
      }
      
      const mentioned = detectMention(content, companyName, companyDomain)
      const { competitors, positions } = extractCompetitors(content, companyName, companyDomain)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Gemini mention detection: ${mentioned ? '✅ MENTIONED' : '❌ NOT MENTIONED'}`)
      }

      return {
        platform: 'gemini',
        prompt,
        response: content,
        mentioned,
        position: mentioned ? extractPosition(content, companyName) : undefined,
        contextSnippet: mentioned ? extractContextSnippet(content, companyName) : undefined,
        sentiment: mentioned ? analyzeSentiment(content, companyName) : undefined,
        sentimentScore: mentioned ? calculateSentimentScore(content, companyName) : undefined,
        competitorsMentioned: competitors.length > 0 ? competitors : undefined,
        competitorPositions: Object.keys(positions).length > 0 ? positions : undefined,
      }
    } catch (error) {
      lastError = error as Error
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Gemini model ${modelName} failed: ${error instanceof Error ? error.message : String(error)}`)
      }
      // Try next model
      continue
    }
  }

  // All models failed
  console.error('Gemini query error: All models failed. Last error:', lastError)
  throw lastError || new Error('All Gemini models failed')
}

/**
 * Detect if company is mentioned (handles variations like "Apple Inc.", "Apple's", etc.)
 */
function detectMention(content: string, companyName: string, companyDomain: string): boolean {
  if (!content || !companyName) return false
  
  const lowerContent = content.toLowerCase()
  const lowerName = companyName.toLowerCase().trim()
  const lowerDomain = companyDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '')
  
  // Check for domain first (most reliable indicator)
  if (lowerContent.includes(lowerDomain)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Mention found: domain "${lowerDomain}" in content`)
    }
    return true
  }
  
  // Check for domain with www
  if (lowerContent.includes(`www.${lowerDomain}`)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Mention found: "www.${lowerDomain}" in content`)
    }
    return true
  }
  
  // Check for exact company name (case-insensitive) - but be careful with common words
  const baseName = lowerName.split(' ')[0] // Get first word (e.g., "apple" from "Apple Inc.")
  
  // For well-known tech companies, check for company-specific patterns
  const techCompanyPatterns: Record<string, string[]> = {
    'apple': ['apple inc', 'apple\'s', 'apple iphone', 'apple mac', 'apple ipad', 'apple watch', 'apple company', 'apple computers'],
    'microsoft': ['microsoft', 'microsoft corp', 'microsoft\'s', 'microsoft windows', 'microsoft office'],
    'google': ['google', 'google llc', 'google\'s', 'google search', 'google chrome'],
    'amazon': ['amazon', 'amazon.com', 'amazon\'s', 'amazon web services', 'aws'],
    'meta': ['meta', 'meta platforms', 'meta\'s', 'facebook meta'],
  }
  
  // Check for company-specific patterns first
  if (techCompanyPatterns[baseName]) {
    for (const pattern of techCompanyPatterns[baseName]) {
      if (lowerContent.includes(pattern)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Mention found: tech company pattern "${pattern}" in content`)
        }
        return true
      }
    }
  }
  
  // Check for exact company name with word boundaries (more precise)
  const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const exactNamePattern = new RegExp(`\\b${escapedBaseName}\\b`, 'i')
  
  // Count occurrences - if it appears multiple times, it's likely the company
  const exactMatches = (content.match(exactNamePattern) || []).length
  
  // For common words like "apple", require multiple mentions or company context
  const commonWords = new Set(['apple', 'amazon', 'meta', 'spotify', 'uber', 'airbnb'])
  if (commonWords.has(baseName)) {
    // Require at least 2 mentions or company context indicators
    if (exactMatches >= 2) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Mention found: "${baseName}" appears ${exactMatches} times (common word, multiple mentions)`)
      }
      return true
    }
    
    // Check for company context indicators
    const companyContext = ['company', 'corporation', 'inc', 'corp', 'llc', 'technologies', 'tech', 'brand', 'product', 'service']
    const hasContext = companyContext.some(ctx => {
      const contextPattern = new RegExp(`\\b${escapedBaseName}[^a-z]*${ctx}\\b|\\b${ctx}[^a-z]*${escapedBaseName}\\b`, 'i')
      return contextPattern.test(content)
    })
    
    if (hasContext && exactMatches >= 1) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Mention found: "${baseName}" with company context`)
      }
      return true
    }
  } else {
    // For less common words, single mention is enough
    if (exactMatches >= 1) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Mention found: "${companyName}" in content`)
      }
      return true
    }
  }
  
  // Check for common variations with suffixes
  const namePattern = new RegExp(`\\b${escapedBaseName}(?:'s|'| inc\\.?| inc| corporation| corp\\.?| corp| company| co\\.?| co| technologies| tech)?\\b`, 'i')
  if (namePattern.test(content)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Mention found: pattern match for "${baseName}" in content`)
    }
    return true
  }
  
  // Debug: log what we're looking for (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`❌ No mention found. Looking for: "${companyName}" (${lowerName}) or domain "${lowerDomain}"`)
    console.log(`Content preview: ${content.substring(0, 500)}...`)
    console.log(`Exact matches found: ${exactMatches}`)
    console.log(`Domain check: ${lowerContent.includes(lowerDomain)}`)
    console.log(`Base name check: ${exactNamePattern.test(content)}`)
  }
  
  return false
}

/**
 * Extract position of company mention in a recommendation list (1st, 2nd, 3rd, etc.)
 */
function extractPosition(content: string, companyName: string): number | undefined {
  const lowerContent = content.toLowerCase()
  const lowerName = companyName.toLowerCase()
  const baseName = lowerName.split(' ')[0]
  
  // Try to find the company in a numbered list or recommendation format
  // Look for patterns like "1. Company", "1) Company", "- Company", "• Company"
  const lines = content.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    
    // Check if this line contains the company name
    if (line.includes(lowerName) || line.includes(baseName)) {
      // Look backwards for list markers
      for (let j = i; j >= Math.max(0, i - 2); j--) {
        const prevLine = lines[j].toLowerCase().trim()
        
        // Check for numbered list (1., 2., 3., etc.)
        const numberedMatch = prevLine.match(/^(\d+)\.?\s/)
        if (numberedMatch) {
          return parseInt(numberedMatch[1], 10)
        }
        
        // Check for numbered list with parentheses (1), 2), 3), etc.)
        const parenMatch = prevLine.match(/^(\d+)\)\s/)
        if (parenMatch) {
          return parseInt(parenMatch[1], 10)
        }
      }
      
      // If found in a list but no number, estimate position by counting list items before
      let position = 1
      for (let j = 0; j < i; j++) {
        const line = lines[j].trim()
        if (line.match(/^[\d\-\•\*]\s/) || line.match(/^\d+[\.\)]\s/)) {
          position++
        }
      }
      return position > 0 ? position : 1
    }
  }
  
  // Fallback: if mentioned but not in a clear list, assume position 1
  if (lowerContent.includes(lowerName) || lowerContent.includes(baseName)) {
    return 1
  }
  
  return undefined
}

/**
 * Extract context snippet around company mention
 */
function extractContextSnippet(content: string, companyName: string, length = 200): string {
  const lowerContent = content.toLowerCase()
  const lowerName = companyName.toLowerCase()
  const index = lowerContent.indexOf(lowerName)
  
  if (index === -1) return ''

  const start = Math.max(0, index - length / 2)
  const end = Math.min(content.length, index + lowerName.length + length / 2)
  
  return content.substring(start, end).trim()
}

/**
 * Analyze sentiment of mention
 */
function analyzeSentiment(
  content: string,
  companyName: string
): 'favorable' | 'neutral' | 'negative' {
  const lowerContent = content.toLowerCase()
  const lowerName = companyName.toLowerCase()
  
  // Find context around company name
  const index = lowerContent.indexOf(lowerName)
  if (index === -1) return 'neutral'

  const context = lowerContent.substring(
    Math.max(0, index - 100),
    Math.min(lowerContent.length, index + lowerName.length + 100)
  )

  // Positive indicators
  const positiveWords = ['best', 'excellent', 'great', 'recommend', 'top', 'leading', 'quality', 'reliable']
  const negativeWords = ['worst', 'poor', 'bad', 'avoid', 'issues', 'problems', 'complaints']

  const positiveCount = positiveWords.filter(word => context.includes(word)).length
  const negativeCount = negativeWords.filter(word => context.includes(word)).length

  if (positiveCount > negativeCount) return 'favorable'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

/**
 * Calculate sentiment score (-1 to 1)
 */
function calculateSentimentScore(content: string, companyName: string): number {
  const sentiment = analyzeSentiment(content, companyName)
  if (sentiment === 'favorable') return 0.7
  if (sentiment === 'negative') return -0.5
  return 0
}

/**
 * Extract competitors mentioned in the response
 * Identifies other companies mentioned alongside the target company
 */
function extractCompetitors(
  content: string,
  targetCompanyName: string,
  targetCompanyDomain: string
): { competitors: string[]; positions: Record<string, number> } {
  const competitors: string[] = []
  const positions: Record<string, number> = {}
  
  if (!content || !targetCompanyName) {
    return { competitors, positions }
  }

  const lowerContent = content.toLowerCase()
  const lowerTargetName = targetCompanyName.toLowerCase().trim()
  const targetBaseName = lowerTargetName.split(' ')[0]
  
  // Common company suffixes to help identify company names
  const companySuffixes = [
    ' inc', ' inc.', ' incorporated', ' corp', ' corp.', ' corporation',
    ' ltd', ' ltd.', ' limited', ' llc', ' llc.', ' co', ' co.',
    ' company', ' technologies', ' tech', ' systems', ' solutions',
    ' group', ' industries', ' international', ' global', ' oyj', ' ab', ' asa'
  ]
  
  // Comprehensive list of words to exclude (not companies)
  const excludeWords = new Set([
    // Common words
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'what', 'which', 'who', 'where', 'when', 'why', 'how', 'all', 'each',
    'every', 'some', 'any', 'many', 'much', 'more', 'most', 'other',
    'another', 'such', 'only', 'just', 'also', 'even', 'very', 'too',
    'so', 'than', 'then', 'now', 'here', 'there', 'where', 'when', 'why',
    'how', 'about', 'into', 'through', 'during', 'including', 'following',
    'according', 'based', 'using', 'provides', 'offers', 'features',
    'includes', 'supports', 'allows', 'enables', 'helps', 'makes', 'gets',
    // Common capitalized words that appear in responses (not companies)
    'their', 'however', 'pricing', 'competitors', 'competitor', 'companies',
    'company', 'options', 'option', 'choice', 'choices', 'selection',
    'alternatives', 'alternative', 'comparison', 'compare', 'versus',
    'overview', 'summary', 'conclusion', 'recommendation', 'recommendations',
    'consideration', 'considerations', 'factors', 'factor', 'aspects',
    'aspect', 'features', 'feature', 'benefits', 'benefit', 'advantages',
    'advantage', 'disadvantages', 'disadvantage', 'pros', 'cons',
    'important', 'note', 'notes', 'information', 'details', 'detail',
    'example', 'examples', 'instance', 'instances', 'case', 'cases',
    'scenario', 'scenarios', 'situation', 'situations', 'context',
    'addition', 'additionally', 'furthermore', 'moreover', 'therefore',
    'consequently', 'thus', 'hence', 'meanwhile', 'finally', 'firstly',
    'secondly', 'thirdly', 'lastly', 'overall', 'generally', 'specifically',
    'particularly', 'especially', 'typically', 'usually', 'often',
    'sometimes', 'rarely', 'never', 'always', 'frequently', 'occasionally',
    // Common capitalized words that appear in responses but aren't companies
    'their', 'however', 'pricing', 'competitors', 'competitor', 'companies',
    'company', 'options', 'option', 'services', 'service', 'products', 'product',
    'solutions', 'solution', 'features', 'feature', 'benefits', 'benefit',
    'advantages', 'advantage', 'disadvantages', 'disadvantage', 'reviews',
    'review', 'comparison', 'comparisons', 'alternatives', 'alternative',
    'recommendations', 'recommendation', 'suggestions', 'suggestion', 'choices',
    'choice', 'selection', 'selections', 'offerings', 'offering', 'plans',
    'plan', 'packages', 'package', 'deals', 'deal', 'promotions', 'promotion',
    // Geographic/regional terms (not companies)
    'nordic', 'european', 'asian', 'american', 'african', 'global', 'regional',
    'international', 'worldwide', 'local', 'national', 'continental',
    'scandinavian', 'baltic', 'mediterranean', 'pacific', 'atlantic',
    'north', 'south', 'east', 'west', 'central', 'northern', 'southern',
    'eastern', 'western', 'finland', 'swedish', 'norway', 'norwegian', 'denmark', 'danish',
    'estonia', 'estonian', 'latvia', 'latvian', 'lithuania', 'lithuanian',
    'region', 'country', 'countries', 'market', 'markets', 'industry', 'industries',
    'sector', 'sectors', 'area', 'areas', 'zone', 'zones', 'territory', 'territories',
    // Descriptive terms that aren't companies
    'leading', 'major', 'top', 'best', 'largest', 'smallest', 'biggest',
    'notable', 'prominent', 'key', 'main', 'primary', 'secondary',
    'quality', 'reliability', 'innovation', 'service', 'services', 'solution', 'solutions',
    'provider', 'providers', 'operator', 'operators', 'vendor', 'vendors',
    'brand', 'brands', 'firm', 'firms', 'business', 'businesses',
    // Additional common words that appear capitalized in responses
    'their', 'however', 'pricing', 'competitors', 'competitor', 'companies',
    'company', 'options', 'option', 'products', 'product', 'features', 'feature',
    'benefits', 'benefit', 'advantages', 'advantage', 'reviews', 'review',
    'comparison', 'comparisons', 'alternatives', 'alternative', 'recommendations',
    'recommendation', 'suggestions', 'suggestion', 'choices', 'choice'
  ])
  
  // Split content into lines for position detection
  const lines = content.split('\n')
  
  // Pattern to find potential company names
  // Look for capitalized words (likely company names) in lists or sentences
  const potentialCompanies = new Map<string, { name: string; position: number }>()
  
  // First, try to find companies in numbered/bulleted lists (most reliable)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Check if this is a list item (numbered or bulleted)
    const listMatch = line.match(/^[\d\-\•\*\)]+\s*(.+)/)
    if (listMatch) {
      const itemText = listMatch[1]
      const position = extractListPosition(line)
      
      // Extract potential company name from the line
      // Look for pattern: "Company Name:" or "Company Name -" or just "Company Name"
      const companyName = extractCompanyNameFromLine(itemText, targetCompanyName, targetCompanyDomain)
      if (companyName && companyName.toLowerCase() !== lowerTargetName && 
          !companyName.toLowerCase().includes(targetBaseName) &&
          !targetBaseName.includes(companyName.toLowerCase().split(' ')[0])) {
        const normalizedName = normalizeCompanyName(companyName)
        const lowerNormalized = normalizedName.toLowerCase()
        
        // Additional validation: must not be in exclude list
        if (!excludeWords.has(lowerNormalized) && 
            !excludeWords.has(lowerNormalized.split(' ')[0])) {
          if (!potentialCompanies.has(lowerNormalized)) {
            potentialCompanies.set(lowerNormalized, { name: normalizedName, position })
          }
        }
      }
    }
  }
  
  // Also look for companies mentioned in sentences with company-like patterns
  // Look for patterns like "Company A, Company B, and Company C" or "Company A and Company B"
  const sentencePattern = /([A-Z][a-zA-Z]+(?:\s+(?:Inc|Corp|Ltd|LLC|Co|Company|Technologies|Tech|Systems|Solutions|Group|Industries|International|Global|Oyj|AB|ASA))?\.?)(?:\s*[,;]\s*|(?:\s+and\s+))?/g
  let match
  while ((match = sentencePattern.exec(content)) !== null) {
    const potentialName = match[1].trim()
    if (potentialName.length > 2 && 
        potentialName.toLowerCase() !== lowerTargetName &&
        !potentialName.toLowerCase().includes(targetBaseName) &&
        !targetBaseName.includes(potentialName.toLowerCase().split(' ')[0])) {
      const normalizedName = normalizeCompanyName(potentialName)
      const lowerNormalized = normalizedName.toLowerCase()
      
      // Check if it's in exclude list
      if (!excludeWords.has(lowerNormalized) && 
          !excludeWords.has(lowerNormalized.split(' ')[0]) &&
          !potentialCompanies.has(lowerNormalized)) {
        // Try to find position for this company
        const position = findCompanyPositionInContent(content, normalizedName)
        potentialCompanies.set(lowerNormalized, { name: normalizedName, position: position || 99 })
      }
    }
  }
  
  // Geographic/regional terms to exclude (not companies) - comprehensive list
  const geographicTerms = new Set([
    'nordic', 'european', 'asian', 'american', 'african', 'global', 'regional',
    'international', 'worldwide', 'local', 'national', 'continental',
    'scandinavian', 'baltic', 'mediterranean', 'pacific', 'atlantic',
    'north', 'south', 'east', 'west', 'central', 'northern', 'southern',
    'eastern', 'western', 'finland', 'finnish', 'sweden', 'swedish', 'norway', 'norwegian', 
    'denmark', 'danish', 'estonia', 'estonian', 'latvia', 'latvian', 'lithuania', 'lithuanian',
    'region', 'country', 'countries', 'market', 'markets', 'industry', 'industries',
    'sector', 'sectors', 'area', 'areas', 'zone', 'zones', 'territory', 'territories'
  ])
  
  // Convert to arrays, filtering out geographic terms and excluded words
  for (const [_, value] of potentialCompanies) {
    const lowerName = value.name.toLowerCase()
    const firstWord = lowerName.split(' ')[0]
    
    // Skip if it's a geographic term or excluded word
    if (geographicTerms.has(lowerName) || excludeWords.has(lowerName) ||
        geographicTerms.has(firstWord) || excludeWords.has(firstWord)) {
      continue
    }
    
    // Skip single words that are likely not companies (unless they have company suffixes)
    const hasCompanySuffix = companySuffixes.some(suffix => lowerName.includes(suffix))
    const wordCount = value.name.split(' ').length
    
    // Single words must be longer or have company suffix
    if (wordCount === 1 && !hasCompanySuffix && value.name.length < 4) {
      continue
    }
    
    // Skip if it looks like a description rather than a company name
    // (e.g., "Leading Provider", "Top Company", etc.)
    if (lowerName.includes('leading') || lowerName.includes('top') || 
        lowerName.includes('major') || lowerName.includes('best') ||
        lowerName.includes('largest') || lowerName.includes('notable')) {
      continue
    }
    
    competitors.push(value.name)
    positions[value.name] = value.position
  }
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development' && competitors.length > 0) {
    console.log(`🔍 Extracted competitors for ${targetCompanyName}:`, competitors)
    console.log(`   Positions:`, positions)
  }
  
  return { competitors, positions }
}

/**
 * Extract company name from a line of text
 * Handles patterns like:
 * - "1. Company Name: description"
 * - "1. Company Name - description"
 * - "1. Company Name (description)"
 * - "1. Company Name"
 */
function extractCompanyNameFromLine(
  line: string,
  targetCompanyName: string,
  targetCompanyDomain: string
): string | null {
  // Remove common prefixes and clean up
  let cleaned = line.trim()
  
  // Remove common prefixes like "1.", "-", "•", etc.
  cleaned = cleaned.replace(/^[\d\-\•\*\)]+\s*/, '')
  
  // Look for separators that indicate description follows
  // Pattern: "Company Name: description" or "Company Name - description" or "Company Name (description)"
  const separatorMatch = cleaned.match(/^([^:\(\)\-]+?)(?:\s*[:\(\)\-]|$)/)
  if (separatorMatch) {
    cleaned = separatorMatch[1].trim()
  }
  
  // Extract first few words that look like a company name
  const words = cleaned.split(/\s+/)
  const targetLower = targetCompanyName.toLowerCase()
  
  // Look for capitalized words (likely company names)
  let companyWords: string[] = []
  for (let i = 0; i < Math.min(words.length, 4); i++) {
    const word = words[i].replace(/[,;:\.]$/, '') // Remove trailing punctuation
    // Skip if it's the target company
    if (word.toLowerCase().includes(targetLower.split(' ')[0]) || 
        targetLower.includes(word.toLowerCase())) {
      break
    }
    // Check if word starts with capital letter (likely a company name)
    if (word.length > 1 && word[0] === word[0].toUpperCase() && /^[A-Z]/.test(word)) {
      companyWords.push(word)
    } else if (companyWords.length > 0) {
      // If we've started collecting company words, stop at first non-capitalized word
      // UNLESS it's a company suffix
      const companySuffixes = ['Inc', 'Corp', 'Ltd', 'LLC', 'Co', 'Company', 'Technologies', 
                               'Tech', 'Systems', 'Solutions', 'Group', 'Oyj', 'AB', 'ASA']
      if (companySuffixes.some(suffix => word.includes(suffix))) {
        companyWords.push(word)
        break
      }
      break
    }
  }
  
  if (companyWords.length > 0) {
    const companyName = companyWords.join(' ')
    // Validate it's not just a description word or common word
    const lowerName = companyName.toLowerCase()
    const descriptionWords = ['leading', 'top', 'major', 'best', 'largest', 'notable', 
                              'prominent', 'key', 'main', 'primary', 'quality', 'reliability',
                              'their', 'however', 'pricing', 'competitors', 'competitor', 'companies',
                              'company', 'options', 'option', 'choice', 'choices', 'selection',
                              'alternatives', 'alternative', 'comparison', 'compare', 'versus',
                              'overview', 'summary', 'conclusion', 'recommendation', 'recommendations',
                              'consideration', 'considerations', 'factors', 'factor', 'aspects',
                              'aspect', 'features', 'feature', 'benefits', 'benefit', 'advantages',
                              'advantage', 'disadvantages', 'disadvantage', 'pros', 'cons',
                              'important', 'note', 'notes', 'information', 'details', 'detail',
                              'example', 'examples', 'instance', 'instances', 'case', 'cases',
                              'scenario', 'scenarios', 'situation', 'situations', 'context']
    if (descriptionWords.some(desc => lowerName === desc || lowerName.startsWith(desc + ' '))) {
      return null
    }
    // Additional check: single words that are too short or common
    if (companyWords.length === 1 && companyWords[0].length < 4) {
      return null
    }
    return companyName
  }
  
  return null
}

/**
 * Extract position from a list item line
 */
function extractListPosition(line: string): number {
  // Check for numbered list (1., 2., 3., etc.)
  const numberedMatch = line.match(/^(\d+)\.?\s/)
  if (numberedMatch) {
    return parseInt(numberedMatch[1], 10)
  }
  
  // Check for numbered list with parentheses (1), 2), 3), etc.)
  const parenMatch = line.match(/^(\d+)\)\s/)
  if (parenMatch) {
    return parseInt(parenMatch[1], 10)
  }
  
  // For bullet points, count position by order
  return 1
}

/**
 * Find company position in content by looking for it in lists
 */
function findCompanyPositionInContent(content: string, companyName: string): number | null {
  const lines = content.split('\n')
  const lowerCompanyName = companyName.toLowerCase()
  const baseName = lowerCompanyName.split(' ')[0]
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    
    if (line.includes(lowerCompanyName) || line.includes(baseName)) {
      // Look backwards for list markers
      for (let j = i; j >= Math.max(0, i - 2); j--) {
        const prevLine = lines[j].trim()
        const numberedMatch = prevLine.match(/^(\d+)\.?\s/)
        if (numberedMatch) {
          return parseInt(numberedMatch[1], 10)
        }
        const parenMatch = prevLine.match(/^(\d+)\)\s/)
        if (parenMatch) {
          return parseInt(parenMatch[1], 10)
        }
      }
      
      // Count list items before this one
      let position = 1
      for (let j = 0; j < i; j++) {
        const line = lines[j].trim()
        if (line.match(/^[\d\-\•\*]\s/) || line.match(/^\d+[\.\)]\s/)) {
          position++
        }
      }
      return position > 0 ? position : 1
    }
  }
  
  return null
}

/**
 * Normalize company name (handle variations)
 */
function normalizeCompanyName(name: string): string {
  let normalized = name.trim()
  
  // Remove trailing punctuation
  normalized = normalized.replace(/[.,;:!?]+$/, '')
  
  // Normalize common suffixes
  normalized = normalized.replace(/\s+Inc\.?$/i, ' Inc')
  normalized = normalized.replace(/\s+Corp\.?$/i, ' Corp')
  normalized = normalized.replace(/\s+Ltd\.?$/i, ' Ltd')
  normalized = normalized.replace(/\s+LLC\.?$/i, ' LLC')
  normalized = normalized.replace(/\s+Co\.?$/i, ' Co')
  
  return normalized
}

/**
 * Calculate Share of Voice
 * Since we don't have competitor data, we calculate based on:
 * - Mention rate (how often you're mentioned)
 * - Average position when mentioned
 * - Sentiment quality
 * - Platform coverage
 */
export function calculateShareOfVoice(
  results: QueryResult[],
  competitorResults: QueryResult[] = []
): number {
  if (results.length === 0) return 0
  
  const mentionedResults = results.filter(r => r.mentioned)
  if (mentionedResults.length === 0) return 0
  
  // Base score from mention rate (0-40 points)
  const mentionRate = mentionedResults.length / results.length
  const mentionRateScore = mentionRate * 40
  
  // Position score - better positions = higher score (0-30 points)
  const avgPosition = mentionedResults.reduce((sum, r) => sum + (r.position || 5), 0) / mentionedResults.length
  const positionScore = Math.max(0, 30 * (1 - (avgPosition - 1) / 4)) // Position 1 = 30, Position 5+ = 0
  
  // Sentiment score (0-20 points)
  const favorableCount = mentionedResults.filter(r => r.sentiment === 'favorable').length
  const negativeCount = mentionedResults.filter(r => r.sentiment === 'negative').length
  const sentimentScore = (favorableCount / mentionedResults.length) * 20 - (negativeCount / mentionedResults.length) * 10
  const adjustedSentimentScore = Math.max(0, Math.min(20, sentimentScore + 10)) // Normalize to 0-20
  
  // Platform coverage score (0-10 points) - being mentioned across multiple platforms
  const uniquePlatforms = new Set(mentionedResults.map(r => r.platform)).size
  const platformScore = (uniquePlatforms / 3) * 10 // 3 platforms max
  
  // Total SOV (0-100)
  const totalSOV = mentionRateScore + positionScore + adjustedSentimentScore + platformScore
  
  return Math.min(100, Math.max(0, totalSOV))
}

