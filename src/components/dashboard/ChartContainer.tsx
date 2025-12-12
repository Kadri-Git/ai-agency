'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { Info } from 'lucide-react'

interface ChartContainerProps {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  insight?: {
    text: string
    type?: 'info' | 'success' | 'warning' | 'error'
  }
  className?: string
  description?: string
  measurementDetails?: string
}

const insightColors = {
  info: 'border-[#facc15] bg-transparent',
  success: 'border-[#facc15] bg-transparent',
  warning: 'border-[#facc15] bg-transparent',
  error: 'border-[#facc15] bg-transparent',
}

export function ChartContainer({
  title,
  children,
  actions,
  insight,
  className,
  description,
  measurementDetails,
}: ChartContainerProps) {
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
    >
      <div className={cn('', className)}>
        <div className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold tracking-tight text-black">
              {title}
            </h3>
            {tooltipContent && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-black hover:text-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
                      aria-label={`Learn more about ${title}`}
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs bg-black text-white p-4 shadow-lg"
                    sideOffset={8}
                  >
                    {tooltipContent}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        <div className="space-y-6">
          {insight && (
            <div
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border-l-4',
                insightColors[insight.type || 'info']
              )}
            >
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-black leading-relaxed">
                {insight.text}
              </p>
            </div>
          )}
          <div>{children}</div>
        </div>
      </div>
    </motion.div>
  )
}

