// ============================================================
// Teryx — Tree Widget
// ============================================================

import type { TreeOptions, TreeNode, TreeInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

export function tree(target: string | HTMLElement, options: TreeOptions): TreeInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-tree');

  let html = `<div class="${cls('tx-tree', options.lines && 'tx-tree-lines', options.class)}" id="${esc(id)}" role="tree">`;

  if (options.source) {
    html += `<div xh-get="${esc(options.source)}" xh-trigger="load" xh-indicator="#${esc(id)}-loading">`;
    html += `<template>`;
    html += renderDynamicTree(options);
    html += `</template>`;
    html += `<div id="${esc(id)}-loading" class="xh-indicator tx-loading-pad"><div class="tx-spinner"></div></div>`;
    html += `</div>`;
  } else if (options.nodes) {
    html += renderNodes(options.nodes, options, 0);
  }

  html += '</div>';
  el.innerHTML = html;

  const container = el.querySelector(`#${id}`) as HTMLElement;
  let selectedNode: string | null = null;

  // Event delegation
  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Toggle expand
    const toggle = target.closest('.tx-tree-toggle');
    if (toggle) {
      const node = toggle.closest('.tx-tree-node') as HTMLElement;
      if (node) {
        const nodeId = node.getAttribute('data-id')!;
        const children = node.querySelector('.tx-tree-children') as HTMLElement;
        if (children) {
          const isExpanded = node.classList.contains('tx-tree-expanded');
          if (isExpanded) {
            node.classList.remove('tx-tree-expanded');
            children.style.display = 'none';
          } else {
            node.classList.add('tx-tree-expanded');
            children.style.display = '';

            // Lazy load
            if (options.lazyLoad) {
              const xhEl = children.querySelector('[xh-trigger="none"]');
              if (xhEl) {
                xhEl.setAttribute('xh-trigger', 'load');
                if (typeof (window as any).xhtmlx !== 'undefined') {
                  (window as any).xhtmlx.process(xhEl as HTMLElement);
                }
              }
            }
          }
          emit('tree:toggle', { id, nodeId, expanded: !isExpanded });
        }
      }
      return;
    }

    // Select node
    const content = target.closest('.tx-tree-content') as HTMLElement;
    if (content && options.selectable !== false) {
      const node = content.closest('.tx-tree-node') as HTMLElement;
      if (node) {
        const nodeId = node.getAttribute('data-id')!;
        container.querySelectorAll('.tx-tree-selected').forEach((n) => n.classList.remove('tx-tree-selected'));
        content.classList.add('tx-tree-selected');
        selectedNode = nodeId;

        const nodeData = findNode(options.nodes || [], nodeId);
        if (nodeData) options.onSelect?.(nodeData);
        emit('tree:select', { id, nodeId });
      }
    }

    // Checkbox
    const checkbox = target.closest('.tx-tree-checkbox') as HTMLInputElement;
    if (checkbox && options.checkable) {
      const node = checkbox.closest('.tx-tree-node') as HTMLElement;
      if (node) {
        const nodeId = node.getAttribute('data-id')!;
        const checked = (checkbox as HTMLInputElement).checked;
        const nodeData = findNode(options.nodes || [], nodeId);
        if (nodeData) options.onCheck?.(nodeData, checked);
        emit('tree:check', { id, nodeId, checked });
      }
    }
  });

  // Keyboard navigation: Arrow Up/Down between nodes, Left/Right to collapse/expand, Enter to select
  container.addEventListener('keydown', (e) => {
    const tgt = e.target as HTMLElement;
    const contentEl = tgt.closest('.tx-tree-content') as HTMLElement;
    if (!contentEl) return;

    const allContents = Array.from(container.querySelectorAll('.tx-tree-content')) as HTMLElement[];
    // Filter to only visible nodes
    const visibleContents = allContents.filter((c) => {
      let parent = c.parentElement;
      while (parent && parent !== container) {
        if (parent.classList.contains('tx-tree-children') && parent.style.display === 'none') return false;
        parent = parent.parentElement;
      }
      return true;
    });

    const currentIdx = visibleContents.indexOf(contentEl);
    const node = contentEl.closest('.tx-tree-node') as HTMLElement;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIdx = currentIdx + 1;
        if (nextIdx < visibleContents.length) visibleContents[nextIdx].focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIdx = currentIdx - 1;
        if (prevIdx >= 0) visibleContents[prevIdx].focus();
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        if (node) {
          const children = node.querySelector(':scope > .tx-tree-children') as HTMLElement;
          if (children && !node.classList.contains('tx-tree-expanded')) {
            const nodeId = node.getAttribute('data-id')!;
            setExpanded(nodeId, true);
            emit('tree:toggle', { id, nodeId, expanded: true });
          }
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        if (node) {
          if (node.classList.contains('tx-tree-expanded')) {
            const nodeId = node.getAttribute('data-id')!;
            setExpanded(nodeId, false);
            emit('tree:toggle', { id, nodeId, expanded: false });
          }
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (node && options.selectable !== false) {
          const nodeId = node.getAttribute('data-id')!;
          container.querySelectorAll('.tx-tree-selected').forEach((n) => n.classList.remove('tx-tree-selected'));
          contentEl.classList.add('tx-tree-selected');
          selectedNode = nodeId;
          const nodeData = findNode(options.nodes || [], nodeId);
          if (nodeData) options.onSelect?.(nodeData);
          emit('tree:select', { id, nodeId });
        }
        break;
      }
    }
  });

  function setExpanded(nodeId: string, expanded: boolean): void {
    const node = container.querySelector(`[data-id="${nodeId}"]`) as HTMLElement;
    if (!node) return;
    const children = node.querySelector('.tx-tree-children') as HTMLElement;
    if (!children) return;

    if (expanded) {
      node.classList.add('tx-tree-expanded');
      children.style.display = '';
    } else {
      node.classList.remove('tx-tree-expanded');
      children.style.display = 'none';
    }
  }

  const instance: TreeInstance = {
    el: container,
    destroy() {
      el.innerHTML = '';
    },
    expand(nodeId) {
      setExpanded(nodeId, true);
    },
    collapse(nodeId) {
      setExpanded(nodeId, false);
    },
    expandAll() {
      container.querySelectorAll('.tx-tree-node').forEach((n) => {
        n.classList.add('tx-tree-expanded');
        const ch = n.querySelector(':scope > .tx-tree-children') as HTMLElement;
        if (ch) ch.style.display = '';
      });
    },
    collapseAll() {
      container.querySelectorAll('.tx-tree-node').forEach((n) => {
        n.classList.remove('tx-tree-expanded');
        const ch = n.querySelector(':scope > .tx-tree-children') as HTMLElement;
        if (ch) ch.style.display = 'none';
      });
    },
    getChecked(): TreeNode[] {
      const ids = Array.from(container.querySelectorAll('.tx-tree-checkbox:checked'))
        .map((cb) => (cb.closest('.tx-tree-node') as HTMLElement)?.getAttribute('data-id'))
        .filter(Boolean) as string[];
      return ids.map((nid) => findNode(options.nodes || [], nid)).filter(Boolean) as TreeNode[];
    },
    getSelected(): TreeNode | null {
      if (!selectedNode) return null;
      return findNode(options.nodes || [], selectedNode);
    },
  };

  if (options.expandAll) {
    requestAnimationFrame(() => instance.expandAll());
  }

  return instance;
}

