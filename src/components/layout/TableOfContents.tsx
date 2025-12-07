'use client'

import { useState } from 'react'
import { List } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export interface TocItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  items: TocItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
      setIsOpen(false)
    }
  }

  return (
    <div className="lg:hidden mb-10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full py-3 px-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm">
          <List className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">On this page</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 py-2 px-4 rounded-lg border border-border">
          <nav aria-label="Table of contents">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
