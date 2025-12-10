'use client'

import { Moon, Sun, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ]

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="text-2xl font-bold tracking-tight">Citrus</span>
          <span className="text-sm font-bold text-muted-foreground hidden sm:inline">AI visibility agency</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isHashLink = link.href.startsWith('#')
            const isActive = pathname === link.href || (isHashLink && pathname === '/')
            
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => isHashLink && handleHashClick(e, link.href)}
                className={`text-sm transition-colors ${
                  isActive
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navLinks.map((link) => {
                const isHashLink = link.href.startsWith('#')
                return (
                  <DropdownMenuItem key={link.label} asChild>
                    <Link 
                      href={link.href}
                      onClick={(e) => isHashLink && handleHashClick(e, link.href)}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
