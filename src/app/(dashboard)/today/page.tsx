/**
 * Today Dashboard Page
 *
 * The main dashboard view showing:
 * - Current weight and weekly average
 * - Weight trend chart (last 30 days)
 * - Quick weight entry form
 * - Progress toward goals
 *
 * This is a Server Component - it fetches data on the server
 * before rendering, then passes data to client components.
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WeightChart } from '@/components/charts/weight-chart'
import { WeightForm } from '@/components/forms/weight-form'
import { StatCard } from '@/components/dashboard/stat-card'
import { SyncStatus } from '@/components/dashboard/sync-status'

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null // Middleware will redirect
  }

  // Fetch weight data for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: weightLogs, error } = await supabase
    .from('weight_logs')
    .select('date, weight')
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching weight logs:', error)
  }

  // Calculate statistics
  const today = new Date().toISOString().split('T')[0]
  const todayLog = weightLogs?.find((log) => log.date === today)
  const currentWeight = todayLog?.weight ?? null

  // Calculate 7-day average
  const lastSevenDays = weightLogs?.slice(-7) ?? []
  const weeklyAverage = lastSevenDays.length > 0
    ? lastSevenDays.reduce((sum, log) => sum + log.weight, 0) / lastSevenDays.length
    : null

  // Calculate change from yesterday
  const yesterdayLog = weightLogs?.find((log) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return log.date === yesterday.toISOString().split('T')[0]
  })
  const weightChange = currentWeight && yesterdayLog
    ? currentWeight - yesterdayLog.weight
    : null

  // Get current month's target (placeholder - we'll add milestone data later)
  const currentMonth = new Date().getMonth() + 1
  const monthlyTargets: Record<number, number> = {
    1: 218, 2: 216, 3: 214, 4: 212, 5: 210, 6: 208,
    7: 206, 8: 204, 9: 202, 10: 200, 11: 197, 12: 195,
  }
  const targetWeight = monthlyTargets[currentMonth] ?? 195
  const startWeight = 220
  const goalWeight = 195

  // Format chart data
  const chartData = (weightLogs ?? []).map((log) => ({
    date: log.date,
    weight: log.weight,
  }))

  // Check if on track (within 2 lbs of monthly target)
  const isOnTrack = currentWeight ? Math.abs(currentWeight - targetWeight) <= 2 : null

  // Get today's date formatted
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Determine workout for today (based on day of week)
  const dayOfWeek = new Date().getDay() // 0 = Sunday
  const workouts: Record<number, string> = {
    0: 'Rest Day + Weekly Review',
    1: 'Chest & Triceps',
    2: 'Cardio',
    3: 'Shoulders & Biceps',
    4: 'Cardio',
    5: 'Volume Day',
    6: 'Active Rest',
  }
  const todayWorkout = workouts[dayOfWeek]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="text-muted-foreground">{todayFormatted}</p>
        <div className="mt-2">
          <SyncStatus userId={user.id} />
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
            weightChange !== null
              ? { value: weightChange, isPositive: weightChange < 0 }
              : undefined
          }
        />

        <StatCard
          title="Weekly Average"
          value={weeklyAverage ? `${weeklyAverage.toFixed(1)} lbs` : '-- lbs'}
          icon="📊"
          subtitle={`${lastSevenDays.length}/7 days logged`}
        />

        <StatCard
          title="Today's Workout"
          value={todayWorkout}
          icon="💪"
          subtitle="Based on your schedule"
        />
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
          <WeightForm userId={user.id} todayWeight={currentWeight} />
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
    </div>
  )
}
