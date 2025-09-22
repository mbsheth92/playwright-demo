// tests/setup/global-setup.ts
import type { FullConfig, Page } from '@playwright/test'
import { expect, chromium } from '@playwright/test'
import 'dotenv/config'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { spawn, type ChildProcess } from 'child_process'
import * as http from 'http'
import path from 'path'

import { LoginPage } from '@pages/loginPage/loginPage'
import { Loader } from '@pageFactory/commonComponents/loader'

let serverProcess: ChildProcess | null = null

export default async function globalSetup(config: FullConfig) {
  /** ---------- 1) Start Mock RPC server (if present) ---------- */
  const rpcPort = process.env.RPC_PORT || '4000'
  const rpcUrl = `http://localhost:${rpcPort}/rpc`
  process.env.RPC_URL = process.env.RPC_URL || rpcUrl

  try {
    // spawn only if file exists (keeps setup resilient if script not added yet)
    const serverPath = path.join(process.cwd(), 'scripts', 'mock-rpc-server.js')
    if (existsSync(serverPath)) {
      serverProcess = spawn('node', [serverPath], {
        stdio: 'inherit',
        env: { ...process.env, RPC_PORT: rpcPort },
      })
      // ensure we kill it when runner exits (backup to global-teardown)
      process.on('exit', () => {
        try { serverProcess?.kill() } catch {}
      })
      await waitForRpcReady(new URL(rpcUrl), 15_000)
    }
  } catch (e) {
    console.warn('⚠️  RPC mock server did not start:', e)
  }

  /** ---------- 2) Allure metadata setup ---------- */
  const PROJECT_ROOT_DIR = process.cwd()
  const STORAGE_STATE_DIR = path.join(PROJECT_ROOT_DIR, '.build', 'auth')
  const ALLURE_RESULTS_DIR = path.join(PROJECT_ROOT_DIR, 'allure-results')
  if (!existsSync(STORAGE_STATE_DIR)) mkdirSync(STORAGE_STATE_DIR, { recursive: true })
  if (!existsSync(ALLURE_RESULTS_DIR)) mkdirSync(ALLURE_RESULTS_DIR, { recursive: true })

  // Default labels
  process.env.ALLURE_LABEL_epic = process.env.ALLURE_LABEL_epic ?? 'Web'
  process.env.ALLURE_LABEL_feature = process.env.ALLURE_LABEL_feature ?? 'Portal'
  process.env.ALLURE_LABEL_owner = process.env.ALLURE_LABEL_owner ?? 'Mitul'
  process.env.ALLURE_LABEL_severity = process.env.ALLURE_LABEL_severity || 'Not Classified'

  // environment.properties
  const baseURLFromConfig =
    (config.projects[0]?.use as any)?.baseURL ||
    process.env.BASE_URL ||
    'https://myaccount.lseg.com/en/signin'

  const envProps = [
    `BASE_URL=${baseURLFromConfig}`,
    `BROWSER=chromium`,
    `ENV=${process.env.ENV ?? 'local'}`,
    `NODE_VERSION=${process.version}`,
    `RPC_URL=${process.env.RPC_URL ?? ''}`,
  ].join('\n')
  writeFileSync(path.join(ALLURE_RESULTS_DIR, 'environment.properties'), envProps, 'utf-8')

  // executor.json
  const executor = {
    name: process.env.CI ? 'GitHub Actions' : 'Local',
    type: 'playwright',
    buildName: process.env.GITHUB_RUN_NUMBER || 'local',
    buildUrl: process.env.GITHUB_SERVER_URL
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : undefined,
    reportUrl: undefined,
  }
  writeFileSync(
    path.join(ALLURE_RESULTS_DIR, 'executor.json'),
    JSON.stringify(executor, null, 2),
    'utf-8'
  )

  // categories.json
  const categories = [
    { name: 'Network issues', messageRegex: 'ECONNRESET|ETIMEDOUT|ENOTFOUND' },
    { name: 'Auth failures', messageRegex: '401|403|Session expired' },
  ]
  writeFileSync(
    path.join(ALLURE_RESULTS_DIR, 'categories.json'),
    JSON.stringify(categories, null, 2),
    'utf-8'
  )

  /** ---------- 3) Browser + pre-login storage state (if creds present) ---------- */
  const username = process.env.QA_USER
  const password = process.env.QA_PASS

  const storageFile = path.join(
    STORAGE_STATE_DIR,
    `${(username ?? 'anon').replace(/[^a-zA-Z0-9_.-]/g, '_')}.json`
  )

  // Only attempt login if we have creds and no cached state
  if (username && password && !existsSync(storageFile)) {
    const isHeaded = (config.projects[0]?.use as any)?.headless === false
    const browser = await chromium.launch({
      headless: !isHeaded,
      slowMo: isHeaded ? 80 : 0,
    })

    const context = await browser.newContext()
    const page = await context.newPage()
    const loginPage = new LoginPage(page)

    await page.goto(baseURLFromConfig)
    await loginPage.fillLoginData(username, password)
    await waitUntilIdle(page)

    await extractCookies(page, storageFile)
    await context.storageState({ path: storageFile })
    await browser.close()
  } else {
    // helpful hints in CI logs
    if (!username) console.warn('⚠️ QA_USER not set; skipping login bootstrap.')
    if (!password) console.warn('⚠️ QA_PASS not set; skipping login bootstrap.')
    if (existsSync(storageFile)) console.log(`ℹ️ Using cached storage state: ${storageFile}`)
  }
}

/** ---------- helpers ---------- */

async function waitForRpcReady(url: URL, timeoutMs = 10_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  const payload = JSON.stringify({ method: 'ping', params: [] })

  while (Date.now() < deadline) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.request(
          {
            method: 'POST',
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
          },
          res => {
            // Any non-5xx means server is up enough to proceed
            res.resume()
            return (res.statusCode && res.statusCode < 500) ? resolve() : reject(new Error('Not ready'))
          }
        )
        req.on('error', reject)
        req.write(payload)
        req.end()
      })
      return
    } catch {
      await new Promise(r => setTimeout(r, 300))
    }
  }
  throw new Error(`RPC server not ready at ${url.href}`)
}

const extractCookies = async (page: Page, storageState: string): Promise<void> => {
  if (!existsSync(path.dirname(storageState))) {
    mkdirSync(path.dirname(storageState), { recursive: true })
  }
  writeFileSync(
    path.resolve(storageState),
    JSON.stringify({ cookies: await page.context().cookies() }, null, 2)
  )
}

async function waitUntilIdle(scope: Page): Promise<void> {
  const loader = new Loader(scope)
  const active = await loader.activeLocator()
  if (active) {
    await expect.soft(active).toBeHidden()
  }
}
