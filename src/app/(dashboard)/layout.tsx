/**
 * Dashboard Layout
 *
 * Wraps all dashboard pages (/today, /week, /month, /quarter, /review).
 * Provides:
 * - Sidebar navigation (placeholder for now)
 * - Auth protection (middleware handles this)
 * - Common header/footer
 *
 * iOS Comparison: Like a TabView or NavigationSplitView
 */

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Sidebar navigation items
const navItems = [
  { href: '/today', label: 'Today', icon: '📊' },
  { href: '/week', label: 'Week', icon: '📈' },
  { href: '/month', label: 'Month', icon: '📅' },
  { href: '/quarter', label: 'Quarter', icon: '🎯' },
  { href: '/review', label: 'Review', icon: '📝' },
]

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
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        {/* Logo/Title */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold">2026 Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            220 → 195 lbs
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

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

      {/* Mobile header (shown on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-border bg-card flex items-center px-4 z-50">
        <h1 className="text-lg font-bold">2026 Dashboard</h1>
      </div>

      {/* Main content */}
      <main className="flex-1 md:p-8 p-4 pt-18 md:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
