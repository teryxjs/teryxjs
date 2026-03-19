import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { calendar } from '../../src/widgets/calendar';
import { timeline } from '../../src/widgets/timeline';

describe('Calendar demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function sampleEvents() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const pad = (n: number) => String(n).padStart(2, '0');
    const dt = (day: number) => `${y}-${m}-${pad(day)}`;
    const dtT = (day: number, h: number, min: number) => `${dt(day)}T${pad(h)}:${pad(min)}`;
    const d = today.getDate();
    return [
      { id: 'e1', title: 'Team Standup', start: dtT(d, 9, 0), end: dtT(d, 9, 30), color: '#3b82f6' },
      { id: 'e2', title: 'Sprint Planning', start: dtT(d, 10, 0), end: dtT(d, 11, 30), color: '#8b5cf6' },
      { id: 'e3', title: 'Lunch Break', start: dtT(d, 12, 0), end: dtT(d, 13, 0), color: '#22c55e' },
      { id: 'e4', title: 'Design Review', start: dtT(d + 1, 14, 0), end: dtT(d + 1, 15, 0), color: '#f59e0b' },
      { id: 'e5', title: 'Release Day', start: dt(d + 2), allDay: true, color: '#ef4444' },
    ];
  }

  describe('Month View', () => {
    it('renders a calendar container', () => {
      calendar(container, { view: 'month', events: sampleEvents() });
      expect(container.querySelector('.tx-calendar')).not.toBeNull();
    });

    it('renders the month table', () => {
      calendar(container, { view: 'month', events: sampleEvents() });
      expect(container.querySelector('.tx-calendar-month')).not.toBeNull();
    });

    it('renders toolbar with navigation buttons', () => {
      calendar(container, { view: 'month', events: sampleEvents() });
      expect(container.querySelector('[data-action="prev"]')).not.toBeNull();
      expect(container.querySelector('[data-action="next"]')).not.toBeNull();
      expect(container.querySelector('[data-action="today"]')).not.toBeNull();
    });

    it('renders view switcher buttons', () => {
      calendar(container, { view: 'month', events: sampleEvents() });
      expect(container.querySelector('[data-view="month"]')).not.toBeNull();
      expect(container.querySelector('[data-view="week"]')).not.toBeNull();
      expect(container.querySelector('[data-view="day"]')).not.toBeNull();
    });

    it('month button is active in month view', () => {
      calendar(container, { view: 'month', events: sampleEvents() });
      const monthBtn = container.querySelector('[data-view="month"]')!;
      expect(monthBtn.classList.contains('tx-calendar-btn-active')).toBe(true);
    });

    it('renders day numbers in month grid', () => {
      calendar(container, { view: 'month', events: sampleEvents() });
      const dayNums = container.querySelectorAll('.tx-calendar-day-num');
      expect(dayNums.length).toBeGreaterThan(0);
    });

    it('displays events in month cells', () => {
      calendar(container, { view: 'month', events: sampleEvents() });
      const events = container.querySelectorAll('.tx-calendar-event');
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('Week View', () => {
    it('renders the timed view container', () => {
      calendar(container, { view: 'week', events: sampleEvents() });
      expect(container.querySelector('.tx-calendar-timed')).not.toBeNull();
    });

    it('renders column headers for 7 days', () => {
      calendar(container, { view: 'week', events: sampleEvents() });
      const headers = container.querySelectorAll('.tx-calendar-header-cell');
      expect(headers.length).toBe(7);
    });

    it('renders the time grid', () => {
      calendar(container, { view: 'week', events: sampleEvents() });
      expect(container.querySelector('.tx-calendar-timegrid')).not.toBeNull();
    });

    it('renders 7 day columns', () => {
      calendar(container, { view: 'week', events: sampleEvents() });
      const cols = container.querySelectorAll('.tx-calendar-day-col');
      expect(cols.length).toBe(7);
    });

    it('week button is active', () => {
      calendar(container, { view: 'week', events: sampleEvents() });
      const weekBtn = container.querySelector('[data-view="week"]')!;
      expect(weekBtn.classList.contains('tx-calendar-btn-active')).toBe(true);
    });
  });

  describe('Day View', () => {
    it('renders a single day column', () => {
      calendar(container, { view: 'day', events: sampleEvents() });
      const cols = container.querySelectorAll('.tx-calendar-day-col');
      expect(cols.length).toBe(1);
    });

    it('renders a single header cell', () => {
      calendar(container, { view: 'day', events: sampleEvents() });
      const headers = container.querySelectorAll('.tx-calendar-header-cell');
      expect(headers.length).toBe(1);
    });

    it('day button is active', () => {
      calendar(container, { view: 'day', events: sampleEvents() });
      const dayBtn = container.querySelector('[data-view="day"]')!;
      expect(dayBtn.classList.contains('tx-calendar-btn-active')).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('next() advances the calendar', () => {
      const cal = calendar(container, { view: 'month', events: [] });
      const titleBefore = container.querySelector('.tx-calendar-toolbar-center')!.textContent;
      cal.next();
      const titleAfter = container.querySelector('.tx-calendar-toolbar-center')!.textContent;
      expect(titleAfter).not.toBe(titleBefore);
    });

    it('prev() moves the calendar backward', () => {
      const cal = calendar(container, { view: 'month', events: [] });
      const titleBefore = container.querySelector('.tx-calendar-toolbar-center')!.textContent;
      cal.prev();
      const titleAfter = container.querySelector('.tx-calendar-toolbar-center')!.textContent;
      expect(titleAfter).not.toBe(titleBefore);
    });

    it('today() resets to current date', () => {
      const cal = calendar(container, { view: 'month', events: [] });
      cal.next();
      cal.next();
      cal.today();
      const title = container.querySelector('.tx-calendar-toolbar-center')!.textContent!;
      const now = new Date();
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      expect(title).toContain(monthNames[now.getMonth()]);
      expect(title).toContain(String(now.getFullYear()));
    });

    it('setView switches between views', () => {
      const cal = calendar(container, { view: 'month', events: sampleEvents() });
      expect(container.querySelector('.tx-calendar-month')).not.toBeNull();
      cal.setView('week');
      expect(container.querySelector('.tx-calendar-month')).toBeNull();
      expect(container.querySelector('.tx-calendar-timed')).not.toBeNull();
    });

    it('setDate changes the displayed date', () => {
      const cal = calendar(container, { view: 'month', events: [] });
      cal.setDate('2025-06-15');
      const title = container.querySelector('.tx-calendar-toolbar-center')!.textContent!;
      expect(title).toContain('June');
      expect(title).toContain('2025');
    });
  });

  describe('Event management', () => {
    it('addEvent adds an event and re-renders', () => {
      const cal = calendar(container, { view: 'month', events: sampleEvents() });
      const beforeCount = container.querySelectorAll('.tx-calendar-event').length;
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      cal.addEvent({ id: 'new1', title: 'New Event', start: `${y}-${m}-${d}` });
      const afterCount = container.querySelectorAll('.tx-calendar-event').length;
      expect(afterCount).toBeGreaterThan(beforeCount);
    });

    it('removeEvent removes an event', () => {
      const cal = calendar(container, { view: 'month', events: sampleEvents() });
      const beforeCount = cal.getEvents().length;
      cal.removeEvent('e1');
      expect(cal.getEvents().length).toBe(beforeCount - 1);
    });

    it('getEvents returns current events', () => {
      const events = sampleEvents();
      const cal = calendar(container, { view: 'month', events });
      expect(cal.getEvents().length).toBe(events.length);
    });
  });

  describe('Destroy', () => {
    it('destroy clears the container', () => {
      const cal = calendar(container, { view: 'month', events: sampleEvents() });
      cal.destroy();
      expect(container.innerHTML).toBe('');
    });
  });
});

describe('Timeline demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic Timeline', () => {
    const ITEMS = [
      { title: 'v0.1.0', content: 'Initial release with core widgets', time: 'Jan 2026', status: 'completed' as const },
      { title: 'v0.2.0', content: 'Charts, calendar, pivot grid', time: 'Feb 2026', status: 'completed' as const },
      { title: 'v0.3.0', content: 'Explorer demo site', time: 'Mar 2026', status: 'active' as const },
      { title: 'v0.4.0', content: 'Theming overhaul', time: 'Apr 2026', status: 'pending' as const },
    ];

    it('renders a timeline container', () => {
      timeline(container, { items: ITEMS });
      expect(container.querySelector('.tx-timeline')).not.toBeNull();
    });

    it('renders correct number of items', () => {
      timeline(container, { items: ITEMS });
      const items = container.querySelectorAll('.tx-timeline-item');
      expect(items.length).toBe(4);
    });

    it('renders item titles', () => {
      timeline(container, { items: ITEMS });
      const titles = container.querySelectorAll('.tx-timeline-title');
      expect(titles[0].textContent).toBe('v0.1.0');
      expect(titles[3].textContent).toBe('v0.4.0');
    });

    it('renders item times', () => {
      timeline(container, { items: ITEMS });
      const times = container.querySelectorAll('.tx-timeline-time');
      expect(times[0].textContent).toBe('Jan 2026');
    });

    it('renders item content', () => {
      timeline(container, { items: ITEMS });
      const bodies = container.querySelectorAll('.tx-timeline-body');
      expect(bodies[0].textContent).toBe('Initial release with core widgets');
    });

    it('applies status classes', () => {
      timeline(container, { items: ITEMS });
      const items = container.querySelectorAll('.tx-timeline-item');
      expect(items[0].classList.contains('tx-timeline-completed')).toBe(true);
      expect(items[2].classList.contains('tx-timeline-active')).toBe(true);
      expect(items[3].classList.contains('tx-timeline-pending')).toBe(true);
    });
  });

  describe('Alternating Timeline', () => {
    const ITEMS = [
      { title: 'Research', content: 'Competitive analysis completed', time: '9:00 AM', status: 'completed' as const },
      { title: 'Design', content: 'Wireframes approved', time: '11:30 AM', status: 'completed' as const },
      { title: 'Development', content: 'Frontend build in progress', time: '2:00 PM', status: 'active' as const },
    ];

    it('adds alternate class', () => {
      timeline(container, { items: ITEMS, alternate: true });
      expect(container.querySelector('.tx-timeline-alternate')).not.toBeNull();
    });

    it('renders all items in alternate mode', () => {
      timeline(container, { items: ITEMS, alternate: true });
      const items = container.querySelectorAll('.tx-timeline-item');
      expect(items.length).toBe(3);
    });
  });

  describe('Colored Timeline', () => {
    const ITEMS = [
      {
        title: 'Order Placed',
        content: 'Order confirmed',
        time: '10:00 AM',
        status: 'completed' as const,
        color: 'success',
      },
      { title: 'Payment', content: 'Card charged', time: '10:02 AM', status: 'completed' as const, color: 'info' },
      { title: 'Shipping', content: 'Package shipped', time: '2:30 PM', status: 'active' as const, color: 'warning' },
      { title: 'Delivery', content: 'Arriving tomorrow', time: 'Pending', status: 'pending' as const, color: 'danger' },
    ];

    it('renders colored markers', () => {
      timeline(container, { items: ITEMS });
      const markers = container.querySelectorAll('.tx-timeline-marker');
      expect(markers.length).toBe(4);
      // Check that the first marker has a custom color style
      const firstMarker = markers[0] as HTMLElement;
      expect(firstMarker.style.cssText).toContain('--tx-timeline-color');
    });

    it('renders all four items', () => {
      timeline(container, { items: ITEMS });
      const items = container.querySelectorAll('.tx-timeline-item');
      expect(items.length).toBe(4);
    });
  });

  describe('Timeline with Icons', () => {
    const ITEMS = [
      {
        title: 'Account Created',
        content: 'Welcome',
        time: 'Day 1',
        status: 'completed' as const,
        icon: 'check',
        color: 'success',
      },
      {
        title: 'First Project',
        content: 'Workspace created',
        time: 'Day 2',
        status: 'active' as const,
        icon: 'star',
        color: 'primary',
      },
      {
        title: 'Invite Team',
        content: 'Collaborate',
        time: 'Upcoming',
        status: 'pending' as const,
        icon: 'clock',
        color: 'warning',
      },
    ];

    it('renders icons inside markers', () => {
      timeline(container, { items: ITEMS });
      const markers = container.querySelectorAll('.tx-timeline-marker');
      // Each marker should contain an SVG from the icon function
      for (let i = 0; i < markers.length; i++) {
        const svg = markers[i].querySelector('svg');
        expect(svg).not.toBeNull();
      }
    });

    it('renders all items with icons', () => {
      timeline(container, { items: ITEMS });
      const items = container.querySelectorAll('.tx-timeline-item');
      expect(items.length).toBe(3);
    });
  });

  describe('Destroy', () => {
    it('destroy clears the container', () => {
      const inst = timeline(container, {
        items: [{ title: 'Test', status: 'active' }],
      });
      inst.destroy();
      expect(container.innerHTML).toBe('');
    });
  });
});
