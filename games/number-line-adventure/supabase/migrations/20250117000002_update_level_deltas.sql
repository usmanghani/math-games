-- Update level deltas to match level numbers
-- Level 1 should have delta=1, Level 2 should have delta=2, etc.

UPDATE level_definitions
SET delta = level_number
WHERE level_number BETWEEN 1 AND 10;

-- Verify the update
-- SELECT level_number, delta, min_range, max_range FROM level_definitions ORDER BY level_number;
