import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { draggable, droppable } from '../../src/widgets/drag-drop';
import { exportCSV, exportExcel, exportJSON, exportHTML } from '../../src/widgets/exporter';

// ── Drag & Drop demo unit tests ─────────────────────────────

describe('Drag & Drop demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Sortable List', () => {
    it('creates draggable items with tx-draggable class', () => {
      const items = ['Apples', 'Bananas', 'Cherries'];
      const list = document.createElement('ul');
      container.appendChild(list);

      items.forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li);
        draggable(li, { data: text, ghost: true });
      });

      const draggables = list.querySelectorAll('.tx-draggable');
      expect(draggables.length).toBe(3);
    });

    it('each item has correct text content', () => {
      const items = ['Apples', 'Bananas', 'Cherries'];
      const list = document.createElement('ul');
      container.appendChild(list);

      items.forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li);
        draggable(li, { data: text });
      });

      const lis = list.querySelectorAll('li');
      expect(lis[0].textContent).toBe('Apples');
      expect(lis[1].textContent).toBe('Bananas');
      expect(lis[2].textContent).toBe('Cherries');
    });

    it('destroy removes draggable class from all items', () => {
      const items = ['Apples', 'Bananas'];
      const list = document.createElement('ul');
      container.appendChild(list);
      const instances: ReturnType<typeof draggable>[] = [];

      items.forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li);
        instances.push(draggable(li, { data: text }));
      });

      instances.forEach((inst) => inst.destroy());

      const draggables = list.querySelectorAll('.tx-draggable');
      expect(draggables.length).toBe(0);
    });
  });

  describe('Drag Between Containers', () => {
    it('creates two droppable panels', () => {
      const source = document.createElement('div');
      const target = document.createElement('div');
      container.appendChild(source);
      container.appendChild(target);

      droppable(source, { hoverClass: 'tx-drop-hover' });
      droppable(target, { hoverClass: 'tx-drop-hover' });

      expect(source.classList.contains('tx-droppable')).toBe(true);
      expect(target.classList.contains('tx-droppable')).toBe(true);
    });

    it('draggable items within source panel get tx-draggable class', () => {
      const source = document.createElement('div');
      container.appendChild(source);

      const items = ['Task A', 'Task B', 'Task C'];
      items.forEach((text) => {
        const item = document.createElement('div');
        item.textContent = text;
        source.appendChild(item);
        draggable(item, { data: text, ghost: true });
      });

      expect(source.querySelectorAll('.tx-draggable').length).toBe(3);
    });

    it('onDrop callback is invoked with correct data', () => {
      const onDrop = vi.fn();
      const dragEl = document.createElement('div');
      const dropEl = document.createElement('div');
      document.body.appendChild(dragEl);
      document.body.appendChild(dropEl);

      vi.spyOn(dropEl, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        right: 200,
        top: 0,
        bottom: 200,
        width: 200,
        height: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const dragInst = draggable(dragEl, { data: 'Task A', ghost: true });
      const dropInst = droppable(dropEl, { hoverClass: 'tx-drop-hover', onDrop });

      dragEl.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 5, clientY: 5, bubbles: true }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100, bubbles: true }));

      expect(onDrop).toHaveBeenCalledWith(dropEl, 'Task A');

      dragInst.destroy();
      dropInst.destroy();
      dragEl.remove();
      dropEl.remove();
    });
  });

  describe('Drag Handle', () => {
    it('creates draggable with handle selector', () => {
      const card = document.createElement('div');
      const handle = document.createElement('span');
      handle.className = 'dd-handle';
      card.appendChild(handle);
      card.appendChild(document.createTextNode('Card content'));
      container.appendChild(card);

      const inst = draggable(card, { handle: '.dd-handle', data: 'card', ghost: true });
      expect(card.classList.contains('tx-draggable')).toBe(true);
      inst.destroy();
    });

    it('throws when handle selector does not match', () => {
      const card = document.createElement('div');
      container.appendChild(card);

      expect(() => draggable(card, { handle: '.nonexistent' })).toThrow(/handle/);
    });
  });

  describe('Drop Zone with Accept Filter', () => {
    it('accept filter rejects invalid items', () => {
      const onDrop = vi.fn();
      const dragEl = document.createElement('div');
      const dropEl = document.createElement('div');
      document.body.appendChild(dragEl);
      document.body.appendChild(dropEl);

      vi.spyOn(dropEl, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        right: 200,
        top: 0,
        bottom: 200,
        width: 200,
        height: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const dragInst = draggable(dragEl, { data: { type: 'invalid', label: 'Bad' } });
      const dropInst = droppable(dropEl, {
        accept: (data: unknown) => (data as { type: string }).type === 'valid',
        hoverClass: 'tx-drop-hover',
        onDrop,
      });

      dragEl.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 5, clientY: 5, bubbles: true }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100, bubbles: true }));

      expect(onDrop).not.toHaveBeenCalled();

      dragInst.destroy();
      dropInst.destroy();
      dragEl.remove();
      dropEl.remove();
    });

    it('accept filter allows valid items', () => {
      const onDrop = vi.fn();
      const dragEl = document.createElement('div');
      const dropEl = document.createElement('div');
      document.body.appendChild(dragEl);
      document.body.appendChild(dropEl);

      vi.spyOn(dropEl, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        right: 200,
        top: 0,
        bottom: 200,
        width: 200,
        height: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const dragInst = draggable(dragEl, { data: { type: 'valid', label: 'Good' } });
      const dropInst = droppable(dropEl, {
        accept: (data: unknown) => (data as { type: string }).type === 'valid',
        hoverClass: 'tx-drop-hover',
        onDrop,
      });

      dragEl.dispatchEvent(new MouseEvent('mousedown', { button: 0, clientX: 5, clientY: 5, bubbles: true }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100, bubbles: true }));

      expect(onDrop).toHaveBeenCalledWith(dropEl, { type: 'valid', label: 'Good' });

      dragInst.destroy();
      dropInst.destroy();
      dragEl.remove();
      dropEl.remove();
    });
  });
});

