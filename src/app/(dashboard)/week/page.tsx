/**
 * Weekly Trends Page
 *
 * Shows aggregated data for the current week:
 * - Weekly weight average vs target
 * - Workout completion rate
 * - Habit consistency
 * - Nutrition adherence
 *
 * Performance optimized: Uses shared data from DashboardProvider.
 * Only fetches page-specific data (nutrition logs for the week).
 */

import { createClient } from '@/lib/supabase/server'
import { WeekContent } from '@/components/pages/week-content'
import { getNow, getWeekStart, getWeekEnd, formatDateISO } from '@/lib/utils/dates'

export default async function WeekPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Calculate week range
  const now = getNow()
  const weekStart = getWeekStart(now)
  const weekEnd = getWeekEnd(now)
  const weekStartStr = formatDateISO(weekStart)
  const weekEndStr = formatDateISO(weekEnd)

  // Only fetch page-specific data (nutrition logs not in shared context)
  const { data: nutritionLogs } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', weekStartStr)
    .lte('date', weekEndStr)
    .order('date', { ascending: true })

  return <WeekContent nutritionLogs={nutritionLogs ?? []} />
}
