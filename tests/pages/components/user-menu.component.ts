import { Page } from "@playwright/test";

export class UserMenuComponent {
  constructor(private page: Page) {}

  async clickProfileSettings() {
    // Selector obsoleto o erróneo que provocará el fallo en cascada
    await this.page.locator('#old-profile-settings-btn').click();
  }
}