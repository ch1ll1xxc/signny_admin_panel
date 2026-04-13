import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx vite --port 5173 --host 0.0.0.0',
    port: 5173,
    reuseExistingServer: true,
    timeout: 15000,
  },
})
