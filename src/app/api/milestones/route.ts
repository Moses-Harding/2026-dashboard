/**
 * Milestones API
 *
 * GET: Fetch user's milestones for a year
 * POST: Seed 2026 fitness plan milestones
 * PATCH: Update milestone targets
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EXERCISES } from '@/lib/constants/workouts'

// 2026 Fitness Plan - Monthly Weight Targets
const MONTHLY_WEIGHT_TARGETS: Record<number, number> = {
  1: 218, 2: 216, 3: 214, 4: 212, 5: 210, 6: 208,
  7: 206, 8: 204, 9: 202, 10: 200, 11: 197, 12: 195,
}

// Calculate monthly lifting targets (linear progression to 2026 goal)
function getMonthlyLiftingTargets(month: number): Record<string, number> {
  const targets: Record<string, number> = {}

  Object.entries(EXERCISES).forEach(([id, exercise]) => {
    if (exercise.targetWeight2026 && exercise.startWeight) {
      // Linear progression from start to target over 12 months
      const monthlyIncrease = (exercise.targetWeight2026 - exercise.startWeight) / 12
      targets[id] = Math.round(exercise.startWeight + (monthlyIncrease * month))
    }
  })

  return targets
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') ?? '2026')

    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', year)
      .order('month', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ milestones })
  } catch (error) {
    console.error('Error fetching milestones:', error)
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
    const year = body.year ?? 2026

    // Check if milestones already exist for this year
    const { data: existing } = await supabase
      .from('milestones')
      .select('id')
      .eq('user_id', user.id)
      .eq('year', year)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Milestones already exist for this year. Use PATCH to update.' },
        { status: 409 }
      )
    }

    // Create milestones for all 12 months
    const milestones = []
    for (let month = 1; month <= 12; month++) {
      milestones.push({
        user_id: user.id,
        month,
        year,
        target_weight: MONTHLY_WEIGHT_TARGETS[month],
        target_lifts: getMonthlyLiftingTargets(month),
        achieved_weight: false,
        achieved_lifts: {},
      })
    }

    const { data, error } = await supabase
      .from('milestones')
      .insert(milestones)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ milestones: data, message: 'Milestones seeded successfully' })
  } catch (error) {
    console.error('Error seeding milestones:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { month, year = 2026, target_weight, target_lifts, achieved_weight, achieved_lifts } = body

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (target_weight !== undefined) updateData.target_weight = target_weight
    if (target_lifts !== undefined) updateData.target_lifts = target_lifts
    if (achieved_weight !== undefined) updateData.achieved_weight = achieved_weight
    if (achieved_lifts !== undefined) updateData.achieved_lifts = achieved_lifts

    const { data, error } = await supabase
      .from('milestones')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ milestone: data })
  } catch (error) {
    console.error('Error updating milestone:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
