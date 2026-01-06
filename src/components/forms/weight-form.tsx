/**
 * Weight Entry Form
 *
 * Simple form to log today's weight.
 * Uses optimistic updates for instant feedback.
 *
 * iOS Comparison: Like a simple Form with TextField and Button
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface WeightFormProps {
  userId: string
  todayWeight?: number | null
}

export function WeightForm({ userId, todayWeight }: WeightFormProps) {
  const router = useRouter()
  const [weight, setWeight] = useState(todayWeight?.toString() ?? '')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const weightValue = parseFloat(weight)
    if (isNaN(weightValue) || weightValue < 50 || weightValue > 500) {
      toast.error('Please enter a valid weight between 50-500 lbs')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'

      // Upsert: Insert or update if exists for today
      const { error } = await supabase
        .from('weight_logs')
        .upsert(
          {
            user_id: userId,
            date: today,
            weight: weightValue,
            source: 'manual',
          },
          {
            onConflict: 'user_id,date',
          }
        )

      if (error) {
        console.error('Error saving weight:', error)
        toast.error('Failed to save weight. Please try again.')
        return
      }

      toast.success(todayWeight ? 'Weight updated!' : 'Weight logged!')
      router.refresh() // Refresh server components to show new data
    } catch (err) {
      console.error('Error:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <Label htmlFor="weight" className="sr-only">
          Weight (lbs)
        </Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          min="50"
          max="500"
          placeholder="Enter weight (lbs)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          disabled={isLoading}
          className="text-lg"
        />
      </div>
      <Button type="submit" disabled={isLoading || !weight}>
        {isLoading ? 'Saving...' : todayWeight ? 'Update' : 'Log Weight'}
      </Button>
    </form>
  )
}
