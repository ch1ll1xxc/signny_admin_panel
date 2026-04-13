import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('RBAC — разграничение прав', () => {
  test('editor не видит аудит', async ({ page }) => {
    await loginAs(page, 'editor')
    const nav = page.locator('nav')
    await expect(nav.locator('text=Аудит')).not.toBeVisible()
  })

  test('editor не видит публикацию', async ({ page }) => {
    await loginAs(page, 'editor')
    const nav = page.locator('nav')
    await expect(nav.locator('text=Публикация')).not.toBeVisible()
  })

  test('editor видит экспонаты и FAQ', async ({ page }) => {
    await loginAs(page, 'editor')
    const nav = page.locator('nav')
    await expect(nav.locator('text=Экспонаты')).toBeVisible()
    await expect(nav.locator('text=FAQ')).toBeVisible()
  })

  test('curator не видит публикацию', async ({ page }) => {
    await loginAs(page, 'curator')
    const nav = page.locator('nav')
    await expect(nav.locator('text=Публикация')).not.toBeVisible()
  })

  test('curator видит выгрузки', async ({ page }) => {
    await loginAs(page, 'curator')
    const nav = page.locator('nav')
    await expect(nav.locator('text=Выгрузки')).toBeVisible()
  })

  test('admin видит все пункты навигации', async ({ page }) => {
    await loginAs(page, 'admin')
    const nav = page.locator('nav')
    for (const label of ['Дашборд', 'Экспонаты', 'FAQ', 'Модерация', 'Публикация', 'Аудит', 'Аналитика', 'Выгрузки']) {
      await expect(nav.locator(`text=${label}`)).toBeVisible()
    }
  })

  test('editor → /admin/audit редиректит на forbidden', async ({ page }) => {
    await loginAs(page, 'editor')
    await page.goto('/admin/audit')
    await expect(page).toHaveURL(/\/admin\/forbidden/)
  })
})
