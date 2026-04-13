# Описание API и форматов обмена АК АС «Сайнни»

## 1. Конфигурация

| Переменная | Назначение | По умолчанию |
|-----------|-----------|-------------|
| `VITE_ADMIN_API_URL` | Базовый URL бэкенда | `http://localhost:4100` |
| `VITE_USE_MOCK_API` | Использовать mock API | `true` |
| `VITE_PUBLIC_CONTOUR_API_BASE_URL` | URL публичного контура | `http://localhost:3000` |

Все эндпоинты имеют префикс `/api/v1`.
Авторизация: `Authorization: Bearer <role>`.

## 2. Экспонаты

### GET /api/v1/exhibits
Список всех экспонатов.
**Ответ:** `ExhibitListItem[]`

### POST /api/v1/exhibits
Создание экспоната.
**Тело:** `{ title: string, owner: string }`
**Ответ:** `Exhibit`

### GET /api/v1/exhibits/:id
Детали экспоната.
**Ответ:** `Exhibit`

### PATCH /api/v1/exhibits/:id
Обновление экспоната.
**Тело:** `{ title?, summary?, description?, imageUrl? }`
**Ответ:** `Exhibit`

## 3. Версии контента

### GET /api/v1/exhibits/:id/versions
Список версий экспоната (от новой к старой).
**Ответ:** `Version[]`

### PATCH /api/v1/versions/:id
Обновление контента версии.
**Тело:** `{ sourceText?, adaptedText? }`
**Ответ:** `Version`
**Ограничение:** только для статусов `draft` и `needs_revision`.

### POST /api/v1/versions/:id/transition
Переход версии между статусами.
**Тело:** `{ action: WorkflowAction, message?: string }`
**Ответ:** `Version`
**Ошибки:** 409 Conflict при недопустимом переходе, 403 при недостаточных правах.

### POST /api/v1/versions/:id/jobs
Запуск асинхронной задачи.
**Тело:** `{ type: "preprocess" | "publish" | "export" }`
**Ответ:** `WorkflowJob`

## 4. Комментарии

### GET /api/v1/versions/:id/comments
Комментарии к версии.
**Ответ:** `ReviewComment[]`

### POST /api/v1/versions/:id/comments
Добавление комментария.
**Тело:** `{ message: string }`
**Ответ:** `ReviewComment`

## 5. FAQ

### GET /api/v1/faq
Список всех FAQ.
**Ответ:** `AdminFaqItem[]`

### POST /api/v1/faq
Создание FAQ.
**Тело:** `{ exhibitId, question, answer, videoUrl?, subtitles? }`
**Ответ:** `AdminFaqItem`

### PATCH /api/v1/faq/:id
Обновление FAQ.
**Тело:** `{ question?, answer?, videoUrl?, subtitles?, isPublished? }`
**Ответ:** `AdminFaqItem`

### POST /api/v1/faq/:id/delete
Удаление FAQ (только admin).

## 6. Публикация

### POST /api/v1/publish/preflight
Предварительная проверка.
**Ответ:** `{ approved: number, onReview: number, draft: number }`

### POST /api/v1/publish/approved
Массовая публикация согласованных версий + синхронизация с публичным контуром.
**Ответ:** `{ publishedCount: number, syncStatus: "ok"|"failed", syncMessage: string }`

## 7. Аудит

### GET /api/v1/audit
Журнал действий.
**Ответ:** `AuditEvent[]`

## 8. Медиа

### GET /api/v1/media
Список медиа-файлов.
**Ответ:** `MediaAsset[]`

### POST /api/v1/media/upload
Загрузка медиа-файла.
**Тело:** `{ fileName, mimeType, url? }`
**Ответ:** `MediaAsset`

## 9. QR-коды

### GET /api/v1/qr
Список QR-кодов.
**Ответ:** `QrCodeEntry[]`

### POST /api/v1/qr/generate
Генерация QR-кода для экспоната.
**Тело:** `{ exhibitId: string }`
**Ответ:** `QrCodeEntry`

## 10. Интеграция с публичным контуром

### GET /api/integration/public-state
Состояние публичного контура (количества опубликованных сущностей).

### POST /api/integration/sync
Синхронизация данных в публичный контур.
**Заголовок:** `X-Admin-Sync-Key` (если настроен).
**Тело:** `PublicSyncPayload { exhibits, faqItems, contentVersions }`

## 11. Коды ошибок

| HTTP | Код | Описание |
|------|-----|----------|
| 401 | `unauthorized` | Не авторизован |
| 403 | `forbidden` | Недостаточно прав |
| 409 | `conflict` | Конфликт (недопустимый переход статуса) |
| 500 | `unknown_error` | Внутренняя ошибка |
