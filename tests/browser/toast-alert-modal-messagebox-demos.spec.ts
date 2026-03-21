import { test, expect } from '@playwright/test';

test.describe('Explorer — Toast Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#feedback-toast');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 4 toast demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('toast types demo renders 4 buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Toast Types');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(4);
  });

  test('clicking a toast type button shows a toast notification', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await demo.locator('.ex-demo-body button').first().click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-toast')).toHaveCount(1);
  });

  test('toast positions demo renders 6 position buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Toast Positions');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(6);
  });

  test('toast duration demo renders 4 duration buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Toast Duration');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(4);
  });

  test('toast stacking demo fires multiple toasts', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Toast Stacking');

    await demo.locator('.ex-demo-body button').click();
    await page.waitForTimeout(300);

    const toasts = page.locator('.tx-toast');
    expect(await toasts.count()).toBe(3);
  });
});

test.describe('Explorer — Alert Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#feedback-alert');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 7 alert demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(7);
  });

  test('info alert demo renders alert with correct type', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Info Alert');
    await expect(demo.locator('.tx-alert-info')).toBeVisible();
  });

  test('success alert demo renders alert', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Success Alert');
    await expect(demo.locator('.tx-alert-success')).toBeVisible();
  });

  test('warning alert demo renders alert', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Warning Alert');
    await expect(demo.locator('.tx-alert-warning')).toBeVisible();
  });

  test('danger alert demo renders alert', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Danger Alert');
    await expect(demo.locator('.tx-alert-danger')).toBeVisible();
  });

  test('closable alert has dismiss button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(4);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Closable Alert');
    await expect(demo.locator('.tx-alert-close')).toBeVisible();
  });

  test('alerts with icons demo shows two alerts', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(5);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Alerts with Icons');

    const alerts = demo.locator('.tx-alert');
    expect(await alerts.count()).toBe(2);
  });

  test('alert without title has no title element', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(6);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Alert without Title');
    await expect(demo.locator('.tx-alert-title')).toHaveCount(0);
    await expect(demo.locator('.tx-alert-message')).toBeVisible();
  });
});

test.describe('Explorer — Modal Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#feedback-modal');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 4 modal demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(4);
  });

  test('basic modal demo has open button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Basic Modal');
    await expect(demo.locator('.ex-demo-body button')).toBeVisible();
  });

  test('clicking basic modal button opens a modal', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await demo.locator('.ex-demo-body button').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-modal-active')).toBeVisible();
    await expect(page.locator('.tx-modal-title')).toHaveText('Basic Modal');
  });

  test('modal sizes demo has 4 size buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Modal Sizes');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(4);
  });

  test('stacking modals demo opens a modal', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Stacking Modals');

    await demo.locator('.ex-demo-body > button').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-modal-active')).toBeVisible();
    await expect(page.locator('.tx-modal-title').first()).toHaveText('First Modal');
  });

  test('confirm dialog demo has delete button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('Confirm Dialog');
    await expect(demo.locator('button.tx-btn-warning')).toBeVisible();
  });

  test('confirm dialog opens modal with two buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(3);
    await demo.locator('button.tx-btn-warning').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-modal-active')).toBeVisible();

    const buttons = page.locator('.tx-modal-btn');
    expect(await buttons.count()).toBe(2);
  });
});

test.describe('Explorer — MessageBox Demos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explorer/#feedback-messagebox');
    await page.waitForFunction(() => typeof (window as any).Teryx !== 'undefined');
    await page.waitForTimeout(300);
  });

  test('renders all 3 messagebox demo sections', async ({ page }) => {
    const demos = page.locator('.ex-demo');
    expect(await demos.count()).toBe(3);
  });

  test('messagebox alert demo has show alert button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('MessageBox Alert');
    await expect(demo.locator('button')).toBeVisible();
  });

  test('clicking show alert opens a message box', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(0);
    await demo.locator('button').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-modal-active')).toBeVisible();
    await expect(page.locator('.tx-msgbox-message')).toHaveText('The operation completed successfully.');
  });

  test('messagebox confirm demo has show confirm button', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('MessageBox Confirm');
    await expect(demo.locator('button.tx-btn-warning')).toBeVisible();
  });

  test('clicking confirm opens dialog with cancel and ok', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(1);
    await demo.locator('button.tx-btn-warning').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-modal-active')).toBeVisible();

    const buttons = page.locator('.tx-modal-btn');
    expect(await buttons.count()).toBe(2);
    await expect(buttons.nth(0)).toHaveText('Cancel');
    await expect(buttons.nth(1)).toHaveText('OK');
  });

  test('messagebox types demo has 3 type buttons', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await expect(demo.locator('.ex-demo-header h3')).toHaveText('MessageBox Types');

    const buttons = demo.locator('.ex-demo-body button');
    expect(await buttons.count()).toBe(3);
  });

  test('clicking success type opens success message box', async ({ page }) => {
    const demo = page.locator('.ex-demo').nth(2);
    await demo.locator('button.tx-btn-success').click();
    await page.waitForTimeout(200);

    await expect(page.locator('.tx-modal-active')).toBeVisible();
    await expect(page.locator('.tx-msgbox-icon-success')).toBeVisible();
  });
});
