/**
 * Dashboard Layout
 *
 * Wraps all dashboard pages (/today, /week, /month, /quarter, /settings).
 * Provides:
 * - Sidebar navigation with active state
 * - Mobile bottom navigation
 * - Auth protection (middleware handles this)
 * - Shared data context (Phase 6: Performance optimization)
 *
 * iOS Comparison: Like a TabView or NavigationSplitView
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarNav, MobileNav } from '@/components/dashboard/sidebar-nav'
import { DashboardProvider, type DashboardData } from '@/components/providers/dashboard-provider'
import { getNow } from '@/lib/utils/dates'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify user is authenticated (extra safety beyond middleware)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Calculate date ranges for shared data
  const now = getNow()
  const ninetyDaysAgo = new Date(now)
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Fetch all shared data in parallel
  const [
    weightLogsResult,
    habitLogsResult,
    workoutsResult,
    milestoneResult,
    achievementsResult,
  ] = await Promise.all([
    // Weight logs for last 90 days (covers all timeframes)
    supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true }),
    // Habit logs for last 30 days
    supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false }),
    // Workouts for last 30 days with exercise sets
    supabase
      .from('workouts')
      .select('*, exercise_sets(*)')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false }),
    // Current month's milestone
    supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single(),
    // Recent achievements
    supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('achieved_at', { ascending: false })
      .limit(10),
  ])

  // Transform workouts to ensure exercise_sets is always an array
  const workoutsData = (workoutsResult.data ?? []).map((w) => ({
    ...w,
    exercise_sets: w.exercise_sets ?? [],
  }))

  // Assemble shared data
  const dashboardData: DashboardData = {
    user: {
      id: user.id,
      email: user.email,
    },
    weightLogs: weightLogsResult.data ?? [],
    habitLogs: habitLogsResult.data ?? [],
    workouts: workoutsData,
    currentMilestone: milestoneResult.data,
    achievements: achievementsResult.data ?? [],
    lastSynced: new Date().toISOString(),
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        {/* Logo/Title */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold">2026 Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            220 → 195 lbs
          </p>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* User info & logout */}
        <div className="p-4 border-t border-border">
          <p className="text-sm text-muted-foreground truncate mb-2">
            {user.email}
          </p>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-border bg-card flex items-center px-4 z-50">
        <h1 className="text-lg font-bold">2026 Dashboard</h1>
      </div>

      {/* Main content */}
      <main className="flex-1 md:p-8 p-4 pt-18 md:pt-8 pb-20 md:pb-8 overflow-auto">
        <DashboardProvider initialData={dashboardData}>
          {children}
        </DashboardProvider>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  )
}
