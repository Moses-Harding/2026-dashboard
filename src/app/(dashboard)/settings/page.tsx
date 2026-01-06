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
            Manage API keys for automated health data import from Health Auto Export app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeyManager apiKeys={apiKeys ?? []} userId={user.id} />
        </CardContent>
      </Card>

      {/* Import Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Health Auto Export</CardTitle>
          <CardDescription>How to configure automated data import</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-2">Step 1: Install Health Auto Export</p>
              <p className="text-muted-foreground">
                Download Health Auto Export from the App Store on your iPhone
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">Step 2: Generate API Key</p>
              <p className="text-muted-foreground">
                Click "Generate New Key" above and copy the API key (shown only once)
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">Step 3: Configure Health Auto Export</p>
              <p className="text-muted-foreground mb-2">In the Health Auto Export app:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>
                  Set Endpoint URL to: <code className="bg-muted px-1 py-0.5 rounded text-xs">
                    {process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}/api/health-import
                  </code>
                </li>
                <li>Add your API key to the request headers</li>
                <li>Select data types to export: Weight, Steps, Sleep, Nutrition</li>
                <li>Set export frequency (recommended: hourly or daily)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Step 4: Test the Connection</p>
              <p className="text-muted-foreground">
                Trigger a manual export in Health Auto Export to verify data appears in your dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
