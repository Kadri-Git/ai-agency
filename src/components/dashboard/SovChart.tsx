'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface SovChartProps {
  data: Array<{
    platform: string
    yourSov: number
    topCompetitor: number
    competitorName?: string
    companyName?: string
  }>
  type?: 'line' | 'bar'
}

export function SovChart({ data, type = 'bar' }: SovChartProps) {
  // Ensure we have valid data - always render chart even with zeros
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground border border-dashed rounded">
        <div className="text-center">
          <p className="font-medium">No data available</p>
          <p className="text-sm mt-2">Data: {JSON.stringify(data)}</p>
        </div>
      </div>
    )
  }
  
  // Get company name and competitor name from data
  const firstDataPoint = data[0]
  const companyName = firstDataPoint?.companyName || 'Your Company'
  
  // Get competitor name - use the first one found, or default
  const firstWithCompetitor = data.find(d => d.competitorName && d.competitorName !== 'Top Competitor')
  const competitorLabel = firstWithCompetitor?.competitorName || 'Top Competitor'
  
  // Debug log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('SovChart data:', {
      companyName,
      competitorLabel,
      dataPoints: data.map(d => ({
        platform: d.platform,
        yourSov: d.yourSov,
        topCompetitor: d.topCompetitor,
        competitorName: d.competitorName,
        companyName: d.companyName,
      }))
    })
  }
  
  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="platform"
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string, props: any) => {
              if (name === 'topCompetitor') {
                const compName = props.payload.competitorName && props.payload.competitorName !== 'Top Competitor' 
                  ? props.payload.competitorName 
                  : 'Top Competitor'
                return [`${value.toFixed(1)}%`, `${compName}`]
              }
              return [`${value.toFixed(1)}%`, companyName]
            }}
          />
          <Legend 
            formatter={(value: string) => {
              if (value === 'topCompetitor') {
                return competitorLabel
              }
              return companyName
            }}
          />
          <Line
            type="monotone"
            dataKey="yourSov"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            name={companyName}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="topCompetitor"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            name={competitorLabel}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  // Check if all values are zero
  const allZeros = data.every(d => d.yourSov === 0 && d.topCompetitor === 0)
  
  return (
    <div className="w-full" style={{ minHeight: '300px' }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="platform"
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            domain={allZeros ? [0, 10] : [0, 100]}
            allowDecimals={false}
            ticks={allZeros ? [0, 5, 10] : undefined}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              zIndex: 1000,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              pointerEvents: 'none',
            }}
            wrapperStyle={{ zIndex: 1000 }}
            position={{ y: -10 }}
            formatter={(value: number, name: string, props: any) => {
              // props.payload contains the full data object for this bar
              if (name === 'topCompetitor' || name === 'topCompetitor') {
                // Use the competitorName from the specific data point (per platform)
                const compName = props.payload?.competitorName && 
                                 props.payload.competitorName !== 'Top Competitor' &&
                                 props.payload.competitorName.trim() !== ''
                  ? props.payload.competitorName 
                  : 'Top Competitor'
                return [`${value.toFixed(1)}%`, `${compName}`]
              }
              // For yourSov, always show company name
              return [`${value.toFixed(1)}%`, companyName]
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px', zIndex: 1 }}
            formatter={(value: string, entry: any) => {
              // Recharts passes the dataKey as the value, not the name prop
              const dataKey = entry?.dataKey || value
              if (dataKey === 'topCompetitor' || value === 'topCompetitor') {
                return competitorLabel
              }
              if (dataKey === 'yourSov' || value === 'yourSov') {
                return companyName
              }
              return value
            }}
          />
          <Bar
            dataKey="yourSov"
            fill="#3b82f6"
            name={companyName}
            radius={[8, 8, 0, 0]}
            minPointSize={allZeros ? 2 : undefined}
          />
          <Bar
            dataKey="topCompetitor"
            fill="#f97316"
            name={competitorLabel}
            radius={[8, 8, 0, 0]}
            minPointSize={allZeros ? 2 : undefined}
          />
        </BarChart>
      </ResponsiveContainer>
      {allZeros && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>All values are currently 0. Run an analysis to see your Share of Voice data.</p>
        </div>
      )}
    </div>
  )
}



