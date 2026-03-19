import { test, expect } from '@playwright/test';

test.describe('Migration Guide Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/migration.html');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Migration/);
  });

  test('renders main heading', async ({ page }) => {
    await expect(page.locator('.content h1')).toHaveText('Migration Guide');
  });

  test('sidebar has migration guide as active', async ({ page }) => {
    const active = page.locator('.sidebar a.active');
    await expect(active).toContainText('Migration');
  });

  test('covers ExtJS migration section', async ({ page }) => {
    await expect(page.locator('h2:has-text("ExtJS")')).toBeVisible();
  });

  test('covers jQuery UI migration section', async ({ page }) => {
    await expect(page.locator('h2:has-text("jQuery")')).toBeVisible();
  });

  test('covers AG Grid migration section', async ({ page }) => {
    await expect(page.locator('h2:has-text("AG Grid")')).toBeVisible();
  });

  test('has comparison tables', async ({ page }) => {
    const tables = page.locator('.content table');
    expect(await tables.count()).toBeGreaterThanOrEqual(3);
  });

  test('has code examples', async ({ page }) => {
    const codeBlocks = page.locator('.content pre');
    expect(await codeBlocks.count()).toBeGreaterThanOrEqual(4);
  });

  test('has general migration tips', async ({ page }) => {
    await expect(page.locator('h2:has-text("General")')).toBeVisible();
  });

  test('shared nav is present with docs active', async ({ page }) => {
    await expect(page.locator('.site-nav')).toBeVisible();
    await expect(page.locator('.site-nav-link.active')).toHaveText('Docs');
  });
});

test.describe('Docs Sidebar — Migration Link', () => {
  const pages = [
    { url: '/docs/', name: 'index' },
    { url: '/docs/widgets.html', name: 'widgets' },
    { url: '/docs/declarative.html', name: 'declarative' },
    { url: '/docs/theming.html', name: 'theming' },
  ];

  for (const p of pages) {
    test(`${p.name} page sidebar has migration link`, async ({ page }) => {
      await page.goto(p.url);
      await expect(page.locator('.sidebar a[href="migration.html"]')).toBeAttached();
    });
  }
});
