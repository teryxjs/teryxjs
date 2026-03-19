import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { datalist } from '../../src/widgets/datalist';
import { propertyGrid, descriptions } from '../../src/widgets/property-grid';

describe('DataList demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic DataList', () => {
    it('renders datalist container with xhtmlx source directive', () => {
      datalist(container, {
        source: '/api/notifications',
        itemsField: 'items',
        itemTemplate: '<div><strong xh-text="title"></strong></div>',
      });

      const dl = container.querySelector('.tx-datalist');
      expect(dl).not.toBeNull();

      const xhEl = container.querySelector('[xh-get="/api/notifications"]');
      expect(xhEl).not.toBeNull();
    });

    it('renders loading indicator', () => {
      datalist(container, {
        source: '/api/notifications',
        itemsField: 'items',
        itemTemplate: '<div xh-text="title"></div>',
      });

      const indicator = container.querySelector('.xh-indicator');
      expect(indicator).not.toBeNull();
      const spinner = container.querySelector('.tx-spinner');
      expect(spinner).not.toBeNull();
    });

    it('includes xh-each directive in template markup', () => {
      datalist(container, {
        source: '/api/notifications',
        itemsField: 'items',
        itemTemplate: '<span xh-text="title"></span>',
      });

      // xh-each lives inside a <template> tag, so check innerHTML
      const html = container.innerHTML;
      expect(html).toContain('xh-each="items"');
    });
  });

  describe('Grid Layout DataList', () => {
    it('renders grid layout class when layout is "grid"', () => {
      datalist(container, {
        source: '/api/notifications',
        itemsField: 'items',
        layout: 'grid',
        gridColumns: 2,
        itemTemplate: '<div xh-text="title"></div>',
      });

      const dl = container.querySelector('.tx-datalist-grid');
      expect(dl).not.toBeNull();
      expect(dl!.classList.contains('tx-datalist-grid')).toBe(true);
    });

    it('sets grid CSS custom properties in template', () => {
      datalist(container, {
        source: '/api/notifications',
        itemsField: 'items',
        layout: 'grid',
        gridColumns: 3,
        gridGap: '2rem',
        itemTemplate: '<div xh-text="title"></div>',
      });

      // Grid element is inside <template>, so check via innerHTML
      const html = container.innerHTML;
      expect(html).toContain('--tx-grid-cols:3');
      expect(html).toContain('--tx-grid-gap:2rem');
    });
  });

  describe('Empty State', () => {
    it('includes custom empty message in template markup', () => {
      datalist(container, {
        source: '/api/notifications',
        itemsField: 'items',
        emptyMessage: 'No notifications yet',
        itemTemplate: '<div xh-text="title"></div>',
      });

      // Empty message is inside <template>, so check via innerHTML
      const html = container.innerHTML;
      expect(html).toContain('No notifications yet');
      expect(html).toContain('tx-datalist-empty');
    });
  });
});

describe('PropertyGrid demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic PropertyGrid', () => {
    it('renders property grid table', () => {
      propertyGrid(container, {
        properties: [
          {
            name: 'name',
            value: 'Teryx',
            label: 'Name',
            type: 'string',
          },
          {
            name: 'version',
            value: '0.3.0',
            label: 'Version',
            type: 'string',
          },
          {
            name: 'stable',
            value: true,
            label: 'Stable',
            type: 'boolean',
          },
        ],
      });

      const table = container.querySelector('.tx-propgrid-table');
      expect(table).not.toBeNull();
    });

    it('renders all property rows', () => {
      propertyGrid(container, {
        properties: [
          {
            name: 'name',
            value: 'Teryx',
            label: 'Name',
            type: 'string',
          },
          {
            name: 'version',
            value: '0.3.0',
            label: 'Version',
            type: 'string',
          },
          {
            name: 'widgets',
            value: 45,
            label: 'Widgets',
            type: 'number',
          },
        ],
      });

      const rows = container.querySelectorAll('.tx-propgrid-row');
      expect(rows.length).toBe(3);
    });

    it('renders property names and values', () => {
      propertyGrid(container, {
        properties: [
          {
            name: 'name',
            value: 'Teryx',
            label: 'Name',
            type: 'string',
          },
        ],
      });

      const nameCell = container.querySelector('.tx-propgrid-name');
      expect(nameCell).not.toBeNull();
      expect(nameCell!.textContent).toBe('Name');

      const valueCell = container.querySelector('.tx-propgrid-value');
      expect(valueCell).not.toBeNull();
      expect(valueCell!.textContent).toBe('Teryx');
    });

    it('renders boolean values with styled spans', () => {
      propertyGrid(container, {
        properties: [
          {
            name: 'stable',
            value: true,
            label: 'Stable',
            type: 'boolean',
          },
        ],
      });

      const successSpan = container.querySelector('.tx-text-success');
      expect(successSpan).not.toBeNull();
      expect(successSpan!.textContent).toBe('true');
    });
  });

  describe('Editable PropertyGrid', () => {
    it('renders input controls when editable', () => {
      propertyGrid(container, {
        editable: true,
        properties: [
          {
            name: 'width',
            value: '100%',
            label: 'Width',
            type: 'string',
          },
          {
            name: 'visible',
            value: true,
            label: 'Visible',
            type: 'boolean',
          },
          {
            name: 'opacity',
            value: 1.0,
            label: 'Opacity',
            type: 'number',
          },
        ],
      });

      const textInput = container.querySelector('input[type="text"]');
      expect(textInput).not.toBeNull();

      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).not.toBeNull();

      const numberInput = container.querySelector('input[type="number"]');
      expect(numberInput).not.toBeNull();
    });

    it('renders select for select-type properties', () => {
      propertyGrid(container, {
        editable: true,
        properties: [
          {
            name: 'theme',
            value: 'light',
            label: 'Theme',
            type: 'select',
            options: [
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ],
          },
        ],
      });

      const select = container.querySelector('select');
      expect(select).not.toBeNull();
      const options = select!.querySelectorAll('option');
      expect(options.length).toBe(2);
    });

    it('fires onChange callback when input changes', () => {
      let changedName = '';
      let changedValue: unknown;

      propertyGrid(container, {
        editable: true,
        properties: [
          {
            name: 'width',
            value: '100%',
            label: 'Width',
            type: 'string',
          },
        ],
        onChange: (name, value) => {
          changedName = name;
          changedValue = value;
        },
      });

      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      input.value = '50%';
      input.dispatchEvent(new Event('change', { bubbles: true }));

      expect(changedName).toBe('width');
      expect(changedValue).toBe('50%');
    });
  });

  describe('API-driven PropertyGrid', () => {
    it('renders xhtmlx source directive when source is provided', () => {
      propertyGrid(container, {
        source: '/api/component-props',
        properties: [],
      });

      const xhEl = container.querySelector('[xh-get="/api/component-props"]');
      expect(xhEl).not.toBeNull();
    });

    it('includes xh-each directive in template markup', () => {
      propertyGrid(container, {
        source: '/api/component-props',
        properties: [],
      });

      // xh-each is inside <template>, so check via innerHTML
      const html = container.innerHTML;
      expect(html).toContain('xh-each="properties"');
    });
  });
});

