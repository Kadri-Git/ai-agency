'use client'

import {
  TableOfContents,
  type TocItem,
} from '@/components/layout/TableOfContents'
import { Header } from '@/components/layout/Header'
import {
  Play,
  Package,
  Bot,
  ArrowUp,
  ExternalLink,
  Sun,
  Moon,
  Terminal,
  Rocket,
} from 'lucide-react'
import { useState, useEffect, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import Link from 'next/link'

function IconWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
      {children}
    </div>
  )
}

const tocItems: TocItem[] = [
  { id: 'getting-started', title: 'Getting Started', level: 2 },
  { id: 'video', title: 'Video Tutorial', level: 2 },
  { id: 'whats-inside', title: "What's Inside", level: 2 },
  { id: 'how-to-prompt', title: 'How to Prompt', level: 2 },
]

const dependencies = [
  {
    package: 'Next.js',
    subtitle: 'The Website Engine',
    url: 'https://nextjs.org/docs',
    description:
      'This is what makes your website actually work. It turns your pages into a real website that loads fast and looks great on Google. When you create a new page, it automatically gets a URL. Magic.',
  },
  {
    package: 'TypeScript',
    subtitle: 'Error Prevention',
    url: 'https://www.typescriptlang.org/docs',
    description:
      'Ever had your website break and you have no idea why? This catches mistakes before they become problems. It also helps AI understand your code better, so you get smarter suggestions.',
  },
  {
    package: 'Tailwind CSS',
    subtitle: 'Styling System',
    url: 'https://tailwindcss.com/docs',
    description:
      'How things look - colors, spacing, fonts, all of it. Instead of writing complicated style files, you just add words like "bg-blue-500" to make something blue. Sounds weird but it is actually amazing once you try it.',
  },
  {
    package: 'Shadcn/ui',
    subtitle: 'Ready-Made Components',
    url: 'https://ui.shadcn.com',
    description:
      'Buttons, cards, forms, dialogs, menus - all designed and ready to use. These live in your project so you can change them however you want. They already look good and work on phones too.',
  },
  {
    package: 'Storybook',
    subtitle: 'Component Playground',
    url: 'https://storybook.js.org/docs',
    description:
      'Run "npm run storybook" and you get a visual catalog of all your components. You can see how buttons look, test forms, play with different options. It is like a showroom for your website parts.',
  },
  {
    package: 'Zustand',
    subtitle: 'Shared Data',
    url: 'https://zustand.docs.pmnd.rs',
    description:
      'Sometimes different parts of your website need to know the same thing (like "is the menu open?"). This makes sharing that info super easy. Check out src/store/ for examples.',
  },
  {
    package: 'React Hook Form + Zod',
    subtitle: 'Smart Forms',
    url: 'https://react-hook-form.com/get-started',
    description:
      'Forms that actually work. They check if emails are real emails, if passwords are long enough, and show helpful error messages. See the example in src/components/forms/ to understand how.',
  },
  {
    package: 'ESLint + Prettier',
    subtitle: 'Code Cleanup',
    url: 'https://eslint.org/docs/latest',
    description:
      'Automatically makes your code look neat and catches silly mistakes. Every time you save a file, it gets cleaned up. No more messy code!',
  },
  {
    package: 'Husky + lint-staged',
    subtitle: 'Safety Net',
    url: 'https://typicode.github.io/husky',
    description:
      'Before you save your work, this checks if everything is okay. If something is broken, it tells you before you mess things up. Peace of mind.',
  },
  {
    package: 'next-themes',
    subtitle: 'Dark Mode',
    url: 'https://github.com/pacocoursey/next-themes',
    description:
      'Light theme, dark theme - already working. Click the sun/moon icon in the corner to try it. Your visitors can use whichever they prefer.',
  },
  {
    package: 'Lucide React',
    subtitle: 'Icons',
    url: 'https://lucide.dev/icons',
    description:
      'Over 1000 beautiful icons included. Hearts, arrows, menus, social media logos - whatever you need. Just ask AI to add an icon and it will know what to do.',
  },
  {
    package: 'Sonner',
    subtitle: 'Toast Notifications',
    url: 'https://sonner.emilkowal.ski',
    description:
      'Those little messages that pop up to tell you something worked (or did not). "Item added to cart!" or "Oops, something went wrong." Already styled and ready to use.',
  },
  {
    package: 'Vitest + Playwright',
    subtitle: 'Testing Tools',
    url: 'https://vitest.dev/guide',
    description:
      'Vitest for testing your code logic, Playwright for testing your website like a real user would click through it. Run "npm test" to check if things still work after you make changes.',
  },
  {
    package: 'Motion',
    subtitle: 'Animations',
    url: 'https://motion.dev/docs',
    description:
      'Make things move smoothly. Fade in elements, slide menus, animate buttons on hover. Motion (Framer Motion) makes animations easy to add and look professional.',
  },
]

