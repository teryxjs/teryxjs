import { test, expect } from '@playwright/test';

test.describe('Explorer — Tooltip Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#utilities-tooltip');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 4 tooltip demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('tooltip positions demo renders 4 buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Tooltip Positions');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(4);
  });

  test('hovering a position button shows a tooltip', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await demo.locator('.ex-demo-body button').first().hover();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-tooltip')).toBeVisible();
  });

  test('tooltip triggers demo renders 3 buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Tooltip Triggers');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(3);
  });

  test('click trigger shows tooltip on click', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    // second button is the "Click" trigger
    await demo.locator('.ex-demo-body button').nth(1).click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-tooltip')).toBeVisible();
  });

  test('tooltip with delay demo renders 4 buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Tooltip with Delay');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(4);
  });

  test('tooltip with HTML demo renders 1 button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Tooltip with HTML');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(1);
  });
});

test.describe('Explorer — Popover Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#utilities-popover');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 5 popover demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(5);
  });

  test('popover click trigger demo has button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Popover Click Trigger');
    await expect(demo.locator('button')).toBeVisible();
  });

  test('clicking popover button shows popover with title', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await demo.locator('button').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-popover')).toBeVisible();
    await expect(page.locator('.tx-popover-title')).toHaveText('Click Popover');
  });

  test('popover hover trigger demo has button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Popover Hover Trigger');
    await expect(demo.locator('button')).toBeVisible();
  });

  test('popover positions demo renders 4 buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Popover Positions');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(4);
  });

  test('popover with HTML demo has button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Popover with HTML');
    await expect(demo.locator('button')).toBeVisible();
  });

  test('popover non-closable demo shows no close button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(4);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Popover Non-closable');

    await demo.locator('button').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-popover')).toBeVisible();
    await expect(page.locator('.tx-popover-close')).toHaveCount(0);
  });
});

test.describe('Explorer — Context Menu Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#utilities-context-menu');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 4 context menu demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('basic context menu demo has right-click area', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Context Menu');
    await expect(demo.locator('[data-testid="ctx-basic-area"]')).toBeVisible();
  });

  test('right-clicking basic area shows context menu', async ({ page }) => {
    const area = page.locator('[data-testid="ctx-basic-area"]');
    await area.click({ button: 'right' });
    await page.waitForTimeout(200);

    const menu = page.locator('.tx-context-menu.tx-dropdown-open');
    await expect(menu).toBeVisible();

    const items = menu.locator('.tx-dropdown-item');
    expect(await items.count()).toBe(4);
  });

  test('context menu with icons demo has area', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Context Menu with Icons');
    await expect(demo.locator('[data-testid="ctx-icon-area"]')).toBeVisible();
  });

  test('icon context menu shows items with icons', async ({ page }) => {
    const area = page.locator('[data-testid="ctx-icon-area"]');
    await area.click({ button: 'right' });
    await page.waitForTimeout(200);

    const menu = page.locator('.tx-context-menu.tx-dropdown-open');
    await expect(menu).toBeVisible();

    const icons = menu.locator('.tx-dropdown-item-icon');
    expect(await icons.count()).toBe(3);
  });

  test('nested context menu demo has area', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Nested Context Menu');
    await expect(demo.locator('[data-testid="ctx-nested-area"]')).toBeVisible();
  });

  test('nested context menu shows submenu items', async ({ page }) => {
    const area = page.locator('[data-testid="ctx-nested-area"]');
    await area.click({ button: 'right' });
    await page.waitForTimeout(200);

    const menu = page.locator('.tx-context-menu.tx-dropdown-open');
    await expect(menu).toBeVisible();

    const submenus = menu.locator('.tx-dropdown-submenu');
    expect(await submenus.count()).toBe(2);
  });

  test('disabled items context menu demo has area', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Context Menu with Disabled Items');
    await expect(demo.locator('[data-testid="ctx-disabled-area"]')).toBeVisible();
  });

  test('disabled items context menu has disabled class', async ({ page }) => {
    const area = page.locator('[data-testid="ctx-disabled-area"]');
    await area.click({ button: 'right' });
    await page.waitForTimeout(200);

    const menu = page.locator('.tx-context-menu.tx-dropdown-open');
    await expect(menu).toBeVisible();

    const disabled = menu.locator('.tx-dropdown-item-disabled');
    expect(await disabled.count()).toBe(2);
  });
});

test.describe('Explorer — Dropdown Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#utilities-dropdown');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 5 dropdown demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(5);
  });

  test('basic dropdown demo has button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Dropdown');
    await expect(demo.locator('button.tx-btn')).toBeVisible();
  });

  test('clicking basic dropdown button opens menu', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await demo.locator('button.tx-btn-primary').click();
    await page.waitForTimeout(200);

    const menu = demo.locator('.tx-dropdown-menu');
    await expect(menu).toBeVisible();

    const items = menu.locator('.tx-dropdown-item');
    expect(await items.count()).toBe(3);
  });

  test('dropdown with sections demo has file menu button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Dropdown with Sections');
    await expect(demo.locator('button.tx-btn')).toContainText('File Menu');
  });

  test('sections dropdown shows dividers', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await demo.locator('button.tx-btn').click();
    await page.waitForTimeout(200);

    const menu = demo.locator('.tx-dropdown-menu');
    await expect(menu).toBeVisible();

    const dividers = menu.locator('.tx-dropdown-divider');
    expect(await dividers.count()).toBe(2);
  });

  test('dropdown with icons demo renders items with icons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Dropdown with Icons');

    await demo.locator('button.tx-btn').click();
    await page.waitForTimeout(200);

    const icons = demo.locator('.tx-dropdown-item-icon');
    expect(await icons.count()).toBe(3);
  });

  test('dropdown with disabled items has disabled entries', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Dropdown with Disabled Items');

    await demo.locator('button.tx-btn').click();
    await page.waitForTimeout(200);

    const disabled = demo.locator('.tx-dropdown-item-disabled');
    expect(await disabled.count()).toBe(1);
  });

  test('right-aligned dropdown demo has button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(4);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Right-aligned Dropdown');
    await expect(demo.locator('button.tx-btn')).toBeVisible();
  });

  test('right-aligned dropdown opens menu with right alignment class', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(4);
    await demo.locator('button.tx-btn').click();
    await page.waitForTimeout(200);

    const menu = demo.locator('.tx-dropdown-menu');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveClass(/tx-dropdown-right/);
  });
});
