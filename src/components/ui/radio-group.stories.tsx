import type { Meta, StoryObj } from '@storybook/react'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Label } from './label'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-three" id="option-three" />
        <Label htmlFor="option-three">Option Three</Label>
      </div>
    </RadioGroup>
  ),
}

export const PaymentMethod: Story = {
  render: () => (
    <div className="w-[300px]">
      <Label className="text-base font-medium mb-3 block">Payment Method</Label>
      <RadioGroup defaultValue="card">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card">Credit Card</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="paypal" id="paypal" />
          <Label htmlFor="paypal">PayPal</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bank" id="bank" />
          <Label htmlFor="bank">Bank Transfer</Label>
        </div>
      </RadioGroup>
    </div>
  ),
}

export const PlanSelection: Story = {
  render: () => (
    <div className="w-[350px]">
      <Label className="text-base font-medium mb-3 block">Select Plan</Label>
      <RadioGroup defaultValue="pro" className="space-y-3">
        <div className="flex items-start space-x-3 p-3 border rounded-lg">
          <RadioGroupItem value="free" id="free" className="mt-1" />
          <div>
            <Label htmlFor="free" className="font-medium">Free</Label>
            <p className="text-sm text-muted-foreground">Basic features for personal use</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 border rounded-lg border-primary">
          <RadioGroupItem value="pro" id="pro" className="mt-1" />
          <div>
            <Label htmlFor="pro" className="font-medium">Pro - $10/month</Label>
            <p className="text-sm text-muted-foreground">Advanced features for professionals</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 border rounded-lg">
          <RadioGroupItem value="enterprise" id="enterprise" className="mt-1" />
          <div>
            <Label htmlFor="enterprise" className="font-medium">Enterprise - Custom</Label>
            <p className="text-sm text-muted-foreground">Custom solutions for large teams</p>
          </div>
        </div>
      </RadioGroup>
    </div>
  ),
}

