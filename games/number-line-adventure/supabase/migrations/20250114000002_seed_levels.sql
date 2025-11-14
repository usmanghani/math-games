-- Seed data for level definitions
-- Creates the first 10 levels with progressive difficulty
-- Pattern: Level N uses delta=N+1, range expands by 5 each level

-- ============================================
-- LEVEL DEFINITIONS SEED DATA
-- ============================================

INSERT INTO level_definitions (level_number, delta, min_range, max_range, operations, required_accuracy)
VALUES
  -- Level 1: Jump by 2, range [0, 10]
  -- Example problems: 2+2=4, 6-2=4, 8+2=10
  (1, 2, 0, 10, ARRAY['addition', 'subtraction'], 0.6),

  -- Level 2: Jump by 3, range [0, 15]
  -- Example problems: 3+3=6, 9-3=6, 12+3=15
  (2, 3, 0, 15, ARRAY['addition', 'subtraction'], 0.6),

  -- Level 3: Jump by 4, range [0, 20]
  -- Example problems: 4+4=8, 12-4=8, 16+4=20
  (3, 4, 0, 20, ARRAY['addition', 'subtraction'], 0.6),

  -- Level 4: Jump by 5, range [0, 25]
  -- Example problems: 5+5=10, 15-5=10, 20+5=25
  (4, 5, 0, 25, ARRAY['addition', 'subtraction'], 0.6),

  -- Level 5: Jump by 6, range [0, 30]
  -- Example problems: 6+6=12, 18-6=12, 24+6=30
  (5, 6, 0, 30, ARRAY['addition', 'subtraction'], 0.6),

  -- Level 6: Jump by 7, range [0, 35]
  -- Example problems: 7+7=14, 21-7=14, 28+7=35
  (6, 7, 0, 35, ARRAY['addition', 'subtraction'], 0.6),

  -- Level 7: Jump by 8, range [0, 40]
  -- Example problems: 8+8=16, 24-8=16, 32+8=40
  (7, 8, 0, 40, ARRAY['addition', 'subtraction'], 0.6),

  -- Level 8: Jump by 9, range [0, 45]
  -- Example problems: 9+9=18, 27-9=18, 36+9=45
  (8, 9, 0, 45, ARRAY['addition', 'subtraction'], 0.6),

  -- Level 9: Jump by 10, range [0, 50]
  -- Example problems: 10+10=20, 30-10=20, 40+10=50
  (9, 10, 0, 50, ARRAY['addition', 'subtraction'], 0.6),

  -- Level 10: Jump by 11, range [0, 55]
  -- Example problems: 11+11=22, 33-11=22, 44+11=55
  (10, 11, 0, 55, ARRAY['addition', 'subtraction'], 0.6)

ON CONFLICT (level_number) DO UPDATE SET
  delta = EXCLUDED.delta,
  min_range = EXCLUDED.min_range,
  max_range = EXCLUDED.max_range,
  operations = EXCLUDED.operations,
  required_accuracy = EXCLUDED.required_accuracy;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Uncomment to verify seed data after running migration:
-- SELECT level_number, delta, min_range, max_range, operations, required_accuracy
-- FROM level_definitions
-- ORDER BY level_number;
