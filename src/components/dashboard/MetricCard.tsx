'use client'

import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label?: string
  }
  context?: string
  icon?: React.ReactNode
  className?: string
  description?: string
  measurementDetails?: string
}

export function MetricCard({
  title,
  value,
  change,
  context,
  icon,
  className,
  description,
  measurementDetails,
}: MetricCardProps) {
  const isPositive = change && change.value > 0
  const isNegative = change && change.value < 0
  const isNeutral = change && change.value === 0

  const tooltipContent = description || measurementDetails ? (
    <div className="max-w-xs space-y-2">
      {description && (
        <p className="font-semibold text-sm">{description}</p>
      )}
      {measurementDetails && (
        <div>
          <p className="text-xs font-medium mb-1">How it's measured:</p>
          <p className="text-xs leading-relaxed opacity-90">
            {measurementDetails}
          </p>
        </div>
      )}
    </div>
  ) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden border bg-gradient-to-br from-white to-blue-50/50 dark:from-card dark:to-blue-950/20',
          'hover:shadow-lg transition-all duration-300',
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {title}
                </p>
                {tooltipContent && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
                          aria-label={`Learn more about ${title}`}
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs bg-foreground text-background p-4 shadow-lg"
                        sideOffset={8}
                      >
                        {tooltipContent}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold text-foreground">
                  {value}
                </span>
                {change && (
                  <Badge
                    variant={isPositive ? 'default' : isNegative ? 'destructive' : 'secondary'}
                    className={cn(
                      'text-xs font-semibold',
                      isPositive && 'bg-green-500 hover:bg-green-600',
                      isNegative && 'bg-red-500 hover:bg-red-600'
                    )}
                  >
                    {isPositive && <TrendingUp className="h-3 w-3 mr-1" />}
                    {isNegative && <TrendingDown className="h-3 w-3 mr-1" />}
                    {isNeutral && <Minus className="h-3 w-3 mr-1" />}
                    {Math.abs(change.value)}%
                    {change.label && ` ${change.label}`}
                  </Badge>
                )}
              </div>
            </div>
            {icon && (
              <div className="text-blue-500 dark:text-blue-400">{icon}</div>
            )}
          </div>
          {context && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {context}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

