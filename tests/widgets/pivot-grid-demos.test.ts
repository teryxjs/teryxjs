import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pivotGrid } from '../../src/widgets/pivot-grid';

const salesData = [
  {
    region: 'North',
    product: 'Widget A',
    quarter: 'Q1',
    revenue: 12000,
    units: 120,
  },
  {
    region: 'North',
    product: 'Widget B',
    quarter: 'Q1',
    revenue: 8000,
    units: 95,
  },
  {
    region: 'North',
    product: 'Widget A',
    quarter: 'Q2',
    revenue: 15000,
    units: 150,
  },
  {
    region: 'North',
    product: 'Widget B',
    quarter: 'Q2',
    revenue: 9500,
    units: 110,
  },
  {
    region: 'South',
    product: 'Widget A',
    quarter: 'Q1',
    revenue: 10000,
    units: 100,
  },
  {
    region: 'South',
    product: 'Widget B',
    quarter: 'Q1',
    revenue: 7500,
    units: 80,
  },
  {
    region: 'South',
    product: 'Widget A',
    quarter: 'Q2',
    revenue: 13000,
    units: 130,
  },
  {
    region: 'South',
    product: 'Widget B',
    quarter: 'Q2',
    revenue: 8500,
    units: 90,
  },
  {
    region: 'East',
    product: 'Widget A',
    quarter: 'Q1',
    revenue: 11000,
    units: 105,
  },
  {
    region: 'East',
    product: 'Widget B',
    quarter: 'Q1',
    revenue: 6000,
    units: 70,
  },
  {
    region: 'East',
    product: 'Widget A',
    quarter: 'Q2',
    revenue: 14000,
    units: 140,
  },
  {
    region: 'East',
    product: 'Widget B',
    quarter: 'Q2',
    revenue: 7000,
    units: 85,
  },
];

