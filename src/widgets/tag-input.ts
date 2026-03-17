// ============================================================
// Teryx — Tag Input / Chip Field Widget
// ============================================================

import type { TagInputOptions, TagInputInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function tagInput(target: string | HTMLElement, options: TagInputOptions): TagInputInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-tag-input');
  let tags: string[] = [...(options.value || [])];
  let filteredSuggestions: string[] = [];

  function render(): void {
    let html = `<div class="${cls('tx-tag-input', options.class)}" id="${esc(id)}">`;
    html += '<div class="tx-tag-input-tags">';

    for (const tag of tags) {
      html += `<span class="tx-tag-input-chip" data-tag="${esc(tag)}">`;
      html += `<span class="tx-tag-input-chip-text">${esc(tag)}</span>`;
      html += `<button type="button" class="tx-tag-input-chip-remove" data-remove="${esc(tag)}" aria-label="Remove ${esc(tag)}">${icon('x')}</button>`;
      html += '</span>';
    }

    html += `<input type="text" class="tx-tag-input-field" placeholder="${esc(options.placeholder || '')}" autocomplete="off" />`;
    html += '</div>';

    if (options.clearable && tags.length > 0) {
      html += `<button type="button" class="tx-tag-input-clear" aria-label="Clear all">${icon('x')}</button>`;
    }

    html += '<div class="tx-tag-input-suggestions"></div>';
    html += '</div>';

    el.innerHTML = html;
    bindEvents();
  }

  function bindEvents(): void {
    const container = el.querySelector(`#${id}`) as HTMLElement;
    if (!container) return;

    const input = container.querySelector('.tx-tag-input-field') as HTMLInputElement;
    const suggestionsEl = container.querySelector('.tx-tag-input-suggestions') as HTMLElement;

    container.querySelector('.tx-tag-input-tags')?.addEventListener('click', (e) => {
      const removeBtn = (e.target as HTMLElement).closest('.tx-tag-input-chip-remove') as HTMLElement;
      if (removeBtn) {
        const tag = removeBtn.getAttribute('data-remove')!;
        doRemoveTag(tag);
        return;
      }
      input.focus();
    });

    container.querySelector('.tx-tag-input-clear')?.addEventListener('click', () => {
      doClear();
    });

    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = input.value.trim().replace(/,+$/, '');
        if (val) {
          doAddTag(val);
          input.value = '';
          hideSuggestions(suggestionsEl);
        }
      } else if (e.key === 'Backspace' && input.value === '' && tags.length > 0) {
        doRemoveTag(tags[tags.length - 1]);
      } else if (e.key === 'Escape') {
        hideSuggestions(suggestionsEl);
      }
    });

    input.addEventListener('input', () => {
      const val = input.value.trim().toLowerCase();
      if (val && options.suggestions && options.suggestions.length > 0) {
        filteredSuggestions = options.suggestions.filter(
          (s: string) => s.toLowerCase().includes(val) && (options.allowDuplicates || !tags.includes(s)),
        );
        if (filteredSuggestions.length > 0) {
          showSuggestions(suggestionsEl);
        } else {
          hideSuggestions(suggestionsEl);
        }
      } else {
        hideSuggestions(suggestionsEl);
      }
    });

    suggestionsEl.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('.tx-tag-input-suggestion') as HTMLElement;
      if (item) {
        const val = item.getAttribute('data-suggestion')!;
        doAddTag(val);
        input.value = '';
        hideSuggestions(suggestionsEl);
        input.focus();
      }
    });

    input.addEventListener('focus', () => {
      container.classList.add('tx-tag-input-focused');
    });
    input.addEventListener('blur', () => {
      container.classList.remove('tx-tag-input-focused');
      setTimeout(() => hideSuggestions(suggestionsEl), 200);
    });
  }

  function showSuggestions(suggestionsEl: HTMLElement): void {
    let html = '';
    for (const s of filteredSuggestions) {
      html += `<div class="tx-tag-input-suggestion" data-suggestion="${esc(s)}">${esc(s)}</div>`;
    }
    suggestionsEl.innerHTML = html;
    suggestionsEl.style.display = 'block';
  }

  function hideSuggestions(suggestionsEl: HTMLElement): void {
    suggestionsEl.style.display = 'none';
    suggestionsEl.innerHTML = '';
  }

  function doAddTag(tag: string): void {
    if (!tag) return;
    if (options.maxTags && tags.length >= options.maxTags) return;
    if (!options.allowDuplicates && tags.includes(tag)) return;

    tags.push(tag);
    options.onAdd?.(tag);
    options.onChange?.([...tags]);
    emit('tagInput:add', { id, tag, tags: [...tags] });
    render();
  }

  function doRemoveTag(tag: string): void {
    const idx = tags.indexOf(tag);
    if (idx === -1) return;

    tags.splice(idx, 1);
    options.onRemove?.(tag);
    options.onChange?.([...tags]);
    emit('tagInput:remove', { id, tag, tags: [...tags] });
    render();
  }

  function doClear(): void {
    tags = [];
    options.onChange?.([]);
    emit('tagInput:clear', { id });
    render();
  }

  render();

  return {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
    getValue() {
      return [...tags];
    },
    setValue(newTags: string[]) {
      tags = [...newTags];
      render();
    },
    addTag(tag: string) {
      doAddTag(tag);
    },
    removeTag(tag: string) {
      doRemoveTag(tag);
    },
    clear() {
      doClear();
    },
  };
}

registerWidget('tagInput', (el, opts) => tagInput(el, opts as unknown as TagInputOptions));
export default tagInput;
