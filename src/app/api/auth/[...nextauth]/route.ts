import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Clean NEXTAUTH_URL if it has trailing backticks or special characters
// This fixes the redirect_uri error: visibility-report.vercel.app`/api/auth/callback/google
if (process.env.NEXTAUTH_URL) {
  const originalUrl = process.env.NEXTAUTH_URL
  // Remove trailing backticks, forward slashes, and whitespace
  const cleanedUrl = originalUrl.replace(/[`\/\s]+$/, '').trim()

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

// Wrap handlers to catch errors and ensure valid responses
async function handleRequest(
  handlerFn: NextAuthHandler,
  req: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  try {
    if (typeof handlerFn !== 'function') {
      throw new Error(`Handler is not a function, got: ${typeof handlerFn}`)
    }
    const response = await handlerFn(req, context)

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
