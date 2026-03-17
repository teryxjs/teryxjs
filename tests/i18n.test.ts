import { describe, it, expect, afterEach } from 'vitest';
import { setLocale, getLocale, t, resetLocale } from '../src/i18n';

describe('i18n', () => {
  afterEach(() => {
    resetLocale();
  });

  // ---- t() ----
  it('should resolve a dot-path to the default English string', () => {
    expect(t('grid.search')).toBe('Search...');
  });

  it('should return the path string when the key does not exist', () => {
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('should resolve deeply nested paths', () => {
    expect(t('form.submit')).toBe('Submit');
    expect(t('form.cancel')).toBe('Cancel');
  });

  // ---- getLocale() ----
  it('should return the full locale object', () => {
    const locale = getLocale();
    expect(locale.grid).toBeDefined();
    expect(locale.form).toBeDefined();
    expect(locale.upload).toBeDefined();
    expect(locale.calendar).toBeDefined();
    expect(locale.toast).toBeDefined();
    expect(locale.general).toBeDefined();
    expect(locale.pagination).toBeDefined();
  });

  // ---- setLocale() partial merge ----
  it('should deep-merge a partial locale without overwriting other keys', () => {
    setLocale({
      grid: {
        search: 'Suchen...',
        noData: 'Keine Daten',
        showing: '',
        page: '',
        of: '',
        filter: '',
        all: '',
        yes: '',
        no: '',
        columns: '',
        export: '',
      },
    });
    expect(t('grid.search')).toBe('Suchen...');
    // Other top-level groups are untouched
    expect(t('form.submit')).toBe('Submit');
  });

  it('should allow overriding a single nested value via setLocale', () => {
    setLocale({ form: { submit: 'Envoyer', cancel: 'Cancel', required: '', invalidValue: '' } });
    expect(t('form.submit')).toBe('Envoyer');
    expect(t('form.cancel')).toBe('Cancel');
  });

  // ---- resetLocale() ----
  it('should restore defaults after resetLocale()', () => {
    setLocale({
      grid: {
        search: 'Buscar...',
        noData: '',
        showing: '',
        page: '',
        of: '',
        filter: '',
        all: '',
        yes: '',
        no: '',
        columns: '',
        export: '',
      },
    });
    expect(t('grid.search')).toBe('Buscar...');
    resetLocale();
    expect(t('grid.search')).toBe('Search...');
  });

  // ---- edge cases ----
  it('should return path when resolving into a non-object segment', () => {
    // 'grid.search' is a string; asking for 'grid.search.deeper' should fallback
    expect(t('grid.search.deeper')).toBe('grid.search.deeper');
  });

  it('should handle an empty path by returning an empty string as path', () => {
    expect(t('')).toBe('');
  });

  // ---- default locale completeness ----
  it('should contain all expected default English strings', () => {
    expect(t('grid.noData')).toBe('No data found');
    expect(t('upload.browse')).toBe('Browse');
    expect(t('upload.dropText')).toBe('Drop files here or ');
    expect(t('general.loading')).toBe('Loading...');
    expect(t('toast.close')).toBe('Close');
    expect(t('calendar.today')).toBe('Today');
    expect(t('pagination.next')).toBe('Next');
  });
});
