import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { grid } from '../../src/widgets/grid';

describe('Grid widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const basicColumns = [
    { field: 'name', label: 'Name' },
    { field: 'email', label: 'Email' },
    { field: 'age', label: 'Age' },
  ];

  // Helper to query inside <template> content
  function queryTemplate(selector: string): Element | null {
    const tpl = container.querySelector('template');
    if (tpl) {
      return tpl.content.querySelector(selector);
    }
    return container.querySelector(selector);
  }

  function queryTemplateAll(selector: string): NodeListOf<Element> | Element[] {
    const tpl = container.querySelector('template');
    if (tpl) {
      return tpl.content.querySelectorAll(selector);
    }
    return container.querySelectorAll(selector);
  }

  it('should render a table with correct columns', () => {
    grid(container, { source: '/api/users', columns: basicColumns });

    const ths = queryTemplateAll('th');
    const labels = Array.from(ths).map(th => th.textContent?.trim());
    expect(labels).toContain('Name');
    expect(labels).toContain('Email');
    expect(labels).toContain('Age');
  });

  it('should generate xh-get with source URL', () => {
    grid(container, { source: '/api/data', columns: basicColumns });

    const dataEl = container.querySelector('[xh-get]') as HTMLElement;
    expect(dataEl).not.toBeNull();
    expect(dataEl.getAttribute('xh-get')).toBe('/api/data');
  });

  it('should include search input when searchable is true', () => {
    grid(container, { source: '/api/data', columns: basicColumns, searchable: true });

    const searchInput = container.querySelector('.tx-grid-search') as HTMLInputElement;
    expect(searchInput).not.toBeNull();
    expect(searchInput.type).toBe('text');
    expect(searchInput.placeholder).toBe('Search...');
  });

  it('should not include search input when searchable is false', () => {
    grid(container, { source: '/api/data', columns: basicColumns, searchable: false });

    const searchInput = container.querySelector('.tx-grid-search');
    expect(searchInput).toBeNull();
  });

  it('should include toolbar items', () => {
    grid(container, {
      source: '/api/data',
      columns: basicColumns,
      toolbar: [
        { type: 'button', label: 'Add', variant: 'primary' },
        { type: 'separator' },
        { type: 'text', content: 'Total: 100' },
      ],
    });

    const toolbar = container.querySelector('.tx-grid-toolbar');
    expect(toolbar).not.toBeNull();

    const btn = container.querySelector('.tx-btn-primary');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toContain('Add');

    const separator = container.querySelector('.tx-toolbar-separator');
    expect(separator).not.toBeNull();

    const text = container.querySelector('.tx-toolbar-text');
    expect(text).not.toBeNull();
    expect(text!.textContent).toBe('Total: 100');
  });

  it('should mark sortable columns in template', () => {
    grid(container, {
      source: '/api/data',
      columns: [
        { field: 'name', label: 'Name', sortable: true },
        { field: 'age', label: 'Age', sortable: false },
      ],
    });

    const sortableTh = queryTemplate('th.tx-grid-sortable[data-field="name"]');
    expect(sortableTh).not.toBeNull();

    const sortIcon = sortableTh!.querySelector('.tx-grid-sort-icon');
    expect(sortIcon).not.toBeNull();

    const nonSortableTh = queryTemplate('th[data-field="age"]');
    expect(nonSortableTh).not.toBeNull();
    expect(nonSortableTh!.classList.contains('tx-grid-sortable')).toBe(false);
  });

  it('should generate pagination section when paginated', () => {
    grid(container, {
      source: '/api/data',
      columns: basicColumns,
      paginated: true,
    });

    // Pagination is inside the template
    const footer = queryTemplate('.tx-grid-footer');
    expect(footer).not.toBeNull();

    const pagination = queryTemplate('.tx-grid-pagination');
    expect(pagination).not.toBeNull();
  });

  it('should not generate pagination when paginated is false', () => {
    grid(container, { source: '/api/data', columns: basicColumns, paginated: false });

    const footer = queryTemplate('.tx-grid-footer');
    expect(footer).toBeNull();
  });

  it('should hide columns marked as hidden', () => {
    grid(container, {
      source: '/api/data',
      columns: [
        { field: 'name', label: 'Name' },
        { field: 'secret', label: 'Secret', hidden: true },
        { field: 'age', label: 'Age' },
      ],
    });

    const ths = queryTemplateAll('th');
    const labels = Array.from(ths).map(th => th.textContent?.trim());
    expect(labels).toContain('Name');
    expect(labels).toContain('Age');
    expect(labels).not.toContain('Secret');
  });

  it('should add striped/hoverable/bordered/compact classes', () => {
    grid(container, {
      source: '/api/data',
      columns: basicColumns,
      striped: true,
      bordered: true,
      compact: true,
    });

    const table = queryTemplate('table') as HTMLElement;
    expect(table).not.toBeNull();
    expect(table.className).toContain('tx-table-striped');
    expect(table.className).toContain('tx-table-bordered');
    expect(table.className).toContain('tx-table-compact');
    expect(table.className).toContain('tx-table-hoverable');
  });

  it('should show row number column when rowNumbers is true', () => {
    grid(container, {
      source: '/api/data',
      columns: basicColumns,
      rowNumbers: true,
    });

    const rownumCol = queryTemplate('.tx-grid-rownum-col');
    expect(rownumCol).not.toBeNull();
    expect(rownumCol!.textContent).toBe('#');
  });

  it('should show select column when selectable is true', () => {
    grid(container, {
      source: '/api/data',
      columns: basicColumns,
      selectable: true,
    });

    const selectAll = queryTemplate('.tx-grid-select-all');
    expect(selectAll).not.toBeNull();
  });

  it('should destroy and clear content', () => {
    const instance = grid(container, { source: '/api/data', columns: basicColumns });
    expect(container.innerHTML).not.toBe('');

    instance.destroy();
    expect(container.innerHTML).toBe('');
  });

  it('should set column widths when specified', () => {
    grid(container, {
      source: '/api/data',
      columns: [
        { field: 'name', label: 'Name', width: '200px' },
        { field: 'age', label: 'Age' },
      ],
    });

    const th = queryTemplate('th[data-field="name"]') as HTMLElement;
    expect(th).not.toBeNull();
    expect(th.style.width).toBe('200px');
  });

  it('should show empty state message', () => {
    grid(container, {
      source: '/api/data',
      columns: basicColumns,
      emptyMessage: 'Nothing here',
    });

    const emptyText = queryTemplate('.tx-grid-empty-text');
    expect(emptyText).not.toBeNull();
    expect(emptyText!.textContent).toBe('Nothing here');
  });

  it('should render xh-each for rows with configured rowsField', () => {
    grid(container, {
      source: '/api/data',
      columns: basicColumns,
      rowsField: 'records',
    });

    const eachEl = queryTemplate('[xh-each="records"]');
    expect(eachEl).not.toBeNull();
  });

  it('should render column menu button when columnMenu is true', () => {
    grid(container, {
      source: '/api/data',
      columns: basicColumns,
      columnMenu: true,
    });

    const colBtn = container.querySelector('.tx-grid-col-btn');
    expect(colBtn).not.toBeNull();
  });

  it('should render export button when exportable is true', () => {
    grid(container, {
      source: '/api/data',
      columns: basicColumns,
      exportable: true,
    });

    const exportBtn = container.querySelector('.tx-grid-export-btn');
    expect(exportBtn).not.toBeNull();
  });

  it('should have tx-grid container with id', () => {
    grid(container, { source: '/api/data', columns: basicColumns, id: 'my-grid' });

    const gridEl = container.querySelector('#my-grid');
    expect(gridEl).not.toBeNull();
    expect(gridEl!.classList.contains('tx-grid')).toBe(true);
  });

  it('should render loading indicator', () => {
    grid(container, { source: '/api/data', columns: basicColumns });

    const loading = container.querySelector('.tx-grid-loading');
    expect(loading).not.toBeNull();
  });
});
