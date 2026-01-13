import { cookies, headers } from 'next/headers'

// Helper function to get session in API routes (NextAuth v5 replacement for getServerSession)
// In NextAuth v5, we fetch the session from the NextAuth session endpoint
export async function getSession() {
  try {
    const cookieStore = await cookies()
    const headersList = await headers()

    // Build cookie header string
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    // Get the base URL from headers or environment
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`

    // Fetch session from NextAuth session endpoint
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        Cookie: cookieHeader,
        'User-Agent': headersList.get('user-agent') || 'Next.js',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const session = await response.json()
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}
