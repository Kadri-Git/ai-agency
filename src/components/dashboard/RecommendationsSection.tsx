'use client'

import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Target, TrendingUp, Clock } from 'lucide-react'

export interface Recommendation {
  priority: 1 | 2 | 3
  title: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  estimatedSovGain: number // percentage
  timeframe: string // e.g., "2-3 months"
  evidence: {
    currentMetric: string
    benchmark: string
    gap: string
  }
  actionSteps: string[]
  businessJustification: string
}

interface RecommendationsSectionProps {
  recommendations: Recommendation[]
  className?: string
}

const impactColors = {
  high: 'bg-red-500 hover:bg-red-600',
  medium: 'bg-yellow-500 hover:bg-yellow-600',
  low: 'bg-blue-500 hover:bg-blue-600',
}

const effortColors = {
  high: 'bg-orange-500 hover:bg-orange-600',
  medium: 'bg-yellow-500 hover:bg-yellow-600',
  low: 'bg-green-500 hover:bg-green-600',
}

export function RecommendationsSection({
  recommendations,
  className,
}: RecommendationsSectionProps) {
  return (
    <section
      className={cn(
        'relative w-full py-16 md:py-24 overflow-hidden',
        'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
        'dark:from-blue-700 dark:via-blue-800 dark:to-blue-900',
        className
      )}
    >
      {/* Radial overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Top 3 Recommendations
          </h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Data-driven actions prioritized by impact and feasibility
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.priority}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600',
                        'flex items-center justify-center text-white font-bold text-lg shadow-lg',
                        'ring-2 ring-yellow-300/50'
                      )}
                    >
                      {rec.priority}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge
                        className={cn(
                          'text-xs font-semibold text-white',
                          impactColors[rec.impact]
                        )}
                      >
                        Impact: {rec.impact}
                      </Badge>
                      <Badge
                        className={cn(
                          'text-xs font-semibold text-white',
                          effortColors[rec.effort]
                        )}
                      >
                        Effort: {rec.effort}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                    {rec.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Metrics Box */}
                  <div className="border-2 border-border rounded-lg p-4 space-y-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Estimated SOV Gain
                      </span>
                      <span className="text-lg font-bold text-primary">
                        +{rec.estimatedSovGain}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Timeframe: {rec.timeframe}</span>
                    </div>
                  </div>

                  {/* Evidence Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Evidence
                    </h4>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p>
                        <span className="font-medium">Current:</span> {rec.evidence.currentMetric}
                      </p>
                      <p>
                        <span className="font-medium">Benchmark:</span> {rec.evidence.benchmark}
                      </p>
                      <p>
                        <span className="font-medium">Gap:</span> {rec.evidence.gap}
                      </p>
                    </div>
                  </div>

                  {/* Action Steps */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Action Steps
                    </h4>
                    <div className="space-y-2">
                      {rec.actionSteps.map((step, stepIndex) => (
                        <div
                          key={stepIndex}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={`rec-${rec.priority}-step-${stepIndex}`}
                            className="mt-0.5"
                          />
                          <label
                            htmlFor={`rec-${rec.priority}-step-${stepIndex}`}
                            className="text-sm text-foreground leading-relaxed flex-1 cursor-pointer"
                          >
                            {step}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Business Justification */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Why this matters:</span>{' '}
                      {rec.businessJustification}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

