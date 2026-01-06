/**
 * API Key Authentication Helper
 *
 * Functions for verifying API keys used in health data import endpoints.
 * API keys are hashed with SHA-256 before storage for security.
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Verify an API key and return the associated user_id
 *
 * @param apiKey - The API key to verify
 * @returns The user_id if valid, null if invalid
 */
export async function verifyApiKey(apiKey: string): Promise<string | null> {
  const supabase = await createClient()

  try {
    // Call the Supabase function to verify the key
    // The function hashes the key and looks it up in the database
    const { data, error } = await supabase.rpc('verify_api_key', {
      key_to_verify: apiKey,
    })

    if (error) {
      console.error('Error verifying API key:', error)
      return null
    }

    return data as string | null
  } catch (err) {
    console.error('Exception verifying API key:', err)
    return null
  }
}

/**
 * Generate a secure random API key
 *
 * @returns A 64-character hexadecimal API key
 */
export function generateApiKey(): string {
  // Generate 32 random bytes and convert to hex (64 characters)
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash an API key with SHA-256
 *
 * @param apiKey - The API key to hash
 * @returns The SHA-256 hash as a hexadecimal string
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
