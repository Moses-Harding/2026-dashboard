/**
 * iOS Shortcuts Sync Endpoint
 *
 * POST /api/shortcuts/sync
 *
 * A simplified endpoint designed for iOS Shortcuts.
 * Accepts all health data types in a single request.
 *
 * Usage from Shortcuts:
 * 1. Get health samples (weight, steps, sleep, workouts)
 * 2. POST to this endpoint with Authorization header
 *
 * Example payload:
 * {
 *   "weight": 215.5,
 *   "steps": 8500,
 *   "sleep": 7.5,
 *   "calories": 1800,
 *   "protein": 150,
 *   "workout_type": "Traditional Strength Training",
 *   "workout_duration": 45,
 *   "workout_calories": 350,
 *   "date": "2026-01-06"  // optional, defaults to today
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyApiKey } from '@/lib/auth/api-key'
import { z } from 'zod'
import type { WorkoutType } from '@/types/database'
import { WEEKLY_SCHEDULE } from '@/lib/constants/workouts'

// ============================================
// APPLE HEALTH WORKOUT TYPE MAPPING
// ============================================

// Map Apple Health workout types to app workout types
// null means "use scheduled workout type for strength training"
const APPLE_HEALTH_WORKOUT_MAP: Record<string, WorkoutType | null> = {
  // Strength training - use scheduled type
  'Traditional Strength Training': null,
  'Functional Strength Training': null,
  'High Intensity Interval Training': null,
  'Core Training': null,

  // Cardio
  'Elliptical': 'cardio',
  'Running': 'cardio',
  'Cycling': 'cardio',
  'Indoor Cycling': 'cardio',
  'Rowing': 'cardio',
  'Stair Climbing': 'cardio',
  'Jump Rope': 'cardio',
  'Swimming': 'cardio',
  'Dance': 'cardio',

  // Active rest / light activity
  'Walking': 'active_rest',
  'Hiking': 'active_rest',
  'Yoga': 'active_rest',
  'Pilates': 'active_rest',
  'Stretching': 'active_rest',
  'Flexibility': 'active_rest',
  'Cooldown': 'active_rest',
}

/**
 * Maps Apple Health workout type to app workout type
 * For strength training, uses the scheduled workout for that day
 */
function mapAppleHealthWorkout(appleHealthType: string, date: string): WorkoutType {
  const mappedType = APPLE_HEALTH_WORKOUT_MAP[appleHealthType]

  // If we have a direct mapping, use it
  if (mappedType !== null && mappedType !== undefined) {
    return mappedType
  }

  // For strength training (null mapping), use scheduled workout type
  const dateObj = new Date(date + 'T12:00:00') // Use noon to avoid timezone issues
  const dayOfWeek = dateObj.getDay()
  const scheduledType = WEEKLY_SCHEDULE[dayOfWeek]

  // If scheduled type is 'rest', default to 'volume'
  if (scheduledType === 'rest') {
    return 'volume'
  }

  return scheduledType
}

