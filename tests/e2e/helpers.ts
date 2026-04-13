import type { Page } from '@playwright/test'

export async function loginAs(page: Page, role: 'admin' | 'editor' | 'curator') {
  // Переходим на login и ждём полной загрузки
  await page.goto('/admin/login', { waitUntil: 'networkidle' })

  // Чистим storage (страница уже загружена, localStorage доступен)
  await page.evaluate(() => {
    try { localStorage.clear() } catch {}
    try { sessionStorage.clear() } catch {}
  })

  // Перезагружаем login после очистки
  await page.goto('/admin/login', { waitUntil: 'networkidle' })

  await page.locator(`[data-testid="login-${role}"]`).click()
  await page.waitForURL('**/admin/dashboard', { timeout: 5000 })
  await page.waitForLoadState('networkidle')
}
