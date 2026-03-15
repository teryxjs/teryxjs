import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { pagination } from '../../src/widgets/pagination';

describe('Pagination widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render correct number of pages', () => {
    pagination(container, { total: 100, pageSize: 10 });

    const pageButtons = container.querySelectorAll('.tx-pagination-page');
    // Should show page numbers (up to maxVisible=7 by default)
    expect(pageButtons.length).toBeGreaterThan(0);
    expect(pageButtons.length).toBeLessThanOrEqual(10);
  });

  it('goTo() changes active page', () => {
    const onChange = vi.fn();
    const p = pagination(container, { total: 100, pageSize: 10, onChange });

    expect(p.current()).toBe(1);

    p.goTo(5);
    expect(p.current()).toBe(5);

    const activeBtn = container.querySelector('.tx-pagination-active');
    expect(activeBtn).not.toBeNull();
    expect(activeBtn!.textContent).toBe('5');
    expect(onChange).toHaveBeenCalledWith(5, 10);
  });

  it('current() returns page', () => {
    const p = pagination(container, { total: 50, pageSize: 10, current: 3 });
    expect(p.current()).toBe(3);
  });

  it('setTotal() updates and re-renders', () => {
    const p = pagination(container, { total: 100, pageSize: 10 });

    p.setTotal(200);
    // Total pages should now be 20
    // Verify by checking that page 20 can be navigated to
    p.goTo(20);
    expect(p.current()).toBe(20);
  });

  it('setTotal() adjusts current page if necessary', () => {
    const p = pagination(container, { total: 100, pageSize: 10, current: 10 });
    expect(p.current()).toBe(10);

    p.setTotal(50); // Now only 5 pages
    expect(p.current()).toBe(5);
  });

  it('prev button disabled on first page', () => {
    pagination(container, { total: 50, pageSize: 10, current: 1 });

    const prevBtn = container.querySelector('.tx-pagination-prev') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
  });

  it('next button disabled on last page', () => {
    pagination(container, { total: 50, pageSize: 10, current: 5 });

    const nextBtn = container.querySelector('.tx-pagination-next') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
  });

  it('prev button enabled on non-first page', () => {
    pagination(container, { total: 50, pageSize: 10, current: 3 });

    const prevBtn = container.querySelector('.tx-pagination-prev') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(false);
  });

  it('next button enabled on non-last page', () => {
    pagination(container, { total: 50, pageSize: 10, current: 1 });

    const nextBtn = container.querySelector('.tx-pagination-next') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(false);
  });

  it('goTo() does nothing for invalid page', () => {
    const p = pagination(container, { total: 50, pageSize: 10 });

    p.goTo(0); // invalid
    expect(p.current()).toBe(1);

    p.goTo(100); // beyond total
    expect(p.current()).toBe(1);
  });

  it('goTo() does nothing when navigating to current page', () => {
    const onChange = vi.fn();
    const p = pagination(container, { total: 50, pageSize: 10, current: 3, onChange });

    p.goTo(3);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clicking page button changes page', () => {
    const p = pagination(container, { total: 50, pageSize: 10 });

    const pageBtn = container.querySelector('.tx-pagination-page[data-page="3"]') as HTMLElement;
    if (pageBtn) {
      pageBtn.click();
      expect(p.current()).toBe(3);
    }
  });

  it('should show total info when showTotal is true', () => {
    pagination(container, { total: 100, pageSize: 25, showTotal: true });

    const total = container.querySelector('.tx-pagination-total');
    expect(total).not.toBeNull();
    expect(total!.textContent).toContain('1-25');
    expect(total!.textContent).toContain('100');
  });

  it('should show simple mode', () => {
    pagination(container, { total: 100, pageSize: 10, simple: true });

    const simple = container.querySelector('.tx-pagination-simple');
    expect(simple).not.toBeNull();

    const info = container.querySelector('.tx-pagination-info');
    expect(info).not.toBeNull();
    expect(info!.textContent).toContain('Page 1 of 10');
  });

  it('destroy() clears content', () => {
    const p = pagination(container, { total: 50, pageSize: 10 });
    p.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('should render first/last buttons by default', () => {
    pagination(container, { total: 100, pageSize: 10 });

    const firstBtn = container.querySelector('.tx-pagination-first');
    const lastBtn = container.querySelector('.tx-pagination-last');
    expect(firstBtn).not.toBeNull();
    expect(lastBtn).not.toBeNull();
  });
});
