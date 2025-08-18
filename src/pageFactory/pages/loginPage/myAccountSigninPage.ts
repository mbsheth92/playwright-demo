import type { Page, Locator } from '@playwright/test';

export class MyAccountSigninPage {
  constructor(private readonly page: Page) {}

  languageTrigger(): Locator {
    // the label shows currently selected language; default is “English”
    return this.page.getByRole('button', { name: /^English$/ });
  }
  headingWelcome(): Locator {
    return this.page.getByRole('heading', { name: 'Welcome to MyAccount' });
  }
  signInButton(): Locator {
    return this.page.getByRole('button', { name: /^Sign In$/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('BASE_URL');
  }
  async clickSignIn(): Promise<void> {
    await this.signInButton().click();
  }
}
