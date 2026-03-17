import { test, expect } from '@playwright/test';
import { setupPage, count } from './helpers';

const SALES_DATA = [
  { region: 'North', product: 'Widget', quarter: 'Q1', revenue: 100, units: 10 },
  { region: 'North', product: 'Widget', quarter: 'Q2', revenue: 150, units: 15 },
  { region: 'North', product: 'Gadget', quarter: 'Q1', revenue: 200, units: 20 },
  { region: 'South', product: 'Widget', quarter: 'Q1', revenue: 120, units: 12 },
  { region: 'South', product: 'Widget', quarter: 'Q2', revenue: 180, units: 18 },
  { region: 'South', product: 'Gadget', quarter: 'Q1', revenue: 90, units: 9 },
  { region: 'South', product: 'Gadget', quarter: 'Q2', revenue: 110, units: 11 },
];

test.describe('PivotGrid Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('renders a pivot table', async ({ page }) => {
    await page.evaluate((data) => {
      (window as any).Teryx.pivotGrid('#target', {
        source: JSON.stringify(data),
        rows: ['region'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });
    }, SALES_DATA);
    await expect(page.locator('.tx-pivot-table')).toBeVisible();
  });

  test('renders row labels', async ({ page }) => {
    await page.evaluate((data) => {
      (window as any).Teryx.pivotGrid('#target', {
        source: JSON.stringify(data),
        rows: ['region'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });
    }, SALES_DATA);
    await expect(page.locator('.tx-pivot-row-label').filter({ hasText: 'North' })).toBeVisible();
    await expect(page.locator('.tx-pivot-row-label').filter({ hasText: 'South' })).toBeVisible();
  });

  test('computes correct sum aggregates', async ({ page }) => {
    await page.evaluate((data) => {
      (window as any).Teryx.pivotGrid('#target', {
        source: JSON.stringify(data),
        rows: ['region'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });
    }, SALES_DATA);
    const firstCell = await page
      .locator('.tx-pivot-data-row .tx-pivot-cell:not(.tx-pivot-total)')
      .first()
      .textContent();
    expect(Number(firstCell)).toBe(450);
  });

  test('renders column headers', async ({ page }) => {
    await page.evaluate((data) => {
      (window as any).Teryx.pivotGrid('#target', {
        source: JSON.stringify(data),
        rows: ['region'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });
    }, SALES_DATA);
    await expect(page.locator('.tx-pivot-col-header').filter({ hasText: 'Q1' })).toBeVisible();
    await expect(page.locator('.tx-pivot-col-header').filter({ hasText: 'Q2' })).toBeVisible();
  });

  test('renders grand total row', async ({ page }) => {
    await page.evaluate((data) => {
      (window as any).Teryx.pivotGrid('#target', {
        source: JSON.stringify(data),
        rows: ['region'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });
    }, SALES_DATA);
    await expect(page.locator('.tx-pivot-grand-total-row')).toContainText('Grand Total');
    const grandCell = await page.locator('.tx-pivot-grand-total').first().textContent();
    expect(Number(grandCell)).toBe(950);
  });

  test('expandable groups with multiple row fields', async ({ page }) => {
    await page.evaluate((data) => {
      (window as any).Teryx.pivotGrid('#target', {
        source: JSON.stringify(data),
        rows: ['region', 'product'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });
    }, SALES_DATA);
    const groups = await count(page, '.tx-pivot-group-row');
    expect(groups).toBe(2);
    const dataRows = await count(page, '.tx-pivot-data-row');
    expect(dataRows).toBeGreaterThan(0);
  });

  test('clicking group row collapses detail rows', async ({ page }) => {
    await page.evaluate((data) => {
      (window as any).Teryx.pivotGrid('#target', {
        source: JSON.stringify(data),
        rows: ['region', 'product'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });
    }, SALES_DATA);
    const initialRows = await count(page, '.tx-pivot-data-row');
    await page.locator('.tx-pivot-group-row').first().click();
    await page.waitForTimeout(100);
    const afterRows = await count(page, '.tx-pivot-data-row');
    expect(afterRows).toBeLessThan(initialRows);
  });

  test('refresh updates with new data', async ({ page }) => {
    await page.evaluate((data) => {
      (window as any).__pv = (window as any).Teryx.pivotGrid('#target', {
        source: JSON.stringify(data),
        rows: ['region'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });
    }, SALES_DATA);
    await page.evaluate(() => {
      (window as any).__pv.refresh([
        { region: 'East', revenue: 300 },
        { region: 'West', revenue: 400 },
      ]);
    });
    await page.waitForTimeout(100);
    await expect(page.locator('.tx-pivot-row-label').filter({ hasText: 'East' })).toBeVisible();
    await expect(page.locator('.tx-pivot-row-label').filter({ hasText: 'West' })).toBeVisible();
  });

  test('getAggregatedData returns results', async ({ page }) => {
    await page.evaluate((data) => {
      (window as any).__pv = (window as any).Teryx.pivotGrid('#target', {
        source: JSON.stringify(data),
        rows: ['region'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });
    }, SALES_DATA);
    const result = await page.evaluate(() => (window as any).__pv.getAggregatedData());
    expect(result.length).toBe(2);
    const north = result.find((d: Record<string, unknown>) => d.region === 'North');
    expect(north.revenue_sum).toBe(450);
  });

  test('destroy clears the widget', async ({ page }) => {
    await page.evaluate((data) => {
      (window as any).__pv = (window as any).Teryx.pivotGrid('#target', {
        source: JSON.stringify(data),
        rows: ['region'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });
    }, SALES_DATA);
    await expect(page.locator('.tx-pivot-table')).toBeVisible();
    await page.evaluate(() => (window as any).__pv.destroy());
    await page.waitForTimeout(100);
    const tables = await count(page, '.tx-pivot-table');
    expect(tables).toBe(0);
  });
});
