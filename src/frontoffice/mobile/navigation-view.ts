// ============================================================
// Teryx — Mobile Navigation View (iOS-style push/pop)
// ============================================================
//
// Provides a stack-based navigation controller with animated
// transitions between views, an automatic back button, and a
// dynamic title bar. Touch-friendly with 44px minimum targets.
//
// Usage:
//   navigationView('#app', {
//     items: [{ id: 'home', title: 'Home', content: '<p>Welcome</p>' }],
//   });

import { uid, esc, cls, icon, resolveTarget, createElement } from '../../utils';
import { registerWidget, emit } from '../../core';
import type { WidgetInstance } from '../../types';

// ----------------------------------------------------------
//  Types
// ----------------------------------------------------------

export interface NavigationViewItem {
  /** Unique identifier for this view. */
  id: string;
  /** Title shown in the navigation bar. */
  title: string;
  /** Static HTML content for the view body. */
  content?: string;
  /** Remote source URL — fetched via xhtmlx when the view is pushed. */
  source?: string;
  /** Custom CSS class for the view panel. */
  class?: string;
  /** Called when the view is pushed onto the stack. */
  onActivate?: () => void;
  /** Called when the view is popped from the stack. */
  onDeactivate?: () => void;
}

export interface NavigationViewOptions {
  /** The initial (root) view(s).  The first item is displayed immediately. */
  items: NavigationViewItem[];
  /** Widget id. */
  id?: string;
  /** Extra CSS class on the container. */
  class?: string;
  /** Animation duration in milliseconds (default 300). */
  animationDuration?: number;
  /** Whether the hardware / gesture back should pop (default true). */
  swipeBack?: boolean;
  /** Called after any navigation transition completes. */
  onNavigate?: (viewId: string) => void;
}

export interface NavigationViewInstance extends WidgetInstance {
  /** Push a new view onto the stack with a slide-in animation. */
  push(view: NavigationViewItem): void;
  /** Pop the current view and slide back to the previous one. */
  pop(): void;
  /** Replace the entire stack with a single root view (no animation). */
  resetTo(view: NavigationViewItem): void;
  /** Return the id of the currently visible view. */
  activeViewId(): string;
  /** Return the full stack depth. */
  depth(): number;
}

// ----------------------------------------------------------
//  CSS (injected once)
// ----------------------------------------------------------
const STYLE_ID = 'tx-navigation-view-styles';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
/* Navigation View container */
.tx-nav-view {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--tx-nav-bg, #f8f9fa);
}

