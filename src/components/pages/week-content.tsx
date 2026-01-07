/**
 * Week Page Content (Client Component)
 *
 * Uses shared dashboard data from context for instant rendering.
 * Filters data to current week.
 */

'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'
import { WeightChart } from '@/components/charts/weight-chart'
import { HabitHeatmap } from '@/components/dashboard/habit-heatmap'
import { WorkoutHistory } from '@/components/dashboard/workout-history'
import { useDashboard } from '@/components/providers/dashboard-provider'
import {
  getNow,
  getWeekStart,
  getWeekEnd,
  formatDateISO,
  formatDateRange,
} from '@/lib/utils/dates'
import type { NutritionLog } from '@/types/database'

interface WeekContentProps {
  nutritionLogs: NutritionLog[]
}

export function WeekContent({ nutritionLogs }: WeekContentProps) {
  const { data } = useDashboard()

  // Calculate week range
  const now = useMemo(() => getNow(), [])
  const weekStart = useMemo(() => getWeekStart(now), [now])
  const weekEnd = useMemo(() => getWeekEnd(now), [now])
  const weekStartStr = useMemo(() => formatDateISO(weekStart), [weekStart])
  const weekEndStr = useMemo(() => formatDateISO(weekEnd), [weekEnd])

  // Filter shared data to current week
  const weightLogs = useMemo(
    () => data.weightLogs.filter((log) => log.date >= weekStartStr && log.date <= weekEndStr),
    [data.weightLogs, weekStartStr, weekEndStr]
  )

  const habitLogs = useMemo(
    () => data.habitLogs.filter((log) => log.date >= weekStartStr && log.date <= weekEndStr),
    [data.habitLogs, weekStartStr, weekEndStr]
  )

  const workouts = useMemo(
    () => data.workouts.filter((w) => w.date >= weekStartStr && w.date <= weekEndStr),
    [data.workouts, weekStartStr, weekEndStr]
  )

  // Calculate weekly weight average
  const weeklyWeightAvg = weightLogs.length > 0
    ? weightLogs.reduce((sum, log) => sum + log.weight, 0) / weightLogs.length
    : null

  // Calculate workout completion (target: 5 workouts per week)
  const workoutTarget = 5
  const workoutsCompleted = workouts.length
  const workoutPercent = Math.round((workoutsCompleted / workoutTarget) * 100)

  // Calculate habit consistency
  const totalHabitDays = habitLogs.length
  const habitCompleteDays = habitLogs.filter(
    (log) => log.meditation && log.journal && log.creatine
  ).length
  const habitPercent = totalHabitDays > 0
    ? Math.round((habitCompleteDays / totalHabitDays) * 100)
    : 0

  // Calculate nutrition adherence (target: 1800 cal on weekdays)
  const nutritionDays = nutritionLogs.length
  const nutritionOnTarget = nutritionLogs.filter((log) => {
    const dayOfWeek = new Date(log.date).getDay()
    const target = dayOfWeek === 5 ? 2400 : dayOfWeek === 6 ? 3250 : dayOfWeek === 0 ? 2200 : 1800
    return (log.calories ?? 0) <= target * 1.1
  }).length
  const nutritionPercent = nutritionDays > 0
    ? Math.round((nutritionOnTarget / nutritionDays) * 100)
    : 0

  // Get monthly target for comparison
  const currentMonth = now.getMonth() + 1
  const monthlyTargets: Record<number, number> = {
    1: 218, 2: 216, 3: 214, 4: 212, 5: 210, 6: 208,
    7: 206, 8: 204, 9: 202, 10: 200, 11: 197, 12: 195,
  }
  const targetWeight = monthlyTargets[currentMonth] ?? 195
  const goalWeight = 195

  // Chart data
  const chartData = weightLogs.map((log) => ({
    date: log.date,
    weight: log.weight,
  }))

  // Calculate average calories/protein
  const avgCalories = nutritionLogs.length > 0
    ? Math.round(nutritionLogs.reduce((sum, log) => sum + (log.calories ?? 0), 0) / nutritionLogs.length)
    : null
  const avgProtein = nutritionLogs.length > 0
    ? Math.round(nutritionLogs.reduce((sum, log) => sum + (log.protein ?? 0), 0) / nutritionLogs.length)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Weekly Trends</h1>
        <p className="text-muted-foreground">{formatDateRange(weekStart, weekEnd)}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Avg Weight"
          value={weeklyWeightAvg ? `${weeklyWeightAvg.toFixed(1)} lbs` : '-- lbs'}
          icon="⚖️"
          subtitle={`${weightLogs.length}/7 days logged`}
          trend={
            weeklyWeightAvg && targetWeight
              ? {
                  value: weeklyWeightAvg - targetWeight,
                  isPositive: weeklyWeightAvg <= targetWeight,
                }
              : undefined
          }
        />

        <StatCard
          title="Workouts"
          value={`${workoutsCompleted}/${workoutTarget}`}
          icon="💪"
          subtitle={`${workoutPercent}% complete`}
        />

        <StatCard
          title="Habits"
          value={`${habitPercent}%`}
          icon="✅"
          subtitle={`${habitCompleteDays}/${totalHabitDays} perfect days`}
        />

        <StatCard
          title="Nutrition"
          value={avgCalories ? `${avgCalories} cal` : '-- cal'}
          icon="🍎"
          subtitle={avgProtein ? `${avgProtein}g protein avg` : 'No data'}
        />
      </div>

      {/* Weight Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weight This Week</CardTitle>
          <CardDescription>
            Target: {targetWeight} lbs • Goal: {goalWeight} lbs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <WeightChart
              data={chartData}
              targetWeight={targetWeight}
              startWeight={220}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No weight data logged this week
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habits */}
        <Card>
          <CardHeader>
            <CardTitle>Habit Consistency</CardTitle>
            <CardDescription>Daily habit completion this week</CardDescription>
          </CardHeader>
          <CardContent>
            <HabitHeatmap habitLogs={habitLogs} />
          </CardContent>
        </Card>

        {/* Workouts */}
        <Card>
          <CardHeader>
            <CardTitle>Workouts</CardTitle>
            <CardDescription>
              {workoutsCompleted} of {workoutTarget} completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workouts.length > 0 ? (
              <WorkoutHistory workouts={workouts} />
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No workouts logged this week</p>
                <p className="text-sm mt-1">Get moving!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Week Summary</CardTitle>
          <CardDescription>How you're tracking this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Weight Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>⚖️</span>
                <span>Weight vs Target</span>
              </div>
              {weeklyWeightAvg ? (
                <span className={weeklyWeightAvg <= targetWeight ? 'text-green-500' : 'text-yellow-500'}>
                  {weeklyWeightAvg <= targetWeight ? '✅ On track' : `⚠️ ${(weeklyWeightAvg - targetWeight).toFixed(1)} lbs over`}
                </span>
              ) : (
                <span className="text-muted-foreground">No data</span>
              )}
            </div>

            {/* Workout Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>💪</span>
                <span>Workout Completion</span>
              </div>
              <span className={workoutPercent >= 80 ? 'text-green-500' : workoutPercent >= 60 ? 'text-yellow-500' : 'text-red-500'}>
                {workoutPercent >= 80 ? '✅ On track' : workoutPercent >= 60 ? '⚠️ Almost there' : '❌ Behind'}
              </span>
            </div>

            {/* Habit Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Habit Consistency</span>
              </div>
              <span className={habitPercent >= 80 ? 'text-green-500' : habitPercent >= 60 ? 'text-yellow-500' : 'text-red-500'}>
                {habitPercent >= 80 ? '✅ Excellent' : habitPercent >= 60 ? '⚠️ Good' : '❌ Needs work'}
              </span>
            </div>

            {/* Nutrition Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🍎</span>
                <span>Nutrition Adherence</span>
              </div>
              <span className={nutritionPercent >= 80 ? 'text-green-500' : nutritionPercent >= 60 ? 'text-yellow-500' : 'text-red-500'}>
                {nutritionPercent >= 80 ? '✅ On target' : nutritionPercent >= 60 ? '⚠️ Close' : nutritionDays === 0 ? 'No data' : '❌ Over budget'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
