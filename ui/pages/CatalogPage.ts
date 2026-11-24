
import type { Locator, Page } from '@playwright/test';
import { BaseElement } from '../elements/BaseElement';
import { logger } from '../../core/logger';

export class CatalogPage {
  readonly heading: BaseElement;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productLink: Locator;

  constructor(private readonly page: Page) {
    // Заголовок каталога диванов
    this.heading = new BaseElement(
      page,
      'h1',
      'Заголовок каталога диванов'
    );

    // Поисковая строка сайта
    this.searchInput = page.getByRole('searchbox', {
      name: 'Поиск по каталогу',
    });

    // Кнопка поиска
    this.searchButton = page.getByRole('button', {
      name: 'Найти',
      exact: true,
    });

    // Ссылка именно на диван-трансформер Кант 2
    this.productLink = page
      .locator(
        'a[href="/katalog/pryamye-divany/divan-transformer-kant-2"]'
      )
      .filter({
        hasText: 'Диван-трансформер Кант 2',
      });
  }

  // Открытие каталога
  async open(): Promise<void> {
    logger.info('Открытие каталога диванов');

    await this.page.goto('/katalog/divany');
    await this.heading.waitForVisible();
  }

  // Поиск товара
  async searchProduct(query: string): Promise<void> {
    logger.info(`Поиск товара: ${query}`);

    await this.searchInput.fill(query);
    await this.searchButton.click();

    // Ожидаем появления нужной модели в результатах
    await this.productLink.waitFor({
      state: 'visible',
    });

    logger.info('Нужный товар найден');
  }

  // Переход в карточку найденного товара
  async openProduct(): Promise<void> {
    logger.info('Переход в карточку дивана Кант 2');

    await this.productLink.click();

    await this.page.waitForURL(
      /\/katalog\/pryamye-divany\/divan-transformer-kant-2(?:[/?#]|$)/
    );
  }
}
