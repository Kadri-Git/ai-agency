# Competitors Table Implementation Plan

## Overview

This plan outlines how to implement a competitors discovery feature that:

1. Detects the region of the company
2. Generates English prompts with region-specific locations
3. Queries AI platforms to discover top 5 competitors
4. Displays results in a competitors table

**Note**: All prompts will be in English, but will include the correct regional location (e.g., "Tallinn", "Helsinki", "Stockholm") to get region-specific results.

## Current State Analysis

### What We Have:

- ✅ Company model with `targetRegions` field
- ✅ Region selection in AnalysisForm (22 regions supported)
- ✅ Basic competitor extraction from existing analysis responses
- ✅ TopCompetitors component that displays competitors
- ✅ AI integration functions (queryChatGPT, queryClaude, queryGemini)

### What We Need:

- ❌ Region-to-location mapping (region code → city name)
- ❌ English prompt generation with region-specific locations
- ❌ Dedicated competitor discovery queries
- ❌ Enhanced competitors table with more details

## Implementation Steps

### Step 1: Region-to-Location Mapping

#### 1.1 Create Region Mapping Utility

**File**: `src/lib/region-mapping.ts`

```typescript
// Map region codes to their primary city/location name
// This ensures we get region-specific results when querying AI platforms
const regionToLocation: Record<string, string> = {
  ee: 'Tallinn',
  fi: 'Helsinki',
  se: 'Stockholm',
  no: 'Oslo',
  dk: 'Copenhagen',
  de: 'Berlin',
  fr: 'Paris',
  es: 'Madrid',
  it: 'Rome',
  nl: 'Amsterdam',
  uk: 'London',
  us: 'New York',
  ca: 'Toronto',
  au: 'Sydney',
  jp: 'Tokyo',
  cn: 'Beijing',
  in: 'Mumbai',
  br: 'São Paulo',
  mx: 'Mexico City',
  za: 'Cape Town',
  global: 'globally',
}

// Get region display name
const regionDisplayNames: Record<string, string> = {
  ee: 'Estonia',
  fi: 'Finland',
  se: 'Sweden',
  no: 'Norway',
  dk: 'Denmark',
  de: 'Germany',
  fr: 'France',
  es: 'Spain',
  it: 'Italy',
  nl: 'Netherlands',
  uk: 'United Kingdom',
  us: 'United States',
  ca: 'Canada',
  au: 'Australia',
  jp: 'Japan',
  cn: 'China',
  in: 'India',
  br: 'Brazil',
  mx: 'Mexico',
  za: 'South Africa',
  global: 'Global',
}

export function getLocationFromRegion(region: string): string {
  return regionToLocation[region.toLowerCase()] || region
}

export function getRegionDisplayName(region: string): string {
  return regionDisplayNames[region.toLowerCase()] || region
}

// Detect region from domain (optional - can use TLD)
export function detectRegionFromDomain(domain: string): string | null {
  const tldToRegion: Record<string, string> = {
    '.ee': 'ee',
    '.fi': 'fi',
    '.se': 'se',
    '.no': 'no',
    '.dk': 'dk',
    '.de': 'de',
    '.fr': 'fr',
    '.es': 'es',
    '.it': 'it',
    '.nl': 'nl',
    '.jp': 'jp',
    '.cn': 'cn',
    '.in': 'in',
    '.br': 'br',
    '.mx': 'mx',
    '.za': 'za',
    '.com': 'global', // Default
    '.org': 'global',
  }

  for (const [tld, region] of Object.entries(tldToRegion)) {
    if (domain.endsWith(tld)) {
      return region
    }
  }

  return null
}
```

### Step 2: English Prompt Generation with Region

#### 2.1 Create Prompt Generator

**File**: `src/lib/prompt-templates.ts`

```typescript
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
```

### Step 3: Competitor Discovery API

#### 3.1 Create Competitor Discovery Endpoint

**File**: `src/app/api/competitors/route.ts`

```typescript
// POST /api/competitors
// Body: { companyId, industry, region }

// This endpoint will:
// 1. Generate English prompt with region-specific location
// 2. Query all AI platforms (ChatGPT, Claude, Gemini)
// 3. Extract top 5 competitors from responses
// 4. Return structured competitor data with region context
```

#### 3.2 Competitor Extraction Logic

- Parse AI responses to extract company names
- Filter out invalid names (geographic terms, descriptions)
- Rank by frequency and position
- Return top 5 with metadata:
  - Company name
  - Mention frequency
  - Average position
  - Platforms where mentioned
  - SOV percentage

### Step 4: Enhanced Competitors Table Component

#### 4.1 Update TopCompetitors Component

