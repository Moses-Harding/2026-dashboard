/**
 * Monthly Progress Page
 *
 * Shows progress for the current month:
 * - Current weight vs monthly target
 * - Lifting milestones progress
 * - Weight trend chart (30 days)
 * - Workout and habit stats
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'
import { WeightChart } from '@/components/charts/weight-chart'
import { LiftingProgress } from '@/components/charts/lifting-chart'
import {
  getMonthStart,
  getMonthEnd,
  formatDateISO,
  getDaysInRange,
} from '@/lib/utils/dates'
import { EXERCISES } from '@/lib/constants/workouts'

export default async function MonthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const now = new Date()
  const monthStart = getMonthStart(now)
  const monthEnd = getMonthEnd(now)
  const monthStartStr = formatDateISO(monthStart)
  const monthEndStr = formatDateISO(monthEnd)
  const daysInMonth = getDaysInRange(monthStart, monthEnd)
  const daysPassed = getDaysInRange(monthStart, now)

  const currentMonth = now.getMonth() + 1
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Monthly weight targets
  const monthlyTargets: Record<number, number> = {
    1: 218, 2: 216, 3: 214, 4: 212, 5: 210, 6: 208,
    7: 206, 8: 204, 9: 202, 10: 200, 11: 197, 12: 195,
  }
  const targetWeight = monthlyTargets[currentMonth] ?? 195
  const previousTarget = monthlyTargets[currentMonth - 1] ?? 220
  const goalWeight = 195
  const startWeight = 220

  // Fetch all month data in parallel
  const [
    weightLogsResult,
    habitLogsResult,
    workoutsResult,
    exerciseSetsResult,
  ] = await Promise.all([
    // Weight logs for the month
    supabase
      .from('weight_logs')
      .select('date, weight')
      .eq('user_id', user.id)
      .gte('date', monthStartStr)
      .lte('date', monthEndStr)
      .order('date', { ascending: true }),
    // Habit logs for the month
    supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthStartStr)
      .lte('date', monthEndStr),
    // Workouts for the month
    supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthStartStr)
      .lte('date', monthEndStr),
    // Exercise sets for the month (for lifting progress)
    supabase
      .from('exercise_sets')
      .select('*, workouts!inner(date, user_id)')
      .eq('workouts.user_id', user.id)
      .gte('workouts.date', monthStartStr)
      .lte('workouts.date', monthEndStr),
  ])

  const weightLogs = weightLogsResult.data ?? []
  const habitLogs = habitLogsResult.data ?? []
  const workouts = workoutsResult.data ?? []
  const exerciseSets = exerciseSetsResult.data ?? []

  // Current weight (latest entry)
  const currentWeight = weightLogs.length > 0
    ? weightLogs[weightLogs.length - 1].weight
    : null

  // Monthly weight average
  const monthlyAvg = weightLogs.length > 0
    ? weightLogs.reduce((sum, log) => sum + log.weight, 0) / weightLogs.length
    : null

  // Weight change from start of month
  const startOfMonthWeight = weightLogs.length > 0 ? weightLogs[0].weight : null
  const monthlyChange = currentWeight && startOfMonthWeight
    ? currentWeight - startOfMonthWeight
    : null

  // On track indicator
  const isOnTrack = currentWeight
    ? Math.abs(currentWeight - targetWeight) <= 2
    : null

  // Workout stats
  const expectedWorkouts = Math.floor(daysPassed * 5 / 7) // 5 workouts per week
  const workoutsCompleted = workouts.length
  const workoutPercent = expectedWorkouts > 0
    ? Math.round((workoutsCompleted / expectedWorkouts) * 100)
    : 0

  // Habit stats
  const habitDays = habitLogs.length
  const perfectHabitDays = habitLogs.filter(
    (log) => log.meditation && log.journal && log.creatine
  ).length
  const habitPercent = daysPassed > 0
    ? Math.round((habitDays / daysPassed) * 100)
    : 0

  // Chart data
  const chartData = weightLogs.map((log) => ({
    date: log.date,
    weight: log.weight,
  }))

  // Group exercise sets by exercise for lifting progress
  const exerciseData: Record<string, { date: string; weight: number }[]> = {}
  exerciseSets.forEach((set) => {
    if (!set.weight) return
    const exerciseName = set.exercise_name
    if (!exerciseData[exerciseName]) {
      exerciseData[exerciseName] = []
    }
    // Get date from the joined workout
    const workoutDate = (set.workouts as { date: string }).date
    // Check if we already have an entry for this date
    const existingEntry = exerciseData[exerciseName].find((e) => e.date === workoutDate)
    if (existingEntry) {
      // Keep max weight for the day
      existingEntry.weight = Math.max(existingEntry.weight, set.weight)
    } else {
      exerciseData[exerciseName].push({
        date: workoutDate,
        weight: set.weight,
      })
    }
  })

  // Sort exercise data by date
  Object.keys(exerciseData).forEach((key) => {
    exerciseData[key].sort((a, b) => a.date.localeCompare(b.date))
  })

  // Calculate progress percentage toward goal
  const progressPercent = currentWeight
    ? Math.round(((startWeight - currentWeight) / (startWeight - goalWeight)) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Monthly Progress</h1>
        <p className="text-muted-foreground">
          {monthName} • Day {daysPassed} of {daysInMonth}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Current Weight"
          value={currentWeight ? `${currentWeight.toFixed(1)} lbs` : '-- lbs'}
          icon="⚖️"
          subtitle={
            isOnTrack === true
              ? '✅ On track'
              : isOnTrack === false
              ? `Target: ${targetWeight} lbs`
              : 'Log weight to track'
          }
          trend={
            monthlyChange !== null
              ? { value: monthlyChange, isPositive: monthlyChange < 0 }
              : undefined
          }
        />

        <StatCard
          title="Monthly Target"
          value={`${targetWeight} lbs`}
          icon="🎯"
          subtitle={currentWeight ? `${(currentWeight - targetWeight).toFixed(1)} lbs to go` : 'Track progress'}
        />

        <StatCard
          title="Workouts"
          value={`${workoutsCompleted}`}
          icon="💪"
          subtitle={`${workoutPercent}% of expected`}
        />

        <StatCard
          title="Habits"
          value={`${habitPercent}%`}
          icon="✅"
          subtitle={`${perfectHabitDays} perfect days`}
        />
      </div>

      {/* Progress to Goal */}
      <Card>
        <CardHeader>
          <CardTitle>Progress to Goal</CardTitle>
          <CardDescription>
            {startWeight} lbs → {goalWeight} lbs (Target: {targetWeight} lbs this month)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Start: {startWeight} lbs</span>
              <span>Current: {currentWeight?.toFixed(1) ?? '--'} lbs</span>
              <span>Goal: {goalWeight} lbs</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-chart-1 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progressPercent}% complete</span>
              <span>{currentWeight ? (startWeight - currentWeight).toFixed(1) : 0} lbs lost</span>
              <span>{currentWeight ? (currentWeight - goalWeight).toFixed(1) : (startWeight - goalWeight)} lbs to go</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
          <CardDescription>
            {monthName} • Average: {monthlyAvg?.toFixed(1) ?? '--'} lbs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <WeightChart
              data={chartData}
              targetWeight={targetWeight}
              startWeight={previousTarget}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No weight data logged this month
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lifting Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Lifting Progress</CardTitle>
          <CardDescription>
            Weight progression by exercise this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LiftingProgress exerciseData={exerciseData} />
        </CardContent>
      </Card>

      {/* Monthly Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Milestones</CardTitle>
          <CardDescription>Targets for {monthName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Weight Milestone */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚖️</span>
                <div>
                  <p className="font-medium">Weight Target</p>
                  <p className="text-sm text-muted-foreground">{targetWeight} lbs by end of month</p>
                </div>
              </div>
              <div className="text-right">
                {isOnTrack === true ? (
                  <span className="text-green-500 font-medium">✅ On Track</span>
                ) : isOnTrack === false ? (
                  <span className="text-yellow-500 font-medium">
                    {(currentWeight! - targetWeight).toFixed(1)} lbs over
                  </span>
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </div>
            </div>

            {/* Lifting Milestones */}
            {Object.entries(EXERCISES)
              .filter(([_, ex]) => ex.targetWeight2026)
              .slice(0, 3)
              .map(([id, exercise]) => {
                const latestWeight = exerciseData[id]?.slice(-1)[0]?.weight ?? 0
                const monthlyTarget = exercise.targetWeight2026
                  ? Math.round(exercise.targetWeight2026 * (currentMonth / 12))
                  : null

                return (
                  <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏋️</span>
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Target: {monthlyTarget} lbs this month
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {latestWeight > 0 ? (
                        <span className={latestWeight >= (monthlyTarget ?? 0) ? 'text-green-500' : 'text-muted-foreground'}>
                          {latestWeight} lbs {latestWeight >= (monthlyTarget ?? 0) ? '✅' : ''}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No data</span>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
