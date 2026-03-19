import { test, expect } from '@playwright/test';

test.describe('Blog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog/');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Blog/);
  });

  test('renders blog heading', async ({ page }) => {
    await expect(page.locator('.blog-header h1')).toHaveText('Blog');
  });

  test('renders blog description', async ({ page }) => {
    await expect(page.locator('.blog-header p')).toContainText('Release notes');
  });

  test('renders at least 3 blog entries', async ({ page }) => {
    const entries = page.locator('.blog-entry');
    expect(await entries.count()).toBeGreaterThanOrEqual(3);
  });

  test('each entry has a date and tag', async ({ page }) => {
    const entries = page.locator('.blog-entry');
    const count = await entries.count();
    for (let i = 0; i < count; i++) {
      const entry = entries.nth(i);
      await expect(entry.locator('.blog-entry-date')).toBeVisible();
      await expect(entry.locator('.blog-entry-tag')).toBeVisible();
    }
  });

  test('each entry has a title', async ({ page }) => {
    const titles = page.locator('.blog-entry h2');
    const count = await titles.count();
    expect(count).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      expect(text!.length).toBeGreaterThan(0);
    }
  });

  test('first entry is the latest release', async ({ page }) => {
    const firstTitle = page.locator('.blog-entry h2').first();
    await expect(firstTitle).toContainText('0.3.0');
  });

  test('entries have release tags', async ({ page }) => {
    const releaseTags = page.locator('.blog-entry-tag.release');
    expect(await releaseTags.count()).toBeGreaterThanOrEqual(3);
  });

  test('entries have content sections with lists', async ({ page }) => {
    const lists = page.locator('.blog-entry ul');
    expect(await lists.count()).toBeGreaterThanOrEqual(3);
  });

  test('version anchors work for deep linking', async ({ page }) => {
    const anchor = page.locator('#v010');
    await expect(anchor).toBeAttached();
  });

  test('shared nav is present', async ({ page }) => {
    await expect(page.locator('.site-nav')).toBeVisible();
    await expect(page.locator('.site-nav-brand')).toHaveText('Teryx');
  });

  test('shared footer is present', async ({ page }) => {
    await expect(page.locator('.site-footer')).toBeVisible();
  });
});

test.describe('Blog Page — Dark Mode', () => {
  test('page respects dark mode', async ({ page }) => {
    await page.goto('/blog/');
    await page.evaluate(() => localStorage.setItem('teryx-theme', 'dark'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.blog-entry').first()).toBeVisible();
  });
});
