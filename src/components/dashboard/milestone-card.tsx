/**
 * Milestone Card Component
 *
 * Displays current month's milestone targets and progress.
 * Shows weight target and key lifting targets with progress bars.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EXERCISES } from '@/lib/constants/workouts'
import type { Milestone } from '@/types/database'

interface MilestoneCardProps {
  milestone: Milestone | null
  currentWeight?: number | null
  recentLifts?: Record<string, number> // exercise_id -> best weight this month
}

export function MilestoneCard({ milestone, currentWeight, recentLifts = {} }: MilestoneCardProps) {
  if (!milestone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Milestones</CardTitle>
          <CardDescription>No milestones set for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Seed your 2026 fitness plan to see monthly targets.
          </p>
        </CardContent>
      </Card>
    )
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Calculate weight progress
  const weightProgress = currentWeight && milestone.target_weight
    ? Math.min(100, Math.max(0, ((220 - currentWeight) / (220 - milestone.target_weight)) * 100))
    : 0

  const weightOnTrack = currentWeight && milestone.target_weight
    ? currentWeight <= milestone.target_weight + 2
    : null

  // Get top 4 lifting targets to display
  const liftingTargets = Object.entries(milestone.target_lifts || {})
    .slice(0, 4)
    .map(([exerciseId, target]) => {
      const exercise = EXERCISES[exerciseId]
      const current = recentLifts[exerciseId] || exercise?.startWeight || 0
      const progress = target ? Math.min(100, (current / target) * 100) : 0
      return {
        exerciseId,
        name: exercise?.name || exerciseId,
        current,
        target,
        progress,
        achieved: current >= target,
      }
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{monthNames[milestone.month - 1]} Milestones</span>
          <span className="text-sm font-normal text-muted-foreground">
            {milestone.year}
          </span>
        </CardTitle>
        <CardDescription>Your targets for this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weight Target */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span>⚖️</span>
              <span>Target Weight</span>
            </span>
            <span className={weightOnTrack === true ? 'text-green-500' : weightOnTrack === false ? 'text-yellow-500' : ''}>
              {currentWeight ? `${currentWeight.toFixed(1)}` : '--'} / {milestone.target_weight} lbs
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                weightOnTrack ? 'bg-green-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(100, weightProgress)}%` }}
            />
          </div>
        </div>

        {/* Lifting Targets */}
        {liftingTargets.length > 0 && (
          <div className="space-y-3 pt-2 border-t">
            <span className="text-sm font-medium">Key Lifts</span>
            {liftingTargets.map(({ exerciseId, name, current, target, progress, achieved }) => (
              <div key={exerciseId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{name}</span>
                  <span className={achieved ? 'text-green-500' : ''}>
                    {current} / {target} lbs {achieved && '✓'}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      achieved ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
