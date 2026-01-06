/**
 * Sign Out API Route
 *
 * Handles user logout by clearing the Supabase session.
 * Called via form POST from the sidebar.
 *
 * iOS Comparison: Like calling Auth.auth().signOut() in Firebase
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
