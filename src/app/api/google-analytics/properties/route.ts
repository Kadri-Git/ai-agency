import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helper'
import { google } from 'googleapis'

// Using NextAuth v5 - getSession replaces getServerSession

async function refreshTokenIfNeeded(session: {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}): Promise<string> {
  // Check if token is expired or will expire in the next 5 minutes
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = session.expiresAt || 0
  const bufferTime = 300 // 5 minutes buffer

  if (expiresAt > 0 && now >= expiresAt - bufferTime) {
    // Token is expired or about to expire, refresh it
    if (!session.refreshToken) {
      throw new Error('Token expired and no refresh token available')
    }

    const url = 'https://oauth2.googleapis.com/token'
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
      }),
      method: 'POST',
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }

      // If refresh token is invalid/expired, user needs to re-authenticate
      if (errorData.error === 'invalid_grant') {
        throw new Error(
          'REAUTH_REQUIRED: Please sign in again. Your session has expired.'
        )
      }

      throw new Error(`Token refresh failed: ${response.status} ${errorText}`)
    }

    const refreshedTokens = await response.json()
    return refreshedTokens.access_token
  }

  // Token is still valid
  return session.accessToken as string
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // #region agent log
    fetch(
      'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'google-analytics/properties/route.ts:GET:start',
          message: 'GA4 properties request',
          data: {
            hasSession: !!session,
            hasAccessToken: !!session?.accessToken,
            hasRefreshToken: !!session?.refreshToken,
            expiresAt: (session as { expiresAt?: number })?.expiresAt ?? null,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'ga-run',
          hypothesisId: 'GA1',
        }),
      }
    ).catch(() => {})
    // #endregion

    // Refresh token if expired
    const accessToken = await refreshTokenIfNeeded(
      session as {
        accessToken?: string
        refreshToken?: string
        expiresAt?: number
      }
    )

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: accessToken,
    })

    // Create Analytics Admin API client with proper auth
    const analyticsAdmin = google.analyticsadmin({
      version: 'v1beta',
      auth: oauth2Client,
    })

    // Use account summaries API - more efficient and returns properties directly
    let accountSummariesResponse
    try {
      accountSummariesResponse = await analyticsAdmin.accountSummaries.list()
    } catch {
      // Fallback to accounts.list if accountSummaries fails
      const accountsResponse = await analyticsAdmin.accounts.list()

      if (
        !accountsResponse.data.accounts ||
        accountsResponse.data.accounts.length === 0
      ) {
        return NextResponse.json({ properties: [] })
      }

      const properties: Array<{
        propertyId: string
        displayName: string
        account: string
      }> = []

      // For each account, list properties
      for (const account of accountsResponse.data.accounts) {
        if (!account.name) continue

        try {
          const propertiesResponse = await analyticsAdmin.properties.list({
            filter: `parent:${account.name}`,
          })

          if (propertiesResponse.data.properties) {
            for (const property of propertiesResponse.data.properties) {
              if (property.name && property.displayName) {
                const propertyId = property.name.split('/')[1]
                properties.push({
                  propertyId,
                  displayName: property.displayName,
                  account: account.displayName || account.name,
                })
              }
            }
          }
        } catch (error) {
          console.error(
            `Error fetching properties for account ${account.name}:`,
            error
          )
        }
      }

      return NextResponse.json({ properties })
    }

    // Process account summaries (preferred method)
    if (
      !accountSummariesResponse.data.accountSummaries ||
      accountSummariesResponse.data.accountSummaries.length === 0
    ) {
      return NextResponse.json({ properties: [] })
    }

    const properties: Array<{
      propertyId: string
      displayName: string
      account: string
    }> = []

    // Extract properties from account summaries
    for (const summary of accountSummariesResponse.data.accountSummaries) {
      if (summary.propertySummaries) {
        for (const propertySummary of summary.propertySummaries) {
          if (propertySummary.property && propertySummary.displayName) {
            // Extract property ID from property name (format: properties/123456789)
            const propertyId = propertySummary.property.split('/')[1]

            properties.push({
              propertyId,
              displayName: propertySummary.displayName,
              account: summary.displayName || summary.account || 'Unknown',
            })
          } else {
          }
        }
      }
    }

    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Error fetching GA4 properties:', error)

    // Check if re-authentication is required
    const errorMessage = error instanceof Error ? error.message : String(error)

    // #region agent log
    fetch(
      'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'google-analytics/properties/route.ts:GET:catch',
          message: 'GA4 properties error',
          data: {
            errorName: error instanceof Error ? error.name : typeof error,
            errorMessage,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'ga-run',
          hypothesisId: 'GA1',
        }),
      }
    ).catch(() => {})
    // #endregion

    if (errorMessage.includes('REAUTH_REQUIRED')) {
      return NextResponse.json(
        {
          error: 'Your session has expired. Please sign in again.',
          requiresReauth: true,
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: errorMessage || 'Failed to fetch GA4 properties',
      },
      { status: 500 }
    )
  }
}
