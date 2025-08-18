/*
* Page Object Model for Login Page
* This file contains the implementation of the LoginPage class which provides methods to interact with the login
*/
import { Locator, Page } from '@playwright/test'


export class LoginPage{

  // Locators for the login page elements
  readonly form : Locator
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly signInButton: Locator

  constructor(private readonly page: Page) {
    this.form = page.locator('form[name="frmSignIn"]')
    this.usernameInput = this.form.getByPlaceholder('User ID')
    this.passwordInput = this.form.getByPlaceholder('Password')
    this.signInButton = this.form.getByText('Sign In', { exact: true })
  }

  async fillLoginData(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
  }
}
