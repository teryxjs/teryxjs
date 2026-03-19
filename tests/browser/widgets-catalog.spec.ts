import { test, expect } from '@playwright/test';

test.describe('Widget Catalog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/widgets/');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Widgets/);
  });

  test('renders catalog heading', async ({ page }) => {
    await expect(page.locator('.widgets-hero h1')).toContainText('Widget');
  });

  test('renders 7 widget categories', async ({ page }) => {
    await expect(page.locator('.widgets-category')).toHaveCount(7);
  });

  test('categories have correct names', async ({ page }) => {
    const headers = page.locator('.widgets-category-header h2');
    const texts = await headers.allTextContents();
    expect(texts).toEqual([
      'Data Display',
      'Navigation',
      'Feedback',
      'Data Entry',
      'Layout',
      'Specialized',
      'Utilities',
    ]);
  });

  test('renders at least 42 widget cards', async ({ page }) => {
    const cards = page.locator('.widget-card');
    expect(await cards.count()).toBeGreaterThanOrEqual(42);
  });

  test('each card has a title and description', async ({ page }) => {
    const cards = page.locator('.widget-card');
    const count = await cards.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = cards.nth(i);
      await expect(card.locator('h3')).toBeVisible();
      await expect(card.locator('p')).toBeVisible();
    }
  });

  test('cards link to Explorer demos', async ({ page }) => {
    const firstCard = page.locator('.widget-card').first();
    const href = await firstCard.getAttribute('href');
    expect(href).toContain('explorer');
  });

  test('shared nav is present with widgets active', async ({ page }) => {
    await expect(page.locator('.site-nav')).toBeVisible();
    await expect(page.locator('.site-nav-link.active')).toHaveText('Widgets');
  });

  test('shared footer is present', async ({ page }) => {
    await expect(page.locator('.site-footer')).toBeVisible();
  });
});

test.describe('Widget Catalog — Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('cards stack on mobile', async ({ page }) => {
    await page.goto('/widgets/');
    const grid = page.locator('.widgets-grid').first();
    const style = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    // Single column on mobile
    expect(style).not.toContain('260px');
  });
});

test.describe('Widget Catalog — Dark Mode', () => {
  test('page respects dark mode', async ({ page }) => {
    await page.goto('/widgets/');
    await page.evaluate(() => localStorage.setItem('teryx-theme', 'dark'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.widget-card').first()).toBeVisible();
  });
});
