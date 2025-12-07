import type { Meta, StoryObj } from '@storybook/react'
import { Header } from './Header'

const meta = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div>
      <Header />
      <div className="container mx-auto p-8">
        <h2 className="text-2xl font-bold">Page Content</h2>
        <p className="text-muted-foreground mt-2">
          The header is sticky and will remain at the top when scrolling. Try
          toggling dark mode or opening the profile menu.
        </p>
      </div>
    </div>
  ),
}

export const WithContent: Story = {
  render: () => (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-8 space-y-8">
        <section>
          <h2 className="text-3xl font-bold mb-4">Welcome</h2>
          <p className="text-muted-foreground">
            This demonstrates the header in a full page context. The header
            includes a dark mode toggle, mobile sidebar toggle, and profile
            dropdown menu.
          </p>
        </section>
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Features</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Responsive design with mobile menu toggle</li>
            <li>Dark/light mode toggle with smooth transitions</li>
            <li>Profile dropdown menu using Shadcn components</li>
            <li>Sticky positioning for always-visible navigation</li>
            <li>Lucide icons for professional appearance</li>
          </ul>
        </section>
      </main>
    </div>
  ),
}
