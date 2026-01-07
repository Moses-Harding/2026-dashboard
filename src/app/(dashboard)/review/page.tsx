/**
 * Weekly Review Page
 *
 * Sunday review dashboard with:
 * - Auto-generated weekly summary
 * - Reflection text fields
 * - Past reviews history
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'
import { WeeklyReviewForm } from '@/components/forms/weekly-review-form'
import {
  getNow,
  getWeekStart,
  getWeekEnd,
  formatDateISO,
  formatDateRange,
} from '@/lib/utils/dates'

export default async function ReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const now = getNow()
  const weekStart = getWeekStart(now)
  const weekEnd = getWeekEnd(now)
  const weekStartStr = formatDateISO(weekStart)
  const weekEndStr = formatDateISO(weekEnd)

  // Fetch all data for the week in parallel
  const [
    weightLogsResult,
    habitLogsResult,
    workoutsResult,
    existingReviewResult,
    pastReviewsResult,
    currentMilestoneResult,
  ] = await Promise.all([
    // Weight logs for the week
    supabase
      .from('weight_logs')
      .select('date, weight')
      .eq('user_id', user.id)
      .gte('date', weekStartStr)
      .lte('date', weekEndStr)
      .order('date', { ascending: true }),
    // Habit logs for the week
    supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekStartStr)
      .lte('date', weekEndStr),
    // Workouts for the week
    supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekStartStr)
      .lte('date', weekEndStr),
    // Existing review for this week
    supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStartStr)
      .single(),
    // Past reviews
    supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', user.id)
      .lt('week_start_date', weekStartStr)
      .order('week_start_date', { ascending: false })
      .limit(4),
    // Current month's milestone
    supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', now.getMonth() + 1)
      .eq('year', now.getFullYear())
      .single(),
  ])

  const weightLogs = weightLogsResult.data ?? []
  const habitLogs = habitLogsResult.data ?? []
  const workouts = workoutsResult.data ?? []
  const existingReview = existingReviewResult.data
  const pastReviews = pastReviewsResult.data ?? []
  const currentMilestone = currentMilestoneResult.data

  // Calculate weekly stats
  const weeklyWeightAvg = weightLogs.length > 0
    ? weightLogs.reduce((sum, log) => sum + log.weight, 0) / weightLogs.length
    : null

  const workoutsCompleted = workouts.length
  const workoutsTarget = 5

  const totalHabitChecks = habitLogs.length * 3 // 3 habits per day
  const completedHabitChecks = habitLogs.reduce((sum, log) => {
    return sum + (log.meditation ? 1 : 0) + (log.journal ? 1 : 0) + (log.creatine ? 1 : 0)
  }, 0)

  const habitPercent = totalHabitChecks > 0
    ? Math.round((completedHabitChecks / totalHabitChecks) * 100)
    : 0

  // Weight vs target
  const targetWeight = currentMilestone?.target_weight ?? null
  const isOnTrack = weeklyWeightAvg && targetWeight
    ? weeklyWeightAvg <= targetWeight + 2
    : null

  // Check if it's Sunday (day for review)
  const isSunday = now.getDay() === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Weekly Review</h1>
        <p className="text-muted-foreground">
          {formatDateRange(weekStart, weekEnd)}
          {isSunday && ' • Review Day'}
        </p>
      </div>

      {/* Week Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Avg Weight"
          value={weeklyWeightAvg ? `${weeklyWeightAvg.toFixed(1)} lbs` : '-- lbs'}
          icon="⚖️"
          subtitle={
            isOnTrack === true
              ? '✅ On track'
              : isOnTrack === false
              ? `Target: ${targetWeight} lbs`
              : 'No target set'
          }
        />

        <StatCard
          title="Workouts"
          value={`${workoutsCompleted}/${workoutsTarget}`}
          icon="💪"
          subtitle={workoutsCompleted >= workoutsTarget ? '✅ Complete' : `${workoutsTarget - workoutsCompleted} remaining`}
        />

        <StatCard
          title="Habits"
          value={`${habitPercent}%`}
          icon="✅"
          subtitle={`${completedHabitChecks}/${totalHabitChecks} completed`}
        />

        <StatCard
          title="Days Logged"
          value={`${habitLogs.length}/7`}
          icon="📅"
          subtitle={habitLogs.length >= 6 ? '✅ Consistent' : 'Keep tracking!'}
        />
      </div>

      {/* Weekly Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Week at a Glance</CardTitle>
          <CardDescription>How you did this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Weight Summary */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚖️</span>
                <div>
                  <p className="font-medium">Weight Progress</p>
                  <p className="text-sm text-muted-foreground">
                    {weightLogs.length} weigh-ins this week
                  </p>
                </div>
              </div>
              <span className={isOnTrack ? 'text-green-500' : isOnTrack === false ? 'text-yellow-500' : 'text-muted-foreground'}>
                {isOnTrack ? '✅ On Track' : isOnTrack === false ? '⚠️ Review needed' : '--'}
              </span>
            </div>

            {/* Workout Summary */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💪</span>
                <div>
                  <p className="font-medium">Workout Consistency</p>
                  <p className="text-sm text-muted-foreground">
                    {workoutsCompleted} of {workoutsTarget} workouts completed
                  </p>
                </div>
              </div>
              <span className={workoutsCompleted >= workoutsTarget ? 'text-green-500' : workoutsCompleted >= 3 ? 'text-yellow-500' : 'text-red-500'}>
                {workoutsCompleted >= workoutsTarget ? '✅ Perfect' : workoutsCompleted >= 3 ? '⚠️ Almost' : '❌ Behind'}
              </span>
            </div>

            {/* Habit Summary */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium">Daily Habits</p>
                  <p className="text-sm text-muted-foreground">
                    {habitPercent}% completion rate
                  </p>
                </div>
              </div>
              <span className={habitPercent >= 80 ? 'text-green-500' : habitPercent >= 60 ? 'text-yellow-500' : 'text-red-500'}>
                {habitPercent >= 80 ? '✅ Excellent' : habitPercent >= 60 ? '⚠️ Good' : '❌ Needs work'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>Reflection</CardTitle>
          <CardDescription>
            {existingReview ? 'Update your review' : 'Complete your weekly review'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyReviewForm
            weekStartDate={weekStartStr}
            initialData={{
              weight_avg: weeklyWeightAvg,
              workouts_completed: workoutsCompleted,
              workouts_target: workoutsTarget,
              habits_completed: completedHabitChecks,
              habits_total: totalHabitChecks,
              went_well: existingReview?.went_well ?? '',
              needs_adjustment: existingReview?.needs_adjustment ?? '',
            }}
            existingReviewId={existingReview?.id}
          />
        </CardContent>
      </Card>

      {/* Past Reviews */}
      {pastReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Reviews</CardTitle>
            <CardDescription>Your previous weekly reflections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastReviews.map((review) => {
                const reviewWeekStart = new Date(review.week_start_date)
                const reviewWeekEnd = new Date(reviewWeekStart)
                reviewWeekEnd.setDate(reviewWeekEnd.getDate() + 6)

                return (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {formatDateRange(reviewWeekStart, reviewWeekEnd)}
                      </span>
                      <div className="flex gap-2 text-sm">
                        <span>⚖️ {review.weight_avg?.toFixed(1) ?? '--'}</span>
                        <span>💪 {review.workouts_completed}/{review.workouts_target}</span>
                      </div>
                    </div>
                    {review.went_well && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">What went well:</p>
                        <p className="text-sm">{review.went_well}</p>
                      </div>
                    )}
                    {review.needs_adjustment && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Needs adjustment:</p>
                        <p className="text-sm">{review.needs_adjustment}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
