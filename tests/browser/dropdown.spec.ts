import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count } from './helpers';

test.describe('Dropdown Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('clicking trigger opens the dropdown menu', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = '<button id="dd-trigger">Menu</button>';
      (window as any).__dd = (window as any).Teryx.dropdown({
        trigger: '#dd-trigger',
        items: [
          { label: 'Item 1' },
          { label: 'Item 2' },
          { label: 'Item 3' }
        ]
      });
    });
    await page.locator('#dd-trigger').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-dropdown-menu')).toBeVisible();
  });

  test('clicking outside closes the dropdown', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = '<button id="dd-trigger">Menu</button>';
      (window as any).__dd = (window as any).Teryx.dropdown({
        trigger: '#dd-trigger',
        items: [{ label: 'Item 1' }]
      });
    });
    await page.locator('#dd-trigger').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-dropdown-menu')).toBeVisible();

    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);

    await expect(page.locator('.tx-dropdown-menu')).toBeHidden();
  });

  test('clicking an item triggers handler and closes menu', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__clicked = '';
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = '<button id="dd-trigger">Menu</button>';
      (window as any).__dd = (window as any).Teryx.dropdown({
        trigger: '#dd-trigger',
        items: [
          { label: 'Action A', handler: () => { (window as any).__clicked = 'A'; } },
          { label: 'Action B', handler: () => { (window as any).__clicked = 'B'; } }
        ]
      });
    });
    await page.locator('#dd-trigger').click();
    await page.waitForTimeout(200);

    await page.locator('.tx-dropdown-item').nth(1).click();
    await page.waitForTimeout(200);

    const clicked = await page.evaluate(() => (window as any).__clicked);
    expect(clicked).toBe('B');
  });

  test('divider renders a divider element', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = '<button id="dd-trigger">Menu</button>';
      (window as any).__dd = (window as any).Teryx.dropdown({
        trigger: '#dd-trigger',
        items: [
          { label: 'Item 1' },
          { divider: true },
          { label: 'Item 2' }
        ]
      });
    });
    await page.locator('#dd-trigger').click();
    await page.waitForTimeout(200);

    const dividers = await count(page, '.tx-dropdown-divider');
    expect(dividers).toBe(1);
  });

  test('disabled items have the disabled class', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = '<button id="dd-trigger">Menu</button>';
      (window as any).__dd = (window as any).Teryx.dropdown({
        trigger: '#dd-trigger',
        items: [
          { label: 'Enabled' },
          { label: 'Disabled', disabled: true }
        ]
      });
    });
    await page.locator('#dd-trigger').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-dropdown-item-disabled')).toBeVisible();
  });

  test('pressing Escape closes the dropdown', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = '<button id="dd-trigger">Menu</button>';
      (window as any).__dd = (window as any).Teryx.dropdown({
        trigger: '#dd-trigger',
        items: [{ label: 'Item 1' }]
      });
    });
    await page.locator('#dd-trigger').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-dropdown-menu')).toBeVisible();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await expect(page.locator('.tx-dropdown-menu')).toBeHidden();
  });

  test('submenu renders when item has children', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = '<button id="dd-trigger">Menu</button>';
      (window as any).__dd = (window as any).Teryx.dropdown({
        trigger: '#dd-trigger',
        items: [
          { label: 'Parent', children: [
            { label: 'Child 1' },
            { label: 'Child 2' }
          ]}
        ]
      });
    });
    await page.locator('#dd-trigger').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-dropdown-submenu')).toBeAttached();
    await expect(page.locator('.tx-dropdown-item-arrow')).toBeVisible();
  });

  test('items with icons render icon elements', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = '<button id="dd-trigger">Menu</button>';
      (window as any).__dd = (window as any).Teryx.dropdown({
        trigger: '#dd-trigger',
        items: [
          { label: 'Edit', icon: 'edit' },
          { label: 'Delete', icon: 'trash' }
        ]
      });
    });
    await page.locator('#dd-trigger').click();
    await page.waitForTimeout(200);

    const icons = await count(page, '.tx-dropdown-item-icon');
    expect(icons).toBe(2);
  });
});
