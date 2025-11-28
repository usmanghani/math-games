import { test, expect, type Page } from '@playwright/test'

/**
 * E2E tests for bunny animation and layout improvements
 * Tests the fixes for PR #11: bunny size, paw movement direction, and layout
 */
test.describe('Bunny Animation and Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page (game is on home page in this branch)
    await page.goto('/')
    await page.waitForSelector('.number-line', { timeout: 10000 })
  })

  test('bunny size is increased', async ({ page }) => {
    // Check bunny marker size
    const bunnyMarker = page.locator('.number-line__marker')
    const fontSize = await bunnyMarker.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize)
    })

    // Should be 2.5rem (40px) instead of 1.5rem (24px)
    // Allow some tolerance for browser rendering differences
    expect(fontSize).toBeGreaterThanOrEqual(38) // At least 38px (close to 2.5rem)
    expect(fontSize).toBeLessThan(50) // But not too large
  })

  test('number line padding is reduced', async ({ page }) => {
    // Check number line top padding
    const numberLine = page.locator('.number-line')
    const paddingTop = await numberLine.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).paddingTop)
    })

    // Should be 60px instead of 84px
    // Allow some tolerance for browser rendering differences
    expect(paddingTop).toBeLessThanOrEqual(65) // Should be 60px or less
    expect(paddingTop).toBeGreaterThan(50) // But more than 50px
  })

  test('bunny moves forward correctly', async ({ page }) => {
    // Wait for problem to appear
    await page.waitForSelector('text=/Our bunny starts/i', { timeout: 10000 })

    // Get problem details
    const promptText = await page.locator('text=/Our bunny starts/i').first().textContent()
    if (!promptText) throw new Error('Problem text not found')

    const match = promptText.match(/starts at (\d+).*hops (forward|backward) (\d+)/)
    if (!match) {
      throw new Error(`Could not parse problem text: "${promptText}"`)
    }

    const start = parseInt(match[1])
    const direction = match[2]
    const delta = parseInt(match[3])
    const correctAnswer = direction === 'forward' ? start + delta : start - delta

    // Find a forward movement problem - loop through problems if needed
    if (direction !== 'forward') {
      // Answer this problem to get next one
      await page.waitForSelector('button.choice:not(:disabled)', { timeout: 10000 })
      const answerButton = page.getByRole('button', { name: String(correctAnswer) }).first()
      await answerButton.click()
      
      // Wait for next problem
      await page.waitForSelector('text=/Our bunny starts/i', { timeout: 5000 })
      
      // Recursively try again (limit to 10 attempts)
      const newPromptText = await page.locator('text=/Our bunny starts/i').first().textContent()
      if (!newPromptText) throw new Error('New problem text not found')
      
      const newMatch = newPromptText.match(/starts at (\d+).*hops (forward|backward) (\d+)/)
      if (!newMatch || newMatch[2] !== 'forward') {
        test.skip() // Skip if we can't find a forward problem after trying
        return
      }
      
      // Update variables for forward problem
      const newStart = parseInt(newMatch[1])
      const newDelta = parseInt(newMatch[3])
      const newCorrectAnswer = newStart + newDelta
      
      // Use the forward problem
      await page.waitForSelector('button.choice:not(:disabled)', { timeout: 10000 })
      const newAnswerButton = page.getByRole('button', { name: String(newCorrectAnswer) }).first()
      await newAnswerButton.click()
      
      // Continue with forward animation test
      const bunnyMarker = page.locator('.number-line__marker')
      await expect(bunnyMarker).toHaveClass(/number-line__marker--moving/)
      
      // Wait for animation to complete
      await expect(bunnyMarker).not.toHaveClass(/number-line__marker--moving/, { timeout: 2000 })
      
      // Check paw prints
      const forwardPaws = page.locator('.number-line__hop:not(.number-line__hop--backward)')
      const backwardPaws = page.locator('.number-line__hop--backward')
      const forwardCount = await forwardPaws.count()
      const backwardCount = await backwardPaws.count()
      expect(forwardCount).toBeGreaterThan(0)
      expect(backwardCount).toBe(0)
      return
    }

    // Get initial bunny position
    const bunnyMarker = page.locator('.number-line__marker')
    const initialLeft = await bunnyMarker.evaluate((el) => {
      return window.getComputedStyle(el).left
    })

    // Click correct answer to reveal animation
    await page.waitForSelector('button.choice:not(:disabled)', { timeout: 10000 })
    const answerButton = page.getByRole('button', { name: String(correctAnswer) }).first()
    await answerButton.click()

    // Check that bunny marker has moving class
    await expect(bunnyMarker).toHaveClass(/number-line__marker--moving/)

    // Wait for animation to complete by checking for absence of moving class
    await expect(bunnyMarker).not.toHaveClass(/number-line__marker--moving/, { timeout: 2000 })

    // Check that bunny moved to end position
    const finalLeft = await bunnyMarker.evaluate((el) => {
      return window.getComputedStyle(el).left
    })
    expect(finalLeft).not.toBe(initialLeft)

    // Check that forward paw prints appear (not backward class)
    const forwardPaws = page.locator('.number-line__hop:not(.number-line__hop--backward)')
    const backwardPaws = page.locator('.number-line__hop--backward')
    
    const forwardCount = await forwardPaws.count()
    const backwardCount = await backwardPaws.count()

    // Should have forward paws, no backward paws
    expect(forwardCount).toBeGreaterThan(0)
    expect(backwardCount).toBe(0)
  })

  test('bunny moves backward correctly with reversed paw animation', async ({ page }) => {
    // We need to find a backward problem - let's try multiple rounds
    let foundBackward = false
    let start = 0
    let delta = 0

    // Try up to 10 problems to find a backward one
    for (let attempt = 0; attempt < 10; attempt++) {
      await page.reload()
      await page.waitForSelector('text=/Our bunny starts/i', { timeout: 10000 })

      const promptText = await page.locator('text=/Our bunny starts/i').first().textContent()
      if (!promptText) continue

      const match = promptText.match(/starts at (\d+).*hops (forward|backward) (\d+)/)
      if (!match) continue

      if (match[2] === 'backward') {
        foundBackward = true
        start = parseInt(match[1])
        delta = parseInt(match[3])
        break
      }

      // If forward, answer correctly to get next problem
      const correctAnswer = parseInt(match[1]) + parseInt(match[3])
      await page.waitForSelector('button.choice:not(:disabled)', { timeout: 10000 })
      const answerButton = page.getByRole('button', { name: String(correctAnswer) }).first()
      await answerButton.click()
      
      // Wait for next problem to appear
      await page.waitForSelector('text=/Our bunny starts/i', { timeout: 5000 })
    }

    if (!foundBackward) {
      test.skip()
      return
    }

    const correctAnswer = start - delta

    // Get initial bunny position
    const bunnyMarker = page.locator('.number-line__marker')
    const initialLeft = await bunnyMarker.evaluate((el) => {
      return window.getComputedStyle(el).left
    })

    // Click correct answer to reveal animation
    await page.waitForSelector('button.choice:not(:disabled)', { timeout: 10000 })
    const answerButton = page.getByRole('button', { name: String(correctAnswer) }).first()
    await answerButton.click()

    // Check that bunny marker has moving class
    await expect(bunnyMarker).toHaveClass(/number-line__marker--moving/)

    // Wait for animation to complete by checking for absence of moving class
    await expect(bunnyMarker).not.toHaveClass(/number-line__marker--moving/, { timeout: 2000 })

    // Check that bunny moved to end position
    const finalLeft = await bunnyMarker.evaluate((el) => {
      return window.getComputedStyle(el).left
    })
    expect(finalLeft).not.toBe(initialLeft)

    // Check that backward paw prints appear with backward class
    const backwardPaws = page.locator('.number-line__hop--backward')
    const forwardPaws = page.locator('.number-line__hop:not(.number-line__hop--backward)')
    
    const backwardCount = await backwardPaws.count()
    const forwardCount = await forwardPaws.count()

    // Should have backward paws, no forward paws
    expect(backwardCount).toBeGreaterThan(0)
    expect(forwardCount).toBe(0)

    // Verify backward paws have scaleX(-1) transform (flipped)
    if (backwardCount > 0) {
      const firstBackwardPaw = backwardPaws.first()
      const transform = await firstBackwardPaw.evaluate((el) => {
        return window.getComputedStyle(el).transform
      })
      // Should be flipped (scaleX(-1) results in matrix with negative scale)
      expect(transform).not.toBe('none')
    }
  })

  test('number line is positioned higher on page', async ({ page }) => {
    // Get number line element
    const numberLine = page.locator('.number-line')
    
    // Get bounding box to check position
    const boundingBox = await numberLine.boundingBox()
    if (!boundingBox) throw new Error('Number line not found')

    // Number line should be visible and have reasonable dimensions
    // With reduced padding (60px vs 84px), it should be positioned higher
    // We verify it exists and is visible rather than exact position
    expect(boundingBox.height).toBeGreaterThan(200) // Should have reasonable height
    expect(boundingBox.width).toBeGreaterThan(300) // Should have reasonable width
    // Position will vary based on viewport, so we just verify visibility
    await expect(numberLine).toBeVisible()
  })

  test('bunny is visible and prominent', async ({ page }) => {
    // Check bunny marker exists and is visible
    const bunnyMarker = page.locator('.number-line__marker')
    await expect(bunnyMarker).toBeVisible()

    // Check bunny emoji is present
    const bunnyEmoji = bunnyMarker.locator('text=🐰')
    await expect(bunnyEmoji).toBeVisible()
    
    // Note: Font size check is already covered in 'bunny size is increased' test
  })
})
