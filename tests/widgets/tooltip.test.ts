import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tooltip, popover } from '../../src/widgets/tooltip';

describe('Tooltip widget', () => {
  let container: HTMLDivElement;
  let trigger: HTMLButtonElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    trigger = document.createElement('button');
    trigger.textContent = 'Hover me';
    container.appendChild(trigger);
  });
  afterEach(() => {
    container.remove();
    document.querySelectorAll('.tx-tooltip, .tx-popover').forEach((el) => el.remove());
  });

  it('creates a tooltip instance', () => {
    const t = tooltip(trigger, { content: 'Hello' });
    expect(t).toBeDefined();
    expect(t.el).toBe(trigger);
  });
  it('not visible initially', () => {
    const t = tooltip(trigger, { content: 'Hello' });
    expect(t.isVisible()).toBe(false);
  });
  it('show() makes tooltip visible', () => {
    const t = tooltip(trigger, { content: 'Hello' });
    t.show();
    expect(t.isVisible()).toBe(true);
    expect(document.querySelector('.tx-tooltip')).not.toBeNull();
  });
  it('hide() removes tooltip', () => {
    const t = tooltip(trigger, { content: 'Hello' });
    t.show();
    t.hide();
    expect(t.isVisible()).toBe(false);
  });
  it('renders content', () => {
    tooltip(trigger, { content: 'Test content' }).show();
    expect(document.querySelector('.tx-tooltip-content')?.textContent).toBe('Test content');
  });
  it('escapes HTML by default', () => {
    tooltip(trigger, { content: '<b>bold</b>' }).show();
    expect(document.querySelector('.tx-tooltip-content')?.innerHTML).toContain('&lt;b&gt;');
  });
  it('allows HTML when html=true', () => {
    tooltip(trigger, { content: '<b>bold</b>', html: true }).show();
    expect(document.querySelector('.tx-tooltip-content')?.innerHTML).toContain('<b>bold</b>');
  });
  it('setContent updates content', () => {
    const t = tooltip(trigger, { content: 'Old' });
    t.show();
    t.setContent('New');
    expect(document.querySelector('.tx-tooltip-content')?.textContent).toBe('New');
  });
  it('has role="tooltip"', () => {
    tooltip(trigger, { content: 'Test' }).show();
    expect(document.querySelector('.tx-tooltip')?.getAttribute('role')).toBe('tooltip');
  });
  it('has arrow element', () => {
    tooltip(trigger, { content: 'Test' }).show();
    expect(document.querySelector('.tx-tooltip-arrow')).not.toBeNull();
  });
  it('applies custom class', () => {
    tooltip(trigger, { content: 'Test', class: 'my-custom' }).show();
    expect(document.querySelector('.tx-tooltip')?.classList.contains('my-custom')).toBe(true);
  });
  it('destroy hides tooltip', () => {
    const t = tooltip(trigger, { content: 'Test' });
    t.show();
    t.destroy();
    expect(t.isVisible()).toBe(false);
  });
  it('hover shows on mouseenter', () => {
    const t = tooltip(trigger, { content: 'Hover', trigger: 'hover' });
    trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(t.isVisible()).toBe(true);
  });
  it('hover hides on mouseleave', () => {
    const t = tooltip(trigger, { content: 'Hover', trigger: 'hover' });
    trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(t.isVisible()).toBe(false);
  });
  it('click toggles visibility', () => {
    const t = tooltip(trigger, { content: 'Click', trigger: 'click' });
    trigger.click();
    expect(t.isVisible()).toBe(true);
    trigger.click();
    expect(t.isVisible()).toBe(false);
  });
  it('focus shows on focus', () => {
    const t = tooltip(trigger, { content: 'Focus', trigger: 'focus' });
    trigger.dispatchEvent(new FocusEvent('focus'));
    expect(t.isVisible()).toBe(true);
  });
  it('focus hides on blur', () => {
    const t = tooltip(trigger, { content: 'Focus', trigger: 'focus' });
    trigger.dispatchEvent(new FocusEvent('focus'));
    trigger.dispatchEvent(new FocusEvent('blur'));
    expect(t.isVisible()).toBe(false);
  });
});

describe('Popover widget', () => {
  let container: HTMLDivElement;
  let trigger: HTMLButtonElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    trigger = document.createElement('button');
    trigger.textContent = 'Click me';
    container.appendChild(trigger);
  });
  afterEach(() => {
    container.remove();
    document.querySelectorAll('.tx-tooltip, .tx-popover').forEach((el) => el.remove());
  });

  it('creates a popover instance', () => {
    const p = popover(trigger, { content: 'Hello' });
    expect(p).toBeDefined();
    expect(p.el).toBe(trigger);
  });
  it('show() makes popover visible', () => {
    const p = popover(trigger, { content: 'Hello', title: 'Title' });
    p.show();
    expect(p.isVisible()).toBe(true);
    expect(document.querySelector('.tx-popover')).not.toBeNull();
  });
  it('renders title', () => {
    popover(trigger, { content: 'Body', title: 'My Title' }).show();
    expect(document.querySelector('.tx-popover-title')?.textContent).toBe('My Title');
  });
  it('renders body content', () => {
    popover(trigger, { content: 'Body text' }).show();
    expect(document.querySelector('.tx-popover-body')?.textContent).toBe('Body text');
  });
  it('has close button by default', () => {
    popover(trigger, { content: 'Hello' }).show();
    expect(document.querySelector('.tx-popover-close')).not.toBeNull();
  });
  it('close button hides popover', () => {
    const p = popover(trigger, { content: 'Hello' });
    p.show();
    (document.querySelector('.tx-popover-close') as HTMLElement).click();
    expect(p.isVisible()).toBe(false);
  });
  it('closable:false hides close button', () => {
    popover(trigger, { content: 'Hello', closable: false }).show();
    expect(document.querySelector('.tx-popover-close')).toBeNull();
  });
  it('setTitle updates title', () => {
    const p = popover(trigger, { content: 'Body', title: 'Old' });
    p.show();
    p.setTitle('New Title');
    expect(document.querySelector('.tx-popover-title')?.textContent).toBe('New Title');
  });
  it('setContent updates body', () => {
    const p = popover(trigger, { content: 'Old body' });
    p.show();
    p.setContent('New body');
    expect(document.querySelector('.tx-popover-body')?.textContent).toBe('New body');
  });
  it('has role="dialog"', () => {
    popover(trigger, { content: 'Test' }).show();
    expect(document.querySelector('.tx-popover')?.getAttribute('role')).toBe('dialog');
  });
  it('has arrow element', () => {
    popover(trigger, { content: 'Test' }).show();
    expect(document.querySelector('.tx-popover-arrow')).not.toBeNull();
  });
  it('click toggles popover', () => {
    const p = popover(trigger, { content: 'Click me', trigger: 'click' });
    trigger.click();
    expect(p.isVisible()).toBe(true);
    trigger.click();
    expect(p.isVisible()).toBe(false);
  });
  it('destroy hides popover', () => {
    const p = popover(trigger, { content: 'Test' });
    p.show();
    p.destroy();
    expect(p.isVisible()).toBe(false);
  });
  it('custom width applied', () => {
    const p = popover(trigger, { content: 'Test', width: '400px' });
    p.show();
    expect((document.querySelector('.tx-popover') as HTMLElement)?.style.width).toBe('400px');
  });
});
