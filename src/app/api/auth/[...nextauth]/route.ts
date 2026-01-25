import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Clean NEXTAUTH_URL if it has trailing backticks or special characters
// This fixes the redirect_uri error: visibility-report.vercel.app`/api/auth/callback/google
if (process.env.NEXTAUTH_URL) {
  const originalUrl = process.env.NEXTAUTH_URL
  // Remove trailing backticks, forward slashes, and whitespace
  const cleanedUrl = originalUrl.replace(/[`\/\s]+$/, '').trim()

  // #region agent log
  if (originalUrl !== cleanedUrl && typeof window === 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'auth/[...nextauth]/route.ts:7',
        message: 'Cleaned NEXTAUTH_URL (removed backtick)',
        data: {
          originalUrl,
          cleanedUrl,
          hasBacktick: originalUrl.includes('`'),
          callbackUrl: `${cleanedUrl}/api/auth/callback/google`,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {})
  }
  // #endregion

  // Override the environment variable to use the cleaned version
  process.env.NEXTAUTH_URL = cleanedUrl
}

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('Missing GOOGLE_CLIENT_ID environment variable')
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Missing GOOGLE_CLIENT_SECRET environment variable')
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error('Missing NEXTAUTH_SECRET environment variable')
}

// NextAuth v5 beta - create the auth instance
const auth = NextAuth(authOptions)

// #region agent log
// Log what NextAuth returns (server-side only)
const handlerType = typeof auth
const hasHandlers = auth && typeof auth === 'object' && 'handlers' in auth
const isFunction = typeof auth === 'function'
const authKeys = auth && typeof auth === 'object' ? Object.keys(auth) : []
console.log('[NextAuth Debug]', {
  handlerType,
  hasHandlers,
  isFunction,
  authKeys,
})
// #endregion

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
  throw new Error(`NextAuth returned unexpected type: ${typeof auth}`)
}

// #region agent log
console.log('[NextAuth Debug] Final handler type:', typeof handlerFn)
// #endregion

// Wrap handlers to catch errors and ensure valid responses
async function handleRequest(
  handlerFn: NextAuthHandler,
  req: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // #region agent log
  // Extract query params to check for OAuth errors
  const url = new URL(req.url)
  const errorParam = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  const callbackPath = url.pathname

  fetch('http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'auth/[...nextauth]/route.ts:95',
      message: 'NextAuth handler called',
      data: {
        method: req.method,
        url: req.url,
        pathname: callbackPath,
        errorParam,
        errorDescription,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        handlerType: typeof handlerFn,
        isFunction: typeof handlerFn === 'function',
        queryParams: Object.fromEntries(url.searchParams.entries()),
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'C',
    }),
  }).catch(() => {})
  // #endregion
  try {
    if (typeof handlerFn !== 'function') {
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'auth/[...nextauth]/route.ts:39',
            message: 'Handler is not a function',
            data: { handlerType: typeof handlerFn },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'E',
          }),
        }
      ).catch(() => {})
      // #endregion
      throw new Error(`Handler is not a function, got: ${typeof handlerFn}`)
    }
    const response = await handlerFn(req, context)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'auth/[...nextauth]/route.ts:29',
        message: 'NextAuth handler response',
        data: { responseExists: !!response, status: response?.status },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'E',
      }),
    }).catch(() => {})
    // #endregion

    // Ensure response is valid
    if (!response) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'auth/[...nextauth]/route.ts:33',
            message: 'NextAuth returned null response',
            data: {},
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'E',
          }),
        }
      ).catch(() => {})
      // #endregion
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

      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'auth/[...nextauth]/route.ts:101',
            message: 'NextAuth response body check',
            data: {
              hasBody: !!text,
              bodyLength: text.length,
              isEmpty: text.length === 0,
              status: response.status,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'E',
          }),
        }
      ).catch(() => {})
      // #endregion

      // If response is empty and not a redirect, return a proper error response
      if (!text || text.trim() === '') {
        // #region agent log
        fetch(
          'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'auth/[...nextauth]/route.ts:106',
              message: 'NextAuth empty response detected (non-redirect)',
              data: { status: response.status },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'E',
            }),
          }
        ).catch(() => {})
        // #endregion
        return new Response(
          JSON.stringify({
            error: 'Empty response from authentication server',
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // #region agent log
      fetch(
        'http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'auth/[...nextauth]/route.ts:114',
            message: 'NextAuth redirect response (empty body allowed)',
            data: { status: response.status },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'E',
          }),
        }
      ).catch(() => {})
      // #endregion
    }

    return response
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/464e2deb-8374-451b-9bcd-449856a4299f', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'auth/[...nextauth]/route.ts:58',
        message: 'NextAuth handler error',
        data: {
          errorName: error instanceof Error ? error.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'E',
      }),
    }).catch(() => {})
    // #endregion
    console.error('NextAuth handler error:', error)
    return new Response(
      JSON.stringify({
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error',
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
