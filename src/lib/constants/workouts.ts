/**
 * Workout Templates and Exercise Constants
 *
 * Defines the workout schedule and exercise configurations
 * based on the 2026 fitness plan.
 */

import type { WorkoutType } from '@/types/database'

// ============================================
// WORKOUT TYPES
// ============================================

export const WORKOUT_TYPES: Record<WorkoutType, { label: string; emoji: string; description: string }> = {
  chest_triceps: {
    label: 'Chest & Triceps',
    emoji: '💪',
    description: 'Push day focusing on chest and tricep exercises',
  },
  shoulders_biceps: {
    label: 'Shoulders & Biceps',
    emoji: '🏋️',
    description: 'Pull day focusing on shoulders and bicep exercises',
  },
  volume: {
    label: 'Volume Day',
    emoji: '🔥',
    description: 'High volume compound movements',
  },
  cardio: {
    label: 'Cardio',
    emoji: '🏃',
    description: 'Elliptical or other cardio for 30-45 minutes',
  },
  active_rest: {
    label: 'Active Rest',
    emoji: '🚶',
    description: 'Light activity - walking, stretching',
  },
}

// ============================================
// WEEKLY SCHEDULE
// ============================================

// 0 = Sunday, 1 = Monday, etc.
export const WEEKLY_SCHEDULE: Record<number, WorkoutType | 'rest'> = {
  0: 'rest', // Sunday: Rest Day + Weekly Review
  1: 'chest_triceps', // Monday
  2: 'cardio', // Tuesday
  3: 'shoulders_biceps', // Wednesday
  4: 'cardio', // Thursday
  5: 'volume', // Friday
  6: 'active_rest', // Saturday
}

export function getTodaysWorkout(): WorkoutType | 'rest' {
  // Use US Eastern timezone to ensure correct day regardless of server location
  const now = new Date()
  const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const dayOfWeek = easternTime.getDay()
  return WEEKLY_SCHEDULE[dayOfWeek]
}

// ============================================
// EXERCISE DEFINITIONS
// ============================================

export interface ExerciseDefinition {
  id: string
  name: string
  category: 'chest' | 'triceps' | 'shoulders' | 'biceps' | 'compound' | 'cardio'
  defaultSets: number
  defaultReps: number
  startWeight?: number // Starting weight at beginning of 2026
  targetWeight2026?: number // Year-end target weight in lbs
}

