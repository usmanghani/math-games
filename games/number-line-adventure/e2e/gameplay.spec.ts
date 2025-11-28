import { test, expect, type Page } from '@playwright/test'

/**
 * Helper function to play a single round
 */
async function playRound(page: Page) {
  // Wait for problem prompt to appear
  await page.waitForSelector('text=/Our bunny starts/i', { timeout: 10000 })
  
  // Get the problem text from the prompt
  const promptElement = page.locator('text=/Our bunny starts/i').first()
  const problemText = await promptElement.textContent()
  if (!problemText) throw new Error('Problem text not found')

  // Extract start, direction, and delta from the prompt
  // Format: "Our bunny starts at X and hops forward/backward Y steps. Where will it land?"
  const match = problemText.match(/starts at (\d+).*hops (forward|backward) (\d+)/)
  if (!match) {
    // Try alternative format from equation card
    const equationText = await page.locator('.equation-card__equation').textContent()
    if (equationText) {
      const eqMatch = equationText.match(/(\d+)\s*[+\-]\s*(\d+)/)
      if (eqMatch) {
        const start = parseInt(eqMatch[1])
        const delta = parseInt(eqMatch[2])
        const operation = equationText.includes('+') ? 'forward' : 'backward'
        const correctAnswer = operation === 'forward' ? start + delta : start - delta
        
        // Wait for answer buttons to be enabled
        await page.waitForSelector('button.choice:not(:disabled)', { timeout: 10000 })
        
        // Click the correct answer button
        const answerButton = page.getByRole('button', { name: String(correctAnswer) }).first()
        await answerButton.click()
        
        // Wait for next button and click it if it appears
        const nextButton = page.locator('button.next:not(:disabled)').first()
        try {
          await nextButton.waitFor({ state: 'visible', timeout: 5000 })
          await nextButton.click()
          // Wait for next problem to appear
          await page.waitForSelector('text=/Our bunny starts/i', { timeout: 5000 })
        } catch {
          // Next button may not appear on last round, which is fine
        }
        return
      }
    }
    throw new Error(`Could not parse problem: ${problemText}`)
  }

  const start = parseInt(match[1])
  const direction = match[2]
  const delta = parseInt(match[3])
  const correctAnswer = direction === 'forward' ? start + delta : start - delta

  // Wait for answer buttons to be enabled (not disabled)
  await page.waitForSelector('button.choice:not(:disabled)', { timeout: 10000 })

  // Find and click the correct answer button
  const answerButton = page.getByRole('button', { name: String(correctAnswer) }).first()
  await answerButton.click()

  // Wait for next button and click it if it appears
  const nextButton = page.locator('button.next:not(:disabled)').first()
  try {
    await nextButton.waitFor({ state: 'visible', timeout: 5000 })
    await nextButton.click()
    // Wait for next problem to appear
    await page.waitForSelector('text=/Our bunny starts/i', { timeout: 5000 })
  } catch {
    // Next button may not appear on last round, which is fine
  }
}

/**
 * Helper function to restart the game session
 */
async function restartGame(page: Page) {
  const playAgainButton = page.locator('button:has-text("Play again"), button:has-text("Play Again")').first()
  try {
    await playAgainButton.waitFor({ state: 'visible', timeout: 2000 })
    await playAgainButton.click()
    await page.waitForSelector('.number-line', { timeout: 10000 })
  } catch {
    // If no play again button, reload the page
    await page.reload()
    await page.waitForSelector('.number-line', { timeout: 10000 })
  }
}

/**
 * E2E test for playing the Number Line Adventure game
 * This test simulates playing through 3 levels
 */
test.describe('Number Line Adventure Gameplay', () => {
  test('play three levels', async ({ page }) => {
    // Navigate directly to game page (this branch uses simple GameClient on home)
    await page.goto('/')
    await expect(page).toHaveTitle(/Number Line Adventure/)
    
    // Wait for game to load - look for number line or problem
    await Promise.race([
      page.waitForSelector('.number-line', { timeout: 15000 }),
      page.waitForSelector('.equation-card', { timeout: 15000 }),
      page.waitForSelector('text=/Our bunny starts/i', { timeout: 15000 })
    ])

    // Play Level 1 (game starts automatically on home page)
    await test.step('Play Level 1', async () => {
      // Wait for game elements to appear
      await page.waitForSelector('.number-line', { timeout: 10000 })

      // Play 5 rounds
      for (let round = 1; round <= 5; round++) {
        await playRound(page)
      }

      // Wait for completion screen - look for "Way to hop!" or "Complete!" stat
      await page.waitForSelector('text=/Way to hop|Complete!|Session Complete/i', { timeout: 15000 })
    })

    // Play Level 2 - restart game for new session
    await test.step('Play Level 2', async () => {
      await restartGame(page)

      // Play 5 rounds
      for (let round = 1; round <= 5; round++) {
        await playRound(page)
      }

      // Wait for completion screen
      await page.waitForSelector('text=/Way to hop|Complete!|Session Complete/i', { timeout: 15000 })
    })

    // Play Level 3 - restart game for new session
    await test.step('Play Level 3', async () => {
      await restartGame(page)

      // Play 5 rounds
      for (let round = 1; round <= 5; round++) {
        await playRound(page)
      }

      // Wait for completion screen
      await page.waitForSelector('text=/Way to hop|Complete!|Session Complete/i', { timeout: 15000 })
    })
  })
})
