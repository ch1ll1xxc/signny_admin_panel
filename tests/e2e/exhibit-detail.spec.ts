import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

test.describe('Детали экспоната', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exhibits')
    await page.waitForLoadState('networkidle')
    await page.locator('tbody tr').first().click()
    await page.waitForURL(/\/admin\/exhibits\//)
    await page.waitForLoadState('networkidle')
  })

  test('карточка загружается с данными', async ({ page }) => {
    await expect(page.locator('text=Карточка экспоната')).toBeVisible()
    await expect(page.locator('text=Контент версии')).toBeVisible()
    await expect(page.locator('text=Действия по версии')).toBeVisible()
  })

  test('редактирование карточки экспоната', async ({ page }) => {
    await page.locator('button:has-text("Редактировать")').first().click()
    const titleInput = page.locator('input').first()
    await titleInput.fill('Обновлённое название')
    await page.locator('button:has-text("Сохранить")').first().click()
    await page.waitForTimeout(500)
    await expect(page.locator('text=Карточка сохранена')).toBeVisible()
  })

  test('добавление комментария', async ({ page }) => {
    await page.locator('textarea[placeholder*="Комментарий"]').fill('Тестовый комментарий')
    await page.locator('button:has-text("Добавить комментарий")').click()
    await page.waitForTimeout(500)
    await expect(page.locator('text=Тестовый комментарий')).toBeVisible()
  })

  test('навигация назад к списку', async ({ page }) => {
    await page.locator('text=← Назад к списку').click()
    await expect(page).toHaveURL(/\/admin\/exhibits$/)
  })
})
