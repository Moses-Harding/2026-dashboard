-- 2026 Fitness Dashboard - API Keys Table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ubweulpyalrrurczpswy/sql

-- ============================================
-- API KEYS TABLE
-- Stores API keys for health data import
-- ============================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of the API key
  name TEXT NOT NULL DEFAULT 'Health Auto Export', -- Friendly name for the key
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,

  -- One user can have multiple API keys
  UNIQUE(user_id, name)
);

-- Index for faster lookups by key hash
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash) WHERE is_active = true;

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own API keys
-- ============================================

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- API keys policies
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTION: Verify API Key
-- Returns user_id if valid, NULL if invalid
-- ============================================

CREATE OR REPLACE FUNCTION verify_api_key(key_to_verify TEXT)
RETURNS UUID AS $$
DECLARE
  key_hash TEXT;
  result_user_id UUID;
BEGIN
  -- Hash the provided key (SHA-256)
  key_hash := encode(digest(key_to_verify, 'sha256'), 'hex');

  -- Look up the key and get user_id
  SELECT user_id INTO result_user_id
  FROM api_keys
  WHERE api_keys.key_hash = key_hash
    AND is_active = true;

  -- Update last_used_at if found
  IF result_user_id IS NOT NULL THEN
    UPDATE api_keys
    SET last_used_at = NOW()
    WHERE api_keys.key_hash = key_hash;
  END IF;

  RETURN result_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
