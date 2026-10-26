import { Page, expect } from '@playwright/test';

export class UserMenuComponent {
  constructor(private page: Page) {}

  async clickProfileSettings() {
    const profileButton = this.page.locator('#old-profile-settings-btn');
    
    // Forzamos una aserción rápida con un timeout corto (2 segundos)
    // Esto provocará un fallo inmediato en esta línea exacta, generando un JSON limpio
    await expect(profileButton).toBeVisible({ timeout: 2000 });
    
    await profileButton.click();
  }
}