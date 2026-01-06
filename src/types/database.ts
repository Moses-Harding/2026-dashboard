/**
 * Database Types
 *
 * These types match our Supabase database schema.
 * Similar to defining Swift structs that conform to Codable.
 *
 * Example usage:
 *   const weight: WeightLog = await supabase.from('weight_logs').select('*').single()
 */

// ============================================
// WEIGHT LOGS
// ============================================

export interface WeightLog {
  id: string // UUID
  user_id: string // UUID
  date: string // 'YYYY-MM-DD' format
  weight: number // e.g., 218.50
  source: 'manual' | 'apple_health' | 'api'
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

// For creating a new weight log (id and timestamps auto-generated)
export interface WeightLogInsert {
  user_id: string
  date: string
  weight: number
  source?: 'manual' | 'apple_health' | 'api'
}

// For updating a weight log
export interface WeightLogUpdate {
  date?: string
  weight?: number
  source?: 'manual' | 'apple_health' | 'api'
}

// ============================================
// MILESTONES
// ============================================

// Target lifts stored as JSON
export interface TargetLifts {
  flat_db_press?: number
  incline_db_press?: number
  skull_crushers?: number
  lateral_raises?: number
  rear_delt_flyes?: number
  curls?: number
  hammer_curls?: number
  [key: string]: number | undefined // Allow custom exercises
}

export interface Milestone {
  id: string // UUID
  user_id: string // UUID
  month: number // 1-12
  year: number // e.g., 2026
  target_weight: number | null // e.g., 214.00
  target_lifts: TargetLifts
  notes: string | null
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

// For creating a new milestone
export interface MilestoneInsert {
  user_id: string
  month: number
  year: number
  target_weight?: number
  target_lifts?: TargetLifts
  notes?: string
}

// For updating a milestone
export interface MilestoneUpdate {
  target_weight?: number
  target_lifts?: TargetLifts
  notes?: string
}

// ============================================
// USER (from Supabase Auth)
// ============================================

export interface User {
  id: string
  email: string | undefined
  created_at: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Dashboard data for the "Today" view
export interface TodayDashboardData {
  currentWeight: number | null
  weightChange: number | null // vs yesterday
  weeklyAverage: number | null
  targetWeight: number | null // current month's target
  weightHistory: WeightLog[] // last 30 days
  isOnTrack: boolean // within 2 lbs of monthly target
}
