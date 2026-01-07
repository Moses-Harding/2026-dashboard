/**
 * Refresh Button Component
 *
 * Triggers a data refresh for the dashboard.
 */

'use client'

import { useDashboard } from '@/components/providers/dashboard-provider'

export function RefreshButton() {
  const { isRefreshing, refresh } = useDashboard()

  return (
    <button
      onClick={refresh}
      disabled={isRefreshing}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      title="Refresh data"
    >
      <span className={isRefreshing ? 'animate-spin inline-block' : ''}>
        {isRefreshing ? '⟳' : '↻'}
      </span>
      <span className="ml-1">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
    </button>
  )
}
