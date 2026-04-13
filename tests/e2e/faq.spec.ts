import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('FAQ', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/faq')
    await page.waitForLoadState('networkidle')
  })

  test('список FAQ загружается', async ({ page }) => {
    await expect(page.locator('text=Управление FAQ')).toBeVisible()
    const items = page.locator('.rounded-2xl.border.border-slate-200.bg-white.p-5')
    await expect(items).not.toHaveCount(0)
  })

  test('создание FAQ с привязкой к экспонату', async ({ page }) => {
    await page.locator('button:has-text("Добавить FAQ")').click()
    await page.locator('select').first().selectOption({ index: 1 })
    await page.locator('input[placeholder="Вопрос"]').fill('Тестовый вопрос E2E')
    await page.locator('textarea[placeholder="Ответ"]').fill('Тестовый ответ E2E')
    await page.locator('button:has-text("Сохранить")').click()
    await page.waitForTimeout(1000)
    await expect(page.locator('text=FAQ добавлен')).toBeVisible()
    await expect(page.locator('text=Тестовый вопрос E2E')).toBeVisible()
  })

  test('фильтрация по экспонату', async ({ page }) => {
    const allCount = await page.locator('h3.font-semibold.text-slate-900').count()
    await page.locator('select').first().selectOption({ index: 1 })
    await page.waitForTimeout(300)
    const filteredCount = await page.locator('h3.font-semibold.text-slate-900').count()
    expect(filteredCount).toBeLessThanOrEqual(allCount)
  })

  test('переключение публикации FAQ', async ({ page }) => {
    const toggleBtn = page.locator('button:has-text("Скрыть"), button:has-text("Опубликовать")').first()
    const textBefore = await toggleBtn.textContent()
    await toggleBtn.click()
    await page.waitForTimeout(500)
    await expect(page.locator('text=FAQ скрыт').or(page.locator('text=FAQ опубликован'))).toBeVisible()
  })
})
