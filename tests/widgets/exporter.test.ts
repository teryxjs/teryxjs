import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exportCSV, exportJSON, gridColumnsToExport } from '../../src/widgets/exporter';
import type { GridColumn } from '../../src/types';

describe('Exporter', () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;
  let capturedContent: string;

  beforeEach(() => {
    capturedContent = '';

    // Mock Blob to capture the content string
    const OriginalBlob = globalThis.Blob;
    vi.spyOn(globalThis, 'Blob' as any).mockImplementation((parts: BlobPart[], options?: BlobPropertyBag) => {
      capturedContent = parts.map((p) => String(p)).join('');
      const blob = new OriginalBlob(parts, options);
      return blob;
    });

    createObjectURLSpy = vi.fn(() => 'blob:mock-url');
    revokeObjectURLSpy = vi.fn();
    (globalThis as any).URL.createObjectURL = createObjectURLSpy;
    (globalThis as any).URL.revokeObjectURL = revokeObjectURLSpy;

    clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const sampleData = [
    { name: 'Alice', age: 30, city: 'NYC' },
    { name: 'Bob', age: 25, city: 'LA' },
    { name: 'Charlie', age: 35, city: 'Chicago' },
  ];

  describe('exportCSV()', () => {
    it('should generate correct CSV string', () => {
      exportCSV(sampleData, {
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'age', label: 'Age' },
          { field: 'city', label: 'City' },
        ],
      });
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1);
    });

    it('should generate CSV with headers by default', () => {
      exportCSV(sampleData, {
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'age', label: 'Age' },
        ],
      });
      const lines = capturedContent.split('\r\n');
      expect(lines[0]).toBe('Name,Age');
      expect(lines[1]).toBe('Alice,30');
      expect(lines[2]).toBe('Bob,25');
    });

    it('should generate CSV without headers when includeHeader is false', () => {
      exportCSV(sampleData, {
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'age', label: 'Age' },
        ],
        includeHeader: false,
      });
      const lines = capturedContent.split('\r\n');
      expect(lines[0]).toBe('Alice,30');
    });

    it('should infer columns from data when not provided', () => {
      exportCSV(sampleData);
      const lines = capturedContent.split('\r\n');
      expect(lines[0]).toContain('name');
      expect(lines[0]).toContain('age');
      expect(lines[0]).toContain('city');
    });

    it('should escape CSV special characters', () => {
      exportCSV(
        [
          { name: 'Alice, Jr.', note: 'She said "hello"' },
          { name: 'Bob\nSmith', note: 'normal' },
        ],
        {
          columns: [
            { field: 'name', label: 'Name' },
            { field: 'note', label: 'Note' },
          ],
        },
      );
      expect(capturedContent).toContain('"Alice, Jr."');
      expect(capturedContent).toContain('"She said ""hello"""');
      expect(capturedContent).toContain('"Bob\nSmith"');
    });

    it('should use custom delimiter', () => {
      exportCSV(sampleData, {
        columns: [
          { field: 'name', label: 'Name' },
          { field: 'age', label: 'Age' },
        ],
        delimiter: ';',
      });
      const lines = capturedContent.split('\r\n');
      expect(lines[0]).toBe('Name;Age');
      expect(lines[1]).toBe('Alice;30');
    });

    it('should handle empty data', () => {
      exportCSV([], { columns: [{ field: 'name', label: 'Name' }] });
      expect(capturedContent).toBe('Name');
    });
  });

  describe('exportJSON()', () => {
    it('should generate correct JSON', () => {
      exportJSON(sampleData);
      const parsed = JSON.parse(capturedContent);
      expect(parsed).toEqual(sampleData);
      expect(parsed.length).toBe(3);
    });

    it('should produce pretty-printed JSON', () => {
      exportJSON(sampleData);
      expect(capturedContent).toContain('\n');
      expect(capturedContent).toContain('  ');
    });

    it('should handle empty array', () => {
      exportJSON([]);
      expect(JSON.parse(capturedContent)).toEqual([]);
    });
  });

  describe('gridColumnsToExport()', () => {
    it('should filter hidden columns', () => {
      const columns: GridColumn[] = [
        { field: 'name', label: 'Name' },
        { field: 'secret', label: 'Secret', hidden: true },
        { field: 'age', label: 'Age' },
      ];
      const result = gridColumnsToExport(columns);
      expect(result.length).toBe(2);
      expect(result.map((c) => c.field)).toEqual(['name', 'age']);
    });

    it('should return empty array for empty columns', () => {
      expect(gridColumnsToExport([])).toEqual([]);
    });

    it('should include all columns when none are hidden', () => {
      const columns: GridColumn[] = [
        { field: 'a', label: 'A' },
        { field: 'b', label: 'B' },
      ];
      expect(gridColumnsToExport(columns).length).toBe(2);
    });

    it('should exclude all columns when all are hidden', () => {
      const columns: GridColumn[] = [
        { field: 'a', label: 'A', hidden: true },
        { field: 'b', label: 'B', hidden: true },
      ];
      expect(gridColumnsToExport(columns).length).toBe(0);
    });
  });

  describe('column inference from data', () => {
    it('infers columns from first row keys', () => {
      exportCSV([{ x: 1, y: 2, z: 3 }]);
      expect(capturedContent.split('\r\n')[0]).toBe('x,y,z');
    });

    it('returns no columns for empty data', () => {
      exportCSV([]);
      expect(capturedContent).toBe('');
    });
  });
});
