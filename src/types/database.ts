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
// MILESTONES
// ============================================

export interface TargetLiftsMap {
  [exerciseId: string]: number // exercise_id -> target weight
}

export interface AchievedLiftsMap {
  [exerciseId: string]: boolean // exercise_id -> achieved
}

export interface Milestone {
  id: string
  user_id: string
  month: number // 1-12
  year: number
  target_weight: number | null
  target_lifts: TargetLiftsMap
  achieved_weight: boolean
  achieved_lifts: AchievedLiftsMap
  created_at: string
  updated_at: string
}

export interface MilestoneInsert {
  user_id: string
  month: number
  year?: number
  target_weight?: number
  target_lifts?: TargetLiftsMap
}

export interface MilestoneUpdate {
  target_weight?: number
  target_lifts?: TargetLiftsMap
  achieved_weight?: boolean
  achieved_lifts?: AchievedLiftsMap
}

// ============================================
// WEEKLY REVIEWS
// ============================================

export interface WeeklyReview {
  id: string
  user_id: string
  week_start_date: string // Sunday of the week
  weight_avg: number | null
  workouts_completed: number
  workouts_target: number
  habits_completed: number
  habits_total: number
  went_well: string | null
  needs_adjustment: string | null
  created_at: string
  updated_at: string
}

export interface WeeklyReviewInsert {
  user_id: string
  week_start_date: string
  weight_avg?: number
  workouts_completed?: number
  workouts_target?: number
  habits_completed?: number
  habits_total?: number
  went_well?: string
  needs_adjustment?: string
}

export interface WeeklyReviewUpdate {
  weight_avg?: number
  workouts_completed?: number
  habits_completed?: number
  habits_total?: number
  went_well?: string
  needs_adjustment?: string
}

// ============================================
// ACHIEVEMENTS
// ============================================

export type AchievementType =
  | 'monthly_weight_target'
  | 'monthly_lift_target'
  | 'workout_streak'
  | 'habit_streak'
  | 'personal_record'

export interface Achievement {
  id: string
  user_id: string
  type: AchievementType
  title: string // Display title for the achievement
  achieved_at: string
  metadata: Record<string, unknown> | null
}

export interface AchievementInsert {
  user_id: string
  type: AchievementType
  title: string
  metadata?: Record<string, unknown>
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
