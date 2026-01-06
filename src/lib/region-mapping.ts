/**
 * Region Mapping Utility
 * Maps region codes to their primary city/location names for region-specific AI queries
 */

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

/**
 * Get the primary city/location name for a region code
 * @param region - Region code (e.g., 'ee', 'fi', 'us')
 * @returns City name (e.g., 'Tallinn', 'Helsinki', 'New York') or the region code if not found
 */
export function getLocationFromRegion(region: string): string {
  return regionToLocation[region.toLowerCase()] || region
}

/**
 * Get the display name for a region code
 * @param region - Region code (e.g., 'ee', 'fi', 'us')
 * @returns Display name (e.g., 'Estonia', 'Finland', 'United States') or the region code if not found
 */
export function getRegionDisplayName(region: string): string {
  return regionDisplayNames[region.toLowerCase()] || region
}

/**
 * Detect region from domain TLD (optional helper function)
 * @param domain - Domain name (e.g., 'example.ee', 'company.fi')
 * @returns Region code or null if not detected
 */
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


