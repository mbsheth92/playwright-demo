import { test as base } from '@playwright/test'
import * as allure from 'allure-js-commons'

type Meta = { metaDefaults: void }

export const test = base.extend<Meta>({
  metaDefaults: [async ({}, use) => {
    // Set default labels for all tests
    allure.epic('Web')
    allure.feature('Portal')
    allure.owner('Mitul')
    allure.severity('critical')
    await use()
  }, { auto: true }],
});

export const expect = base.expect
