import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './textarea'
import { Label } from './label'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: 'This is some default text that appears in the textarea. You can edit it or replace it with your own content.',
  },
}

export const ContactForm: Story = {
  render: () => (
    <div className="grid w-[400px] gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Textarea id="subject" placeholder="Brief summary..." className="min-h-[60px]" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="details">Details</Label>
        <Textarea id="details" placeholder="Describe your issue in detail..." className="min-h-[120px]" />
      </div>
    </div>
  ),
}

