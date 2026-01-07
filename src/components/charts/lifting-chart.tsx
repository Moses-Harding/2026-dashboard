/**
 * Lifting Progression Chart
 *
 * Shows weight progression over time for a specific exercise.
 * Uses max weight per workout session.
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
import { EXERCISES } from '@/lib/constants/workouts'

interface LiftingDataPoint {
  date: string
  weight: number
}

interface LiftingChartProps {
  exerciseId: string
  data: LiftingDataPoint[]
}

export function LiftingChart({ exerciseId, data }: LiftingChartProps) {
  const exercise = EXERCISES[exerciseId]

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        No data yet. Log your first workout to see progress!
      </div>
    )
  }

  // Format data for Recharts
  const chartData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }))

  // Calculate Y-axis bounds with padding
  const weights = data.map((d) => d.weight)
  const minWeight = Math.min(...weights) - 5
  const maxWeight = Math.max(...weights, exercise?.targetWeight2026 || 0) + 5

  return (
    <ResponsiveContainer width="100%" height={200}>
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
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        <YAxis
          domain={[minWeight, maxWeight]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value}`}
          width={35}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          itemStyle={{ color: 'hsl(var(--chart-3))' }}
          formatter={(value) => {
            if (typeof value === 'number') {
              return [`${value} lbs`, 'Weight']
            }
            return ['--', 'Weight']
          }}
        />
        {/* Target weight reference line */}
        {exercise?.targetWeight2026 && (
          <ReferenceLine
            y={exercise.targetWeight2026}
            stroke="hsl(var(--chart-2))"
            strokeDasharray="5 5"
            label={{
              value: `Goal: ${exercise.targetWeight2026}`,
              fill: 'hsl(var(--muted-foreground))',
              fontSize: 11,
              position: 'right',
            }}
          />
        )}
        {/* Progress line */}
        <Line
          type="monotone"
          dataKey="weight"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 0, r: 3 }}
          activeDot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 0, r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Component to show multiple exercise progressions
interface LiftingProgressProps {
  exerciseData: Record<string, LiftingDataPoint[]>
}

export function LiftingProgress({ exerciseData }: LiftingProgressProps) {
  const exercises = Object.entries(exerciseData).filter(([_, data]) => data.length > 0)

  if (exercises.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No lifting data yet</p>
        <p className="text-sm mt-1">Log workouts to see your progress</p>
      </div>
    )
  }

  // Show top 3 exercises by data points
  const topExercises = exercises
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {topExercises.map(([exerciseId, data]) => {
        const exercise = EXERCISES[exerciseId]
        const latestWeight = data[data.length - 1]?.weight || 0
        const targetWeight = exercise?.targetWeight2026 || 0
        const progress = targetWeight > 0 ? Math.round((latestWeight / targetWeight) * 100) : 0

        return (
          <div key={exerciseId}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{exercise?.name || exerciseId}</span>
              <div className="text-sm">
                <span className="font-medium">{latestWeight}</span>
                {targetWeight > 0 && (
                  <span className="text-muted-foreground"> / {targetWeight} lbs ({progress}%)</span>
                )}
              </div>
            </div>
            <LiftingChart exerciseId={exerciseId} data={data} />
          </div>
        )
      })}
    </div>
  )
}
