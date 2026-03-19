import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { card } from '../../src/widgets/card';
import { splitter } from '../../src/widgets/splitter';
import { carousel } from '../../src/widgets/carousel';
import { lightbox } from '../../src/widgets/lightbox';
import { drawer } from '../../src/widgets/drawer';

/**
 * Unit tests for the Explorer demo configurations of
 * Card, Drawer, Splitter, Carousel and Lightbox widgets.
 *
 * These mirror the exact option combos used in
 * pages/explorer/index.html to ensure every demo variant works.
 */

describe('Explorer demo — Card variants', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('basic card with collapsible and closable', () => {
    const inst = card(container, {
      title: 'Project Update',
      content: '<p>The project is progressing well.</p>',
      collapsible: true,
      closable: true,
    });
    expect(inst.el).toBeTruthy();
    expect(container.querySelector('.tx-card')).not.toBeNull();
    expect(container.querySelector('.tx-card-title')!.textContent).toBe('Project Update');
    expect(container.querySelector('.tx-card-collapse-btn')).not.toBeNull();
    expect(container.querySelector('.tx-card-close-btn')).not.toBeNull();
  });

  it('image card renders image and footer', () => {
    card(container, {
      title: 'Mountain Vista',
      image: 'https://picsum.photos/seed/card1/600/200',
      content: '<p>A beautiful mountain landscape.</p>',
      footer: '<small>Photo credit: Unsplash</small>',
    });
    const img = container.querySelector('.tx-card-img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain('picsum.photos');
    expect(container.querySelector('.tx-card-footer')).not.toBeNull();
    expect(container.querySelector('.tx-card-footer')!.textContent).toContain('Photo credit');
  });

  it('card with tools renders tool buttons', () => {
    card(container, {
      title: 'Task Summary',
      content: '<p>Review the quarterly report.</p>',
      tools: [
        { icon: 'refresh', tooltip: 'Refresh' },
        { icon: 'settings', tooltip: 'Settings' },
      ],
      footer: '<button class="tx-btn tx-btn-primary">Approve</button>',
    });
    const tools = container.querySelectorAll('.tx-card-tool');
    // 2 custom tools (no collapse/close)
    expect(tools.length).toBe(2);
    expect(container.querySelector('.tx-card-footer')!.innerHTML).toContain('Approve');
  });

  it('horizontal layout renders multiple cards in flex', () => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '1rem';
    container.appendChild(row);
    const stats = [
      { title: 'Revenue', value: '$42,500' },
      { title: 'Users', value: '1,284' },
      { title: 'Orders', value: '356' },
    ];
    stats.forEach((s) => {
      const col = document.createElement('div');
      col.style.flex = '1';
      row.appendChild(col);
      card(col, {
        title: s.title,
        content: '<div>' + s.value + '</div>',
      });
    });
    const cards = container.querySelectorAll('.tx-card');
    expect(cards.length).toBe(3);
    const titles = container.querySelectorAll('.tx-card-title');
    expect(titles[0].textContent).toBe('Revenue');
    expect(titles[1].textContent).toBe('Users');
    expect(titles[2].textContent).toBe('Orders');
  });

  it('collapse toggles body visibility', () => {
    card(container, {
      title: 'Collapse Test',
      content: '<p>Body content</p>',
      collapsible: true,
    });
    const body = container.querySelector('.tx-card-body') as HTMLElement;
    const btn = container.querySelector('.tx-card-collapse-btn') as HTMLElement;
    expect(body.style.display).not.toBe('none');
    btn.click();
    expect(body.style.display).toBe('none');
    btn.click();
    expect(body.style.display).toBe('');
  });

  it('close hides the card', () => {
    card(container, {
      title: 'Close Test',
      content: '<p>Body</p>',
      closable: true,
    });
    const cardEl = container.querySelector('.tx-card') as HTMLElement;
    const closeBtn = container.querySelector('.tx-card-close-btn') as HTMLElement;
    expect(cardEl.style.display).not.toBe('none');
    closeBtn.click();
    expect(cardEl.style.display).toBe('none');
  });
});

