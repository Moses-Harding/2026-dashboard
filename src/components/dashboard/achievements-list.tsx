/**
 * Achievements List Component
 *
 * Displays recent achievements with icons and timestamps.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Achievement, AchievementType } from '@/types/database'

interface AchievementsListProps {
  achievements: Achievement[]
  limit?: number
}

const ACHIEVEMENT_CONFIG: Record<AchievementType, { icon: string; label: string }> = {
  monthly_weight_target: { icon: '⚖️', label: 'Weight Target Hit' },
  monthly_lift_target: { icon: '💪', label: 'Lift Target Hit' },
  workout_streak: { icon: '🔥', label: 'Workout Streak' },
  habit_streak: { icon: '✅', label: 'Habit Streak' },
  personal_record: { icon: '🏆', label: 'Personal Record' },
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export function AchievementsList({ achievements, limit = 5 }: AchievementsListProps) {
  const displayAchievements = achievements.slice(0, limit)

  if (displayAchievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏆</span>
            <span>Achievements</span>
          </CardTitle>
          <CardDescription>Your fitness milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No achievements yet. Keep working towards your goals!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🏆</span>
          <span>Recent Achievements</span>
        </CardTitle>
        <CardDescription>
          {achievements.length} total achievement{achievements.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayAchievements.map((achievement) => {
            const config = ACHIEVEMENT_CONFIG[achievement.type] || { icon: '⭐', label: achievement.type }
            return (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <span className="text-2xl">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(achievement.achieved_at)}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
