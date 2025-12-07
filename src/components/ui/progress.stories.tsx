import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from './progress'

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
    },
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 33,
    className: 'w-[300px]',
  },
}

export const Empty: Story = {
  args: {
    value: 0,
    className: 'w-[300px]',
  },
}

export const Half: Story = {
  args: {
    value: 50,
    className: 'w-[300px]',
  },
}

export const Complete: Story = {
  args: {
    value: 100,
    className: 'w-[300px]',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progress</span>
        <span>66%</span>
      </div>
      <Progress value={66} />
    </div>
  ),
}

export const Steps: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step 1 of 4</span>
          <span>25%</span>
        </div>
        <Progress value={25} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step 2 of 4</span>
          <span>50%</span>
        </div>
        <Progress value={50} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step 3 of 4</span>
          <span>75%</span>
        </div>
        <Progress value={75} />
      </div>
    </div>
  ),
}