// Simple schema for Shortcuts - all fields optional except at least one data point
const shortcutsSyncSchema = z.object({
  weight: z.number().min(50).max(500).optional(),
  steps: z.number().int().min(0).max(200000).optional(),
  sleep: z.number().min(0).max(24).optional(),
  calories: z.number().int().min(0).max(20000).optional(),
  protein: z.number().min(0).max(1000).optional(),
  carbs: z.number().min(0).max(2000).optional(),
  fat: z.number().min(0).max(1000).optional(),
  // Workout fields from Apple Health
  workout_type: z.string().optional(),  // Apple Health workout type string
  workout_duration: z.number().min(0).max(600).optional(),  // minutes (up to 10 hours)
  workout_calories: z.number().min(0).max(10000).optional(), // active calories
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine(
  (data) => data.weight || data.steps || data.sleep || data.calories || data.protein || data.workout_type,
  { message: 'At least one health metric or workout is required' }
)

export async function POST(request: NextRequest) {
  try {
    // Get API key from Authorization header (Bearer token)
    const authHeader = request.headers.get('Authorization')
    let apiKey: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      apiKey = authHeader.slice(7)
    }

    // Also check body for api_key (fallback)
    const body = await request.json()

    if (!apiKey && body.api_key) {
      apiKey = body.api_key
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key. Use Authorization: Bearer <key> header.' },
        { status: 401 }
      )
    }

    // Verify API key
    const userId = await verifyApiKey(apiKey)

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Validate payload
    const validation = shortcutsSyncSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid data',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = validation.data
    const date = data.date || new Date().toISOString().split('T')[0]

    // Create Supabase service client (bypasses RLS since we verified via API key)
    const supabase = createServiceClient()

    const results: { saved: string[]; errors: string[] } = {
      saved: [],
      errors: [],
    }

    // Save weight
    if (data.weight !== undefined) {
      const { error } = await supabase.from('weight_logs').upsert(
        {
          user_id: userId,
          date,
          weight: data.weight,
          source: 'apple_health',
        },
        { onConflict: 'user_id,date' }
      )
      if (error) {
        results.errors.push(`weight: ${error.message}`)
      } else {
        results.saved.push('weight')
      }
    }

    // Save steps
    if (data.steps !== undefined) {
      const { error } = await supabase.from('steps_logs').upsert(
        {
          user_id: userId,
          date,
          steps: data.steps,
          source: 'apple_health',
        },
        { onConflict: 'user_id,date' }
      )
      if (error) {
        results.errors.push(`steps: ${error.message}`)
      } else {
        results.saved.push('steps')
      }
    }

    // Save sleep
    if (data.sleep !== undefined) {
      const { error } = await supabase.from('sleep_logs').upsert(
        {
          user_id: userId,
          date,
          hours: data.sleep,
          source: 'apple_health',
        },
        { onConflict: 'user_id,date' }
      )
      if (error) {
        results.errors.push(`sleep: ${error.message}`)
      } else {
        results.saved.push('sleep')
      }
    }

    // Save nutrition (if any nutrition data provided)
    if (data.calories !== undefined || data.protein !== undefined || data.carbs !== undefined || data.fat !== undefined) {
      const { error } = await supabase.from('nutrition_logs').upsert(
        {
          user_id: userId,
          date,
          calories: data.calories ?? null,
          protein: data.protein ?? null,
          carbs: data.carbs ?? null,
          fat: data.fat ?? null,
          source: 'apple_health',
        },
        { onConflict: 'user_id,date' }
      )
      if (error) {
        results.errors.push(`nutrition: ${error.message}`)
      } else {
        results.saved.push('nutrition')
      }
    }

    // Save workout (if workout type provided from Apple Health)
    if (data.workout_type !== undefined) {
      // Map Apple Health workout type to app workout type
      const appWorkoutType = mapAppleHealthWorkout(data.workout_type, date)

      // Build notes with Apple Health info
      const noteParts: string[] = [`Apple Health: ${data.workout_type}`]
      if (data.workout_calories) {
        noteParts.push(`${data.workout_calories} kcal`)
      }

      const { error } = await supabase.from('workouts').upsert(
        {
          user_id: userId,
          date,
          workout_type: appWorkoutType,
          completed: true,
          duration_minutes: data.workout_duration ?? null,
          notes: noteParts.join(' • '),
        },
        { onConflict: 'user_id,date,workout_type' }
      )
      if (error) {
        results.errors.push(`workout: ${error.message}`)
      } else {
        results.saved.push(`workout (${appWorkoutType})`)
      }
    }

    // Return results
    const success = results.errors.length === 0

    return NextResponse.json({
      success,
      date,
      saved: results.saved,
      errors: results.errors.length > 0 ? results.errors : undefined,
      message: success
        ? `Synced ${results.saved.join(', ')} for ${date}`
        : `Partial sync: ${results.saved.join(', ')}`,
    })
  } catch (error) {
    console.error('Shortcuts sync error:', error)
    return NextResponse.json(
      { error: 'Server error. Check your JSON format.' },
      { status: 500 }
    )
  }
}

// Return helpful info for GET requests
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/shortcuts/sync',
    method: 'POST',
    auth: 'Authorization: Bearer <your-api-key>',
    example: {
      weight: 215.5,
      steps: 8500,
      sleep: 7.5,
      calories: 1800,
      protein: 150,
      workout_type: 'Traditional Strength Training',
      workout_duration: 45,
      workout_calories: 350,
      date: '2026-01-06',
    },
    note: 'All fields optional except at least one metric or workout. Date defaults to today.',
    workout_types: 'Strength training uses scheduled type (Mon=Chest, Wed=Shoulders, Fri=Volume). Cardio/walking map directly.',
  })
}
