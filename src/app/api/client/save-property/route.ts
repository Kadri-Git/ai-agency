import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helper'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyId, email, accessToken, refreshToken, expiresAt } = body

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

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to save property')
    }

    const data = await response.json()

    return NextResponse.json({
      message: 'Property connected successfully',
      propertyId: data.ga4_property_id,
    })
  } catch (error) {
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
