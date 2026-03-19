import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toast } from '../../src/widgets/toast';
import { alert } from '../../src/widgets/alert';
import { modal } from '../../src/widgets/modal';
import { messageBox } from '../../src/widgets/messagebox';

// ── Toast demos — unit tests ──
describe('Toast demos — unit tests', () => {
  afterEach(() => {
    // Only remove individual toasts, NOT containers (they're cached in a module-level Map)
    document.querySelectorAll('.tx-toast').forEach((el) => el.remove());
  });

  // ── Toast Types ──
  describe('Toast Types', () => {
    it('creates a success toast with correct class', () => {
      const t = toast({
        title: 'Success',
        message: 'Saved',
        type: 'success',
        duration: 0,
      });
      const el = document.querySelector('.tx-toast-success');
      expect(el).not.toBeNull();
      t.dismiss();
    });

    it('creates a danger toast with correct class', () => {
      const t = toast({
        title: 'Error',
        message: 'Failed',
        type: 'danger',
        duration: 0,
      });
      const el = document.querySelector('.tx-toast-danger');
      expect(el).not.toBeNull();
      t.dismiss();
    });

    it('creates a warning toast with correct class', () => {
      const t = toast({
        title: 'Warning',
        message: 'Careful',
        type: 'warning',
        duration: 0,
      });
      const el = document.querySelector('.tx-toast-warning');
      expect(el).not.toBeNull();
      t.dismiss();
    });

    it('creates an info toast with correct class', () => {
      const t = toast({
        title: 'Info',
        message: 'Note',
        type: 'info',
        duration: 0,
      });
      const el = document.querySelector('.tx-toast-info');
      expect(el).not.toBeNull();
      t.dismiss();
    });
  });

  // ── Toast Positions ──
  describe('Toast Positions', () => {
    it('creates a toast container for top-right position', () => {
      const t = toast({
        message: 'Top right',
        position: 'top-right',
        duration: 0,
      });
      const container = document.querySelector('.tx-toast-top-right');
      expect(container).not.toBeNull();
      t.dismiss();
    });

    it('creates a toast container for bottom-left position', () => {
      const t = toast({
        message: 'Bottom left',
        position: 'bottom-left',
        duration: 0,
      });
      const container = document.querySelector('.tx-toast-bottom-left');
      expect(container).not.toBeNull();
      t.dismiss();
    });

    it('creates a toast container for top-center position', () => {
      const t = toast({
        message: 'Top center',
        position: 'top-center',
        duration: 0,
      });
      const container = document.querySelector('.tx-toast-top-center');
      expect(container).not.toBeNull();
      t.dismiss();
    });
  });

  // ── Toast Duration ──
  describe('Toast Duration', () => {
    it('creates a persistent toast (duration 0) without progress bar animation', () => {
      const t = toast({ message: 'Persistent', duration: 0, type: 'info' });
      const progress = document.querySelector('.tx-toast-progress');
      expect(progress).toBeNull();
      t.dismiss();
    });

    it('creates a timed toast with progress bar', () => {
      const t = toast({ message: 'Timed', duration: 3000, type: 'info' });
      const progress = document.querySelector('.tx-toast-progress-bar');
      expect(progress).not.toBeNull();
      t.dismiss();
    });
  });

  // ── Toast Stacking ──
  describe('Toast Stacking', () => {
    it('can stack multiple toasts in the same container', () => {
      const t1 = toast({
        title: 'Toast 1',
        message: 'First',
        type: 'success',
        duration: 0,
      });
      const t2 = toast({
        title: 'Toast 2',
        message: 'Second',
        type: 'warning',
        duration: 0,
      });
      const t3 = toast({
        title: 'Toast 3',
        message: 'Third',
        type: 'info',
        duration: 0,
      });

      const toasts = document.querySelectorAll('.tx-toast');
      expect(toasts.length).toBe(3);
      t1.dismiss();
      t2.dismiss();
      t3.dismiss();
    });
  });
});

