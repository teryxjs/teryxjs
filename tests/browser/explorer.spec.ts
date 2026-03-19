import { test, expect } from '@playwright/test';

test.describe('Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(200);
  });

  test('renders sidebar with categories and nav items', async ({ page }) => {
    const groups = page.locator('.ex-nav-group');
    await expect(groups.first()).toBeVisible();
    const groupCount = await groups.count();
    expect(groupCount).toBeGreaterThanOrEqual(4);

    const items = page.locator('.ex-nav-item');
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThanOrEqual(10);
  });

  test('shows welcome page by default', async ({ page }) => {
    await expect(page.locator('.ex-welcome h2')).toHaveText('Teryx Explorer');
    await expect(page.locator('.ex-welcome-stat')).toHaveCount(3);
  });

  test('navigating to a demo via sidebar renders widget', async ({ page }) => {
    await page.locator('.ex-nav-item[data-id="data-display-grid"]').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.ex-nav-item.active')).toHaveCount(1);
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBeGreaterThanOrEqual(1);
    await expect(demos.first().locator('.ex-demo-header h3')).toHaveText('Basic Grid');

    // Grid should render a table
    await expect(page.locator('.tx-grid').first()).toBeVisible();
  });

  test('breadcrumb updates on navigation', async ({ page }) => {
    await page.locator('.ex-nav-item[data-id="navigation-tabs"]').click();
    await page.waitForTimeout(200);

    const breadcrumb = page.locator('#breadcrumb');
    await expect(breadcrumb).toContainText('Navigation');
    await expect(breadcrumb.locator('span')).toHaveText('Tabs');
  });

  test('hash routing works on page load', async ({ page }) => {
    await page.goto('/explorer/#feedback-toast');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(200);

    await expect(page.locator('.ex-nav-item.active')).toHaveAttribute('data-id', 'feedback-toast');
    await expect(page.locator('.ex-demo')).toHaveCount(1);
  });

  test('search filters navigation items', async ({ page }) => {
    const allItems = await page.locator('.ex-nav-item').count();
    expect(allItems).toBeGreaterThan(5);

    await page.fill('#search', 'grid');
    await page.waitForTimeout(100);

    const visible = page.locator('.ex-nav-item:not(.hidden)');
    const visibleCount = await visible.count();
    expect(visibleCount).toBeGreaterThan(0);
    expect(visibleCount).toBeLessThan(allItems);
  });

  test('source toggle shows and hides source code', async ({ page }) => {
    await page.locator('.ex-nav-item[data-id="data-display-grid"]').click();
    await page.waitForTimeout(200);

    // Source hidden by default
    const source = page.locator('.ex-demo-source');
    await expect(source.first()).toBeHidden();

    // Click source button
    await page.locator('#btn-source').click();
    await page.waitForTimeout(50);
    await expect(source.first()).toBeVisible();
    await expect(page.locator('#btn-source')).toHaveClass(/active/);

    // Toggle off
    await page.locator('#btn-source').click();
    await page.waitForTimeout(50);
    await expect(source.first()).toBeHidden();
  });

  test('multiple demos render for tabs variants', async ({ page }) => {
    await page.locator('.ex-nav-item[data-id="navigation-tabs"]').click();
    await page.waitForTimeout(200);

    const demos = page.locator('.ex-demo');
    const count = await demos.count();
    expect(count).toBe(4); // tabs, underline, pills, card variants

    // Each demo should contain a tabs widget
    for (let i = 0; i < count; i++) {
      await expect(demos.nth(i).locator('.tx-tabs-container')).toBeVisible();
    }
  });

  test('alert demos render all types', async ({ page }) => {
    await page.locator('.ex-nav-item[data-id="feedback-alert"]').click();
    await page.waitForTimeout(200);

    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('chart demos render SVG', async ({ page }) => {
    await page.locator('.ex-nav-item[data-id="specialized-charts"]').click();
    await page.waitForTimeout(300);

    const svgs = page.locator('.tx-chart svg');
    const count = await svgs.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('rating demo is interactive', async ({ page }) => {
    await page.locator('.ex-nav-item[data-id="data-entry-rating"]').click();
    await page.waitForTimeout(200);

    const firstDemo = page.locator('.ex-demo').first();
    const stars = firstDemo.locator('.tx-rating-star');
    const initialActive = await firstDemo.locator('.tx-rating-star-active').count();
    expect(initialActive).toBe(3);

    // Click 5th star
    await stars.nth(4).dispatchEvent('click');
    await page.waitForTimeout(100);
    const afterActive = await firstDemo.locator('.tx-rating-star-active').count();
    expect(afterActive).toBe(5);
  });

  test('toast demo buttons trigger notifications', async ({ page }) => {
    await page.locator('.ex-nav-item[data-id="feedback-toast"]').click();
    await page.waitForTimeout(200);

    // Click a toast button
    await page.locator('.ex-demo-body button').first().click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-toast')).toHaveCount(1);
  });
});
