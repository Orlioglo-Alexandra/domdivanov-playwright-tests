
import { expect, type Page } from '@playwright/test';
import { BaseElement } from '../elements/BaseElement';
import { logger } from '../../core/logger';

export class LoginPage {
  private readonly accountLink: BaseElement;
  readonly emailInput: BaseElement;
  readonly passwordInput: BaseElement;
  private readonly loginButton: BaseElement;

  constructor(private readonly page: Page) {
    this.accountLink = new BaseElement(
      page,
      '#loginBut',
      'Личный кабинет'
    );

    this.emailInput = new BaseElement(
      page,
      '#login',
      'Поле электронной почты'
    );

    this.passwordInput = new BaseElement(
      page,
      '#password',
      'Поле пароля'
    );

    this.loginButton = new BaseElement(
      page,
      '#UserLogIn',
      'Кнопка Войти'
    );
  }

  // Открытие формы авторизации
  async openForm(): Promise<void> {
    logger.info('Открытие формы авторизации');

    await this.accountLink.click();

    await this.emailInput.waitForVisible();
    await this.passwordInput.waitForVisible();

    logger.info('Модальное окно авторизации открыто');
  }

  // Заполнение учётных данных
  async fillCredentials(
    email: string,
    password: string
  ): Promise<void> {
    logger.info('Заполнение формы авторизации');

    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }


  // Отправка формы при успешной авторизации
  async submit(): Promise<void> {
    logger.info('Отправка формы авторизации');

    await this.loginButton.click();

    // Ожидаем закрытия модального окна авторизации
    await expect(
      this.emailInput.getLocator()
    ).toBeHidden({ timeout: 15000 });

    logger.info('Модальное окно авторизации закрыто');
  }


  // Отправка формы в негативных сценариях
  async submitNegative(): Promise<void> {
    logger.info('Отправка формы с некорректными данными');

    await this.loginButton.click();
  }

  // Полный процесс успешного входа
  async login(
    email: string,
    password: string
  ): Promise<void> {
    await this.openForm();
    await this.fillCredentials(email, password);
    await this.submit();
  }
}
