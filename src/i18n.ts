// ============================================================
// Teryx — Internationalization (i18n)
// ============================================================

/** Locale strings organised by widget / category. */
export interface TeryxLocale {
  grid: {
    search: string;
    noData: string;
    showing: string;
    page: string;
    of: string;
    filter: string;
    all: string;
    yes: string;
    no: string;
    columns: string;
    export: string;
  };
  pagination: {
    first: string;
    last: string;
    previous: string;
    next: string;
    page: string;
    of: string;
    rowsPerPage: string;
    jumpTo: string;
  };
  form: {
    submit: string;
    cancel: string;
    required: string;
    invalidValue: string;
  };
  upload: {
    browse: string;
    dropText: string;
    maxFileSize: string;
    maxFilesExceeded: string;
    uploaded: string;
    failed: string;
  };
  calendar: {
    today: string;
    month: string;
    week: string;
    day: string;
    agenda: string;
  };
  toast: {
    close: string;
  };
  general: {
    loading: string;
    noResults: string;
    confirm: string;
    cancel: string;
    ok: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    clear: string;
  };
}

/** Default English locale. */
const defaultLocale: TeryxLocale = {
  grid: {
    search: 'Search...',
    noData: 'No data found',
    showing: 'Showing',
    page: 'Page',
    of: 'of',
    filter: 'Filter...',
    all: 'All',
    yes: 'Yes',
    no: 'No',
    columns: 'Columns',
    export: 'Export',
  },
  pagination: {
    first: 'First',
    last: 'Last',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    rowsPerPage: 'Rows per page',
    jumpTo: 'Jump to',
  },
  form: {
    submit: 'Submit',
    cancel: 'Cancel',
    required: 'This field is required',
    invalidValue: 'Invalid value',
  },
  upload: {
    browse: 'Browse',
    dropText: 'Drop files here or ',
    maxFileSize: 'Max file size:',
    maxFilesExceeded: 'Maximum {n} files allowed',
    uploaded: 'Uploaded',
    failed: 'Failed',
  },
  calendar: {
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
  },
  toast: {
    close: 'Close',
  },
  general: {
    loading: 'Loading...',
    noResults: 'No results',
    confirm: 'Confirm',
    cancel: 'Cancel',
    ok: 'OK',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    clear: 'Clear',
  },
};

// The active locale (mutable copy of default).
let currentLocale: TeryxLocale = deepClone(defaultLocale);

// ----------------------------------------------------------
//  Helpers
// ----------------------------------------------------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Deep-merge `source` into `target`, mutating target. */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sv = source[key];
    const tv = target[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object' && !Array.isArray(tv)) {
      deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>);
    } else if (sv !== undefined) {
      (target as Record<string, unknown>)[key as string] = sv;
    }
  }
  return target;
}

// ----------------------------------------------------------
//  Public API
// ----------------------------------------------------------

/**
 * Replace or partially override the active locale.
 * Values are deep-merged so you only need to supply the keys you want to change.
 */
export function setLocale(locale: Partial<TeryxLocale>): void {
  deepMerge(currentLocale as unknown as Record<string, unknown>, locale as unknown as Record<string, unknown>);
}

/** Return the full active locale object. */
export function getLocale(): TeryxLocale {
  return currentLocale;
}

/**
 * Resolve a dot-separated path to a locale string.
 *
 * @example t('grid.search') // => 'Search...'
 */
export function t(path: string): string {
  const parts = path.split('.');
  let node: unknown = currentLocale;
  for (const part of parts) {
    if (node && typeof node === 'object') {
      node = (node as Record<string, unknown>)[part];
    } else {
      return path; // fallback to path itself
    }
  }
  return typeof node === 'string' ? node : path;
}

/** Reset the locale back to the built-in English defaults. */
export function resetLocale(): void {
  currentLocale = deepClone(defaultLocale);
}
