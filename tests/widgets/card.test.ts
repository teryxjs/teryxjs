import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { card } from '../../src/widgets/card';

describe('Card widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render title', () => {
    card(container, { title: 'My Card' });

    const title = container.querySelector('.tx-card-title');
    expect(title).not.toBeNull();
    expect(title!.textContent).toBe('My Card');
  });

  it('should render body content', () => {
    card(container, { content: '<p>Card body</p>' });

    const body = container.querySelector('.tx-card-body');
    expect(body).not.toBeNull();
    expect(body!.innerHTML).toContain('<p>Card body</p>');
  });

  it('should render title and body together', () => {
    card(container, { title: 'Title', content: '<div>Body</div>' });

    expect(container.querySelector('.tx-card-title')!.textContent).toBe('Title');
    expect(container.querySelector('.tx-card-body')!.innerHTML).toContain('<div>Body</div>');
  });

  it('collapsible toggle works', () => {
    card(container, { title: 'Collapse', content: 'Content', collapsible: true });

    const body = container.querySelector('.tx-card-body') as HTMLElement;
    expect(body.style.display).toBe(''); // initially visible

    const collapseBtn = container.querySelector('.tx-card-collapse-btn') as HTMLElement;
    expect(collapseBtn).not.toBeNull();

    // Click to collapse
    collapseBtn.click();
    expect(body.style.display).toBe('none');

    // Click to expand
    collapseBtn.click();
    expect(body.style.display).toBe('');
  });

  it('should start collapsed when collapsed=true', () => {
    card(container, { title: 'Collapsed', content: 'Content', collapsible: true, collapsed: true });

    const body = container.querySelector('.tx-card-body') as HTMLElement;
    expect(body.style.display).toBe('none');
  });

  it('closable hides card', () => {
    card(container, { title: 'Closable', content: 'Content', closable: true });

    const closeBtn = container.querySelector('.tx-card-close-btn') as HTMLElement;
    expect(closeBtn).not.toBeNull();

    closeBtn.click();
    const cardEl = container.querySelector('.tx-card') as HTMLElement;
    expect(cardEl.style.display).toBe('none');
  });

  it('tools render correctly', () => {
    const toolHandler = vi.fn();
    card(container, {
      title: 'With Tools',
      content: 'Content',
      tools: [
        { icon: 'edit', tooltip: 'Edit', handler: toolHandler },
        { icon: 'trash', tooltip: 'Delete' },
      ],
    });

    const tools = container.querySelectorAll('.tx-card-tool');
    // tools include collapse/close buttons too, so filter
    expect(tools.length).toBeGreaterThanOrEqual(2);

    // Click tool with handler
    const editTool = container.querySelector('.tx-card-tool[title="Edit"]') as HTMLElement;
    expect(editTool).not.toBeNull();
    editTool.click();
    expect(toolHandler).toHaveBeenCalledTimes(1);
  });

  it('source generates xh-get', () => {
    card(container, { title: 'Dynamic', source: '/api/card-content' });

    const xhEl = container.querySelector('[xh-get]') as HTMLElement;
    expect(xhEl).not.toBeNull();
    expect(xhEl.getAttribute('xh-get')).toBe('/api/card-content');
  });

  it('should render footer', () => {
    card(container, { content: 'Body', footer: '<span>Footer text</span>' });

    const footer = container.querySelector('.tx-card-footer');
    expect(footer).not.toBeNull();
    expect(footer!.innerHTML).toContain('Footer text');
  });

  it('should render image at top', () => {
    card(container, { image: '/img/photo.jpg', content: 'Body' });

    const img = container.querySelector('.tx-card-img-top') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain('/img/photo.jpg');
  });

  it('should render image at bottom', () => {
    card(container, { image: '/img/photo.jpg', imagePosition: 'bottom', content: 'Body' });

    const img = container.querySelector('.tx-card-img-bottom') as HTMLImageElement;
    expect(img).not.toBeNull();
  });

  it('should apply custom class', () => {
    card(container, { content: 'Body', class: 'my-custom-card' });

    const cardEl = container.querySelector('.tx-card');
    expect(cardEl!.classList.contains('my-custom-card')).toBe(true);
  });

  it('destroy() clears content', () => {
    const c = card(container, { title: 'Destroy', content: 'Body' });

    c.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('should render loading state', () => {
    card(container, { title: 'Loading', loading: true });

    const loading = container.querySelector('.tx-card-loading');
    expect(loading).not.toBeNull();
  });
});
