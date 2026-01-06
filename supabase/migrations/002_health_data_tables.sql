-- 2026 Fitness Dashboard - Health Data Tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ubweulpyalrrurczpswy/sql

-- ============================================
-- STEPS LOGS TABLE
-- Stores daily step count
-- ============================================

CREATE TABLE IF NOT EXISTS steps_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER NOT NULL CHECK (steps >= 0), -- e.g., 10000 steps
  source TEXT DEFAULT 'apple_health', -- 'manual', 'apple_health', 'api'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One steps entry per user per day
  UNIQUE(user_id, date)
);

-- Index for faster queries by user and date
CREATE INDEX IF NOT EXISTS idx_steps_logs_user_date ON steps_logs(user_id, date DESC);

-- ============================================
-- SLEEP LOGS TABLE
-- Stores daily sleep duration in hours
-- ============================================

CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours DECIMAL(4,2) NOT NULL CHECK (hours >= 0 AND hours <= 24), -- e.g., 7.50 hours
  source TEXT DEFAULT 'apple_health', -- 'manual', 'apple_health', 'api'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One sleep entry per user per day
  UNIQUE(user_id, date)
);

-- Index for faster queries by user and date
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, date DESC);

-- ============================================
-- NUTRITION LOGS TABLE
-- Stores daily nutrition data from LoseIt
-- ============================================

CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calories INTEGER CHECK (calories >= 0), -- e.g., 2000 calories
  protein DECIMAL(6,2) CHECK (protein >= 0), -- e.g., 180.50 grams
  carbs DECIMAL(6,2) CHECK (carbs >= 0), -- e.g., 200.00 grams
  fat DECIMAL(6,2) CHECK (fat >= 0), -- e.g., 60.50 grams
  source TEXT DEFAULT 'apple_health', -- 'manual', 'apple_health', 'loseit', 'api'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One nutrition entry per user per day
  UNIQUE(user_id, date)
);

-- Index for faster queries by user and date
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON nutrition_logs(user_id, date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ============================================

-- Enable RLS on tables
ALTER TABLE steps_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Steps logs policies
CREATE POLICY "Users can view own steps logs"
  ON steps_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own steps logs"
  ON steps_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own steps logs"
  ON steps_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own steps logs"
  ON steps_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Sleep logs policies
CREATE POLICY "Users can view own sleep logs"
  ON sleep_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep logs"
  ON sleep_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep logs"
  ON sleep_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep logs"
  ON sleep_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Nutrition logs policies
CREATE POLICY "Users can view own nutrition logs"
  ON nutrition_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs"
  ON nutrition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs"
  ON nutrition_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs"
  ON nutrition_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- Auto-update the updated_at column
-- ============================================

CREATE TRIGGER update_steps_logs_updated_at
  BEFORE UPDATE ON steps_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sleep_logs_updated_at
  BEFORE UPDATE ON sleep_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_logs_updated_at
  BEFORE UPDATE ON nutrition_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
