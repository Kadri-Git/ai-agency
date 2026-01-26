import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { appendFileSync } from 'fs'

// Clean NEXTAUTH_URL if it has trailing backticks or special characters
// This fixes the redirect_uri error: visibility-report.vercel.app`/api/auth/callback/google
if (process.env.NEXTAUTH_URL) {
  const originalUrl = process.env.NEXTAUTH_URL
  // Remove trailing backticks, forward slashes, and whitespace
  const cleanedUrl = originalUrl.replace(/[`\/\s]+$/, '').trim()

  // Override the environment variable to use the cleaned version
  process.env.NEXTAUTH_URL = cleanedUrl
}

// Validate required environment variables (only log, don't throw during build)
if (process.env.NODE_ENV === 'production') {
  const missingVars: string[] = []
  if (!process.env.GOOGLE_CLIENT_ID) {
    missingVars.push('GOOGLE_CLIENT_ID')
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    missingVars.push('GOOGLE_CLIENT_SECRET')
  }
  if (!process.env.NEXTAUTH_SECRET) {
    missingVars.push('NEXTAUTH_SECRET')
  }
  if (!process.env.NEXTAUTH_URL) {
    missingVars.push('NEXTAUTH_URL')
  }

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables in production: ${missingVars.join(', ')}. ` +
        `Please set these in Vercel Dashboard → Settings → Environment Variables`
    )
  }
}

// NextAuth v5 beta - create the auth instance
const auth = NextAuth(authOptions)

// Determine the correct handler based on what NextAuth returns
type NextAuthHandler = (
  req: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) => Promise<Response>
let handlerFn: NextAuthHandler

if (typeof auth === 'function') {
  // Handler is a function - use directly
  handlerFn = auth as NextAuthHandler
} else if (auth && typeof auth === 'object' && 'handlers' in auth) {
  // Handler has a handlers property (NextAuth v5 beta pattern)
  const handlers = (
    auth as { handlers: { GET: NextAuthHandler; POST: NextAuthHandler } }
  ).handlers
  // Use a wrapper that routes to the correct handler
  handlerFn = async (
    req: Request,
    context: { params: Promise<{ nextauth: string[] }> }
  ) => {
    const method = req.method
    if (method === 'GET' && handlers.GET) return handlers.GET(req, context)
    if (method === 'POST' && handlers.POST) return handlers.POST(req, context)
    throw new Error(`Unsupported method: ${method}`)
  }
} else if (auth && typeof auth === 'object') {
  // Try to get GET and POST from auth object
  const authObj = auth as { GET?: NextAuthHandler; POST?: NextAuthHandler }
  if (authObj.GET && authObj.POST) {
    handlerFn = async (
      req: Request,
      context: { params: Promise<{ nextauth: string[] }> }
    ) => {
      const method = req.method
      if (method === 'GET') return authObj.GET!(req, context)
      if (method === 'POST') return authObj.POST!(req, context)
      throw new Error(`Unsupported method: ${method}`)
    }
  } else {
    // Last resort - use auth directly
    handlerFn = auth as NextAuthHandler
  }
} else {
  // Log what we got for debugging
  console.error('NextAuth initialization failed:', {
    authType: typeof auth,
    authValue: auth,
    hasHandlers: auth && typeof auth === 'object' && 'handlers' in auth,
    authKeys: auth && typeof auth === 'object' ? Object.keys(auth) : [],
  })
  throw new Error(
    `NextAuth returned unexpected type: ${typeof auth}. ` +
      `This may indicate a NextAuth configuration issue. ` +
      `Please check that GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXTAUTH_SECRET are set in Vercel environment variables.`
  )
}

// Wrap handlers to catch errors and ensure valid responses
async function handleRequest(
  handlerFn: NextAuthHandler,
  req: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // #region agent log
  const logPath =
    '/Users/kadri/Desktop/Vibe-coding/ai-visibility report/.cursor/debug.log'
  try {
    const url = new URL(req.url)
    const params = await context.params
    const logEntry = {
      location: 'auth/[...nextauth]/route.ts:handleRequest',
      message: 'NextAuth request received',
      data: {
        method: req.method,
        pathname: url.pathname,
        searchParams: Object.fromEntries(url.searchParams.entries()),
        nextauthParams: params.nextauth,
        hasAuthHeader: req.headers.get('authorization') ? true : false,
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A',
    }
    appendFileSync(logPath, JSON.stringify(logEntry) + '\n')
  } catch {}
  // #endregion

  try {
    if (typeof handlerFn !== 'function') {
      throw new Error(`Handler is not a function, got: ${typeof handlerFn}`)
    }
    const response = await handlerFn(req, context)

    // #region agent log
    try {
      const logEntry = {
        location: 'auth/[...nextauth]/route.ts:afterHandler',
        message: 'NextAuth handler response',
        data: {
          status: response?.status,
          statusText: response?.statusText,
          headers: Object.fromEntries(response?.headers.entries() || []),
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }
      appendFileSync(logPath, JSON.stringify(logEntry) + '\n')
    } catch {}
    // #endregion

    // Ensure response is valid
    if (!response) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Redirect responses (3xx) are allowed to have empty bodies
    // Only check for empty bodies on non-redirect responses
    const isRedirect = response.status >= 300 && response.status < 400

    if (!isRedirect) {
      // Clone response to check if body is empty (only for non-redirects)
      const cloned = response.clone()
      const text = await cloned.text().catch(() => '')

      // If response is empty and not a redirect, return a proper error response
      if (!text || text.trim() === '') {
        return new Response(
          JSON.stringify({
            error: 'Empty response from authentication server',
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } else {
    }

    return response
  } catch (error) {
    console.error('NextAuth handler error:', error)

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    // Check for common configuration issues
    let helpfulMessage = 'Authentication error'
    if (
      errorMessage.includes('NEXTAUTH_URL') ||
      errorMessage.includes('redirect_uri')
    ) {
      helpfulMessage =
        'NEXTAUTH_URL configuration error. Please check your Vercel environment variables.'
    } else if (errorMessage.includes('GOOGLE_CLIENT')) {
      helpfulMessage =
        'Google OAuth credentials missing. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel.'
    } else if (errorMessage.includes('NEXTAUTH_SECRET')) {
      helpfulMessage =
        'NEXTAUTH_SECRET missing. Please set it in Vercel environment variables.'
    }

    return new Response(
      JSON.stringify({
        error: helpfulMessage,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && errorStack
          ? { stack: errorStack }
          : {}),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  return handleRequest(handlerFn, req, context)
}

export async function POST(
  req: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  return handleRequest(handlerFn, req, context)
}
