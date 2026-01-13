import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helper'
import { google } from 'googleapis'

// Using NextAuth v5 - getSession replaces getServerSession

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
    })

    // Create Analytics Admin API client
    const analyticsAdmin = google.analyticsadmin('v1beta')
    analyticsAdmin.context = { _options: { auth: oauth2Client } }

    // List all accounts
    const accountsResponse = await analyticsAdmin.accounts.list()

    if (!accountsResponse.data.accounts) {
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
              // Extract property ID from name (format: properties/123456789)
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
        // Continue with other accounts
      }
    }

    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Error fetching GA4 properties:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch GA4 properties',
      },
      { status: 500 }
    )
  }
}
