import { test, expect } from '@playwright/test';

test.describe('Explorer — Tabs Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#navigation-tabs');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 8 tabs demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(8);
  });

  test('basic tabs demo renders default variant', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Tabs');
    await expect(demo.locator('.tx-tabs-container')).toBeVisible();
    await expect(demo.locator('.tx-tabs-tabs')).toBeVisible();

    const tabBtns = demo.locator('.tx-tab');
    expect(await tabBtns.count()).toBe(3);
  });

  test('underline variant has correct class', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Underline Variant');
    await expect(demo.locator('.tx-tabs-underline')).toBeVisible();
  });

  test('pills variant has correct class', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Pills Variant');
    await expect(demo.locator('.tx-tabs-pills')).toBeVisible();
  });

  test('card variant has correct class', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Card Variant');
    await expect(demo.locator('.tx-tabs-card')).toBeVisible();
  });

  test('vertical tabs have vertical class', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(4);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Vertical Tabs');
    await expect(demo.locator('.tx-tabs-vertical')).toBeVisible();
  });

  test('scrollable tabs have scroll buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(5);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Scrollable Tabs');
    await expect(demo.locator('.tx-tabs-scrollable')).toBeVisible();
    await expect(demo.locator('.tx-tabs-scroll-left')).toBeVisible();
    await expect(demo.locator('.tx-tabs-scroll-right')).toBeVisible();

    const tabBtns = demo.locator('.tx-tab');
    expect(await tabBtns.count()).toBe(15);
  });

  test('closable tabs have close buttons and add button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(6);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Closable Tabs');

    const closeButtons = demo.locator('.tx-tab-close');
    expect(await closeButtons.count()).toBe(3);

    await expect(demo.locator('.tx-tab-add')).toBeVisible();
  });

  test('closing a tab removes it', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(6);
    const tabsBefore = await demo.locator('.tx-tab:not(.tx-tab-add)').count();
    expect(tabsBefore).toBe(3);

    // Close the last tab's close button
    await demo.locator('.tx-tab-close').last().click();
    await page.waitForTimeout(100);

    const tabsAfter = await demo.locator('.tx-tab:not(.tx-tab-add)').count();
    expect(tabsAfter).toBe(2);
  });

  test('add button creates a new tab', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(6);
    const tabsBefore = await demo.locator('.tx-tab:not(.tx-tab-add)').count();

    await demo.locator('.tx-tab-add').click();
    await page.waitForTimeout(100);

    const tabsAfter = await demo.locator('.tx-tab:not(.tx-tab-add)').count();
    expect(tabsAfter).toBe(tabsBefore + 1);
  });

  test('lazy-load demo shows icons and disabled tab', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(7);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Lazy-Load Tabs');

    await expect(demo.locator('.tx-tab-icon')).toBeVisible();
    await expect(demo.locator('.tx-tab-disabled')).toBeVisible();
  });

  test('clicking a tab switches content', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);

    // First tab active by default
    const firstPanel = demo.locator('.tx-tab-panel').first();
    await expect(firstPanel).toHaveClass(/tx-tab-panel-active/);

    // Click second tab
    await demo.locator('.tx-tab').nth(1).click();
    await page.waitForTimeout(100);

    await expect(firstPanel).not.toHaveClass(/tx-tab-panel-active/);
    const secondPanel = demo.locator('.tx-tab-panel').nth(1);
    await expect(secondPanel).toHaveClass(/tx-tab-panel-active/);
  });
});

test.describe('Explorer — Accordion Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#navigation-accordion');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 4 accordion demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('basic accordion renders with three items', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Accordion');
    await expect(demo.locator('.tx-accordion')).toBeVisible();

    const items = demo.locator('.tx-accordion-item');
    expect(await items.count()).toBe(3);
  });

  test('basic accordion first item is open', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    const first = demo.locator('.tx-accordion-item').first();
    await expect(first).toHaveClass(/tx-accordion-open/);
  });

  test('clicking a header toggles accordion item', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    const second = demo.locator('.tx-accordion-item').nth(1);

    // Initially closed
    await expect(second).not.toHaveClass(/tx-accordion-open/);

    // Click to open
    await second.locator('.tx-accordion-header').click();
    await page.waitForTimeout(400);
    await expect(second).toHaveClass(/tx-accordion-open/);
  });

  test('multiple open demo allows simultaneous open items', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Multiple Open');

    const openItems = demo.locator('.tx-accordion-open');
    expect(await openItems.count()).toBe(2);
  });

  test('with icons demo shows icon elements', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('With Icons');

    const icons = demo.locator('.tx-accordion-icon');
    expect(await icons.count()).toBe(3);
  });

  test('nested accordion renders inner accordion', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Nested Accordion');

    const accordions = demo.locator('.tx-accordion');
    expect(await accordions.count()).toBe(2);

    const nestedItems = demo.locator('#nested-acc .tx-accordion-item');
    expect(await nestedItems.count()).toBe(2);
  });

  test('nested accordion inner item is open', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    const nestedFirst = demo.locator('#nested-acc .tx-accordion-item').first();
    await expect(nestedFirst).toHaveClass(/tx-accordion-open/);
  });
});
