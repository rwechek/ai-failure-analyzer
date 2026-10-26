import { test, expect } from '@playwright/test';

test.describe('Escenario 1: Fallas Asíncronas y Race Conditions', () => {

  test('Debe fallar por timeout ante un elemento dinámico usando espera frágil', async ({ page }) => {
    // 1. Navegamos a la URL pública de referencia
    await page.goto('https://playwright.dev/');

    // 2. ANTI-PATRÓN: Uso de espera fija (waitForTimeout) en lugar de sincronización nativa
    await page.waitForTimeout(1000); 

    // 3. Simulamos un selector de un componente dinámico que no existe en esta web
    const dynamicCard = page.locator('.async-dynamic-modal-wrapper');

    // 4. Esto provocará un TimeoutError exacto, generando el reporte JSON 
    // que tu ai-failure-analyzer interceptará para analizar el anti-patrón y comentar en el PR.
    await expect(dynamicCard).toBeVisible({ timeout: 2000 });
  });

});