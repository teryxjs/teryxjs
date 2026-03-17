import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pivotGrid } from '../../src/widgets/pivot-grid';

const SALES_DATA = [
  { region: 'North', product: 'Widget', quarter: 'Q1', revenue: 100, units: 10 },
  { region: 'North', product: 'Widget', quarter: 'Q2', revenue: 150, units: 15 },
  { region: 'North', product: 'Gadget', quarter: 'Q1', revenue: 200, units: 20 },
  { region: 'South', product: 'Widget', quarter: 'Q1', revenue: 120, units: 12 },
  { region: 'South', product: 'Widget', quarter: 'Q2', revenue: 180, units: 18 },
  { region: 'South', product: 'Gadget', quarter: 'Q1', revenue: 90, units: 9 },
  { region: 'South', product: 'Gadget', quarter: 'Q2', revenue: 110, units: 11 },
];

describe('PivotGrid widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render a pivot table', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'sum' }],
    });
    expect(container.querySelector('.tx-pivot-table')).not.toBeNull();
  });

  it('should render row labels', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'sum' }],
    });
    const labels = container.querySelectorAll('.tx-pivot-row-label');
    const texts = Array.from(labels).map((l) => l.textContent);
    expect(texts).toContain('North');
    expect(texts).toContain('South');
  });

  it('should compute sum aggregate', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'sum' }],
    });
    const cells = container.querySelectorAll('.tx-pivot-data-row .tx-pivot-cell:not(.tx-pivot-total)');
    const northRevenue = Number(cells[0].textContent);
    expect(northRevenue).toBe(450); // 100+150+200
  });

  it('should compute count aggregate', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'count' }],
    });
    const cells = container.querySelectorAll('.tx-pivot-data-row .tx-pivot-cell:not(.tx-pivot-total)');
    const northCount = Number(cells[0].textContent);
    expect(northCount).toBe(3);
  });

  it('should compute avg aggregate', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'avg' }],
    });
    const cells = container.querySelectorAll('.tx-pivot-data-row .tx-pivot-cell:not(.tx-pivot-total)');
    const northAvg = Number(cells[0].textContent);
    expect(northAvg).toBe(150); // (100+150+200)/3
  });

  it('should compute min aggregate', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'min' }],
    });
    const cells = container.querySelectorAll('.tx-pivot-data-row .tx-pivot-cell:not(.tx-pivot-total)');
    expect(Number(cells[0].textContent)).toBe(100);
  });

  it('should compute max aggregate', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'max' }],
    });
    const cells = container.querySelectorAll('.tx-pivot-data-row .tx-pivot-cell:not(.tx-pivot-total)');
    expect(Number(cells[0].textContent)).toBe(200);
  });

  it('should render column headers when column fields provided', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: ['quarter'],
      values: [{ field: 'revenue', aggregate: 'sum' }],
    });
    const colHeaders = container.querySelectorAll('.tx-pivot-col-header');
    expect(colHeaders.length).toBeGreaterThan(0);
    const texts = Array.from(colHeaders).map((h) => h.textContent);
    expect(texts).toContain('Q1');
    expect(texts).toContain('Q2');
  });

  it('should render grand total row', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'sum' }],
    });
    const grandTotal = container.querySelector('.tx-pivot-grand-total-row');
    expect(grandTotal).not.toBeNull();
    expect(grandTotal!.textContent).toContain('Grand Total');
  });

  it('should render grand total with correct value', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'sum' }],
    });
    const grandCells = container.querySelectorAll('.tx-pivot-grand-total');
    const total = Number(grandCells[0].textContent);
    expect(total).toBe(950); // sum of all revenue
  });

  it('should support multiple row fields', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region', 'product'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'sum' }],
    });
    const groupRows = container.querySelectorAll('.tx-pivot-group-row');
    expect(groupRows.length).toBe(2); // North, South
  });

  it('should toggle group collapse on click', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region', 'product'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'sum' }],
    });
    const initialDataRows = container.querySelectorAll('.tx-pivot-data-row').length;
    const groupRow = container.querySelector('.tx-pivot-group-row') as HTMLElement;
    groupRow.click();
    const afterCollapseRows = container.querySelectorAll('.tx-pivot-data-row').length;
    expect(afterCollapseRows).toBeLessThan(initialDataRows);
  });

  it('should support multiple value fields', () => {
    pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [
        { field: 'revenue', aggregate: 'sum' },
        { field: 'units', aggregate: 'sum' },
      ],
    });
    const valueHeaders = container.querySelectorAll('.tx-pivot-value-field');
    expect(valueHeaders.length).toBeGreaterThanOrEqual(4); // 2 value + 2 total cols
  });

  it('refresh() updates with new data', () => {
    const p = pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'sum' }],
    });
    p.refresh([
      { region: 'East', revenue: 300 },
      { region: 'West', revenue: 400 },
    ]);
    const labels = container.querySelectorAll('.tx-pivot-row-label');
    const texts = Array.from(labels).map((l) => l.textContent);
    expect(texts).toContain('East');
    expect(texts).toContain('West');
    expect(texts).not.toContain('North');
  });

  it('getAggregatedData() returns pivot results', () => {
    const p = pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'sum' }],
    });
    const data = p.getAggregatedData();
    expect(data.length).toBe(2);
    const north = data.find((d) => d.region === 'North');
    expect(north).toBeDefined();
    expect(north!.revenue_sum).toBe(450);
  });

  it('destroy() clears content', () => {
    const p = pivotGrid(container, {
      source: JSON.stringify(SALES_DATA),
      rows: ['region'],
      columns: [],
      values: [{ field: 'revenue', aggregate: 'sum' }],
    });
    p.destroy();
    expect(container.innerHTML).toBe('');
  });
});