const promptingTips = [
  {
    title: 'Be specific about what you want',
    description: 'The more details you give, the better results you get. Instead of "make a form", try:',
    prompt: 'Create a contact form with name, email, and message fields. Add a submit button. Show an error if email is invalid. Show a success message after submitting.',
  },
  {
    title: 'Use existing components and Tailwind',
    description: (
      <>
        Your project uses{' '}
        <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          Shadcn/ui
        </a>{' '}
        components (in src/components/ui/) styled with{' '}
        <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          Tailwind CSS
        </a>
        . Shadcn gives you pre-built pieces like buttons and cards. Tailwind lets you style anything with class names like &quot;bg-blue-500&quot; or &quot;p-4&quot;. Tell AI to use both:
      </>
    ),
    prompt: 'Create a pricing card using the Card component from @/components/ui/card and Button from @/components/ui/button. Style it with Tailwind classes. Add a blue gradient background and rounded corners.',
  },
  {
    title: 'Use the playground',
    description: 'Run "npm run storybook" first. Then you can say things like:',
    prompt: 'I saw a card with a footer in Storybook. Create something similar but for a product with an image, title, price, and "Add to cart" button.',
  },
  {
    title: 'Ask for changes step by step',
    description: 'Do not try to build everything at once. Start simple, then add:',
    prompt: 'First: "Create a simple navbar with a logo and three links." Then: "Add a mobile menu that opens when you tap a hamburger icon." Then: "Add dark mode toggle to the navbar."',
  },
  {
    title: 'When something breaks, explain what you see',
    description: 'AI cannot see your screen. Describe the problem:',
    prompt: 'The button is there but nothing happens when I click it. I expected it to open a popup. Here is the code: [paste your code]',
  },
  {
    title: 'Ask AI to explain',
    description: 'Do not just copy-paste. Learn as you go:',
    prompt: 'This code works but I do not understand what useEffect does. Can you explain it like I am 10 years old?',
  },
  {
    title: 'Request mobile-friendly designs',
    description: 'Always mention mobile. Otherwise you might get desktop-only layouts:',
    prompt: 'Create a hero section with a headline, subtitle, and two buttons. Make sure it looks good on phones too.',
  },
  {
    title: 'Save time with "similar to"',
    description: 'If you see something you like on another website:',
    prompt: 'Create a testimonial section similar to what Stripe has on their homepage. Use the Card component and add star ratings.',
  },
  {
    title: 'Never use time to fix bugs',
    description: 'If AI suggests using setTimeout or "wait 100ms" to fix a problem, reject it. That is a hack that will break later. Instead, find the real cause:',
    prompt: 'This works only when I add a setTimeout. That feels wrong. Can you fix it properly? I want to wait for the actual data to load, not guess how long it takes.',
  },
  {
    title: 'Ask AI to write and run tests',
    description: 'Tests catch bugs before users do. Ask AI to create them for important features:',
    prompt: 'Write tests for my checkout function. It should calculate the correct total, apply discounts, and handle empty carts. Run the tests and fix any failures.',
  },
]

