import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { transferList } from '../../src/widgets/transfer-list';

/**
 * Unit tests for the Explorer demo configurations of
 * Transfer List widget.
 *
 * These mirror the exact option combos used in
 * pages/explorer/index.html to ensure every demo variant works.
 */

describe('Explorer demo — Transfer List variants', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('basic dual-list with pre-selected target', () => {
    const inst = transferList(container, {
      source: [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Cherry', value: 'cherry' },
        { label: 'Date', value: 'date' },
        { label: 'Elderberry', value: 'elderberry' },
      ],
      target: ['cherry'],
      titles: ['Available', 'Selected'],
    });
    expect(inst.el).toBeTruthy();
    // Two list panels
    const lists = container.querySelectorAll('.tx-transfer-list');
    expect(lists.length).toBe(2);
    // Custom titles
    const titles = container.querySelectorAll('.tx-transfer-title');
    expect(titles[0].textContent).toBe('Available');
    expect(titles[1].textContent).toBe('Selected');
    // 4 left, 1 right
    const leftItems = container.querySelectorAll('.tx-transfer-list-left .tx-transfer-item');
    expect(leftItems.length).toBe(4);
    const rightItems = container.querySelectorAll('.tx-transfer-list-right .tx-transfer-item');
    expect(rightItems.length).toBe(1);
    expect(inst.getTargetKeys()).toEqual(['cherry']);
  });

  it('searchable transfer list renders search inputs', () => {
    transferList(container, {
      source: [
        { label: 'JavaScript', value: 'js' },
        { label: 'TypeScript', value: 'ts' },
        { label: 'Python', value: 'py' },
        { label: 'Ruby', value: 'rb' },
        { label: 'Go', value: 'go' },
        { label: 'Rust', value: 'rs' },
      ],
      searchable: true,
      titles: ['Languages', 'Selected'],
    });
    const searchInputs = container.querySelectorAll('.tx-transfer-search-input');
    expect(searchInputs.length).toBe(2);
    // All six items in source
    const leftItems = container.querySelectorAll('.tx-transfer-list-left .tx-transfer-item');
    expect(leftItems.length).toBe(6);
    // Search filters
    const leftSearch = container.querySelector('.tx-transfer-list-left .tx-transfer-search-input') as HTMLInputElement;
    leftSearch.value = 'type';
    leftSearch.dispatchEvent(new Event('input', { bubbles: true }));
    const filtered = container.querySelectorAll('.tx-transfer-list-left .tx-transfer-item');
    expect(filtered.length).toBe(1);
    expect(filtered[0].textContent).toContain('TypeScript');
  });

  it('disabled items cannot be moved by move-all', () => {
    transferList(container, {
      source: [
        { label: 'Read', value: 'read' },
        { label: 'Write', value: 'write' },
        { label: 'Execute', value: 'exec', disabled: true },
        { label: 'Admin', value: 'admin', disabled: true },
      ],
      target: ['exec'],
    });
    // 'exec' is disabled but already in target — it should be in right panel
    const rightItems = container.querySelectorAll('.tx-transfer-list-right .tx-transfer-item');
    expect(rightItems.length).toBe(1);
    // Left panel has 3 items (read, write, admin)
    const leftItems = container.querySelectorAll('.tx-transfer-list-left .tx-transfer-item');
    expect(leftItems.length).toBe(3);
    // Disabled items should have the disabled class
    const disabledItems = container.querySelectorAll('.tx-transfer-item-disabled');
    expect(disabledItems.length).toBe(2);
    // Move all right should only move non-disabled items
    const moveAllBtn = container.querySelector('[data-action="move-all-right"]') as HTMLButtonElement;
    moveAllBtn.click();
    const rightAfter = container.querySelectorAll('.tx-transfer-list-right .tx-transfer-item');
    // exec (disabled, already right) + read + write = 3; admin stays left (disabled)
    expect(rightAfter.length).toBe(3);
    const leftAfter = container.querySelectorAll('.tx-transfer-list-left .tx-transfer-item');
    expect(leftAfter.length).toBe(1); // only admin remains
  });

  it('onChange callback fires with updated target keys', () => {
    let lastKeys: string[] = [];
    transferList(container, {
      source: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'X-Large', value: 'xl' },
      ],
      target: ['md'],
      onChange: (keys) => {
        lastKeys = keys;
      },
    });
    // Initial target
    expect(container.querySelectorAll('.tx-transfer-list-right .tx-transfer-item').length).toBe(1);
    // Move all right
    const moveAllBtn = container.querySelector('[data-action="move-all-right"]') as HTMLButtonElement;
    moveAllBtn.click();
    expect(lastKeys.length).toBe(4);
    expect(lastKeys).toContain('sm');
    expect(lastKeys).toContain('md');
    expect(lastKeys).toContain('lg');
    expect(lastKeys).toContain('xl');
  });

  it('destroy clears the container', () => {
    const inst = transferList(container, {
      source: [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ],
    });
    expect(container.querySelector('.tx-transfer')).not.toBeNull();
    inst.destroy();
    expect(container.innerHTML).toBe('');
  });
});
