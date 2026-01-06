/**
 * Weight Chart Component
 *
 * Displays a line chart of weight measurements over time.
 * Uses Recharts for visualization.
 *
 * iOS Comparison: Like Swift Charts' LineMark
 *
 * 'use client' because Recharts requires browser APIs
 */

'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface WeightDataPoint {
  date: string // 'YYYY-MM-DD' or formatted date
  weight: number
}

interface WeightChartProps {
  data: WeightDataPoint[]
  targetWeight?: number
  startWeight?: number
}

export function WeightChart({ data, targetWeight = 195, startWeight = 220 }: WeightChartProps) {
  // If no data, show empty state
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No weight data yet. Add your first measurement to see the chart.
      </div>
    )
  }

  // Format data for Recharts (short date format for display)
  const chartData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }))

  // Calculate Y-axis bounds with padding
  const weights = data.map((d) => d.weight)
  const minWeight = Math.min(...weights, targetWeight) - 5
  const maxWeight = Math.max(...weights, startWeight) + 5

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="displayDate"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        <YAxis
          domain={[minWeight, maxWeight]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          itemStyle={{ color: 'hsl(var(--primary))' }}
          formatter={(value) => {
            if (typeof value === 'number') {
              return [`${value.toFixed(1)} lbs`, 'Weight']
            }
            return ['--', 'Weight']
          }}
        />
        {/* Target weight reference line */}
        <ReferenceLine
          y={targetWeight}
          stroke="hsl(var(--chart-2))"
          strokeDasharray="5 5"
          label={{
            value: `Goal: ${targetWeight}`,
            fill: 'hsl(var(--muted-foreground))',
            fontSize: 12,
            position: 'right',
          }}
        />
        {/* Weight data line */}
        <Line
          type="monotone"
          dataKey="weight"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 0, r: 4 }}
          activeDot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 0, r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
