
import { test, expect } from '@playwright/test';

import { LoginPage } from '../ui/pages/LoginPage';
import { ProfilePage } from '../ui/pages/ProfilePage';
import { logger } from '../core/logger';

// Не записываем автоматические трассировки и скриншоты
// во время работы с действительными учётными данными.
test.use({
  trace: 'off',
  screenshot: 'off',
});

 // Диагностика ошибок при позитивной авторизации
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === testInfo.expectedStatus) {
    return;
  }

  // Скриншот не сохраняется из-за риска раскрытия
  // персональных данных тестового аккаунта.
  const reason =
    'Скриншот не сохранён: при позитивной авторизации ' +
    'страница может содержать персональные данные ' +
    'пользователя, которые нельзя безопасно скрыть ' +
    'маскированием только полей ввода.';

  logger.warn(reason);

  await testInfo.attach(
    'Причина отсутствия скриншота',
    {
      body: reason,
      contentType: 'text/plain',
    }
  );
});


test(
  'ТК-A-01: Успешная авторизация по email и паролю',
  {
    tag: ['@smoke', '@regression'],
    annotation: [
      { type: 'allure.label.epic', description: 'Дом Диванов' },
      { type: 'allure.label.feature', description: 'Авторизация' },
      { type: 'allure.label.story', description: 'Позитивные сценарии' },
      { type: 'allure.label.parentSuite', description: 'Дом Диванов' },
      { type: 'allure.label.suite', description: 'Авторизация' },
      { type: 'allure.label.subSuite', description: 'Позитивные сценарии' },
    ],
  },
  async ({ page }) => {
    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;

    if (!email || !password) {
      throw new Error('Не заданы TEST_EMAIL или TEST_PASSWORD в .env');
    }

    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);

    await test.step('Открыть каталог диванов', async () => {
      await page.goto('/katalog/divany');
    });

    await test.step('Выполнить авторизацию', async () => {
      await loginPage.login(email, password);
    });

    await test.step('Открыть личный кабинет', async () => {
      await profilePage.open();

      await expect(page).toHaveURL(
        /\/kabinet-klienta\/userinfo(?:[/?#]|$)/
      );
    });

    await test.step('Проверить авторизованную сессию', async () => {
      await expect(
        profilePage.logoutButton.getLocator()
      ).toBeVisible();

      const actualEmail = await profilePage.getUserEmail();

      expect(
        actualEmail === email,
        'Email в кабинете соответствует тестовому аккаунту'
      ).toBe(true);
    });

    logger.info('Успешная авторизация подтверждена');
  }
);