export const EXERCISES: Record<string, ExerciseDefinition> = {
  // Chest exercises
  flat_db_press: {
    id: 'flat_db_press',
    name: 'Flat Dumbbell Press',
    category: 'chest',
    defaultSets: 4,
    defaultReps: 10,
    startWeight: 45,
    targetWeight2026: 65,
  },
  incline_db_press: {
    id: 'incline_db_press',
    name: 'Incline Dumbbell Press',
    category: 'chest',
    defaultSets: 4,
    defaultReps: 10,
    startWeight: 35,
    targetWeight2026: 55,
  },
  cable_flyes: {
    id: 'cable_flyes',
    name: 'Cable Flyes',
    category: 'chest',
    defaultSets: 3,
    defaultReps: 12,
    startWeight: 20,
    targetWeight2026: 30,
  },

  // Triceps exercises
  skull_crushers: {
    id: 'skull_crushers',
    name: 'Skull Crushers',
    category: 'triceps',
    defaultSets: 3,
    defaultReps: 12,
    startWeight: 25,
    targetWeight2026: 40,
  },
  tricep_pushdowns: {
    id: 'tricep_pushdowns',
    name: 'Tricep Pushdowns',
    category: 'triceps',
    defaultSets: 3,
    defaultReps: 12,
    startWeight: 35,
    targetWeight2026: 50,
  },
  overhead_tricep: {
    id: 'overhead_tricep',
    name: 'Overhead Tricep Extension',
    category: 'triceps',
    defaultSets: 3,
    defaultReps: 12,
    startWeight: 25,
    targetWeight2026: 35,
  },

  // Shoulder exercises
  lateral_raises: {
    id: 'lateral_raises',
    name: 'Lateral Raises',
    category: 'shoulders',
    defaultSets: 4,
    defaultReps: 12,
    startWeight: 15,
    targetWeight2026: 25,
  },
  rear_delt_flyes: {
    id: 'rear_delt_flyes',
    name: 'Rear Delt Flyes',
    category: 'shoulders',
    defaultSets: 3,
    defaultReps: 12,
    startWeight: 12,
    targetWeight2026: 20,
  },
  shoulder_press: {
    id: 'shoulder_press',
    name: 'Dumbbell Shoulder Press',
    category: 'shoulders',
    defaultSets: 4,
    defaultReps: 10,
    startWeight: 30,
    targetWeight2026: 45,
  },
  front_raises: {
    id: 'front_raises',
    name: 'Front Raises',
    category: 'shoulders',
    defaultSets: 3,
    defaultReps: 12,
    startWeight: 12,
    targetWeight2026: 20,
  },

  // Biceps exercises
  curls: {
    id: 'curls',
    name: 'Dumbbell Curls',
    category: 'biceps',
    defaultSets: 4,
    defaultReps: 10,
    startWeight: 25,
    targetWeight2026: 40,
  },
  hammer_curls: {
    id: 'hammer_curls',
    name: 'Hammer Curls',
    category: 'biceps',
    defaultSets: 3,
    defaultReps: 10,
    startWeight: 20,
    targetWeight2026: 35,
  },
  preacher_curls: {
    id: 'preacher_curls',
    name: 'Preacher Curls',
    category: 'biceps',
    defaultSets: 3,
    defaultReps: 10,
    startWeight: 20,
    targetWeight2026: 30,
  },

  // Compound / Volume exercises
  bench_press: {
    id: 'bench_press',
    name: 'Barbell Bench Press',
    category: 'compound',
    defaultSets: 4,
    defaultReps: 8,
    startWeight: 135,
    targetWeight2026: 185,
  },
  rows: {
    id: 'rows',
    name: 'Dumbbell Rows',
    category: 'compound',
    defaultSets: 4,
    defaultReps: 10,
    startWeight: 40,
    targetWeight2026: 60,
  },
  lat_pulldown: {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    category: 'compound',
    defaultSets: 4,
    defaultReps: 10,
    startWeight: 100,
    targetWeight2026: 140,
  },
}

// ============================================
// WORKOUT TEMPLATES
// ============================================

export interface WorkoutTemplate {
  type: WorkoutType
  exercises: string[] // Exercise IDs in order
}

export const WORKOUT_TEMPLATES: Record<WorkoutType, WorkoutTemplate> = {
  chest_triceps: {
    type: 'chest_triceps',
    exercises: [
      'flat_db_press',
      'incline_db_press',
      'cable_flyes',
      'skull_crushers',
      'tricep_pushdowns',
      'overhead_tricep',
    ],
  },
  shoulders_biceps: {
    type: 'shoulders_biceps',
    exercises: [
      'shoulder_press',
      'lateral_raises',
      'rear_delt_flyes',
      'front_raises',
      'curls',
      'hammer_curls',
    ],
  },
  volume: {
    type: 'volume',
    exercises: [
      'bench_press',
      'rows',
      'lat_pulldown',
      'shoulder_press',
      'curls',
      'skull_crushers',
    ],
  },
  cardio: {
    type: 'cardio',
    exercises: [], // No weight exercises for cardio
  },
  active_rest: {
    type: 'active_rest',
    exercises: [], // No structured exercises
  },
}

// Get exercise definition by ID
export function getExercise(exerciseId: string): ExerciseDefinition | undefined {
  return EXERCISES[exerciseId]
}

// Get all exercises for a workout type
export function getExercisesForWorkout(workoutType: WorkoutType): ExerciseDefinition[] {
  const template = WORKOUT_TEMPLATES[workoutType]
  return template.exercises.map((id) => EXERCISES[id]).filter(Boolean)
}
