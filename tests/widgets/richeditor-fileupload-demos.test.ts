import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { richEditor } from '../../src/widgets/rich-editor';
import { fileupload } from '../../src/widgets/fileupload';

/**
 * Unit tests for the Explorer demo configurations of
 * Rich Text Editor and File Upload widgets.
 *
 * These mirror the exact option combos used in
 * pages/explorer/index.html to ensure every demo variant works.
 */

describe('Explorer demo — Rich Text Editor variants', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('default toolbar (placeholder, no value)', () => {
    const editor = richEditor(container, {
      placeholder: 'Start typing...',
    });
    expect(editor.el).toBeTruthy();
    expect(container.querySelector('.tx-rich-editor-toolbar')).not.toBeNull();
    const content = container.querySelector('.tx-rich-editor-content') as HTMLElement;
    expect(content).not.toBeNull();
    expect(content.getAttribute('contenteditable')).toBe('true');
    expect(content.getAttribute('data-placeholder')).toBe('Start typing...');
    // Default toolbar should have bold, italic, underline, etc.
    const buttons = container.querySelectorAll('.tx-rich-editor-btn');
    expect(buttons.length).toBeGreaterThanOrEqual(7);
  });

  it('pre-filled formatting content', () => {
    const editor = richEditor(container, {
      value: '<p><strong>Bold</strong>, <em>italic</em>, and <u>underline</u>.</p>',
    });
    const html = editor.getValue();
    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('<u>underline</u>');
  });

  it('readonly editor hides toolbar and disables editing', () => {
    const editor = richEditor(container, {
      value: '<p>This content is <strong>read-only</strong>.</p>',
      readonly: true,
    });
    expect(container.querySelector('.tx-rich-editor-readonly')).not.toBeNull();
    // Should NOT have a toolbar
    expect(container.querySelector('.tx-rich-editor-toolbar')).toBeNull();
    const content = container.querySelector('.tx-rich-editor-content') as HTMLElement;
    expect(content.getAttribute('contenteditable')).toBe('false');
    expect(editor.getValue()).toContain('read-only');
  });

  it('getValue and setValue work correctly', () => {
    const editor = richEditor(container, {
      value: '<p>Initial content</p>',
    });
    expect(editor.getValue()).toContain('Initial content');

    editor.setValue('<p>Updated via <strong>API</strong></p>');
    expect(editor.getValue()).toContain('Updated via');
    expect(editor.getValue()).toContain('<strong>API</strong>');
  });

  it('destroy clears the container', () => {
    const editor = richEditor(container, { value: '<p>Hello</p>' });
    expect(container.querySelector('.tx-rich-editor')).not.toBeNull();
    editor.destroy();
    expect(container.innerHTML).toBe('');
  });
});

describe('Explorer demo — File Upload variants', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('single file upload (no drag-drop)', () => {
    const inst = fileupload(container, {
      action: '/api/upload',
      dragDrop: false,
    });
    expect(inst.el).toBeTruthy();
    expect(container.querySelector('.tx-upload')).not.toBeNull();
    // dragDrop false means no tx-upload-dragdrop class
    expect(container.querySelector('.tx-upload-dragdrop')).toBeNull();
    const input = container.querySelector('.tx-upload-input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.hasAttribute('multiple')).toBe(false);
  });

  it('multiple files with maxFiles', () => {
    fileupload(container, {
      action: '/api/upload',
      multiple: true,
      maxFiles: 5,
    });
    const input = container.querySelector('.tx-upload-input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.hasAttribute('multiple')).toBe(true);
  });

  it('drag & drop zone enabled', () => {
    fileupload(container, {
      action: '/api/upload',
      multiple: true,
      dragDrop: true,
    });
    expect(container.querySelector('.tx-upload-dragdrop')).not.toBeNull();
    expect(container.querySelector('.tx-upload-dropzone')).not.toBeNull();
  });

  it('accept image types with maxSize', () => {
    fileupload(container, {
      action: '/api/upload',
      accept: 'image/*',
      maxSize: 5242880,
    });
    const input = container.querySelector('.tx-upload-input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.getAttribute('accept')).toBe('image/*');
    // maxSize hint should be rendered
    const hint = container.querySelector('.tx-upload-hint');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toContain('5');
  });

  it('destroy clears the container', () => {
    const inst = fileupload(container, { action: '/api/upload' });
    expect(container.querySelector('.tx-upload')).not.toBeNull();
    inst.destroy();
    expect(container.innerHTML).toBe('');
  });
});
