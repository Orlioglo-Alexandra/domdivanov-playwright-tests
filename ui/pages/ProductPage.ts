
import { BaseElement } from '../elements/BaseElement';
import { logger } from '../../core/logger';
import { expect, type Page } from '@playwright/test';

export class ProductPage {
  readonly title: BaseElement;
  readonly width343: BaseElement;
  readonly changeFabricButton: BaseElement;
  readonly addToCartButton: BaseElement;

  constructor(private readonly page: Page) {
    // Название дивана
    this.title = new BaseElement(
      page,
      'h1',
      'Название дивана'
    );

    // Вариант ширины 343 см
    this.width343 = new BaseElement(
      page,
      '.inventProps[aria-labelledby="v242"] label[data-id="343"]',
      'Ширина дивана 343 см'
    );

    // Кнопка изменения обивки
    this.changeFabricButton = new BaseElement(
      page,
      '#fabricChange',
      'Изменить обивку'
    );

    // Кнопка добавления товара в корзину
    this.addToCartButton = new BaseElement(
      page,
      'button.btn_cart[aria-label="Добавить в корзину"]:visible',
      'Добавить диван в корзину'
    );
  }

  // Открытие карточки товара
  async open(): Promise<void> {
    logger.info('Открытие карточки дивана Кант 2');

    await this.page.goto(
      '/katalog/pryamye-divany/divan-transformer-kant-2'
    );

    await this.title.waitForVisible();
  }

  // Выбор ширины 343 см
  async selectWidth343(): Promise<void> {
    logger.info('Проверка и выбор ширины дивана 343 см');

    await this.width343.waitForVisible();

    const isSelected = await this.width343
      .getLocator()
      .evaluate(element =>
        element.classList.contains('seriaActive')
      );

    if (isSelected) {
      logger.info('Ширина 343 см уже выбрана');
      return;
    }

    await this.width343.click();

    logger.info('Выбрана ширина 343 см');
  }

  // Открытие окна выбора обивки
  async openFabricSelection(): Promise<void> {
    logger.info('Открытие окна выбора обивки');

    await this.changeFabricButton.click();
  }


  // Выбор обивки "Велюр Velutto 01"
  async selectFabricVelutto01(): Promise<void> {
    logger.info('Выбор обивки Велюр Velutto 01');

    const fabricFrame = this.page.frameLocator(
      'iframe.fancybox-iframe'
    );

    const fabric = fabricFrame.locator(
      '.fabric[data-id="1878925"]'
    );

    // Ожидаем появления нужного образца ткани
    await expect(fabric).toBeVisible({
      timeout: 15000,
    });

    logger.info('Образец обивки Velutto 01 найден');

    // Открываем подробную карточку ткани
    await fabric.click();

    const confirmButton = fabricFrame.locator(
      '#fabricButton'
    );

    try {
      // Ожидаем кнопку подтверждения выбора
      await expect(confirmButton).toBeVisible({
        timeout: 15000,
      });
    } catch (error) {
      // Диагностика при отсутствии кнопки
      const fabricClass = await fabric
        .locator('.inner')
        .getAttribute('class', { timeout: 2000 })
        .catch(() => 'не удалось получить');

      logger.error(
        `Карточка ткани не открылась. ` +
        `Класс образца: ${fabricClass}. ` +
        `Адрес: ${this.page.url()}`
      );

      throw error;
    }

    // Подтверждаем выбор обивки
    await confirmButton.click();

    // Проверяем отображение выбранной ткани в карточке товара
    await expect(
      this.page.getByRole('button', {
        name: /Велюр Velutto 01/
      })
    ).toBeVisible();

    logger.info('Обивка Velutto 01 применена к товару');
    logger.info('Выбор обивки подтверждён');
  }



  // Добавление товара в корзину
  async addToCart(): Promise<void> {
    logger.info('Добавление дивана в корзину');

    await this.addToCartButton.click();
  }
}