describe('Pivot Grid demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic Pivot', () => {
    it('renders pivot table with rows and columns', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      const table = container.querySelector('.tx-pivot-table');
      expect(table).not.toBeNull();
    });

    it('renders row labels for each region', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      const rowLabels = container.querySelectorAll('.tx-pivot-row-label');
      const texts = Array.from(rowLabels).map((el) => el.textContent);
      expect(texts).toContain('North');
      expect(texts).toContain('South');
      expect(texts).toContain('East');
    });

    it('renders column headers for each quarter', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      const colHeaders = container.querySelectorAll('.tx-pivot-col-header');
      const texts = Array.from(colHeaders).map((el) => el.textContent);
      expect(texts).toContain('Q1');
      expect(texts).toContain('Q2');
    });

    it('renders grand total row', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      const grandTotalRow = container.querySelector('.tx-pivot-grand-total-row');
      expect(grandTotalRow).not.toBeNull();

      const label = container.querySelector('.tx-pivot-grand-total-label');
      expect(label).not.toBeNull();
      expect(label!.textContent).toBe('Grand Total');
    });

    it('computes correct sum aggregation', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      // North Q1: 12000 + 8000 = 20000
      // Grand total = sum of all revenue = 121500
      const grandTotals = container.querySelectorAll('.tx-pivot-grand-total');
      const totalTexts = Array.from(grandTotals).map((el) => el.textContent || '');
      expect(totalTexts).toContain('121500');
    });
  });

  describe('Multiple Value Fields', () => {
    it('renders value headers for both revenue and units', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [
          { field: 'revenue', aggregate: 'sum' },
          { field: 'units', aggregate: 'sum' },
        ],
      });

      const valueHeaders = container.querySelectorAll('.tx-pivot-value-field');
      const texts = Array.from(valueHeaders).map((el) => el.textContent || '');
      expect(texts.some((t) => t.includes('revenue'))).toBe(true);
      expect(texts.some((t) => t.includes('units'))).toBe(true);
    });

    it('renders more cells with two value fields than one', () => {
      const container2 = document.createElement('div');
      document.body.appendChild(container2);

      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      pivotGrid(container2, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [
          { field: 'revenue', aggregate: 'sum' },
          { field: 'units', aggregate: 'sum' },
        ],
      });

      const cells1 = container.querySelectorAll('.tx-pivot-cell').length;
      const cells2 = container2.querySelectorAll('.tx-pivot-cell').length;
      expect(cells2).toBeGreaterThan(cells1);

      container2.remove();
    });
  });

  describe('All Aggregate Functions', () => {
    it('renders value headers for all five aggregate types', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: [],
        values: [
          { field: 'revenue', aggregate: 'sum' },
          { field: 'revenue', aggregate: 'avg' },
          { field: 'revenue', aggregate: 'count' },
          { field: 'revenue', aggregate: 'min' },
          { field: 'revenue', aggregate: 'max' },
        ],
      });

      const valueHeaders = container.querySelectorAll('.tx-pivot-value-field');
      const texts = Array.from(valueHeaders).map((el) => el.textContent || '');
      expect(texts.some((t) => t.includes('sum'))).toBe(true);
      expect(texts.some((t) => t.includes('avg'))).toBe(true);
      expect(texts.some((t) => t.includes('count'))).toBe(true);
      expect(texts.some((t) => t.includes('min'))).toBe(true);
      expect(texts.some((t) => t.includes('max'))).toBe(true);
    });

    it('computes correct count aggregation', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'count' }],
      });

      // Each region has 4 rows
      const cells = container.querySelectorAll('.tx-pivot-data-row .tx-pivot-cell');
      const cellTexts = Array.from(cells).map((el) => el.textContent || '');
      // North has 4 entries, so count = 4
      expect(cellTexts).toContain('4');
    });

    it('computes correct avg aggregation', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'avg' }],
      });

      // North avg: (12000+8000+15000+9500)/4 = 11125
      const cells = container.querySelectorAll('.tx-pivot-data-row .tx-pivot-cell');
      const cellTexts = Array.from(cells).map((el) => el.textContent || '');
      expect(cellTexts).toContain('11125');
    });

    it('computes correct min aggregation', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'min' }],
      });

      // East min: min(11000,6000,14000,7000) = 6000
      const cells = container.querySelectorAll('.tx-pivot-data-row .tx-pivot-cell');
      const cellTexts = Array.from(cells).map((el) => el.textContent || '');
      expect(cellTexts).toContain('6000');
    });

    it('computes correct max aggregation', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: [],
        values: [{ field: 'revenue', aggregate: 'max' }],
      });

      // North max: max(12000,8000,15000,9500) = 15000
      const cells = container.querySelectorAll('.tx-pivot-data-row .tx-pivot-cell');
      const cellTexts = Array.from(cells).map((el) => el.textContent || '');
      expect(cellTexts).toContain('15000');
    });
  });

  describe('Collapsible Groups', () => {
    it('renders group rows when multiple row fields', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region', 'product'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      const groupRows = container.querySelectorAll('.tx-pivot-group-row');
      expect(groupRows.length).toBe(3); // East, North, South
    });

    it('renders toggle arrows in group rows', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region', 'product'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      const toggles = container.querySelectorAll('.tx-pivot-toggle');
      expect(toggles.length).toBe(3);
    });

    it('renders detail rows under group rows', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region', 'product'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      // 3 regions x 2 products = 6 detail rows
      const dataRows = container.querySelectorAll('.tx-pivot-data-row');
      expect(dataRows.length).toBe(6);
    });

    it('collapses group when group row is clicked', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region', 'product'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      const dataRowsBefore = container.querySelectorAll('.tx-pivot-data-row').length;
      expect(dataRowsBefore).toBe(6);

      // Click first group row to collapse it
      const groupRow = container.querySelector('.tx-pivot-group-row') as HTMLElement;
      groupRow.click();

      const dataRowsAfter = container.querySelectorAll('.tx-pivot-data-row').length;
      // After collapsing one group (2 detail rows), we should have 4
      expect(dataRowsAfter).toBe(4);
    });

    it('renders group subtotals', () => {
      pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region', 'product'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      const subtotals = container.querySelectorAll('.tx-pivot-subtotal');
      expect(subtotals.length).toBeGreaterThan(0);
    });
  });

  describe('Export Aggregated Data', () => {
    it('getAggregatedData returns array of row objects', () => {
      const inst = pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      const data = inst.getAggregatedData();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3); // East, North, South
    });

    it('getAggregatedData includes row field values', () => {
      const inst = pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      const data = inst.getAggregatedData();
      const regions = data.map((d) => d.region);
      expect(regions).toContain('North');
      expect(regions).toContain('South');
      expect(regions).toContain('East');
    });

    it('getAggregatedData includes aggregated values', () => {
      const inst = pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      const data = inst.getAggregatedData();
      const north = data.find((d) => d.region === 'North');
      expect(north).toBeDefined();
      // North total: 12000+8000+15000+9500 = 44500
      expect(north!.revenue_sum).toBe(44500);
    });
  });

  describe('destroy', () => {
    it('clears container on destroy', () => {
      const inst = pivotGrid(container, {
        source: JSON.stringify(salesData),
        rows: ['region'],
        columns: ['quarter'],
        values: [{ field: 'revenue', aggregate: 'sum' }],
      });

      expect(container.querySelector('.tx-pivot')).not.toBeNull();
      inst.destroy();
      expect(container.innerHTML).toBe('');
    });
  });
});
