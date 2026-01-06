/**
 * Batch Health Data Import API Endpoint
 *
 * POST /api/health-import/batch
 *
 * Imports multiple health records at once for efficiency.
 * Useful for initial sync or importing historical data.
 *
 * Max 100 records per batch to prevent timeouts.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyApiKey } from '@/lib/auth/api-key'
import { batchHealthImportSchema } from '@/lib/validations/health-import'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate the payload structure
    const validation = batchHealthImportSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid payload',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { records, api_key } = validation.data

    // Verify API key and get user_id
    const userId = await verifyApiKey(api_key)

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    // Group records by type
    const weightRecords = records.filter((r) => r.type === 'weight')
    const stepsRecords = records.filter((r) => r.type === 'steps')
    const sleepRecords = records.filter((r) => r.type === 'sleep')
    const nutritionRecords = records.filter((r) => r.type === 'nutrition')

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { type: string; date: string; error: string }[],
    }

    // Batch insert weight data
    if (weightRecords.length > 0) {
      const { error } = await supabase.from('weight_logs').upsert(
        weightRecords.map((r) => ({
          user_id: userId,
          date: r.date,
          weight: r.value,
          source: 'apple_health',
        })),
        { onConflict: 'user_id,date' }
      )

      if (error) {
        results.failed += weightRecords.length
        results.errors.push({ type: 'weight', date: 'batch', error: error.message })
      } else {
        results.success += weightRecords.length
      }
    }

    // Batch insert steps data
    if (stepsRecords.length > 0) {
      const { error } = await supabase.from('steps_logs').upsert(
        stepsRecords.map((r) => ({
          user_id: userId,
          date: r.date,
          steps: r.value,
          source: 'apple_health',
        })),
        { onConflict: 'user_id,date' }
      )

      if (error) {
        results.failed += stepsRecords.length
        results.errors.push({ type: 'steps', date: 'batch', error: error.message })
      } else {
        results.success += stepsRecords.length
      }
    }

    // Batch insert sleep data
    if (sleepRecords.length > 0) {
      const { error } = await supabase.from('sleep_logs').upsert(
        sleepRecords.map((r) => ({
          user_id: userId,
          date: r.date,
          hours: r.value,
          source: 'apple_health',
        })),
        { onConflict: 'user_id,date' }
      )

      if (error) {
        results.failed += sleepRecords.length
        results.errors.push({ type: 'sleep', date: 'batch', error: error.message })
      } else {
        results.success += sleepRecords.length
      }
    }

    // Batch insert nutrition data
    if (nutritionRecords.length > 0) {
      const { error } = await supabase.from('nutrition_logs').upsert(
        nutritionRecords.map((r) => ({
          user_id: userId,
          date: r.date,
          calories: r.calories ?? null,
          protein: r.protein ?? null,
          carbs: r.carbs ?? null,
          fat: r.fat ?? null,
          source: 'apple_health',
        })),
        { onConflict: 'user_id,date' }
      )

      if (error) {
        results.failed += nutritionRecords.length
        results.errors.push({ type: 'nutrition', date: 'batch', error: error.message })
      } else {
        results.success += nutritionRecords.length
      }
    }

    // Return results
    return NextResponse.json({
      success: results.failed === 0,
      imported: results.success,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    })
  } catch (error) {
    console.error('Unexpected error in batch health-import:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
