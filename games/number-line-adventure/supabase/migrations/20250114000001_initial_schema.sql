-- Initial database schema for Number Line Adventure
-- This migration creates tables for user profiles, level definitions, progress tracking, and game sessions

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Stores user profile information (display name, avatar)
-- Links to Supabase auth.users via foreign key

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '🐰',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- LEVEL DEFINITIONS TABLE
-- ============================================
-- Stores static level configurations (delta, range, operations)
-- Defines the progression system

CREATE TABLE IF NOT EXISTS level_definitions (
  id SERIAL PRIMARY KEY,
  level_number INTEGER UNIQUE NOT NULL,
  delta INTEGER NOT NULL,
  min_range INTEGER DEFAULT 0,
  max_range INTEGER DEFAULT 20,
  operations TEXT[] DEFAULT ARRAY['addition', 'subtraction'],
  required_accuracy DECIMAL DEFAULT 0.6,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_delta CHECK (delta > 0),
  CONSTRAINT valid_range CHECK (min_range >= 0 AND max_range > min_range),
  CONSTRAINT valid_accuracy CHECK (required_accuracy >= 0 AND required_accuracy <= 1)
);

-- Index for faster level lookups
CREATE INDEX IF NOT EXISTS level_definitions_level_number_idx ON level_definitions(level_number);

-- ============================================
-- USER PROGRESS TABLE
-- ============================================
-- Tracks each user's progress through levels
-- One row per user per level

CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL REFERENCES level_definitions(level_number),
  is_unlocked BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  best_score INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  unlocked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_number),
  CONSTRAINT valid_score CHECK (best_score >= 0 AND best_score <= 5),
  CONSTRAINT valid_streak CHECK (best_streak >= 0),
  CONSTRAINT valid_attempts CHECK (total_attempts >= 0),
  CONSTRAINT valid_correct CHECK (total_correct >= 0 AND total_correct <= total_attempts * 5)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS user_progress_user_id_idx ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS user_progress_level_number_idx ON user_progress(level_number);
CREATE INDEX IF NOT EXISTS user_progress_user_level_idx ON user_progress(user_id, level_number);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GAME SESSIONS TABLE
-- ============================================
-- Stores detailed history of each game session
-- Used for analytics and progress tracking

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL REFERENCES level_definitions(level_number),
  score INTEGER NOT NULL,
  best_streak INTEGER NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_session_score CHECK (score >= 0 AND score <= 5),
  CONSTRAINT valid_session_streak CHECK (best_streak >= 0)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS game_sessions_user_id_idx ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS game_sessions_level_number_idx ON game_sessions(level_number);
CREATE INDEX IF NOT EXISTS game_sessions_completed_at_idx ON game_sessions(completed_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Note: level_definitions is public (no RLS needed)

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User progress policies
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Game sessions policies
CREATE POLICY "Users can view own sessions"
  ON game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Updates and deletes not allowed on game_sessions (audit trail)

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to initialize progress for a new user
-- Creates user_progress records for all levels (Level 1 unlocked by default)
CREATE OR REPLACE FUNCTION initialize_user_progress(new_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_progress (user_id, level_number, is_unlocked, unlocked_at)
  SELECT
    new_user_id,
    level_number,
    CASE WHEN level_number = 1 THEN TRUE ELSE FALSE END,
    CASE WHEN level_number = 1 THEN NOW() ELSE NULL END
  FROM level_definitions
  ON CONFLICT (user_id, level_number) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unlock next level based on performance
-- Called after a game session is saved
CREATE OR REPLACE FUNCTION unlock_next_level_if_qualified(
  p_user_id UUID,
  p_level_number INTEGER,
  p_score INTEGER
)
RETURNS boolean AS $$
DECLARE
  v_required_accuracy DECIMAL;
  v_achieved_accuracy DECIMAL;
  v_next_level INTEGER;
BEGIN
  -- Get required accuracy for current level
  SELECT required_accuracy INTO v_required_accuracy
  FROM level_definitions
  WHERE level_number = p_level_number;

  -- Calculate achieved accuracy (score out of 5)
  v_achieved_accuracy := p_score::DECIMAL / 5.0;

  -- Check if user qualified
  IF v_achieved_accuracy >= v_required_accuracy THEN
    v_next_level := p_level_number + 1;

    -- Unlock next level if it exists and isn't already unlocked
    UPDATE user_progress
    SET
      is_unlocked = TRUE,
      unlocked_at = COALESCE(unlocked_at, NOW())
    WHERE
      user_id = p_user_id
      AND level_number = v_next_level
      AND is_unlocked = FALSE;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
