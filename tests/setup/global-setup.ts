// tests/setup/global-setup.ts
import type { FullConfig, Page, Response, test } from '@playwright/test'
import { expect } from '@playwright/test'
import { chromium } from '@playwright/test'
import 'dotenv/config'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import path from 'path'

import { LoginPage } from '@pages/loginPage/loginPage'
import { Loader } from '@pageFactory/commonComponents/loader'

export default async function globalSetup(config: FullConfig) {
  const isHeaded = (config.projects[0]?.use as any)?.headless === false

  const browser = await chromium.launch({
    headless: !isHeaded,
    slowMo: isHeaded ? 80 : 0
  });

  const baseURL =
    (config.projects[0]?.use as any)?.baseURL ||
    process.env.BASE_URL ||
    'https://myaccount.lseg.com/en/signin'

  const username = process.env.QA_USER
  const password = process.env.QA_PASS

  const PROJECT_ROOT_DIR = process.cwd()
  const STORAGE_STATE_DIR = path.join(PROJECT_ROOT_DIR, '.build', 'auth')
  const ALLURE_RESULTS_DIR = path.join(PROJECT_ROOT_DIR, 'allure-results')

  // ensure dirs
  if (!existsSync(STORAGE_STATE_DIR)) mkdirSync(STORAGE_STATE_DIR, { recursive: true })
  if (!existsSync(ALLURE_RESULTS_DIR)) mkdirSync(ALLURE_RESULTS_DIR, { recursive: true })

  /** -------- Allure metadata (visible to all tests) -------- */
  // Default labels (no allure import anywhere)
  process.env.ALLURE_LABEL_epic = process.env.ALLURE_LABEL_epic ?? 'Web'
  process.env.ALLURE_LABEL_feature = process.env.ALLURE_LABEL_feature ?? 'Portal'
  process.env.ALLURE_LABEL_owner = process.env.ALLURE_LABEL_owner ?? 'Mitul'
  process.env.ALLURE_LABEL_severity = process.env.ALLURE_LABEL_severity || 'Not Classified'

  // 1) environment.properties
  const envProps = [
    `BASE_URL=${baseURL}`,
    `BROWSER=chromium`,
    `ENV=${process.env.ENV ?? 'local'}`,
    `NODE_VERSION=${process.version}`,
  ].join('\n');
  writeFileSync(path.join(ALLURE_RESULTS_DIR, 'environment.properties'), envProps, 'utf-8')
  

  // 2) executor.json (shows CI/build info on the Allure main page)
  const executor = {
    name: process.env.CI ? 'GitHub Actions' : 'Local',
    type: 'playwright',
    buildName: process.env.GITHUB_RUN_NUMBER || 'local',
    buildUrl: process.env.GITHUB_SERVER_URL
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : undefined,
    reportUrl: undefined,
  };
  writeFileSync(
    path.join(ALLURE_RESULTS_DIR, 'executor.json'),
    JSON.stringify(executor, null, 2),
    'utf-8'
  )

  // 3) categories.json (bucket common failures)
  const categories = [
    { name: 'Network issues', messageRegex: 'ECONNRESET|ETIMEDOUT|ENOTFOUND' },
    { name: 'Auth failures',  messageRegex: '401|403|Session expired' },
  ]
  writeFileSync(
    path.join(ALLURE_RESULTS_DIR, 'categories.json'),
    JSON.stringify(categories, null, 2),
    'utf-8'
  )

  if (!username) {
    throw new Error('CI_USERNAME environment variable is not defined.');
  }
  if (!password) {
    throw new Error('CI_PASSWORD environment variable is not defined.');
  }

  const storageFile = path.join(
    STORAGE_STATE_DIR,
    `${username.replace(/[^a-zA-Z0-9_.-]/g, '_')}.json`
  )
  
  if (existsSync(storageFile)) return

  const context = await browser.newContext()
  const page = await browser.newPage({ storageState: undefined })
  const loginPage = new LoginPage(page)
  await page.goto(process.env.BASE_URL || baseURL)
  await loginPage.fillLoginData(username, password)
  await waitUntilIdle(context.pages().slice(-1)[0] ?? page)
  await extractCookies(page, storageFile)
  await page.close()
  await context.storageState({ path: storageFile })
  await browser.close()
}
function writeJson(arg0: string, arg1: { name: string; type: string; buildName: string; buildUrl: string | undefined; reportUrl: undefined }) {
  throw new Error('Function not implemented.')
}

const extractCookies = async (page: Page, storageState: string): Promise<void> => {
  if (!existsSync(path.dirname(storageState))) {
    mkdirSync(path.dirname(storageState), { recursive: true })
  }
  writeFileSync(
    path.resolve(storageState),
    JSON.stringify({ cookies : await page.context().cookies() }, null, 2)
  )
}

async function waitUntilIdle(scope: Page): Promise<void> {
  const loader = new Loader(scope)
  const active = await loader.activeLocator()
  if (active) {
    await expect.soft(active).toBeHidden()
  }
}
