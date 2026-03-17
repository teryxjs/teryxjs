import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count, texts, assertExists, assertNotExists } from './helpers';

test.describe('Sidebar Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  const sidebarItems = `[
    { label: 'Dashboard', icon: 'home', href: '/dashboard', active: true },
    { label: 'Users', icon: 'users', href: '/users' },
    { label: 'Settings', icon: 'settings', href: '/settings', badge: '3', badgeType: 'danger' },
  ]`;

  test('brand renders with text and link', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.sidebar('#target', {
        brand: 'My App',
        brandHref: '/home',
        items: ${sidebarItems}
      });
    `,
    );

    await expect(page.locator('.tx-sidebar')).toBeVisible();
    await expect(page.locator('.tx-sidebar-brand')).toBeVisible();
    await expect(page.locator('.tx-sidebar-brand-text')).toHaveText('My App');
    await expect(page.locator('.tx-sidebar-brand-text')).toHaveAttribute('href', '/home');
  });

  test('items render with labels', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.sidebar('#target', {
        items: ${sidebarItems}
      });
    `,
    );

    const itemTexts = await texts(page, '.tx-sidebar-item .tx-sidebar-text');
    expect(itemTexts).toEqual(['Dashboard', 'Users', 'Settings']);
  });

  test('active item is highlighted', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.sidebar('#target', {
        items: ${sidebarItems}
      });
    `,
    );

    const activeItems = page.locator('.tx-sidebar-item-active');
    expect(await activeItems.count()).toBe(1);
    await expect(activeItems.first().locator('.tx-sidebar-text')).toHaveText('Dashboard');
  });

  test('collapse and expand toggle via programmatic methods', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__sidebar = Teryx.sidebar('#target', {
        brand: 'App',
        collapsible: true,
        items: ${sidebarItems}
      });
    `,
    );

    // Initially not collapsed
    await expect(page.locator('.tx-sidebar')).not.toHaveClass(/tx-sidebar-collapsed/);

    // Collapse
    await page.evaluate(() => (window as any).__sidebar.collapse());
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-sidebar')).toHaveClass(/tx-sidebar-collapsed/);

    const isCollapsed = await page.evaluate(() => (window as any).__sidebar.isCollapsed());
    expect(isCollapsed).toBe(true);

    // Expand
    await page.evaluate(() => (window as any).__sidebar.expand());
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-sidebar')).not.toHaveClass(/tx-sidebar-collapsed/);

    const isExpanded = await page.evaluate(() => (window as any).__sidebar.isCollapsed());
    expect(isExpanded).toBe(false);
  });

  test('collapsed state hides text via collapsed class', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.sidebar('#target', {
        brand: 'App',
        collapsed: true,
        collapsible: true,
        items: ${sidebarItems}
      });
    `,
    );

    await expect(page.locator('.tx-sidebar')).toHaveClass(/tx-sidebar-collapsed/);
    await expect(page.locator('.tx-sidebar-collapsible')).toBeVisible();
  });

  test('submenu toggle opens children items', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.sidebar('#target', {
        items: [
          {
            label: 'Reports',
            icon: 'barChart',
            children: [
              { label: 'Daily', href: '/reports/daily' },
              { label: 'Weekly', href: '/reports/weekly' },
            ]
          },
          { label: 'Home', href: '/' },
        ]
      });
    `,
    );

    const submenu = page.locator('.tx-sidebar-submenu');
    const group = page.locator('.tx-sidebar-item-group');

    // Submenu initially hidden
    await expect(submenu).toBeHidden();
    await expect(group).not.toHaveClass(/tx-sidebar-item-open/);

    // Click submenu toggle
    await page.locator('.tx-sidebar-submenu-toggle').click();
    await page.waitForTimeout(100);

    await expect(group).toHaveClass(/tx-sidebar-item-open/);
    await expect(submenu).toBeVisible();

    // Children are visible
    const subItems = await texts(page, '.tx-sidebar-submenu .tx-sidebar-text');
    expect(subItems).toEqual(['Daily', 'Weekly']);

    // Click again to close
    await page.locator('.tx-sidebar-submenu-toggle').click();
    await page.waitForTimeout(100);

    await expect(group).not.toHaveClass(/tx-sidebar-item-open/);
    await expect(submenu).toBeHidden();
  });

  test('section headers render', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.sidebar('#target', {
        items: [
          { label: 'Main', section: true },
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', section: true },
          { label: 'Users', href: '/users' },
        ]
      });
    `,
    );

    const sections = await texts(page, '.tx-sidebar-section');
    expect(sections).toEqual(['Main', 'Admin']);
  });

  test('dark variant applies dark class', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.sidebar('#target', {
        variant: 'dark',
        items: [{ label: 'Home', href: '/' }]
      });
    `,
    );

    await expect(page.locator('.tx-sidebar')).toHaveClass(/tx-sidebar-dark/);
  });

  test('light variant applies light class', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.sidebar('#target', {
        variant: 'light',
        items: [{ label: 'Home', href: '/' }]
      });
    `,
    );

    await expect(page.locator('.tx-sidebar')).toHaveClass(/tx-sidebar-light/);
  });

  test('badge renders on items', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.sidebar('#target', {
        items: [
          { label: 'Inbox', href: '/inbox', badge: '42', badgeType: 'primary' },
          { label: 'Home', href: '/' },
        ]
      });
    `,
    );

    const badge = page.locator('.tx-badge');
    expect(await badge.count()).toBe(1);
    await expect(badge).toHaveText('42');
    await expect(badge).toHaveClass(/tx-badge-primary/);
  });

  test('icons render on items', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.sidebar('#target', {
        items: [
          { label: 'Dashboard', icon: 'home', href: '/' },
          { label: 'Settings', icon: 'settings', href: '/settings' },
        ]
      });
    `,
    );

    expect(await count(page, '.tx-sidebar-icon')).toBe(2);
  });

  test('toggle method toggles collapsed state', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__sidebar = Teryx.sidebar('#target', {
        brand: 'App',
        collapsible: true,
        items: [{ label: 'Home', href: '/' }]
      });
    `,
    );

    // Toggle to collapsed
    await page.evaluate(() => (window as any).__sidebar.toggle());
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-sidebar')).toHaveClass(/tx-sidebar-collapsed/);

    // Toggle back to expanded
    await page.evaluate(() => (window as any).__sidebar.toggle());
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-sidebar')).not.toHaveClass(/tx-sidebar-collapsed/);
  });

  test('nested items render at correct depth', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.sidebar('#target', {
        items: [
          {
            label: 'Parent', icon: 'folder', active: true,
            children: [
              { label: 'Child 1', href: '/child1' },
              { label: 'Child 2', href: '/child2' },
            ]
          }
        ]
      });
    `,
    );

    // Parent item at depth 0
    const parentItem = page.locator('.tx-sidebar-item-group > .tx-sidebar-item');
    await expect(parentItem).toHaveAttribute('style', /--depth:\s*0/);

    // Children at depth 1
    const childItems = page.locator('.tx-sidebar-submenu .tx-sidebar-item');
    for (let i = 0; i < (await childItems.count()); i++) {
      await expect(childItems.nth(i)).toHaveAttribute('style', /--depth:\s*1/);
    }
  });

  test('destroy removes all sidebar DOM content', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__sidebar = Teryx.sidebar('#target', {
        brand: 'App',
        items: [{ label: 'Home', href: '/' }]
      });
    `,
    );

    await assertExists(page, '.tx-sidebar');

    await page.evaluate(() => (window as any).__sidebar.destroy());
    await page.waitForTimeout(100);

    await assertNotExists(page, '.tx-sidebar');
  });
});
