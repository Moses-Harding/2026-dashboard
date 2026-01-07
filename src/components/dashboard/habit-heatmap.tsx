/**
 * Habit Heatmap Component
 *
 * 7-day calendar view showing habit completion intensity.
 * Darker = more habits completed that day.
 */

import type { HabitLog } from '@/types/database'

interface HabitHeatmapProps {
  habitLogs: HabitLog[]
}

export function HabitHeatmap({ habitLogs }: HabitHeatmapProps) {
  // Generate last 7 days
  const days = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const log = habitLogs.find((l) => l.date === dateStr)

    // Count completed habits (meditation, journal, creatine)
    let completed = 0
    if (log) {
      if (log.meditation) completed++
      if (log.journal) completed++
      if (log.creatine) completed++
    }

    days.push({
      date: dateStr,
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      completed,
      total: 3, // Total trackable habits
      isToday: i === 0,
    })
  }

  // Get color based on completion percentage
  function getColor(completed: number, total: number): string {
    if (completed === 0) return 'bg-muted'
    const percentage = completed / total
    if (percentage >= 1) return 'bg-green-500'
    if (percentage >= 0.66) return 'bg-green-400'
    if (percentage >= 0.33) return 'bg-green-300'
    return 'bg-green-200'
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Last 7 Days</h3>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div key={day.date} className="text-center">
            <p className="text-xs text-muted-foreground mb-1">{day.dayLabel}</p>
            <div
              className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors ${getColor(
                day.completed,
                day.total
              )} ${day.isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              title={`${day.completed}/${day.total} habits completed`}
            >
              {day.dayNum}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 pt-2">
        <span className="text-xs text-muted-foreground">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-muted" />
          <div className="w-3 h-3 rounded bg-green-200" />
          <div className="w-3 h-3 rounded bg-green-300" />
          <div className="w-3 h-3 rounded bg-green-400" />
          <div className="w-3 h-3 rounded bg-green-500" />
        </div>
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  )
}
