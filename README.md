# Playwright JS + POM Starter

## Why this setup?
- **Page Object Model**: clear separation of concerns (`pages/`).
- **Fixtures**: inject POMs into tests → clean, readable specs.
- **CI-ready reporting**: HTML for humans, JUnit XML for pipelines.
- **Rich artifacts**: trace, video, screenshots on failures.
- **Multi-browser**: Chromium/Firefox/WebKit out-of-the-box.
- **Env-driven**: `.env` to switch base URLs per environment.

## Quick start
```bash
npm init -y
npm i -D @playwright/test dotenv
npm run pw:install
cp .env.example .env
npm test
npm run report

//Generate CTRF report Makes it easier to build dashboards or pipe results into analytics tools
npx playwright test --reporter=playwright-ctrf-json-reporter



# Playwright JS + POM Starter (ESM + Auth at fine-tuner)

## What you get
- **JavaScript ESM** everywhere (no `.ts`, no CommonJS).
- **Page Object Model** under `pages/` (e.g. `AuthPage`, `HomePage`).
- **Direct auth flow**: tests go straight to `AUTH_URL` and log in (or sign up).
- **Cookie banner handled globally**: global setup seeds the `CookieScriptConsent` cookie.
- **Env-driven** via `.env`.
- **Reports & artifacts**: HTML, JUnit, trace, video, screenshots.
- **Multi-browser** projects ready to go.

---

## Project layout
.
├─ pages/
│ ├─ AuthPage.js
│ ├─ HomePage.js
│ └─ SubNav.js
├─ tests/
│ ├─ auth.setup.spec.js # logs in / signs up → storage/state.json
│ └─ global-setup.js # seeds cookie consent
├─ storage/
│ └─ state.json # generated
├─ playwright.config.js
├─ alias-loader.mjs # resolves @app/* imports
├─ .env
└─ package.json

## .env example
```env
# Auth page URL (go directly here)
AUTH_URL=https://fine-tuner.ai/auth

# Optional base URL (for non-auth tests)
BASE_URL=https://synthflow.ai

# credentials
USER_EMAIL=you@example.com
USER_PASS=SuperSecret123!

# headless
npm test

# headed (visible browser)
npm run test:headed

# debug mode
npm run test:debug

# show last HTML report
npm run report

export NODE_OPTIONS="--experimental-loader=./alias-loader.mjs"
npx playwright test --headed

Scripts in package.json
"scripts": {
  "pw:install": "npx playwright install --with-deps",
  "test": "NODE_OPTIONS='--experimental-loader=./alias-loader.mjs' npx playwright test",
  "test:headed": "NODE_OPTIONS='--experimental-loader=./alias-loader.mjs' npx playwright test --headed",
  "test:debug": "NODE_OPTIONS='--experimental-loader=./alias-loader.mjs' PWDEBUG=1 npx playwright test",
  "report": "npx playwright show-report"
}

Don’t import Page from @playwright/test in JS.

# alias-loader.mjs
import { fileURLToPath } from 'url';
import path from 'path';
/** @param {import('@playwright/test').Page} page */
constructor(page) { this.page = page; }
Ensure .env contains correct values (AUTH_URL, USER_EMAIL, USER_PASS).

Always run with the loader if you use @app/... aliases.

✅ With this setup:

npx playwright test --headed (or npm run test:headed) will accept cookies automatically, go to AUTH_URL, log you in, and save storage state for re-use in all tests.

How to Find Loctors: 
1. By Role (Recommended – Accessible and Stable)

Playwright supports ARIA roles → clean and future-proof.

await page.getByRole('button', { name: 'Login' }).click();
await page.getByRole('textbox', { name: 'Username' }).fill('testuser');

2. By Test ID (Best for stable selectors in real projects)

If developers add data-testid, always use it:

await page.getByTestId('login-button').click();
await page.getByTestId('username-input').fill('testuser');

3. By Text

Quick way when elements have unique text:

await page.getByText('Submit').click();
await page.getByText('Welcome').isVisible();

4. By Label

For form fields with <label>:

await page.getByLabel('Email address').fill('xyz@example.com');
await page.getByLabel('Password').fill('Password123');

5. By Placeholder
await page.getByPlaceholder('Search...').fill('Playwright');

6. By CSS or XPath (Fallback only)

Not preferred (brittle), but useful when no roles/test IDs exist:

await page.locator('#username').fill('testuser');
await page.locator('.btn-primary').click();

7. Select Options by Value 
const optionsToSelect = ['Option 2', 'Option 5', 'Option 7'];

for (const option of optionsToSelect) {
  await page.getByLabel(option).check();
}
