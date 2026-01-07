/**
 * Weekly Review Form
 *
 * Form for submitting weekly reflections.
 * Auto-populates with calculated stats from the week.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface WeeklyReviewFormProps {
  weekStartDate: string
  initialData: {
    weight_avg: number | null
    workouts_completed: number
    workouts_target: number
    habits_completed: number
    habits_total: number
    went_well: string
    needs_adjustment: string
  }
  existingReviewId?: string
}

export function WeeklyReviewForm({
  weekStartDate,
  initialData,
  existingReviewId,
}: WeeklyReviewFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [wentWell, setWentWell] = useState(initialData.went_well)
  const [needsAdjustment, setNeedsAdjustment] = useState(initialData.needs_adjustment)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week_start_date: weekStartDate,
          weight_avg: initialData.weight_avg,
          workouts_completed: initialData.workouts_completed,
          workouts_target: initialData.workouts_target,
          habits_completed: initialData.habits_completed,
          habits_total: initialData.habits_total,
          went_well: wentWell,
          needs_adjustment: needsAdjustment,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to save review')
        return
      }

      toast.success(existingReviewId ? 'Review updated!' : 'Review saved!')
      router.refresh()
    } catch (error) {
      console.error('Error saving review:', error)
      toast.error('Failed to save review')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* What went well */}
      <div className="space-y-2">
        <Label htmlFor="went_well">What went well this week?</Label>
        <textarea
          id="went_well"
          value={wentWell}
          onChange={(e) => setWentWell(e.target.value)}
          placeholder="Reflect on your wins and successes..."
          className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* What needs adjustment */}
      <div className="space-y-2">
        <Label htmlFor="needs_adjustment">What needs adjustment next week?</Label>
        <textarea
          id="needs_adjustment"
          value={needsAdjustment}
          onChange={(e) => setNeedsAdjustment(e.target.value)}
          placeholder="What will you do differently? Any changes to make?"
          className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : existingReviewId ? 'Update Review' : 'Save Review'}
      </Button>
    </form>
  )
}
