'use client'

import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

interface ProgressBarProps {
  value: number // 0-100
  className?: string
  showLabel?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red'
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-400',
  green: 'from-green-500 to-green-400',
  yellow: 'from-yellow-500 to-yellow-400',
  red: 'from-red-500 to-red-400',
}

export function ProgressBar({
  value,
  className,
  showLabel = false,
  color = 'blue',
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-medium text-muted-foreground">
            {clampedValue.toFixed(1)}%
          </span>
        </div>
      )}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r',
            colorClasses[color],
            'shimmer'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

