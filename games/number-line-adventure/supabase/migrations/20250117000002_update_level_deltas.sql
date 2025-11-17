-- Update level deltas to match level_number + 1
-- Level 1 should have delta=2, Level 2 should have delta=3, etc.
-- This ensures Level N earns (N+1)*5 coins, and Level N+1 costs (N+1)*5 coins

UPDATE level_definitions
SET delta = level_number + 1
WHERE level_number BETWEEN 1 AND 10;

-- Verify the update
-- SELECT level_number, delta, min_range, max_range FROM level_definitions ORDER BY level_number;
