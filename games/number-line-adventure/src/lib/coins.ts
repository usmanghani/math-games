// Coin system utilities for level unlocking and progression

/**
 * Calculate the coin cost to unlock a specific level
 * Formula: levelNumber * 5 coins
 * Level 1 is free (0 coins)
 * Level 2: 2 * 5 = 10 coins (earned from Level 1 with delta=2)
 * Level 3: 3 * 5 = 15 coins (earned from Level 2 with delta=3)
 * Level 4: 4 * 5 = 20 coins (earned from Level 3 with delta=4)
 * etc.
 *
 * Since Level N has delta=(N+1), it earns (N+1)*5 coins.
 * Level N+1 costs (N+1)*5 coins to unlock.
 * This means completing Level N once perfectly unlocks Level N+1!
 *
 * @param levelNumber The level number (1-based)
 * @returns The number of coins required to unlock this level
 */
export function calculateLevelCost(levelNumber: number): number {
  // Level 1 is always free
  if (levelNumber <= 1) return 0

  // Formula: levelNumber * 5
  return levelNumber * 5
}


/**
 * Check if player has enough coins to unlock a level
 *
 * @param currentCoins Player's current coin balance
 * @param levelNumber Level to check
 * @returns true if player can afford to unlock the level
 */
export function canAffordLevel(
  currentCoins: number,
  levelNumber: number
): boolean {
  const cost = calculateLevelCost(levelNumber)
  return currentCoins >= cost
}

/**
 * Calculate total cost to unlock all levels up to a specific level
 *
 * @param upToLevel The target level number
 * @returns Total coins needed
 */
export function calculateTotalCostUpToLevel(upToLevel: number): number {
  let totalCost = 0

  for (let i = 2; i <= upToLevel; i++) {
    totalCost += calculateLevelCost(i)
  }

  return totalCost
}
