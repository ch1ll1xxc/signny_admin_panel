import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('Экспонаты', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
  })

  test('список экспонатов загружается', async ({ page }) => {
    await page.goto('/admin/exhibits')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Каталог экспонатов')).toBeVisible()
    const rows = page.locator('tbody tr')
    await expect(rows).not.toHaveCount(0)
  })

  test('создание экспоната через диалог', async ({ page }) => {
    await page.goto('/admin/exhibits')
    await page.waitForLoadState('networkidle')

    const countBefore = await page.locator('tbody tr').count()

    await page.locator('button:has-text("Создать экспонат")').click()
    await page.locator('.el-dialog input').fill('Тестовый экспонат')
    await page.locator('.el-dialog button:has-text("Создать")').click()
    await page.waitForTimeout(1000)

    const countAfter = await page.locator('tbody tr').count()
    expect(countAfter).toBeGreaterThan(countBefore)
  })

  test('клик по строке → переход в детали', async ({ page }) => {
    await page.goto('/admin/exhibits')
    await page.waitForLoadState('networkidle')
    await page.locator('tbody tr').first().click()
    await expect(page).toHaveURL(/\/admin\/exhibits\//)
  })

  test('поиск фильтрует экспонаты', async ({ page }) => {
    await page.goto('/admin/exhibits')
    await page.waitForLoadState('networkidle')

    const allCount = await page.locator('tbody tr').count()
    await page.locator('input[type="search"]').fill('стекл')
    await page.waitForTimeout(300)
    const filteredCount = await page.locator('tbody tr').count()
    expect(filteredCount).toBeLessThanOrEqual(allCount)
    expect(filteredCount).toBeGreaterThan(0)
  })
})
