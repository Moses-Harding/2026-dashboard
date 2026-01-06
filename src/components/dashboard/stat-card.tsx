/**
 * Stat Card Component
 *
 * Displays a single metric with optional trend indicator.
 * Used throughout the dashboard for key statistics.
 *
 * iOS Comparison: Like a custom card view with title/value
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: string
}

export function StatCard({ title, value, subtitle, trend, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </CardDescription>
        <CardTitle className="text-3xl tabular-nums">
          {value}
          {trend && (
            <span
              className={`text-sm font-normal ml-2 ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend.value > 0 ? '+' : ''}
              {trend.value.toFixed(1)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      {subtitle && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </CardContent>
      )}
    </Card>
  )
}
