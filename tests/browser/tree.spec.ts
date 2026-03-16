import { test, expect } from '@playwright/test';
import { setupPage, createWidget, count, texts, assertExists, assertNotExists } from './helpers';

test.describe('Tree Widget', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  const treeNodes = `[
    {
      id: 'root1', text: 'Documents',
      children: [
        { id: 'doc1', text: 'Resume.pdf' },
        { id: 'doc2', text: 'Cover.pdf' },
      ]
    },
    {
      id: 'root2', text: 'Photos',
      children: [
        { id: 'photo1', text: 'Vacation.jpg' },
      ]
    },
    { id: 'root3', text: 'README.md' }
  ]`;

  test('renders nodes with hierarchy', async ({ page }) => {
    await createWidget(page, `
      Teryx.tree('#target', {
        nodes: ${treeNodes}
      });
    `);

    await expect(page.locator('.tx-tree')).toBeVisible();
    // 3 top-level nodes + 3 children = 6 total nodes
    expect(await count(page, '.tx-tree-node')).toBe(6);

    // Top-level labels
    const rootLabels = await page.locator('.tx-tree > .tx-tree-node > .tx-tree-content .tx-tree-label').allTextContents();
    expect(rootLabels).toEqual(['Documents', 'Photos', 'README.md']);
  });

  test('expand and collapse toggle click', async ({ page }) => {
    await createWidget(page, `
      Teryx.tree('#target', {
        nodes: ${treeNodes}
      });
    `);

    const root1 = page.locator('[data-id="root1"]');
    const children = root1.locator('.tx-tree-children');

    // Initially collapsed
    await expect(root1).not.toHaveClass(/tx-tree-expanded/);
    await expect(children).toBeHidden();

    // Click toggle to expand
    await root1.locator('.tx-tree-toggle').click();
    await page.waitForTimeout(100);

    await expect(root1).toHaveClass(/tx-tree-expanded/);
    await expect(children).toBeVisible();

    // Click toggle to collapse
    await root1.locator('.tx-tree-toggle').click();
    await page.waitForTimeout(100);

    await expect(root1).not.toHaveClass(/tx-tree-expanded/);
    await expect(children).toBeHidden();
  });

  test('expandAll and collapseAll methods', async ({ page }) => {
    await createWidget(page, `
      window.__tree = Teryx.tree('#target', {
        nodes: ${treeNodes}
      });
    `);

    // Expand all
    await page.evaluate(() => (window as any).__tree.expandAll());
    await page.waitForTimeout(100);

    // expandAll adds tx-tree-expanded to ALL nodes (including leaves);
    // verify that the nodes with children are expanded and visible
    const expandedWithChildren = await count(page, '.tx-tree-expanded > .tx-tree-children');
    expect(expandedWithChildren).toBe(2); // root1 and root2 have children

    // All children divs should be visible
    const childrenDivs = page.locator('.tx-tree-children');
    for (let i = 0; i < await childrenDivs.count(); i++) {
      await expect(childrenDivs.nth(i)).toBeVisible();
    }

    // Collapse all
    await page.evaluate(() => (window as any).__tree.collapseAll());
    await page.waitForTimeout(100);

    expect(await count(page, '.tx-tree-expanded')).toBe(0);
    for (let i = 0; i < await childrenDivs.count(); i++) {
      await expect(childrenDivs.nth(i)).toBeHidden();
    }
  });

  test('nested children render correctly', async ({ page }) => {
    await createWidget(page, `
      Teryx.tree('#target', {
        expandAll: true,
        nodes: [
          {
            id: 'a', text: 'Level 0',
            children: [
              {
                id: 'b', text: 'Level 1',
                children: [
                  { id: 'c', text: 'Level 2' }
                ]
              }
            ]
          }
        ]
      });
    `);

    await page.waitForTimeout(200);

    // All three nodes should exist
    await expect(page.locator('[data-id="a"]')).toBeVisible();
    await expect(page.locator('[data-id="b"]')).toBeVisible();
    await expect(page.locator('[data-id="c"]')).toBeVisible();

    // Depth styles
    await expect(page.locator('[data-id="a"]')).toHaveAttribute('style', /--depth:\s*0/);
    await expect(page.locator('[data-id="b"]')).toHaveAttribute('style', /--depth:\s*1/);
    await expect(page.locator('[data-id="c"]')).toHaveAttribute('style', /--depth:\s*2/);
  });

  test('selection highlight on click', async ({ page }) => {
    await createWidget(page, `
      window.__tree = Teryx.tree('#target', {
        selectable: true,
        expandAll: true,
        nodes: ${treeNodes}
      });
    `);

    await page.waitForTimeout(200);

    // Click on a node content to select it
    await page.locator('[data-id="doc1"] .tx-tree-content').click();
    await page.waitForTimeout(100);

    await expect(page.locator('[data-id="doc1"] .tx-tree-content')).toHaveClass(/tx-tree-selected/);

    // Select another node - previous selection should be removed
    await page.locator('[data-id="doc2"] .tx-tree-content').click();
    await page.waitForTimeout(100);

    await expect(page.locator('[data-id="doc2"] .tx-tree-content')).toHaveClass(/tx-tree-selected/);
    await expect(page.locator('[data-id="doc1"] .tx-tree-content')).not.toHaveClass(/tx-tree-selected/);
  });

  test('checkbox mode renders checkboxes', async ({ page }) => {
    await createWidget(page, `
      Teryx.tree('#target', {
        checkable: true,
        expandAll: true,
        nodes: [
          { id: 'a', text: 'Node A' },
          { id: 'b', text: 'Node B' },
          { id: 'c', text: 'Node C', checked: true },
        ]
      });
    `);

    await page.waitForTimeout(200);

    expect(await count(page, '.tx-tree-checkbox')).toBe(3);

    // Pre-checked node
    await expect(page.locator('[data-id="c"] .tx-tree-checkbox')).toBeChecked();
    await expect(page.locator('[data-id="a"] .tx-tree-checkbox')).not.toBeChecked();
  });

  test('leaf nodes show file icon, folder nodes show folder icon', async ({ page }) => {
    await createWidget(page, `
      Teryx.tree('#target', {
        expandAll: true,
        nodes: [
          {
            id: 'folder', text: 'Folder',
            children: [
              { id: 'file', text: 'File.txt' }
            ]
          }
        ]
      });
    `);

    await page.waitForTimeout(200);

    // Folder node should have folder icon
    const folderIcon = page.locator('[data-id="folder"] > .tx-tree-content .tx-tree-icon').first();
    await expect(folderIcon).toBeVisible();

    // Leaf node should have file icon
    const fileIcon = page.locator('[data-id="file"] .tx-tree-icon');
    await expect(fileIcon).toBeVisible();

    // Folder node should have a toggle, leaf should not
    expect(await page.locator('[data-id="folder"] > .tx-tree-content .tx-tree-toggle').count()).toBe(1);
    expect(await page.locator('[data-id="file"] .tx-tree-toggle').count()).toBe(0);
    expect(await page.locator('[data-id="file"] .tx-tree-indent').count()).toBe(1);
  });

  test('lines class is applied when lines option is true', async ({ page }) => {
    await createWidget(page, `
      Teryx.tree('#target', {
        lines: true,
        nodes: [{ id: 'a', text: 'Node A' }]
      });
    `);

    await expect(page.locator('.tx-tree')).toHaveClass(/tx-tree-lines/);
  });

  test('getSelected returns the selected node', async ({ page }) => {
    await createWidget(page, `
      window.__tree = Teryx.tree('#target', {
        selectable: true,
        expandAll: true,
        nodes: ${treeNodes}
      });
    `);

    await page.waitForTimeout(200);

    // Initially no selection
    const initialSelected = await page.evaluate(() => (window as any).__tree.getSelected());
    expect(initialSelected).toBeNull();

    // Select a node
    await page.locator('[data-id="doc1"] .tx-tree-content').click();
    await page.waitForTimeout(100);

    const selected = await page.evaluate(() => {
      const s = (window as any).__tree.getSelected();
      return s ? { id: s.id, text: s.text } : null;
    });
    expect(selected).toEqual({ id: 'doc1', text: 'Resume.pdf' });
  });

  test('expanded attribute renders node expanded initially', async ({ page }) => {
    await createWidget(page, `
      Teryx.tree('#target', {
        nodes: [
          {
            id: 'root1', text: 'Documents', expanded: true,
            children: [
              { id: 'doc1', text: 'Resume.pdf' },
            ]
          },
          {
            id: 'root2', text: 'Photos',
            children: [
              { id: 'photo1', text: 'Beach.jpg' },
            ]
          }
        ]
      });
    `);

    // root1 should be expanded
    await expect(page.locator('[data-id="root1"]')).toHaveClass(/tx-tree-expanded/);
    await expect(page.locator('[data-id="root1"] .tx-tree-children')).toBeVisible();

    // root2 should be collapsed
    await expect(page.locator('[data-id="root2"]')).not.toHaveClass(/tx-tree-expanded/);
    await expect(page.locator('[data-id="root2"] .tx-tree-children')).toBeHidden();
  });

  test('getChecked returns checked nodes', async ({ page }) => {
    await createWidget(page, `
      window.__tree = Teryx.tree('#target', {
        checkable: true,
        nodes: [
          { id: 'a', text: 'A', checked: true },
          { id: 'b', text: 'B' },
          { id: 'c', text: 'C', checked: true },
        ]
      });
    `);

    const checked = await page.evaluate(() => {
      return (window as any).__tree.getChecked().map((n: any) => n.id);
    });
    expect(checked).toEqual(['a', 'c']);
  });

  test('destroy removes all tree DOM content', async ({ page }) => {
    await createWidget(page, `
      window.__tree = Teryx.tree('#target', {
        nodes: [{ id: 'a', text: 'Node' }]
      });
    `);

    await assertExists(page, '.tx-tree');

    await page.evaluate(() => (window as any).__tree.destroy());
    await page.waitForTimeout(100);

    await assertNotExists(page, '.tx-tree');
  });

  test('programmatic expand and collapse methods', async ({ page }) => {
    await createWidget(page, `
      window.__tree = Teryx.tree('#target', {
        nodes: [
          {
            id: 'root1', text: 'Documents',
            children: [
              { id: 'doc1', text: 'File.txt' },
            ]
          }
        ]
      });
    `);

    // Initially collapsed
    await expect(page.locator('[data-id="root1"]')).not.toHaveClass(/tx-tree-expanded/);

    // Programmatic expand
    await page.evaluate(() => (window as any).__tree.expand('root1'));
    await page.waitForTimeout(100);
    await expect(page.locator('[data-id="root1"]')).toHaveClass(/tx-tree-expanded/);
    await expect(page.locator('[data-id="root1"] .tx-tree-children')).toBeVisible();

    // Programmatic collapse
    await page.evaluate(() => (window as any).__tree.collapse('root1'));
    await page.waitForTimeout(100);
    await expect(page.locator('[data-id="root1"]')).not.toHaveClass(/tx-tree-expanded/);
    await expect(page.locator('[data-id="root1"] .tx-tree-children')).toBeHidden();
  });
});
