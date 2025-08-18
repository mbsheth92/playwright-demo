/* eslint-disable security/detect-non-literal-fs-filename */
import { test as base, Page } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import path from 'path'

import { LoginPage } from '@pageFactory/pages/loginPage/loginPage';
import { PROJECT_ROOT_DIR } from '../../playwright.config';

type User = { email: string; storageStateFile: string }

type Fixtures = {
  // auto hooks
  handleErrorToastMessage: void
  initialise: void

  // provided data
  user: User
  userEmail: string
  userRole: string

  storageState: string | undefined
};

const STORAGE_STATE_DIR = path.join(PROJECT_ROOT_DIR, '.build', 'auth')

export const baseTest = base.extend<Fixtures>({
  // ---- Error toast handling (no assertions; dialog/locator driven) ----
  handleErrorToastMessage: [async ({ page }, use): Promise<void> => {
    const toastMessage = new ToastMessage(page)

    await page.addLocatorHandler(
      toastMessage.error(),
      async () => {
        const message = await toastMessage.getErrorMessage()
        throw new Error(`An error was displayed: ${message}`)
      },
      { times: 1 }
    );

    await use()
  }, { auto: true }],

  // ---- Initialise session & annotate user ----
  initialise: [async ({ baseURL, page, storageState, user }, use, testInfo): Promise<void> => {
    if (testInfo.project.name !== 'automations') {
      let loggedIn = false

      testInfo.annotations.push({
        type: 'Authenticated User',
        description: user.email,
      });

      // Navigate to app root; rely on Playwright’s auto-wait in subsequent actions.
      await page.goto(String(baseURL))

      await use()

      // Persist storage state only when using the auth directory path:
      if (
        typeof storageState === 'string' &&
        path.resolve(storageState) === path.resolve(path.join(STORAGE_STATE_DIR, user.storageStateFile))
      ) {
        if (loggedIn) {
          await extractCookies(page, storageState)
        } else {
          rmSync(storageState, { force: true })
        }
      }
    } else {
      await use()
    }
  }, { auto: true }],

  // ---- Storage state bootstrap (first run logs in via POM, then caches) ----
  storageState: async ({ browser, user }, use): Promise<void> => {
    const fileName = path.join(STORAGE_STATE_DIR, user.storageStateFile)

    if (existsSync(fileName)) {
      await use(fileName)
      return
    }

    const page = await browser.newPage({ storageState: undefined })
    const loginPage = new LoginPage(page)

    await page.goto(String(process.env.BASE_URL))
    await loginPage.loginUsingForm(user.email, String(process.env.PASSWORD))
    await extractCookies(page, fileName)
    await page.close()
    await use(fileName)
  },

  userEmail: async ({}, use) => {
    await use(process.env.QA_USER ?? 'qa@qa.com');
  },

  // ---- User identity derived from provided userEmail (set in project/use/env) ----
  user: async ({ userEmail }, use, testInfo): Promise<void> => {
    const [local, domain] = userEmail.split('@')
    await use({
      email: `${local}_${testInfo.parallelIndex}@${domain}`,
      storageStateFile: `${local}_${testInfo.parallelIndex}.json`,
    })
  },
});

// ---------- Reusable helpers ----------
const extractCookies = async (page: Page, storageState: string): Promise<void> => {
  ensureDir(STORAGE_STATE_DIR)
  writeFileSync(
    path.resolve(storageState),
    JSON.stringify({ cookies: await page.context().cookies() }, null, 2)
  )
}

const ensureDir = (dir: string): void => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

export const expect = base.expect