function renderNodes(nodes: TreeNode[], options: TreeOptions, depth: number): string {
  let html = '';
  for (const node of nodes) {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded ?? false;
    const isLeaf = node.leaf ?? !hasChildren;

    html += `<div class="${cls('tx-tree-node', isExpanded && 'tx-tree-expanded', node.cls)}" data-id="${esc(node.id)}" role="treeitem" style="--depth:${depth}">`;
    html += '<div class="tx-tree-content" tabindex="0">';

    // Indent + toggle
    if (!isLeaf) {
      html += `<span class="tx-tree-toggle">${icon('chevronRight')}</span>`;
    } else {
      html += '<span class="tx-tree-indent"></span>';
    }

    // Checkbox
    if (options.checkable) {
      html += `<input type="checkbox" class="tx-tree-checkbox tx-checkbox"${node.checked ? ' checked' : ''}>`;
    }

    // Icon
    if (node.icon) {
      html += `<span class="tx-tree-icon">${icon(node.icon)}</span>`;
    } else if (!isLeaf) {
      html += `<span class="tx-tree-icon">${icon('folder')}</span>`;
    } else {
      html += `<span class="tx-tree-icon">${icon('file')}</span>`;
    }

    // Label
    if (node.href) {
      html += `<a class="tx-tree-label" href="${esc(node.href)}">${esc(node.text)}</a>`;
    } else {
      html += `<span class="tx-tree-label">${esc(node.text)}</span>`;
    }

    html += '</div>';

    // Children
    if (hasChildren) {
      html += `<div class="tx-tree-children"${!isExpanded ? ' style="display:none"' : ''}>`;
      html += renderNodes(node.children!, options, depth + 1);
      html += '</div>';
    }

    html += '</div>';
  }
  return html;
}

function renderDynamicTree(options: TreeOptions): string {
  let html = '<div class="tx-tree-dynamic">';
  html += `<div xh-each="nodes" class="tx-tree-node" xh-attr-data-id="id">`;
  html += '<div class="tx-tree-content">';
  if (options.checkable) html += '<input type="checkbox" class="tx-tree-checkbox tx-checkbox">';
  html += `<span class="tx-tree-icon">${icon('file')}</span>`;
  html += '<span class="tx-tree-label" xh-text="text"></span>';
  html += '</div></div>';
  html += '</div>';
  return html;
}

function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

registerWidget('tree', (el, opts) => tree(el, opts as unknown as TreeOptions));
export default tree;