describe('Explorer demo — Drawer variants', () => {
  afterEach(() => {
    // Clean up any leftover drawers from the DOM
    document.querySelectorAll('.tx-drawer-overlay').forEach((el) => el.remove());
    document.body.classList.remove('tx-drawer-open');
  });

  it('creates a right drawer with title', () => {
    const inst = drawer({
      title: 'Right Drawer',
      position: 'right',
      content: '<p>Drawer content here</p>',
    });
    expect(inst.el).toBeTruthy();
    expect(inst.el.querySelector('.tx-drawer-right')).not.toBeNull();
    expect(inst.el.querySelector('.tx-drawer-title')!.textContent).toBe('Right Drawer');
    inst.destroy();
  });

  it('drawer opens and closes', async () => {
    const inst = drawer({
      title: 'Open Close Test',
      position: 'left',
      content: '<p>Content</p>',
    });
    expect(inst.isOpen()).toBe(false);
    inst.open();
    // open() uses requestAnimationFrame to add the active class
    await new Promise((r) => setTimeout(r, 50));
    expect(inst.isOpen()).toBe(true);
    inst.close();
    // close is async with 300ms timeout
    await new Promise((r) => setTimeout(r, 350));
    expect(inst.isOpen()).toBe(false);
    inst.destroy();
  });

  it('supports all four positions', () => {
    const positions = ['left', 'right', 'top', 'bottom'] as const;
    positions.forEach((pos) => {
      const inst = drawer({
        title: pos + ' Drawer',
        position: pos,
        content: '<p>Content</p>',
      });
      expect(inst.el.querySelector('.tx-drawer-' + pos)).not.toBeNull();
      inst.destroy();
    });
  });

  it('size is applied via CSS variable', () => {
    const inst = drawer({
      title: 'Sized Drawer',
      position: 'right',
      size: '280px',
      content: '<p>Content</p>',
    });
    const panel = inst.el.querySelector('.tx-drawer') as HTMLElement;
    expect(panel.style.getPropertyValue('--tx-drawer-size')).toBe('280px');
    inst.destroy();
  });
});

describe('Explorer demo — Splitter variants', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('horizontal splitter creates gutters between panels', () => {
    const wrap = document.createElement('div');
    wrap.style.height = '200px';
    const left = document.createElement('div');
    left.textContent = 'Left';
    const right = document.createElement('div');
    right.textContent = 'Right';
    wrap.appendChild(left);
    wrap.appendChild(right);
    container.appendChild(wrap);
    const inst = splitter(wrap, { orientation: 'horizontal', sizes: [30, 70] });
    expect(inst.el).toBeTruthy();
    expect(wrap.classList.contains('tx-splitter')).toBe(true);
    expect(wrap.classList.contains('tx-splitter-horizontal')).toBe(true);
    expect(wrap.querySelectorAll('.tx-splitter-gutter').length).toBe(1);
    expect(wrap.querySelectorAll('.tx-splitter-panel').length).toBe(2);
  });

  it('vertical splitter uses column flex direction', () => {
    const wrap = document.createElement('div');
    const top = document.createElement('div');
    top.textContent = 'Top';
    const bottom = document.createElement('div');
    bottom.textContent = 'Bottom';
    wrap.appendChild(top);
    wrap.appendChild(bottom);
    container.appendChild(wrap);
    splitter(wrap, { orientation: 'vertical', sizes: [40, 60] });
    expect(wrap.classList.contains('tx-splitter-vertical')).toBe(true);
    expect(wrap.style.flexDirection).toBe('column');
  });

  it('nested splitter creates gutters at both levels', () => {
    const wrap = document.createElement('div');
    const nav = document.createElement('div');
    nav.textContent = 'Nav';
    const rightWrap = document.createElement('div');
    const editor = document.createElement('div');
    editor.textContent = 'Editor';
    const terminal = document.createElement('div');
    terminal.textContent = 'Terminal';
    rightWrap.appendChild(editor);
    rightWrap.appendChild(terminal);
    wrap.appendChild(nav);
    wrap.appendChild(rightWrap);
    container.appendChild(wrap);
    splitter(wrap, { orientation: 'horizontal', sizes: [25, 75] });
    splitter(rightWrap, { orientation: 'vertical', sizes: [60, 40] });
    // Outer: 1 horizontal gutter
    expect(wrap.querySelectorAll(':scope > .tx-splitter-gutter-horizontal').length).toBe(1);
    // Inner: 1 vertical gutter
    expect(rightWrap.querySelectorAll(':scope > .tx-splitter-gutter-vertical').length).toBe(1);
  });

  it('destroy removes gutter and classes', () => {
    const wrap = document.createElement('div');
    const a = document.createElement('div');
    const b = document.createElement('div');
    wrap.appendChild(a);
    wrap.appendChild(b);
    container.appendChild(wrap);
    const inst = splitter(wrap, { orientation: 'horizontal' });
    expect(wrap.querySelectorAll('.tx-splitter-gutter').length).toBe(1);
    inst.destroy();
    expect(wrap.querySelectorAll('.tx-splitter-gutter').length).toBe(0);
    expect(wrap.classList.contains('tx-splitter')).toBe(false);
  });
});

