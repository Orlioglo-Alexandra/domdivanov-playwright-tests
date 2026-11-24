
import type { Page } from '@playwright/test';
import { BaseElement } from '../elements/BaseElement';
import { logger } from '../../core/logger';

export class CartModal {
  readonly confirmationPanel: BaseElement;
  readonly productInfo: BaseElement;
  readonly quantityInput: BaseElement;

  private readonly increaseButton: BaseElement;
  private readonly decreaseButton: BaseElement;
  private readonly checkoutButton: BaseElement;

  constructor(private readonly page: Page) {
    // Окно подтверждения добавления товара
    this.confirmationPanel = new BaseElement(
      page,
      '#orderBasketPanel',
      'Окно добавления товара в корзину'
    );

    // Наименование товара и выбранная обивка
    this.productInfo = new BaseElement(
      page,
      '#orderBasketPanel .orderBasketSKUInfo',
      'Информация о добавленном диване'
    );

    // Количество товара
    this.quantityInput = new BaseElement(
      page,
      '#orderBasketPanel .orderBasketItemAmount',
      'Количество товара'
    );

    // Кнопка увеличения количества
    this.increaseButton = new BaseElement(
      page,
      '#orderBasketPanel .orderBasketCountPlus',
      'Увеличить количество'
    );

    // Кнопка уменьшения количества
    this.decreaseButton = new BaseElement(
      page,
      '#orderBasketPanel .orderBasketCountMinus',
      'Уменьшить количество'
    );

    // Кнопка перехода к оформлению
    this.checkoutButton = new BaseElement(
      page,
      '#buttonBasket',
      'Оформить заказ'
    );
  }

  // Ожидание появления окна подтверждения
  async waitForOpen(): Promise<void> {
    logger.info('Ожидание окна добавления товара');
    await this.confirmationPanel.waitForVisible();
  }

  // Получение количества товара
  async getQuantity(): Promise<number> {
    await this.quantityInput.waitForVisible();

    const value =
      await this.quantityInput.getLocator().inputValue();

    return Number(value);
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

  // Переход к странице оформления заказа
  async goToCheckout(): Promise<void> {
    logger.info('Переход к оформлению заказа');

    await this.checkoutButton.click();

    await this.page.waitForURL(
      /\/katalog\/m\/regorder(?:[/?#]|$)/
    );
  }
}
