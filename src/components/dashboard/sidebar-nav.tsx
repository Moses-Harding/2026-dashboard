/**
 * Sidebar Navigation Component
 *
 * Client component that handles active state for navigation items.
 * Used in the dashboard layout for both desktop sidebar and mobile bottom nav.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { href: '/today', label: 'Today', icon: '📊' },
  { href: '/week', label: 'Week', icon: '📈' },
  { href: '/month', label: 'Month', icon: '📅' },
  { href: '/quarter', label: 'Quarter', icon: '🎯' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 p-4">
      <ul className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  // Only show main nav items on mobile (not settings)
  const mobileItems = navItems.filter((item) => item.href !== '/settings')

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card z-50">
      <ul className="flex h-full">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center h-full gap-1 text-xs transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
