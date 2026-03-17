// ============================================================
// Teryx — Calendar Widget
// ============================================================

import type { CalendarOptions, CalendarEvent, CalendarInstance } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';

// ----------------------------------------------------------
//  CSS injection (one-time)
// ----------------------------------------------------------
let styleInjected = false;

function injectStyles(): void {
  if (styleInjected) return;
  styleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
/* ---- Calendar Layout ---- */
.tx-calendar { font-family: inherit; border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden; background: #fff; }
.tx-calendar *, .tx-calendar *::before, .tx-calendar *::after { box-sizing: border-box; }

/* ---- Toolbar ---- */
.tx-calendar-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #dee2e6; background: #f8f9fa; gap: 8px; flex-wrap: wrap; }
.tx-calendar-toolbar-left { display: flex; align-items: center; gap: 4px; }
.tx-calendar-toolbar-center { font-weight: 600; font-size: 1.05em; user-select: none; text-align: center; min-width: 180px; }
.tx-calendar-toolbar-right { display: flex; align-items: center; gap: 4px; }
.tx-calendar-btn { display: inline-flex; align-items: center; justify-content: center; padding: 5px 12px; border: 1px solid #ced4da; border-radius: 4px; background: #fff; cursor: pointer; font-size: .85em; color: #495057; transition: background .15s, border-color .15s; line-height: 1.4; }
.tx-calendar-btn:hover { background: #e9ecef; border-color: #adb5bd; }
.tx-calendar-btn-active { background: #0d6efd; color: #fff; border-color: #0d6efd; }
.tx-calendar-btn-active:hover { background: #0b5ed7; border-color: #0a58ca; }
.tx-calendar-btn svg { pointer-events: none; }

/* ---- Month View ---- */
.tx-calendar-month { width: 100%; border-collapse: collapse; table-layout: fixed; }
.tx-calendar-month th { padding: 8px 4px; text-align: center; font-size: .8em; font-weight: 600; color: #6c757d; text-transform: uppercase; border-bottom: 1px solid #dee2e6; }
.tx-calendar-month td { border: 1px solid #eee; vertical-align: top; height: 100px; padding: 0; position: relative; cursor: pointer; }
.tx-calendar-month td:hover { background: #f8f9fa; }
.tx-calendar-day-num { display: block; padding: 4px 6px; font-size: .8em; font-weight: 500; color: #495057; text-align: right; }
.tx-calendar-day-other .tx-calendar-day-num { color: #adb5bd; }
.tx-calendar-day-today { background: #e7f1ff; }
.tx-calendar-day-today .tx-calendar-day-num { color: #0d6efd; font-weight: 700; }
.tx-calendar-month-events { padding: 0 2px 2px; overflow: hidden; }
.tx-calendar-event { display: block; padding: 1px 4px; margin-bottom: 1px; border-radius: 3px; font-size: .72em; line-height: 1.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; color: #fff; background: #0d6efd; }
.tx-calendar-event:hover { filter: brightness(0.9); }

/* ---- Week / Day View ---- */
.tx-calendar-timed { display: flex; flex-direction: column; }
.tx-calendar-allday-row { display: flex; border-bottom: 1px solid #dee2e6; min-height: 28px; }
.tx-calendar-allday-label { width: 58px; min-width: 58px; font-size: .72em; color: #6c757d; display: flex; align-items: center; justify-content: center; border-right: 1px solid #eee; background: #f8f9fa; }
.tx-calendar-allday-cells { display: flex; flex: 1; }
.tx-calendar-allday-cell { flex: 1; border-right: 1px solid #eee; padding: 2px; min-height: 28px; overflow: hidden; }
.tx-calendar-allday-cell:last-child { border-right: none; }

.tx-calendar-header-row { display: flex; border-bottom: 1px solid #dee2e6; }
.tx-calendar-header-gutter { width: 58px; min-width: 58px; border-right: 1px solid #eee; background: #f8f9fa; }
.tx-calendar-header-cells { display: flex; flex: 1; }
.tx-calendar-header-cell { flex: 1; text-align: center; padding: 6px 4px; font-size: .8em; font-weight: 600; color: #6c757d; border-right: 1px solid #eee; }
.tx-calendar-header-cell:last-child { border-right: none; }
.tx-calendar-header-cell-today { color: #0d6efd; }

.tx-calendar-timegrid { display: flex; max-height: 600px; overflow-y: auto; }
.tx-calendar-time-col { width: 58px; min-width: 58px; border-right: 1px solid #eee; background: #f8f9fa; }
.tx-calendar-time-slot-label { height: 48px; font-size: .7em; color: #6c757d; text-align: right; padding: 0 6px; transform: translateY(-7px); }
.tx-calendar-day-cols { display: flex; flex: 1; position: relative; }
.tx-calendar-day-col { flex: 1; position: relative; border-right: 1px solid #eee; }
.tx-calendar-day-col:last-child { border-right: none; }
.tx-calendar-hour-line { height: 48px; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
.tx-calendar-hour-line:hover { background: #f8f9fa; }
.tx-calendar-hour-half { height: 24px; border-bottom: 1px dotted #f5f5f5; }
.tx-calendar-timed-event { position: absolute; left: 2px; right: 2px; border-radius: 3px; padding: 2px 4px; font-size: .72em; line-height: 1.3; overflow: hidden; cursor: pointer; color: #fff; background: #0d6efd; z-index: 1; border-left: 3px solid rgba(0,0,0,.2); }
.tx-calendar-timed-event:hover { filter: brightness(0.9); z-index: 2; }
.tx-calendar-timed-event-title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx-calendar-timed-event-time { font-size: .9em; opacity: .85; }

/* ---- Now line ---- */
.tx-calendar-now-line { position: absolute; left: 0; right: 0; height: 2px; background: #dc3545; z-index: 3; pointer-events: none; }
.tx-calendar-now-line::before { content: ''; position: absolute; left: -4px; top: -3px; width: 8px; height: 8px; border-radius: 50%; background: #dc3545; }
`;
  document.head.appendChild(style);
}

// ----------------------------------------------------------
//  Helpers
// ----------------------------------------------------------
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
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

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(s: string): Date {
  const parts = s.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2] || 1);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeek(d: Date, firstDay: number): Date {
  const day = d.getDay();
  const diff = (day - firstDay + 7) % 7;
  const s = new Date(d);
  s.setDate(s.getDate() - diff);
  return s;
}

function fmtTime(h: number, m: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return m === 0 ? `${hh} ${ampm}` : `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
}

function fmtTimeShort(h: number, m: number): string {
  const ampm = h >= 12 ? 'pm' : 'am';
  const hh = h % 12 || 12;
  return m === 0 ? `${hh}${ampm}` : `${hh}:${String(m).padStart(2, '0')}${ampm}`;
}

function parseEventDateTime(s: string): Date {
  // Handles "YYYY-MM-DD" and "YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS"
  if (s.includes('T')) {
    return new Date(s);
  }
  const parts = s.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function isAllDay(ev: CalendarEvent): boolean {
  if (ev.allDay) return true;
  // If start has no time component, treat as all-day
  return !ev.start.includes('T');
}

function eventColor(ev: CalendarEvent): string {
  return ev.color || '#0d6efd';
}

// ----------------------------------------------------------
//  Main widget factory
// ----------------------------------------------------------
export function calendar(target: string | HTMLElement, options: CalendarOptions): CalendarInstance {
  injectStyles();

  const el = resolveTarget(target);
  const id = options.id || uid('tx-calendar');
  const firstDay = options.firstDay ?? 0;

  let currentView: 'month' | 'week' | 'day' = (options.view as 'month' | 'week' | 'day') || 'month';
  let currentDate = options.date ? parseDate(options.date) : new Date();
  let events: CalendarEvent[] = options.events ? [...options.events] : [];

  // Fetch from remote source
  function fetchEvents(): void {
    if (!options.source) return;
    fetch(options.source)
      .then((r) => r.json())
      .then((data: CalendarEvent[] | { events: CalendarEvent[] }) => {
        const list = Array.isArray(data) ? data : data.events || [];
        // Merge: remote events replace by id, new ones are added
        const idSet = new Set(list.map((e) => e.id));
        events = events.filter((e) => !idSet.has(e.id)).concat(list);
        render();
      })
      .catch((err) => console.error('Teryx calendar: failed to fetch events', err));
  }

  // ----------------------------------------------------------
  //  Rendering
  // ----------------------------------------------------------
  function render(): void {
    const today = new Date();
    let html = `<div class="${cls('tx-calendar', options.class)}" id="${esc(id)}">`;

    // Toolbar
    html += renderToolbar(today);

    // View body
    if (currentView === 'month') {
      html += renderMonth(today);
    } else if (currentView === 'week') {
      html += renderWeek(today);
    } else {
      html += renderDay(today);
    }

    html += '</div>';
    el.innerHTML = html;
    bindEvents();
  }

  function renderToolbar(today: Date): string {
    const titleText = toolbarTitle();
    let h = '<div class="tx-calendar-toolbar">';

    h += '<div class="tx-calendar-toolbar-left">';
    h += `<button class="tx-calendar-btn" data-action="prev">${icon('chevronLeft')}</button>`;
    h += `<button class="tx-calendar-btn" data-action="next">${icon('chevronRight')}</button>`;
    h += `<button class="tx-calendar-btn" data-action="today">Today</button>`;
    h += '</div>';

    h += `<div class="tx-calendar-toolbar-center">${esc(titleText)}</div>`;

    h += '<div class="tx-calendar-toolbar-right">';
    const views: Array<'month' | 'week' | 'day'> = ['month', 'week', 'day'];
    for (const v of views) {
      h += `<button class="${cls('tx-calendar-btn', currentView === v && 'tx-calendar-btn-active')}" data-view="${v}">${v.charAt(0).toUpperCase() + v.slice(1)}</button>`;
    }
    h += '</div>';

    h += '</div>';
    return h;
  }

  function toolbarTitle(): string {
    if (currentView === 'month') {
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (currentView === 'week') {
      const ws = startOfWeek(currentDate, firstDay);
      const we = new Date(ws);
      we.setDate(we.getDate() + 6);
      if (ws.getMonth() === we.getMonth()) {
        return `${MONTH_NAMES[ws.getMonth()]} ${ws.getDate()} \u2013 ${we.getDate()}, ${ws.getFullYear()}`;
      }
      if (ws.getFullYear() === we.getFullYear()) {
        return `${MONTH_NAMES[ws.getMonth()].slice(0, 3)} ${ws.getDate()} \u2013 ${MONTH_NAMES[we.getMonth()].slice(0, 3)} ${we.getDate()}, ${ws.getFullYear()}`;
      }
      return `${MONTH_NAMES[ws.getMonth()].slice(0, 3)} ${ws.getDate()}, ${ws.getFullYear()} \u2013 ${MONTH_NAMES[we.getMonth()].slice(0, 3)} ${we.getDate()}, ${we.getFullYear()}`;
    }
    // day
    return `${DAY_NAMES_SHORT[currentDate.getDay()]}, ${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  }

  // ---- Month View ----
  function renderMonth(today: Date): string {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const gridStart = startOfWeek(first, firstDay);

    // Build ordered day names
    const dayNames: string[] = [];
    for (let i = 0; i < 7; i++) dayNames.push(DAY_NAMES_SHORT[(firstDay + i) % 7]);

    let h = '<table class="tx-calendar-month"><thead><tr>';
    for (const dn of dayNames) h += `<th>${dn}</th>`;
    h += '</tr></thead><tbody>';

    const cursor = new Date(gridStart);
    for (let row = 0; row < 6; row++) {
      h += '<tr>';
      for (let col = 0; col < 7; col++) {
        const isOther = cursor.getMonth() !== month;
        const isToday = sameDay(cursor, today);
        const dateStr = fmtDate(cursor);

        h += `<td class="${cls(
          'tx-calendar-day',
          isOther && 'tx-calendar-day-other',
          isToday && 'tx-calendar-day-today',
        )}" data-date="${dateStr}">`;
        h += `<span class="tx-calendar-day-num">${cursor.getDate()}</span>`;

        // Events for this day
        const dayEvents = getEventsForDate(cursor);
        if (dayEvents.length > 0) {
          h += '<div class="tx-calendar-month-events">';
          const maxShow = 3;
          for (let ei = 0; ei < Math.min(dayEvents.length, maxShow); ei++) {
            const ev = dayEvents[ei];
            h += `<span class="tx-calendar-event" data-event-id="${esc(ev.id)}" style="background:${eventColor(ev)}" title="${esc(ev.title)}">${esc(ev.title)}</span>`;
          }
          if (dayEvents.length > maxShow) {
            h += `<span class="tx-calendar-event" style="background:#6c757d">+${dayEvents.length - maxShow} more</span>`;
          }
          h += '</div>';
        }

        h += '</td>';
        cursor.setDate(cursor.getDate() + 1);
      }
      h += '</tr>';

      // Stop if we've gone past the current month and completed a row
      if (cursor.getMonth() !== month && cursor.getDate() > 7) break;
    }

    h += '</tbody></table>';
    return h;
  }

  // ---- Week View ----
  function renderWeek(today: Date): string {
    const ws = startOfWeek(currentDate, firstDay);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(ws);
      d.setDate(ws.getDate() + i);
      days.push(d);
    }
    return renderTimedView(days, today);
  }

  // ---- Day View ----
  function renderDay(today: Date): string {
    return renderTimedView([new Date(currentDate)], today);
  }

  // ---- Shared timed view (week / day) ----
  function renderTimedView(days: Date[], today: Date): string {
    let h = '<div class="tx-calendar-timed">';

    // Column headers
    h += '<div class="tx-calendar-header-row">';
    h += '<div class="tx-calendar-header-gutter"></div>';
    h += '<div class="tx-calendar-header-cells">';
    for (const d of days) {
      const isToday = sameDay(d, today);
      h += `<div class="${cls('tx-calendar-header-cell', isToday && 'tx-calendar-header-cell-today')}">${DAY_NAMES_SHORT[d.getDay()]} ${d.getDate()}</div>`;
    }
    h += '</div></div>';

    // All-day events row
    h += '<div class="tx-calendar-allday-row">';
    h += '<div class="tx-calendar-allday-label">all-day</div>';
    h += '<div class="tx-calendar-allday-cells">';
    for (const d of days) {
      const dateStr = fmtDate(d);
      const allDayEvts = getEventsForDate(d).filter((e) => isAllDay(e));
      h += `<div class="tx-calendar-allday-cell" data-date="${dateStr}">`;
      for (const ev of allDayEvts) {
        h += `<span class="tx-calendar-event" data-event-id="${esc(ev.id)}" style="background:${eventColor(ev)}" title="${esc(ev.title)}">${esc(ev.title)}</span>`;
      }
      h += '</div>';
    }
    h += '</div></div>';

    // Time grid
    h += '<div class="tx-calendar-timegrid">';

    // Time labels column
    h += '<div class="tx-calendar-time-col">';
    for (let hr = 0; hr < 24; hr++) {
      h += `<div class="tx-calendar-time-slot-label">${hr === 0 ? '' : fmtTime(hr, 0)}</div>`;
    }
    h += '</div>';

    // Day columns
    h += '<div class="tx-calendar-day-cols">';
    for (const d of days) {
      const dateStr = fmtDate(d);
      const isToday = sameDay(d, today);
      h += `<div class="tx-calendar-day-col" data-date="${dateStr}">`;

      // Hour lines (24 hours)
      for (let hr = 0; hr < 24; hr++) {
        h += `<div class="tx-calendar-hour-line" data-hour="${hr}" data-date="${dateStr}"></div>`;
      }

      // Timed events
      const timedEvts = getEventsForDate(d).filter((e) => !isAllDay(e));
      for (const ev of timedEvts) {
        const startDt = parseEventDateTime(ev.start);
        const endDt = ev.end ? parseEventDateTime(ev.end) : new Date(startDt.getTime() + 60 * 60 * 1000);

        // Calculate top and height
        let startMinutes = startDt.getHours() * 60 + startDt.getMinutes();
        let endMinutes = endDt.getHours() * 60 + endDt.getMinutes();

        // If the event starts before this day, clamp to midnight
        if (!sameDay(startDt, d)) startMinutes = 0;
        // If the event ends after this day, clamp to end of day
        if (!sameDay(endDt, d)) endMinutes = 24 * 60;
        // If end is midnight of next day (00:00), treat as 24:00
        if (endMinutes === 0 && !sameDay(endDt, d)) endMinutes = 24 * 60;

        const pxPerMinute = 48 / 60; // 48px per hour
        const top = startMinutes * pxPerMinute;
        const height = Math.max((endMinutes - startMinutes) * pxPerMinute, 18);

        const timeLabel = `${fmtTimeShort(startDt.getHours(), startDt.getMinutes())} - ${fmtTimeShort(endDt.getHours(), endDt.getMinutes())}`;

        h += `<div class="tx-calendar-timed-event" data-event-id="${esc(ev.id)}" style="top:${top}px;height:${height}px;background:${eventColor(ev)}" title="${esc(ev.title)}">`;
        h += `<div class="tx-calendar-timed-event-title">${esc(ev.title)}</div>`;
        if (height > 30) {
          h += `<div class="tx-calendar-timed-event-time">${esc(timeLabel)}</div>`;
        }
        h += '</div>';
      }

      // Now line
      if (isToday) {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const nowTop = nowMinutes * (48 / 60);
        h += `<div class="tx-calendar-now-line" style="top:${nowTop}px"></div>`;
      }

      h += '</div>';
    }
    h += '</div>'; // day-cols

    h += '</div>'; // timegrid
    h += '</div>'; // timed
    return h;
  }

  // ----------------------------------------------------------
  //  Event querying
  // ----------------------------------------------------------
  function getEventsForDate(d: Date): CalendarEvent[] {
    const dateStr = fmtDate(d);
    return events.filter((ev) => {
      const evStart = ev.start.slice(0, 10);
      const evEnd = ev.end ? ev.end.slice(0, 10) : evStart;
      return dateStr >= evStart && dateStr <= evEnd;
    });
  }

  // ----------------------------------------------------------
  //  DOM event binding
  // ----------------------------------------------------------
  function bindEvents(): void {
    const container = el.querySelector(`#${id}`) as HTMLElement;
    if (!container) return;

    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Toolbar buttons
      const actionBtn = target.closest<HTMLElement>('[data-action]');
      if (actionBtn) {
        const action = actionBtn.getAttribute('data-action');
        if (action === 'prev') instance.prev();
        else if (action === 'next') instance.next();
        else if (action === 'today') instance.today();
        return;
      }

      // View switcher
      const viewBtn = target.closest<HTMLElement>('[data-view]');
      if (viewBtn) {
        const view = viewBtn.getAttribute('data-view') as 'month' | 'week' | 'day';
        if (view) instance.setView(view);
        return;
      }

      // Event click
      const eventEl = target.closest<HTMLElement>('[data-event-id]');
      if (eventEl) {
        e.stopPropagation();
        const eventId = eventEl.getAttribute('data-event-id');
        const ev = events.find((ev) => ev.id === eventId);
        if (ev) {
          options.onEventClick?.(ev);
          emit('calendar:eventClick', { id, event: ev });
        }
        return;
      }

      // Date click (month view cell or hour line or allday cell)
      const dateCell = target.closest<HTMLElement>('[data-date]');
      if (dateCell) {
        const dateStr = dateCell.getAttribute('data-date')!;
        const hour = dateCell.getAttribute('data-hour');
        const clickedDate = hour ? `${dateStr}T${String(hour).padStart(2, '0')}:00` : dateStr;
        options.onDateClick?.(clickedDate);
        emit('calendar:dateClick', { id, date: clickedDate });
      }
    });

    // Scroll timed view to 8 AM on initial render
    const timegrid = container.querySelector('.tx-calendar-timegrid') as HTMLElement;
    if (timegrid) {
      timegrid.scrollTop = 8 * 48; // 8 hours * 48px per hour
    }
  }

  // ----------------------------------------------------------
  //  Navigation helpers
  // ----------------------------------------------------------
  function navigatePrev(): void {
    if (currentView === 'month') {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    } else if (currentView === 'week') {
      currentDate.setDate(currentDate.getDate() - 7);
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    render();
    options.onViewChange?.(currentView, fmtDate(currentDate));
    emit('calendar:navigate', { id, view: currentView, date: fmtDate(currentDate) });
  }

  function navigateNext(): void {
    if (currentView === 'month') {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    } else if (currentView === 'week') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    render();
    options.onViewChange?.(currentView, fmtDate(currentDate));
    emit('calendar:navigate', { id, view: currentView, date: fmtDate(currentDate) });
  }

  // ----------------------------------------------------------
  //  Instance
  // ----------------------------------------------------------
  const instance: CalendarInstance = {
    el: el,

    destroy() {
      el.innerHTML = '';
    },

    setView(view: 'month' | 'week' | 'day') {
      if (view === currentView) return;
      currentView = view;
      render();
      options.onViewChange?.(currentView, fmtDate(currentDate));
      emit('calendar:viewChange', { id, view: currentView, date: fmtDate(currentDate) });
    },

    setDate(date: string) {
      currentDate = parseDate(date);
      render();
      options.onViewChange?.(currentView, fmtDate(currentDate));
      emit('calendar:navigate', { id, view: currentView, date: fmtDate(currentDate) });
    },

    today() {
      currentDate = new Date();
      render();
      options.onViewChange?.(currentView, fmtDate(currentDate));
      emit('calendar:navigate', { id, view: currentView, date: fmtDate(currentDate) });
    },

    next() {
      navigateNext();
    },

    prev() {
      navigatePrev();
    },

    addEvent(event: CalendarEvent) {
      events.push(event);
      render();
      emit('calendar:eventAdd', { id, event });
    },

    removeEvent(eventId: string) {
      const idx = events.findIndex((e) => e.id === eventId);
      if (idx !== -1) {
        const removed = events.splice(idx, 1)[0];
        render();
        emit('calendar:eventRemove', { id, event: removed });
      }
    },

    getEvents() {
      return [...events];
    },
  };

  // Initial render
  render();

  // Update el reference to the inner container after render
  const inner = el.querySelector(`#${id}`) as HTMLElement;
  if (inner) instance.el = inner;

  // Fetch remote events if source is provided
  fetchEvents();

  return instance;
}

registerWidget('calendar', (el, opts) => calendar(el, opts as unknown as CalendarOptions));
export default calendar;
