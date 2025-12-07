import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AI Visibility Agency - Get Discovered by AI Agents | ChatGPT, Gemini, Claude, Grok',
  description:
    'AI Visibility Agency specializes in making businesses discoverable through large language models including ChatGPT by OpenAI, Google Gemini, Anthropic Claude, and X Grok. We help companies optimize their content for AI agent discovery and prepare for upcoming AI advertising opportunities on major LLM platforms.',
  keywords: [
    'AI visibility',
    'ChatGPT visibility',
    'Gemini visibility',
    'Claude visibility',
    'Grok visibility',
    'LLM marketing',
    'AI agent discovery',
    'AI search optimization',
    'AI advertising',
    'large language model marketing',
    'ChatGPT advertising',
    'Gemini advertising',
    'Claude advertising',
    'Grok advertising',
    'AI platform ads',
    'LLM platform advertising',
    'AI agent recommendations',
    'business discovery through AI',
    'AI-powered search optimization',
  ],
  openGraph: {
    title: 'AI Visibility Agency - Get Discovered by AI Agents',
    description: 'Make your business discoverable through ChatGPT, Gemini, Claude, Grok, and other leading AI platforms. Prepare for upcoming AI advertising opportunities.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
