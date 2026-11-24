
import { expect, type Page } from '@playwright/test';
import { BaseElement } from '../elements/BaseElement';
import { logger } from '../../core/logger';

export class ProfilePage {
  private readonly accountLink: BaseElement;
  readonly logoutButton: BaseElement;
  readonly emailInput: BaseElement;

  constructor(private readonly page: Page) {
    // Ссылка на личный кабинет в шапке сайта
    this.accountLink = new BaseElement(
      page,
      'a[href="/kabinet-klienta"][aria-label="Личный кабинет"]',
      'Личный кабинет'
    );

    // Кнопка выхода из аккаунта
    this.logoutButton = new BaseElement(
      page,
      '#exit-tab > a',
      'Кнопка выхода из аккаунта'
    );

    // Поле электронной почты пользователя
    this.emailInput = new BaseElement(
      page,
      '#Email',
      'Поле Email пользователя'
    );
  }


  // Открытие личного кабинета после авторизации
  async open(): Promise<void> {
    logger.info('Переход в личный кабинет');

    await this.accountLink.click();

    await expect(this.page).toHaveURL(
      /\/kabinet-klienta\/userinfo(?:[/?#]|$)/,
      { timeout: 15000 }
    );

    await expect(
      this.logoutButton.getLocator()
    ).toBeVisible();

    logger.info('Личный кабинет открыт');
  }


  // Получение email авторизованного пользователя
  async getUserEmail(): Promise<string> {
    logger.info('Получение email пользователя из личного кабинета');

    await this.emailInput.waitForVisible();
    return await this.emailInput.getLocator().inputValue();
  }

  // Выход из личного кабинета
  async logout(): Promise<void> {
    logger.info('Выход из личного кабинета');
    await this.logoutButton.click();
  }
}
