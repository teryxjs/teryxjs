import { describe, it, expect, afterEach, vi } from 'vitest';
import toast from '../../src/widgets/toast';

describe('Toast widget', () => {
  afterEach(() => {
    // Only remove individual toasts, NOT the containers (they're cached in a module-level Map)
    document.querySelectorAll('.tx-toast').forEach(el => el.remove());
  });

  it('should create container element', () => {
    toast({ message: 'Hello', duration: 0 });

    const container = document.querySelector('.tx-toast-container');
    expect(container).not.toBeNull();
    expect(container!.parentElement).toBe(document.body);
  });

  it('should add toast to container', () => {
    toast({ message: 'Test toast', duration: 0 });

    const toastEl = document.querySelector('.tx-toast');
    expect(toastEl).not.toBeNull();

    const message = document.querySelector('.tx-toast-message');
    expect(message!.textContent).toBe('Test toast');
  });

  it('dismiss() removes toast', () => {
    vi.useFakeTimers();
    const t = toast({ message: 'Dismiss me', duration: 0 });

    let toastEl = document.querySelector('.tx-toast');
    expect(toastEl).not.toBeNull();

    t.dismiss();
    vi.advanceTimersByTime(350);

    toastEl = document.querySelector('.tx-toast');
    expect(toastEl).toBeNull();
    vi.useRealTimers();
  });

  it('auto-dismiss after duration', () => {
    vi.useFakeTimers();
    toast({ message: 'Auto dismiss', duration: 1000 });

    let toastEl = document.querySelector('.tx-toast');
    expect(toastEl).not.toBeNull();

    vi.advanceTimersByTime(1000);
    // After dismiss timeout, toast-leave class added, then removed after 300ms
    vi.advanceTimersByTime(350);

    toastEl = document.querySelector('.tx-toast');
    expect(toastEl).toBeNull();
    vi.useRealTimers();
  });

  it('does not auto-dismiss when duration is 0', () => {
    vi.useFakeTimers();
    toast({ message: 'No auto dismiss', duration: 0 });

    vi.advanceTimersByTime(10000);

    const toastEl = document.querySelector('.tx-toast');
    expect(toastEl).not.toBeNull();
    vi.useRealTimers();
  });

  it('toast.info creates info toast', () => {
    toast.info('Info message', { duration: 0 });

    const toastEl = document.querySelector('.tx-toast-info');
    expect(toastEl).not.toBeNull();
    expect(toastEl!.querySelector('.tx-toast-message')!.textContent).toBe('Info message');
  });

  it('toast.success creates success toast', () => {
    toast.success('Success!', { duration: 0 });

    const toastEl = document.querySelector('.tx-toast-success');
    expect(toastEl).not.toBeNull();
  });

  it('toast.warning creates warning toast', () => {
    toast.warning('Warning!', { duration: 0 });

    const toastEl = document.querySelector('.tx-toast-warning');
    expect(toastEl).not.toBeNull();
  });

  it('toast.danger creates danger toast', () => {
    toast.danger('Error!', { duration: 0 });

    const toastEl = document.querySelector('.tx-toast-danger');
    expect(toastEl).not.toBeNull();
  });

  it('toast.error is alias for toast.danger', () => {
    toast.error('Error alias!', { duration: 0 });

    const toastEl = document.querySelector('.tx-toast-danger');
    expect(toastEl).not.toBeNull();
  });

  it('position classes applied correctly', () => {
    toast({ message: 'Top Right', position: 'top-right', duration: 0 });
    const topRight = document.querySelector('.tx-toast-top-right');
    expect(topRight).not.toBeNull();

    toast({ message: 'Bottom Left', position: 'bottom-left', duration: 0 });
    const bottomLeft = document.querySelector('.tx-toast-bottom-left');
    expect(bottomLeft).not.toBeNull();

    toast({ message: 'Top Center', position: 'top-center', duration: 0 });
    const topCenter = document.querySelector('.tx-toast-top-center');
    expect(topCenter).not.toBeNull();
  });

  it('should render title when provided', () => {
    toast({ message: 'Body', title: 'Title', duration: 0 });

    const title = document.querySelector('.tx-toast-title');
    expect(title).not.toBeNull();
    expect(title!.textContent).toBe('Title');
  });

  it('should render close button when closable', () => {
    toast({ message: 'Closable', closable: true, duration: 0 });

    const closeBtn = document.querySelector('.tx-toast-close');
    expect(closeBtn).not.toBeNull();
  });

  it('close button dismisses toast', () => {
    vi.useFakeTimers();
    toast({ message: 'Click close', closable: true, duration: 0 });

    const closeBtn = document.querySelector('.tx-toast-close') as HTMLElement;
    expect(closeBtn).not.toBeNull();
    closeBtn.click();

    vi.advanceTimersByTime(350);

    const toastEl = document.querySelector('.tx-toast');
    expect(toastEl).toBeNull();
    vi.useRealTimers();
  });

  it('should not show close button when closable is false', () => {
    toast({ message: 'Not closable', closable: false, duration: 0 });

    const closeBtn = document.querySelector('.tx-toast-close');
    expect(closeBtn).toBeNull();
  });

  it('should render progress bar when duration > 0', () => {
    vi.useFakeTimers();
    toast({ message: 'With progress', duration: 5000 });

    const progressBar = document.querySelector('.tx-toast-progress-bar') as HTMLElement;
    expect(progressBar).not.toBeNull();
    expect(progressBar.style.animationDuration).toBe('5000ms');
    vi.useRealTimers();
  });

  it('should not render progress bar when duration is 0', () => {
    toast({ message: 'No progress', duration: 0 });

    const progressBar = document.querySelector('.tx-toast-progress');
    expect(progressBar).toBeNull();
  });

  it('should render icon for each type', () => {
    toast({ message: 'Info', type: 'info', duration: 0 });
    const iconEl = document.querySelector('.tx-toast-icon');
    expect(iconEl).not.toBeNull();
    expect(iconEl!.innerHTML).toContain('<svg');
  });

  it('should render action button when action is provided', () => {
    const handler = vi.fn();
    toast({
      message: 'With action',
      duration: 0,
      action: { label: 'Undo', handler },
    });

    const actionBtn = document.querySelector('.tx-toast-action') as HTMLElement;
    expect(actionBtn).not.toBeNull();
    expect(actionBtn.textContent).toBe('Undo');
  });

  it('multiple toasts can coexist', () => {
    toast({ message: 'Toast 1', duration: 0 });
    toast({ message: 'Toast 2', duration: 0 });
    toast({ message: 'Toast 3', duration: 0 });

    const toasts = document.querySelectorAll('.tx-toast');
    expect(toasts.length).toBe(3);
  });
});
