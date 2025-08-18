/*
* wait for idle state of the page or locator
* This function checks for the visibility of loaders or overlays and waits until they are hidden.
*/
import { expect, Page, Locator } from '@playwright/test'
import { Loader } from '@pageFactory/commonComponents/loader'

export async function waitForIdle(scope: Page | Locator): Promise<void> {
  const loader = new Loader(scope)
  const active = await loader.activeLocator()
  if (active) {
    await expect.soft(active).toBeHidden()
  }
}