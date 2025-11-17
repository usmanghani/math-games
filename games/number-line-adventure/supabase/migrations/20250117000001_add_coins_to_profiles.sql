-- Add coins column to profiles table
-- Coins are a user-level currency used to unlock levels

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0 CHECK (coins >= 0);

-- Create index for coins column (useful for leaderboards later)
CREATE INDEX IF NOT EXISTS profiles_coins_idx ON profiles(coins DESC);

-- Comment for documentation
COMMENT ON COLUMN profiles.coins IS 'User coin balance for unlocking levels. Earned by completing problems correctly (1 coin per correct answer).';
