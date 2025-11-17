-- Add coins_earned column to user_progress table
-- This tracks coins earned from each individual level
-- Coins from level N can only be used to unlock level N+1

ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS coins_earned INTEGER DEFAULT 0 CHECK (coins_earned >= 0);

-- Create index for coins_earned column
CREATE INDEX IF NOT EXISTS user_progress_coins_earned_idx ON user_progress(user_id, coins_earned);

-- Comment for documentation
COMMENT ON COLUMN user_progress.coins_earned IS 'Coins earned from completing this specific level. Used to unlock the next level (coins from level N unlock level N+1).';