/* Title bar */
.tx-nav-view-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 0 8px;
  background: var(--tx-nav-bar-bg, #ffffff);
  border-bottom: 1px solid var(--tx-nav-bar-border, #e5e7eb);
  flex-shrink: 0;
  -webkit-user-select: none;
  user-select: none;
}

.tx-nav-view-bar-back {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  color: var(--tx-nav-bar-action, #007aff);
  font-size: 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}
.tx-nav-view-bar-back:active {
  opacity: 0.5;
}
.tx-nav-view-bar-back svg {
  width: 22px;
  height: 22px;
}

.tx-nav-view-bar-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: var(--tx-nav-bar-title, #111827);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 4px;
  line-height: 44px;
}

/* Spacer keeps the title centred when back button is visible */
.tx-nav-view-bar-spacer {
  min-width: 44px;
  flex-shrink: 0;
}

/* Viewport that holds stacked panels */
.tx-nav-view-viewport {
  position: relative;
  flex: 1;
  overflow: hidden;
}

/* Individual panel */
.tx-nav-view-panel {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--tx-nav-bg, #f8f9fa);
  will-change: transform, opacity;
  transition: none;
}
.tx-nav-view-panel.tx-nav-panel-active {
  z-index: 2;
}
.tx-nav-view-panel.tx-nav-panel-behind {
  z-index: 1;
}
.tx-nav-view-panel.tx-nav-panel-hidden {
  display: none;
}

/* Slide animations */
.tx-nav-view-panel.tx-nav-anim-push-enter {
  transition: transform var(--tx-nav-duration, 300ms) cubic-bezier(0.2, 0.9, 0.3, 1);
  transform: translateX(100%);
}
.tx-nav-view-panel.tx-nav-anim-push-enter.tx-nav-anim-active {
  transform: translateX(0);
}
.tx-nav-view-panel.tx-nav-anim-push-leave {
  transition: transform var(--tx-nav-duration, 300ms) cubic-bezier(0.2, 0.9, 0.3, 1),
              opacity var(--tx-nav-duration, 300ms) ease;
  transform: translateX(0);
}
.tx-nav-view-panel.tx-nav-anim-push-leave.tx-nav-anim-active {
  transform: translateX(-30%);
  opacity: 0.6;
}

.tx-nav-view-panel.tx-nav-anim-pop-enter {
  transition: transform var(--tx-nav-duration, 300ms) cubic-bezier(0.2, 0.9, 0.3, 1),
              opacity var(--tx-nav-duration, 300ms) ease;
  transform: translateX(-30%);
  opacity: 0.6;
}
.tx-nav-view-panel.tx-nav-anim-pop-enter.tx-nav-anim-active {
  transform: translateX(0);
  opacity: 1;
}
.tx-nav-view-panel.tx-nav-anim-pop-leave {
  transition: transform var(--tx-nav-duration, 300ms) cubic-bezier(0.2, 0.9, 0.3, 1);
  transform: translateX(0);
}
.tx-nav-view-panel.tx-nav-anim-pop-leave.tx-nav-anim-active {
  transform: translateX(100%);
}

/* Loading indicator inside a panel */
.tx-nav-view-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}
`;
  document.head.appendChild(style);
}

// ----------------------------------------------------------
//  Widget implementation
// ----------------------------------------------------------

export function navigationView(target: string | HTMLElement, options: NavigationViewOptions): NavigationViewInstance {
  injectStyles();

  const el = resolveTarget(target);
  const id = options.id || uid('tx-nav-view');
  const duration = options.animationDuration ?? 300;
  const swipeBack = options.swipeBack !== false;

  // State ----
  const stack: NavigationViewItem[] = [];
  const panelMap = new Map<string, HTMLElement>();
  let animating = false;

  // Build shell ----
  const container = createElement(
    `<div class="${cls('tx-nav-view', options.class)}" id="${esc(id)}"
          style="--tx-nav-duration:${duration}ms">
      <div class="tx-nav-view-bar">
        <button class="tx-nav-view-bar-back" style="visibility:hidden" aria-label="Back">
          ${icon('chevronLeft', 22)}
        </button>
        <div class="tx-nav-view-bar-title"></div>
        <div class="tx-nav-view-bar-spacer"></div>
      </div>
      <div class="tx-nav-view-viewport"></div>
    </div>`,
  );
  el.innerHTML = '';
  el.appendChild(container);

  const barTitle = container.querySelector('.tx-nav-view-bar-title') as HTMLElement;
  const backBtn = container.querySelector('.tx-nav-view-bar-back') as HTMLElement;
  const viewport = container.querySelector('.tx-nav-view-viewport') as HTMLElement;

  // Helpers ----
  function buildPanel(view: NavigationViewItem): HTMLElement {
    const panel = document.createElement('div');
    panel.className = cls('tx-nav-view-panel', 'tx-nav-panel-hidden', view.class) as string;
    panel.setAttribute('data-view-id', view.id);

    if (view.source) {
      panel.innerHTML =
        `<div xh-get="${esc(view.source)}" xh-trigger="none" xh-indicator="#${esc(id)}-panel-${esc(view.id)}-loading">` +
        `<div id="${esc(id)}-panel-${esc(view.id)}-loading" class="xh-indicator tx-nav-view-loading"><div class="tx-spinner"></div></div>` +
        `</div>`;
    } else if (view.content) {
      panel.innerHTML = view.content;
    }

    viewport.appendChild(panel);
    panelMap.set(view.id, panel);
    return panel;
  }

  function triggerXhtmlx(panel: HTMLElement): void {
    const xhEl = panel.querySelector('[xh-trigger="none"]') as HTMLElement | null;
    if (xhEl) {
      xhEl.setAttribute('xh-trigger', 'load');
      if (typeof (window as any).xhtmlx !== 'undefined') {
        (window as any).xhtmlx.process(xhEl);
      }
    }
  }

  function updateBar(): void {
    const current = stack[stack.length - 1];
    barTitle.textContent = current ? current.title : '';
    backBtn.style.visibility = stack.length > 1 ? 'visible' : 'hidden';
  }

  function showPanel(panel: HTMLElement): void {
    panel.classList.remove('tx-nav-panel-hidden', 'tx-nav-panel-behind');
    panel.classList.add('tx-nav-panel-active');
  }

  function hidePanel(panel: HTMLElement): void {
    panel.classList.remove('tx-nav-panel-active', 'tx-nav-panel-behind');
    panel.classList.add('tx-nav-panel-hidden');
    // Remove animation classes
    panel.classList.remove(
      'tx-nav-anim-push-enter',
      'tx-nav-anim-push-leave',
      'tx-nav-anim-pop-enter',
      'tx-nav-anim-pop-leave',
      'tx-nav-anim-active',
    );
  }

  // Transitions ----
  function animatePush(inPanel: HTMLElement, outPanel: HTMLElement | null, cb: () => void): void {
    animating = true;

    if (outPanel) {
      outPanel.classList.remove('tx-nav-panel-active');
      outPanel.classList.add('tx-nav-panel-behind', 'tx-nav-anim-push-leave');
    }

    inPanel.classList.remove('tx-nav-panel-hidden');
    inPanel.classList.add('tx-nav-panel-active', 'tx-nav-anim-push-enter');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inPanel.classList.add('tx-nav-anim-active');
        if (outPanel) outPanel.classList.add('tx-nav-anim-active');
      });
    });

    setTimeout(() => {
      if (outPanel) hidePanel(outPanel);
      inPanel.classList.remove('tx-nav-anim-push-enter', 'tx-nav-anim-active');
      animating = false;
      cb();
    }, duration + 20);
  }

  function animatePop(inPanel: HTMLElement, outPanel: HTMLElement, cb: () => void): void {
    animating = true;

    inPanel.classList.remove('tx-nav-panel-hidden');
    inPanel.classList.add('tx-nav-panel-behind', 'tx-nav-anim-pop-enter');

    outPanel.classList.add('tx-nav-anim-pop-leave');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inPanel.classList.add('tx-nav-anim-active');
        outPanel.classList.add('tx-nav-anim-active');
      });
    });

    setTimeout(() => {
      hidePanel(outPanel);
      inPanel.classList.remove('tx-nav-panel-behind', 'tx-nav-anim-pop-enter', 'tx-nav-anim-active');
      inPanel.classList.add('tx-nav-panel-active');
      animating = false;
      cb();
    }, duration + 20);
  }

  // Swipe-back gesture ----
  if (swipeBack) {
    let touchStartX = 0;
    let touchStartY = 0;
    let swiping = false;

    viewport.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        if (animating || stack.length <= 1) return;
        const touch = e.touches[0];
        // Only detect from left edge (first 24px)
        if (touch.clientX > 24) return;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        swiping = true;
      },
      { passive: true },
    );

    viewport.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (!swiping) return;
        const dx = e.touches[0].clientX - touchStartX;
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        // Cancel if vertical scroll dominates
        if (dy > Math.abs(dx)) {
          swiping = false;
          return;
        }
        if (dx > 60) {
          swiping = false;
          instance.pop();
        }
      },
      { passive: true },
    );

    viewport.addEventListener(
      'touchend',
      () => {
        swiping = false;
      },
      { passive: true },
    );
  }

  // Back button ----
  backBtn.addEventListener('click', () => {
    if (!animating && stack.length > 1) instance.pop();
  });

  // Public API ----
  const instance: NavigationViewInstance = {
    el: container,

    push(view: NavigationViewItem): void {
      if (animating) return;

      const outView = stack[stack.length - 1];
      const outPanel = outView ? (panelMap.get(outView.id) ?? null) : null;

      stack.push(view);
      const inPanel = buildPanel(view);
      triggerXhtmlx(inPanel);

      updateBar();

      animatePush(inPanel, outPanel, () => {
        view.onActivate?.();
        if (outView) outView.onDeactivate?.();
        options.onNavigate?.(view.id);
        emit('navigation-view:push', { id, viewId: view.id });
      });
    },

    pop(): void {
      if (animating || stack.length <= 1) return;

      const outView = stack.pop()!;
      const outPanel = panelMap.get(outView.id)!;
      const inView = stack[stack.length - 1];
      const inPanel = panelMap.get(inView.id)!;

      updateBar();

      animatePop(inPanel, outPanel, () => {
        // Clean up the removed panel
        outPanel.remove();
        panelMap.delete(outView.id);

        outView.onDeactivate?.();
        inView.onActivate?.();
        options.onNavigate?.(inView.id);
        emit('navigation-view:pop', { id, viewId: inView.id });
      });
    },

    resetTo(view: NavigationViewItem): void {
      // Tear down everything
      for (const [vid, panel] of panelMap) {
        panel.remove();
        const old = stack.find((v) => v.id === vid);
        if (old) old.onDeactivate?.();
      }
      panelMap.clear();
      stack.length = 0;

      stack.push(view);
      const panel = buildPanel(view);
      showPanel(panel);
      triggerXhtmlx(panel);
      updateBar();

      view.onActivate?.();
      options.onNavigate?.(view.id);
      emit('navigation-view:reset', { id, viewId: view.id });
    },

    activeViewId(): string {
      return stack.length > 0 ? stack[stack.length - 1].id : '';
    },

    depth(): number {
      return stack.length;
    },

    destroy(): void {
      el.innerHTML = '';
    },
  };

  // Set up the initial root view ----
  if (options.items.length > 0) {
    const root = options.items[0];
    stack.push(root);
    const panel = buildPanel(root);
    showPanel(panel);
    triggerXhtmlx(panel);
    updateBar();
    root.onActivate?.();
  }

  return instance;
}

// ----------------------------------------------------------
//  Declarative registration
// ----------------------------------------------------------
registerWidget('navigation-view', (el, opts) => navigationView(el, opts as unknown as NavigationViewOptions));

export default navigationView;
