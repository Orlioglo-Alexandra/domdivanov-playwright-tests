
import{ expect, type Page } from '@playwright/test';
import { BaseElement } from '../elements/BaseElement';
import { logger } from '../../core/logger';


export class CartPage {
  readonly productInfo: BaseElement;
  readonly quantityInput: BaseElement;
  readonly itemPrice: BaseElement;
  readonly itemTotalPrice: BaseElement;

  private readonly increaseButton: BaseElement;
  private readonly decreaseButton: BaseElement;

  constructor(private readonly page: Page) {
    // Информация о товаре в таблице заказа
    this.productInfo = new BaseElement(
      page,
      '#regOrder .orderItemInfo',
      'Товар в корзине'
    );

    // Текущее количество
    this.quantityInput = new BaseElement(
      page,
      '#regOrder .countItemOrder',
      'Количество диванов'
    );

    // Цена одной единицы
    this.itemPrice = new BaseElement(
      page,
      '#regOrder .orderItemPrice',
      'Цена одного дивана'
    );

    // Сумма по товару
    this.itemTotalPrice = new BaseElement(
      page,
      '#regOrder .orderItemTotalPrice',
      'Сумма по товару'
    );

    // Кнопки изменения количества
    this.increaseButton = new BaseElement(
      page,
      '#regOrder .orderItemPlus',
      'Увеличить количество'
    );

    this.decreaseButton = new BaseElement(
      page,
      '#regOrder .orderItemMinus',
      'Уменьшить количество'
    );
  }

  // Увеличение количества товара
  async increaseQuantity(): Promise<void> {
    logger.info('Увеличение количества диванов');
    await this.increaseButton.click();
  }

  // Уменьшение количества товара
  async decreaseQuantity(): Promise<void> {
    logger.info('Уменьшение количества диванов');
    await this.decreaseButton.click();
  }

  // Очистка корзины перед тестированием
  async clearCart(): Promise<void> {
    logger.info('Проверка и очистка корзины');

    await this.page.goto('/katalog/m/regorder');

    const removeButtons = this.page.locator(
      '#regOrder .delItemOrder'
    );

    const initialCount = await removeButtons.count();

    if (initialCount === 0) {
      logger.info('Корзина уже пуста');
      return;
    }

    logger.info(`Найдено товаров в корзине: ${initialCount}`);

    // Удаляем товары по одному
    while (await removeButtons.count() > 0) {
      const countBefore = await removeButtons.count();

      await removeButtons.first().click();

      // Ждём фактического удаления строки заказа
      await expect(removeButtons).toHaveCount(countBefore - 1);

      logger.info('Товар удалён из корзины');
    }

    logger.info('Корзина успешно очищена');
  }
}
