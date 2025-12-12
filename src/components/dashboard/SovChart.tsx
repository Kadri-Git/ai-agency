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
  }>
  type?: 'line' | 'bar'
}

export function SovChart({ data, type = 'bar' }: SovChartProps) {
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
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="yourSov"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            name="Your SOV"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="topCompetitor"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            name="Top Competitor"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
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
        />
        <Legend />
        <Bar
          dataKey="yourSov"
          fill="hsl(var(--chart-1))"
          name="Your SOV"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey="topCompetitor"
          fill="hsl(var(--chart-2))"
          name="Top Competitor"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}


