import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('Публикация', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/publish')
    await page.waitForLoadState('networkidle')
  })

  test('страница загружается', async ({ page }) => {
    await expect(page.locator('text=Публикация в публичный контур')).toBeVisible()
    await expect(page.locator('button:has-text("Запустить проверку")')).toBeVisible()
  })

  test('preflight проверка показывает результаты', async ({ page }) => {
    await page.locator('button:has-text("Запустить проверку")').click()
    await page.waitForTimeout(500)
    await expect(page.locator('text=Готовы к публикации')).toBeVisible()
  })
})
