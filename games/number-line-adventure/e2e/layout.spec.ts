import { test, expect } from '@playwright/test'

/**
 * E2E tests for layout improvements
 * Tests the visual layout changes from PR #11
 */
test.describe('Layout Improvements', () => {
  test('number line has reduced top padding', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.number-line', { timeout: 10000 })

    const numberLine = page.locator('.number-line')
    const paddingTop = await numberLine.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).paddingTop)
    })

    // Should be 60px (reduced from 84px)
    // Allow tolerance for browser rendering
    expect(paddingTop).toBeLessThanOrEqual(65) // Should be 60px or less
    expect(paddingTop).toBeGreaterThan(50) // But more than 50px
  })

  test('number line legend is properly positioned', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.number-line__legend', { timeout: 10000 })

    const legend = page.locator('.number-line__legend')
    await expect(legend).toBeVisible()

    // Legend should be at top of number line
    const legendBox = await legend.boundingBox()
    const numberLineBox = await page.locator('.number-line').boundingBox()
    
    if (legendBox && numberLineBox) {
      // Legend should be near the top of the number line
      expect(legendBox.y).toBeLessThan(numberLineBox.y + 100)
    }
  })

  test('bunny marker is positioned correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.number-line__marker', { timeout: 10000 })

    const bunnyMarker = page.locator('.number-line__marker')
    await expect(bunnyMarker).toBeVisible()

    // Bunny should be at bottom of number line
    const markerBox = await bunnyMarker.boundingBox()
    const numberLineBox = await page.locator('.number-line').boundingBox()
    
    if (markerBox && numberLineBox) {
      // Bunny should be near bottom (within 50px)
      const distanceFromBottom = (numberLineBox.y + numberLineBox.height) - (markerBox.y + markerBox.height)
      expect(distanceFromBottom).toBeLessThan(50)
    }
  })

  test('number line is visible and properly sized', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.number-line', { timeout: 10000 })

    const numberLine = page.locator('.number-line')
    await expect(numberLine).toBeVisible()

    const boundingBox = await numberLine.boundingBox()
    if (boundingBox) {
      // Should have reasonable dimensions
      expect(boundingBox.width).toBeGreaterThan(300)
      expect(boundingBox.height).toBeGreaterThan(200)
    }
  })
})
