import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { lightbox } from '../../src/widgets/lightbox';

const IMAGES = [
  { src: '/img/a.jpg', alt: 'Image A', caption: 'First image' },
  { src: '/img/b.jpg', alt: 'Image B', caption: 'Second image' },
  { src: '/img/c.jpg', alt: 'Image C' },
];

describe('Lightbox widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up any overlays
    document.querySelectorAll('.tx-lightbox-overlay').forEach((el) => el.remove());
    document.body.classList.remove('tx-lightbox-open');
    container.remove();
  });

  it('should render thumbnail grid', () => {
    lightbox(container, { images: IMAGES });
    const thumbs = container.querySelectorAll('.tx-lightbox-thumb');
    expect(thumbs.length).toBe(3);
  });

  it('should render thumbnail images with correct src', () => {
    lightbox(container, { images: IMAGES });
    const imgs = container.querySelectorAll('.tx-lightbox-thumb img');
    expect((imgs[0] as HTMLImageElement).src).toContain('/img/a.jpg');
    expect((imgs[1] as HTMLImageElement).src).toContain('/img/b.jpg');
  });

  it('open() creates overlay', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(0);
    const overlay = document.querySelector('.tx-lightbox-overlay');
    expect(overlay).not.toBeNull();
  });

  it('close() removes overlay', async () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(0);
    expect(lb.isOpen()).toBe(true);
    lb.close();
    // Overlay is removed after 200ms transition
    await new Promise((r) => setTimeout(r, 250));
    expect(lb.isOpen()).toBe(false);
  });

  it('isOpen() returns correct state', () => {
    const lb = lightbox(container, { images: IMAGES });
    expect(lb.isOpen()).toBe(false);
    lb.open(0);
    expect(lb.isOpen()).toBe(true);
  });

  it('should display the correct image', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(1);
    const img = document.querySelector('.tx-lightbox-img') as HTMLImageElement;
    expect(img.src).toContain('/img/b.jpg');
  });

  it('should display image counter', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(0);
    const counter = document.querySelector('.tx-lightbox-counter');
    expect(counter!.textContent).toBe('1 / 3');
  });

  it('should display caption', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(0);
    const caption = document.querySelector('.tx-lightbox-caption');
    expect(caption!.textContent).toBe('First image');
  });

  it('next() navigates to next image', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(0);
    lb.next();
    const img = document.querySelector('.tx-lightbox-img') as HTMLImageElement;
    expect(img.src).toContain('/img/b.jpg');
    const counter = document.querySelector('.tx-lightbox-counter');
    expect(counter!.textContent).toBe('2 / 3');
  });

  it('prev() navigates to previous image', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(1);
    lb.prev();
    const img = document.querySelector('.tx-lightbox-img') as HTMLImageElement;
    expect(img.src).toContain('/img/a.jpg');
  });

  it('goTo() navigates to specific image', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(0);
    lb.goTo(2);
    const img = document.querySelector('.tx-lightbox-img') as HTMLImageElement;
    expect(img.src).toContain('/img/c.jpg');
    const counter = document.querySelector('.tx-lightbox-counter');
    expect(counter!.textContent).toBe('3 / 3');
  });

  it('navigation wraps around', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(2);
    lb.next();
    const img = document.querySelector('.tx-lightbox-img') as HTMLImageElement;
    expect(img.src).toContain('/img/a.jpg');
  });

  it('should render zoom controls when zoom is enabled', () => {
    const lb = lightbox(container, { images: IMAGES, zoom: true });
    lb.open(0);
    expect(document.querySelector('[data-action="zoom-in"]')).not.toBeNull();
    expect(document.querySelector('[data-action="zoom-out"]')).not.toBeNull();
  });

  it('should render rotate button when rotate is enabled', () => {
    const lb = lightbox(container, { images: IMAGES, rotate: true });
    lb.open(0);
    expect(document.querySelector('[data-action="rotate"]')).not.toBeNull();
  });

  it('should not render rotate button by default', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(0);
    expect(document.querySelector('[data-action="rotate"]')).toBeNull();
  });

  it('should render navigation arrows for multiple images', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(0);
    expect(document.querySelector('.tx-lightbox-prev')).not.toBeNull();
    expect(document.querySelector('.tx-lightbox-next')).not.toBeNull();
  });

  it('should render download button', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(0);
    expect(document.querySelector('[data-action="download"]')).not.toBeNull();
  });

  it('should render close button', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.open(0);
    expect(document.querySelector('[data-action="close"]')).not.toBeNull();
  });

  it('clicking thumbnail opens viewer at that index', () => {
    lightbox(container, { images: IMAGES });
    const thumb = container.querySelector('[data-index="1"]') as HTMLElement;
    thumb.click();
    const img = document.querySelector('.tx-lightbox-img') as HTMLImageElement;
    expect(img.src).toContain('/img/b.jpg');
  });

  it('startIndex opens at the specified image', () => {
    const lb = lightbox(container, { images: IMAGES, startIndex: 2 });
    lb.open();
    const img = document.querySelector('.tx-lightbox-img') as HTMLImageElement;
    expect(img.src).toContain('/img/c.jpg');
  });

  it('destroy() clears content', () => {
    const lb = lightbox(container, { images: IMAGES });
    lb.destroy();
    expect(container.innerHTML).toBe('');
  });
});
