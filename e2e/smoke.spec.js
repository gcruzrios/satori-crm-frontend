import { test, expect } from '@playwright/test';

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

test.describe('Autenticación', () => {
  test('redirige a /login cuando no hay sesión', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('nadie@example.com');
    await page.locator('input[type="password"]').fill('incorrecta');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('login → dashboard', async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD, 'Define E2E_EMAIL y E2E_PASSWORD');
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email' }).fill(EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});

// Flujos críticos de la spec §18 — requieren datos semilla en la API.
test.describe('Flujos de negocio', () => {
  test.skip('crear lead → convertir → verifica oportunidad', async () => {});
  test.skip('crear cotización → enviar → aceptar → convertir a factura', async () => {});
  test.skip('mover oportunidad en el Kanban (incl. rollback al fallar)', async () => {});
});
