import { test, expect } from '@playwright/test';
import { setupPage, mockAPI, createWidget, assertExists, assertNotExists, count } from './helpers';

test.describe('Chart', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('bar chart renders SVG with bar elements', async ({ page }) => {
    await createWidget(page, `
      Teryx.chart('#target', {
        type: 'bar',
        width: 500,
        height: 350,
        data: [
          { x: 'Jan', y: 10 },
          { x: 'Feb', y: 25 },
          { x: 'Mar', y: 15 },
        ],
      });
    `);
    await page.waitForTimeout(200);
    await assertExists(page, '.tx-chart');
    await assertExists(page, '.tx-chart svg');

    const bars = await count(page, '.tx-chart-bar');
    expect(bars).toBe(3);
  });

  test('line chart renders SVG with path and dots', async ({ page }) => {
    await createWidget(page, `
      Teryx.chart('#target', {
        type: 'line',
        width: 500,
        height: 350,
        data: [
          { x: 'Mon', y: 5 },
          { x: 'Tue', y: 12 },
          { x: 'Wed', y: 8 },
          { x: 'Thu', y: 20 },
        ],
      });
    `);
    await page.waitForTimeout(200);
    await assertExists(page, '.tx-chart');

    const linePaths = await count(page, '.tx-chart-line');
    expect(linePaths).toBe(1);

    const dots = await count(page, '.tx-chart-dot');
    expect(dots).toBe(4);
  });

  test('pie chart renders SVG with slice paths', async ({ page }) => {
    await createWidget(page, `
      Teryx.chart('#target', {
        type: 'pie',
        width: 400,
        height: 400,
        data: [
          { x: 'Chrome', y: 60, label: 'Chrome' },
          { x: 'Firefox', y: 25, label: 'Firefox' },
          { x: 'Safari', y: 15, label: 'Safari' },
        ],
      });
    `);
    await page.waitForTimeout(200);
    await assertExists(page, '.tx-chart');

    const slices = await count(page, '.tx-chart-slice');
    expect(slices).toBe(3);
  });

  test('donut chart renders slices (with inner radius path)', async ({ page }) => {
    await createWidget(page, `
      Teryx.chart('#target', {
        type: 'donut',
        width: 400,
        height: 400,
        data: [
          { x: 'A', y: 40, label: 'A' },
          { x: 'B', y: 30, label: 'B' },
          { x: 'C', y: 30, label: 'C' },
        ],
      });
    `);
    await page.waitForTimeout(200);
    await assertExists(page, '.tx-chart');

    const slices = await count(page, '.tx-chart-slice');
    expect(slices).toBe(3);

    // Donut slices use path elements with arc commands that include the inner ring
    const pathEls = page.locator('.tx-chart-slice');
    const firstD = await pathEls.first().getAttribute('d');
    // Donut paths contain two arcs (outer and inner), so the 'd' attribute should contain 'A' more than once
    expect(firstD).toBeTruthy();
    if (firstD) {
      const arcCount = (firstD.match(/A /g) || []).length;
      expect(arcCount).toBe(2);
    }
  });

  test('gauge chart renders arc path', async ({ page }) => {
    await createWidget(page, `
      Teryx.chart('#target', {
        type: 'gauge',
        width: 400,
        height: 300,
        gaugeMin: 0,
        gaugeMax: 100,
        gaugeValue: 72,
        gaugeLabel: 'CPU Usage',
      });
    `);
    await page.waitForTimeout(200);
    await assertExists(page, '.tx-chart');
    await assertExists(page, '.tx-chart svg');

    // Gauge should render SVG paths (background and value arc)
    const paths = await count(page, '.tx-chart svg path');
    expect(paths).toBeGreaterThanOrEqual(2);

    // The gauge value text should be rendered
    const svgTexts = page.locator('.tx-chart svg text');
    const allTexts = await svgTexts.allTextContents();
    expect(allTexts.some(t => t.includes('72'))).toBe(true);
  });

  test('legend renders for multi-series charts', async ({ page }) => {
    await createWidget(page, `
      Teryx.chart('#target', {
        type: 'bar',
        width: 500,
        height: 350,
        series: [
          { name: 'Revenue', data: [{ x: 'Q1', y: 100 }, { x: 'Q2', y: 150 }] },
          { name: 'Expenses', data: [{ x: 'Q1', y: 80 }, { x: 'Q2', y: 120 }] },
        ],
        legend: { show: true },
      });
    `);
    await page.waitForTimeout(200);

    // Legend should render text labels for each series
    const svgTexts = page.locator('.tx-chart svg text');
    const allTexts = await svgTexts.allTextContents();
    expect(allTexts.some(t => t.includes('Revenue'))).toBe(true);
    expect(allTexts.some(t => t.includes('Expenses'))).toBe(true);
  });

  test('correct number of bars for multiple series', async ({ page }) => {
    await createWidget(page, `
      Teryx.chart('#target', {
        type: 'bar',
        width: 500,
        height: 350,
        series: [
          { name: 'Series A', data: [{ x: 'X1', y: 10 }, { x: 'X2', y: 20 }] },
          { name: 'Series B', data: [{ x: 'X1', y: 15 }, { x: 'X2', y: 25 }] },
        ],
      });
    `);
    await page.waitForTimeout(200);

    // 2 series x 2 data points = 4 bars
    const bars = await count(page, '.tx-chart-bar');
    expect(bars).toBe(4);
  });

  test('chart with static data renders without source', async ({ page }) => {
    await createWidget(page, `
      Teryx.chart('#target', {
        type: 'line',
        width: 500,
        height: 350,
        data: [
          { x: 'A', y: 1 },
          { x: 'B', y: 2 },
        ],
      });
    `);
    await page.waitForTimeout(200);
    await assertExists(page, '.tx-chart');
    await assertExists(page, '.tx-chart svg');

    const dots = await count(page, '.tx-chart-dot');
    expect(dots).toBe(2);
  });

  test('chart with source fetches data from mocked API', async ({ page }) => {
    await mockAPI(page, '/api/chart-data', {
      data: [
        { x: 'Jan', y: 100 },
        { x: 'Feb', y: 200 },
        { x: 'Mar', y: 150 },
      ],
    });
    await createWidget(page, `
      Teryx.chart('#target', {
        type: 'bar',
        width: 500,
        height: 350,
        source: '/api/chart-data',
      });
    `);
    // Wait for the fetch to resolve and re-render
    await page.waitForTimeout(500);

    const bars = await count(page, '.tx-chart-bar');
    expect(bars).toBe(3);
  });

  test('height option controls SVG height', async ({ page }) => {
    await createWidget(page, `
      Teryx.chart('#target', {
        type: 'bar',
        width: 600,
        height: 250,
        data: [
          { x: 'A', y: 10 },
        ],
      });
    `);
    await page.waitForTimeout(200);

    const svg = page.locator('.tx-chart svg');
    await expect(svg).toHaveAttribute('height', '250');
    await expect(svg).toHaveAttribute('width', '600');
  });

  test('chart title renders in SVG', async ({ page }) => {
    await createWidget(page, `
      Teryx.chart('#target', {
        type: 'bar',
        width: 500,
        height: 350,
        title: 'Monthly Revenue',
        data: [
          { x: 'Jan', y: 100 },
        ],
      });
    `);
    await page.waitForTimeout(200);

    const svgTexts = page.locator('.tx-chart svg text');
    const allTexts = await svgTexts.allTextContents();
    expect(allTexts.some(t => t.includes('Monthly Revenue'))).toBe(true);
  });

  test('destroy clears chart content', async ({ page }) => {
    await createWidget(page, `
      window.__chart = Teryx.chart('#target', {
        type: 'bar',
        width: 500,
        height: 350,
        data: [
          { x: 'A', y: 10 },
        ],
      });
    `);
    await page.waitForTimeout(200);
    await assertExists(page, '.tx-chart');

    await page.evaluate(() => (window as any).__chart.destroy());
    await page.waitForTimeout(100);
    await assertNotExists(page, '.tx-chart');
  });

  test('update method re-renders with new data', async ({ page }) => {
    await createWidget(page, `
      window.__chart = Teryx.chart('#target', {
        type: 'bar',
        width: 500,
        height: 350,
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
        ],
      });
    `);
    await page.waitForTimeout(200);
    let bars = await count(page, '.tx-chart-bar');
    expect(bars).toBe(2);

    await page.evaluate(() => {
      (window as any).__chart.update({
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 },
          { x: 'C', y: 30 },
        ],
      });
    });
    await page.waitForTimeout(200);

    bars = await count(page, '.tx-chart-bar');
    expect(bars).toBe(3);
  });
});