**File**: `src/components/dashboard/TopCompetitors.tsx`

Add:

- Region/language indicator
- More detailed competitor information
- Links to competitor websites (if available)
- SOV breakdown by platform
- Last updated timestamp

#### 4.2 Create Competitor Discovery Button

- Add a "Discover Competitors" button in the dashboard
- Triggers the competitor discovery API
- Shows loading state
- Updates the table when complete

### Step 5: Integration with Existing Analysis

#### 5.1 Update Analysis Flow

- When analysis runs, automatically detect region/language
- Store language in Company record
- Optionally run competitor discovery as part of analysis

#### 5.2 Update Analysis API

- Accept `region` and `language` in config
- Use localized prompts for competitor discovery
- Store discovered competitors in analysis results

## Data Flow

```
User Input (domain, region)
    ↓
Get Location from Region (e.g., "ee" → "Tallinn")
    ↓
Generate English Prompt with Location
    ↓
Query AI Platforms (ChatGPT, Claude, Gemini)
    ↓
Extract Competitors from Responses
    ↓
Filter & Rank Competitors
    ↓
Store in Database with Region Context
    ↓
Display in Competitors Table
```

## Example Scenarios

### Scenario 1: Estonian Company

- **Input**: Domain ending in `.ee`, region: `ee`
- **Location**: Tallinn
- **Prompt**: "I am looking for painter services in Tallinn. Which ones do you recommend?"
- **Expected**: Top 5 painting companies in Tallinn

### Scenario 2: Finnish Company

- **Input**: Domain ending in `.fi`, region: `fi`
- **Location**: Helsinki
- **Prompt**: "I am looking for painter services in Helsinki. Which ones do you recommend?"
- **Expected**: Top 5 painting services in Helsinki

### Scenario 3: Global Company

- **Input**: Domain ending in `.com`, region: `global`
- **Location**: globally
- **Prompt**: "I am looking for painter services. Which ones do you recommend?"
- **Expected**: Top 5 global painting companies

## Technical Considerations

### 1. Region-Specific Results

- All prompts are in English, but include region-specific locations
- AI platforms should return companies relevant to that location
- Example: "Tallinn" will return Estonian companies, "Helsinki" will return Finnish companies

### 2. Location Names

- Use major cities for regions (capital cities or major business centers)
- For global, omit location or use "globally"
- Consider user-provided location in future (e.g., specific city instead of just country)

### 3. Industry Terms

- Keep industry terms in English
- AI platforms understand English industry terms globally
- Example: "painter", "web design", "accounting" work universally

### 4. Competitor Name Validation

- Already have `isValidCompetitorName` function
- May need to enhance for non-English names
- Handle special characters in names

### 5. Caching

- Cache competitor discovery results
- Update periodically (e.g., weekly)
- Store in database for historical tracking

## Database Changes

### No Schema Changes Needed

- `Company.targetRegions` already exists
- `Analysis.competitorsAnalyzed` already exists
- Can store competitor data in existing `Result.competitorsMentioned`

### Optional: New Table for Competitors

If we want to track competitors separately:

```prisma
model Competitor {
  id          String   @id @default(cuid())
  name        String
  domain      String?
  industry    String?
  region      String   // Region where competitor was discovered
  discoveredAt DateTime @default(now())
  companyId   String?  // If linked to a Company record

  @@unique([name, region])
  @@index([region])
}
```

## Testing Plan

1. **Unit Tests**
   - Language detection from region
   - Prompt generation for each language
   - Competitor name validation

2. **Integration Tests**
   - Full competitor discovery flow
   - Multiple regions/languages
   - Error handling

3. **Manual Testing**
   - Test with real companies in different regions
   - Verify prompt quality in each language
   - Check competitor extraction accuracy

## Future Enhancements

1. **User-Provided Location**: Allow users to specify exact city/location
2. **Multiple Languages**: Support companies operating in multiple languages
3. **Competitor Profiles**: Store more info about competitors (website, description)
4. **Competitor Tracking**: Track competitor SOV over time
5. **Competitive Analysis**: Compare your company vs competitors on various metrics

## Implementation Priority

1. **Phase 1** (MVP):
   - Region-to-location mapping utility
   - English prompt generation with region-specific locations
   - Basic competitor discovery API
   - Update existing TopCompetitors component to show region

2. **Phase 2**:
   - Enhanced competitor table with more details (SOV, platforms, etc.)
   - Caching and performance optimization
   - Better competitor name extraction and validation

3. **Phase 3**:
   - Competitor profiles and tracking
   - Advanced competitive analysis
   - Historical competitor data
   - User-provided custom locations
