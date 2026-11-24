
import { test, expect } from '@playwright/test';

import { LoginPage } from '../ui/pages/LoginPage';
import { negativeLoginCases } from '../test-data/loginCases';
import { logger } from '../core/logger';

// Не сохраняем автоматические трассировки и скриншоты
// с действительными учётными данными.
test.use({
  trace: 'off',
  screenshot: 'off',
});

// При ошибке сохраняем скриншот со скрытыми полями.
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === testInfo.expectedStatus) {
    return;
  }

  // Не сохраняем личные данные при неожиданной авторизации
  const isProfilePage =
    /\/kabinet-klienta\/userinfo(?:[/?#]|$)/.test(page.url());

  const hasLogoutButton = await page
    .locator('#exit-tab')
    .count()
    .catch(() => 0);

  if (isProfilePage || hasLogoutButton > 0) {
    const reason =
      'Скриншот не сохранён: возможно отображение ' +
      'персональных данных авторизованного пользователя';

    logger.warn(reason);

    await testInfo.attach('Причина отсутствия скриншота', {
      body: reason,
      contentType: 'text/plain',
    });

    return;
  }

  try {
    const screenshot = await page.screenshot({
      fullPage: false,
      animations: 'disabled',
      mask: [
        page.locator('input, textarea'),
      ],
      maskColor: '#666666',
    });


    await testInfo.attach('Скриншот ошибки', {
      body: screenshot,
      contentType: 'image/png',
    });
  } catch (error) {
  const reason =
    error instanceof Error
      ? error.name
      : 'Неизвестная ошибка';

  logger.warn(`Не удалось сохранить скриншот: ${reason}`);

  await testInfo.attach('Причина отсутствия скриншота', {
    body: `Ошибка создания скриншота: ${reason}`,
    contentType: 'text/plain',
  });
}
});

// Группировка негативных сценариев в Allure
test.describe(
  'Негативная авторизация',
  {
    tag: '@regression',
    annotation: [
      { type: 'allure.label.epic', description: 'Дом Диванов' },
      { type: 'allure.label.feature', description: 'Авторизация' },
      { type: 'allure.label.story', description: 'Негативные сценарии' },
      { type: 'allure.label.parentSuite', description: 'Дом Диванов' },
      { type: 'allure.label.suite', description: 'Авторизация' },
      { type: 'allure.label.subSuite', description: 'Негативные сценарии' },
    ],
  },
  () => {
    for (const testCase of negativeLoginCases) {
      test(`${testCase.id}: ${testCase.title}`, async ({ page }) => {
        const validEmail = process.env.TEST_EMAIL;
        const validPassword = process.env.TEST_PASSWORD;

        if (!validEmail || !validPassword) {
          throw new Error('Не заданы TEST_EMAIL или TEST_PASSWORD');
        }

        // Подбор тестовых данных по классу ошибки
        const email =
          testCase.emailVariant === 'empty'
            ? ''
            : testCase.emailVariant === 'invalidFormat'
              ? 'testexample.com'
              : testCase.emailVariant === 'unregistered'
                ? 'unknown-user-2026@example.com'
                : validEmail;

        const password =
          testCase.passwordVariant === 'empty'
            ? ''
            : testCase.passwordVariant === 'incorrect'
              ? 'WrongPass123!'
              : validPassword;

        // Неверный пароль должен отличаться от действительного
        if (
          testCase.passwordVariant === 'incorrect' &&
          password === validPassword
        ) {
          throw new Error(
            'Неверный тестовый пароль совпадает с действительным'
          );
        }

        const loginPage = new LoginPage(page);

        // Шаг 1. Открытие формы авторизации
        await test.step('Открыть форму авторизации', async () => {
          await page.goto('/katalog/divany');
          await loginPage.openForm();
        });

        // Шаг 2. Ввод тестовых данных
        await test.step('Ввести тестовые данные', async () => {
          await loginPage.fillCredentials(email, password);
        });

        // Шаг 3. Отправка формы
        await test.step(
          'Отправить форму с некорректными данными',
          async () => {
            await Promise.all([
              page.waitForEvent('framenavigated', {
                predicate: frame => frame === page.mainFrame(),
                timeout: 15000,
              }),
              loginPage.submitNegative(),
            ]);

            await expect(
              page.locator('.fancybox-overlay')
            ).toBeHidden();
          }
        );

        // Шаг 4. Проверка отсутствия авторизованной сессии
        await test.step(
          'Проверить отсутствие авторизованной сессии',
          async () => {
            await page.locator(
              'a[href="/kabinet-klienta"]' +
              '[aria-label="Личный кабинет"]'
            ).click();

            // Сайт может показать модальное окно
            // или отдельную страницу входа.
            const loginForm = page.locator(
              '#login, h1:has-text("Вход в личный кабинет")'
            ).first();

            await expect(loginForm).toBeVisible();

            // Авторизованный профиль недоступен
            await expect(
              page.locator('#exit-tab')
            ).toHaveCount(0);

            await expect(page).not.toHaveURL(
              /\/kabinet-klienta\/userinfo(?:[/?#]|$)/
            );
          }
        );

        logger.info(
          `Проверка отказа в авторизации завершена: ${testCase.id}`
        );
      });
    }
  }
);
