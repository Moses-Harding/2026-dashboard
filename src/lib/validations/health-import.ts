/**
 * Health Import API Validation Schemas
 *
 * Zod schemas for validating health data payloads from external sources.
 * Similar to Codable validation in Swift.
 *
 * Usage:
 *   const result = weightImportSchema.safeParse(body)
 *   if (!result.success) {
 *     return { error: result.error }
 *   }
 */

import { z } from 'zod'

// Date format: 'YYYY-MM-DD'
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

// API key for authentication
const apiKeySchema = z.string().min(32, 'Invalid API key')

// ============================================
// WEIGHT IMPORT
// ============================================

export const weightImportSchema = z.object({
  type: z.literal('weight'),
  date: dateSchema,
  value: z.number().min(50).max(500), // lbs
  api_key: apiKeySchema,
  user_id: z.string().uuid().optional(), // Optional: will be derived from API key
})

export type WeightImportPayload = z.infer<typeof weightImportSchema>

// ============================================
// STEPS IMPORT
// ============================================

export const stepsImportSchema = z.object({
  type: z.literal('steps'),
  date: dateSchema,
  value: z.number().int().min(0).max(100000), // steps
  api_key: apiKeySchema,
  user_id: z.string().uuid().optional(),
})

export type StepsImportPayload = z.infer<typeof stepsImportSchema>

// ============================================
// SLEEP IMPORT
// ============================================

export const sleepImportSchema = z.object({
  type: z.literal('sleep'),
  date: dateSchema,
  value: z.number().min(0).max(24), // hours
  api_key: apiKeySchema,
  user_id: z.string().uuid().optional(),
})

export type SleepImportPayload = z.infer<typeof sleepImportSchema>

// ============================================
// NUTRITION IMPORT
// ============================================

export const nutritionImportSchema = z.object({
  type: z.literal('nutrition'),
  date: dateSchema,
  calories: z.number().int().min(0).max(10000).optional(),
  protein: z.number().min(0).max(1000).optional(), // grams
  carbs: z.number().min(0).max(2000).optional(), // grams
  fat: z.number().min(0).max(1000).optional(), // grams
  api_key: apiKeySchema,
  user_id: z.string().uuid().optional(),
})

export type NutritionImportPayload = z.infer<typeof nutritionImportSchema>

// ============================================
// UNIFIED IMPORT SCHEMA
// ============================================

// Union type for all health import payloads
export const healthImportSchema = z.discriminatedUnion('type', [
  weightImportSchema,
  stepsImportSchema,
  sleepImportSchema,
  nutritionImportSchema,
])

export type HealthImportPayload = z.infer<typeof healthImportSchema>

// ============================================
// BATCH IMPORT SCHEMA
// ============================================

// For importing multiple records at once
export const batchHealthImportSchema = z.object({
  records: z.array(healthImportSchema).min(1).max(100), // Max 100 records per batch
  api_key: apiKeySchema,
})

export type BatchHealthImportPayload = z.infer<typeof batchHealthImportSchema>
