import { test, expect } from '@playwright/test';

test.describe('Explorer — Steps Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#navigation-steps');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 3 steps demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  test('horizontal steps demo renders with correct direction', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Horizontal Steps');
    await expect(demo.locator('.tx-steps-horizontal')).toBeVisible();

    const stepEls = demo.locator('.tx-step');
    expect(await stepEls.count()).toBe(3);
  });

  test('horizontal steps marks correct statuses', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);

    await expect(demo.locator('.tx-step-finish')).toHaveCount(1);
    await expect(demo.locator('.tx-step-process')).toHaveCount(1);
    await expect(demo.locator('.tx-step-wait')).toHaveCount(1);
  });

  test('vertical steps demo renders with vertical direction', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Vertical Steps');
    await expect(demo.locator('.tx-steps-vertical')).toBeVisible();

    const stepEls = demo.locator('.tx-step');
    expect(await stepEls.count()).toBe(4);
  });

  test('clickable steps demo renders clickable indicators', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Clickable Steps');

    const clickable = demo.locator('.tx-step-clickable');
    expect(await clickable.count()).toBe(4);
  });

  test('clicking a step changes the active step', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);

    // Initially step 0 is process
    await expect(demo.locator('.tx-step').nth(0)).toHaveClass(/tx-step-process/);

    // Click step 2
    await demo.locator('.tx-step').nth(2).click();
    await page.waitForTimeout(100);

    // Step 0 and 1 should be finish, step 2 should be process
    await expect(demo.locator('.tx-step').nth(0)).toHaveClass(/tx-step-finish/);
    await expect(demo.locator('.tx-step').nth(1)).toHaveClass(/tx-step-finish/);
    await expect(demo.locator('.tx-step').nth(2)).toHaveClass(/tx-step-process/);
  });
});

test.describe('Explorer — Sidebar Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#navigation-sidebar');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 2 sidebar demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(2);
  });

  test('collapsible sidebar renders with dark variant', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Collapsible Sidebar');
    await expect(demo.locator('.tx-sidebar-dark')).toBeVisible();
  });

  test('collapsible sidebar has brand text', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.tx-sidebar-brand-text')).toHaveText('MyApp');
  });

  test('collapsible sidebar has toggle button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.tx-sidebar-toggle')).toBeVisible();
  });

  test('toggle button collapses the sidebar', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);

    await expect(demo.locator('.tx-sidebar')).not.toHaveClass(/tx-sidebar-collapsed/);

    await demo.locator('.tx-sidebar-toggle').click();
    await page.waitForTimeout(100);

    await expect(demo.locator('.tx-sidebar')).toHaveClass(/tx-sidebar-collapsed/);
  });

  test('nested items sidebar renders submenu groups', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Nested Items');
    await expect(demo.locator('.tx-sidebar-light')).toBeVisible();

    const groups = demo.locator('.tx-sidebar-item-group');
    expect(await groups.count()).toBe(2);
  });

  test('active parent group is open', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);

    const openGroup = demo.locator('.tx-sidebar-item-open');
    expect(await openGroup.count()).toBe(1);
  });
});

test.describe('Explorer — Navbar Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#navigation-navbar');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 2 navbar demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(2);
  });

  test('responsive navbar renders with light variant', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Responsive Navbar');
    await expect(demo.locator('.tx-navbar-light')).toBeVisible();
  });

  test('responsive navbar has brand text', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.tx-navbar-brand-text')).toHaveText('Teryx');
  });

  test('responsive navbar renders four nav items', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    const navItems = demo.locator('.tx-navbar-nav .tx-navbar-item');
    expect(await navItems.count()).toBe(4);
  });

  test('responsive navbar has end items', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    const endItems = demo.locator('.tx-navbar-end .tx-navbar-item');
    expect(await endItems.count()).toBe(1);
  });

  test('dark navbar renders with dark variant', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Dark Navbar with Dropdowns');
    await expect(demo.locator('.tx-navbar-dark')).toBeVisible();
  });

  test('dark navbar has dropdown menu', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    const dropdown = demo.locator('.tx-navbar-dropdown');
    expect(await dropdown.count()).toBe(1);
  });

  test('clicking dropdown toggle opens menu', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);

    await expect(demo.locator('.tx-navbar-dropdown')).not.toHaveClass(/tx-navbar-dropdown-open/);

    await demo.locator('.tx-navbar-dropdown-toggle').click();
    await page.waitForTimeout(100);

    await expect(demo.locator('.tx-navbar-dropdown')).toHaveClass(/tx-navbar-dropdown-open/);
  });
});

test.describe('Explorer — Pagination Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#navigation-pagination');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 3 pagination demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  test('default pagination renders page buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Default Pagination');
    await expect(demo.locator('.tx-pagination')).toBeVisible();

    const pageButtons = demo.locator('.tx-pagination-page');
    expect(await pageButtons.count()).toBeGreaterThan(0);
  });

  test('default pagination has prev and next buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.tx-pagination-prev')).toBeVisible();
    await expect(demo.locator('.tx-pagination-next')).toBeVisible();
  });

  test('clicking a page button navigates', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);

    // Page 1 active initially
    const active = demo.locator('.tx-pagination-active');
    await expect(active).toHaveText('1');

    // Click page 3
    await demo.locator('.tx-pagination-page[data-page="3"]').click();
    await page.waitForTimeout(100);

    const newActive = demo.locator('.tx-pagination-active');
    await expect(newActive).toHaveText('3');
  });

  test('simple pagination shows page info', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Simple Pagination with Page Info');

    await expect(demo.locator('.tx-pagination-simple')).toBeVisible();
    await expect(demo.locator('.tx-pagination-info')).toBeVisible();
    await expect(demo.locator('.tx-pagination-total')).toBeVisible();
  });

  test('simple pagination total shows correct range', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    const total = demo.locator('.tx-pagination-total');
    await expect(total).toContainText('21-30');
    await expect(total).toContainText('100');
  });

  test('full-featured pagination has size changer and jumper', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Full-Featured Pagination');

    await expect(demo.locator('.tx-pagination-size-select')).toBeVisible();
    await expect(demo.locator('.tx-pagination-jump-input')).toBeVisible();
    await expect(demo.locator('.tx-pagination-total')).toBeVisible();
  });

  test('full-featured pagination total shows correct range', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    const total = demo.locator('.tx-pagination-total');
    await expect(total).toContainText('101-125');
    await expect(total).toContainText('500');
  });
});
