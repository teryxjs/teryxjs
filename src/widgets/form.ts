// ============================================================
// Teryx — Form Widget
// ============================================================

import type { FormOptions, FormField, FormInstance, SelectOption } from '../types';
import { uid, esc, cls, icon, resolveTarget } from '../utils';
import { registerWidget, emit } from '../core';
import { t } from '../i18n';

export function form(target: string | HTMLElement, options: FormOptions): FormInstance {
  const el = resolveTarget(target);
  const id = options.id || uid('tx-form');
  const method = (options.method || 'post').toLowerCase();
  const layout = options.layout || 'vertical';
  const columns = options.columns || 1;

  let html = `<form class="${cls('tx-form', `tx-form-${layout}`, options.class)}" id="${esc(id)}"`;
  html += ` xh-${method}="${esc(options.action)}"`;
  if (options.target) html += ` xh-target="${esc(options.target)}"`;
  if (options.swap) html += ` xh-swap="${esc(options.swap)}"`;
  if (options.indicator) html += ` xh-indicator="${esc(options.indicator)}"`;
  html += '>';

  // Group fields
  const groups = groupFields(options.fields, options.fieldGroups);

  for (const [groupName, fields] of groups) {
    if (groupName && groupName !== '__default') {
      const groupDef = options.fieldGroups?.find((g) => g.name === groupName);
      html += `<fieldset class="tx-form-fieldset${groupDef?.collapsible ? ' tx-form-fieldset-collapsible' : ''}">`;
      html += `<legend class="tx-form-legend">${esc(groupDef?.title || groupName)}</legend>`;
      html += `<div class="tx-form-fieldset-body">`;
    }

    if (columns > 1) html += `<div class="tx-form-grid tx-form-cols-${columns}">`;

    for (const field of fields) {
      html += renderField(field, id, layout, columns);
    }

    if (columns > 1) html += '</div>';

    if (groupName && groupName !== '__default') {
      html += '</div></fieldset>';
    }
  }

  // Actions
  html += '<div class="tx-form-actions">';
  html += `<button type="submit" class="tx-btn tx-btn-primary"`;
  if (options.indicator) html += ` xh-indicator="${esc(options.indicator)}"`;
  html += `>${esc(options.submitLabel || t('form.submit'))}</button>`;
  if (options.cancelLabel !== undefined) {
    html += `<button type="button" class="tx-btn tx-btn-secondary tx-form-cancel">${esc(options.cancelLabel || t('form.cancel'))}</button>`;
  }
  html += '</div>';

  html += '</form>';

  el.innerHTML = html;

  const formEl = el.querySelector(`#${id}`) as HTMLFormElement;

  // Live validation
  if (options.liveValidation) {
    formEl.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      const fieldDef = options.fields.find((f) => f.name === input.name);
      if (fieldDef) {
        validateField(input, fieldDef);
      }
    });
  }

  const instance: FormInstance = {
    el: formEl,
    destroy() {
      el.innerHTML = '';
    },
    reset() {
      formEl.reset();
      instance.clearErrors();
    },
    validate(): boolean {
      let valid = true;
      for (const field of options.fields) {
        const input = formEl.elements.namedItem(field.name) as HTMLInputElement;
        if (input && !validateField(input, field)) {
          valid = false;
        }
      }
      return valid;
    },
    getData(): Record<string, unknown> {
      const data: Record<string, unknown> = {};
      const fd = new FormData(formEl);
      for (const [k, v] of fd.entries()) {
        data[k] = v;
      }
      return data;
    },
    setData(data: Record<string, unknown>) {
      for (const [key, value] of Object.entries(data)) {
        const input = formEl.elements.namedItem(key) as HTMLInputElement;
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = !!value;
          } else {
            input.value = String(value ?? '');
          }
        }
      }
    },
    setErrors(errors: Record<string, string>) {
      instance.clearErrors();
      for (const [field, message] of Object.entries(errors)) {
        const group = formEl.querySelector(`[data-field="${field.replace(/["\\\\]/g, '\\\\$&')}"]`);
        if (group) {
          group.classList.add('tx-form-error');
          const errEl = group.querySelector('.tx-form-feedback');
          if (errEl) errEl.textContent = message;
        }
      }
    },
    clearErrors() {
      formEl.querySelectorAll('.tx-form-error').forEach((g) => g.classList.remove('tx-form-error'));
      formEl.querySelectorAll('.tx-form-feedback').forEach((e) => {
        e.textContent = '';
      });
    },
    submit() {
      formEl.requestSubmit();
    },
    isValid(): boolean {
      return formEl.checkValidity();
    },
    getField(name: string): HTMLElement | null {
      return formEl.elements.namedItem(name) as HTMLElement | null;
    },
  };

  // Cancel button
  formEl.querySelector('.tx-form-cancel')?.addEventListener('click', () => {
    instance.reset();
    emit('form:cancel', { id });
  });

  // Success/error callbacks
  formEl.addEventListener('xh:afterRequest', ((e: CustomEvent) => {
    const status = e.detail?.status;
    if (status >= 200 && status < 300) {
      if (options.resetOnSuccess) instance.reset();
      options.onSuccess?.();
      emit('form:success', { id, data: instance.getData() });
    } else {
      options.onError?.(e.detail);
      emit('form:error', { id, error: e.detail });
    }
  }) as EventListener);

  // Custom submit validation
  if (options.onSubmit) {
    formEl.addEventListener('submit', (e) => {
      if (!instance.validate()) {
        e.preventDefault();
        return;
      }
      if (!options.onSubmit!(instance.getData())) {
        e.preventDefault();
      }
    });
  }

  return instance;
}

