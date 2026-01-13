import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Get environment variables (don't throw during build - validate at runtime)
const googleClientId = process.env.GOOGLE_CLIENT_ID || ''
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
const nextAuthSecret =
  process.env.NEXTAUTH_SECRET || 'temporary-secret-for-build'

// Clean NEXTAUTH_URL - remove trailing backticks, slashes, and whitespace
// The error shows redirect_uri has a backtick: visibility-report.vercel.app`/api/auth/callback/google
function cleanNextAuthUrl(url: string | undefined): string {
  if (!url) return 'http://localhost:3000'
  // Remove trailing backticks, forward slashes, and whitespace
  return url.replace(/[`\/\s]+$/, '').trim()
}

const nextAuthUrlRaw = process.env.NEXTAUTH_URL
const nextAuthUrl = cleanNextAuthUrl(nextAuthUrlRaw)

// #region agent log
// Log NEXTAUTH_URL to debug redirect URI issue
if (typeof window === 'undefined') {
  fetch('http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'auth.ts:14',
      message: 'NEXTAUTH_URL configuration check',
      data: {
        rawNextAuthUrl: nextAuthUrlRaw,
        cleanedNextAuthUrl: nextAuthUrl,
        hasBacktick: nextAuthUrlRaw?.includes('`') || false,
        callbackUrl: `${nextAuthUrl}/api/auth/callback/google`,
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A',
    }),
  }).catch(() => {})
}
// #endregion

// Only validate in production runtime, not during build
function validateEnvVars() {
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('Missing GOOGLE_CLIENT_ID environment variable')
    }
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Missing GOOGLE_CLIENT_SECRET environment variable')
    }
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error('Missing NEXTAUTH_SECRET environment variable')
    }
  }
}

export const authOptions: NextAuthOptions = {
  // Explicitly set the base URL to prevent backtick issues
  // NextAuth v5 uses NEXTAUTH_URL from process.env, but we override it here if it has issues
  // Set url option to ensure clean URL (NextAuth v5 beta may support this)
  // If url is not supported, we'll need to ensure NEXTAUTH_URL env var is clean in Vercel
  providers:
    googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            authorization: {
              params: {
                scope:
                  'openid email profile https://www.googleapis.com/auth/analytics.readonly',
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          }),
        ]
      : [], // Empty providers if credentials not set (allows build to succeed)
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in - store tokens
      if (account && user) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.idToken = account.id_token
      }

      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        return token
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token)
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.expiresAt = token.expiresAt as number
      return session
    },
  },
  pages: {
    signIn: '/connect-analytics',
  },
  secret: nextAuthSecret,
  debug: process.env.NODE_ENV === 'development',
  // #region agent log
  // Log final authOptions configuration
  ...(typeof window === 'undefined'
    ? {
        // This will be evaluated server-side
        _finalConfig: (() => {
          fetch(
            'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'auth.ts:75',
                message: 'Final NextAuth configuration',
                data: {
                  nextAuthUrl,
                  expectedCallbackUrl: `${nextAuthUrl}/api/auth/callback/google`,
                  hasProviders: googleClientId && googleClientSecret,
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'A',
              }),
            }
          ).catch(() => {})
          return {}
        })(),
      }
    : {}),
  // #endregion
}

// Validate environment variables at runtime (not during build)
if (typeof window === 'undefined') {
  validateEnvVars()
}

async function refreshAccessToken(token: {
  refreshToken?: string
  expiresAt?: number
  accessToken?: string
  [key: string]: unknown
}) {
  try {
    const url = 'https://oauth2.googleapis.com/token'
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
      method: 'POST',
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` }
      }
      throw errorData
    }

    const text = await response.text()
    if (!text) {
      throw new Error('Empty response from token refresh endpoint')
    }

    const refreshedTokens = JSON.parse(text)

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.error('Error refreshing access token', error)
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}
