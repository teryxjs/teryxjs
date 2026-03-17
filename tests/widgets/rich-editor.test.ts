import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { richEditor } from '../../src/widgets/rich-editor';

describe('RichEditor widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render with default toolbar', () => {
    richEditor(container, {});

    const toolbar = container.querySelector('.tx-rich-editor-toolbar');
    expect(toolbar).not.toBeNull();

    const buttons = container.querySelectorAll('.tx-rich-editor-btn');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render contenteditable area', () => {
    richEditor(container, {});

    const content = container.querySelector('.tx-rich-editor-content') as HTMLElement;
    expect(content).not.toBeNull();
    expect(content.getAttribute('contenteditable')).toBe('true');
  });

  it('should render initial value', () => {
    richEditor(container, { value: '<p>Hello <strong>world</strong></p>' });

    const content = container.querySelector('.tx-rich-editor-content') as HTMLElement;
    expect(content.innerHTML).toContain('Hello');
    expect(content.innerHTML).toContain('<strong>world</strong>');
  });

  it('getValue() returns current HTML', () => {
    const r = richEditor(container, { value: '<p>test</p>' });
    expect(r.getValue()).toContain('<p>test</p>');
  });

  it('setValue() updates content', () => {
    const r = richEditor(container, { value: '<p>old</p>' });

    r.setValue('<p>new content</p>');

    const content = container.querySelector('.tx-rich-editor-content') as HTMLElement;
    expect(content.innerHTML).toContain('new content');
    expect(r.getValue()).toContain('new content');
  });

  it('should render custom toolbar', () => {
    richEditor(container, { toolbar: ['bold', 'italic'] });

    const buttons = container.querySelectorAll('.tx-rich-editor-btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].getAttribute('data-tool')).toBe('bold');
    expect(buttons[1].getAttribute('data-tool')).toBe('italic');
  });

  it('should render separators in toolbar', () => {
    richEditor(container, { toolbar: ['bold', '|', 'italic'] });

    const separators = container.querySelectorAll('.tx-rich-editor-separator');
    expect(separators.length).toBe(1);
  });

  it('readonly mode hides toolbar', () => {
    richEditor(container, { readonly: true });

    const toolbar = container.querySelector('.tx-rich-editor-toolbar');
    expect(toolbar).toBeNull();
  });

  it('readonly mode sets contenteditable to false', () => {
    richEditor(container, { readonly: true });

    const content = container.querySelector('.tx-rich-editor-content') as HTMLElement;
    expect(content.getAttribute('contenteditable')).toBe('false');
  });

  it('should apply readonly class', () => {
    richEditor(container, { readonly: true });

    const editorEl = container.querySelector('.tx-rich-editor');
    expect(editorEl!.classList.contains('tx-rich-editor-readonly')).toBe(true);
  });

  it('should apply custom class', () => {
    richEditor(container, { class: 'my-editor' });

    const editorEl = container.querySelector('.tx-rich-editor');
    expect(editorEl!.classList.contains('my-editor')).toBe(true);
  });

  it('should apply custom id', () => {
    richEditor(container, { id: 'my-editor-id' });

    const el = container.querySelector('#my-editor-id');
    expect(el).not.toBeNull();
  });

  it('destroy() clears content', () => {
    const r = richEditor(container, {});
    r.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('should have role=textbox on content area', () => {
    richEditor(container, {});

    const content = container.querySelector('.tx-rich-editor-content');
    expect(content!.getAttribute('role')).toBe('textbox');
  });

  it('should have aria-multiline=true on content area', () => {
    richEditor(container, {});

    const content = container.querySelector('.tx-rich-editor-content');
    expect(content!.getAttribute('aria-multiline')).toBe('true');
  });

  it('toolbar buttons have data-tool attributes', () => {
    richEditor(container, { toolbar: ['bold', 'italic', 'underline'] });

    const buttons = container.querySelectorAll('.tx-rich-editor-btn');
    expect(buttons[0].getAttribute('data-tool')).toBe('bold');
    expect(buttons[1].getAttribute('data-tool')).toBe('italic');
    expect(buttons[2].getAttribute('data-tool')).toBe('underline');
  });

  it('should render with no value (empty content)', () => {
    richEditor(container, {});

    const content = container.querySelector('.tx-rich-editor-content') as HTMLElement;
    expect(content.innerHTML).toBe('');
  });

  it('should render placeholder when no value', () => {
    richEditor(container, { placeholder: 'Type here...' });

    const content = container.querySelector('.tx-rich-editor-content') as HTMLElement;
    expect(content.getAttribute('data-placeholder')).toBe('Type here...');
  });
});
