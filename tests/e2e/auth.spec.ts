import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('Авторизация', () => {
  test('логин как админ → редирект на дашборд', async ({ page }) => {
    await loginAs(page, 'admin')
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    // Header badge shows role
    await expect(page.locator('header span.rounded-full')).toContainText('Администратор')
  })

  test('логин как редактор → роль отображается', async ({ page }) => {
    await loginAs(page, 'editor')
    await expect(page.locator('header span.rounded-full')).toContainText('Редактор')
  })

  test('логин как куратор → роль отображается', async ({ page }) => {
    await loginAs(page, 'curator')
    await expect(page.locator('header span.rounded-full')).toContainText('Куратор')
  })

  test('logout → возврат на логин', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.locator('button:has-text("Выйти")').click()
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('без авторизации → редирект на логин', async ({ page }) => {
    await page.goto('/admin/login')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
