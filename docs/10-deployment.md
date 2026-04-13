# Инструкция по развёртыванию и настройке АК АС «Сайнни»

## 1. Требования к окружению

| Компонент | Минимальная версия |
|-----------|-------------------|
| Node.js | 18.x |
| npm | 9.x |
| Браузер | Chrome 100+, Firefox 100+, Safari 16+ |

## 2. Установка

```bash
# Клонирование репозитория
git clone <repository-url> signny-admin
cd signny-admin

# Установка зависимостей
npm install

# Установка Playwright (для тестов)
npx playwright install chromium
```

## 3. Конфигурация

Создайте файл `.env` в корне проекта (или скопируйте `.env.example`):

```env
# URL бэкенда административного API
VITE_ADMIN_API_URL=http://localhost:4100

# Использовать mock API (true — локальные данные, false — реальный бэкенд)
VITE_USE_MOCK_API=true

# URL публичного контура (для синхронизации)
VITE_PUBLIC_CONTOUR_API_BASE_URL=http://localhost:3000

# Ключ синхронизации (опционально)
VITE_PUBLIC_CONTOUR_SYNC_KEY=
```

## 4. Запуск в режиме разработки

```bash
npm run dev
# Приложение доступно по адресу http://localhost:5173
```

## 5. Сборка для продакшена

```bash
npm run build
# Результат в директории dist/

# Предпросмотр сборки
npm run preview
```

## 6. Развёртывание

Директория `dist/` содержит статические файлы SPA. Варианты развёртывания:

### Nginx
```nginx
server {
    listen 80;
    root /var/www/signny-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Docker
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

## 7. Запуск тестов

```bash
# e2e-тесты (поднимает dev-сервер автоматически)
npx playwright test

# Только тесты по ТЗ
npx playwright test tests/e2e/tt-requirements.spec.ts

# Unit-тесты
npx vitest run
```

## 8. Переключение на реальный бэкенд

1. Установите `VITE_USE_MOCK_API=false` в `.env`
2. Укажите корректный `VITE_ADMIN_API_URL`
3. Убедитесь, что бэкенд реализует API по спецификации `docs/07-api-reference.md`
4. Перезапустите dev-сервер или пересоберите

## 9. Известные ограничения

- Mock API хранит данные в localStorage браузера (теряются при очистке)
- QR-коды генерируются на клиенте (библиотека qrcode)
- Аватарные привязки хранятся в localStorage (не синхронизируются с бэкендом)
- Загрузка медиа-файлов симулируется (файлы не сохраняются на сервер)
