-- 2026 Fitness Dashboard - Initial Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ubweulpyalrrurczpswy/sql

-- ============================================
-- WEIGHT LOGS TABLE
-- Stores daily weight measurements
-- ============================================

CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL, -- e.g., 218.50 lbs
  source TEXT DEFAULT 'manual', -- 'manual', 'apple_health', 'api'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One weight entry per user per day
  UNIQUE(user_id, date)
);

-- Index for faster queries by user and date
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, date DESC);

-- ============================================
-- MILESTONES TABLE
-- Stores monthly weight and lifting targets
-- ============================================

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12), -- 1-12
  year INTEGER NOT NULL CHECK (year >= 2024 AND year <= 2030), -- Reasonable year range
  target_weight DECIMAL(5,2), -- e.g., 214.00 lbs
  target_lifts JSONB DEFAULT '{}', -- {"flat_db_press": 50, "curls": 30, ...}
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One milestone entry per user per month/year
  UNIQUE(user_id, month, year)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_milestones_user_date ON milestones(user_id, year, month);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ============================================

-- Enable RLS on tables
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Weight logs policies
CREATE POLICY "Users can view own weight logs"
  ON weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
  ON weight_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones"
  ON milestones FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- Auto-update the updated_at column
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_weight_logs_updated_at
  BEFORE UPDATE ON weight_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
