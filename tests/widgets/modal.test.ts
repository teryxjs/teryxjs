import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { modal } from '../../src/widgets/modal';

describe('Modal widget', () => {
  let overlay: HTMLElement | null;

  afterEach(() => {
    // Clean up any modals appended to body
    document.querySelectorAll('.tx-modal-overlay').forEach(el => el.remove());
    document.body.classList.remove('tx-modal-open');
    overlay = null;
  });

  it('should create overlay in document.body', () => {
    const m = modal({ title: 'Test' });
    overlay = document.querySelector('.tx-modal-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay!.parentElement).toBe(document.body);
    m.destroy();
  });

  it('should start hidden (display:none)', () => {
    const m = modal({ title: 'Hidden' });
    overlay = document.querySelector('.tx-modal-overlay');
    expect(overlay!.style.display).toBe('none');
    m.destroy();
  });

  it('open() makes overlay visible and adds classes', async () => {
    const m = modal({ title: 'Open Test' });
    m.open();

    overlay = document.querySelector('.tx-modal-overlay');
    expect(overlay!.style.display).toBe('');

    // Wait for rAF to add classes
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(overlay!.classList.contains('tx-modal-active')).toBe(true);

    const dialog = overlay!.querySelector('.tx-modal') as HTMLElement;
    expect(dialog.classList.contains('tx-modal-enter')).toBe(true);
    m.destroy();
  });

  it('close() hides overlay', async () => {
    const m = modal({ title: 'Close Test' });
    m.open();
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(m.isOpen()).toBe(true);
    m.close();
    // After close(), the active class is removed immediately
    expect(m.isOpen()).toBe(false);
    m.destroy();
  });

  it('isOpen() reflects state', async () => {
    const m = modal({ title: 'isOpen Test' });
    expect(m.isOpen()).toBe(false);

    m.open();
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(m.isOpen()).toBe(true);

    m.destroy();
  });

  it('setContent() updates body', () => {
    const m = modal({ title: 'Content', content: 'original' });
    m.open();

    m.setContent('<p>new content</p>');

    overlay = document.querySelector('.tx-modal-overlay');
    const body = overlay!.querySelector('.tx-modal-body');
    expect(body!.innerHTML).toBe('<p>new content</p>');
    m.destroy();
  });

  it('setTitle() updates title', () => {
    const m = modal({ title: 'Original Title' });

    m.setTitle('New Title');

    overlay = document.querySelector('.tx-modal-overlay');
    const titleEl = overlay!.querySelector('.tx-modal-title');
    expect(titleEl!.textContent).toBe('New Title');
    m.destroy();
  });

  it('Escape key closes when keyboard=true', async () => {
    const m = modal({ title: 'Escape Test', keyboard: true });
    m.open();
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(m.isOpen()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(m.isOpen()).toBe(false);
    m.destroy();
  });

  it('Escape key does not close when keyboard=false', async () => {
    const m = modal({ title: 'No Escape', keyboard: false });
    m.open();
    await new Promise(resolve => requestAnimationFrame(resolve));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(m.isOpen()).toBe(true);
    m.destroy();
  });

  it('close button works', async () => {
    const m = modal({ title: 'Close Btn', closable: true });
    m.open();
    await new Promise(resolve => requestAnimationFrame(resolve));

    overlay = document.querySelector('.tx-modal-overlay');
    const closeBtn = overlay!.querySelector('.tx-modal-close') as HTMLElement;
    expect(closeBtn).not.toBeNull();

    closeBtn.click();
    expect(m.isOpen()).toBe(false);
    m.destroy();
  });

  it('should not show close button when closable=false', () => {
    const m = modal({ title: 'No Close', closable: false });

    overlay = document.querySelector('.tx-modal-overlay');
    const closeBtn = overlay!.querySelector('.tx-modal-close');
    expect(closeBtn).toBeNull();
    m.destroy();
  });

  it('destroy() removes from DOM', async () => {
    vi.useFakeTimers();
    const m = modal({ title: 'Destroy' });
    overlay = document.querySelector('.tx-modal-overlay');
    expect(overlay).not.toBeNull();

    m.destroy();
    vi.advanceTimersByTime(500);

    const overlays = document.querySelectorAll('.tx-modal-overlay');
    expect(overlays.length).toBe(0);
    vi.useRealTimers();
  });

  it('should render with correct size class', () => {
    const m = modal({ title: 'Large Modal', size: 'lg' });

    overlay = document.querySelector('.tx-modal-overlay');
    const dialog = overlay!.querySelector('.tx-modal') as HTMLElement;
    expect(dialog.classList.contains('tx-modal-lg')).toBe(true);
    m.destroy();
  });

  it('should render footer buttons', () => {
    const m = modal({
      title: 'Buttons',
      buttons: [
        { label: 'Cancel', variant: 'secondary' },
        { label: 'Save', variant: 'primary' },
      ],
    });

    overlay = document.querySelector('.tx-modal-overlay');
    const buttons = overlay!.querySelectorAll('.tx-modal-btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe('Cancel');
    expect(buttons[1].textContent).toBe('Save');
    m.destroy();
  });

  it('should call onOpen callback', async () => {
    const onOpen = vi.fn();
    const m = modal({ title: 'Callback', onOpen });
    m.open();
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(onOpen).toHaveBeenCalledTimes(1);
    m.destroy();
  });

  it('should call onClose callback', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const m = modal({ title: 'Close Callback', onClose });
    m.open();
    vi.advanceTimersByTime(16);

    m.close();
    vi.advanceTimersByTime(250);

    expect(onClose).toHaveBeenCalledTimes(1);
    m.destroy();
    vi.advanceTimersByTime(300);
    vi.useRealTimers();
  });

  it('should render content passed as string', () => {
    const m = modal({ title: 'Content', content: '<p>Hello World</p>' });

    overlay = document.querySelector('.tx-modal-overlay');
    const body = overlay!.querySelector('.tx-modal-body');
    expect(body!.innerHTML).toContain('<p>Hello World</p>');
    m.destroy();
  });

  it('should add tx-modal-open class to body when opened', async () => {
    const m = modal({ title: 'Body Class' });
    m.open();
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(document.body.classList.contains('tx-modal-open')).toBe(true);
    m.destroy();
  });

  it('backdrop click closes when backdrop is not static', async () => {
    const m = modal({ title: 'Backdrop', backdrop: true });
    m.open();
    await new Promise(resolve => requestAnimationFrame(resolve));

    overlay = document.querySelector('.tx-modal-overlay') as HTMLElement;
    // Simulate clicking on the overlay itself (not the dialog)
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(m.isOpen()).toBe(false);
    m.destroy();
  });

  it('backdrop click does NOT close when backdrop is static', async () => {
    const m = modal({ title: 'Static Backdrop', backdrop: 'static' });
    m.open();
    await new Promise(resolve => requestAnimationFrame(resolve));

    overlay = document.querySelector('.tx-modal-overlay') as HTMLElement;
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(m.isOpen()).toBe(true);
    m.destroy();
  });
});
