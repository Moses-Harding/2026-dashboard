/**
 * Dashboard Layout
 *
 * Wraps all dashboard pages (/today, /week, /month, /quarter, /settings).
 * Provides:
 * - Sidebar navigation with active state
 * - Mobile bottom navigation
 * - Auth protection (middleware handles this)
 *
 * iOS Comparison: Like a TabView or NavigationSplitView
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarNav, MobileNav } from '@/components/dashboard/sidebar-nav'

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
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  )
}
