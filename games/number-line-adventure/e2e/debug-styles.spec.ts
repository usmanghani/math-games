import { test, expect } from '@playwright/test'

/**
 * Debug test to check actual CSS values being rendered
 */
test('debug CSS values', async ({ page }) => {
  await page.goto('/game?level=1')
  await page.waitForSelector('.number-line', { timeout: 10000 })

  const numberLine = page.locator('.number-line')
  const bunnyMarker = page.locator('.number-line__marker')

  // Get all computed styles
  const numberLineStyles = await numberLine.evaluate((el) => {
    const styles = window.getComputedStyle(el)
    return {
      paddingTop: styles.paddingTop,
      paddingBottom: styles.paddingBottom,
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight,
    }
  })

  const bunnyStyles = await bunnyMarker.evaluate((el) => {
    const styles = window.getComputedStyle(el)
    return {
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
    }
  })

  console.log('Number Line Padding:', numberLineStyles)
  console.log('Bunny Marker Font Size:', bunnyStyles)

  // Check if CSS file is loaded
  const cssHref = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    return links.map((link: any) => link.href).filter((href: string) => href.includes('NumberLine'))
  })

  console.log('CSS Files:', cssHref)
})
