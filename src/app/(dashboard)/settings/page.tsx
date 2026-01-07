/**
 * Settings Page
 *
 * Manages user settings including API keys for health data import.
 */

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiKeyManager } from '@/components/settings/api-key-manager'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null // Middleware will redirect
  }

  // Fetch user's API keys (without the actual key values)
  const { data: apiKeys, error } = await supabase
    .from('api_keys')
    .select('id, name, created_at, last_used_at, is_active')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching API keys:', error)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and data import settings</p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">User ID</p>
              <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage API keys for automated health data import via iOS Shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeyManager apiKeys={apiKeys ?? []} userId={user.id} />
        </CardContent>
      </Card>

      {/* Import Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup iOS Shortcuts</CardTitle>
          <CardDescription>Free automated health data sync using iOS Shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 text-sm">
            {/* API Endpoint Info */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium mb-1">API Endpoint</p>
              <code className="text-xs break-all">
                {process.env.NEXT_PUBLIC_APP_URL || 'https://2026-dashboard.vercel.app'}/api/shortcuts/sync
              </code>
            </div>

            <div>
              <p className="font-medium mb-2">Step 1: Generate API Key</p>
              <p className="text-muted-foreground">
                Click &quot;Generate New Key&quot; above and copy the API key (shown only once). Save it somewhere safe.
              </p>
            </div>

            <div>
              <p className="font-medium mb-2">Step 2: Create the Shortcut</p>
              <p className="text-muted-foreground mb-3">
                Open the Shortcuts app on your iPhone and create a new shortcut with these actions:
              </p>

              <div className="space-y-3 ml-2">
                <div className="p-3 border rounded-lg">
                  <p className="font-medium text-xs text-muted-foreground mb-1">ACTION 1</p>
                  <p className="font-medium">Find Health Samples</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Type: Weight, Sort by: Start Date, Order: Latest First, Limit: 1
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="font-medium text-xs text-muted-foreground mb-1">ACTION 2</p>
                  <p className="font-medium">Set Variable</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Name: &quot;weight&quot;, Value: Health Sample.Value
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="font-medium text-xs text-muted-foreground mb-1">ACTION 3</p>
                  <p className="font-medium">Find Health Samples</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Type: Steps, Start Date: Today, Sort by: Start Date
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="font-medium text-xs text-muted-foreground mb-1">ACTION 4</p>
                  <p className="font-medium">Set Variable</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Name: &quot;steps&quot;, Value: Sum of Health Samples
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="font-medium text-xs text-muted-foreground mb-1">ACTION 5</p>
                  <p className="font-medium">Dictionary</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Add items: weight = (weight variable), steps = (steps variable)
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <p className="font-medium text-xs text-muted-foreground mb-1">ACTION 6</p>
                  <p className="font-medium">Get Contents of URL</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    URL: {process.env.NEXT_PUBLIC_APP_URL || 'https://2026-dashboard.vercel.app'}/api/shortcuts/sync<br />
                    Method: POST<br />
                    Headers: Authorization = Bearer YOUR_API_KEY<br />
                    Request Body: JSON (use the Dictionary from step 5)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">Step 3: Test the Shortcut</p>
              <p className="text-muted-foreground">
                Run the shortcut manually to verify it works. You should see your data appear on the Today dashboard.
              </p>
            </div>

            <div>
              <p className="font-medium mb-2">Step 4: Automate (Optional)</p>
              <p className="text-muted-foreground">
                Go to Shortcuts &gt; Automation &gt; New Automation &gt; Time of Day. Set it to run each morning, then select your shortcut.
              </p>
            </div>

            {/* Workout Sync */}
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="font-medium text-green-600 dark:text-green-400 mb-2">Workout Sync</p>
              <p className="text-xs text-muted-foreground mb-2">
                You can also sync workouts from Apple Health! Add these actions to your shortcut:
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p><strong>Find Health Samples:</strong> Type: Workouts, Start Date: Today, Limit: 1</p>
                <p><strong>Set Variables:</strong></p>
                <ul className="ml-3 space-y-1">
                  <li>• workout_type = Health Sample.Workout Activity Type</li>
                  <li>• workout_duration = Health Sample.Duration (in minutes)</li>
                  <li>• workout_calories = Health Sample.Active Energy Burned</li>
                </ul>
                <p className="mt-2">
                  <strong>How it maps:</strong> Strength training uses your scheduled type (Mon=Chest, Wed=Shoulders, Fri=Volume).
                  Elliptical/Running/Cycling → Cardio. Walking/Yoga → Active Rest.
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">Tips</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• You can add sleep data by adding another &quot;Find Health Samples&quot; for Sleep Analysis</li>
                <li>• For nutrition, add searches for Dietary Energy, Protein, Carbohydrates, Total Fat</li>
                <li>• The API accepts: weight, steps, sleep, calories, protein, carbs, fat, workout_type, workout_duration, workout_calories</li>
                <li>• Date defaults to today if not specified</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
