
import type { Locator, Page } from '@playwright/test';
import { logger } from '../../core/logger';

export class BaseElement {
  readonly locator: Locator;

  constructor(
    page: Page,
    selector: string,
    private readonly name: string
  ) {
    this.locator = page.locator(selector);
  }

  // Нажатие на элемент
  async click(): Promise<void> {
    logger.info(`Нажатие на элемент: ${this.name}`);

    try {
      await this.locator.click();
    } catch (error) {
      logger.error(`Ошибка нажатия: ${this.name}`);
      throw error;
    }
  }

  // Заполнение поля
  async fill(value: string): Promise<void> {
    logger.info(`Заполнение поля: ${this.name}`);

    try {
      await this.locator.fill(value);
    } catch (error) {
      logger.error(`Ошибка заполнения поля: ${this.name}`);
      throw error;
    }
  }

  // Ожидание видимости элемента
  async waitForVisible(): Promise<void> {
    logger.debug(`Ожидание элемента: ${this.name}`);

    await this.locator.waitFor({
      state: 'visible',
    });
  }

  // Доступ к Locator для проверок Playwright
  getLocator(): Locator {
    return this.locator;
  }
}
