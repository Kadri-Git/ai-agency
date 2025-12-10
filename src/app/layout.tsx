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
  title: 'Citrus - AI Visibility Agency | Get Cited by ChatGPT, Gemini, Claude & Grok',
  description:
    'Citrus helps businesses improve their AI visibility and get cited by large language models including ChatGPT by OpenAI, Google Gemini, Anthropic Claude, and X Grok. We specialize in AI citation optimization, strategic content architecture, and helping companies become discoverable when users ask AI assistants about products and services. Learn how AI agents discover and cite businesses, and how to optimize your online presence for better AI visibility across major LLM platforms.',
  keywords: [
    'AI visibility',
    'AI citation',
    'ChatGPT visibility',
    'ChatGPT citation',
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
    'AI visibility optimization',
    'get cited by ChatGPT',
    'AI citation strategy',
    'how to get cited by AI',
    'AI agent citation',
    'ChatGPT business citation',
    'improve AI visibility',
  ],
  openGraph: {
    title: 'Citrus - AI Visibility Agency | Get Cited by ChatGPT, Gemini, Claude & Grok',
    description: 'Citrus helps businesses improve their AI visibility and get cited by large language models. Learn how AI agents discover businesses and optimize your presence for ChatGPT, Gemini, Claude, and Grok.',
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
