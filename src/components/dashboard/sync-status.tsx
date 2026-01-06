/**
 * Sync Status Component
 *
 * Shows the last time health data was synced from external sources.
 * Indicates whether data is up-to-date or needs attention.
 */

import { createClient } from '@/lib/supabase/server'

interface SyncStatusProps {
  userId: string
}

export async function SyncStatus({ userId }: SyncStatusProps) {
  const supabase = await createClient()

  // Get the most recent auto-imported data across all types
  const today = new Date().toISOString().split('T')[0]

  // Check weight logs
  const { data: recentWeight } = await supabase
    .from('weight_logs')
    .select('created_at')
    .eq('user_id', userId)
    .eq('source', 'apple_health')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Check steps logs
  const { data: recentSteps } = await supabase
    .from('steps_logs')
    .select('created_at')
    .eq('user_id', userId)
    .eq('source', 'apple_health')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Check sleep logs
  const { data: recentSleep } = await supabase
    .from('sleep_logs')
    .select('created_at')
    .eq('user_id', userId)
    .eq('source', 'apple_health')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Check nutrition logs
  const { data: recentNutrition } = await supabase
    .from('nutrition_logs')
    .select('created_at')
    .eq('user_id', userId)
    .eq('source', 'apple_health')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Find the most recent sync time
  const syncTimes = [
    recentWeight?.created_at,
    recentSteps?.created_at,
    recentSleep?.created_at,
    recentNutrition?.created_at,
  ].filter(Boolean) as string[]

  if (syncTimes.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-gray-500" />
        <span>No auto-imported data yet</span>
      </div>
    )
  }

  // Get the most recent timestamp
  const mostRecentSync = new Date(
    Math.max(...syncTimes.map((time) => new Date(time).getTime()))
  )

  // Calculate time since last sync
  const now = new Date()
  const hoursSinceSync = (now.getTime() - mostRecentSync.getTime()) / (1000 * 60 * 60)

  // Determine status
  let status: 'success' | 'warning' | 'error'
  let statusText: string

  if (hoursSinceSync < 24) {
    status = 'success'
    statusText = 'Synced recently'
  } else if (hoursSinceSync < 48) {
    status = 'warning'
    statusText = 'Sync may be delayed'
  } else {
    status = 'error'
    statusText = 'Sync offline'
  }

  // Format the last sync time
  const lastSyncFormatted = mostRecentSync.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const statusColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
      <span>
        {statusText} • Last: {lastSyncFormatted}
      </span>
    </div>
  )
}
