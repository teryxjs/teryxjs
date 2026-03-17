import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { transferList } from '../../src/widgets/transfer-list';

const SOURCE_ITEMS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
];

describe('TransferList widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render two list panels and action buttons', () => {
    transferList(container, { source: SOURCE_ITEMS });
    const lists = container.querySelectorAll('.tx-transfer-list');
    expect(lists.length).toBe(2);
    const actions = container.querySelector('.tx-transfer-actions');
    expect(actions).not.toBeNull();
    expect(actions!.querySelectorAll('.tx-transfer-btn').length).toBe(4);
  });

  it('should render all source items in the left list by default', () => {
    transferList(container, { source: SOURCE_ITEMS });
    const leftItems = container.querySelectorAll('.tx-transfer-list-left .tx-transfer-item');
    expect(leftItems.length).toBe(5);
    const rightItems = container.querySelectorAll('.tx-transfer-list-right .tx-transfer-item');
    expect(rightItems.length).toBe(0);
  });

  it('should place initially selected items in the right list', () => {
    transferList(container, { source: SOURCE_ITEMS, target: ['banana', 'date'] });
    const leftItems = container.querySelectorAll('.tx-transfer-list-left .tx-transfer-item');
    expect(leftItems.length).toBe(3);
    const rightItems = container.querySelectorAll('.tx-transfer-list-right .tx-transfer-item');
    expect(rightItems.length).toBe(2);
  });

  it('should display custom titles', () => {
    transferList(container, { source: SOURCE_ITEMS, titles: ['Available', 'Selected'] });
    const titles = container.querySelectorAll('.tx-transfer-title');
    expect(titles[0].textContent).toBe('Available');
    expect(titles[1].textContent).toBe('Selected');
  });

  it('should move selected items to the right when > is clicked', () => {
    const onChange = vi.fn();
    transferList(container, { source: SOURCE_ITEMS, onChange });
    const checkbox = container.querySelector(
      '.tx-transfer-list-left .tx-transfer-checkbox[data-value="apple"]',
    ) as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    const moveRightBtn = container.querySelector('[data-action="move-right"]') as HTMLButtonElement;
    moveRightBtn.click();
    expect(onChange).toHaveBeenCalled();
    const keys = onChange.mock.calls[0][0] as string[];
    expect(keys).toContain('apple');
  });

  it('should move all items to the right when >> is clicked', () => {
    const onChange = vi.fn();
    transferList(container, { source: SOURCE_ITEMS, onChange });
    const moveAllRightBtn = container.querySelector('[data-action="move-all-right"]') as HTMLButtonElement;
    moveAllRightBtn.click();
    expect(onChange).toHaveBeenCalled();
    const keys = onChange.mock.calls[0][0] as string[];
    expect(keys.length).toBe(5);
  });

  it('should move selected items back to the left when < is clicked', () => {
    const onChange = vi.fn();
    transferList(container, { source: SOURCE_ITEMS, target: ['apple', 'banana'], onChange });
    const checkbox = container.querySelector(
      '.tx-transfer-list-right .tx-transfer-checkbox[data-value="apple"]',
    ) as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    const moveLeftBtn = container.querySelector('[data-action="move-left"]') as HTMLButtonElement;
    moveLeftBtn.click();
    expect(onChange).toHaveBeenCalled();
    const keys = onChange.mock.calls[0][0] as string[];
    expect(keys).not.toContain('apple');
    expect(keys).toContain('banana');
  });

  it('should move all items back to the left when << is clicked', () => {
    const onChange = vi.fn();
    transferList(container, { source: SOURCE_ITEMS, target: ['apple', 'banana', 'cherry'], onChange });
    const moveAllLeftBtn = container.querySelector('[data-action="move-all-left"]') as HTMLButtonElement;
    moveAllLeftBtn.click();
    expect(onChange).toHaveBeenCalled();
    const keys = onChange.mock.calls[0][0] as string[];
    expect(keys.length).toBe(0);
  });

  it('getTargetKeys() returns current target values', () => {
    const t = transferList(container, { source: SOURCE_ITEMS, target: ['cherry', 'date'] });
    const keys = t.getTargetKeys();
    expect(keys).toContain('cherry');
    expect(keys).toContain('date');
    expect(keys.length).toBe(2);
  });

  it('setTargetKeys() programmatically sets the target', () => {
    const onChange = vi.fn();
    const t = transferList(container, { source: SOURCE_ITEMS, onChange });
    t.setTargetKeys(['banana', 'elderberry']);
    expect(t.getTargetKeys()).toContain('banana');
    expect(t.getTargetKeys()).toContain('elderberry');
    expect(t.getTargetKeys().length).toBe(2);
    const rightItems = container.querySelectorAll('.tx-transfer-list-right .tx-transfer-item');
    expect(rightItems.length).toBe(2);
  });

  it('should render search inputs when searchable is true', () => {
    transferList(container, { source: SOURCE_ITEMS, searchable: true });
    const searchInputs = container.querySelectorAll('.tx-transfer-search-input');
    expect(searchInputs.length).toBe(2);
  });

  it('search should filter items in the left list', () => {
    transferList(container, { source: SOURCE_ITEMS, searchable: true });
    const leftSearch = container.querySelector('.tx-transfer-list-left .tx-transfer-search-input') as HTMLInputElement;
    leftSearch.value = 'app';
    leftSearch.dispatchEvent(new Event('input', { bubbles: true }));
    const leftItems = container.querySelectorAll('.tx-transfer-list-left .tx-transfer-item');
    expect(leftItems.length).toBe(1);
    expect(leftItems[0].textContent).toContain('Apple');
  });

  it('should not render search inputs when searchable is false', () => {
    transferList(container, { source: SOURCE_ITEMS, searchable: false });
    const searchInputs = container.querySelectorAll('.tx-transfer-search-input');
    expect(searchInputs.length).toBe(0);
  });

  it('disabled items should not be moved by move-all', () => {
    const sourceWithDisabled = [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana', disabled: true },
      { label: 'Cherry', value: 'cherry' },
    ];
    const onChange = vi.fn();
    transferList(container, { source: sourceWithDisabled, onChange });
    const moveAllRightBtn = container.querySelector('[data-action="move-all-right"]') as HTMLButtonElement;
    moveAllRightBtn.click();
    expect(onChange).toHaveBeenCalled();
    const keys = onChange.mock.calls[0][0] as string[];
    expect(keys).toContain('apple');
    expect(keys).toContain('cherry');
    expect(keys).not.toContain('banana');
  });

  it('should show item counts in headers', () => {
    transferList(container, { source: SOURCE_ITEMS, target: ['apple', 'banana'] });
    const counts = container.querySelectorAll('.tx-transfer-count');
    expect(counts[0].textContent).toBe('3');
    expect(counts[1].textContent).toBe('2');
  });

  it('destroy() clears content', () => {
    const t = transferList(container, { source: SOURCE_ITEMS });
    t.destroy();
    expect(container.innerHTML).toBe('');
  });
});
