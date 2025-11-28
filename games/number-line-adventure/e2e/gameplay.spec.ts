import { test, expect } from '@playwright/test'

/**
 * Helper function to play a single round
 */
async function playRound(page: any, roundNumber: number) {
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
        
        // Wait for next button and click it
        await page.waitForSelector('button.next:not(:disabled)', { timeout: 5000 }).catch(() => {})
        await page.waitForTimeout(1000)
        const nextButton = page.locator('button.next:not(:disabled)').first()
        if (await nextButton.isVisible().catch(() => false)) {
          await nextButton.click()
          await page.waitForTimeout(1000)
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

  // Wait for feedback animation and next button to appear
  await page.waitForSelector('button.next:not(:disabled)', { timeout: 5000 }).catch(() => {
    // If next button doesn't appear, just wait a bit
  })
  await page.waitForTimeout(1000)

  // Click next button if it exists and we're not on the last round
  const nextButton = page.locator('button.next:not(:disabled)').first()
  if (await nextButton.isVisible().catch(() => false)) {
    await nextButton.click()
    await page.waitForTimeout(1000)
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
        await playRound(page, round)
      }

      // Wait for completion screen - look for "Way to hop!" or "Complete!" stat
      await page.waitForSelector('text=/Way to hop|Complete!|Session Complete/i', { timeout: 15000 })
    })

    // Play Level 2 - restart game for new session
    await test.step('Play Level 2', async () => {
      // Click "Play again" button if available, or reload page
      const playAgainButton = page.locator('button:has-text("Play again"), button:has-text("Play Again")').first()
      if (await playAgainButton.isVisible().catch(() => false)) {
        await playAgainButton.click()
        await page.waitForTimeout(1000)
      } else {
        await page.reload()
        await page.waitForSelector('.number-line', { timeout: 10000 })
      }

      // Play 5 rounds
      for (let round = 1; round <= 5; round++) {
        await playRound(page, round)
      }

      // Wait for completion screen
      await page.waitForSelector('text=/Way to hop|Complete!|Session Complete/i', { timeout: 15000 })
    })

    // Play Level 3 - restart game for new session
    await test.step('Play Level 3', async () => {
      // Click "Play again" button if available, or reload page
      const playAgainButton = page.locator('button:has-text("Play again"), button:has-text("Play Again")').first()
      if (await playAgainButton.isVisible().catch(() => false)) {
        await playAgainButton.click()
        await page.waitForTimeout(1000)
      } else {
        await page.reload()
        await page.waitForSelector('.number-line', { timeout: 10000 })
      }

      // Play 5 rounds
      for (let round = 1; round <= 5; round++) {
        await playRound(page, round)
      }

      // Wait for completion screen
      await page.waitForSelector('text=/Way to hop|Complete!|Session Complete/i', { timeout: 15000 })
    })
  })
})
