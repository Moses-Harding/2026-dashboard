/**
 * Quarterly Checkpoints Page
 *
 * Shows big-picture progress for the current quarter:
 * - Quarterly weight goal and progress
 * - Lifting summary (start vs current vs target)
 * - Overall habit consistency
 * - Narrative from original plan
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'
import { WeightChart } from '@/components/charts/weight-chart'
import {
  getNow,
  getQuarter,
  getQuarterStart,
  getQuarterEnd,
  formatDateISO,
  getDaysInRange,
} from '@/lib/utils/dates'
import { EXERCISES } from '@/lib/constants/workouts'

// Quarterly goals from the fitness plan
const quarterlyGoals: Record<number, { weight: number; description: string }> = {
  1: {
    weight: 214,
    description: 'Muscle memory returning, establishing consistency. Focus on building habits and getting back into routine.',
  },
  2: {
    weight: 208,
    description: 'Visible changes in the mirror. Strength increasing noticeably. Clothes fitting better.',
  },
  3: {
    weight: 202,
    description: 'Midsection getting smaller. Significant strength gains. Energy levels high.',
  },
  4: {
    weight: 195,
    description: 'Goal weight achieved! Significantly more muscular. Sustainable habits established.',
  },
}

export default async function QuarterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const now = getNow()
  const quarter = getQuarter(now)
  const quarterStart = getQuarterStart(now)
  const quarterEnd = getQuarterEnd(now)
  const quarterStartStr = formatDateISO(quarterStart)
  const quarterEndStr = formatDateISO(quarterEnd)
  const daysInQuarter = getDaysInRange(quarterStart, quarterEnd)
  const daysPassed = getDaysInRange(quarterStart, now)

  const quarterGoal = quarterlyGoals[quarter]
  const previousQuarterGoal = quarterlyGoals[quarter - 1]?.weight ?? 220
  const startWeight = 220
  const goalWeight = 195

  // Fetch all quarter data in parallel
  const [
    weightLogsResult,
    habitLogsResult,
    workoutsResult,
    exerciseSetsResult,
  ] = await Promise.all([
    // Weight logs for the quarter
    supabase
      .from('weight_logs')
      .select('date, weight')
      .eq('user_id', user.id)
      .gte('date', quarterStartStr)
      .lte('date', quarterEndStr)
      .order('date', { ascending: true }),
    // Habit logs for the quarter
    supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', quarterStartStr)
      .lte('date', quarterEndStr),
    // Workouts for the quarter
    supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', quarterStartStr)
      .lte('date', quarterEndStr),
    // Exercise sets for lifting progress
    supabase
      .from('exercise_sets')
      .select('*, workouts!inner(date, user_id)')
      .eq('workouts.user_id', user.id)
      .gte('workouts.date', quarterStartStr)
      .lte('workouts.date', quarterEndStr),
  ])

  const weightLogs = weightLogsResult.data ?? []
  const habitLogs = habitLogsResult.data ?? []
  const workouts = workoutsResult.data ?? []
  const exerciseSets = exerciseSetsResult.data ?? []

  // Current and start weights
  const currentWeight = weightLogs.length > 0
    ? weightLogs[weightLogs.length - 1].weight
    : null
  const quarterStartWeight = weightLogs.length > 0
    ? weightLogs[0].weight
    : null

  // Weight change this quarter
  const quarterlyChange = currentWeight && quarterStartWeight
    ? currentWeight - quarterStartWeight
    : null

  // On track calculation
  const expectedProgress = (daysPassed / daysInQuarter) * (previousQuarterGoal - quarterGoal.weight)
  const expectedWeight = previousQuarterGoal - expectedProgress
  const isOnTrack = currentWeight
    ? currentWeight <= expectedWeight + 2
    : null

  // Workout stats
  const expectedWorkouts = Math.floor(daysPassed * 5 / 7)
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

  // Calculate max weights per exercise
  const exerciseMaxes: Record<string, { start: number; current: number; target: number }> = {}

  // Get first and last weights for each exercise
  const exerciseByDate: Record<string, { date: string; weight: number }[]> = {}
  exerciseSets.forEach((set) => {
    if (!set.weight) return
    const exerciseName = set.exercise_name
    const workoutDate = (set.workouts as { date: string }).date

    if (!exerciseByDate[exerciseName]) {
      exerciseByDate[exerciseName] = []
    }

    const existingEntry = exerciseByDate[exerciseName].find((e) => e.date === workoutDate)
    if (existingEntry) {
      existingEntry.weight = Math.max(existingEntry.weight, set.weight)
    } else {
      exerciseByDate[exerciseName].push({ date: workoutDate, weight: set.weight })
    }
  })

  // Calculate start, current, and target for main lifts
  Object.entries(EXERCISES)
    .filter(([_, ex]) => ex.targetWeight2026)
    .forEach(([id, exercise]) => {
      const data = exerciseByDate[id] ?? []
      data.sort((a, b) => a.date.localeCompare(b.date))

      exerciseMaxes[id] = {
        start: data[0]?.weight ?? 0,
        current: data[data.length - 1]?.weight ?? 0,
        target: exercise.targetWeight2026 ?? 0,
      }
    })

  // Progress percentage for the year
  const yearProgress = currentWeight
    ? Math.round(((startWeight - currentWeight) / (startWeight - goalWeight)) * 100)
    : 0

  // Quarter progress percentage
  const quarterProgress = Math.round((daysPassed / daysInQuarter) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Q{quarter} Checkpoint</h1>
        <p className="text-muted-foreground">
          {quarterStart.toLocaleDateString('en-US', { month: 'long' })} - {quarterEnd.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          {' '} • {quarterProgress}% complete
        </p>
      </div>

      {/* Quarter Goal Card */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎯</span>
            Q{quarter} Goal: {quarterGoal.weight} lbs
          </CardTitle>
          <CardDescription>{quarterGoal.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${quarterProgress}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium">{quarterProgress}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Current Weight"
          value={currentWeight ? `${currentWeight.toFixed(1)} lbs` : '-- lbs'}
          icon="⚖️"
          subtitle={
            isOnTrack === true
              ? '✅ On track for Q' + quarter
              : isOnTrack === false
              ? `Target: ${quarterGoal.weight} lbs`
              : 'Log weight to track'
          }
          trend={
            quarterlyChange !== null
              ? { value: quarterlyChange, isPositive: quarterlyChange < 0 }
              : undefined
          }
        />

        <StatCard
          title="Q{quarter} Target"
          value={`${quarterGoal.weight} lbs`}
          icon="🎯"
          subtitle={currentWeight ? `${(currentWeight - quarterGoal.weight).toFixed(1)} lbs to go` : '--'}
        />

        <StatCard
          title="Workouts"
          value={`${workoutsCompleted}`}
          icon="💪"
          subtitle={`${workoutPercent}% adherence`}
        />

        <StatCard
          title="Habits"
          value={`${habitPercent}%`}
          icon="✅"
          subtitle={`${perfectHabitDays} perfect days`}
        />
      </div>

      {/* Year Progress */}
      <Card>
        <CardHeader>
          <CardTitle>2026 Progress</CardTitle>
          <CardDescription>
            {startWeight} lbs → {goalWeight} lbs by December
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Start: {startWeight} lbs</span>
                <span className="font-medium">{yearProgress}% to goal</span>
                <span>Goal: {goalWeight} lbs</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-chart-1 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, yearProgress))}%` }}
                />
                {/* Quarter markers */}
                <div className="absolute inset-0 flex">
                  {[1, 2, 3].map((q) => (
                    <div
                      key={q}
                      className="flex-1 border-r border-background/50"
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Q1: 214</span>
                <span>Q2: 208</span>
                <span>Q3: 202</span>
                <span>Q4: 195</span>
              </div>
            </div>

            {/* Current status */}
            <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t">
              <div>
                <p className="text-2xl font-bold">{quarterStartWeight?.toFixed(1) ?? '--'}</p>
                <p className="text-sm text-muted-foreground">Quarter Start</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{currentWeight?.toFixed(1) ?? '--'}</p>
                <p className="text-sm text-muted-foreground">Current</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{quarterGoal.weight}</p>
                <p className="text-sm text-muted-foreground">Q{quarter} Target</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Trend - Q{quarter}</CardTitle>
          <CardDescription>
            {weightLogs.length} entries this quarter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <WeightChart
              data={chartData}
              targetWeight={quarterGoal.weight}
              startWeight={previousQuarterGoal}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No weight data logged this quarter
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lifting Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Lifting Summary</CardTitle>
          <CardDescription>Start → Current → 2026 Target</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(EXERCISES)
              .filter(([_, ex]) => ex.targetWeight2026)
              .map(([id, exercise]) => {
                const data = exerciseMaxes[id] ?? { start: 0, current: 0, target: 0 }
                const progressPercent = data.target > 0
                  ? Math.round((data.current / data.target) * 100)
                  : 0

                return (
                  <div key={id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{exercise.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.current > 0 ? `${data.current} lbs` : 'No data'} / {data.target} lbs
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-chart-3 transition-all duration-500"
                        style={{ width: `${Math.min(100, progressPercent)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Start: {data.start > 0 ? `${data.start} lbs` : '--'}</span>
                      <span>{progressPercent}% to target</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Quarter Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Q{quarter} Checklist</CardTitle>
          <CardDescription>Key indicators for this quarter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className={isOnTrack ? 'text-green-500' : 'text-yellow-500'}>
                {isOnTrack ? '✅' : '⏳'}
              </span>
              <div className="flex-1">
                <p className="font-medium">Weight on track for {quarterGoal.weight} lbs</p>
                <p className="text-sm text-muted-foreground">
                  {currentWeight
                    ? `Currently ${currentWeight.toFixed(1)} lbs (${isOnTrack ? 'on pace' : `${(currentWeight - expectedWeight).toFixed(1)} lbs behind`})`
                    : 'No data yet'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className={workoutPercent >= 80 ? 'text-green-500' : 'text-yellow-500'}>
                {workoutPercent >= 80 ? '✅' : '⏳'}
              </span>
              <div className="flex-1">
                <p className="font-medium">Consistent workout schedule</p>
                <p className="text-sm text-muted-foreground">
                  {workoutsCompleted} workouts completed ({workoutPercent}% adherence)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className={habitPercent >= 80 ? 'text-green-500' : 'text-yellow-500'}>
                {habitPercent >= 80 ? '✅' : '⏳'}
              </span>
              <div className="flex-1">
                <p className="font-medium">Daily habits established</p>
                <p className="text-sm text-muted-foreground">
                  {habitDays} days logged, {perfectHabitDays} perfect days
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
