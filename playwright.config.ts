
import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Каталог с автотестами
  testDir: './autotest',

  // Максимальная продолжительность одного теста
  timeout: 60000,

  // Время ожидания выполнения проверок
  expect: {
    timeout: 10000,
  },

  // Последовательное выполнение тестов
  fullyParallel: false,
  workers: 1,

  // Защита от случайно оставленного test.only
  forbidOnly: !!process.env.CI,

  // Повторные попытки только в CI
  retries: process.env.CI ? 2 : 0,

  // Формирование HTML-отчёта и Allure
  reporter: [
    ['html'],
    [
      'allure-playwright',
      {
        detail: false,
        suiteTitle: false,
      },
    ],
  ],

  // Общие настройки браузеров
  use: {
    // Адрес тестируемого интернет-магазина
    baseURL:
      process.env.BASE_URL ?? 'https://domdivanov64.ru',

    // Максимальное время ожидания действия
    actionTimeout: 15000,

    // Максимальное время ожидания перехода
    navigationTimeout: 30000,

    // Безопасные вложения создаются в обработчиках тестов
    screenshot: 'off',
    trace: 'off',
  },

  // Браузеры для выполнения автотестов
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
  ],
});
