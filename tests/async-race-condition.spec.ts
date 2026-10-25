import { test, expect } from '@playwright/test';

test.describe('Dashboard Dinámico - Pruebas de Carga Asíncrona', () => {

  test('Debe cargar y mostrar los datos del usuario tras petición de red', async ({ page }) => {
    // Navegar a la página de inicio
    await page.goto('/dashboard');

    // ANTI-PATRÓN 1: Uso de espera fija (fragilidad ante variaciones de red)
    await page.waitForTimeout(3000); 

    // ANTI-PATRÓN 2: Selector frágil dependiente de clases dinámicas internas
    const userCard = page.locator('div.css-x972yz-card-wrapper > div.loaded');

    // Falla esperada: El elemento tarda en hidratarse o la API demora más de 3 segundos
    await expect(userCard).toBeVisible();

    // Intentar interactuar inmediatamente con un botón que depende de un estado asíncrono
    const actionButton = page.getByRole('button', { name: 'Procesar Datos' });
    await actionButton.click();

    // Verificación de éxito asíncrona faltante o mal sincronizada
    const successMessage = page.locator('.notification-banner');
    await expect(successMessage).toHaveText('Operación exitosa');
  });

});