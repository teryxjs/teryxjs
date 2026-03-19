import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tree } from '../../src/widgets/tree';

describe('Tree demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const basicNodes = [
    {
      id: '1',
      text: 'Documents',
      children: [
        {
          id: '1a',
          text: 'Reports',
          children: [
            { id: '1a1', text: 'Q1 Report.pdf' },
            { id: '1a2', text: 'Q2 Report.pdf' },
          ],
        },
        {
          id: '1b',
          text: 'Presentations',
          children: [{ id: '1b1', text: 'Kickoff.pptx' }],
        },
      ],
    },
    {
      id: '2',
      text: 'Images',
      children: [
        { id: '2a', text: 'photo.jpg' },
        { id: '2b', text: 'logo.png' },
      ],
    },
    { id: '3', text: 'README.md' },
  ];

  describe('Basic Tree', () => {
    it('renders tree container with role="tree"', () => {
      tree(container, { nodes: basicNodes });

      const treeEl = container.querySelector('.tx-tree');
      expect(treeEl).not.toBeNull();
      expect(treeEl!.getAttribute('role')).toBe('tree');
    });

    it('renders all top-level nodes', () => {
      tree(container, { nodes: basicNodes });

      const treeEl = container.querySelector('.tx-tree')!;
      // Top-level nodes are direct children of the tree
      const topLevel = treeEl.querySelectorAll(':scope > .tx-tree-node');
      expect(topLevel.length).toBe(3);
    });

    it('renders node labels correctly', () => {
      tree(container, { nodes: basicNodes });

      const labels = Array.from(container.querySelectorAll('.tx-tree-label')).map((el) => el.textContent);
      expect(labels).toContain('Documents');
      expect(labels).toContain('Reports');
      expect(labels).toContain('README.md');
    });

    it('renders toggle icons for parent nodes', () => {
      tree(container, { nodes: basicNodes });

      const toggles = container.querySelectorAll('.tx-tree-toggle');
      // Documents, Reports, Presentations, Images = 4 parent nodes
      expect(toggles.length).toBe(4);
    });

    it('renders leaf nodes with indent (no toggle)', () => {
      tree(container, { nodes: basicNodes });

      const indents = container.querySelectorAll('.tx-tree-indent');
      // Leaf nodes: Q1, Q2, Kickoff, photo, logo, README = 6
      expect(indents.length).toBe(6);
    });
  });

  describe('Checkboxes', () => {
    it('renders checkboxes when checkable is true', () => {
      tree(container, {
        checkable: true,
        nodes: [
          {
            id: 'p1',
            text: 'Frontend',
            children: [
              { id: 'p1a', text: 'React', checked: true },
              { id: 'p1b', text: 'Vue' },
            ],
          },
        ],
      });

      const checkboxes = container.querySelectorAll('.tx-tree-checkbox');
      expect(checkboxes.length).toBe(3); // parent + 2 children
    });

    it('pre-checks nodes with checked: true', () => {
      tree(container, {
        checkable: true,
        nodes: [
          {
            id: 'p1',
            text: 'Frontend',
            children: [
              { id: 'p1a', text: 'React', checked: true },
              { id: 'p1b', text: 'Vue' },
            ],
          },
        ],
      });

      const checked = container.querySelectorAll('.tx-tree-checkbox:checked');
      expect(checked.length).toBe(1);
    });

    it('getChecked returns checked nodes', () => {
      const inst = tree(container, {
        checkable: true,
        nodes: [
          { id: 'c1', text: 'A', checked: true },
          { id: 'c2', text: 'B' },
          { id: 'c3', text: 'C', checked: true },
        ],
      });

      const result = inst.getChecked();
      expect(result.length).toBe(2);
      expect(result.map((n) => n.id)).toContain('c1');
      expect(result.map((n) => n.id)).toContain('c3');
    });
  });

  describe('Async Loading', () => {
    it('renders xhtmlx source directive when source is provided', () => {
      tree(container, { source: '/api/tree' });

      const treeEl = container.querySelector('.tx-tree');
      expect(treeEl).not.toBeNull();

      const xhEl = container.querySelector('[xh-get="/api/tree"]');
      expect(xhEl).not.toBeNull();
    });

    it('renders loading indicator for source-based tree', () => {
      tree(container, { source: '/api/tree' });

      const indicator = container.querySelector('.xh-indicator');
      expect(indicator).not.toBeNull();

      const spinner = container.querySelector('.tx-spinner');
      expect(spinner).not.toBeNull();
    });
  });

  describe('Custom Icons', () => {
    it('renders custom icons on nodes', () => {
      tree(container, {
        nodes: [
          {
            id: 'i1',
            text: 'Home',
            icon: 'home',
            children: [
              { id: 'i1a', text: 'Profile', icon: 'user' },
              { id: 'i1b', text: 'Settings', icon: 'settings' },
            ],
          },
        ],
      });

      const icons = container.querySelectorAll('.tx-tree-icon');
      expect(icons.length).toBe(3);
      // Each icon should contain an SVG
      icons.forEach((iconEl) => {
        expect(iconEl.querySelector('svg')).not.toBeNull();
      });
    });

    it('renders default folder/file icons when no custom icon is set', () => {
      tree(container, {
        nodes: [
          {
            id: 'd1',
            text: 'Parent',
            children: [{ id: 'd1a', text: 'Child' }],
          },
        ],
      });

      const icons = container.querySelectorAll('.tx-tree-icon');
      expect(icons.length).toBe(2);
    });
  });

  describe('Search / Filter', () => {
    it('renders nodes that can be filtered by display style', () => {
      tree(container, {
        nodes: [
          {
            id: 'f1',
            text: 'Animals',
            children: [
              { id: 'f1a', text: 'Cat' },
              { id: 'f1b', text: 'Dog' },
            ],
          },
        ],
        expandAll: true,
      });

      // Simulate filter: hide non-matching leaf nodes
      const allNodes = container.querySelectorAll('.tx-tree-node');
      expect(allNodes.length).toBe(3); // Animals, Cat, Dog

      const leafNodes = Array.from(allNodes).filter((n) => !n.querySelector(':scope > .tx-tree-children'));
      expect(leafNodes.length).toBe(2); // Cat, Dog

      // Hide "Dog"
      (leafNodes[1] as HTMLElement).style.display = 'none';
      expect((leafNodes[1] as HTMLElement).style.display).toBe('none');
      expect((leafNodes[0] as HTMLElement).style.display).not.toBe('none');
    });
  });

  describe('Expand All / Collapse All', () => {
    it('expandAll expands all nodes', () => {
      const inst = tree(container, { nodes: basicNodes });

      // Initially children are collapsed
      inst.expandAll();

      const expanded = container.querySelectorAll('.tx-tree-expanded');
      expect(expanded.length).toBeGreaterThanOrEqual(4); // all parent nodes
    });

    it('collapseAll collapses all nodes', () => {
      const inst = tree(container, { nodes: basicNodes, expandAll: true });

      // Need a tick for expandAll option to take effect
      inst.collapseAll();

      const expanded = container.querySelectorAll('.tx-tree-expanded');
      expect(expanded.length).toBe(0);
    });

    it('expand/collapse individual nodes', () => {
      const inst = tree(container, { nodes: basicNodes });

      inst.expand('1');
      const node1 = container.querySelector('[data-id="1"]');
      expect(node1!.classList.contains('tx-tree-expanded')).toBe(true);

      inst.collapse('1');
      expect(node1!.classList.contains('tx-tree-expanded')).toBe(false);
    });
  });

  describe('Selection', () => {
    it('getSelected returns null initially', () => {
      const inst = tree(container, { nodes: basicNodes });
      expect(inst.getSelected()).toBeNull();
    });

    it('clicking a node selects it', () => {
      const inst = tree(container, { nodes: basicNodes });

      const content = container.querySelector('[data-id="3"] .tx-tree-content') as HTMLElement;
      content.click();

      const selected = inst.getSelected();
      expect(selected).not.toBeNull();
      expect(selected!.id).toBe('3');
    });
  });
});
