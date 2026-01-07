/**
 * Workout Logging Form
 *
 * Simple button to log today's scheduled workout.
 * Automatically uses the workout type from the weekly schedule.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { WORKOUT_TYPES } from '@/lib/constants/workouts'
import type { WorkoutType } from '@/types/database'

interface WorkoutFormProps {
  defaultWorkoutType: WorkoutType
  date?: string
}

export function WorkoutForm({ defaultWorkoutType, date }: WorkoutFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const today = date ?? new Date().toISOString().split('T')[0]
  const workoutInfo = WORKOUT_TYPES[defaultWorkoutType]

  async function handleLogWorkout() {
    setIsLoading(true)

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          workout_type: defaultWorkoutType,
          completed: true,
          exercises: [],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to save workout')
        return
      }

      toast.success(`${workoutInfo.label} logged!`)
      router.refresh()
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error('Failed to save workout')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogWorkout}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? 'Logging...' : `Log ${workoutInfo.label}`}
    </Button>
  )
}
