import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing/');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Pricing/);
  });

  test('renders hero section with heading', async ({ page }) => {
    await expect(page.locator('.pricing-hero h1')).toHaveText('Simple, transparent pricing');
  });

  test('renders hero description', async ({ page }) => {
    await expect(page.locator('.pricing-hero p')).toContainText('Teryx Community is free');
  });

  test('renders two pricing cards', async ({ page }) => {
    await expect(page.locator('.pricing-card')).toHaveCount(2);
  });

  test('Community card has correct title and price', async ({ page }) => {
    const community = page.locator('.pricing-card').first();
    await expect(community.locator('h2')).toHaveText('Community');
    await expect(community.locator('.amount')).toHaveText('$0');
    await expect(community.locator('.period')).toContainText('forever');
  });

  test('Pro card has correct title', async ({ page }) => {
    const pro = page.locator('.pricing-card.recommended');
    await expect(pro.locator('h2')).toHaveText('Pro');
  });

  test('Pro card has recommended badge', async ({ page }) => {
    const badge = page.locator('.pricing-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('Recommended');
  });

  test('Community card lists features with check/x icons', async ({ page }) => {
    const community = page.locator('.pricing-card').first();
    const features = community.locator('.pricing-features li');
    const count = await features.count();
    expect(count).toBeGreaterThanOrEqual(6);

    // Check that included features have check icons
    const checks = community.locator('.icon-check');
    const xs = community.locator('.icon-x');
    expect(await checks.count()).toBeGreaterThanOrEqual(6);
    expect(await xs.count()).toBeGreaterThanOrEqual(2);
  });

  test('Pro card lists all features as included', async ({ page }) => {
    const pro = page.locator('.pricing-card.recommended');
    const checks = pro.locator('.icon-check');
    const xs = pro.locator('.icon-x');
    expect(await checks.count()).toBeGreaterThanOrEqual(8);
    expect(await xs.count()).toBe(0);
  });

  test('Community card has CTA button linking to GitHub', async ({ page }) => {
    const cta = page.locator('.pricing-card').first().locator('.pricing-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveText('Get Started');
    await expect(cta).toHaveAttribute('href', /github/);
  });

  test('Pro card has CTA button', async ({ page }) => {
    const cta = page.locator('.pricing-card.recommended .pricing-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveText('Contact Us');
  });

  test('FAQ section exists with questions', async ({ page }) => {
    await expect(page.locator('.pricing-faq h2')).toHaveText('Frequently asked questions');
    const items = page.locator('.pricing-faq-item');
    expect(await items.count()).toBeGreaterThanOrEqual(4);
  });

  test('FAQ items have question and answer', async ({ page }) => {
    const firstItem = page.locator('.pricing-faq-item').first();
    await expect(firstItem.locator('h3')).toContainText('Community edition');
    await expect(firstItem.locator('p')).toContainText('MIT licensed');
  });

  test('shared nav is present with pricing active', async ({ page }) => {
    await expect(page.locator('.site-nav')).toBeVisible();
    await expect(page.locator('.site-nav-link.active')).toHaveText('Pricing');
  });

  test('shared footer is present', async ({ page }) => {
    await expect(page.locator('.site-footer')).toBeVisible();
  });
});

test.describe('Pricing Page — Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('pricing cards stack vertically on mobile', async ({ page }) => {
    await page.goto('/pricing/');
    const grid = page.locator('.pricing-grid');
    const style = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    // On mobile, should be single column
    expect(style).not.toContain('1fr 1fr');
  });
});

test.describe('Pricing Page — Dark Mode', () => {
  test('page respects dark mode', async ({ page }) => {
    await page.goto('/pricing/');
    await page.evaluate(() => localStorage.setItem('teryx-theme', 'dark'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    // Cards should still be visible
    await expect(page.locator('.pricing-card').first()).toBeVisible();
  });
});
