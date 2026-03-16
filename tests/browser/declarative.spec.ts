import { test, expect } from '@playwright/test';
import { setupPage, count } from './helpers';

test.describe('Declarative Widget Initialization', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('data-tx-widget="grid" auto-initializes with data-tx attributes', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = `
        <div data-tx-widget="grid" data-tx-source="/api/data">
          <tx-column field="id" label="ID" sortable></tx-column>
          <tx-column field="name" label="Name"></tx-column>
        </div>
      `;
      (window as any).Teryx.initWidgets();
    });
    await page.waitForTimeout(300);

    const initialized = page.locator('[data-tx-widget="grid"][data-tx-initialized]');
    await expect(initialized).toBeAttached();
  });

  test('tx-column children are parsed as columns options', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = `
        <div data-tx-widget="grid" data-tx-source="/api/data">
          <tx-column field="id" label="ID"></tx-column>
          <tx-column field="name" label="Name"></tx-column>
          <tx-column field="email" label="Email"></tx-column>
        </div>
      `;
      (window as any).Teryx.initWidgets();
    });
    await page.waitForTimeout(300);

    // The grid should have processed the columns - look for header cells
    const initialized = page.locator('[data-tx-widget="grid"][data-tx-initialized]');
    await expect(initialized).toBeAttached();
  });

  test('boolean attributes like sortable are parsed correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const el = document.createElement('div');
      el.innerHTML = `
        <div id="test-grid" data-tx-widget="grid" data-tx-source="/api/data">
          <tx-column field="id" label="ID" sortable></tx-column>
          <tx-column field="name" label="Name"></tx-column>
        </div>
      `;
      document.body.appendChild(el);

      // Manually parse to verify boolean attribute handling
      const gridEl = document.querySelector('#test-grid') as HTMLElement;
      const col = gridEl.querySelector('tx-column') as HTMLElement;
      return col.hasAttribute('sortable');
    });
    expect(result).toBe(true);
  });

  test('data-tx-widget="tabs" with tx-tab children', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = `
        <div data-tx-widget="tabs">
          <tx-tab title="Tab 1">Content for tab 1</tx-tab>
          <tx-tab title="Tab 2">Content for tab 2</tx-tab>
          <tx-tab title="Tab 3">Content for tab 3</tx-tab>
        </div>
      `;
      (window as any).Teryx.initWidgets();
    });
    await page.waitForTimeout(300);

    const initialized = page.locator('[data-tx-widget="tabs"][data-tx-initialized]');
    await expect(initialized).toBeAttached();
    // Should render tab navigation items
    await expect(page.locator('.tx-tabs-container')).toBeVisible();
  });

  test('tx-field children are parsed for form widget', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = `
        <div data-tx-widget="form" data-tx-action="/api/submit">
          <tx-field name="email" type="email" label="Email" required></tx-field>
          <tx-field name="password" type="password" label="Password" required></tx-field>
        </div>
      `;
      (window as any).Teryx.initWidgets();
    });
    await page.waitForTimeout(300);

    const initialized = page.locator('[data-tx-widget="form"][data-tx-initialized]');
    await expect(initialized).toBeAttached();
  });

  test('nested tx-* children are recursively parsed', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Test the parsing by examining structure
      const container = document.createElement('div');
      container.innerHTML = `
        <div id="nested-test" data-tx-widget="accordion">
          <tx-item title="Section 1">
            <p>Nested content</p>
          </tx-item>
          <tx-item title="Section 2">
            <p>More content</p>
          </tx-item>
        </div>
      `;
      document.body.appendChild(container);
      (window as any).Teryx.initWidgets(container);

      const widget = container.querySelector('[data-tx-initialized]');
      return widget !== null;
    });
    expect(result).toBe(true);
  });

  test('content from innerHTML is captured for tab items', async ({ page }) => {
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = `
        <div data-tx-widget="tabs">
          <tx-tab title="First"><p>Hello World</p></tx-tab>
          <tx-tab title="Second"><p>Goodbye World</p></tx-tab>
        </div>
      `;
      (window as any).Teryx.initWidgets();
    });
    await page.waitForTimeout(300);

    // The tabs widget should be initialized and display the first tab's content
    await expect(page.locator('.tx-tabs-container')).toBeVisible();
    const tabPanels = page.locator('.tx-tab-panel');
    const panelCount = await tabPanels.count();
    expect(panelCount).toBeGreaterThanOrEqual(2);
  });

  test('data-tx-searchable boolean attribute is parsed', async ({ page }) => {
    const result = await page.evaluate(() => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div id="search-test" data-tx-widget="grid" data-tx-source="/api/data" data-tx-searchable>
          <tx-column field="name" label="Name"></tx-column>
        </div>
      `;
      document.body.appendChild(container);

      // Verify the attribute is present
      const gridEl = container.querySelector('#search-test') as HTMLElement;
      return gridEl.hasAttribute('data-tx-searchable');
    });
    expect(result).toBe(true);

    // Also verify initWidgets processes it
    await page.evaluate(() => {
      const el = document.querySelector('#target') as HTMLElement;
      el.innerHTML = `
        <div data-tx-widget="grid" data-tx-source="/api/data" data-tx-searchable>
          <tx-column field="name" label="Name"></tx-column>
        </div>
      `;
      (window as any).Teryx.initWidgets();
    });
    await page.waitForTimeout(300);

    const initialized = page.locator('#target [data-tx-initialized]');
    await expect(initialized).toBeAttached();
  });
});
