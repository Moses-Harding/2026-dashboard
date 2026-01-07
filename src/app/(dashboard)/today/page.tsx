/**
 * Today Dashboard Page
 *
 * The main dashboard view showing:
 * - Current weight and weekly average
 * - Weight trend chart (last 30 days)
 * - Quick weight entry form
 * - Workout logging and history
 * - Habit tracking with streaks
 * - Progress toward goals
 *
 * Performance optimized: Uses shared data from DashboardProvider.
 * Only fetches page-specific data (today's steps/sleep).
 */

import { createClient } from '@/lib/supabase/server'
import { TodayContent } from '@/components/pages/today-content'
import { SyncStatus } from '@/components/dashboard/sync-status'
import { getNow, formatDateISO } from '@/lib/utils/dates'

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null // Middleware will redirect
  }

  // Only fetch page-specific data (steps/sleep from Apple Health sync)
  const today = formatDateISO(getNow())

  const [todayStepsResult, todaySleepResult] = await Promise.all([
    supabase
      .from('steps_logs')
      .select('steps')
      .eq('user_id', user.id)
      .eq('date', today)
      .single(),
    supabase
      .from('sleep_logs')
      .select('hours')
      .eq('user_id', user.id)
      .eq('date', today)
      .single(),
  ])

  const todaySteps = todayStepsResult.data?.steps ?? null
  const todaySleep = todaySleepResult.data?.hours ?? null

  return (
    <TodayContent
      todaySteps={todaySteps}
      todaySleep={todaySleep}
      syncStatusSlot={<SyncStatus userId={user.id} />}
    />
  )
}
