/**
 * Supabase Client (Browser)
 *
 * Use this in React components that run in the browser.
 * Similar to creating a URLSession in iOS for network requests.
 *
 * Example usage:
 *   const supabase = createClient()
 *   const { data } = await supabase.from('weight_logs').select('*')
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
