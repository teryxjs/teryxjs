import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { alert } from '../../src/widgets/alert';

describe('Alert widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render with correct type class for info', () => {
    alert(container, { message: 'Info alert', type: 'info' });

    const alertEl = container.querySelector('.tx-alert');
    expect(alertEl!.classList.contains('tx-alert-info')).toBe(true);
  });

  it('should render with correct type class for success', () => {
    alert(container, { message: 'Success!', type: 'success' });

    const alertEl = container.querySelector('.tx-alert');
    expect(alertEl!.classList.contains('tx-alert-success')).toBe(true);
  });

  it('should render with correct type class for warning', () => {
    alert(container, { message: 'Warning!', type: 'warning' });

    const alertEl = container.querySelector('.tx-alert');
    expect(alertEl!.classList.contains('tx-alert-warning')).toBe(true);
  });

  it('should render with correct type class for danger', () => {
    alert(container, { message: 'Error!', type: 'danger' });

    const alertEl = container.querySelector('.tx-alert');
    expect(alertEl!.classList.contains('tx-alert-danger')).toBe(true);
  });

  it('should default to info type', () => {
    alert(container, { message: 'Default' });

    const alertEl = container.querySelector('.tx-alert');
    expect(alertEl!.classList.contains('tx-alert-info')).toBe(true);
  });

  it('dismissible shows close button', () => {
    alert(container, { message: 'Dismissible', dismissible: true });

    const closeBtn = container.querySelector('.tx-alert-close');
    expect(closeBtn).not.toBeNull();
  });

  it('non-dismissible does not show close button', () => {
    alert(container, { message: 'Not dismissible', dismissible: false });

    const closeBtn = container.querySelector('.tx-alert-close');
    expect(closeBtn).toBeNull();
  });

  it('close button removes element', () => {
    vi.useFakeTimers();
    alert(container, { message: 'Close me', dismissible: true });

    const closeBtn = container.querySelector('.tx-alert-close') as HTMLElement;
    closeBtn.click();

    vi.advanceTimersByTime(250);

    const alertEl = container.querySelector('.tx-alert');
    expect(alertEl).toBeNull();
    vi.useRealTimers();
  });

  it('close button adds leaving class', () => {
    alert(container, { message: 'Leaving', dismissible: true });

    const closeBtn = container.querySelector('.tx-alert-close') as HTMLElement;
    closeBtn.click();

    const alertEl = container.querySelector('.tx-alert');
    expect(alertEl!.classList.contains('tx-alert-leaving')).toBe(true);
  });

  it('icon renders by default', () => {
    alert(container, { message: 'With icon' });

    const iconEl = container.querySelector('.tx-alert-icon');
    expect(iconEl).not.toBeNull();
    expect(iconEl!.innerHTML).toContain('<svg');
  });

  it('icon can be disabled', () => {
    alert(container, { message: 'No icon', icon: false });

    const iconEl = container.querySelector('.tx-alert-icon');
    expect(iconEl).toBeNull();
  });

  it('should render message text', () => {
    alert(container, { message: 'Alert message content' });

    const message = container.querySelector('.tx-alert-message');
    expect(message).not.toBeNull();
    expect(message!.textContent).toBe('Alert message content');
  });

  it('should render title when provided', () => {
    alert(container, { message: 'Body', title: 'Alert Title' });

    const title = container.querySelector('.tx-alert-title');
    expect(title).not.toBeNull();
    expect(title!.textContent).toBe('Alert Title');
  });

  it('should not render title when not provided', () => {
    alert(container, { message: 'No title' });

    const title = container.querySelector('.tx-alert-title');
    expect(title).toBeNull();
  });

  it('should apply custom class', () => {
    alert(container, { message: 'Custom', class: 'my-alert' });

    const alertEl = container.querySelector('.tx-alert');
    expect(alertEl!.classList.contains('my-alert')).toBe(true);
  });

  it('should have role="alert"', () => {
    alert(container, { message: 'Role test' });

    const alertEl = container.querySelector('.tx-alert');
    expect(alertEl!.getAttribute('role')).toBe('alert');
  });

  it('destroy() clears content', () => {
    const a = alert(container, { message: 'Destroy' });
    a.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('dismissible adds dismissible class', () => {
    alert(container, { message: 'Dismissible class', dismissible: true });

    const alertEl = container.querySelector('.tx-alert');
    expect(alertEl!.classList.contains('tx-alert-dismissible')).toBe(true);
  });
});