// ----------------------------------------------------------
// Field rendering
// ----------------------------------------------------------
function renderField(field: FormField, formId: string, layout: string, columns: number): string {
  if (field.type === 'hidden') {
    return `<input type="hidden" name="${esc(field.name)}" value="${esc(String(field.value ?? ''))}">`;
  }

  const colSpan = field.colspan && columns > 1 ? ` style="grid-column:span ${field.colspan}"` : '';
  let html = `<div class="${cls('tx-form-group', `tx-form-group-${layout}`)}" data-field="${esc(field.name)}"${colSpan}>`;

  if (field.label && field.type !== 'checkbox' && field.type !== 'switch') {
    html += `<label class="tx-form-label" for="${esc(formId)}-${esc(field.name)}">`;
    html += esc(field.label);
    if (field.required) html += '<span class="tx-form-required">*</span>';
    html += '</label>';
  }

  html += '<div class="tx-form-control">';

  switch (field.type) {
    case 'textarea':
      html += renderTextarea(field, formId);
      break;
    case 'select':
    case 'multiselect':
      html += renderSelect(field, formId);
      break;
    case 'checkbox':
      html += renderCheckbox(field, formId);
      break;
    case 'radio':
      html += renderRadio(field, formId);
      break;
    case 'switch':
      html += renderSwitch(field, formId);
      break;
    default:
      html += renderInput(field, formId);
      break;
  }

  if (field.helpText) {
    html += `<div class="tx-form-help">${esc(field.helpText)}</div>`;
  }

  html += '<div class="tx-form-feedback"></div>';
  html += '</div></div>';

  return html;
}

function renderInput(field: FormField, formId: string): string {
  const type = field.type || 'text';
  let html = '';

  if (field.prefix || field.icon) {
    html += '<div class="tx-input-group">';
    if (field.icon) html += `<span class="tx-input-icon">${icon(field.icon)}</span>`;
    if (field.prefix) html += `<span class="tx-input-addon">${esc(field.prefix)}</span>`;
  }

  html += `<input type="${esc(type)}"`;
  html += ` class="${cls('tx-input', field.class)}"`;
  html += ` id="${esc(formId)}-${esc(field.name)}"`;
  html += ` name="${esc(field.name)}"`;
  if (field.value !== undefined) html += ` value="${esc(String(field.value))}"`;
  if (field.placeholder) html += ` placeholder="${esc(field.placeholder)}"`;
  if (field.required) html += ' required';
  if (field.disabled) html += ' disabled';
  if (field.readonly) html += ' readonly';
  if (field.pattern) html += ` pattern="${esc(field.pattern)}"`;
  if (field.min !== undefined) html += ` min="${esc(String(field.min))}"`;
  if (field.max !== undefined) html += ` max="${esc(String(field.max))}"`;
  if (field.step !== undefined) html += ` step="${esc(String(field.step))}"`;
  if (field.maxLength !== undefined) html += ` maxlength="${field.maxLength}"`;
  if (field.minLength !== undefined) html += ` minlength="${field.minLength}"`;
  if (field.autocomplete) html += ` autocomplete="${esc(field.autocomplete)}"`;
  if (field.accept) html += ` accept="${esc(field.accept)}"`;
  if (field.multiple) html += ' multiple';
  html += '>';

  if (field.suffix) html += `<span class="tx-input-addon">${esc(field.suffix)}</span>`;
  if (field.prefix || field.icon || field.suffix) html += '</div>';

  return html;
}

function renderTextarea(field: FormField, formId: string): string {
  let html = `<textarea class="${cls('tx-input tx-textarea', field.class)}"`;
  html += ` id="${esc(formId)}-${esc(field.name)}"`;
  html += ` name="${esc(field.name)}"`;
  if (field.placeholder) html += ` placeholder="${esc(field.placeholder)}"`;
  if (field.required) html += ' required';
  if (field.disabled) html += ' disabled';
  if (field.readonly) html += ' readonly';
  if (field.rows) html += ` rows="${field.rows}"`;
  if (field.maxLength !== undefined) html += ` maxlength="${field.maxLength}"`;
  html += '>';
  if (field.value) html += esc(String(field.value));
  html += '</textarea>';
  return html;
}

