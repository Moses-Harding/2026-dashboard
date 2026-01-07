/**
 * Workout Logging Form
 *
 * Allows users to log exercises for a workout.
 * Shows exercises based on workout template with set/rep/weight inputs.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  WORKOUT_TYPES,
  WORKOUT_TEMPLATES,
  EXERCISES,
  getExercisesForWorkout,
  type ExerciseDefinition,
} from '@/lib/constants/workouts'
import type { WorkoutType } from '@/types/database'

interface ExerciseSetInput {
  exercise_name: string
  set_number: number
  reps: number | undefined
  weight: number | undefined
}

interface WorkoutFormProps {
  defaultWorkoutType?: WorkoutType
  date?: string
}

export function WorkoutForm({ defaultWorkoutType, date }: WorkoutFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(defaultWorkoutType ?? null)
  const [exerciseSets, setExerciseSets] = useState<ExerciseSetInput[]>([])

  const today = date ?? new Date().toISOString().split('T')[0]

  // Initialize exercise sets when workout type is selected
  function selectWorkoutType(type: WorkoutType) {
    setWorkoutType(type)
    const exercises = getExercisesForWorkout(type)

    // Create default sets for each exercise
    const sets: ExerciseSetInput[] = []
    exercises.forEach((exercise) => {
      for (let i = 1; i <= exercise.defaultSets; i++) {
        sets.push({
          exercise_name: exercise.id,
          set_number: i,
          reps: exercise.defaultReps,
          weight: undefined,
        })
      }
    })
    setExerciseSets(sets)
  }

  function updateSet(exerciseName: string, setNumber: number, field: 'reps' | 'weight', value: string) {
    setExerciseSets((prev) =>
      prev.map((set) =>
        set.exercise_name === exerciseName && set.set_number === setNumber
          ? { ...set, [field]: value ? parseFloat(value) : undefined }
          : set
      )
    )
  }

  async function handleSubmit() {
    if (!workoutType) return

    setIsLoading(true)

    try {
      // Filter out sets without any data
      const validSets = exerciseSets.filter((set) => set.reps !== undefined || set.weight !== undefined)

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          workout_type: workoutType,
          completed: true,
          exercises: validSets,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to save workout')
        return
      }

      toast.success('Workout logged!')
      setOpen(false)
      setWorkoutType(null)
      setExerciseSets([])
      router.refresh()
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error('Failed to save workout')
    } finally {
      setIsLoading(false)
    }
  }

  // Group sets by exercise for display
  const exerciseGroups = workoutType
    ? getExercisesForWorkout(workoutType).map((exercise) => ({
        exercise,
        sets: exerciseSets.filter((s) => s.exercise_name === exercise.id),
      }))
    : []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Log Workout</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Workout</DialogTitle>
          <DialogDescription>
            {today} - Record your exercises and track your progress
          </DialogDescription>
        </DialogHeader>

        {!workoutType ? (
          // Workout type selection
          <div className="grid grid-cols-2 gap-3 mt-4">
            {(Object.entries(WORKOUT_TYPES) as [WorkoutType, typeof WORKOUT_TYPES[WorkoutType]][]).map(
              ([type, info]) => (
                <button
                  key={type}
                  onClick={() => selectWorkoutType(type)}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <span className="text-2xl">{info.emoji}</span>
                  <p className="font-medium mt-2">{info.label}</p>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                </button>
              )
            )}
          </div>
        ) : (
          // Exercise logging form
          <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{WORKOUT_TYPES[workoutType].emoji}</span>
                <span className="font-medium">{WORKOUT_TYPES[workoutType].label}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setWorkoutType(null)}>
                Change
              </Button>
            </div>

            {exerciseGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No exercises to log for this workout type.</p>
                <p className="text-sm mt-2">Just mark it as complete!</p>
              </div>
            ) : (
              exerciseGroups.map(({ exercise, sets }) => (
                <div key={exercise.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      {exercise.targetWeight2026 && (
                        <p className="text-xs text-muted-foreground">
                          Target: {exercise.targetWeight2026} lbs by Dec
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-xs text-muted-foreground">
                      <div className="w-12">Set</div>
                      <div>Reps</div>
                      <div>Weight (lbs)</div>
                    </div>

                    {sets.map((set) => (
                      <div
                        key={`${set.exercise_name}-${set.set_number}`}
                        className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center"
                      >
                        <div className="w-12 text-sm font-medium">{set.set_number}</div>
                        <Input
                          type="number"
                          placeholder={`${exercise.defaultReps}`}
                          value={set.reps ?? ''}
                          onChange={(e) =>
                            updateSet(set.exercise_name, set.set_number, 'reps', e.target.value)
                          }
                          className="h-9"
                        />
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="0"
                          value={set.weight ?? ''}
                          onChange={(e) =>
                            updateSet(set.exercise_name, set.set_number, 'weight', e.target.value)
                          }
                          className="h-9"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                {isLoading ? 'Saving...' : 'Save Workout'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
