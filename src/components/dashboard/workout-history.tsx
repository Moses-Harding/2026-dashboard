/**
 * Workout History Component
 *
 * Displays recent workouts with exercise details.
 */

import { WORKOUT_TYPES, EXERCISES } from '@/lib/constants/workouts'
import type { Workout, ExerciseSet, WorkoutType } from '@/types/database'

interface WorkoutWithSets extends Workout {
  exercise_sets: ExerciseSet[]
}

interface WorkoutHistoryProps {
  workouts: WorkoutWithSets[]
}

export function WorkoutHistory({ workouts }: WorkoutHistoryProps) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No workouts logged yet</p>
        <p className="text-sm mt-1">Start tracking your progress!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => {
        const workoutInfo = WORKOUT_TYPES[workout.workout_type as WorkoutType]

        // Group exercise sets by exercise name
        const exerciseGroups: Record<string, ExerciseSet[]> = {}
        workout.exercise_sets?.forEach((set) => {
          if (!exerciseGroups[set.exercise_name]) {
            exerciseGroups[set.exercise_name] = []
          }
          exerciseGroups[set.exercise_name].push(set)
        })

        return (
          <div key={workout.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span>{workoutInfo?.emoji || '💪'}</span>
                <span className="font-medium">{workoutInfo?.label || workout.workout_type}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(workout.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {Object.entries(exerciseGroups).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(exerciseGroups).map(([exerciseId, sets]) => {
                  const exercise = EXERCISES[exerciseId]
                  const maxWeight = Math.max(...sets.map((s) => s.weight || 0))

                  return (
                    <div key={exerciseId} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {exercise?.name || exerciseId}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {sets.length} sets
                        </span>
                        {maxWeight > 0 && (
                          <span className="font-medium">{maxWeight} lbs</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : workout.workout_type === 'cardio' || workout.workout_type === 'active_rest' ? (
              <p className="text-sm text-muted-foreground">
                {workout.duration_minutes
                  ? `${workout.duration_minutes} minutes`
                  : 'Completed'}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No exercises logged</p>
            )}

            {workout.notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                {workout.notes}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
