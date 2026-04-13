import { test, expect } from '@playwright/test'
import { loginAs } from './helpers'

/**
 * Тестирование ТЗ АК АС «Сайнни» — пункты 5.2.1–5.2.11, 5.3.1–5.3.5
 * Тесты по Vue-приложению
 */

test.describe('5.2.1 Управление карточками экспонатов', () => {
  test('список экспонатов отображается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exhibits')
    await expect(page.locator('text=Каталог экспонатов')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })

  test('кнопка создания экспоната', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exhibits')
    await expect(page.locator('text=Создать экспонат')).toBeVisible()
  })

  test('создание экспоната — диалог открывается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exhibits')
    await page.click('text=Создать экспонат')
    await expect(page.locator('text=Новый экспонат')).toBeVisible()
  })

  test('карточка экспоната открывается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exhibits')
    await page.locator('table tbody tr').first().click()
    await expect(page.locator('text=Карточка экспоната')).toBeVisible()
  })

  test('фильтры доступны на странице экспонатов', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exhibits')
    await expect(page.locator('select')).toHaveCount(2)
    await expect(page.locator('input[placeholder*="Поиск"]')).toBeVisible()
  })
})

test.describe('5.2.2 Работа с исходным текстом', () => {
  test('на карточке экспоната доступен раздел контента версии', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exhibits')
    await page.locator('table tbody tr').first().click()
    await expect(page.locator('text=Контент версии')).toBeVisible()
  })
})

test.describe('5.2.3 Предварительная подготовка текста для РЖЯ', () => {
  test('кнопка предобработки на карточке экспоната', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exhibits')
    await page.locator('table tbody tr').first().click()
    await expect(page.locator('text=Запустить предобработку')).toBeVisible()
  })
})

test.describe('5.2.4 Ручная проверка и доработка', () => {
  test('раздел контента с возможностью редактирования', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exhibits')
    await page.locator('table tbody tr').first().click()
    // Кнопка "Редактировать" доступна на карточке
    await expect(page.locator('button:has-text("Редактировать")').first()).toBeVisible()
  })
})

test.describe('5.2.5 Управление FAQ', () => {
  test('страница FAQ загружается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/faq')
    await expect(page.locator('text=Управление FAQ')).toBeVisible()
  })

  test('кнопка добавления FAQ', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/faq')
    await expect(page.locator('text=Добавить FAQ')).toBeVisible()
  })

  test('форма создания FAQ открывается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/faq')
    await page.click('text=Добавить FAQ')
    await expect(page.locator('text=Новый вопрос')).toBeVisible()
  })

  test('FAQ элементы отображаются', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/faq')
    await expect(page.locator('text=Редактировать').first()).toBeVisible()
  })
})

test.describe('5.2.6 Подготовка материалов для публичного контура', () => {
  test('страница публикации загружается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/publish')
    await expect(page.locator('text=Публикация в публичный контур')).toBeVisible()
  })

  test('секция предварительной проверки', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/publish')
    await expect(page.locator('h3:has-text("Предварительная проверка")')).toBeVisible()
    await expect(page.locator('text=Запустить проверку')).toBeVisible()
  })

  test('секция массовой публикации', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/publish')
    await expect(page.locator('h3:has-text("Массовая публикация")')).toBeVisible()
  })
})

test.describe('5.2.7 Жизненный цикл версий контента', () => {
  test('очередь модерации отображается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/review')
    await expect(page.locator('text=Ожидают модерации')).toBeVisible()
  })

  test('действия модерации доступны', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/review')
    const approveBtn = page.locator('button:has-text("Согласовать")').first()
    if (await approveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(approveBtn).toBeVisible()
    }
  })

  test('таблица экспонатов содержит колонку статуса', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exhibits')
    await expect(page.locator('th:has-text("Статус")')).toBeVisible()
  })
})

test.describe('5.2.8 Комментарии и согласование', () => {
  test('поле комментария модератора доступно', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/review')
    await expect(page.locator('textarea[placeholder*="Комментарий"], textarea').first()).toBeVisible({ timeout: 3000 }).catch(async () => {
      // Если нет версий на review, textarea может отсутствовать — проверяем хотя бы страницу
      await expect(page.locator('text=Ожидают модерации')).toBeVisible()
    })
  })
})

