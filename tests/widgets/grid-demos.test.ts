import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { grid } from '../../src/widgets/grid';
import { exportCSV, exportExcel, exportJSON, exportHTML } from '../../src/widgets/exporter';

describe('Grid demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function queryTemplate(selector: string): Element | null {
    const tpl = container.querySelector('template');
    if (tpl) return tpl.content.querySelector(selector);
    return container.querySelector(selector);
  }

  function queryTemplateAll(selector: string): Element[] {
    const tpl = container.querySelector('template');
    if (tpl) return Array.from(tpl.content.querySelectorAll(selector));
    return Array.from(container.querySelectorAll(selector));
  }

  const sampleData = [
    { name: 'Alice', role: 'Engineer', department: 'Engineering', city: 'SF', salary: 125000, active: true },
    { name: 'Bob', role: 'Designer', department: 'Design', city: 'NY', salary: 110000, active: true },
    { name: 'Carol', role: 'Manager', department: 'Engineering', city: 'Chicago', salary: 145000, active: false },
  ];

  describe('Basic Grid', () => {
    it('renders grid container with API source', () => {
      grid(container, {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'role', label: 'Role' },
          { field: 'department', label: 'Department' },
        ],
        pageSize: 5,
        striped: true,
      });

      const gridEl = container.querySelector('.tx-grid');
      expect(gridEl).not.toBeNull();

      const table = queryTemplate('table');
      expect(table).not.toBeNull();
      expect(table!.className).toContain('tx-table-striped');
    });

    it('renders correct column headers', () => {
      grid(container, {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'role', label: 'Role' },
        ],
      });

      const headers = queryTemplateAll('th');
      const labels = headers.map((h) => h.textContent?.trim());
      expect(labels).toContain('Name');
      expect(labels).toContain('Role');
    });
  });

  describe('Sorting', () => {
    it('renders sortable headers with sort icons', () => {
      grid(container, {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name', sortable: true },
          { field: 'salary', label: 'Salary', sortable: true },
          { field: 'city', label: 'City' },
        ],
        data: sampleData,
      });

      const sortable = queryTemplateAll('.tx-grid-sortable');
      expect(sortable.length).toBe(2);

      const sortIcons = queryTemplateAll('.tx-grid-sort-icon');
      expect(sortIcons.length).toBe(2);
    });
  });

  describe('Column Filtering', () => {
    it('renders filter row when columns have filterable', () => {
      grid(container, {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name', filterable: true },
          {
            field: 'role',
            label: 'Role',
            filterable: true,
            filterType: 'select',
            filterOptions: [
              { value: 'Engineer', label: 'Engineer' },
              { value: 'Designer', label: 'Designer' },
            ],
          },
        ],
        data: sampleData,
      });

      const filterRow = queryTemplate('.tx-grid-filter-row');
      expect(filterRow).not.toBeNull();

      const textFilter = queryTemplate('.tx-grid-filter[type="text"]');
      expect(textFilter).not.toBeNull();

      const selectFilter = queryTemplate('select.tx-grid-filter');
      expect(selectFilter).not.toBeNull();
    });
  });

  describe('Pagination', () => {
    it('renders pagination footer when paginated is true', () => {
      grid(container, {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
        paginated: true,
        pageSize: 10,
      });

      const footer = queryTemplate('.tx-grid-footer');
      expect(footer).not.toBeNull();

      const pagination = queryTemplate('.tx-grid-pagination');
      expect(pagination).not.toBeNull();
    });

    it('renders searchable toolbar when searchable is true', () => {
      grid(container, {
        source: '/api/users',
        columns: [{ field: 'name', label: 'Name' }],
        paginated: true,
        searchable: true,
      });

      const search = container.querySelector('.tx-grid-search');
      expect(search).not.toBeNull();
    });
  });

  describe('Row Grouping', () => {
    it('sets group-by data attribute', () => {
      grid(container, {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'department', label: 'Department' },
        ],
        data: sampleData,
        groupBy: 'department',
      });

      const dataEl = container.querySelector('[data-group-by="department"]');
      expect(dataEl).not.toBeNull();
    });
  });

  describe('Inline Cell Editing', () => {
    it('renders cells with data-editable attribute', () => {
      grid(container, {
        source: '/api/users',
        editable: true,
        columns: [
          { field: 'name', label: 'Name', editable: true },
          { field: 'salary', label: 'Salary', editable: true, editorType: 'number' },
          { field: 'city', label: 'City' },
        ],
        data: sampleData,
      });

      const editableCells = queryTemplateAll('td[data-editable="true"]');
      expect(editableCells.length).toBe(2);

      const numberEditor = queryTemplate('td[data-editor-type="number"]');
      expect(numberEditor).not.toBeNull();
    });
  });

  describe('Frozen Columns', () => {
    it('renders locked column containers', () => {
      grid(container, {
        source: '/api/users',
        columns: [
          { field: 'name', label: 'Name', locked: 'left', width: '160px' },
          { field: 'role', label: 'Role' },
          { field: 'department', label: 'Department' },
          { field: 'active', label: 'Active', locked: 'right', renderer: 'boolean' },
        ],
        data: sampleData,
      });

      const lockedContainer = queryTemplate('.tx-grid-locked-container');
      expect(lockedContainer).not.toBeNull();

      const leftLocked = queryTemplate('.tx-grid-locked-left');
      expect(leftLocked).not.toBeNull();

      const rightLocked = queryTemplate('.tx-grid-locked-right');
      expect(rightLocked).not.toBeNull();
    });
  });

  describe('Scrollable Grid', () => {
    it('applies max-height and sticky header', () => {
      grid(container, {
        source: '/api/users',
        maxHeight: '300px',
        stickyHeader: true,
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'email', label: 'Email' },
        ],
      });

      const body = container.querySelector('.tx-grid-body') as HTMLElement;
      expect(body).not.toBeNull();
      expect(body.style.maxHeight).toBe('300px');

      const table = queryTemplate('table');
      expect(table).not.toBeNull();
      expect(table!.className).toContain('tx-table-sticky');
    });
  });

  describe('Row Reorder', () => {
    it('renders row numbers when rowNumbers is true', () => {
      grid(container, {
        source: '/api/users',
        reorderable: true,
        rowNumbers: true,
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'role', label: 'Role' },
        ],
        data: sampleData,
      });

      const rownumCol = queryTemplate('.tx-grid-rownum-col');
      expect(rownumCol).not.toBeNull();
    });
  });

  describe('Export', () => {
    let capturedContent: string[];
    const OrigBlob = globalThis.Blob;
    let origCreate: typeof URL.createObjectURL;
    let origRevoke: typeof URL.revokeObjectURL;
    let origClick: () => void;

    beforeEach(() => {
      capturedContent = [];
      origCreate = URL.createObjectURL;
      origRevoke = URL.revokeObjectURL;
      origClick = HTMLAnchorElement.prototype.click;
      // Intercept Blob constructor to capture string content
      globalThis.Blob = class extends OrigBlob {
        constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
          super(parts, options);
          if (parts) capturedContent.push(parts.map(String).join(''));
        }
      } as typeof Blob;
      URL.createObjectURL = () => 'blob:mock';
      URL.revokeObjectURL = () => {};
      HTMLAnchorElement.prototype.click = function () {};
    });

    afterEach(() => {
      globalThis.Blob = OrigBlob;
      URL.createObjectURL = origCreate;
      URL.revokeObjectURL = origRevoke;
      HTMLAnchorElement.prototype.click = origClick;
    });

    it('exportCSV generates CSV content', () => {
      exportCSV(sampleData, {
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'role', label: 'Role' },
        ],
      });

      expect(capturedContent.length).toBeGreaterThanOrEqual(1);
      const text = capturedContent[capturedContent.length - 1];
      expect(text).toContain('Name,Role');
      expect(text).toContain('Alice,Engineer');
    });

    it('exportJSON generates valid JSON content', () => {
      exportJSON(sampleData);

      expect(capturedContent.length).toBeGreaterThanOrEqual(1);
      const text = capturedContent[capturedContent.length - 1];
      const parsed = JSON.parse(text);
      expect(parsed).toHaveLength(3);
      expect(parsed[0].name).toBe('Alice');
    });

    it('exportExcel generates XML spreadsheet content', () => {
      exportExcel(sampleData, {
        columns: [{ field: 'name', label: 'Name' }],
      });

      expect(capturedContent.length).toBeGreaterThanOrEqual(1);
      const text = capturedContent[capturedContent.length - 1];
      expect(text).toContain('Workbook');
      expect(text).toContain('Alice');
    });

    it('exportHTML generates HTML table content', () => {
      exportHTML(sampleData, {
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'role', label: 'Role' },
        ],
      });

      expect(capturedContent.length).toBeGreaterThanOrEqual(1);
      const text = capturedContent[capturedContent.length - 1];
      expect(text).toContain('<table>');
      expect(text).toContain('<th>Name</th>');
      expect(text).toContain('Alice');
    });
  });
});
