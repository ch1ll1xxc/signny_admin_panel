import type { Page } from '@playwright/test'

export async function loginAs(page: Page, role: 'admin' | 'editor' | 'curator') {
  await page.goto('/admin/login')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto('/admin/login')
  await page.waitForLoadState('networkidle')

  await page.locator(`[data-testid="login-${role}"]`).click()
  await page.waitForURL('**/admin/dashboard', { timeout: 5000 })
  await page.waitForLoadState('networkidle')
}
