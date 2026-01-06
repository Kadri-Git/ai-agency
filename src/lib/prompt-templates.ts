/**
 * Prompt Templates for Competitor Discovery
 * Generates natural, conversational English prompts with region-specific locations
 */

import { getLocationFromRegion } from './region-mapping'

/**
 * Generate a natural, conversational prompt for competitor discovery
 * Format: "I am looking for [service] in [location]. Which ones do you recommend?"
 *
 * @param industry - The industry/service type (e.g., "painter", "web design", "accounting")
 * @param region - Region code (e.g., "ee", "fi", "us")
 * @returns English prompt with region-specific location
 */
export function generateCompetitorPrompt(
  industry: string,
  region: string
): string {
  const location = getLocationFromRegion(region)

  // For global region, use slightly different phrasing
  if (region.toLowerCase() === 'global') {
    return `I am looking for ${industry} services. Which ones do you recommend?`
  }

  // Standard format with location
  return `I am looking for ${industry} services in ${location}. Which ones do you recommend?`
}

/**
 * Generate multiple prompt variations for better coverage
 * Different phrasings can help discover more competitors
 *
 * @param industry - The industry/service type
 * @param region - Region code
 * @param count - Number of prompt variations to generate (default: 3)
 * @returns Array of prompt strings
 */
export function generateCompetitorPrompts(
  industry: string,
  region: string,
  count: number = 3
): string[] {
  const location = getLocationFromRegion(region)
  const prompts: string[] = []

  if (region.toLowerCase() === 'global') {
    prompts.push(
      `I am looking for ${industry} services. Which ones do you recommend?`,
      `What are the best ${industry} companies?`,
      `Can you recommend top ${industry} providers?`
    )
  } else {
    prompts.push(
      `I am looking for ${industry} services in ${location}. Which ones do you recommend?`,
      `What are the best ${industry} companies in ${location}?`,
      `Can you recommend top ${industry} providers in ${location}?`
    )
  }

  return prompts.slice(0, count)
}


