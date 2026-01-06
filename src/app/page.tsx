/**
 * Home Page
 *
 * This is the landing page at '/'.
 * Eventually this will redirect to /login or /today based on auth state.
 * For now, it's a simple welcome page to verify our setup.
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
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
