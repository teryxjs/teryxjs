import { test, expect } from '@playwright/test';
import { setupPage, mockAPI, createWidget, assertExists, assertNotExists, count } from './helpers';

test.describe('Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders tab buttons and panels', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'First', content: '<p>Tab 1 content</p>' },
          { id: 'tab2', title: 'Second', content: '<p>Tab 2 content</p>' },
          { id: 'tab3', title: 'Third', content: '<p>Tab 3 content</p>' },
        ],
      });
    `,
    );
    const tabButtons = page.locator('.tx-tab:not(.tx-tab-add)');
    await expect(tabButtons).toHaveCount(3);

    const tabPanels = page.locator('.tx-tab-panel');
    await expect(tabPanels).toHaveCount(3);
  });

  test('first tab is active by default', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'First', content: '<p>Content 1</p>' },
          { id: 'tab2', title: 'Second', content: '<p>Content 2</p>' },
        ],
      });
    `,
    );
    const firstTab = page.locator('.tx-tab[data-tab="tab1"]');
    await expect(firstTab).toHaveClass(/tx-tab-active/);

    const firstPanel = page.locator('.tx-tab-panel[data-tab="tab1"]');
    await expect(firstPanel).toHaveClass(/tx-tab-panel-active/);
    await expect(firstPanel).not.toHaveAttribute('aria-hidden', 'true');

    const secondPanel = page.locator('.tx-tab-panel[data-tab="tab2"]');
    await expect(secondPanel).toHaveAttribute('aria-hidden', 'true');
  });

  test('clicking a tab switches active tab', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'First', content: '<p>Content 1</p>' },
          { id: 'tab2', title: 'Second', content: '<p>Content 2</p>' },
        ],
      });
    `,
    );

    // Click second tab
    await page.locator('.tx-tab[data-tab="tab2"]').click();
    await page.waitForTimeout(100);

    const secondTab = page.locator('.tx-tab[data-tab="tab2"]');
    await expect(secondTab).toHaveClass(/tx-tab-active/);

    const secondPanel = page.locator('.tx-tab-panel[data-tab="tab2"]');
    await expect(secondPanel).toHaveClass(/tx-tab-panel-active/);
    await expect(secondPanel).not.toHaveAttribute('aria-hidden', 'true');

    // First tab should no longer be active
    const firstTab = page.locator('.tx-tab[data-tab="tab1"]');
    await expect(firstTab).not.toHaveClass(/tx-tab-active/);

    const firstPanel = page.locator('.tx-tab-panel[data-tab="tab1"]');
    await expect(firstPanel).toHaveAttribute('aria-hidden', 'true');
  });

  test('disabled tab does not switch on click', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'Active', content: '<p>Active</p>' },
          { id: 'tab2', title: 'Disabled', content: '<p>Disabled</p>', disabled: true },
        ],
      });
    `,
    );

    const disabledTab = page.locator('.tx-tab[data-tab="tab2"]');
    await expect(disabledTab).toHaveClass(/tx-tab-disabled/);

    await disabledTab.click({ force: true });
    await page.waitForTimeout(100);

    // First tab should still be active
    const firstTab = page.locator('.tx-tab[data-tab="tab1"]');
    await expect(firstTab).toHaveClass(/tx-tab-active/);

    // Disabled tab should not become active
    await expect(disabledTab).not.toHaveClass(/tx-tab-active/);
  });

  test('tab content is displayed correctly', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'Info', content: '<p class="info-text">Information panel</p>' },
        ],
      });
    `,
    );
    const content = page.locator('.tx-tab-panel-active .info-text');
    await expect(content).toHaveText('Information panel');
  });

  test('activate method programmatically switches tab', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__tabs = Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'First', content: '<p>First</p>' },
          { id: 'tab2', title: 'Second', content: '<p>Second</p>' },
          { id: 'tab3', title: 'Third', content: '<p>Third</p>' },
        ],
      });
    `,
    );

    await page.evaluate(() => (window as any).__tabs.activate('tab3'));
    await page.waitForTimeout(100);

    const thirdTab = page.locator('.tx-tab[data-tab="tab3"]');
    await expect(thirdTab).toHaveClass(/tx-tab-active/);

    const thirdPanel = page.locator('.tx-tab-panel[data-tab="tab3"]');
    await expect(thirdPanel).toHaveClass(/tx-tab-panel-active/);
  });

  test('closable tab renders close button and removeTab removes it', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__tabs = Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'Permanent', content: '<p>Stays</p>' },
          { id: 'tab2', title: 'Closable', content: '<p>Can close</p>', closable: true },
        ],
      });
    `,
    );

    // Verify close button exists on the closable tab
    const closeBtn = page.locator('.tx-tab[data-tab="tab2"] .tx-tab-close');
    await expect(closeBtn).toHaveCount(1);

    // Close the tab using the close button
    await closeBtn.click();
    await page.waitForTimeout(100);

    // Tab should be removed
    const closedTab = page.locator('.tx-tab[data-tab="tab2"]');
    await expect(closedTab).toHaveCount(0);

    const closedPanel = page.locator('.tx-tab-panel[data-tab="tab2"]');
    await expect(closedPanel).toHaveCount(0);
  });

  test('lazy load source tab has xh-trigger="none" for inactive tab', async ({ page }) => {
    await mockAPI(page, '/api/tab-data', { content: 'loaded' });
    await createWidget(
      page,
      `
      Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'Static', content: '<p>Static content</p>' },
          { id: 'tab2', title: 'Dynamic', source: '/api/tab-data' },
        ],
      });
    `,
    );

    // The inactive source tab should have xh-trigger="none" to defer loading
    const xhEl = page.locator('.tx-tab-panel[data-tab="tab2"] [xh-get]');
    await expect(xhEl).toHaveAttribute('xh-trigger', 'none');
  });

  test('addTab dynamically adds a new tab', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__tabs = Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'First', content: '<p>First</p>' },
        ],
      });
    `,
    );

    await page.evaluate(() => {
      (window as any).__tabs.addTab({
        id: 'tab-new',
        title: 'New Tab',
        content: '<p>New content</p>',
      });
    });
    await page.waitForTimeout(100);

    const newTab = page.locator('.tx-tab[data-tab="tab-new"]');
    await expect(newTab).toHaveCount(1);

    const newPanel = page.locator('.tx-tab-panel[data-tab="tab-new"]');
    await expect(newPanel).toHaveCount(1);
  });

  test('removeTab programmatically removes a tab', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__tabs = Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'First', content: '<p>First</p>' },
          { id: 'tab2', title: 'Second', content: '<p>Second</p>' },
        ],
      });
    `,
    );

    await page.evaluate(() => (window as any).__tabs.removeTab('tab2'));
    await page.waitForTimeout(100);

    const removed = page.locator('.tx-tab[data-tab="tab2"]');
    await expect(removed).toHaveCount(0);

    const removedPanel = page.locator('.tx-tab-panel[data-tab="tab2"]');
    await expect(removedPanel).toHaveCount(0);
  });

  test('activeTab returns the correct active tab id', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__tabs = Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'First', content: '<p>First</p>' },
          { id: 'tab2', title: 'Second', content: '<p>Second</p>' },
        ],
      });
    `,
    );

    let activeId = await page.evaluate(() => (window as any).__tabs.activeTab());
    expect(activeId).toBe('tab1');

    await page.evaluate(() => (window as any).__tabs.activate('tab2'));
    await page.waitForTimeout(100);

    activeId = await page.evaluate(() => (window as any).__tabs.activeTab());
    expect(activeId).toBe('tab2');
  });

  test('tab with icon renders the icon element', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'Home', icon: 'home', content: '<p>Home</p>' },
        ],
      });
    `,
    );
    const iconEl = page.locator('.tx-tab[data-tab="tab1"] .tx-tab-icon');
    await expect(iconEl).toHaveCount(1);
  });

  test('tab with badge renders badge element', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'Messages', badge: '5', content: '<p>Messages</p>' },
        ],
      });
    `,
    );
    const badge = page.locator('.tx-tab[data-tab="tab1"] .tx-badge');
    await expect(badge).toHaveCount(1);
    await expect(badge).toHaveText('5');
  });

  test('destroy clears tab content', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__tabs = Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'First', content: '<p>First</p>' },
        ],
      });
    `,
    );
    await assertExists(page, '.tx-tabs-container');
    await page.evaluate(() => (window as any).__tabs.destroy());
    await page.waitForTimeout(100);
    await assertNotExists(page, '.tx-tabs-container');
  });

  test('getTabs returns list of tab ids', async ({ page }) => {
    await createWidget(
      page,
      `
      window.__tabs = Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'First', content: '<p>First</p>' },
          { id: 'tab2', title: 'Second', content: '<p>Second</p>' },
          { id: 'tab3', title: 'Third', content: '<p>Third</p>' },
        ],
      });
    `,
    );
    const tabIds = await page.evaluate(() => (window as any).__tabs.getTabs());
    expect(tabIds).toEqual(['tab1', 'tab2', 'tab3']);
  });

  test('content area height does not collapse during tab switch', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.tabs('#target', {
        items: [
          { id: 'tab1', title: 'First', content: '<p style="height:80px">Tall content</p>' },
          { id: 'tab2', title: 'Second', content: '<p style="height:80px">Also tall</p>' },
        ],
      });
    `,
    );

    const content = page.locator('.tx-tabs-content');
    const heightBefore = await content.evaluate((el) => el.getBoundingClientRect().height);
    expect(heightBefore).toBeGreaterThan(0);

    // Switch tabs and immediately measure — height must never hit zero
    await page.evaluate(() => {
      const container = document.querySelector('.tx-tabs-container')!;
      const contentEl = container.querySelector('.tx-tabs-content')!;
      (window as any).__minHeight = Infinity;

      const observer = new MutationObserver(() => {
        const h = contentEl.getBoundingClientRect().height;
        if (h < (window as any).__minHeight) (window as any).__minHeight = h;
      });
      observer.observe(container, { attributes: true, subtree: true, childList: true });
      (window as any).__observer = observer;
    });

    await page.locator('.tx-tab[data-tab="tab2"]').click();
    await page.waitForTimeout(100);

    const minHeight = await page.evaluate(() => {
      (window as any).__observer.disconnect();
      return (window as any).__minHeight;
    });

    // Content area should never have collapsed to zero
    expect(minHeight).toBeGreaterThan(0);

    const heightAfter = await content.evaluate((el) => el.getBoundingClientRect().height);
    expect(heightAfter).toBeGreaterThan(0);
  });

  test('variant class is applied', async ({ page }) => {
    await createWidget(
      page,
      `
      Teryx.tabs('#target', {
        variant: 'pills',
        items: [
          { id: 'tab1', title: 'First', content: '<p>First</p>' },
        ],
      });
    `,
    );
    await assertExists(page, '.tx-tabs-pills');
  });
});
