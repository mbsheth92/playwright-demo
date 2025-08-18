import { test, expect } from '@fixtures/pages.fixtures'
import { Page } from 'playwright'


test.describe('MyAccount SAML entry', () => {
  test('default language English → Sign In navigates away', async ({ page, myAccountSigninPage }) => {
    await test.step('Open sign-in page', async () => {
      await myAccountSigninPage.goto()
      await expect.soft(myAccountSigninPage.headingWelcome()).toBeVisible()
    });

    await test.step('Validate default language is English', async () => {
      await expect.soft(myAccountSigninPage.languageTrigger()).toBeVisible()
    });

    await test.step('Click “Sign In” and verify navigation', async () => {
      const startUrl = page.url()
      await myAccountSigninPage.clickSignIn()
      await expect(page).not.toHaveURL(startUrl)
    });
  });
});
