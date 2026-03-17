// ============================================================
// Teryx — Rich Text Editor Widget (WYSIWYG)
// ============================================================

import type { RichEditorOptions, RichEditorInstance } from '../types';
import { uid, cls, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

const DEFAULT_TOOLBAR: string[] = ['bold', 'italic', 'underline', '|', 'ul', 'ol', '|', 'link', 'image', '|', 'clean'];

const TOOL_LABELS: Record<string, string> = {
  bold: '<strong>B</strong>',
  italic: '<em>I</em>',
  underline: '<u>U</u>',
  ul: '&#8226;',
  ol: '1.',
  link: '&#128279;',
  image: '&#128247;',
  clean: '&#10060;',
};

const TOOL_COMMANDS: Record<string, string> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  ul: 'insertUnorderedList',
  ol: 'insertOrderedList',
};

export function richEditor(target: string | HTMLElement, options: RichEditorOptions): RichEditorInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-rich-editor');
  const toolbar = options.toolbar || DEFAULT_TOOLBAR;
  const isReadonly = options.readonly ?? false;

  function render(): void {
    let html = `<div class="${cls('tx-rich-editor', isReadonly && 'tx-rich-editor-readonly', options.class)}" id="${id}">`;

    // Toolbar
    if (!isReadonly) {
      html += '<div class="tx-rich-editor-toolbar">';
      for (const tool of toolbar) {
        if (tool === '|') {
          html += '<span class="tx-rich-editor-separator"></span>';
        } else {
          const label = TOOL_LABELS[tool] || tool;
          html += `<button type="button" class="tx-rich-editor-btn" data-tool="${tool}" title="${tool}">${label}</button>`;
        }
      }
      html += '</div>';
    }

    // Editable area
    html += `<div class="tx-rich-editor-content" contenteditable="${!isReadonly}" role="textbox" aria-multiline="true"`;
    if (options.placeholder && !options.value) {
      html += ` data-placeholder="${options.placeholder}"`;
    }
    html += '>';
    html += options.value || '';
    html += '</div>';

    html += '</div>';

    el.innerHTML = html;
    bindEvents();
  }

  function bindEvents(): void {
    const container = el.querySelector(`#${id}`) as HTMLElement;
    if (!container) return;

    const content = container.querySelector('.tx-rich-editor-content') as HTMLElement;
    const toolbarEl = container.querySelector('.tx-rich-editor-toolbar') as HTMLElement;

    // Toolbar button clicks
    if (toolbarEl) {
      toolbarEl.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('.tx-rich-editor-btn') as HTMLElement;
        if (!btn) return;
        e.preventDefault();

        const tool = btn.getAttribute('data-tool')!;
        executeTool(tool, content);
        updateToolbarState(toolbarEl, content);
        content.focus();
      });
    }

    // Content changes
    content.addEventListener('input', () => {
      const html = content.innerHTML;
      if (options.maxLength) {
        const text = content.textContent || '';
        if (text.length > options.maxLength) {
          content.textContent = text.slice(0, options.maxLength);
          return;
        }
      }
      options.onChange?.(html);
      emit('richEditor:change', { id, value: html });

      // Handle placeholder
      if (options.placeholder) {
        if (content.textContent?.trim() === '') {
          content.setAttribute('data-placeholder', options.placeholder);
        } else {
          content.removeAttribute('data-placeholder');
        }
      }
    });

    // Update toolbar state on selection change
    content.addEventListener('keyup', () => {
      if (toolbarEl) updateToolbarState(toolbarEl, content);
    });
    content.addEventListener('mouseup', () => {
      if (toolbarEl) updateToolbarState(toolbarEl, content);
    });
  }

  function executeTool(tool: string, content: HTMLElement): void {
    const command = TOOL_COMMANDS[tool];
    if (command) {
      document.execCommand(command, false);
      return;
    }

    if (tool === 'link') {
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
      return;
    }

    if (tool === 'image') {
      const url = prompt('Enter image URL:');
      if (url) {
        document.execCommand('insertImage', false, url);
      }
      return;
    }

    if (tool === 'clean') {
      document.execCommand('removeFormat', false);
      // Also remove lists
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const fragment = range.cloneContents();
        const text = fragment.textContent || '';
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
      }
      return;
    }
  }

  function updateToolbarState(toolbarEl: HTMLElement, _content: HTMLElement): void {
    const buttons = toolbarEl.querySelectorAll('.tx-rich-editor-btn');
    buttons.forEach((btn) => {
      const tool = btn.getAttribute('data-tool')!;
      const command = TOOL_COMMANDS[tool];
      if (command) {
        try {
          const active = document.queryCommandState(command);
          btn.classList.toggle('tx-rich-editor-btn-active', active);
        } catch {
          // queryCommandState can throw for some commands
        }
      }
    });
  }

  render();

  return {
    el: el.querySelector(`#${id}`) || el,
    destroy() {
      el.innerHTML = '';
    },
    getValue(): string {
      const content = el.querySelector('.tx-rich-editor-content') as HTMLElement;
      return content ? content.innerHTML : '';
    },
    setValue(html: string): void {
      const content = el.querySelector('.tx-rich-editor-content') as HTMLElement;
      if (content) {
        content.innerHTML = html;
      }
    },
  };
}

registerWidget('richEditor', (el, opts) => richEditor(el, opts as unknown as RichEditorOptions));
export default richEditor;
