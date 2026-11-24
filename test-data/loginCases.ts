
export type EmailVariant =
  | 'valid'
  | 'empty'
  | 'invalidFormat'
  | 'unregistered';

export type PasswordVariant =
  | 'valid'
  | 'empty'
  | 'incorrect';

export interface NegativeLoginCase {
  id: string;
  title: string;
  identifierType: 'email';
  emailVariant: EmailVariant;
  passwordVariant: PasswordVariant;
  expectedResult: 'unauthorized';
}

export const negativeLoginCases: NegativeLoginCase[] = [
  {
    id: 'ТК-A-02',
    title: 'Авторизация с пустым email',
    identifierType: 'email',
    emailVariant: 'empty',
    passwordVariant: 'valid',
    expectedResult: 'unauthorized',
  },
  {
    id: 'ТК-A-03',
    title: 'Авторизация с пустым паролем',
    identifierType: 'email',
    emailVariant: 'valid',
    passwordVariant: 'empty',
    expectedResult: 'unauthorized',
  },
  {
    id: 'ТК-A-04',
    title: 'Авторизация с некорректным email',
    identifierType: 'email',
    emailVariant: 'invalidFormat',
    passwordVariant: 'valid',
    expectedResult: 'unauthorized',
  },
  {
    id: 'ТК-A-05',
    title: 'Авторизация с неверным паролем',
    identifierType: 'email',
    emailVariant: 'valid',
    passwordVariant: 'incorrect',
    expectedResult: 'unauthorized',
  },
  {
    id: 'ТК-A-06',
    title: 'Авторизация с незарегистрированным email',
    identifierType: 'email',
    emailVariant: 'unregistered',
    passwordVariant: 'valid',
    expectedResult: 'unauthorized',
  },
];
