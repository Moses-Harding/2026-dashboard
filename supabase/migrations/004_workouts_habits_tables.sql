-- 2026 Fitness Dashboard - Workouts & Habits Tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ubweulpyalrrurczpswy/sql

-- ============================================
-- WORKOUTS TABLE
-- Stores workout sessions
-- ============================================

CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workout_type TEXT NOT NULL, -- 'chest_triceps', 'shoulders_biceps', 'volume', 'cardio', 'active_rest'
  completed BOOLEAN DEFAULT false,
  duration_minutes INTEGER, -- optional: how long the workout took
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One workout per type per user per day
  UNIQUE(user_id, date, workout_type)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date DESC);

-- ============================================
-- EXERCISE SETS TABLE
-- Stores individual sets within a workout
-- ============================================

CREATE TABLE IF NOT EXISTS exercise_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL, -- 'flat_db_press', 'incline_db_press', 'curls', etc.
  set_number INTEGER NOT NULL CHECK (set_number >= 1 AND set_number <= 10),
  reps INTEGER CHECK (reps >= 0 AND reps <= 100),
  weight DECIMAL(5,1) CHECK (weight >= 0 AND weight <= 1000), -- lbs, e.g., 45.5
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique set per exercise per workout
  UNIQUE(workout_id, exercise_name, set_number)
);

-- Index for faster queries by workout
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout ON exercise_sets(workout_id);

-- Index for exercise progression queries
CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise ON exercise_sets(exercise_name);

-- ============================================
-- HABIT LOGS TABLE
-- Stores daily habit completion
-- ============================================

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  -- Manual habits (checkboxes)
  meditation BOOLEAN DEFAULT false,
  journal BOOLEAN DEFAULT false,
  creatine BOOLEAN DEFAULT false,
  -- Auto-imported from Apple Health (stored here for easy access)
  sleep_hours DECIMAL(4,2), -- hours, e.g., 7.50
  steps INTEGER, -- daily step count
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One habit log per user per day
  UNIQUE(user_id, date)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Workouts policies
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Exercise sets policies (access through workout ownership)
CREATE POLICY "Users can view own exercise sets"
  ON exercise_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercise_sets.workout_id
        AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercise sets"
  ON exercise_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercise_sets.workout_id
        AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercise sets"
  ON exercise_sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercise_sets.workout_id
        AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercise sets"
  ON exercise_sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercise_sets.workout_id
        AND workouts.user_id = auth.uid()
    )
  );

-- Habit logs policies
CREATE POLICY "Users can view own habit logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit logs"
  ON habit_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit logs"
  ON habit_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_logs_updated_at
  BEFORE UPDATE ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
