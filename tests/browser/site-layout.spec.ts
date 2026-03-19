import { test, expect } from '@playwright/test';

test.describe('Site Layout — Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/explorer/');
    await page.evaluate(() => localStorage.removeItem('teryx-theme'));
  });

  test('renders shared nav on explorer page', async ({ page }) => {
    await page.goto('/explorer/');
    await expect(page.locator('.site-nav')).toBeVisible();
    await expect(page.locator('.site-nav-brand')).toHaveText('Teryx');
  });

  test('renders all nav links', async ({ page }) => {
    await page.goto('/explorer/');
    const links = page.locator('.site-nav-links .site-nav-link');
    await expect(links).toHaveCount(5);
    const texts = await links.allTextContents();
    expect(texts).toEqual(['Home', 'Widgets', 'Explorer', 'Docs', 'Pricing']);
  });

  test('highlights active page in nav', async ({ page }) => {
    await page.goto('/explorer/');
    const activeLink = page.locator('.site-nav-link.active');
    await expect(activeLink).toHaveText('Explorer');
  });

  test('highlights docs as active on docs pages', async ({ page }) => {
    await page.goto('/docs/');
    await expect(page.locator('.site-nav-link.active')).toHaveText('Docs');
  });

  test('renders GitHub button', async ({ page }) => {
    await page.goto('/explorer/');
    const gh = page.locator('.site-nav-gh');
    await expect(gh).toBeVisible();
    await expect(gh).toContainText('GitHub');
  });

  test('renders theme toggle button', async ({ page }) => {
    await page.goto('/explorer/');
    const toggle = page.locator('.site-nav-theme-toggle');
    await expect(toggle).toBeVisible();
  });

  test('body has padding-top class for fixed nav', async ({ page }) => {
    await page.goto('/explorer/');
    await expect(page.locator('body')).toHaveClass(/has-site-nav/);
  });
});

test.describe('Site Layout — Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/');
    await page.evaluate(() => localStorage.removeItem('teryx-theme'));
  });

  test('clicking toggle switches to dark mode', async ({ page }) => {
    await page.goto('/explorer/');
    // Ensure we start in light mode
    await page.evaluate(() => {
      localStorage.removeItem('teryx-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    });

    const toggle = page.locator('.site-nav-theme-toggle');
    await toggle.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('clicking toggle again switches back to light mode', async ({ page }) => {
    await page.goto('/explorer/');
    await page.evaluate(() => {
      localStorage.setItem('teryx-theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    });

    const toggle = page.locator('.site-nav-theme-toggle');
    await toggle.click(); // → dark
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await toggle.click(); // → light
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('persists theme choice in localStorage', async ({ page }) => {
    await page.goto('/explorer/');
    await page.evaluate(() => {
      localStorage.removeItem('teryx-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    });

    await page.locator('.site-nav-theme-toggle').click();
    const stored = await page.evaluate(() => localStorage.getItem('teryx-theme'));
    expect(stored).toBe('dark');
  });

  test('restores theme from localStorage on reload', async ({ page }) => {
    await page.goto('/explorer/');
    await page.evaluate(() => localStorage.setItem('teryx-theme', 'dark'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('Site Layout — Mobile Menu', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('hamburger button visible on mobile', async ({ page }) => {
    await page.goto('/explorer/');
    await expect(page.locator('.site-nav-mobile-btn')).toBeVisible();
  });

  test('desktop links hidden on mobile', async ({ page }) => {
    await page.goto('/explorer/');
    await expect(page.locator('.site-nav-links')).not.toBeVisible();
  });

  test('clicking hamburger opens mobile menu', async ({ page }) => {
    await page.goto('/explorer/');
    await page.locator('.site-nav-mobile-btn').click();
    await expect(page.locator('.site-nav-mobile-menu')).toHaveClass(/open/);
  });

  test('mobile menu has all navigation links', async ({ page }) => {
    await page.goto('/explorer/');
    await page.locator('.site-nav-mobile-btn').click();
    const links = page.locator('.site-nav-mobile-menu a');
    const texts = await links.allTextContents();
    expect(texts).toEqual(['Home', 'Widgets', 'Explorer', 'Docs', 'Pricing', 'GitHub']);
  });

  test('clicking hamburger again closes mobile menu', async ({ page }) => {
    await page.goto('/explorer/');
    const btn = page.locator('.site-nav-mobile-btn');
    await btn.click();
    await expect(page.locator('.site-nav-mobile-menu')).toHaveClass(/open/);
    await btn.click();
    await expect(page.locator('.site-nav-mobile-menu')).not.toHaveClass(/open/);
  });

  test('hamburger button has correct aria-expanded state', async ({ page }) => {
    await page.goto('/explorer/');
    const btn = page.locator('.site-nav-mobile-btn');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('Site Layout — Footer', () => {
  test('footer renders on docs page', async ({ page }) => {
    await page.goto('/docs/');
    await expect(page.locator('.site-footer')).toBeVisible();
  });

  test('footer contains brand name', async ({ page }) => {
    await page.goto('/docs/');
    await expect(page.locator('.site-footer-brand h3')).toHaveText('Teryx');
  });

  test('footer has MIT badge', async ({ page }) => {
    await page.goto('/docs/');
    await expect(page.locator('.site-footer-badge')).toContainText('MIT');
  });

  test('footer has navigation columns', async ({ page }) => {
    await page.goto('/docs/');
    const cols = page.locator('.site-footer-col');
    await expect(cols).toHaveCount(3);
  });

  test('footer does not render on explorer page', async ({ page }) => {
    await page.goto('/explorer/');
    await expect(page.locator('.site-footer')).toHaveCount(0);
  });

  test('footer has copyright text', async ({ page }) => {
    await page.goto('/docs/');
    const year = new Date().getFullYear().toString();
    await expect(page.locator('.site-footer-bottom')).toContainText(year);
    await expect(page.locator('.site-footer-bottom')).toContainText('MIT');
  });
});

test.describe('Site Layout — Accessibility', () => {
  test('nav has correct role and aria-label', async ({ page }) => {
    await page.goto('/explorer/');
    await expect(page.locator('.site-nav')).toHaveAttribute('role', 'navigation');
    await expect(page.locator('.site-nav')).toHaveAttribute('aria-label', 'Main navigation');
  });

  test('theme toggle has aria-label', async ({ page }) => {
    await page.goto('/explorer/');
    await expect(page.locator('.site-nav-theme-toggle')).toHaveAttribute('aria-label', 'Toggle dark mode');
  });

  test('mobile menu button has aria-label', async ({ page }) => {
    await page.goto('/explorer/');
    await expect(page.locator('.site-nav-mobile-btn')).toHaveAttribute('aria-label', 'Toggle menu');
  });
});
