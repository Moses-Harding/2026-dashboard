/**
 * Dashboard Data Provider
 *
 * Shares common dashboard data across all pages to eliminate
 * redundant data fetching and enable instant navigation.
 *
 * Data is fetched once in the layout and shared via context.
 */

'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { WeightLog, HabitLog, Workout, ExerciseSet, Milestone, Achievement } from '@/types/database'

// ============================================
// TYPES
// ============================================

export interface WorkoutWithSets extends Workout {
  exercise_sets: ExerciseSet[]
}

export interface DashboardData {
  user: {
    id: string
    email: string | undefined
  }
  // Weight data (last 90 days for all timeframes)
  weightLogs: WeightLog[]
  // Habit logs (last 30 days)
  habitLogs: HabitLog[]
  // Recent workouts (last 30 days)
  workouts: WorkoutWithSets[]
  // Current month's milestone
  currentMilestone: Milestone | null
  // Recent achievements
  achievements: Achievement[]
  // Last sync timestamp
  lastSynced: string
}

interface DashboardContextType {
  data: DashboardData
  isRefreshing: boolean
  refresh: () => Promise<void>
}

// ============================================
// CONTEXT
// ============================================

const DashboardContext = createContext<DashboardContextType | null>(null)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

// Optional hook that doesn't throw (for components that might not be in dashboard)
export function useDashboardOptional() {
  return useContext(DashboardContext)
}

// ============================================
// PROVIDER
// ============================================

interface DashboardProviderProps {
  children: ReactNode
  initialData: DashboardData
}

export function DashboardProvider({ children, initialData }: DashboardProviderProps) {
  const router = useRouter()
  const [data, setData] = useState<DashboardData>(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // Trigger Next.js router refresh to re-fetch server data
      router.refresh()
      // Update lastSynced timestamp
      setData((prev) => ({
        ...prev,
        lastSynced: new Date().toISOString(),
      }))
    } finally {
      // Small delay to show loading state
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }, [router])

  return (
    <DashboardContext.Provider value={{ data, isRefreshing, refresh }}>
      {children}
    </DashboardContext.Provider>
  )
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Get weight logs filtered by date range
 */
export function useWeightLogs(days: number = 30) {
  const { data } = useDashboard()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  return data.weightLogs.filter((log) => log.date >= cutoffStr)
}

/**
 * Get habit logs filtered by date range
 */
export function useHabitLogs(days: number = 7) {
  const { data } = useDashboard()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  return data.habitLogs.filter((log) => log.date >= cutoffStr)
}

/**
 * Get workouts filtered by date range
 */
export function useWorkouts(days: number = 30): WorkoutWithSets[] {
  const { data } = useDashboard()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  return data.workouts.filter((w) => w.date >= cutoffStr)
}

/**
 * Get current milestone
 */
export function useMilestone() {
  const { data } = useDashboard()
  return data.currentMilestone
}

/**
 * Get achievements
 */
export function useAchievements() {
  const { data } = useDashboard()
  return data.achievements
}