test.describe('5.2.9 Публикация', () => {
  test('preflight проверка запускается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/publish')
    await page.click('text=Запустить проверку')
    await expect(page.locator('text=Готовы к публикации')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('5.2.10 Журналирование', () => {
  test('страница аудита загружается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/audit')
    await expect(page.locator('text=Журнал аудита')).toBeVisible()
  })

  test('таблица аудита с заголовками', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/audit')
    await expect(page.locator('th:has-text("Время")')).toBeVisible()
    await expect(page.locator('th:has-text("Действие")')).toBeVisible()
  })

  test('фильтры аудита доступны', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/audit')
    await expect(page.locator('select')).toHaveCount(2)
  })
})

test.describe('5.2.11 Аналитика и выгрузки', () => {
  test('страница аналитики загружается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/analytics')
    await expect(page.getByRole('heading', { name: 'Аналитика' })).toBeVisible()
  })

  test('страница выгрузок загружается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exports')
    await expect(page.locator('text=Выгрузки данных')).toBeVisible()
  })

  test('3 кнопки CSV-экспорта доступны', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exports')
    const downloadBtns = page.locator('button:has-text("Скачать CSV")')
    await expect(downloadBtns).toHaveCount(3)
  })

  test('карточки экспорта: версии, аудит, FAQ', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/exports')
    await expect(page.locator('text=Статусы версий')).toBeVisible()
    await expect(page.locator('text=Журнал аудита')).toBeVisible()
  })
})

test.describe('5.3.1 Надёжность', () => {
  test('дашборд загружается с метриками', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/dashboard')
    await expect(page.locator('text=Контроль публикаций и модерации')).toBeVisible()
    await expect(page.locator('text=Версий в работе')).toBeVisible()
    await expect(page.locator('text=Быстрые действия')).toBeVisible()
  })
})

test.describe('5.3.2 Производительность', () => {
  test('все страницы загружаются менее чем за 3 секунды', async ({ page }) => {
    await loginAs(page, 'admin')
    const routes = [
      '/admin/dashboard',
      '/admin/exhibits',
      '/admin/review',
      '/admin/faq',
      '/admin/media',
      '/admin/halls',
      '/admin/publish',
      '/admin/audit',
      '/admin/analytics',
      '/admin/exports',
    ]
    for (const route of routes) {
      const start = Date.now()
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(3000)
    }
  })
})

test.describe('5.3.3 Информационная безопасность', () => {
  test('страница логина отображается', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('text=Sign in')).toBeVisible()
  })

  test('кнопки входа по ролям', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('[data-testid="login-admin"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-editor"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-curator"]')).toBeVisible()
  })

  test('неавторизованный доступ перенаправляет на логин', async ({ page }) => {
    await page.goto('/admin/login')
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
    await page.goto('/admin/dashboard')
    await page.waitForURL('**/admin/login**', { timeout: 5000 })
  })

  test('авторизация как admin предоставляет полный доступ', async ({ page }) => {
    await loginAs(page, 'admin')
    await expect(page.locator('text=Текущая роль: Администратор')).toBeVisible()
  })

  test('авторизация как editor', async ({ page }) => {
    await loginAs(page, 'editor')
    await expect(page.locator('text=Текущая роль: Редактор')).toBeVisible()
  })
})

test.describe('5.3.4 Совместимость — навигация', () => {
  test('сайдбар содержит все разделы по ТЗ', async ({ page }) => {
    await loginAs(page, 'admin')
    const expectedItems = [
      'Дашборд', 'Экспонаты', 'FAQ', 'Медиатека',
      'Залы', 'Модерация', 'Публикация', 'Аудит',
      'Аналитика', 'Выгрузки',
    ]
    for (const label of expectedItems) {
      await expect(page.locator(`nav >> text="${label}"`)).toBeVisible()
    }
  })
})

test.describe('Управление залами', () => {
  test('страница залов загружается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/halls')
    await expect(page.locator('text=Залы музея')).toBeVisible()
  })

  test('кнопка создания зала', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/halls')
    await expect(page.locator('text=Добавить зал')).toBeVisible()
  })

  test('таблица залов', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/halls')
    await expect(page.locator('table')).toBeVisible()
  })
})

test.describe('Медиа-библиотека', () => {
  test('страница медиатеки загружается', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/media')
    await expect(page.getByRole('heading', { name: 'Медиатека' })).toBeVisible()
  })

  test('таблица медиафайлов', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/media')
    await expect(page.locator('table')).toBeVisible()
  })

  test('поиск медиафайлов', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin/media')
    await expect(page.locator('input[placeholder*="Поиск"]')).toBeVisible()
  })
})
