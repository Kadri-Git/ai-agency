import type { Meta, StoryObj } from '@storybook/react'

const WelcomePage = () => (
  <div className="max-w-3xl mx-auto p-8">
    <h1 className="text-3xl font-bold tracking-tight mb-4">Welcome to Your Component Library</h1>
    
    <p className="text-muted-foreground mb-6 leading-relaxed">
      This is <strong>Storybook</strong> - your visual playground for all the UI components 
      in this project. Browse the sidebar to see buttons, cards, inputs, and more. Click on 
      any component to see it live and try different options.
    </p>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-semibold tracking-tight mb-4">Design Principles</h2>

    <div className="space-y-6 mb-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Typography</h3>
        <p className="text-muted-foreground leading-relaxed">
          This project uses <strong>Geist</strong> - a clean, modern font designed by Vercel. 
          Geist Sans for body text, Geist Mono for code. Headings use <code className="text-sm bg-muted px-1.5 py-0.5 rounded">tracking-tight</code> for 
          a polished look, body text uses <code className="text-sm bg-muted px-1.5 py-0.5 rounded">leading-relaxed</code> for readability.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Colors</h3>
        <p className="text-muted-foreground leading-relaxed">
          The color system adapts to light and dark mode automatically. Use semantic color 
          classes like <code className="text-sm bg-muted px-1.5 py-0.5 rounded">bg-primary</code>, <code className="text-sm bg-muted px-1.5 py-0.5 rounded">text-muted-foreground</code>, 
          and <code className="text-sm bg-muted px-1.5 py-0.5 rounded">border-border</code> instead of hardcoded colors. This keeps everything 
          consistent and theme-aware.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Components</h3>
        <p className="text-muted-foreground leading-relaxed">
          All UI components live in <code className="text-sm bg-muted px-1.5 py-0.5 rounded">src/components/ui/</code> and come from 
          Shadcn/ui - accessible, well-tested, and ready to use. Always check here before 
          building something custom. Need a new one? Run <code className="text-sm bg-muted px-1.5 py-0.5 rounded">npx shadcn@latest add [name]</code>.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Styling</h3>
        <p className="text-muted-foreground leading-relaxed">
          Everything is styled with Tailwind CSS. No separate CSS files needed. Add classes 
          directly to elements: <code className="text-sm bg-muted px-1.5 py-0.5 rounded">className=&quot;p-4 rounded-lg bg-card&quot;</code>. 
          For responsive design, use prefixes like <code className="text-sm bg-muted px-1.5 py-0.5 rounded">md:</code> and <code className="text-sm bg-muted px-1.5 py-0.5 rounded">lg:</code>.
        </p>
      </div>
    </div>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-semibold tracking-tight mb-4">What Are Stories?</h2>

    <p className="text-muted-foreground leading-relaxed mb-4">
      A <strong>story</strong> is a saved example of a component in a specific state. 
      One component can have multiple stories showing different variations - like a Button 
      with &quot;Primary&quot;, &quot;Secondary&quot;, and &quot;Destructive&quot; variants, or an Input in 
      &quot;Default&quot; vs &quot;Disabled&quot; states.
    </p>

    <p className="text-muted-foreground leading-relaxed mb-6">
      Stories are written in files ending with <code className="text-sm bg-muted px-1.5 py-0.5 rounded">.stories.tsx</code>. 
      Storybook finds them automatically and displays them in the sidebar.
    </p>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-semibold tracking-tight mb-4">What Is a Component?</h2>

    <p className="text-muted-foreground leading-relaxed mb-4">
      A component is a reusable piece of your website. Instead of copying the same button code 
      everywhere, you create one Button component and use it wherever you need a button. Change 
      it once, it updates everywhere.
    </p>

    <p className="text-muted-foreground leading-relaxed mb-6">
      Think of it like LEGO blocks. A Card is one block. A Button is another. You snap them 
      together to build pages. The sidebar here shows all the blocks you have available.
    </p>

    <h3 className="text-lg font-medium mb-3">When should you make a new component?</h3>

    <div className="space-y-3 mb-8">
      <div className="flex gap-3">
        <span className="text-primary font-medium">Yes:</span>
        <p className="text-muted-foreground">You are using the same thing on multiple pages (like a pricing card that appears on the homepage and pricing page)</p>
      </div>
      <div className="flex gap-3">
        <span className="text-primary font-medium">Yes:</span>
        <p className="text-muted-foreground">Something is getting complicated and you want to work on it separately (like a complex form)</p>
      </div>
      <div className="flex gap-3">
        <span className="text-muted-foreground font-medium">No:</span>
        <p className="text-muted-foreground">It only appears once and is simple - just build it directly on the page</p>
      </div>
    </div>

    <hr className="my-8 border-border" />

    <h2 className="text-2xl font-semibold tracking-tight mb-4">Adding a New Component</h2>

    <p className="text-muted-foreground leading-relaxed mb-6">
      Just tell the AI what you need. It knows where to put things and how to set up stories.
    </p>

    <div className="space-y-4 mb-8">
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <p className="text-sm text-muted-foreground mb-2">Need a new reusable piece?</p>
        <p className="text-sm font-mono italic">&quot;Create a TestimonialCard component with an avatar, quote, and author name. Add it to Storybook.&quot;</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <p className="text-sm text-muted-foreground mb-2">Want to see different variations?</p>
        <p className="text-sm font-mono italic">&quot;Add stories for the TestimonialCard showing a short quote, a long quote, and one without an avatar.&quot;</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <p className="text-sm text-muted-foreground mb-2">Need a Shadcn component you do not have yet?</p>
        <p className="text-sm font-mono italic">&quot;Add the Select component from Shadcn and create a story for it.&quot;</p>
      </div>
    </div>

    <p className="text-muted-foreground leading-relaxed">
      The AI will create the component in <code className="text-sm bg-muted px-1.5 py-0.5 rounded">src/components/</code> and 
      a matching <code className="text-sm bg-muted px-1.5 py-0.5 rounded">.stories.tsx</code> file. Refresh Storybook and 
      your new component appears in the sidebar.
    </p>
  </div>
)

const meta = {
  title: 'Welcome',
  component: WelcomePage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof WelcomePage>

export default meta
type Story = StoryObj<typeof meta>

export const Guide: Story = {}
