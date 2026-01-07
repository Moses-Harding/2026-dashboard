/**
 * Today Page Content (Client Component)
 *
 * Uses shared dashboard data from context for instant rendering.
 * Only page-specific data (today's steps/sleep) is passed as props.
 */

'use client'

import { useMemo, type ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WeightChart } from '@/components/charts/weight-chart'
import { WeightForm } from '@/components/forms/weight-form'
import { WorkoutForm } from '@/components/forms/workout-form'
import { HabitChecklist } from '@/components/forms/habit-checklist'
import { StatCard } from '@/components/dashboard/stat-card'
import { HabitHeatmap } from '@/components/dashboard/habit-heatmap'
import { WorkoutHistory } from '@/components/dashboard/workout-history'
import { MilestoneCard } from '@/components/dashboard/milestone-card'
import { MilestoneSeed } from '@/components/dashboard/milestone-seed'
import { AchievementsList } from '@/components/dashboard/achievements-list'
import { RefreshButton } from '@/components/dashboard/refresh-button'
import { useDashboard, useWeightLogs, useHabitLogs, useWorkouts } from '@/components/providers/dashboard-provider'
import { getTodaysWorkout, WORKOUT_TYPES } from '@/lib/constants/workouts'
import { getNow, formatDateISO } from '@/lib/utils/dates'
import type { WorkoutType, HabitLog } from '@/types/database'

interface TodayContentProps {
  todaySteps: number | null
  todaySleep: number | null
  syncStatusSlot: ReactNode // Server Component passed as slot
}

