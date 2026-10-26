import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';

test('Debe fallar por dependencia en cascada en POM anidado', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  
  // La prueba falla profundamente dentro de la jerarquía del POM
  await dashboard.navigateToSettings();
  
  await expect(page.locator('.settings-panel')).toBeVisible();
});