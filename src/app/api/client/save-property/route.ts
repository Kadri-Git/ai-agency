import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helper'
import { appendFileSync } from 'fs'

export async function POST(request: NextRequest) {
  // #region agent log
  const logPath =
    '/Users/kadri/Desktop/Vibe-coding/ai-visibility report/.cursor/debug.log'
  try {
    const logEntry = {
      location: 'save-property/route.ts:POST',
      message: 'Save property request received',
      data: {
        hasSession: true,
        hasAccessToken: false,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'B',
    }
    appendFileSync(logPath, JSON.stringify(logEntry) + '\n')
  } catch {}
  // #endregion

  try {
    const session = await getSession()

    // #region agent log
    try {
      const logEntry = {
        location: 'save-property/route.ts:afterGetSession',
        message: 'Session retrieved',
        data: {
          hasSession: !!session,
          hasAccessToken: !!session?.accessToken,
          hasRefreshToken: !!session?.refreshToken,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }
      appendFileSync(logPath, JSON.stringify(logEntry) + '\n')
    } catch {}
    // #endregion

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyId, email, accessToken, refreshToken, expiresAt } = body

    // #region agent log
    try {
      const logEntry = {
        location: 'save-property/route.ts:afterParseBody',
        message: 'Request body parsed',
        data: {
          hasPropertyId: !!propertyId,
          hasEmail: !!email,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasAuthToken: !!body.authToken,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }
      appendFileSync(logPath, JSON.stringify(logEntry) + '\n')
    } catch {}
    // #endregion

    if (!propertyId || !email) {
      return NextResponse.json(
        { error: 'Property ID and email are required' },
        { status: 400 }
      )
    }

    // Get API base URL
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    // Get the user's auth token from request body (passed from client)
    // The client should include their JWT token from localStorage
    const authToken = body.authToken

    if (!authToken) {
      return NextResponse.json(
        { error: 'App authentication token required' },
        { status: 401 }
      )
    }

    // Save to backend
    const response = await fetch(`${apiBaseUrl}/api/settings/ga4-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        ga4_property_id: propertyId,
        ga4_access_token: accessToken,
        ga4_refresh_token: refreshToken,
        ga4_token_expires_at: expiresAt
          ? new Date(expiresAt * 1000).toISOString()
          : null,
        ga4_connected_at: new Date().toISOString(),
      }),
    })

    // #region agent log
    try {
      const logEntry = {
        location: 'save-property/route.ts:beforeBackendCall',
        message: 'About to call backend',
        data: {
          apiBaseUrl,
          endpoint: '/api/settings/ga4-oauth',
          hasAuthToken: !!authToken,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }
      appendFileSync(logPath, JSON.stringify(logEntry) + '\n')
    } catch {}
    // #endregion

    if (!response.ok) {
      const error = await response.json()

      // #region agent log
      try {
        const logEntry = {
          location: 'save-property/route.ts:backendError',
          message: 'Backend returned error',
          data: {
            status: response.status,
            statusText: response.statusText,
            error: error,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'B',
        }
        appendFileSync(logPath, JSON.stringify(logEntry) + '\n')
      } catch {}
      // #endregion

      throw new Error(error.detail || 'Failed to save property')
    }

    const data = await response.json()

    // #region agent log
    try {
      const logEntry = {
        location: 'save-property/route.ts:success',
        message: 'Property saved successfully',
        data: {
          propertyId: data.ga4_property_id,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }
      appendFileSync(logPath, JSON.stringify(logEntry) + '\n')
    } catch {}
    // #endregion

    return NextResponse.json({
      message: 'Property connected successfully',
      propertyId: data.ga4_property_id,
    })
  } catch (error) {
    // #region agent log
    try {
      const logEntry = {
        location: 'save-property/route.ts:catch',
        message: 'Error in save-property route',
        data: {
          errorType:
            error instanceof Error ? error.constructor.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }
      appendFileSync(logPath, JSON.stringify(logEntry) + '\n')
    } catch {}
    // #endregion

    console.error('Error saving property:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to save property',
      },
      { status: 500 }
    )
  }
}