describe('Descriptions demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic Descriptions', () => {
    it('renders descriptions container', () => {
      descriptions(container, {
        title: 'User Info',
        columns: 2,
        items: [
          { label: 'Name', value: 'Alice Johnson' },
          { label: 'Role', value: 'Engineer' },
        ],
      });

      const desc = container.querySelector('.tx-descriptions');
      expect(desc).not.toBeNull();
    });

    it('renders title header', () => {
      descriptions(container, {
        title: 'User Info',
        columns: 2,
        items: [{ label: 'Name', value: 'Alice Johnson' }],
      });

      const header = container.querySelector('.tx-descriptions-header');
      expect(header).not.toBeNull();
      expect(header!.textContent).toBe('User Info');
    });

    it('renders all description items', () => {
      descriptions(container, {
        title: 'User Info',
        columns: 2,
        items: [
          { label: 'Name', value: 'Alice Johnson' },
          { label: 'Role', value: 'Engineer' },
          { label: 'Department', value: 'Engineering' },
        ],
      });

      const items = container.querySelectorAll('.tx-descriptions-item');
      expect(items.length).toBe(3);
    });

    it('renders label and value for each item', () => {
      descriptions(container, {
        columns: 1,
        items: [{ label: 'Name', value: 'Alice' }],
      });

      const label = container.querySelector('.tx-descriptions-label');
      expect(label).not.toBeNull();
      expect(label!.textContent).toBe('Name');

      const value = container.querySelector('.tx-descriptions-value');
      expect(value).not.toBeNull();
      expect(value!.textContent).toBe('Alice');
    });
  });

  describe('Bordered Descriptions', () => {
    it('applies bordered class by default', () => {
      descriptions(container, {
        bordered: true,
        columns: 3,
        items: [{ label: 'Hostname', value: 'prod-web-01' }],
      });

      const desc = container.querySelector('.tx-descriptions');
      expect(desc!.classList.contains('tx-descriptions-bordered')).toBe(true);
    });

    it('renders column layout class', () => {
      descriptions(container, {
        columns: 3,
        items: [
          { label: 'A', value: '1' },
          { label: 'B', value: '2' },
          { label: 'C', value: '3' },
        ],
      });

      const body = container.querySelector('.tx-descriptions-body');
      expect(body).not.toBeNull();
      expect(body!.classList.contains('tx-descriptions-cols-3')).toBe(true);
    });
  });

  describe('Vertical (Single Column)', () => {
    it('renders single column layout', () => {
      descriptions(container, {
        columns: 1,
        bordered: false,
        items: [
          { label: 'Version', value: '0.3.0' },
          { label: 'Build', value: '2026.03.18' },
        ],
      });

      const body = container.querySelector('.tx-descriptions-body');
      expect(body).not.toBeNull();
      expect(body!.classList.contains('tx-descriptions-cols-1')).toBe(true);
    });

    it('does not apply bordered class when bordered is false', () => {
      descriptions(container, {
        columns: 1,
        bordered: false,
        items: [{ label: 'Version', value: '0.3.0' }],
      });

      const desc = container.querySelector('.tx-descriptions');
      expect(desc!.classList.contains('tx-descriptions-bordered')).toBe(false);
    });
  });

  describe('destroy', () => {
    it('clears container on destroy', () => {
      const inst = descriptions(container, {
        columns: 1,
        items: [{ label: 'A', value: 'B' }],
      });

      expect(container.querySelector('.tx-descriptions')).not.toBeNull();
      inst.destroy();
      expect(container.innerHTML).toBe('');
    });
  });
});
