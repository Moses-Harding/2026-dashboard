/**
 * Home Page
 *
 * Landing page that redirects based on auth state:
 * - Authenticated users → /today
 * - Unauthenticated users → Show welcome page with login/signup
 *
 * This is a Server Component (no 'use client'), so we can check auth on the server.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function HomePage() {
  // Check auth state on server
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to dashboard
  if (user) {
    redirect('/today')
  }

  // Show welcome page for unauthenticated users
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">2026 Dashboard</CardTitle>
          <CardDescription>
            Track your fitness journey with automated data import and progress visualization
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/signup">Create Account</Link>
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-4">
            220 lbs → 195 lbs | See the big picture
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
