'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Competitor {
  name: string
  totalSov: number
  byPlatform: {
    chatgpt: number
    claude: number
    gemini: number
  }
  mentionCount: number
}

interface TopCompetitorsProps {
  competitors: Competitor[]
  companyName: string
}

export function TopCompetitors({ competitors, companyName }: TopCompetitorsProps) {
  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Competitors</CardTitle>
          <CardDescription>Competitors mentioned in LLM responses</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No competitor data available. Run an analysis to see competitors.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Competitors</CardTitle>
        <CardDescription>
          Top competitor companies mentioned in LLM responses across all platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {competitors.map((competitor, index) => {
            const rank = index + 1
            const maxSov = competitors[0]?.totalSov || 1
            const percentage = (competitor.totalSov / maxSov) * 100

            return (
              <div key={competitor.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-sm">
                      {rank}
                    </div>
                    <div>
                      <div className="font-semibold text-base">{competitor.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Total SOV: {competitor.totalSov.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {competitor.mentionCount} platform{competitor.mentionCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {/* Progress bar */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Platform breakdown */}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {competitor.byPlatform.chatgpt > 0 && (
                    <span>ChatGPT: {competitor.byPlatform.chatgpt.toFixed(1)}%</span>
                  )}
                  {competitor.byPlatform.claude > 0 && (
                    <span>Claude: {competitor.byPlatform.claude.toFixed(1)}%</span>
                  )}
                  {competitor.byPlatform.gemini > 0 && (
                    <span>Gemini: {competitor.byPlatform.gemini.toFixed(1)}%</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {competitors.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No competitors found in LLM responses.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

