/**
 * Habit Checklist Component
 *
 * Displays daily habit checkboxes with streak counter.
 * Habits: Meditation, Journal, Creatine
 * Auto-populated: Sleep and Steps from Apple Health
 */

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { HabitLog } from '@/types/database'

interface HabitChecklistProps {
  date: string // YYYY-MM-DD
  initialData?: Partial<HabitLog>
  streak?: number
  sleepHours?: number | null
  steps?: number | null
}

interface HabitItem {
  id: 'meditation' | 'journal' | 'creatine'
  label: string
  emoji: string
}

const HABITS: HabitItem[] = [
  { id: 'meditation', label: 'Meditation', emoji: '🧘' },
  { id: 'journal', label: 'Journal', emoji: '📓' },
  { id: 'creatine', label: 'Creatine', emoji: '💊' },
]

export function HabitChecklist({
  date,
  initialData,
  streak = 0,
  sleepHours,
  steps,
}: HabitChecklistProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [habits, setHabits] = useState({
    meditation: initialData?.meditation ?? false,
    journal: initialData?.journal ?? false,
    creatine: initialData?.creatine ?? false,
  })

  async function toggleHabit(habitId: 'meditation' | 'journal' | 'creatine') {
    const newValue = !habits[habitId]

    // Optimistic update
    setHabits((prev) => ({ ...prev, [habitId]: newValue }))

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          [habitId]: newValue,
        }),
      })

      if (!response.ok) {
        // Revert on error
        setHabits((prev) => ({ ...prev, [habitId]: !newValue }))
        toast.error('Failed to update habit')
        return
      }

      // Refresh to update streak
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      // Revert on error
      setHabits((prev) => ({ ...prev, [habitId]: !newValue }))
      toast.error('Failed to update habit')
    }
  }

  // Count completed habits today
  const completedCount = Object.values(habits).filter(Boolean).length
  const totalHabits = HABITS.length

  return (
    <div className="space-y-4">
      {/* Header with streak */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Daily Habits</h3>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-orange-500">🔥</span>
            <span className="font-medium">{streak} day streak</span>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(completedCount / totalHabits) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalHabits}
        </span>
      </div>

      {/* Habit checkboxes */}
      <div className="space-y-3">
        {HABITS.map((habit) => (
          <div key={habit.id} className="flex items-center space-x-3">
            <Checkbox
              id={habit.id}
              checked={habits[habit.id]}
              onCheckedChange={() => toggleHabit(habit.id)}
              disabled={isPending}
            />
            <Label
              htmlFor={habit.id}
              className="flex items-center gap-2 cursor-pointer text-sm"
            >
              <span>{habit.emoji}</span>
              <span>{habit.label}</span>
            </Label>
          </div>
        ))}
      </div>

      {/* Auto-imported data */}
      {(sleepHours != null || steps != null) && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Auto-imported</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {sleepHours != null && (
              <div className="flex items-center gap-2">
                <span>😴</span>
                <span>{sleepHours.toFixed(1)}h sleep</span>
              </div>
            )}
            {steps != null && (
              <div className="flex items-center gap-2">
                <span>👟</span>
                <span>{steps.toLocaleString()} steps</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
