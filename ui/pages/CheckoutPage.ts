
import { expect, type Page } from '@playwright/test';
import { BaseElement } from '../elements/BaseElement';
import { logger } from '../../core/logger';

export class CheckoutPage {
  readonly heading: BaseElement;
  readonly deliverySelect: BaseElement;
  readonly paymentSelect: BaseElement;
  readonly userInfoSection: BaseElement;
  readonly totalAmount: BaseElement;
  readonly submitButton: BaseElement;

  constructor(private readonly page: Page) {
    // Заголовок страницы оформления заказа
    this.heading = new BaseElement(
      page,
      'h1',
      'Заголовок оформления заказа'
    );

    // Список способов получения
    this.deliverySelect = new BaseElement(
      page,
      '#DeliveryList',
      'Способ получения'
    );

    // Список способов оплаты
    this.paymentSelect = new BaseElement(
      page,
      '#OrderPayMethodList',
      'Способ оплаты'
    );

    // Раздел с данными покупателя
    this.userInfoSection = new BaseElement(
      page,
      '#OrderUserInfo',
      'Данные покупателя'
    );

    // Итоговая стоимость заказа
    this.totalAmount = new BaseElement(
      page,
      '#totalAmount',
      'Итоговая сумма заказа'
    );

    // Финальная кнопка отправки заказа
    this.submitButton = new BaseElement(
      page,
      '#SendButton',
      'Финальная кнопка оформления заказа'
    );
  }

  // Ожидание открытия страницы оформления
  async waitForOpen(): Promise<void> {
    logger.info('Ожидание страницы оформления заказа');

    await expect(this.page).toHaveURL(
      /\/katalog\/m\/regorder(?:[/?#]|$)/
    );

    await this.heading.waitForVisible();
    await this.deliverySelect.waitForVisible();

    logger.info('Страница оформления заказа открыта');
  }

  // Выбор самовывоза
  async selectPickup(): Promise<void> {
    logger.info('Выбор способа получения: Самовывоз');

    await this.deliverySelect
      .getLocator()
      .selectOption({ label: 'Самовывоз' });
  }

  // Выбор оплаты наличными
  async selectCashPayment(): Promise<void> {
    logger.info('Выбор способа оплаты: Наличные');

    await this.paymentSelect
      .getLocator()
      .selectOption({ label: 'Наличные' });
  }

  // Получение итоговой суммы в текстовом виде
  async getTotalText(): Promise<string> {
    logger.info('Получение итоговой суммы заказа');

    await this.totalAmount.waitForVisible();

    return (
      await this.totalAmount.getLocator().innerText()
    ).trim();
  }
}
