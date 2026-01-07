/**
 * Milestone Seed Component
 *
 * Button to seed the 2026 fitness plan milestones.
 * Shows only when milestones haven't been created yet.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MilestoneSeedProps {
  year?: number
}

export function MilestoneSeed({ year = 2026 }: MilestoneSeedProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSeed() {
    setIsLoading(true)

    try {
      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          toast.info('Milestones already exist for this year')
        } else {
          toast.error(data.error || 'Failed to seed milestones')
        }
        return
      }

      toast.success('2026 Fitness Plan milestones created!')
      router.refresh()
    } catch (error) {
      console.error('Error seeding milestones:', error)
      toast.error('Failed to create milestones')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Set Up Your {year} Plan</CardTitle>
        <CardDescription>
          Initialize your monthly weight and lifting targets based on your fitness goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Your {year} plan includes:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Monthly weight targets (220 → 195 lbs)</li>
              <li>Progressive lifting goals for each exercise</li>
              <li>Achievement tracking and celebrations</li>
            </ul>
          </div>
          <Button onClick={handleSeed} disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : `Initialize ${year} Plan`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