// ── Alert demos — unit tests ──
describe('Alert demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Alert Types ──
  describe('Alert Types', () => {
    it('renders info alert', () => {
      alert(container, {
        type: 'info',
        title: 'Info',
        message: 'Info alert message.',
        dismissible: true,
      });
      expect(container.querySelector('.tx-alert-info')).not.toBeNull();
    });

    it('renders success alert', () => {
      alert(container, {
        type: 'success',
        title: 'Success',
        message: 'Success alert message.',
        dismissible: true,
      });
      expect(container.querySelector('.tx-alert-success')).not.toBeNull();
    });

    it('renders warning alert', () => {
      alert(container, {
        type: 'warning',
        title: 'Warning',
        message: 'Warning alert message.',
        dismissible: true,
      });
      expect(container.querySelector('.tx-alert-warning')).not.toBeNull();
    });

    it('renders danger alert', () => {
      alert(container, {
        type: 'danger',
        title: 'Danger',
        message: 'Danger alert message.',
        dismissible: true,
      });
      expect(container.querySelector('.tx-alert-danger')).not.toBeNull();
    });
  });

  // ── Closable Alert ──
  describe('Closable Alert', () => {
    it('renders dismissible alert with close button', () => {
      alert(container, {
        type: 'info',
        title: 'Dismissible',
        message: 'Click to dismiss.',
        dismissible: true,
      });
      expect(container.querySelector('.tx-alert-close')).not.toBeNull();
    });

    it('clicking close button removes the alert', () => {
      alert(container, {
        type: 'info',
        title: 'Dismissible',
        message: 'Click to dismiss.',
        dismissible: true,
      });
      const closeBtn = container.querySelector('.tx-alert-close') as HTMLElement;
      closeBtn.click();
      // After a short delay the alert should be leaving
      expect(container.querySelector('.tx-alert')?.classList.contains('tx-alert-leaving')).toBe(true);
    });
  });

  // ── Alert with Icons ──
  describe('Alerts with Icons', () => {
    it('renders alert with default icon', () => {
      alert(container, {
        type: 'success',
        title: 'With Icon',
        message: 'Default icon.',
      });
      expect(container.querySelector('.tx-alert-icon')).not.toBeNull();
    });

    it('renders alert without icon when icon is false', () => {
      alert(container, {
        type: 'warning',
        title: 'No Icon',
        message: 'Hidden icon.',
        icon: false,
      });
      expect(container.querySelector('.tx-alert-icon')).toBeNull();
    });
  });

  // ── Alert without Title ──
  describe('Alert without Title', () => {
    it('renders alert with message and no title', () => {
      alert(container, {
        type: 'info',
        message: 'Simple message only.',
      });
      expect(container.querySelector('.tx-alert-title')).toBeNull();
      expect(container.querySelector('.tx-alert-message')).not.toBeNull();
    });
  });
});

// ── Modal demos — unit tests ──
describe('Modal demos — unit tests', () => {
  afterEach(() => {
    document.querySelectorAll('.tx-modal-overlay').forEach((el) => el.remove());
    document.body.classList.remove('tx-modal-open');
  });

  // ── Basic Modal ──
  describe('Basic Modal', () => {
    it('creates a modal with title and content', () => {
      const m = modal({
        title: 'Basic Modal',
        content: '<p>Hello!</p>',
        buttons: [{ label: 'Close', variant: 'secondary', action: 'close' }],
      });

      expect(m.el).not.toBeNull();
      expect(m.el.querySelector('.tx-modal-title')?.textContent).toBe('Basic Modal');
      m.destroy();
    });

    it('opens and closes the modal', async () => {
      const m = modal({
        title: 'Basic Modal',
        content: '<p>Hello!</p>',
        buttons: [{ label: 'Close', variant: 'secondary', action: 'close' }],
      });

      m.open();
      // Wait for rAF to add tx-modal-active class
      await new Promise((resolve) => requestAnimationFrame(resolve));
      expect(m.isOpen()).toBe(true);
      m.close();
      // After close, isOpen should be false
      expect(m.isOpen()).toBe(false);
      m.destroy();
    });
  });

  // ── Modal Sizes ──
  describe('Modal Sizes', () => {
    it('creates small modal', () => {
      const m = modal({
        title: 'Small',
        size: 'sm',
        content: '<p>Small modal</p>',
      });
      expect(m.el.querySelector('.tx-modal-sm')).not.toBeNull();
      m.destroy();
    });

    it('creates large modal', () => {
      const m = modal({
        title: 'Large',
        size: 'lg',
        content: '<p>Large modal</p>',
      });
      expect(m.el.querySelector('.tx-modal-lg')).not.toBeNull();
      m.destroy();
    });

    it('creates xl modal', () => {
      const m = modal({
        title: 'XL',
        size: 'xl',
        content: '<p>XL modal</p>',
      });
      expect(m.el.querySelector('.tx-modal-xl')).not.toBeNull();
      m.destroy();
    });
  });

  // ── Stacking Modals ──
  describe('Stacking Modals', () => {
    it('can open two modals simultaneously', async () => {
      const m1 = modal({
        title: 'First',
        content: '<p>First modal</p>',
      });
      const m2 = modal({
        title: 'Second',
        size: 'sm',
        content: '<p>Second modal</p>',
      });

      m1.open();
      m2.open();
      // Wait for rAF to add tx-modal-active class
      await new Promise((resolve) => requestAnimationFrame(resolve));
      expect(m1.isOpen()).toBe(true);
      expect(m2.isOpen()).toBe(true);
      m2.close();
      m1.close();
      m1.destroy();
      m2.destroy();
    });
  });

  // ── Confirm Dialog ──
  describe('Confirm Dialog', () => {
    it('renders modal with Cancel and Delete buttons', () => {
      const m = modal({
        title: 'Confirm Delete',
        size: 'sm',
        content: '<p>Are you sure?</p>',
        buttons: [
          { label: 'Cancel', variant: 'secondary', action: 'close' },
          { label: 'Delete', variant: 'danger' },
        ],
      });

      const buttons = m.el.querySelectorAll('.tx-modal-btn');
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent).toBe('Cancel');
      expect(buttons[1].textContent).toBe('Delete');
      m.destroy();
    });
  });
});

