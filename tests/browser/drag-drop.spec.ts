import { test, expect } from '@playwright/test';
import { setupPage, createWidget } from './helpers';

test.describe('Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test('draggable adds tx-draggable class', async ({ page }) => {
    await createWidget(
      page,
      `
      const el = document.createElement('div');
      el.id = 'drag-el';
      el.textContent = 'Drag me';
      document.getElementById('target').appendChild(el);
      Teryx.draggable(el, { data: 'hello' });
    `,
    );

    await expect(page.locator('#drag-el')).toHaveClass(/tx-draggable/);
  });

  test('droppable adds tx-droppable class', async ({ page }) => {
    await createWidget(
      page,
      `
      const el = document.createElement('div');
      el.id = 'drop-zone';
      el.style.width = '200px';
      el.style.height = '200px';
      document.getElementById('target').appendChild(el);
      Teryx.droppable(el, {});
    `,
    );

    await expect(page.locator('#drop-zone')).toHaveClass(/tx-droppable/);
  });

  test('drag and drop fires onDrop callback', async ({ page }) => {
    await createWidget(
      page,
      `
      const dragEl = document.createElement('div');
      dragEl.id = 'drag-item';
      dragEl.style.width = '50px';
      dragEl.style.height = '50px';
      dragEl.style.position = 'absolute';
      dragEl.style.left = '10px';
      dragEl.style.top = '10px';
      dragEl.textContent = 'Drag';
      document.getElementById('target').appendChild(dragEl);

      const dropEl = document.createElement('div');
      dropEl.id = 'drop-target';
      dropEl.style.width = '200px';
      dropEl.style.height = '200px';
      dropEl.style.position = 'absolute';
      dropEl.style.left = '200px';
      dropEl.style.top = '0px';
      dropEl.textContent = 'Drop Here';
      document.getElementById('target').appendChild(dropEl);

      window.__dropped = false;
      Teryx.draggable(dragEl, { data: { id: 1 } });
      Teryx.droppable(dropEl, {
        onDrop: (el, data) => { window.__dropped = data; }
      });
    `,
    );

    const drag = page.locator('#drag-item');
    const drop = page.locator('#drop-target');

    await drag.dragTo(drop);
    await page.waitForTimeout(200);

    const dropped = await page.evaluate(() => (window as any).__dropped);
    expect(dropped).toEqual({ id: 1 });
  });

  test('destroy removes classes and stops drag', async ({ page }) => {
    await createWidget(
      page,
      `
      const el = document.createElement('div');
      el.id = 'destroy-drag';
      el.textContent = 'Drag me';
      document.getElementById('target').appendChild(el);
      window.__dragInst = Teryx.draggable(el, { data: 'test' });
    `,
    );

    await expect(page.locator('#destroy-drag')).toHaveClass(/tx-draggable/);

    await page.evaluate(() => (window as any).__dragInst.destroy());
    await page.waitForTimeout(100);

    const hasClass = await page.evaluate(() =>
      document.getElementById('destroy-drag')!.classList.contains('tx-draggable'),
    );
    expect(hasClass).toBe(false);
  });
});
