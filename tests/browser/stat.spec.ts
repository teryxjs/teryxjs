import { test, expect } from '@playwright/test';
import { setupPage, createWidget } from './helpers';

test.describe('Stat Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders label and value', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.stat('#target', { label: 'Total Users', value: '12,345' });
    `,
    );
    await expect(page.locator('.tx-stat-label')).toHaveText('Total Users');
    await expect(page.locator('.tx-stat-value')).toHaveText('12,345');
  });

  test('renders icon when provided', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.stat('#target', { label: 'Revenue', value: '$5,000', icon: 'home' });
    `,
    );
    await expect(page.locator('.tx-stat-icon')).toBeVisible();
    const hasSvg = await page.locator('.tx-stat-icon svg').count();
    expect(hasSvg).toBeGreaterThanOrEqual(1);
  });

  test('change indicator is displayed', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.stat('#target', {
        label: 'Sales',
        value: '1,234',
        change: '+12%',
        changeType: 'up'
      });
    `,
    );
    await expect(page.locator('.tx-stat-change')).toBeVisible();
    await expect(page.locator('.tx-stat-change')).toContainText('+12%');
    await expect(page.locator('.tx-stat-change-up')).toBeVisible();
  });

  test('color class is applied', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.stat('#target', { label: 'Metric', value: '99', color: 'success' });
    `,
    );
    await expect(page.locator('.tx-stat-success')).toBeVisible();
  });

  test('prefix and suffix are rendered', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.stat('#target', { label: 'Price', value: '42', prefix: '$', suffix: '/mo' });
    `,
    );
    await expect(page.locator('.tx-stat-prefix')).toHaveText('$');
    await expect(page.locator('.tx-stat-suffix')).toHaveText('/mo');
  });

  test('sparkline SVG is rendered when data is provided', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.stat('#target', {
        label: 'Trend',
        value: '100',
        sparkline: [10, 30, 20, 50, 40, 60, 80, 70, 90, 100]
      });
    `,
    );
    await expect(page.locator('.tx-stat-sparkline')).toBeVisible();
    await expect(page.locator('.tx-stat-sparkline svg')).toBeVisible();
    await expect(page.locator('.tx-stat-sparkline polyline')).toBeVisible();
  });
});