function renderSelect(field: FormField, formId: string): string {
  let html = `<select class="${cls('tx-select', field.class)}"`;
  html += ` id="${esc(formId)}-${esc(field.name)}"`;
  html += ` name="${esc(field.name)}"`;
  if (field.required) html += ' required';
  if (field.disabled) html += ' disabled';
  if (field.multiple || field.type === 'multiselect') html += ' multiple';
  html += '>';

  if (field.placeholder) {
    html += `<option value="" disabled selected>${esc(field.placeholder)}</option>`;
  }

  if (field.options) {
    let currentGroup = '';
    for (const opt of field.options) {
      if (opt.group && opt.group !== currentGroup) {
        if (currentGroup) html += '</optgroup>';
        html += `<optgroup label="${esc(opt.group)}">`;
        currentGroup = opt.group;
      }
      html += `<option value="${esc(opt.value)}"`;
      if (String(field.value) === opt.value) html += ' selected';
      if (opt.disabled) html += ' disabled';
      html += `>${esc(opt.label)}</option>`;
    }
    if (currentGroup) html += '</optgroup>';
  }

  html += '</select>';
  return html;
}

function renderCheckbox(field: FormField, formId: string): string {
  let html = '<label class="tx-checkbox-label">';
  html += `<input type="checkbox" class="tx-checkbox"`;
  html += ` id="${esc(formId)}-${esc(field.name)}"`;
  html += ` name="${esc(field.name)}"`;
  if (field.value) html += ' checked';
  if (field.required) html += ' required';
  if (field.disabled) html += ' disabled';
  html += '>';
  html += `<span class="tx-checkbox-mark"></span>`;
  if (field.label) html += `<span class="tx-checkbox-text">${esc(field.label)}</span>`;
  html += '</label>';
  return html;
}

function renderRadio(field: FormField, formId: string): string {
  let html = '<div class="tx-radio-group">';
  if (field.options) {
    for (const opt of field.options) {
      html += '<label class="tx-radio-label">';
      html += `<input type="radio" class="tx-radio"`;
      html += ` name="${esc(field.name)}"`;
      html += ` value="${esc(opt.value)}"`;
      if (String(field.value) === opt.value) html += ' checked';
      if (field.disabled || opt.disabled) html += ' disabled';
      html += '>';
      html += `<span class="tx-radio-mark"></span>`;
      html += `<span class="tx-radio-text">${esc(opt.label)}</span>`;
      html += '</label>';
    }
  }
  html += '</div>';
  return html;
}

function renderSwitch(field: FormField, formId: string): string {
  let html = '<label class="tx-switch-label">';
  html += `<input type="checkbox" class="tx-switch-input"`;
  html += ` id="${esc(formId)}-${esc(field.name)}"`;
  html += ` name="${esc(field.name)}"`;
  if (field.value) html += ' checked';
  if (field.disabled) html += ' disabled';
  html += '>';
  html += '<span class="tx-switch-track"><span class="tx-switch-thumb"></span></span>';
  if (field.label) html += `<span class="tx-switch-text">${esc(field.label)}</span>`;
  html += '</label>';
  return html;
}

// ----------------------------------------------------------
// Validation
// ----------------------------------------------------------
function validateField(input: HTMLInputElement, field: FormField): boolean {
  const group = input.closest('.tx-form-group');
  const feedback = group?.querySelector('.tx-form-feedback');

  // Reset
  group?.classList.remove('tx-form-error', 'tx-form-success');

  // Built-in HTML5 validation
  if (!input.checkValidity()) {
    group?.classList.add('tx-form-error');
    if (feedback) feedback.textContent = input.validationMessage;
    return false;
  }

  // Custom validators
  if (field.validators) {
    for (const v of field.validators) {
      let valid = true;
      const val = input.value;

      switch (v.type) {
        case 'minLength':
          valid = val.length >= (v.value as number);
          break;
        case 'maxLength':
          valid = val.length <= (v.value as number);
          break;
        case 'pattern':
          valid = new RegExp(v.value as string).test(val);
          break;
        case 'custom':
          valid = v.fn ? v.fn(val) : true;
          break;
      }

      if (!valid) {
        group?.classList.add('tx-form-error');
        if (feedback) feedback.textContent = v.message || 'Invalid value';
        return false;
      }
    }
  }

  group?.classList.add('tx-form-success');
  return true;
}

function groupFields(
  fields: FormField[],
  groups?: { name: string; title: string; collapsible?: boolean }[],
): Map<string, FormField[]> {
  const map = new Map<string, FormField[]>();

  if (!groups || groups.length === 0) {
    map.set('__default', fields);
    return map;
  }

  for (const g of groups) {
    map.set(g.name, []);
  }
  map.set('__default', []);

  for (const field of fields) {
    const group = field.fieldGroup || '__default';
    if (!map.has(group)) map.set(group, []);
    map.get(group)!.push(field);
  }

  return map;
}

// Declarative
registerWidget('form', (el, opts) => form(el, opts as unknown as FormOptions));

export default form;
