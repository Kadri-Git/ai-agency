# Next Vibe Starter - Complete Guide 🎨

> **Start Here:** This starter kit is designed for you to jump straight into Storybook. Think of the code structure as the amazing canvas you just bought—all the setup is done. Now it's time to create.

## Table of Contents

1. [Design-First Workflow](#design-first-workflow)
2. [What's Inside & Why](#whats-inside--why)
3. [Usage Instructions](#usage-instructions)
4. [AI Coding Best Practices](#ai-coding-best-practices)
5. [Customization Guide](#customization-guide)

---

## Design-First Workflow

### Why Storybook First?

Storybook is your **component workshop**. Before adding components to your pages, you should:

1. **Explore** - Browse existing components and their variants
2. **Experiment** - Test different props and states
3. **Understand** - See how components work in isolation
4. **Build** - Create new components with instant visual feedback

### Getting Started with Storybook

```bash
npm run storybook
```

This opens Storybook at `http://localhost:6006`. You'll see:

- **UI Components** - Button, Input, Card, Badge, etc.
- **Layout Components** - Header with dark mode toggle
- **Interactive Controls** - Change props in real-time
- **Documentation** - Auto-generated from TypeScript types

### Workflow Example

**Scenario:** You want to add a settings page with a form.

1. **Open Storybook** → Browse `UI/Button` and `UI/Input`
2. **Inspect Props** → See what variants and sizes are available
3. **Copy Component Usage** → Use the code from Storybook
4. **Build Your Page** → Compose components together

```tsx
// You saw this in Storybook, now use it in your page
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  return (
    <div>
      <Input placeholder="Enter your name" />
      <Button variant="default">Save</Button>
    </div>
  )
}
```

---

## What's Inside & Why

### Core Stack

#### Next.js 16

**Why?** Industry-standard React framework with excellent performance, SEO, and developer experience. App Router provides modern, file-based routing.

#### TypeScript

**Why?** Catch errors before runtime, better IDE support, and essential for AI-assisted coding. The AI can understand your types and provide better suggestions.

#### Tailwind CSS 4

**Why?** Utility-first CSS that's faster to write than traditional CSS. No context switching between files. Perfect for rapid prototyping.

### UI & Design

#### Shadcn/ui

**Why?** Not a component library you install—it's code you own. Copy components into your project and customize freely. Built on Radix UI for accessibility.

**Key Point:** These aren't npm packages. The components live in `src/components/ui/` and you can modify them however you want.

#### next-themes

**Why?** Dead-simple dark mode. One hook (`useTheme`) and it just works. Respects system preferences automatically.

#### Lucide Icons

**Why?** Beautiful, consistent icons. Tree-shakeable (only imports icons you use). Perfect for modern UIs.

### State & Data

#### Zustand

**Why?** Minimal boilerplate state management. No providers, no context, just a hook. Perfect for global state like sidebar visibility, user preferences, etc.

**When to use:**

- Global UI state (sidebar open/closed, modal state)
- User preferences (theme, language)
- Simple app-wide data

**When NOT to use:**

- Server data (use TanStack Query or Next.js server components)
- Form state (use React Hook Form)

#### React Hook Form + Zod

**Why?** Type-safe form validation with minimal re-renders. Zod schemas provide runtime validation and TypeScript types in one place.

**Example:**

```tsx
const schema = z.object({
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+'),
})

type FormData = z.infer<typeof schema> // TypeScript type from schema!
```

### Code Quality

#### ESLint + Prettier

**Why?** Consistent code style across your team (or AI-generated code). ESLint catches bugs, Prettier formats code.

**Crucial Rules:**

- `@typescript-eslint/no-unused-vars` - Cleans up AI-generated code
- `react/jsx-key` - Prevents React key warnings
- `jsx-a11y/*` - Ensures accessibility

#### Husky

**Why?** Pre-commit hooks automatically format and lint your code before committing. No more "forgot to run prettier" commits.

---

## Usage Instructions

### Adding a New Page

1. Create a file in `src/app/`:

```tsx
// src/app/about/page.tsx
export default function AboutPage() {
  return <div>About Page</div>
}
```

2. Access at `/about`

### Using Shadcn Components

All components are in `src/components/ui/`. Import and use:

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function MyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

### Adding More Shadcn Components

```bash
npx shadcn@latest add [component-name]
```

Example:

```bash
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add alert
```

This adds the component to `src/components/ui/`.

### Creating Forms

See `src/components/forms/SubscriptionForm.tsx` for a complete example.

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Using Zustand Store

See `src/store/useAppStateStore.ts` for an example.

```tsx
// Create a store
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

// Use in component
function Counter() {
  const count = useStore((state) => state.count)
  const increment = useStore((state) => state.increment)

  return <button onClick={increment}>{count}</button>
}
```

### Dark Mode

Dark mode is already configured. Use the theme hook:

```tsx
'use client'

import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle theme
    </button>
  )
}
```

---

## AI Coding Best Practices

This starter is optimized for AI-assisted development. Here's how to get the best results:

### 1. Reference Components by Import Path

**Good Prompt:**

> "Create a settings form using the `<Input>` and `<Button>` components from `@/components/ui/`"

**Why?** The AI knows exactly which components to use and can see their TypeScript types.

### 2. Use Storybook as Context

**Good Prompt:**

> "I want a card layout similar to the 'WithFooter' story in the Card component. Add a form inside with email input and submit button."

**Why?** Storybook stories serve as examples the AI can reference.

### 3. Specify Type Safety

**Good Prompt:**

> "Create a Zod schema for a user profile form with name (string, min 2 chars), email (valid email), and age (number, min 18)"

**Why?** The AI will generate type-safe validation that catches errors.

### 4. Leverage Existing Patterns

**Good Prompt:**

> "Create a new Zustand store for cart state, similar to `useAppStateStore`, with items array and addItem/removeItem actions"

**Why?** The AI can follow the established pattern in your codebase.

### 5. Request Accessibility

**Good Prompt:**

> "Create a modal dialog using the Shadcn Dialog component with proper ARIA labels and keyboard navigation"

**Why?** Shadcn components are accessible by default, and the AI will maintain that.

### 6. Ask for Storybook Stories

**Good Prompt:**

> "Create a ProductCard component and a Storybook story showing it with and without an image"

**Why?** Forces you to think about component states and creates documentation.

---

## Customization Guide

### Changing Colors

Colors are defined in `src/app/globals.css`. The starter uses CSS variables for theming:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    /* ... more colors */
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    /* ... more colors */
  }
}
```

**To change the color scheme:**

1. Visit [ui.shadcn.com/themes](https://ui.shadcn.com/themes)
2. Pick a theme or customize colors
3. Copy the CSS variables
4. Replace in `globals.css`

**Result:** Entire app updates to new colors, including dark mode.

### Changing Fonts

Fonts are configured in `src/app/layout.tsx`:

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

**To use a different font:**

1. Browse [Google Fonts](https://fonts.google.com/)
2. Import in `layout.tsx`:

```tsx
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
})
```

3. Apply: `<body className={poppins.className}>`

### Adding Environment Variables

1. Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...
```

2. Use in code:

```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

**Note:** `NEXT_PUBLIC_*` variables are exposed to the browser. Others are server-only.

### Modifying ESLint Rules

Edit `eslint.config.mjs`:

```js
rules: {
  '@typescript-eslint/no-unused-vars': 'warn', // Change to warning
  'react/jsx-key': 'off', // Disable rule
}
```

### Customizing Prettier

Edit `.prettierrc`:

```json
{
  "semi": true, // Add semicolons
  "printWidth": 100, // Longer lines
  "tabWidth": 4 // 4-space tabs
}
```

---

## Tips & Tricks

### Quick Component Creation

Use Shadcn CLI to scaffold components:

```bash
npx shadcn@latest add --help
```

### Debugging Dark Mode

If dark mode isn't working:

1. Check `suppressHydrationWarning` is on `<html>` tag
2. Verify ThemeProvider wraps your app
3. Use `'use client'` directive in components using `useTheme`

### Performance Tips

1. **Use Server Components by default** - Only add `'use client'` when needed
2. **Lazy load heavy components** - Use `next/dynamic`
3. **Optimize images** - Use `next/image` component

### Storybook Tips

1. **Hot reload** - Storybook updates as you edit components
2. **Accessibility tab** - Check a11y violations automatically
3. **Viewport addon** - Test responsive designs

---

## Common Patterns

### Protected Routes

```tsx
// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return <div>{children}</div>
}
```

### API Routes

```tsx
// src/app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello' })
}

export async function POST(request: Request) {
  const body = await request.json()
  return Response.json({ received: body })
}
```

### Loading States

```tsx
// src/app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading...</div>
}
```

---

## Getting Help

- **Storybook Docs**: Run `npm run storybook` and click "Docs" tab
- **Shadcn Docs**: [ui.shadcn.com](https://ui.shadcn.com/)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

**Happy coding! 🚀** Remember: start with Storybook, build with confidence, and let AI handle the boilerplate.
