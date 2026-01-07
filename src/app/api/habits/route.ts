/**
 * Habits API Endpoint
 *
 * POST /api/habits - Update habit log for a specific date
 * GET /api/habits - Get habit logs for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for updating habits
const updateHabitsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  meditation: z.boolean().optional(),
  journal: z.boolean().optional(),
  creatine: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updateHabitsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { date, ...habits } = validation.data

    // Upsert the habit log
    const { data: habitLog, error } = await supabase
      .from('habit_logs')
      .upsert(
        {
          user_id: user.id,
          date,
          ...habits,
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error updating habits:', error)
      return NextResponse.json(
        { error: 'Failed to update habits', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      habitLog,
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/habits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Query params schema
const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const params = querySchema.safeParse({
      days: searchParams.get('days'),
    })

    if (!params.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: params.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { days } = params.data

    // Calculate start date
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    // Fetch habit logs
    const { data: habitLogs, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateStr)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching habits:', error)
      return NextResponse.json(
        { error: 'Failed to fetch habits', details: error.message },
        { status: 500 }
      )
    }

    // Calculate current streak
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Sort by date descending to check streak from today backwards
    const sortedLogs = [...(habitLogs || [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const checkDateStr = checkDate.toISOString().split('T')[0]

      const log = sortedLogs.find((l) => l.date === checkDateStr)

      // Count as streak day if at least meditation OR journal was done
      if (log && (log.meditation || log.journal)) {
        streak++
      } else if (i === 0) {
        // Today hasn't been logged yet, that's ok
        continue
      } else {
        // Streak broken
        break
      }
    }

    return NextResponse.json({
      habitLogs,
      streak,
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/habits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
