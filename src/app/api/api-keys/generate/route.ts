/**
 * API Key Generation Endpoint
 *
 * POST /api/api-keys/generate
 *
 * Generates a new API key for the authenticated user.
 * The key is shown only once - it's hashed before storage.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateApiKey, hashApiKey } from '@/lib/auth/api-key'

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

    // Parse request body for optional name
    const body = await request.json().catch(() => ({}))
    const name = body.name || 'Health Auto Export'

    // Generate a new API key
    const apiKey = generateApiKey()

    // Hash the key for storage
    const keyHash = await hashApiKey(apiKey)

    // Store the hashed key in the database
    const { error: insertError } = await supabase.from('api_keys').insert({
      user_id: user.id,
      key_hash: keyHash,
      name,
    })

    if (insertError) {
      console.error('Error inserting API key:', insertError)
      return NextResponse.json(
        { error: 'Failed to create API key', details: insertError.message },
        { status: 500 }
      )
    }

    // Return the plain-text key (only time it's shown)
    return NextResponse.json({
      success: true,
      api_key: apiKey,
      name,
      message: 'API key generated successfully. Save this key - it will not be shown again.',
    })
  } catch (error) {
    console.error('Unexpected error generating API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
