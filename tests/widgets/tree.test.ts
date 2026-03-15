import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tree } from '../../src/widgets/tree';

describe('Tree widget', () => {
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
      id: 'root',
      text: 'Root',
      children: [
        { id: 'child1', text: 'Child 1' },
        { id: 'child2', text: 'Child 2', children: [
          { id: 'grandchild1', text: 'Grandchild 1' },
        ]},
      ],
    },
  ];

  it('should render nodes with correct hierarchy', () => {
    tree(container, { nodes: basicNodes });

    const rootNode = container.querySelector('[data-id="root"]');
    expect(rootNode).not.toBeNull();

    const child1 = container.querySelector('[data-id="child1"]');
    expect(child1).not.toBeNull();

    const child2 = container.querySelector('[data-id="child2"]');
    expect(child2).not.toBeNull();

    const grandchild = container.querySelector('[data-id="grandchild1"]');
    expect(grandchild).not.toBeNull();

    // Labels
    const labels = container.querySelectorAll('.tx-tree-label');
    const texts = Array.from(labels).map(l => l.textContent);
    expect(texts).toContain('Root');
    expect(texts).toContain('Child 1');
    expect(texts).toContain('Child 2');
    expect(texts).toContain('Grandchild 1');
  });

  it('should toggle expand/collapse', () => {
    const t = tree(container, { nodes: basicNodes });

    // Root starts collapsed by default (expanded: false)
    const rootNode = container.querySelector('[data-id="root"]') as HTMLElement;
    const children = rootNode.querySelector('.tx-tree-children') as HTMLElement;

    expect(children.style.display).toBe('none');

    // Expand
    t.expand('root');
    expect(rootNode.classList.contains('tx-tree-expanded')).toBe(true);
    expect(children.style.display).toBe('');

    // Collapse
    t.collapse('root');
    expect(rootNode.classList.contains('tx-tree-expanded')).toBe(false);
    expect(children.style.display).toBe('none');
  });

  it('expandAll() expands all nodes', () => {
    const t = tree(container, { nodes: basicNodes });

    t.expandAll();

    const nodes = container.querySelectorAll('.tx-tree-node');
    nodes.forEach(node => {
      const ch = node.querySelector(':scope > .tx-tree-children') as HTMLElement;
      if (ch) {
        expect(node.classList.contains('tx-tree-expanded')).toBe(true);
        expect(ch.style.display).toBe('');
      }
    });
  });

  it('collapseAll() collapses all nodes', () => {
    const t = tree(container, {
      nodes: [{ id: 'r', text: 'R', expanded: true, children: [
        { id: 'c1', text: 'C1', expanded: true, children: [
          { id: 'gc1', text: 'GC1' },
        ]},
      ]}],
    });

    t.collapseAll();

    const nodes = container.querySelectorAll('.tx-tree-node');
    nodes.forEach(node => {
      const ch = node.querySelector(':scope > .tx-tree-children') as HTMLElement;
      if (ch) {
        expect(ch.style.display).toBe('none');
      }
    });
  });

  it('selection works via click', () => {
    const t = tree(container, { nodes: basicNodes, selectable: true });
    t.expandAll();

    const content = container.querySelector('[data-id="child1"] .tx-tree-content') as HTMLElement;
    content.click();

    expect(content.classList.contains('tx-tree-selected')).toBe(true);
    const selected = t.getSelected();
    expect(selected).not.toBeNull();
    expect(selected!.id).toBe('child1');
  });

  it('clicking another node deselects the previous', () => {
    const t = tree(container, { nodes: basicNodes, selectable: true });
    t.expandAll();

    const content1 = container.querySelector('[data-id="child1"] .tx-tree-content') as HTMLElement;
    content1.click();
    expect(t.getSelected()!.id).toBe('child1');

    const content2 = container.querySelector('[data-id="child2"] .tx-tree-content') as HTMLElement;
    content2.click();
    expect(t.getSelected()!.id).toBe('child2');

    expect(content1.classList.contains('tx-tree-selected')).toBe(false);
    expect(content2.classList.contains('tx-tree-selected')).toBe(true);
  });

  it('checkbox mode renders checkboxes', () => {
    tree(container, { nodes: basicNodes, checkable: true });

    const checkboxes = container.querySelectorAll('.tx-tree-checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('getChecked() returns checked nodes', () => {
    const nodes = [
      { id: 'a', text: 'A', checked: true },
      { id: 'b', text: 'B', checked: false },
      { id: 'c', text: 'C', checked: true },
    ];
    const t = tree(container, { nodes, checkable: true });

    const checked = t.getChecked();
    expect(checked.length).toBe(2);
    expect(checked.map(n => n.id)).toContain('a');
    expect(checked.map(n => n.id)).toContain('c');
  });

  it('getSelected() returns null when nothing selected', () => {
    const t = tree(container, { nodes: basicNodes });
    expect(t.getSelected()).toBeNull();
  });

  it('toggle via click on tree-toggle element', () => {
    tree(container, { nodes: basicNodes });

    const toggle = container.querySelector('[data-id="root"] .tx-tree-toggle') as HTMLElement;
    const rootNode = container.querySelector('[data-id="root"]') as HTMLElement;
    const children = rootNode.querySelector('.tx-tree-children') as HTMLElement;

    // Initially collapsed
    expect(children.style.display).toBe('none');

    // Click to expand
    toggle.click();
    expect(rootNode.classList.contains('tx-tree-expanded')).toBe(true);
    expect(children.style.display).toBe('');

    // Click to collapse
    toggle.click();
    expect(rootNode.classList.contains('tx-tree-expanded')).toBe(false);
    expect(children.style.display).toBe('none');
  });

  it('should render with lines class when lines option is true', () => {
    tree(container, { nodes: basicNodes, lines: true });

    const treeEl = container.querySelector('.tx-tree');
    expect(treeEl!.classList.contains('tx-tree-lines')).toBe(true);
  });

  it('should render expanded nodes as expanded', () => {
    const nodes = [
      { id: 'r', text: 'Root', expanded: true, children: [
        { id: 'c', text: 'Child' },
      ]},
    ];
    tree(container, { nodes });

    const rootNode = container.querySelector('[data-id="r"]') as HTMLElement;
    expect(rootNode.classList.contains('tx-tree-expanded')).toBe(true);
  });

  it('leaf nodes do not render toggle', () => {
    const nodes = [
      { id: 'leaf', text: 'Leaf', leaf: true },
    ];
    tree(container, { nodes });

    const toggle = container.querySelector('[data-id="leaf"] .tx-tree-toggle');
    expect(toggle).toBeNull();

    const indent = container.querySelector('[data-id="leaf"] .tx-tree-indent');
    expect(indent).not.toBeNull();
  });

  it('destroy() clears content', () => {
    const t = tree(container, { nodes: basicNodes });
    t.destroy();
    expect(container.innerHTML).toBe('');
  });
});
