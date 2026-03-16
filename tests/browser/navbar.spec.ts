import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count, texts, assertExists, assertNotExists } from './helpers';

test.describe('Navbar Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  const navItems = `[
    { label: 'Home', href: '/', active: true },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]`;

  test('brand renders with link', async ({ page }) => {
    await createWidget(page, `
      Teryx.navbar('#target', {
        brand: 'Teryx App',
        brandHref: '/home',
        items: ${navItems}
      });
    `);

    await expect(page.locator('.tx-navbar')).toBeVisible();
    await expect(page.locator('.tx-navbar-brand')).toBeVisible();
    await expect(page.locator('.tx-navbar-brand-text')).toHaveText('Teryx App');
    await expect(page.locator('.tx-navbar-brand')).toHaveAttribute('href', '/home');
  });

  test('brand with image renders img element', async ({ page }) => {
    await createWidget(page, `
      Teryx.navbar('#target', {
        brand: 'App',
        brandImage: '/img/logo.png',
        items: ${navItems}
      });
    `);

    await expect(page.locator('.tx-navbar-brand-img')).toHaveCount(1);
    await expect(page.locator('.tx-navbar-brand-img')).toHaveAttribute('src', '/img/logo.png');
  });

  test('nav items render', async ({ page }) => {
    await createWidget(page, `
      Teryx.navbar('#target', {
        items: ${navItems}
      });
    `);

    const items = page.locator('.tx-navbar-nav .tx-navbar-item');
    expect(await items.count()).toBe(3);

    const itemTexts = await items.allTextContents();
    expect(itemTexts).toEqual(['Home', 'About', 'Contact']);
  });

  test('active item has active class', async ({ page }) => {
    await createWidget(page, `
      Teryx.navbar('#target', {
        items: ${navItems}
      });
    `);

    const activeItems = page.locator('.tx-navbar-item-active');
    expect(await activeItems.count()).toBe(1);
    await expect(activeItems.first()).toContainText('Home');
  });

  test('dropdown toggle opens menu', async ({ page }) => {
    await createWidget(page, `
      Teryx.navbar('#target', {
        items: [
          { label: 'Home', href: '/' },
          {
            label: 'Services',
            children: [
              { label: 'Design', href: '/design' },
              { label: 'Development', href: '/dev' },
            ]
          },
        ]
      });
    `);

    const dropdown = page.locator('.tx-navbar-dropdown');
    await expect(dropdown).toBeVisible();
    await expect(dropdown).not.toHaveClass(/tx-navbar-dropdown-open/);

    // Click dropdown toggle
    await page.locator('.tx-navbar-dropdown-toggle').click();
    await page.waitForTimeout(100);

    await expect(dropdown).toHaveClass(/tx-navbar-dropdown-open/);

    // Dropdown menu items are present
    const menuItems = await texts(page, '.tx-navbar-dropdown-item');
    expect(menuItems).toEqual(['Design', 'Development']);
  });

  test('dropdown closes on outside click', async ({ page }) => {
    await createWidget(page, `
      Teryx.navbar('#target', {
        items: [
          {
            label: 'Menu',
            children: [
              { label: 'Item 1', href: '/item1' },
            ]
          },
        ]
      });
    `);

    const dropdown = page.locator('.tx-navbar-dropdown');

    // Open dropdown
    await page.locator('.tx-navbar-dropdown-toggle').click();
    await page.waitForTimeout(100);
    await expect(dropdown).toHaveClass(/tx-navbar-dropdown-open/);

    // Click outside the navbar
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(100);

    await expect(dropdown).not.toHaveClass(/tx-navbar-dropdown-open/);
  });

  test('collapsible adds toggler button', async ({ page }) => {
    await createWidget(page, `
      Teryx.navbar('#target', {
        brand: 'App',
        collapsible: true,
        items: ${navItems}
      });
    `);

    // Toggler should exist in the DOM
    await expect(page.locator('.tx-navbar-toggler')).toHaveCount(1);

    // Menu should have collapsible class
    await expect(page.locator('.tx-navbar-menu')).toHaveClass(/tx-navbar-collapsible/);

    // On desktop viewport the toggler is hidden via CSS media query;
    // use a mobile viewport to test toggler interaction
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100);

    // Click toggler opens menu
    await page.locator('.tx-navbar-toggler').click();
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-navbar-collapsible')).toHaveClass(/tx-navbar-menu-open/);

    // Click again closes menu
    await page.locator('.tx-navbar-toggler').click();
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-navbar-collapsible')).not.toHaveClass(/tx-navbar-menu-open/);
  });

  test('sticky class is applied when sticky option is true', async ({ page }) => {
    await createWidget(page, `
      Teryx.navbar('#target', {
        sticky: true,
        items: ${navItems}
      });
    `);

    await expect(page.locator('.tx-navbar')).toHaveClass(/tx-navbar-sticky/);
  });

  test('variant dark and primary classes are applied', async ({ page }) => {
    // Dark variant
    await createWidget(page, `
      Teryx.navbar('#target', {
        variant: 'dark',
        items: [{ label: 'Home', href: '/' }]
      });
    `);
    await expect(page.locator('.tx-navbar')).toHaveClass(/tx-navbar-dark/);

    // Primary variant in target2
    await createWidget(page, `
      Teryx.navbar('#target2', {
        variant: 'primary',
        items: [{ label: 'Home', href: '/' }]
      });
    `);
    await expect(page.locator('#target2 .tx-navbar')).toHaveClass(/tx-navbar-primary/);
  });

  test('end items render in navbar-end section', async ({ page }) => {
    await createWidget(page, `
      Teryx.navbar('#target', {
        items: [{ label: 'Home', href: '/' }],
        endItems: [
          { label: 'Login', href: '/login' },
          { label: 'Sign Up', href: '/signup' },
        ]
      });
    `);

    await expect(page.locator('.tx-navbar-end')).toBeVisible();
    const endTexts = await texts(page, '.tx-navbar-end .tx-navbar-item');
    expect(endTexts).toEqual(['Login', 'Sign Up']);
  });

  test('destroy removes all navbar DOM content', async ({ page }) => {
    await createWidget(page, `
      window.__navbar = Teryx.navbar('#target', {
        brand: 'App',
        items: ${navItems}
      });
    `);

    await assertExists(page, '.tx-navbar');

    await page.evaluate(() => (window as any).__navbar.destroy());
    await page.waitForTimeout(100);

    await assertNotExists(page, '.tx-navbar');
  });
});
