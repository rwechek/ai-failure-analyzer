import { Page } from "@playwright/test";
import { UserMenuComponent } from './components/user-menu.component';

export class DashboardPage {
  readonly userMenu: UserMenuComponent;

  constructor(private page: Page) {
    this.userMenu = new UserMenuComponent(page);
  }

  async navigateToSettings() {
    await this.page.goto('/dashboard');
    // Llama al componente anidado
    await this.userMenu.clickProfileSettings();
  }
}