// ── Export demo unit tests ──────────────────────────────────

describe('Export demos — unit tests', () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;
  let capturedContent: string;

  const sampleData = [
    { id: 1, name: 'Alice Johnson', role: 'Engineer', department: 'Engineering', salary: 125000 },
    { id: 2, name: 'Bob Smith', role: 'Designer', department: 'Design', salary: 110000 },
    { id: 3, name: 'Carol Lee', role: 'Manager', department: 'Engineering', salary: 145000 },
    { id: 4, name: 'David Kim', role: 'Analyst', department: 'Marketing', salary: 95000 },
    { id: 5, name: 'Eva Martinez', role: 'Developer', department: 'Engineering', salary: 130000 },
  ];

  const sampleCols = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Name' },
    { field: 'role', label: 'Role' },
    { field: 'department', label: 'Department' },
    { field: 'salary', label: 'Salary' },
  ];

  beforeEach(() => {
    capturedContent = '';

    const OriginalBlob = globalThis.Blob;
    vi.spyOn(globalThis, 'Blob' as any).mockImplementation((parts: BlobPart[], options?: BlobPropertyBag) => {
      capturedContent = parts.map((p) => String(p)).join('');
      return new OriginalBlob(parts, options);
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

  describe('Export CSV', () => {
    it('generates CSV with correct headers and 5 data rows', () => {
      exportCSV(sampleData, { columns: sampleCols, filename: 'team.csv' });
      const lines = capturedContent.split('\r\n');
      expect(lines[0]).toBe('ID,Name,Role,Department,Salary');
      expect(lines.length).toBe(6); // 1 header + 5 data
    });

    it('CSV first data row contains Alice Johnson', () => {
      exportCSV(sampleData, { columns: sampleCols, filename: 'team.csv' });
      const lines = capturedContent.split('\r\n');
      expect(lines[1]).toBe('1,Alice Johnson,Engineer,Engineering,125000');
    });

    it('triggers a download', () => {
      exportCSV(sampleData, { columns: sampleCols, filename: 'team.csv' });
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Export Excel', () => {
    it('generates Excel XML with Workbook root', () => {
      exportExcel(sampleData, { columns: sampleCols, filename: 'team.xls' });
      expect(capturedContent).toContain('<Workbook');
      expect(capturedContent).toContain('</Workbook>');
    });

    it('contains header row with bold style', () => {
      exportExcel(sampleData, { columns: sampleCols, filename: 'team.xls' });
      expect(capturedContent).toContain('ss:Bold="1"');
      expect(capturedContent).toContain('<Data ss:Type="String">Name</Data>');
    });

    it('contains data rows with correct values', () => {
      exportExcel(sampleData, { columns: sampleCols, filename: 'team.xls' });
      expect(capturedContent).toContain('<Data ss:Type="String">Alice Johnson</Data>');
      expect(capturedContent).toContain('<Data ss:Type="Number">125000</Data>');
    });

    it('triggers a download', () => {
      exportExcel(sampleData, { columns: sampleCols, filename: 'team.xls' });
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Export JSON', () => {
    it('generates valid JSON with 5 records', () => {
      exportJSON(sampleData, { filename: 'team.json' });
      const parsed = JSON.parse(capturedContent);
      expect(parsed.length).toBe(5);
    });

    it('JSON data matches sample data', () => {
      exportJSON(sampleData, { filename: 'team.json' });
      const parsed = JSON.parse(capturedContent);
      expect(parsed[0].name).toBe('Alice Johnson');
      expect(parsed[4].name).toBe('Eva Martinez');
    });

    it('triggers a download', () => {
      exportJSON(sampleData, { filename: 'team.json' });
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Export HTML', () => {
    it('generates HTML with table element', () => {
      exportHTML(sampleData, { columns: sampleCols, filename: 'team.html' });
      expect(capturedContent).toContain('<table>');
      expect(capturedContent).toContain('</table>');
    });

    it('HTML table has correct headers', () => {
      exportHTML(sampleData, { columns: sampleCols, filename: 'team.html' });
      expect(capturedContent).toContain('<th>ID</th>');
      expect(capturedContent).toContain('<th>Name</th>');
      expect(capturedContent).toContain('<th>Salary</th>');
    });

    it('HTML table contains data rows', () => {
      exportHTML(sampleData, { columns: sampleCols, filename: 'team.html' });
      expect(capturedContent).toContain('<td>Alice Johnson</td>');
      expect(capturedContent).toContain('<td>125000</td>');
    });

    it('triggers a download', () => {
      exportHTML(sampleData, { columns: sampleCols, filename: 'team.html' });
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('All Formats', () => {
    it('all four export functions can be called sequentially', () => {
      exportCSV(sampleData, { columns: sampleCols });
      expect(clickSpy).toHaveBeenCalledTimes(1);

      exportExcel(sampleData, { columns: sampleCols });
      expect(clickSpy).toHaveBeenCalledTimes(2);

      exportJSON(sampleData);
      expect(clickSpy).toHaveBeenCalledTimes(3);

      exportHTML(sampleData, { columns: sampleCols });
      expect(clickSpy).toHaveBeenCalledTimes(4);
    });
  });
});