export default function GuidePage() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        {/* Main layout */}
        <div className="max-w-6xl mx-auto">
          <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-16">
            {/* Content */}
            <div className="max-w-3xl">
              {/* Hero */}
              <section className="mb-20">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
                  How to use this starter kit
                </h1>
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p>
                    You just got yourself a fully loaded website starter kit. Everything
                    is already installed and configured. No setup headaches, no YouTube
                    tutorials needed.
                  </p>
                  
                  <div>
                    <h3 className="text-foreground font-medium mb-2">Why do you need this?</h3>
                    <p>
                      You do not need a computer science degree to build a website anymore. But if you start from scratch, you will spend days figuring out which tools to use, how to set them up, and why things are not working. This starter kit gives you a professional setup from day one. All the best practices, all the right tools, already configured. You do not need to know everything to create a product these days.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-foreground font-medium mb-2">How does it work?</h3>
                    <p>
                      This kit is built for vibe coding. You describe what you want to an AI (like Cursor), and it writes the code for you. Your job is to have ideas and give feedback. The AI already knows how this project is structured, so it gives you better code that actually works.
                    </p>
                  </div>
                  
                  <p>
                    Inside you will find ready-to-use buttons, cards, forms, icons, dark mode, and a bunch of other goodies. Think of it as IKEA furniture that is already assembled. You just arrange it how you want.
                  </p>
                </div>
              </section>
              {/* Mobile TOC */}
              <TableOfContents items={tocItems} />

              {/* Getting Started Section */}
              <section id="getting-started" className="mb-20 scroll-mt-24">
                <div className="flex items-center gap-4 mb-8">
                  <IconWrapper>
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                  </IconWrapper>
                  <h2 className="text-xl font-medium">Getting Started</h2>
                </div>

                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Before you start, make sure you have{' '}
                  <a
                    href="https://nodejs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground transition-colors"
                  >
                    Node.js
                  </a>{' '}
                  installed (version 20.9+ or 22.12+). Then open your terminal in the project folder.
                </p>

                <div className="space-y-8">
                  {/* Step 1 */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-medium">1</span>
                      <h3 className="font-medium">First time setup (only once)</h3>
                    </div>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 border border-border/50 ml-10">
                      <code className="text-base font-mono">npm install</code>
                      <p className="text-sm text-muted-foreground mt-2">Downloads all the packages your project needs. You only run this once when you first get the project, or when someone adds new packages.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-medium">2</span>
                      <h3 className="font-medium">Every time you develop</h3>
                    </div>
                    <div className="space-y-3 ml-10">
                      <div className="bg-muted/50 rounded-lg px-4 py-3 border border-border/50">
                        <code className="text-base font-mono">npm run dev</code>
                        <p className="text-sm text-muted-foreground mt-2">Starts your website at localhost:3000. Every change you make shows up here instantly. Keep this running while you work.</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg px-4 py-3 border border-border/50">
                        <code className="text-base font-mono">npm run storybook</code>
                        <p className="text-sm text-muted-foreground mt-2">Opens the component playground at localhost:6006 (run in a second terminal). This shows all your buttons, cards, and components in isolation. Great for designing pieces without touching your main app.</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-medium">3</span>
                      <h3 className="font-medium">When you finish a feature</h3>
                    </div>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 border border-border/50 ml-10">
                      <code className="text-base font-mono">npm test</code>
                      <p className="text-sm text-muted-foreground mt-2">Runs all your tests to make sure nothing broke. Do this before you share your code or deploy. Catches bugs before your users do.</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-medium">4</span>
                      <h3 className="font-medium">When you are ready to go live</h3>
                    </div>
                    <div className="bg-muted/50 rounded-lg px-4 py-3 border border-border/50 ml-10 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Right now your website only works on your computer. To put it on the internet where anyone can visit it, you need two things:
                      </p>
                      
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">GitHub</p>
                        <p className="text-sm text-muted-foreground">
                          Think of{' '}
                          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">GitHub</a>
                          {' '}as a cloud backup for your code. You save your project there, and it keeps track of every change you make. It is free. Create an account, then use Cursor to &quot;push&quot; your code to GitHub.
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Vercel</p>
                        <p className="text-sm text-muted-foreground">
                          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Vercel</a>
                          {' '}is like a web host, but way easier. It takes your code from GitHub and turns it into a real website with a URL anyone can visit. Also free for personal projects. Sign up with your GitHub account, click &quot;Add New Project&quot;, pick your project, and hit &quot;Deploy&quot;. Done.
                        </p>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        The magic: every time you push new code to GitHub, Vercel notices and updates your website automatically. No extra steps needed.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Video Section */}
              <section id="video" className="mb-20 scroll-mt-24">
                <div className="flex items-center gap-4 mb-8">
                  <IconWrapper>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </IconWrapper>
                  <h2 className="text-xl font-medium">Video Tutorial</h2>
                </div>

                <div className="rounded-lg overflow-hidden border border-border">
                  <div className="aspect-video bg-muted">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/t9ZXP2djh0E"
                      title="Next Vibe Starter Tutorial"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Watch the walkthrough to get started quickly.
                </p>
              </section>

              {/* What's Inside Section */}
              <section id="whats-inside" className="mb-20 scroll-mt-24">
                <div className="flex items-center gap-4 mb-8">
                  <IconWrapper>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </IconWrapper>
                  <h2 className="text-xl font-medium">What&apos;s Inside</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dependencies.map((dep) => (
                    <div key={dep.package}>
                      <a
                        href={dep.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 text-base font-medium hover:text-primary transition-colors"
                      >
                        {dep.package}
                        <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <p className="text-sm text-muted-foreground mb-1.5">{dep.subtitle}</p>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {dep.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* How to Prompt Section */}
              <section id="how-to-prompt" className="mb-20 scroll-mt-24">
                <div className="flex items-center gap-4 mb-8">
                  <IconWrapper>
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </IconWrapper>
                  <h2 className="text-xl font-medium">How to Prompt</h2>
                </div>

                <p className="text-muted-foreground mb-10 leading-relaxed">
                  The magic of vibe coding is talking to AI and getting working code back. 
                  Here is how to get the best results. Think of it like ordering food - 
                  the more specific you are, the happier you will be with what arrives.
                </p>

                <div className="space-y-10">
                  {promptingTips.map((tip, index) => (
                    <div key={tip.title}>
                      <div className="flex items-start gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0">
                          {index + 1}
                        </span>
                        <div className="space-y-3 flex-1">
                          <h3 className="font-medium text-lg">{tip.title}</h3>
                          <p className="text-md text-muted-foreground">
                            {tip.description}
                          </p>
                          <div className="bg-muted/50 rounded-lg px-4 py-3 border border-border/50">
                            <p className="text-md text-muted-foreground italic">
                              &ldquo;{tip.prompt}&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Ready to Build CTA */}
              <section className="mb-20">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 md:p-12 border border-primary/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">
                      <Rocket className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-semibold">Ready to build?</h2>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-xl">
                    You have read the guide. Now it is time to make something amazing. 
                    Your starter project already has a homepage, about page, and contact page 
                    waiting for you to customize.
                  </p>
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/">
                      <Rocket className="h-4 w-4" />
                      Go to Your App
                    </Link>
                  </Button>
                </div>
              </section>

              {/* Footer */}
              <section className="border-t border-border pt-10">
                <div className="flex flex-wrap gap-6 text-sm">
                  <span className="text-muted-foreground">
                    Created by{' '}
                    <a
                      href="https://apek.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      Antonija Pek
                    </a>
                  </span>
                  <a
                    href="https://discord.gg/RFhxEkz4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Discord
                  </a>
                </div>
              </section>
            </div>

            {/* Desktop TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  On this page
                </p>
                <nav>
                  <ul className="space-y-2">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-1"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Floating controls */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Scroll to top */}
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 shadow-sm"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