// ── MessageBox demos — unit tests ──
describe('MessageBox demos — unit tests', () => {
  afterEach(() => {
    document.querySelectorAll('.tx-modal-overlay').forEach((el) => el.remove());
    document.body.classList.remove('tx-modal-open');
  });

  // ── MessageBox Alert ──
  describe('MessageBox Alert', () => {
    it('opens an alert message box with OK button', async () => {
      const p = messageBox.alert('Operation completed!', 'Alert');
      const overlay = document.querySelector('.tx-modal-overlay');
      expect(overlay).not.toBeNull();

      const title = overlay?.querySelector('.tx-modal-title');
      expect(title?.textContent).toBe('Alert');

      const msgEl = overlay?.querySelector('.tx-msgbox-message');
      expect(msgEl?.textContent).toBe('Operation completed!');

      // Click OK to resolve
      const okBtn = overlay?.querySelector('.tx-modal-btn') as HTMLElement;
      expect(okBtn?.textContent).toBe('OK');
      okBtn?.click();
      const result = await p;
      expect(result).toBe('ok');
    });
  });

  // ── MessageBox Confirm ──
  describe('MessageBox Confirm', () => {
    it('opens a confirm dialog with Cancel and OK buttons', async () => {
      const p = messageBox.confirm('Proceed?', 'Confirm');
      const overlay = document.querySelector('.tx-modal-overlay');
      expect(overlay).not.toBeNull();

      const buttons = overlay?.querySelectorAll('.tx-modal-btn');
      expect(buttons?.length).toBe(2);
      expect(buttons?.[0].textContent).toBe('Cancel');
      expect(buttons?.[1].textContent).toBe('OK');

      // Click OK
      (buttons?.[1] as HTMLElement)?.click();
      const result = await p;
      expect(result).toBe(true);
    });

    it('returns false when Cancel is clicked', async () => {
      const p = messageBox.confirm('Proceed?', 'Confirm');
      const overlay = document.querySelector('.tx-modal-overlay');
      const buttons = overlay?.querySelectorAll('.tx-modal-btn');

      // Click Cancel
      (buttons?.[0] as HTMLElement)?.click();
      const result = await p;
      expect(result).toBe(false);
    });
  });

  // ── MessageBox Types ──
  describe('MessageBox Types', () => {
    it('opens a success message box', async () => {
      const p = messageBox.success('Saved!', 'Success');
      const overlay = document.querySelector('.tx-modal-overlay');
      expect(overlay).not.toBeNull();

      const icon = overlay?.querySelector('.tx-msgbox-icon-success');
      expect(icon).not.toBeNull();

      const okBtn = overlay?.querySelector('.tx-modal-btn') as HTMLElement;
      okBtn?.click();
      await p;
    });

    it('opens a warning message box', async () => {
      const p = messageBox.warning('Careful!', 'Warning');
      const overlay = document.querySelector('.tx-modal-overlay');
      expect(overlay).not.toBeNull();

      const icon = overlay?.querySelector('.tx-msgbox-icon-warning');
      expect(icon).not.toBeNull();

      const okBtn = overlay?.querySelector('.tx-modal-btn') as HTMLElement;
      okBtn?.click();
      await p;
    });

    it('opens an error message box', async () => {
      const p = messageBox.error('Failed!', 'Error');
      const overlay = document.querySelector('.tx-modal-overlay');
      expect(overlay).not.toBeNull();

      const icon = overlay?.querySelector('.tx-msgbox-icon-error');
      expect(icon).not.toBeNull();

      const okBtn = overlay?.querySelector('.tx-modal-btn') as HTMLElement;
      okBtn?.click();
      await p;
    });
  });
});
