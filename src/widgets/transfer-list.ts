// ============================================================
// Teryx — Transfer List Widget
// ============================================================

import type { TransferOptions, WidgetInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export interface TransferInstance extends WidgetInstance {
  getTargetKeys(): string[];
  setTargetKeys(keys: string[]): void;
}

export function transferList(target: string | HTMLElement, options: TransferOptions): TransferInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-transfer');
  const titles = options.titles || ['Source', 'Target'];
  const searchable = options.searchable ?? false;

  let targetKeys = new Set<string>(options.target || []);
  const selectedLeft = new Set<string>();
  const selectedRight = new Set<string>();
  let leftFilter = '';
  let rightFilter = '';

  function getSourceItems() {
    return options.source.filter((item) => !targetKeys.has(item.value));
  }

  function getTargetItems() {
    return options.source.filter((item) => targetKeys.has(item.value));
  }

  function fireChange(): void {
    const keys = Array.from(targetKeys);
    options.onChange?.(keys);
    emit('transfer:change', { id, targetKeys: keys });
  }

  function renderListItems(
    items: { label: string; value: string; disabled?: boolean }[],
    selected: Set<string>,
    filter: string,
  ): string {
    const filtered = filter ? items.filter((item) => item.label.toLowerCase().includes(filter.toLowerCase())) : items;

    if (filtered.length === 0) {
      return '<div class="tx-transfer-empty">No items</div>';
    }

    let html = '';
    for (const item of filtered) {
      const isSelected = selected.has(item.value);
      const disabledAttr = item.disabled ? ' disabled' : '';
      html += `<label class="${cls('tx-transfer-item', isSelected && 'tx-transfer-item-selected', item.disabled && 'tx-transfer-item-disabled')}"${disabledAttr}>`;
      html += `<input type="checkbox" class="tx-transfer-checkbox" data-value="${esc(item.value)}"${isSelected ? ' checked' : ''}${disabledAttr}>`;
      html += `<span class="tx-transfer-item-label">${esc(item.label)}</span>`;
      html += '</label>';
    }
    return html;
  }

  function render(): void {
    const sourceItems = getSourceItems();
    const targetItems = getTargetItems();
    const hasSelectedLeft = selectedLeft.size > 0;
    const hasSelectedRight = selectedRight.size > 0;
    const hasSourceItems = sourceItems.some((item) => !item.disabled);
    const hasTargetItems = targetItems.some((item) => !item.disabled);

    let html = `<div class="${cls('tx-transfer', options.class)}" id="${esc(id)}">`;

    html += '<div class="tx-transfer-list tx-transfer-list-left">';
    html += `<div class="tx-transfer-header"><span class="tx-transfer-title">${esc(titles[0])}</span>`;
    html += `<span class="tx-transfer-count">${sourceItems.length}</span></div>`;
    if (searchable) {
      html += '<div class="tx-transfer-search">';
      html += `<input type="text" class="tx-transfer-search-input" data-side="left" placeholder="Search..." value="${esc(leftFilter)}">`;
      html += `<span class="tx-transfer-search-icon">${icon('search')}</span>`;
      html += '</div>';
    }
    html += '<div class="tx-transfer-list-content">';
    html += renderListItems(sourceItems, selectedLeft, leftFilter);
    html += '</div></div>';

    html += '<div class="tx-transfer-actions">';
    html += `<button class="tx-transfer-btn tx-transfer-btn-right" data-action="move-right"${!hasSelectedLeft ? ' disabled' : ''} title="Move selected right">${icon('chevronRight')}</button>`;
    html += `<button class="tx-transfer-btn tx-transfer-btn-all-right" data-action="move-all-right"${!hasSourceItems ? ' disabled' : ''} title="Move all right">${icon('chevronRight')}${icon('chevronRight')}</button>`;
    html += `<button class="tx-transfer-btn tx-transfer-btn-left" data-action="move-left"${!hasSelectedRight ? ' disabled' : ''} title="Move selected left">${icon('chevronLeft')}</button>`;
    html += `<button class="tx-transfer-btn tx-transfer-btn-all-left" data-action="move-all-left"${!hasTargetItems ? ' disabled' : ''} title="Move all left">${icon('chevronLeft')}${icon('chevronLeft')}</button>`;
    html += '</div>';

    html += '<div class="tx-transfer-list tx-transfer-list-right">';
    html += `<div class="tx-transfer-header"><span class="tx-transfer-title">${esc(titles[1])}</span>`;
    html += `<span class="tx-transfer-count">${targetItems.length}</span></div>`;
    if (searchable) {
      html += '<div class="tx-transfer-search">';
      html += `<input type="text" class="tx-transfer-search-input" data-side="right" placeholder="Search..." value="${esc(rightFilter)}">`;
      html += `<span class="tx-transfer-search-icon">${icon('search')}</span>`;
      html += '</div>';
    }
    html += '<div class="tx-transfer-list-content">';
    html += renderListItems(targetItems, selectedRight, rightFilter);
    html += '</div></div>';

    html += '</div>';
    el.innerHTML = html;

    bindEvents();
  }

  function bindEvents(): void {
    const root = el.querySelector(`#${id}`) as HTMLElement;
    if (!root) return;

    root.addEventListener('change', (e) => {
      const checkbox = e.target as HTMLInputElement;
      if (!checkbox.classList.contains('tx-transfer-checkbox')) return;
      const value = checkbox.getAttribute('data-value')!;
      const isLeft = checkbox.closest('.tx-transfer-list-left');
      const set = isLeft ? selectedLeft : selectedRight;

      if (checkbox.checked) {
        set.add(value);
      } else {
        set.delete(value);
      }
      render();
    });

    root.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
      if (!btn || btn.hasAttribute('disabled')) return;
      const action = btn.getAttribute('data-action');

      switch (action) {
        case 'move-right': {
          for (const key of selectedLeft) {
            const item = options.source.find((i) => i.value === key);
            if (item && !item.disabled) {
              targetKeys.add(key);
            }
          }
          selectedLeft.clear();
          fireChange();
          break;
        }
        case 'move-all-right': {
          for (const item of options.source) {
            if (!item.disabled) {
              targetKeys.add(item.value);
            }
          }
          selectedLeft.clear();
          fireChange();
          break;
        }
        case 'move-left': {
          for (const key of selectedRight) {
            const item = options.source.find((i) => i.value === key);
            if (item && !item.disabled) {
              targetKeys.delete(key);
            }
          }
          selectedRight.clear();
          fireChange();
          break;
        }
        case 'move-all-left': {
          for (const item of options.source) {
            if (!item.disabled) {
              targetKeys.delete(item.value);
            }
          }
          selectedRight.clear();
          fireChange();
          break;
        }
      }
      render();
    });

    if (searchable) {
      root.querySelectorAll<HTMLInputElement>('.tx-transfer-search-input').forEach((input) => {
        input.addEventListener('input', () => {
          const side = input.getAttribute('data-side');
          const cursorPos = input.selectionStart;
          if (side === 'left') {
            leftFilter = input.value;
          } else {
            rightFilter = input.value;
          }
          render();
          // Restore focus to the search input after re-render
          const newRoot = el.querySelector(`#${id}`) as HTMLElement;
          const newInput = newRoot?.querySelector(`.tx-transfer-search-input[data-side="${side}"]`) as HTMLInputElement;
          if (newInput) {
            newInput.focus();
            if (cursorPos !== null) newInput.setSelectionRange(cursorPos, cursorPos);
          }
        });
      });
    }
  }

  render();

  return {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
    getTargetKeys() {
      return Array.from(targetKeys);
    },
    setTargetKeys(keys: string[]) {
      targetKeys = new Set(keys);
      selectedLeft.clear();
      selectedRight.clear();
      leftFilter = '';
      rightFilter = '';
      render();
      fireChange();
    },
  };
}

registerWidget('transfer-list', (el, opts) => transferList(el, opts as unknown as TransferOptions));
export default transferList;
