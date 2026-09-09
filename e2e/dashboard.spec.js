import { test, expect } from '@playwright/test';

/**
 * Reproduces the reported issue: the dashboard blanked out because the running
 * API 500s on /quotes, /invoices, /activities (DB down). With route mocking we
 * assert it now degrades to a partial view instead.
 */
const page1 = (items = []) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ items, total: items.length, page: 1, page_size: 100 }),
});
const boom = { status: 500, contentType: 'text/plain', body: 'Internal Server Error' };

test('el dashboard degrada a vista parcial cuando fallan endpoints', async ({ page }) => {
  await page.route('**/api/v1/auth/login', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'test.jwt.token',
        token_type: 'bearer',
        user: { id: 'u1', first_name: 'Ada', last_name: 'Lovelace', email: 'ada@satori.test', role: 'admin' },
      }),
    }),
  );

  await page.route('**/api/v1/leads**', (r) => r.fulfill(page1([
    { id: 'l1', first_name: 'Juan', status: 'new', source: 'whatsapp', score: 5 },
    { id: 'l2', first_name: 'Ana', status: 'contacted', source: 'website', score: 8 },
  ])));
  await page.route('**/api/v1/opportunities**', (r) => r.fulfill(page1([
    { id: 'o1', name: 'Deal', status: 'open', expected_value: 1000, currency: 'CRC', stage_id: 's1' },
  ])));
  await page.route('**/api/v1/pipelines**', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ items: [{ id: 'p1', name: 'B2C', is_default: true }] }),
  }));
  await page.route('**/api/v1/pipelines/*/stages', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify([{ id: 's1', name: 'Nuevo', stage_order: 1 }]),
  }));

  // The failing endpoints.
  await page.route('**/api/v1/quotes**', (r) => r.fulfill(boom));
  await page.route('**/api/v1/invoices**', (r) => r.fulfill(boom));
  await page.route('**/api/v1/activities**', (r) => r.fulfill(boom));
  await page.route('**/api/v1/notifications**', (r) => r.fulfill(page1([])));

  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('ada@satori.test');
  await page.locator('input[type="password"]').fill('whatever');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Tiles from the endpoints that DID load.
  await expect(page.getByText('Total Leads')).toBeVisible();
  await expect(page.getByText('Oportunidades abiertas')).toBeVisible();

  // The partial-failure banner instead of a full error screen.
  const banner = page.getByRole('alert');
  await expect(banner).toContainText('no se pudieron cargar');
  await expect(banner).toContainText('Cotizaciones');
  await expect(banner).toContainText('Facturas');

  // It is NOT the full-page error state.
  await expect(page.getByText('No se pudieron cargar los datos')).toHaveCount(0);
});
