/**
 * Date Utility Functions
 *
 * Helper functions for date calculations used across dashboard pages.
 * All functions use US Eastern timezone for consistency.
 */

const TIMEZONE = 'America/New_York'

/**
 * Get current date in US Eastern timezone
 */
export function getNow(): Date {
  const now = new Date()
  return new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }))
}

/**
 * Get the start of the week (Sunday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the end of the week (Saturday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (6 - day))
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Get the start of the month for a given date
 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Get the end of the month for a given date
 */
export function getMonthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

/**
 * Get quarter number (1-4) for a given date
 */
export function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1
}

/**
 * Get the start of the quarter for a given date
 */
export function getQuarterStart(date: Date): Date {
  const quarter = getQuarter(date)
  const startMonth = (quarter - 1) * 3
  return new Date(date.getFullYear(), startMonth, 1)
}

/**
 * Get the end of the quarter for a given date
 */
export function getQuarterEnd(date: Date): Date {
  const quarter = getQuarter(date)
  const endMonth = quarter * 3
  return new Date(date.getFullYear(), endMonth, 0, 23, 59, 59, 999)
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Format date range for display
 */
export function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startStr} - ${endStr}`
}

/**
 * Get number of days in a date range
 */
export function getDaysInRange(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

/**
 * Generate array of dates in a range
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

/**
 * Get week number of the year
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
