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
// STEPS LOGS
// ============================================

export interface StepsLog {
  id: string // UUID
  user_id: string // UUID
  date: string // 'YYYY-MM-DD' format
  steps: number // e.g., 10000
  source: 'manual' | 'apple_health' | 'api'
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

export interface StepsLogInsert {
  user_id: string
  date: string
  steps: number
  source?: 'manual' | 'apple_health' | 'api'
}

export interface StepsLogUpdate {
  date?: string
  steps?: number
  source?: 'manual' | 'apple_health' | 'api'
}

// ============================================
// SLEEP LOGS
// ============================================

export interface SleepLog {
  id: string // UUID
  user_id: string // UUID
  date: string // 'YYYY-MM-DD' format
  hours: number // e.g., 7.50
  source: 'manual' | 'apple_health' | 'api'
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

export interface SleepLogInsert {
  user_id: string
  date: string
  hours: number
  source?: 'manual' | 'apple_health' | 'api'
}

export interface SleepLogUpdate {
  date?: string
  hours?: number
  source?: 'manual' | 'apple_health' | 'api'
}

// ============================================
// NUTRITION LOGS
// ============================================

export interface NutritionLog {
  id: string // UUID
  user_id: string // UUID
  date: string // 'YYYY-MM-DD' format
  calories: number | null // e.g., 2000
  protein: number | null // e.g., 180.50 grams
  carbs: number | null // e.g., 200.00 grams
  fat: number | null // e.g., 60.50 grams
  source: 'manual' | 'apple_health' | 'loseit' | 'api'
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

export interface NutritionLogInsert {
  user_id: string
  date: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  source?: 'manual' | 'apple_health' | 'loseit' | 'api'
}

export interface NutritionLogUpdate {
  date?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  source?: 'manual' | 'apple_health' | 'loseit' | 'api'
}

// ============================================
// WORKOUTS
// ============================================

export type WorkoutType = 'chest_triceps' | 'shoulders_biceps' | 'volume' | 'cardio' | 'active_rest'

export interface Workout {
  id: string // UUID
  user_id: string // UUID
  date: string // 'YYYY-MM-DD' format
  workout_type: WorkoutType
  completed: boolean
  duration_minutes: number | null
  notes: string | null
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

export interface WorkoutInsert {
  user_id: string
  date: string
  workout_type: WorkoutType
  completed?: boolean
  duration_minutes?: number
  notes?: string
}

export interface WorkoutUpdate {
  completed?: boolean
  duration_minutes?: number
  notes?: string
}

// ============================================
// EXERCISE SETS
// ============================================

export interface ExerciseSet {
  id: string // UUID
  workout_id: string // UUID
  exercise_name: string
  set_number: number
  reps: number | null
  weight: number | null // lbs
  created_at: string // ISO timestamp
}

export interface ExerciseSetInsert {
  workout_id: string
  exercise_name: string
  set_number: number
  reps?: number
  weight?: number
}

export interface ExerciseSetUpdate {
  reps?: number
  weight?: number
}

// ============================================
// HABIT LOGS
// ============================================

export interface HabitLog {
  id: string // UUID
  user_id: string // UUID
  date: string // 'YYYY-MM-DD' format
  meditation: boolean
  journal: boolean
  creatine: boolean
  sleep_hours: number | null
  steps: number | null
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

export interface HabitLogInsert {
  user_id: string
  date: string
  meditation?: boolean
  journal?: boolean
  creatine?: boolean
  sleep_hours?: number
  steps?: number
}

export interface HabitLogUpdate {
  meditation?: boolean
  journal?: boolean
  creatine?: boolean
  sleep_hours?: number
  steps?: number
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
