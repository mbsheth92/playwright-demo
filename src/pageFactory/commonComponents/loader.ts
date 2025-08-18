/**
 * Reusable Loader component (no assertions inside).
 * - All locators are defined in the constructor.
 * - User-facing roles first, test-id next, minimal CSS last.
 * - Async helpers return Locators or booleans; tests decide how to assert.
 */

import type { Page, Locator } from '@playwright/test'

export class Loader {
  private readonly scope: Page | Locator

  // Primary loader candidates
  readonly progressbar: Locator
  readonly status: Locator
  readonly testIdLoader: Locator
  readonly ariaBusy: Locator

  // Optional page-level overlay candidates
  readonly overlayDialog: Locator
  readonly overlayText: Locator

  // Aggregated locators (convenience)
  readonly anyLoader: Locator
  readonly anyOverlay: Locator

  constructor(scope: Page | Locator) {
    this.scope = scope

    // --- user-facing roles first ---
    this.progressbar = this.scope.getByRole('progressbar')
    this.status = this.scope.getByRole('status')

    // --- non user-facing fallback ---
    this.testIdLoader = this.scope.getByTestId('loader')

    // --- minimal CSS fallback kept inside this component only ---
    this.ariaBusy = this.scope.locator('[aria-busy="true"]')

    // --- optional overlay, if your app renders one ---
    this.overlayDialog = this.scope.getByRole('dialog', { name: /loading/i })
    this.overlayText = this.scope.getByText(/loading/i)

    // --- aggregated chains (for quick checks) ---
    this.anyLoader = this.progressbar
      .or(this.status)
      .or(this.testIdLoader)
      .or(this.ariaBusy)

    this.anyOverlay = this.overlayDialog.or(this.overlayText)
  }

  /** Returns the first *specific* visible loader/overlay Locator, or null if none is visible. */
  async activeLocator(): Promise<Locator | null> {
    const candidates = [
      this.progressbar,
      this.status,
      this.testIdLoader,
      this.ariaBusy,
      this.overlayDialog,
      this.overlayText,
    ];
    for (const c of candidates) {
      if (await c.isVisible().catch(() => false)) return c;
    }
    return null
  }

  /** True if neither loader nor overlay is visible (i.e., UI is “idle enough”). */
  async isIdle(): Promise<boolean> {
    return (await this.activeLocator()) === null
  }

  /** Convenience: returns a broad “any loader” locator (for quick existence/visibility checks). */
  loaderLocator(): Locator {
    return this.anyLoader
  }

  /** Convenience: returns a broad “any overlay” locator. */
  overlayLocator(): Locator {
    return this.anyOverlay
  }
}
