/**
 * Health Data Import API Endpoint
 *
 * POST /api/health-import
 *
 * Receives health data from external sources (Health Auto Export app).
 * Validates API key, parses payload, and stores data in appropriate tables.
 *
 * Supports:
 * - Weight data
 * - Steps data
 * - Sleep data
 * - Nutrition data
 *
 * iOS Comparison: Like a REST API route handler in Vapor or Kitura
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiKey } from '@/lib/auth/api-key'
import { healthImportSchema, type HealthImportPayload } from '@/lib/validations/health-import'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate the payload structure
    const validation = healthImportSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid payload',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const payload = validation.data

    // Verify API key and get user_id
    const userId = await verifyApiKey(payload.api_key)

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    // Process based on data type
    let result
    let tableName: string

    switch (payload.type) {
      case 'weight': {
        tableName = 'weight_logs'
        const { error } = await supabase.from('weight_logs').upsert(
          {
            user_id: userId,
            date: payload.date,
            weight: payload.value,
            source: 'apple_health',
          },
          {
            onConflict: 'user_id,date',
          }
        )
        result = { error }
        break
      }

      case 'steps': {
        tableName = 'steps_logs'
        const { error } = await supabase.from('steps_logs').upsert(
          {
            user_id: userId,
            date: payload.date,
            steps: payload.value,
            source: 'apple_health',
          },
          {
            onConflict: 'user_id,date',
          }
        )
        result = { error }
        break
      }

      case 'sleep': {
        tableName = 'sleep_logs'
        const { error } = await supabase.from('sleep_logs').upsert(
          {
            user_id: userId,
            date: payload.date,
            hours: payload.value,
            source: 'apple_health',
          },
          {
            onConflict: 'user_id,date',
          }
        )
        result = { error }
        break
      }

      case 'nutrition': {
        tableName = 'nutrition_logs'
        const { error } = await supabase.from('nutrition_logs').upsert(
          {
            user_id: userId,
            date: payload.date,
            calories: payload.calories ?? null,
            protein: payload.protein ?? null,
            carbs: payload.carbs ?? null,
            fat: payload.fat ?? null,
            source: 'apple_health',
          },
          {
            onConflict: 'user_id,date',
          }
        )
        result = { error }
        break
      }

      default: {
        return NextResponse.json(
          { error: 'Unsupported data type' },
          { status: 400 }
        )
      }
    }

    // Check for database errors
    if (result.error) {
      console.error(`Error inserting ${payload.type} data:`, result.error)
      return NextResponse.json(
        { error: 'Failed to save data', details: result.error.message },
        { status: 500 }
      )
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: `${payload.type} data saved successfully`,
      table: tableName,
      date: payload.date,
    })
  } catch (error) {
    console.error('Unexpected error in health-import:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to import health data.' },
    { status: 405 }
  )
}
