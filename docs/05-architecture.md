# Описание архитектуры административного контура АС «Сайнни»

## 1. Общая архитектура

Административный контур реализован как одностраничное веб-приложение (SPA) на стеке:

| Компонент | Технология | Версия |
|-----------|-----------|--------|
| Фреймворк | Vue 3 (Composition API) | 3.x |
| Сборщик | Vite | 5.x |
| Язык | TypeScript | 5.x |
| Состояние | Pinia | 2.x |
| Маршрутизация | Vue Router 4 | 4.x |
| UI-библиотека | Element Plus | 2.x |
| Стилизация | Tailwind CSS | 4.x |
| Тестирование | Playwright (e2e), Vitest (unit) | — |

## 2. Структура каталогов

```
src/
├── main.ts                          # Точка входа приложения
├── api/
│   ├── workflowApi.ts               # Адаптер API (реальный/mock)
│   ├── mockWorkflowApi.ts           # In-memory mock с localStorage
│   └── publicSyncApi.ts             # Интеграция с публичным контуром
├── app/
│   ├── router/index.ts              # Vue Router — маршруты и guards
│   ├── store/modules/
│   │   ├── auth.ts                  # Pinia-стор авторизации
│   │   └── workflow.ts              # Pinia-стор workflow
│   ├── composables/                 # Vue Composition API хуки
│   │   ├── useAuth.ts               # Авторизация и сессия
│   │   ├── usePermissions.ts        # Проверка прав
│   │   ├── useExhibitsCatalog.ts    # Каталог экспонатов
│   │   ├── useReviewWorkflow.ts     # Процесс согласования
│   │   ├── useHallsManager.ts       # Управление залами
│   │   ├── useMediaLibrary.ts       # Медиа-файлы
│   │   ├── useAuditJournal.ts       # Журнал аудита
│   │   ├── useAdminAnalytics.ts     # Аналитика
│   │   ├── usePublicationSync.ts    # Синхронизация публикации
│   │   ├── useDashboardSync.ts      # Синхронизация дашборда
│   │   └── useNotify.ts             # Уведомления (toast)
│   ├── domain/
│   │   ├── auth.ts                  # Доменные типы авторизации
│   │   ├── catalog.ts               # Типы каталога
│   │   └── workflow.ts              # Типы workflow
│   ├── shared/
│   │   ├── auth/session.ts          # Управление сессией (localStorage)
│   │   ├── auth/permissions.ts      # Матрица прав по ролям
│   │   └── integration/             # Интеграция с публичным контуром
│   ├── pages/admin/                 # Vue-страницы (13 страниц)
│   └── components/
│       ├── layout/AdminLayout.vue   # Основной layout (сайдбар, хедер)
│       └── ui/                      # Переиспользуемые UI-компоненты
├── types/
│   └── workflow.ts                  # TypeScript-типы API
└── styles/                          # Глобальные стили
```

## 3. Архитектурные решения

### 3.1 Адаптер API (workflowApi)
Используется паттерн адаптера: `workflowApi.ts` определяет единый интерфейс, который маршрутизирует вызовы в реальный HTTP-бэкенд или in-memory mock в зависимости от `VITE_USE_MOCK_API`.

```
workflowApi.ts → VITE_USE_MOCK_API=true  → mockWorkflowApi.ts (localStorage)
               → VITE_USE_MOCK_API=false → HTTP fetch к VITE_ADMIN_API_URL
```

### 3.2 Авторизация и роли
- Роли: `admin`, `editor`, `curator`, `analyst`
- 12 разрешений (exhibits.read/write, media.*, halls.*, audit.*, faq.*, publish.*, exports.*)
- Матрица прав в `shared/auth/permissions.ts`
- Navigation guard в роутере проверяет `requiresAuth` и `requiredPermission`
- Сессия хранится в localStorage с JWT-подобным токеном

### 3.3 Workflow (машина состояний версий)
```
draft → on_review → approved → published → archived
                  ↘ needs_revision → draft
```
Переходы контролируются ролями: editor может submit_for_review, curator может approve/request_revision, admin может publish/archive.

### 3.4 Интеллектуальный модуль
Модуль предобработки текста для РЖЯ реализован как job-задача типа `preprocess`. При выполнении:
1. Исходный русский текст упрощается функцией `simplifyTextForRsl()`
2. Результат сохраняется в поле `adaptedText` версии
3. Версия получает статус `draft` для последующей ручной доработки

### 3.5 Публикация и синхронизация
- Preflight-проверки подсчитывают версии по статусам
- Массовая публикация переводит все `approved` версии в `published`
- Синхронизация отправляет snapshot в публичный контур через POST `/api/integration/sync`
- Публикация без остановки публичного контура (атомарная замена данных)

## 4. Схема взаимодействия компонентов

```
[Браузер]
    ↓
[Vue Router + Auth Guard]
    ↓
[Vue Page Component]
    ↓
[Composable / Pinia Store]
    ↓
[workflowApi adapter]
    ↓                    ↓
[HTTP → Backend]   [mockWorkflowApi → localStorage]
    ↓
[Public Contour API]
```
