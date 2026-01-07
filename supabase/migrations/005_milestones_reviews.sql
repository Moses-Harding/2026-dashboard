-- Migration: Milestones and Weekly Reviews
-- Phase 5: Milestones & Review

-- ============================================
-- MILESTONES TABLE
-- ============================================
-- Stores monthly weight and lifting targets from the 2026 fitness plan

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL DEFAULT 2026,
  target_weight DECIMAL(5,2),
  target_lifts JSONB DEFAULT '{}', -- {"flat_db_press": 50, "curls": 30, ...}
  achieved_weight BOOLEAN DEFAULT false,
  achieved_lifts JSONB DEFAULT '{}', -- {"flat_db_press": true, "curls": false, ...}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- ============================================
-- WEEKLY REVIEWS TABLE
-- ============================================
-- Stores Sunday weekly review notes

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- Sunday of the week
  weight_avg DECIMAL(5,2),
  workouts_completed INTEGER DEFAULT 0,
  workouts_target INTEGER DEFAULT 5,
  habits_completed INTEGER DEFAULT 0,
  habits_total INTEGER DEFAULT 0,
  went_well TEXT,
  needs_adjustment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
-- Tracks milestone achievements for celebration

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'monthly_weight_target', 'monthly_lift_target', 'workout_streak', 'habit_streak', 'personal_record'
  title TEXT NOT NULL, -- Display title for the achievement
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB, -- additional context
  UNIQUE(user_id, type, title)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

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

-- Weekly reviews policies
CREATE POLICY "Users can view own weekly reviews"
  ON weekly_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reviews"
  ON weekly_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reviews"
  ON weekly_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_reviews_updated_at
  BEFORE UPDATE ON weekly_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_milestones_user_year ON milestones(user_id, year);
CREATE INDEX idx_weekly_reviews_user_date ON weekly_reviews(user_id, week_start_date);
CREATE INDEX idx_achievements_user ON achievements(user_id);