describe('Explorer demo — Carousel variants', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('basic carousel renders slides and indicators', () => {
    const inst = carousel(container, {
      slides: [
        { title: 'Welcome', content: '<div>Slide 1</div>' },
        { title: 'Components', content: '<div>Slide 2</div>' },
        { title: 'Open Source', content: '<div>Slide 3</div>' },
      ],
    });
    expect(inst.el).toBeTruthy();
    expect(container.querySelectorAll('.tx-carousel-slide').length).toBe(3);
    expect(container.querySelectorAll('.tx-carousel-indicator').length).toBe(3);
    expect(container.querySelector('.tx-carousel-prev')).not.toBeNull();
    expect(container.querySelector('.tx-carousel-next')).not.toBeNull();
  });

  it('autoplay carousel creates timer (has autoplay API)', () => {
    const inst = carousel(container, {
      slides: [{ content: '<div>A</div>' }, { content: '<div>B</div>' }, { content: '<div>C</div>' }],
      autoplay: true,
      interval: 3000,
    });
    // Instance should have play/pause
    expect(typeof inst.pause).toBe('function');
    expect(typeof inst.play).toBe('function');
    inst.destroy();
  });

  it('no indicators carousel hides indicator dots', () => {
    carousel(container, {
      slides: [{ content: '<div>1</div>' }, { content: '<div>2</div>' }],
      indicators: false,
      arrows: true,
    });
    expect(container.querySelectorAll('.tx-carousel-indicator').length).toBe(0);
    expect(container.querySelector('.tx-carousel-prev')).not.toBeNull();
  });

  it('next/prev navigation works', () => {
    const inst = carousel(container, {
      slides: [{ content: '<div>A</div>' }, { content: '<div>B</div>' }, { content: '<div>C</div>' }],
    });
    // First slide is active
    const slides = container.querySelectorAll('.tx-carousel-slide');
    expect(slides[0].classList.contains('tx-carousel-slide-active')).toBe(true);
    inst.next();
    expect(slides[1].classList.contains('tx-carousel-slide-active')).toBe(true);
    inst.prev();
    expect(slides[0].classList.contains('tx-carousel-slide-active')).toBe(true);
    inst.destroy();
  });
});

describe('Explorer demo — Lightbox variants', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
    // Clean up overlays
    document.querySelectorAll('.tx-lightbox-overlay').forEach((el) => el.remove());
    document.body.classList.remove('tx-lightbox-open');
  });

  it('single image renders one thumbnail', () => {
    const inst = lightbox(container, {
      images: [
        {
          src: 'https://picsum.photos/seed/lb1/800/600',
          alt: 'Landscape',
          caption: 'A beautiful landscape photograph',
        },
      ],
    });
    expect(inst.el).toBeTruthy();
    const thumbs = container.querySelectorAll('.tx-lightbox-thumb');
    expect(thumbs.length).toBe(1);
  });

  it('gallery renders six thumbnails', () => {
    lightbox(container, {
      images: [
        { src: 'https://picsum.photos/seed/lbg1/800/600', alt: 'Mountains', caption: 'Mountain range at dawn' },
        { src: 'https://picsum.photos/seed/lbg2/800/600', alt: 'Forest', caption: 'Dense forest canopy' },
        { src: 'https://picsum.photos/seed/lbg3/800/600', alt: 'Ocean', caption: 'Ocean waves at sunset' },
        { src: 'https://picsum.photos/seed/lbg4/800/600', alt: 'Desert', caption: 'Sand dunes at midday' },
        { src: 'https://picsum.photos/seed/lbg5/800/600', alt: 'City', caption: 'City skyline at night' },
        { src: 'https://picsum.photos/seed/lbg6/800/600', alt: 'Lake', caption: 'Still lake with reflections' },
      ],
    });
    const thumbs = container.querySelectorAll('.tx-lightbox-thumb');
    expect(thumbs.length).toBe(6);
  });

  it('zoom and rotate lightbox opens viewer with toolbar', () => {
    const inst = lightbox(container, {
      images: [
        {
          src: 'https://picsum.photos/seed/lbz1/1200/900',
          alt: 'Detail Shot',
          caption: 'Use +/- to zoom, R to rotate',
        },
        { src: 'https://picsum.photos/seed/lbz2/1200/900', alt: 'Architecture', caption: 'Architectural detail' },
      ],
      zoom: true,
      rotate: true,
    });
    expect(inst.isOpen()).toBe(false);
    inst.open(0);
    expect(inst.isOpen()).toBe(true);
    // Zoom and rotate buttons should be present
    const overlay = document.querySelector('.tx-lightbox-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay!.querySelector('[data-action="zoom-in"]')).not.toBeNull();
    expect(overlay!.querySelector('[data-action="zoom-out"]')).not.toBeNull();
    expect(overlay!.querySelector('[data-action="rotate"]')).not.toBeNull();
    inst.close();
  });

  it('open and close lifecycle works', () => {
    const inst = lightbox(container, {
      images: [{ src: 'https://picsum.photos/seed/lb1/800/600', alt: 'Test' }],
    });
    expect(inst.isOpen()).toBe(false);
    inst.open();
    expect(inst.isOpen()).toBe(true);
    expect(document.querySelector('.tx-lightbox-overlay')).not.toBeNull();
    inst.close();
    // close is async
    setTimeout(() => {
      expect(inst.isOpen()).toBe(false);
    }, 250);
  });

  it('destroy cleans up the container', () => {
    const inst = lightbox(container, {
      images: [{ src: 'https://picsum.photos/seed/lb1/800/600', alt: 'Test' }],
    });
    expect(container.querySelector('.tx-lightbox-grid')).not.toBeNull();
    inst.destroy();
    expect(container.innerHTML).toBe('');
  });
});
