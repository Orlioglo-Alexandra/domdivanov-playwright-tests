
import { test, expect } from '@playwright/test';

import { LoginPage } from '../ui/pages/LoginPage';
import { ProfilePage } from '../ui/pages/ProfilePage';
import { CatalogPage } from '../ui/pages/CatalogPage';
import { ProductPage } from '../ui/pages/ProductPage';
import { CartModal } from '../ui/components/CartModal';
import { CartPage } from '../ui/pages/CartPage';
import { CheckoutPage } from '../ui/pages/CheckoutPage';
import { logger } from '../core/logger';

// Не сохраняем автоматические трассировки и скриншоты.
// Страница оформления может содержать личные данные.
test.use({
  trace: 'off',
  screenshot: 'off',
});

// Сохраняем скриншоты ошибок на безопасных страницах
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === testInfo.expectedStatus) {
    return;
  }

  const url = page.url();

  // Не сохраняем страницы личного кабинета и оформления заказа
  const containsPersonalData =
    /\/kabinet-klienta(?:[/?#]|$)/.test(url) ||
    /\/katalog\/m\/regorder(?:[/?#]|$)/.test(url);

  if (containsPersonalData) {
    logger.warn(
      'Скриншот не сохранён: страница может содержать персональные данные'
    );
    return;
  }

  // Не сохраняем скриншоты с открытой формой авторизации
  const loginFormVisible = await page.locator('#login')
    .isVisible()
    .catch(() => false);

  if (loginFormVisible) {
    logger.warn(
      'Скриншот не сохранён: открыта форма авторизации'
    );
    return;
  }

  const screenshot = await page.screenshot({
    fullPage: false,
  });

  await testInfo.attach('Скриншот при ошибке', {
    body: screenshot,
    contentType: 'image/png',
  });

  logger.info('Скриншот ошибки сохранён');
});


// Преобразование стоимости из строки в число
function parsePrice(text: string): number {
  const value = Number(text.replace(/\D/g, ''));

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Не удалось определить стоимость товара');
  }

  return value;
}

test(
  'Критический путь: выбор дивана и оформление без отправки',
  {
    tag: ['@smoke', '@regression'],
    annotation: [
      { type: 'allure.label.epic', description: 'Дом Диванов' },
      { type: 'allure.label.feature', description: 'Критический путь' },
      { type: 'allure.label.story', description: 'Оформление заказа' },
      { type: 'allure.label.parentSuite', description: 'Дом Диванов' },
      { type: 'allure.label.suite', description: 'Критический путь' },
    ],
  },
  async ({ page }) => {
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    const catalogPage = new CatalogPage(page);
    const productPage = new ProductPage(page);
    const cartModal = new CartModal(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Авторизация покупателя
    await test.step('Авторизоваться перед покупкой', async () => {
      const email = process.env.TEST_EMAIL;
      const password = process.env.TEST_PASSWORD;

      if (!email || !password) {
        throw new Error('Не заданы TEST_EMAIL или TEST_PASSWORD');
      }

      await page.goto('/katalog/divany');
      await loginPage.login(email, password);

      // Проверяем, что вход действительно выполнен
      await profilePage.open();

      await expect(
        profilePage.logoutButton.getLocator()
      ).toBeVisible();
    });

    // Подготовка корзины
    await test.step('Очистить корзину перед покупкой', async () => {
      await cartPage.clearCart();
    });

    // Шаг 1. Открытие каталога
    await test.step('Открыть каталог диванов', async () => {
      await catalogPage.open();

      await expect(
        catalogPage.heading.getLocator()
      ).toContainText('Диваны в Саратове');
    });

    // Шаг 2. Поиск товара
    await test.step('Найти диван Кант 2', async () => {
      await catalogPage.searchProduct('кант 2');

      await expect(
        catalogPage.productLink
      ).toBeVisible();
    });

    // Шаг 3. Переход в карточку товара
    await test.step('Открыть карточку найденного дивана', async () => {
      await catalogPage.openProduct();

      await expect(
        productPage.title.getLocator()
      ).toContainText('Диван-трансформер Кант 2');
    });

    // Шаг 4. Выбор ширины
    await test.step('Выбрать ширину 343 см', async () => {
      await productPage.selectWidth343();

      await expect(
        productPage.width343.getLocator()
      ).toHaveClass(/seriaActive/);
    });

    // Шаг 5. Выбор обивки
    await test.step('Выбрать обивку Velutto 01', async () => {
      await productPage.openFabricSelection();
      await productPage.selectFabricVelutto01();

      await expect(
        page.getByText('Велюр Velutto 01', { exact: true })
      ).toBeVisible();

      await expect(
        productPage.width343.getLocator()
      ).toHaveClass(/seriaActive/);
    });

    // Шаг 6. Добавление в корзину
    await test.step('Добавить диван в корзину', async () => {
      await productPage.addToCart();
      await cartModal.waitForOpen();

      await expect(
        cartModal.productInfo.getLocator()
      ).toContainText('Диван-трансформер Кант 2');

      await expect(
        cartModal.productInfo.getLocator()
      ).toContainText('Велюр Velutto 01');

      await expect(
        cartModal.quantityInput.getLocator()
      ).toHaveValue('1');
    });

    // Шаг 7. Переход к оформлению
    await test.step('Перейти к оформлению заказа', async () => {
      await cartModal.goToCheckout();
      await checkoutPage.waitForOpen();

      await expect(
        checkoutPage.heading.getLocator()
      ).toContainText('Оформление заказа');

      await expect(
        cartPage.productInfo.getLocator()
      ).toContainText('Диван-трансформер Кант 2');

      await expect(
        cartPage.productInfo.getLocator()
      ).toContainText('Велюр Velutto 01');

      await expect(
        cartPage.quantityInput.getLocator()
      ).toHaveValue('1');
    });

    // Шаг 8. Выбор получения и оплаты
    await test.step('Выбрать самовывоз и наличные', async () => {
      await checkoutPage.selectPickup();

      await expect(
        checkoutPage.deliverySelect
          .getLocator()
          .locator('option:checked')
      ).toHaveText('Самовывоз');

      await checkoutPage.selectCashPayment();

      await expect(
        checkoutPage.paymentSelect
          .getLocator()
          .locator('option:checked')
      ).toHaveText('Наличные');
    });

    // Получаем фактическую цену одного дивана
    const unitPrice = parsePrice(
      await cartPage.itemPrice.getLocator().innerText()
    );

    // Запоминаем первоначальную итоговую стоимость заказа
    const initialTotal = parsePrice(
      await checkoutPage.getTotalText()
    );

    // Проверяем стоимость одного дивана
    await expect.poll(async () => {
      return parsePrice(
        await cartPage.itemTotalPrice.getLocator().innerText()
      );
    }).toBe(unitPrice);

    // При самовывозе итоговая стоимость равна стоимости товара
    expect(initialTotal).toBe(unitPrice);

    // Шаг 9. Увеличение количества
    await test.step('Увеличить количество с 1 до 2', async () => {
      await cartPage.increaseQuantity();

      // Проверяем, что количество увеличилось до двух
      await expect(
        cartPage.quantityInput.getLocator()
      ).toHaveValue('2');

      // Проверяем стоимость двух диванов
      await expect.poll(async () => {
        return parsePrice(
          await cartPage.itemTotalPrice.getLocator().innerText()
        );
      }).toBe(unitPrice * 2);

      // Проверяем итоговую сумму заказа
      await expect.poll(async () => {
        return parsePrice(
          await checkoutPage.getTotalText()
        );
      }).toBe(initialTotal * 2);
    });

    // Шаг 10. Уменьшение количества
    await test.step('Уменьшить количество с 2 до 1', async () => {
      await cartPage.decreaseQuantity();

      // Проверяем, что количество уменьшилось до одного
      await expect(
        cartPage.quantityInput.getLocator()
      ).toHaveValue('1');

      // Проверяем восстановление стоимости одного дивана
      await expect.poll(async () => {
        return parsePrice(
          await cartPage.itemTotalPrice.getLocator().innerText()
        );
      }).toBe(unitPrice);

      // Проверяем восстановление итоговой суммы заказа
      await expect.poll(async () => {
        return parsePrice(
          await checkoutPage.getTotalText()
        );
      }).toBe(initialTotal);
    });

    // Шаг 11. Безопасное завершение
    await test.step(
      'Проверить форму без отправки заказа',
      async () => {
        await expect(
          checkoutPage.userInfoSection.getLocator()
        ).toBeVisible();

        await expect(
          checkoutPage.submitButton.getLocator()
        ).toBeVisible();

        // Финальную кнопку #SendButton НЕ нажимаем.
        logger.info(
          'Критический путь проверен без отправки заказа'
        );
      }
    );
  }
);
