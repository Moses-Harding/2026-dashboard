/**
 * Workouts API Endpoint
 *
 * POST /api/workouts - Create a new workout with exercise sets
 * GET /api/workouts - Get workouts for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for exercise set
const exerciseSetSchema = z.object({
  exercise_name: z.string().min(1),
  set_number: z.number().int().min(1).max(10),
  reps: z.number().int().min(0).max(100).optional(),
  weight: z.number().min(0).max(1000).optional(),
})

// Schema for creating a workout
const createWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  workout_type: z.enum(['chest_triceps', 'shoulders_biceps', 'volume', 'cardio', 'active_rest']),
  completed: z.boolean().optional().default(true),
  duration_minutes: z.number().int().min(0).max(300).optional(),
  notes: z.string().optional(),
  exercises: z.array(exerciseSetSchema).optional().default([]),
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
    const validation = createWorkoutSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { date, workout_type, completed, duration_minutes, notes, exercises } = validation.data

    // Create the workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .upsert(
        {
          user_id: user.id,
          date,
          workout_type,
          completed,
          duration_minutes,
          notes,
        },
        { onConflict: 'user_id,date,workout_type' }
      )
      .select()
      .single()

    if (workoutError) {
      console.error('Error creating workout:', workoutError)
      return NextResponse.json(
        { error: 'Failed to create workout', details: workoutError.message },
        { status: 500 }
      )
    }

    // If exercises provided, insert them
    if (exercises.length > 0) {
      // Delete existing sets for this workout first (for upsert behavior)
      await supabase.from('exercise_sets').delete().eq('workout_id', workout.id)

      // Insert new exercise sets
      const exerciseSets = exercises.map((ex) => ({
        workout_id: workout.id,
        exercise_name: ex.exercise_name,
        set_number: ex.set_number,
        reps: ex.reps,
        weight: ex.weight,
      }))

      const { error: setsError } = await supabase.from('exercise_sets').insert(exerciseSets)

      if (setsError) {
        console.error('Error inserting exercise sets:', setsError)
        return NextResponse.json(
          { error: 'Workout created but failed to save exercises', details: setsError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      workout,
      exerciseCount: exercises.length,
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/workouts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Query params schema
const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
  type: z.enum(['chest_triceps', 'shoulders_biceps', 'volume', 'cardio', 'active_rest']).optional(),
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
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      type: searchParams.get('type'),
    })

    if (!params.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: params.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { limit, offset, type } = params.data

    // Build query
    let query = supabase
      .from('workouts')
      .select('*, exercise_sets(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) {
      query = query.eq('workout_type', type)
    }

    const { data: workouts, error } = await query

    if (error) {
      console.error('Error fetching workouts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch workouts', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ workouts })
  } catch (error) {
    console.error('Unexpected error in GET /api/workouts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
