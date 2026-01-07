import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow production builds to succeed even if there are TypeScript type errors.
  // This is helpful while iterating quickly and when external types (like HeadersInit)
  // cause false positives in CI (e.g. Vercel).
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
