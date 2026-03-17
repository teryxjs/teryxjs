import { test, expect } from '@playwright/test';
import { setupPage, count } from './helpers';

test.describe('Tooltip Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });
  test('renders tooltip on hover', async ({ page }) => {
    await page.evaluate(() => {
      const btn = document.createElement('button');
      btn.id = 'tip-trigger';
      btn.textContent = 'Hover';
      document.getElementById('target')!.appendChild(btn);
      (window as any).Teryx.tooltip('#tip-trigger', { content: 'Hello tooltip', trigger: 'hover' });
    });
    await page.locator('#tip-trigger').hover();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-tooltip')).toBeVisible();
    await expect(page.locator('.tx-tooltip-content')).toHaveText('Hello tooltip');
  });
  test('click trigger toggles', async ({ page }) => {
    await page.evaluate(() => {
      const btn = document.createElement('button');
      btn.id = 'tip-trigger';
      btn.textContent = 'Click';
      document.getElementById('target')!.appendChild(btn);
      (window as any).__tip = (window as any).Teryx.tooltip('#tip-trigger', {
        content: 'Click tooltip',
        trigger: 'click',
      });
    });
    await page.locator('#tip-trigger').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-tooltip')).toBeVisible();
    await page.locator('#tip-trigger').click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as any).__tip.isVisible())).toBe(false);
  });
  test('has arrow', async ({ page }) => {
    await page.evaluate(() => {
      const btn = document.createElement('button');
      btn.id = 'tip-trigger';
      btn.textContent = 'Hover';
      document.getElementById('target')!.appendChild(btn);
      (window as any).Teryx.tooltip('#tip-trigger', { content: 'Arrow', trigger: 'hover' });
    });
    await page.locator('#tip-trigger').hover();
    await page.waitForTimeout(200);
    expect(await count(page, '.tx-tooltip-arrow')).toBe(1);
  });
});
test.describe('Popover Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });
  test('renders popover with title and body', async ({ page }) => {
    await page.evaluate(() => {
      const btn = document.createElement('button');
      btn.id = 'pop-trigger';
      btn.textContent = 'Click';
      document.getElementById('target')!.appendChild(btn);
      (window as any).Teryx.popover('#pop-trigger', { content: 'Body', title: 'Title', trigger: 'click' });
    });
    await page.locator('#pop-trigger').click();
    await page.waitForTimeout(200);
    await expect(page.locator('.tx-popover')).toBeVisible();
    await expect(page.locator('.tx-popover-title')).toHaveText('Title');
    await expect(page.locator('.tx-popover-body')).toHaveText('Body');
  });
  test('close button hides popover', async ({ page }) => {
    await page.evaluate(() => {
      const btn = document.createElement('button');
      btn.id = 'pop-trigger';
      btn.textContent = 'Click';
      document.getElementById('target')!.appendChild(btn);
      (window as any).__pop = (window as any).Teryx.popover('#pop-trigger', {
        content: 'Closable',
        title: 'T',
        trigger: 'click',
        closable: true,
      });
    });
    await page.locator('#pop-trigger').click();
    await page.waitForTimeout(200);
    await page.locator('.tx-popover-close').click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as any).__pop.isVisible())).toBe(false);
  });
});
