import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Get environment variables (don't throw during build - validate at runtime)
const googleClientId = process.env.GOOGLE_CLIENT_ID || ''
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
const nextAuthSecret =
  process.env.NEXTAUTH_SECRET || 'temporary-secret-for-build'

// Note: NEXTAUTH_URL should be set in environment variables
// If you see redirect_uri errors with backticks, ensure NEXTAUTH_URL
// in your environment doesn't have trailing backticks, slashes, or whitespace

// Only validate in production runtime, not during build
// Don't throw - just log warnings to allow better error messages
function validateEnvVars() {
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    const missing: string[] = []
    if (!process.env.GOOGLE_CLIENT_ID) {
      missing.push('GOOGLE_CLIENT_ID')
    }
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      missing.push('GOOGLE_CLIENT_SECRET')
    }
    if (!process.env.NEXTAUTH_SECRET) {
      missing.push('NEXTAUTH_SECRET')
    }
    if (!process.env.NEXTAUTH_URL) {
      missing.push('NEXTAUTH_URL')
    }

    if (missing.length > 0) {
      console.error(
        `Missing required environment variables: ${missing.join(', ')}. ` +
          `Please set these in Vercel Dashboard → Settings → Environment Variables`
      )
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
                  'openid email profile https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.manage.users.readonly',
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          }),
        ]
      : [], // Empty providers if credentials not set (allows build to succeed)
  callbacks: {
    async jwt({ token, account, user }) {
      // Check for OAuth errors
      if ((token as { error?: string }).error) {
        return token
      }

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
    async signIn() {
      return true
    },
  },
  pages: {
    signIn: '/connect-analytics',
  },
  secret: nextAuthSecret,
  debug: process.env.NODE_ENV === 'development',
}

// Validate environment variables at runtime (not during build)
// Only log warnings, don't throw to prevent server errors
validateEnvVars()

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
