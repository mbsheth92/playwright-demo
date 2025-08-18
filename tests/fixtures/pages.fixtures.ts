import { baseTest } from './baseTest'
import { test as base } from '@playwright/test'
import type { Page } from '@playwright/test'

import { LoginPage } from '@pageFactory/pages/loginPage/loginPage';
import { MyAccountSigninPage } from '@pages/loginPage/myAccountSigninPage'

type Use<T> = (value: T) => Promise<void>

type Pages = {
  loginPage: LoginPage;
  myAccountSigninPage: MyAccountSigninPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }: { page: Page }, use: Use<LoginPage>) => {
    await use(new LoginPage(page))
  },
  myAccountSigninPage: async ({ page }: { page: Page }, use: Use<MyAccountSigninPage>) => {
    await use(new MyAccountSigninPage(page))
  },
});

export const expect = baseTest.expect
