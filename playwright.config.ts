import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv'
import path from 'path'
import * as os from 'node:os'

export const DEFAULT_EXPECT_TIMEOUT = 10000
export const PROJECT_ROOT_DIR = __dirname
const ROOT = process.cwd()
const STORAGE_STATE_DIR = path.join(ROOT, '.build', 'auth')
const USER_KEY = String(process.env.CI ? process.env.CI_USERNAME : process.env.QA_USER || 'local_user')
  .replace(/[^a-zA-Z0-9_.-]/g, '_')
const STORAGE_STATE_FILE = path.join(STORAGE_STATE_DIR, `${USER_KEY}.json`);
dotenv.config({ path: path.join(PROJECT_ROOT_DIR, '.env') })

export default defineConfig({
    expect: {
        timeout: DEFAULT_EXPECT_TIMEOUT
    },
    forbidOnly: !!process.env.CI,
    fullyParallel: true,
    globalSetup: require.resolve('./tests/setup/global-setup.ts'),
    globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),
    outputDir: '.build/test-results',
  testDir: './tests',
  timeout: 60_000,
  workers: 1,
  reporter: [
    ['line'],
    ['allure-playwright', { detail: true, suiteTitle: false}],
  ],
  use: {
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    baseURL: process.env.BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    headless: !process.env.HEADLESS|| !!process.env.CI ||process.env.HEADLESS === 'true',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'setup',
      testMatch: /tests\/setup\/auth\.setup\.spec\.ts/,
      use: { channel: 'chrome' }, 
    },
    {
      name: 'chrome',
      use: {
        channel: 'chrome',
        storageState: STORAGE_STATE_FILE,
      },
      dependencies: ['setup'],
    }
  ],
});
