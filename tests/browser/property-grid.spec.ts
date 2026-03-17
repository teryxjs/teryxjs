import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count } from './helpers';

test.describe('PropertyGrid Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders all properties as rows', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.propertyGrid('#target', {
        properties: [
          { name: 'firstName', value: 'John' },
          { name: 'lastName', value: 'Doe' },
          { name: 'age', value: 30, type: 'number' }
        ]
      });
    `,
    );
    const rows = await count(page, '.tx-propgrid-row');
    expect(rows).toBe(3);
  });

  test('editable mode renders input fields', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.propertyGrid('#target', {
        editable: true,
        properties: [
          { name: 'name', value: 'Alice', type: 'string' },
          { name: 'count', value: 5, type: 'number' }
        ]
      });
    `,
    );
    const textInput = page.locator('.tx-propgrid-row[data-prop="name"] input[type="text"]');
    await expect(textInput).toBeVisible();
    await expect(textInput).toHaveValue('Alice');

    const numInput = page.locator('.tx-propgrid-row[data-prop="count"] input[type="number"]');
    await expect(numInput).toBeVisible();
    await expect(numInput).toHaveValue('5');
  });

  test('boolean properties render checkboxes in editable mode', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.propertyGrid('#target', {
        editable: true,
        properties: [
          { name: 'active', value: true, type: 'boolean' },
          { name: 'visible', value: false, type: 'boolean' }
        ]
      });
    `,
    );
    const activeCheckbox = page.locator('.tx-propgrid-row[data-prop="active"] input[type="checkbox"]');
    await expect(activeCheckbox).toBeChecked();

    const visibleCheckbox = page.locator('.tx-propgrid-row[data-prop="visible"] input[type="checkbox"]');
    await expect(visibleCheckbox).not.toBeChecked();
  });

  test('name and value columns are rendered correctly', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.propertyGrid('#target', {
        properties: [
          { name: 'color', label: 'Favorite Color', value: 'Blue' }
        ]
      });
    `,
    );
    await expect(page.locator('.tx-propgrid-name')).toHaveText('Favorite Color');
    await expect(page.locator('.tx-propgrid-value')).toHaveText('Blue');
  });

  test('grouped mode renders group headers', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.propertyGrid('#target', {
        grouped: true,
        properties: [
          { name: 'firstName', value: 'John', group: 'Personal' },
          { name: 'lastName', value: 'Doe', group: 'Personal' },
          { name: 'company', value: 'Acme', group: 'Work' }
        ]
      });
    `,
    );
    const groupHeaders = await count(page, '.tx-propgrid-group-header');
    expect(groupHeaders).toBe(2);
    await expect(page.locator('.tx-propgrid-group-header').first()).toContainText('Personal');
    await expect(page.locator('.tx-propgrid-group-header').nth(1)).toContainText('Work');
  });

  test('change event fires when editable value is modified', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__changed = null;
      (window as any).Teryx.propertyGrid('#target', {
        editable: true,
        properties: [{ name: 'email', value: 'old@test.com', type: 'string' }],
        onChange: (name: string, value: unknown) => {
          (window as any).__changed = { name, value };
        },
      });
    });
    await page.waitForTimeout(100);

    const input = page.locator('.tx-propgrid-row[data-prop="email"] input');
    await input.fill('new@test.com');
    await input.dispatchEvent('change');
    await page.waitForTimeout(200);

    const changed = await page.evaluate(() => (window as any).__changed);
    expect(changed).toEqual({ name: 'email', value: 'new@test.com' });
  });
});
