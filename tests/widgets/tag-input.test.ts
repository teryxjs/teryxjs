import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tagInput } from '../../src/widgets/tag-input';

describe('TagInput widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render with no initial tags', () => {
    tagInput(container, {});
    const chips = container.querySelectorAll('.tx-tag-input-chip');
    expect(chips.length).toBe(0);
    const input = container.querySelector('.tx-tag-input-field') as HTMLInputElement;
    expect(input).not.toBeNull();
  });

  it('should render initial tags', () => {
    tagInput(container, { value: ['foo', 'bar', 'baz'] });
    const chips = container.querySelectorAll('.tx-tag-input-chip');
    expect(chips.length).toBe(3);
    const texts = Array.from(chips).map((c) => c.querySelector('.tx-tag-input-chip-text')!.textContent);
    expect(texts).toEqual(['foo', 'bar', 'baz']);
  });

  it('should render placeholder', () => {
    tagInput(container, { placeholder: 'Add tags...' });
    const input = container.querySelector('.tx-tag-input-field') as HTMLInputElement;
    expect(input.placeholder).toBe('Add tags...');
  });

  it('getValue() returns current tags', () => {
    const t = tagInput(container, { value: ['a', 'b'] });
    expect(t.getValue()).toEqual(['a', 'b']);
  });

  it('setValue() replaces tags', () => {
    const t = tagInput(container, { value: ['a'] });
    t.setValue(['x', 'y', 'z']);
    expect(t.getValue()).toEqual(['x', 'y', 'z']);
    const chips = container.querySelectorAll('.tx-tag-input-chip');
    expect(chips.length).toBe(3);
  });

  it('addTag() adds a tag', () => {
    const t = tagInput(container, { value: ['a'] });
    t.addTag('b');
    expect(t.getValue()).toEqual(['a', 'b']);
  });

  it('removeTag() removes a tag', () => {
    const t = tagInput(container, { value: ['a', 'b', 'c'] });
    t.removeTag('b');
    expect(t.getValue()).toEqual(['a', 'c']);
  });

  it('clear() removes all tags', () => {
    const t = tagInput(container, { value: ['a', 'b', 'c'] });
    t.clear();
    expect(t.getValue()).toEqual([]);
  });

  it('should not add duplicates by default', () => {
    const t = tagInput(container, { value: ['a'] });
    t.addTag('a');
    expect(t.getValue()).toEqual(['a']);
  });

  it('should allow duplicates when allowDuplicates is true', () => {
    const t = tagInput(container, { value: ['a'], allowDuplicates: true });
    t.addTag('a');
    expect(t.getValue()).toEqual(['a', 'a']);
  });

  it('should enforce maxTags limit', () => {
    const t = tagInput(container, { value: ['a', 'b'], maxTags: 3 });
    t.addTag('c');
    expect(t.getValue()).toEqual(['a', 'b', 'c']);
    t.addTag('d');
    expect(t.getValue()).toEqual(['a', 'b', 'c']);
  });

  it('clicking X removes a tag', () => {
    const t = tagInput(container, { value: ['a', 'b', 'c'] });
    const removeBtn = container.querySelector('.tx-tag-input-chip-remove[data-remove="b"]') as HTMLButtonElement;
    removeBtn.click();
    expect(t.getValue()).toEqual(['a', 'c']);
  });

  it('Enter key adds a tag from input', () => {
    const t = tagInput(container, {});
    const input = container.querySelector('.tx-tag-input-field') as HTMLInputElement;
    input.value = 'newtag';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(t.getValue()).toEqual(['newtag']);
  });

  it('comma key adds a tag from input', () => {
    const t = tagInput(container, {});
    const input = container.querySelector('.tx-tag-input-field') as HTMLInputElement;
    input.value = 'newtag';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: ',', bubbles: true }));
    expect(t.getValue()).toEqual(['newtag']);
  });

  it('Backspace on empty input removes last tag', () => {
    const t = tagInput(container, { value: ['a', 'b', 'c'] });
    const input = container.querySelector('.tx-tag-input-field') as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(t.getValue()).toEqual(['a', 'b']);
  });

  it('should call onChange when tags change', () => {
    const onChange = vi.fn();
    const t = tagInput(container, { onChange });
    t.addTag('hello');
    expect(onChange).toHaveBeenCalledWith(['hello']);
  });

  it('should call onAdd when a tag is added', () => {
    const onAdd = vi.fn();
    const t = tagInput(container, { onAdd });
    t.addTag('hello');
    expect(onAdd).toHaveBeenCalledWith('hello');
  });

  it('should call onRemove when a tag is removed', () => {
    const onRemove = vi.fn();
    const t = tagInput(container, { value: ['a', 'b'], onRemove });
    t.removeTag('a');
    expect(onRemove).toHaveBeenCalledWith('a');
  });

  it('should show clear button when clearable and tags exist', () => {
    tagInput(container, { value: ['a'], clearable: true });
    const clearBtn = container.querySelector('.tx-tag-input-clear');
    expect(clearBtn).not.toBeNull();
  });

  it('should not show clear button when no tags', () => {
    tagInput(container, { clearable: true });
    const clearBtn = container.querySelector('.tx-tag-input-clear');
    expect(clearBtn).toBeNull();
  });

  it('destroy() clears content', () => {
    const t = tagInput(container, { value: ['a'] });
    t.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('should apply custom class', () => {
    tagInput(container, { class: 'my-custom' });
    const el = container.querySelector('.tx-tag-input');
    expect(el!.classList.contains('my-custom')).toBe(true);
  });

  it('should apply custom id', () => {
    tagInput(container, { id: 'my-tag-id' });
    const el = container.querySelector('#my-tag-id');
    expect(el).not.toBeNull();
  });
});
