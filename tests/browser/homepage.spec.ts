import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages-home/');
  });

  test('page loads with Teryx in title', async ({ page }) => {
    await expect(page).toHaveTitle(/Teryx/);
  });

  test('hero container exists', async ({ page }) => {
    await expect(page.locator('#hero')).toBeAttached();
  });

  test('quick start section with 3 steps', async ({ page }) => {
    await expect(page.locator('#quickstart')).toBeVisible();
    await expect(page.locator('.quickstart-step')).toHaveCount(3);
  });

  test('quick start steps have code blocks', async ({ page }) => {
    const steps = page.locator('.quickstart-step');
    for (let i = 0; i < 3; i++) {
      await expect(steps.nth(i).locator('pre')).toBeVisible();
    }
  });

  test('features section with 4 cards', async ({ page }) => {
    await expect(page.locator('#features')).toBeVisible();
    await expect(page.locator('.feature-card')).toHaveCount(4);
  });

  test('widget showcase section with 4 demos', async ({ page }) => {
    await expect(page.locator('#showcase')).toBeVisible();
    await expect(page.locator('.showcase-box')).toHaveCount(4);
  });

  test('demo containers exist for grid, charts, form, tabs', async ({ page }) => {
    await expect(page.locator('#demo-grid')).toBeAttached();
    await expect(page.locator('#demo-charts')).toBeAttached();
    await expect(page.locator('#demo-form')).toBeAttached();
    await expect(page.locator('#demo-tabs')).toBeAttached();
  });

  test('DX section with two code panels', async ({ page }) => {
    await expect(page.locator('#dx')).toBeVisible();
    await expect(page.locator('.dx-panel')).toHaveCount(2);
  });

  test('stats section with 4 stat cards', async ({ page }) => {
    await expect(page.locator('#stats')).toBeVisible();
    await expect(page.locator('.stat-card')).toHaveCount(4);
  });

  test('CTA section with buttons', async ({ page }) => {
    await expect(page.locator('.cta-section')).toBeVisible();
    const buttons = page.locator('.cta-btn');
    expect(await buttons.count()).toBeGreaterThanOrEqual(2);
  });

  test('shared nav is present with home active', async ({ page }) => {
    await expect(page.locator('.site-nav')).toBeVisible();
    await expect(page.locator('.site-nav-link.active')).toHaveText('Home');
  });

  test('shared footer is present', async ({ page }) => {
    await expect(page.locator('.site-footer')).toBeVisible();
  });
});

test.describe('Homepage — Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('sections stack on mobile', async ({ page }) => {
    await page.goto('/pages-home/');
    await expect(page.locator('#quickstart')).toBeVisible();
    await expect(page.locator('#features')).toBeVisible();
  });
});

test.describe('Homepage — Dark Mode', () => {
  test('page respects dark mode', async ({ page }) => {
    await page.goto('/pages-home/');
    await page.evaluate(() => localStorage.setItem('teryx-theme', 'dark'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.feature-card').first()).toBeVisible();
  });
});
