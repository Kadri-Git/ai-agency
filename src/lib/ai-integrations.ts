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

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that provides product recommendations. When mentioning companies, be specific and cite sources when available.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content || ''
    const mentioned = content.toLowerCase().includes(companyName.toLowerCase()) ||
                     content.toLowerCase().includes(companyDomain.toLowerCase())

    return {
      platform: 'chatgpt',
      prompt,
      response: content,
      mentioned,
      position: mentioned ? extractPosition(content, companyName) : undefined,
      contextSnippet: mentioned ? extractContextSnippet(content, companyName) : undefined,
      sentiment: mentioned ? analyzeSentiment(content, companyName) : undefined,
      sentimentScore: mentioned ? calculateSentimentScore(content, companyName) : undefined,
    }
  } catch (error) {
    console.error('ChatGPT query error:', error)
    throw error
  }
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

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const mentioned = content.toLowerCase().includes(companyName.toLowerCase()) ||
                     content.toLowerCase().includes(companyDomain.toLowerCase())

    return {
      platform: 'claude',
      prompt,
      response: content,
      mentioned,
      position: mentioned ? extractPosition(content, companyName) : undefined,
      contextSnippet: mentioned ? extractContextSnippet(content, companyName) : undefined,
      sentiment: mentioned ? analyzeSentiment(content, companyName) : undefined,
      sentimentScore: mentioned ? calculateSentimentScore(content, companyName) : undefined,
    }
  } catch (error) {
    console.error('Claude query error:', error)
    throw error
  }
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

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    const mentioned = content.toLowerCase().includes(companyName.toLowerCase()) ||
                     content.toLowerCase().includes(companyDomain.toLowerCase())

    return {
      platform: 'gemini',
      prompt,
      response: content,
      mentioned,
      position: mentioned ? extractPosition(content, companyName) : undefined,
      contextSnippet: mentioned ? extractContextSnippet(content, companyName) : undefined,
      sentiment: mentioned ? analyzeSentiment(content, companyName) : undefined,
      sentimentScore: mentioned ? calculateSentimentScore(content, companyName) : undefined,
    }
  } catch (error) {
    console.error('Gemini query error:', error)
    throw error
  }
}

/**
 * Extract position of company mention (1st, 2nd, 3rd, etc.)
 */
function extractPosition(content: string, companyName: string): number | undefined {
  const lowerContent = content.toLowerCase()
  const lowerName = companyName.toLowerCase()
  const index = lowerContent.indexOf(lowerName)
  
  if (index === -1) return undefined

  // Count mentions before this one
  const beforeText = lowerContent.substring(0, index)
  const mentions = (beforeText.match(new RegExp(lowerName, 'g')) || []).length
  
  return mentions + 1
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
 * Calculate Share of Voice
 */
export function calculateShareOfVoice(
  results: QueryResult[],
  competitorResults: QueryResult[] = []
): number {
  // Weight by position (1st=1.0, 2nd=0.7, 3rd=0.4, 4th+=0.2)
  // Weight by sentiment (favorable=1.5x, neutral=1.0x, negative=0.5x)
  
  let yourWeight = 0
  let totalWeight = 0

  const allResults = [...results, ...competitorResults]

  for (const result of allResults) {
    if (!result.mentioned || !result.position) continue

    const positionWeight = result.position === 1 ? 1.0 :
                          result.position === 2 ? 0.7 :
                          result.position === 3 ? 0.4 : 0.2

    const sentimentWeight = result.sentiment === 'favorable' ? 1.5 :
                            result.sentiment === 'negative' ? 0.5 : 1.0

    const weight = positionWeight * sentimentWeight

    if (result.platform === 'chatgpt' || result.platform === 'claude' || 
        result.platform === 'gemini' || result.platform === 'perplexity') {
      if (results.includes(result)) {
        yourWeight += weight
      }
      totalWeight += weight
    }
  }

  return totalWeight > 0 ? (yourWeight / totalWeight) * 100 : 0
}

