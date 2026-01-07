/**
 * iOS Shortcuts Sync Endpoint
 *
 * POST /api/shortcuts/sync
 *
 * A simplified endpoint designed for iOS Shortcuts.
 * Accepts all health data types in a single request.
 *
 * Usage from Shortcuts:
 * 1. Get health samples (weight, steps, sleep)
 * 2. POST to this endpoint with Authorization header
 *
 * Example payload:
 * {
 *   "weight": 215.5,
 *   "steps": 8500,
 *   "sleep": 7.5,
 *   "calories": 1800,
 *   "protein": 150,
 *   "date": "2026-01-06"  // optional, defaults to today
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyApiKey } from '@/lib/auth/api-key'
import { z } from 'zod'

// Simple schema for Shortcuts - all fields optional except at least one data point
const shortcutsSyncSchema = z.object({
  weight: z.number().min(50).max(500).optional(),
  steps: z.number().int().min(0).max(200000).optional(),
  sleep: z.number().min(0).max(24).optional(),
  calories: z.number().int().min(0).max(20000).optional(),
  protein: z.number().min(0).max(1000).optional(),
  carbs: z.number().min(0).max(2000).optional(),
  fat: z.number().min(0).max(1000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine(
  (data) => data.weight || data.steps || data.sleep || data.calories || data.protein,
  { message: 'At least one health metric is required' }
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
      date: '2026-01-06',
    },
    note: 'All fields optional except at least one metric. Date defaults to today.',
  })
}
