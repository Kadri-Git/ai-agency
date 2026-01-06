# Testing Competitor Discovery Feature

## Quick Test

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test via UI (Recommended)

1. Open http://localhost:3000
2. Fill in the analysis form:
   - **Company URL**: Enter any domain (e.g., `example.com`)
   - **Region**: Select a region (e.g., `Estonia` for `ee`, `Finland` for `fi`)
   - **Industry**: Enter an industry (e.g., `painter`, `web design`, `accounting`)
3. Click "Analyze"
4. Wait for analysis to complete
5. Check the "Top 5 Competitors" section - it should show:
   - Region context (e.g., "Top competitors for Tallinn, Estonia")
   - Top 5 competitors with SOV percentages
   - Platform breakdown (ChatGPT, Claude, Gemini)

### 3. Test Competitor Discovery API Directly

You can test the competitor discovery endpoint directly:

```bash
curl -X POST http://localhost:3000/api/competitors \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Example Company",
    "companyDomain": "example.com",
    "industry": "painter",
    "region": "ee"
  }'
```

**Expected Response:**

```json
{
  "region": "ee",
  "regionDisplayName": "Estonia",
  "location": "Tallinn",
  "industry": "painter",
  "competitors": [
    {
      "name": "Competitor Name",
      "mentionCount": 5,
      "averagePosition": 2.5,
      "platforms": ["chatgpt", "claude", "gemini"],
      "sov": 15.2,
      "totalSov": 45.6,
      "byPlatform": {
        "chatgpt": 12.3,
        "claude": 15.8,
        "gemini": 17.5
      }
    }
    // ... up to 5 competitors
  ],
  "totalCompetitorsFound": 8,
  "promptsUsed": [
    "I am looking for painter services in Tallinn. Which ones do you recommend?",
    "What are the best painter companies in Tallinn?",
    "Can you recommend top painter providers in Tallinn?"
  ]
}
```

## Test Scenarios

### Scenario 1: Estonian Company

- **Region**: `ee` (Estonia)
- **Location**: Tallinn
- **Prompt**: "I am looking for painter services in Tallinn. Which ones do you recommend?"
- **Expected**: Top 5 painting companies in Tallinn

### Scenario 2: Finnish Company

- **Region**: `fi` (Finland)
- **Location**: Helsinki
- **Prompt**: "I am looking for painter services in Helsinki. Which ones do you recommend?"
- **Expected**: Top 5 painting services in Helsinki

### Scenario 3: Global Company

- **Region**: `global`
- **Location**: globally
- **Prompt**: "I am looking for painter services. Which ones do you recommend?"
- **Expected**: Top 5 global painting companies

## What to Verify

✅ **Region Mapping**

- Correct location is shown (e.g., `ee` → `Tallinn`)
- Region display name is correct (e.g., `ee` → `Estonia`)

✅ **Prompts**

- Prompts are in English
- Location is included in prompts (except for global)
- Prompts are natural and conversational

✅ **Competitor Discovery**

- Top 5 competitors are returned
- Competitors are relevant to the region
- SOV is calculated correctly
- Platform breakdown is shown

✅ **UI Display**

- TopCompetitors component shows region context
- Competitors are ranked by SOV
- Platform breakdown is visible

## Troubleshooting

### No Competitors Found

- Check API keys are configured
- Verify industry term is clear (e.g., "painter" not "painting services")
- Try a different region or industry

### Wrong Region/Location

- Verify region code is correct (e.g., `ee`, `fi`, `us`)
- Check `src/lib/region-mapping.ts` for region mappings

### Build Errors

- Run `npm run build` to check for TypeScript errors
- Ensure all imports are correct

## API Keys Required

Make sure you have at least one API key configured:

- `OPENAI_API_KEY` (for ChatGPT)
- `ANTHROPIC_API_KEY` (for Claude)
- `GOOGLE_AI_API_KEY` (for Gemini)

You can test with just one key - the system will use available platforms.


