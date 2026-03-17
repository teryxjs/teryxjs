import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count } from './helpers';

test.describe('Alert Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders with correct type class for info', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.alert('#target', { type: 'info', message: 'Info message' });
    `,
    );
    await expect(page.locator('.tx-alert-info')).toBeVisible();
  });

  test('renders with correct type class for success', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.alert('#target', { type: 'success', message: 'Success message' });
    `,
    );
    await expect(page.locator('.tx-alert-success')).toBeVisible();
  });

  test('renders with correct type class for warning', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.alert('#target', { type: 'warning', message: 'Warning message' });
    `,
    );
    await expect(page.locator('.tx-alert-warning')).toBeVisible();
  });

  test('renders with correct type class for danger', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.alert('#target', { type: 'danger', message: 'Danger message' });
    `,
    );
    await expect(page.locator('.tx-alert-danger')).toBeVisible();
  });

  test('renders an icon by default', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.alert('#target', { type: 'info', message: 'Has icon' });
    `,
    );
    await expect(page.locator('.tx-alert-icon')).toBeVisible();
  });

  test('dismissible alert renders a close button', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.alert('#target', { type: 'info', message: 'Dismissible', dismissible: true });
    `,
    );
    await expect(page.locator('.tx-alert-dismissible')).toBeVisible();
    await expect(page.locator('.tx-alert-close')).toBeVisible();
  });

  test('clicking close button removes the alert element', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.alert('#target', { type: 'info', message: 'Will be removed', dismissible: true });
    `,
    );
    await expect(page.locator('.tx-alert')).toBeVisible();

    await page.locator('.tx-alert-close').click();
    await page.waitForTimeout(300);

    const alertCount = await count(page, '.tx-alert');
    expect(alertCount).toBe(0);
  });

  test('title is rendered when provided', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.alert('#target', { type: 'success', title: 'Great!', message: 'It worked' });
    `,
    );
    await expect(page.locator('.tx-alert-title')).toHaveText('Great!');
  });

  test('message text is displayed correctly', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.alert('#target', { type: 'info', message: 'Hello World' });
    `,
    );
    await expect(page.locator('.tx-alert-message')).toHaveText('Hello World');
  });
});
