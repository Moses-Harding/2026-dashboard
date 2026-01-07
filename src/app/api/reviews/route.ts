/**
 * Weekly Reviews API
 *
 * GET: Fetch weekly reviews
 * POST: Create/update a weekly review
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeekStart, formatDateISO } from '@/lib/utils/dates'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekStartDate = searchParams.get('week_start_date')
    const limit = parseInt(searchParams.get('limit') ?? '10')

    let query = supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start_date', { ascending: false })

    if (weekStartDate) {
      query = query.eq('week_start_date', weekStartDate)
    } else {
      query = query.limit(limit)
    }

    const { data: reviews, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      week_start_date,
      weight_avg,
      workouts_completed,
      workouts_target = 5,
      habits_completed,
      habits_total,
      went_well,
      needs_adjustment,
    } = body

    // Default to current week if not specified
    const weekStart = week_start_date ?? formatDateISO(getWeekStart(new Date()))

    const { data, error } = await supabase
      .from('weekly_reviews')
      .upsert({
        user_id: user.id,
        week_start_date: weekStart,
        weight_avg,
        workouts_completed,
        workouts_target,
        habits_completed,
        habits_total,
        went_well,
        needs_adjustment,
      }, {
        onConflict: 'user_id,week_start_date',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ review: data })
  } catch (error) {
    console.error('Error saving review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
