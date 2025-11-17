import { supabase, isSupabaseConfigured } from './supabase'
import type { Database } from './database.types'
import type { Operation } from './problem'

// Type alias for level definition from database
type LevelDefinitionRow = Database['public']['Tables']['level_definitions']['Row']

/**
 * Level configuration interface
 * Represents a single level's difficulty settings
 */
export interface LevelConfig {
  levelNumber: number
  delta: number // Jump size (2, 3, 4, 5, ...)
  minRange: number // Starting number (default: 0)
  maxRange: number // Maximum number
  operations: Operation[] // ['addition', 'subtraction']
  requiredAccuracy: number // 0.6 = 60% to unlock next level
}

/**
 * Convert database row to LevelConfig
 */
function rowToLevelConfig(row: LevelDefinitionRow): LevelConfig {
  return {
    levelNumber: row.level_number,
    delta: row.delta,
    minRange: row.min_range ?? 0,
    maxRange: row.max_range ?? 20,
    operations: row.operations as Operation[],
    requiredAccuracy: Number(row.required_accuracy),
  }
}

/**
 * Fetch a specific level configuration from the database
 * @param levelNumber The level number to fetch (1-based)
 * @returns LevelConfig or null if not found
 */
export async function getLevelConfig(levelNumber: number): Promise<LevelConfig | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Cannot fetch level config.')
    return null
  }

  const { data, error } = await supabase
    .from('level_definitions')
    .select('*')
    .eq('level_number', levelNumber)
    .single()

  if (error) {
    console.error('Error fetching level config:', error)
    return null
  }

  return data ? rowToLevelConfig(data) : null
}

/**
 * Fetch all level configurations from the database
 * @returns Array of LevelConfig sorted by level number
 */
export async function getAllLevels(): Promise<LevelConfig[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Cannot fetch levels.')
    return []
  }

  const { data, error } = await supabase
    .from('level_definitions')
    .select('*')
    .order('level_number', { ascending: true })

  if (error) {
    console.error('Error fetching levels:', error)
    return []
  }

  return data ? data.map(rowToLevelConfig) : []
}

/**
 * Get a range of levels (useful for pagination)
 * @param startLevel Starting level number (inclusive)
 * @param endLevel Ending level number (inclusive)
 * @returns Array of LevelConfig
 */
export async function getLevelRange(
  startLevel: number,
  endLevel: number
): Promise<LevelConfig[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Cannot fetch level range.')
    return []
  }

  const { data, error } = await supabase
    .from('level_definitions')
    .select('*')
    .gte('level_number', startLevel)
    .lte('level_number', endLevel)
    .order('level_number', { ascending: true })

  if (error) {
    console.error('Error fetching level range:', error)
    return []
  }

  return data ? data.map(rowToLevelConfig) : []
}

/**
 * Get the total number of levels available
 * @returns Total count of levels
 */
export async function getTotalLevels(): Promise<number> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Cannot count levels.')
    return 0
  }

  const { count, error } = await supabase
    .from('level_definitions')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error counting levels:', error)
    return 0
  }

  return count ?? 0
}

/**
 * Check if a level exists
 * @param levelNumber The level number to check
 * @returns true if level exists, false otherwise
 */
export async function levelExists(levelNumber: number): Promise<boolean> {
  const config = await getLevelConfig(levelNumber)
  return config !== null
}

/**
 * Calculate the next level number
 * @param currentLevel Current level number
 * @returns Next level number or null if current is the last level
 */
export async function getNextLevel(currentLevel: number): Promise<number | null> {
  const totalLevels = await getTotalLevels()
  const nextLevel = currentLevel + 1
  return nextLevel <= totalLevels ? nextLevel : null
}

/**
 * Calculate the previous level number
 * @param currentLevel Current level number
 * @returns Previous level number or null if current is the first level
 */
export function getPreviousLevel(currentLevel: number): number | null {
  const previousLevel = currentLevel - 1
  return previousLevel >= 1 ? previousLevel : null
}

/**
 * Default level configurations (fallback when database is unavailable)
 * Level number matches delta (Level 1 = delta 1, Level 2 = delta 2, etc.)
 * Matches the seed data in migrations/20250114000002_seed_levels.sql
 */
export const DEFAULT_LEVELS: LevelConfig[] = [
  { levelNumber: 1, delta: 1, minRange: 0, maxRange: 10, operations: ['addition', 'subtraction'], requiredAccuracy: 0.6 },
  { levelNumber: 2, delta: 2, minRange: 0, maxRange: 15, operations: ['addition', 'subtraction'], requiredAccuracy: 0.6 },
  { levelNumber: 3, delta: 3, minRange: 0, maxRange: 20, operations: ['addition', 'subtraction'], requiredAccuracy: 0.6 },
  { levelNumber: 4, delta: 4, minRange: 0, maxRange: 25, operations: ['addition', 'subtraction'], requiredAccuracy: 0.6 },
  { levelNumber: 5, delta: 5, minRange: 0, maxRange: 30, operations: ['addition', 'subtraction'], requiredAccuracy: 0.6 },
  { levelNumber: 6, delta: 6, minRange: 0, maxRange: 35, operations: ['addition', 'subtraction'], requiredAccuracy: 0.6 },
  { levelNumber: 7, delta: 7, minRange: 0, maxRange: 40, operations: ['addition', 'subtraction'], requiredAccuracy: 0.6 },
  { levelNumber: 8, delta: 8, minRange: 0, maxRange: 45, operations: ['addition', 'subtraction'], requiredAccuracy: 0.6 },
  { levelNumber: 9, delta: 9, minRange: 0, maxRange: 50, operations: ['addition', 'subtraction'], requiredAccuracy: 0.6 },
  { levelNumber: 10, delta: 10, minRange: 0, maxRange: 55, operations: ['addition', 'subtraction'], requiredAccuracy: 0.6 },
]

/**
 * Get level config with fallback to default levels
 * Useful during development or when database is unavailable
 * @param levelNumber The level number to fetch
 * @returns LevelConfig (never null, uses defaults as fallback)
 */
export async function getLevelConfigWithFallback(levelNumber: number): Promise<LevelConfig> {
  const config = await getLevelConfig(levelNumber)
  if (config) return config

  // Fallback to default levels
  const defaultConfig = DEFAULT_LEVELS.find((l) => l.levelNumber === levelNumber)
  if (defaultConfig) return defaultConfig

  // Ultimate fallback: Level 1 config
  return DEFAULT_LEVELS[0]
}

/**
 * Get all levels with fallback to default levels
 * @returns Array of LevelConfig (never empty, uses defaults as fallback)
 */
export async function getAllLevelsWithFallback(): Promise<LevelConfig[]> {
  const levels = await getAllLevels()
  return levels.length > 0 ? levels : DEFAULT_LEVELS
}