export function TodayContent({ todaySteps, todaySleep, syncStatusSlot }: TodayContentProps) {
  const { data } = useDashboard()
  const weightLogs = useWeightLogs(30)
  const habitLogs = useHabitLogs(7)
  const workouts = useWorkouts(30)

  // Memoize calculations to avoid re-renders
  const today = useMemo(() => formatDateISO(getNow()), [])
  const now = useMemo(() => getNow(), [])

  // Today's data
  const todayWeightLog = useMemo(
    () => weightLogs.find((log) => log.date === today),
    [weightLogs, today]
  )
  const currentWeight = todayWeightLog?.weight ?? null

  const todayHabit = useMemo(
    () => data.habitLogs.find((log) => log.date === today) as HabitLog | undefined,
    [data.habitLogs, today]
  )

  // Weekly average
  const weeklyStats = useMemo(() => {
    const lastSevenDaysWeight = weightLogs.slice(-7)
    const weeklyAverage = lastSevenDaysWeight.length > 0
      ? lastSevenDaysWeight.reduce((sum, log) => sum + log.weight, 0) / lastSevenDaysWeight.length
      : null

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayLog = weightLogs.find((log) => log.date === formatDateISO(yesterday))
    const weightChange = currentWeight && yesterdayLog ? currentWeight - yesterdayLog.weight : null

    return { weeklyAverage, lastSevenDaysWeight, weightChange }
  }, [weightLogs, now, currentWeight])

  // Monthly targets
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const monthlyTargets: Record<number, number> = {
    1: 218, 2: 216, 3: 214, 4: 212, 5: 210, 6: 208,
    7: 206, 8: 204, 9: 202, 10: 200, 11: 197, 12: 195,
  }
  const targetWeight = monthlyTargets[currentMonth] ?? 195
  const startWeight = 220
  const goalWeight = 195

  const chartData = useMemo(
    () => weightLogs.map((log) => ({ date: log.date, weight: log.weight })),
    [weightLogs]
  )

  const isOnTrack = currentWeight ? Math.abs(currentWeight - targetWeight) <= 2 : null

  // Today's workout
  const scheduledWorkout = getTodaysWorkout()
  const scheduledWorkoutType = scheduledWorkout === 'rest' ? null : scheduledWorkout
  const todayWorkoutInfo = scheduledWorkoutType ? WORKOUT_TYPES[scheduledWorkoutType] : null
  const todayWorkoutLogged = workouts.some((w) => w.date === today)

  // Habit streak
  const streak = useMemo(() => {
    let count = 0
    const sortedHabits = [...data.habitLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(now)
      checkDate.setDate(checkDate.getDate() - i)
      const checkDateStr = formatDateISO(checkDate)
      const log = sortedHabits.find((l) => l.date === checkDateStr)
      if (log && (log.meditation || log.journal)) {
        count++
      } else if (i === 0) {
        continue
      } else {
        break
      }
    }
    return count
  }, [data.habitLogs, now])

  // Format today's date
  const todayFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Today</h1>
          <RefreshButton />
        </div>
        <p className="text-muted-foreground">{todayFormatted}</p>
        <div className="mt-2">
          {syncStatusSlot}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Current Weight"
          value={currentWeight ? `${currentWeight.toFixed(1)} lbs` : '-- lbs'}
          icon="⚖️"
          subtitle={
            isOnTrack === true
              ? '✅ On track for monthly goal'
              : isOnTrack === false
              ? `⚠️ Target: ${targetWeight} lbs`
              : 'Log your weight below'
          }
          trend={
            weeklyStats.weightChange !== null
              ? { value: weeklyStats.weightChange, isPositive: weeklyStats.weightChange < 0 }
              : undefined
          }
        />

        <StatCard
          title="Weekly Average"
          value={weeklyStats.weeklyAverage ? `${weeklyStats.weeklyAverage.toFixed(1)} lbs` : '-- lbs'}
          icon="📊"
          subtitle={`${weeklyStats.lastSevenDaysWeight.length}/7 days logged`}
        />

        <StatCard
          title="Today's Workout"
          value={todayWorkoutInfo?.label ?? 'Rest Day'}
          icon={todayWorkoutInfo?.emoji ?? '😴'}
          subtitle={todayWorkoutLogged ? '✅ Completed' : 'Log workout below'}
        />
      </div>

      {/* Two Column Layout for Habits and Workout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habits Card */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Habits</CardTitle>
            <CardDescription>Track your consistency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <HabitChecklist
              date={today}
              initialData={todayHabit}
              streak={streak}
              sleepHours={todaySleep}
              steps={todaySteps}
            />
            <HabitHeatmap habitLogs={habitLogs} />
          </CardContent>
        </Card>

        {/* Workout Card */}
        <Card>
          <CardHeader>
            <CardTitle>Workout</CardTitle>
            <CardDescription>
              {scheduledWorkout === 'rest'
                ? 'Rest day - take it easy!'
                : `${todayWorkoutInfo?.label} - ${todayWorkoutInfo?.description}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduledWorkout !== 'rest' && (
              <WorkoutForm
                defaultWorkoutType={scheduledWorkoutType as WorkoutType}
                date={today}
              />
            )}
            {workouts.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Recent Workouts</h4>
                <WorkoutHistory workouts={workouts.slice(0, 3)} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weight Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
          <CardDescription>
            Last 30 days • Goal: {goalWeight} lbs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeightChart
            data={chartData}
            targetWeight={goalWeight}
            startWeight={startWeight}
          />
        </CardContent>
      </Card>

      {/* Weight Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Log Weight</CardTitle>
          <CardDescription>
            {currentWeight
              ? `Update today's weight (currently ${currentWeight.toFixed(1)} lbs)`
              : 'Add your weight for today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeightForm userId={data.user.id} todayWeight={currentWeight} />
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Summary</CardTitle>
          <CardDescription>Your journey so far</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{startWeight}</p>
              <p className="text-sm text-muted-foreground">Start Weight</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{currentWeight?.toFixed(1) ?? '--'}</p>
              <p className="text-sm text-muted-foreground">Current</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{targetWeight}</p>
              <p className="text-sm text-muted-foreground">Monthly Target</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{goalWeight}</p>
              <p className="text-sm text-muted-foreground">Goal Weight</p>
            </div>
          </div>
          {currentWeight && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to goal</span>
                <span>
                  {((startWeight - currentWeight) / (startWeight - goalWeight) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-1 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, (startWeight - currentWeight) / (startWeight - goalWeight) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.currentMilestone ? (
          <MilestoneCard milestone={data.currentMilestone} currentWeight={currentWeight} />
        ) : (
          <MilestoneSeed year={currentYear} />
        )}
        <AchievementsList achievements={data.achievements} />
      </div>
    </div>
  )
}
