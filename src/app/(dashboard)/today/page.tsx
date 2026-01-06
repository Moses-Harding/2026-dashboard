/**
 * Today Dashboard Page
 *
 * The main dashboard view showing:
 * - Current weight and trend
 * - Today's nutrition progress
 * - Workout status
 * - Habit checklist
 *
 * This is a placeholder - we'll add the real components next.
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get today's date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="text-muted-foreground">{today}</p>
      </div>

      {/* Stats Grid - Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Weight</CardDescription>
            <CardTitle className="text-3xl">-- lbs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No data yet. Add your first weight below.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Calories Today</CardDescription>
            <CardTitle className="text-3xl">-- / 1,800</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Syncs from Apple Health
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Workout</CardDescription>
            <CardTitle className="text-3xl">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chest & Triceps day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weight Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">
            Chart will appear here after adding weight data
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <p className="text-sm text-muted-foreground">
            Weight entry form and habit checklist coming next...
          </p>
        </CardContent>
      </Card>

      {/* Debug info */}
      <div className="text-xs text-muted-foreground">
        Logged in as: {user?.email}
      </div>
    </div>
  )
}
