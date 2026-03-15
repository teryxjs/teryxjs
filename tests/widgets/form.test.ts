import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { form } from '../../src/widgets/form';

describe('Form widget', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ---- Renders all field types ----
  describe('field rendering', () => {
    it('should render text input fields', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'username', label: 'Username', type: 'text' }],
      });

      const input = container.querySelector('input[name="username"]') as HTMLInputElement;
      expect(input).not.toBeNull();
      expect(input.type).toBe('text');
    });

    it('should render textarea fields', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'bio', label: 'Bio', type: 'textarea', rows: 5 }],
      });

      const textarea = container.querySelector('textarea[name="bio"]') as HTMLTextAreaElement;
      expect(textarea).not.toBeNull();
      expect(textarea.rows).toBe(5);
    });

    it('should render select fields with options', () => {
      form(container, {
        action: '/api/save',
        fields: [{
          name: 'country',
          label: 'Country',
          type: 'select',
          options: [
            { label: 'USA', value: 'us' },
            { label: 'UK', value: 'uk' },
          ],
        }],
      });

      const select = container.querySelector('select[name="country"]') as HTMLSelectElement;
      expect(select).not.toBeNull();
      const options = select.querySelectorAll('option');
      // Should have at least 2 data options
      expect(options.length).toBeGreaterThanOrEqual(2);
    });

    it('should render checkbox fields', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'agree', label: 'I agree', type: 'checkbox' }],
      });

      const checkbox = container.querySelector('input[name="agree"]') as HTMLInputElement;
      expect(checkbox).not.toBeNull();
      expect(checkbox.type).toBe('checkbox');
    });

    it('should render radio fields', () => {
      form(container, {
        action: '/api/save',
        fields: [{
          name: 'gender',
          label: 'Gender',
          type: 'radio',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        }],
      });

      const radios = container.querySelectorAll('input[name="gender"]');
      expect(radios.length).toBe(2);
      expect((radios[0] as HTMLInputElement).type).toBe('radio');
    });

    it('should render switch fields', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'notify', label: 'Notifications', type: 'switch' }],
      });

      const switchInput = container.querySelector('.tx-switch-input') as HTMLInputElement;
      expect(switchInput).not.toBeNull();
      expect(switchInput.type).toBe('checkbox');
    });
  });

  // ---- Required fields ----
  describe('required fields', () => {
    it('should add required attribute to required fields', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'email', label: 'Email', type: 'email', required: true }],
      });

      const input = container.querySelector('input[name="email"]') as HTMLInputElement;
      expect(input.required).toBe(true);
    });

    it('should show asterisk for required fields', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'name', label: 'Name', required: true }],
      });

      const asterisk = container.querySelector('.tx-form-required');
      expect(asterisk).not.toBeNull();
      expect(asterisk!.textContent).toBe('*');
    });
  });

  // ---- getData() ----
  describe('getData()', () => {
    it('should return form values', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [
          { name: 'first', label: 'First', type: 'text', value: 'John' },
          { name: 'last', label: 'Last', type: 'text', value: 'Doe' },
        ],
      });

      const data = f.getData();
      expect(data.first).toBe('John');
      expect(data.last).toBe('Doe');
    });

    it('should return updated values after user change', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [{ name: 'name', label: 'Name', type: 'text' }],
      });

      const input = container.querySelector('input[name="name"]') as HTMLInputElement;
      input.value = 'Jane';

      const data = f.getData();
      expect(data.name).toBe('Jane');
    });
  });

  // ---- setData() ----
  describe('setData()', () => {
    it('should populate form fields', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [
          { name: 'city', label: 'City', type: 'text' },
          { name: 'zip', label: 'Zip', type: 'text' },
        ],
      });

      f.setData({ city: 'NYC', zip: '10001' });

      const cityInput = container.querySelector('input[name="city"]') as HTMLInputElement;
      const zipInput = container.querySelector('input[name="zip"]') as HTMLInputElement;
      expect(cityInput.value).toBe('NYC');
      expect(zipInput.value).toBe('10001');
    });

    it('should set checkbox checked state', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [{ name: 'active', label: 'Active', type: 'checkbox' }],
      });

      f.setData({ active: true });
      const cb = container.querySelector('input[name="active"]') as HTMLInputElement;
      expect(cb.checked).toBe(true);

      f.setData({ active: false });
      expect(cb.checked).toBe(false);
    });
  });

  // ---- reset() ----
  describe('reset()', () => {
    it('should clear form values', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [{ name: 'name', label: 'Name', type: 'text' }],
      });

      f.setData({ name: 'John' });
      f.reset();

      const input = container.querySelector('input[name="name"]') as HTMLInputElement;
      // After reset, the value should be empty or the default
      expect(input.value).toBe('');
    });

    it('should clear errors on reset', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [{ name: 'email', label: 'Email', required: true }],
      });

      f.setErrors({ email: 'Required' });
      f.reset();

      const errorGroups = container.querySelectorAll('.tx-form-error');
      expect(errorGroups.length).toBe(0);
    });
  });

  // ---- validate() ----
  describe('validate()', () => {
    it('should return false for empty required fields', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [{ name: 'email', label: 'Email', type: 'email', required: true }],
      });

      const valid = f.validate();
      expect(valid).toBe(false);
    });

    it('should return true when required fields are filled', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [{ name: 'name', label: 'Name', type: 'text', required: true }],
      });

      f.setData({ name: 'John' });
      const valid = f.validate();
      expect(valid).toBe(true);
    });
  });

  // ---- setErrors() ----
  describe('setErrors()', () => {
    it('should show error messages', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'name', label: 'Name', type: 'text' },
        ],
      });

      f.setErrors({ email: 'Invalid email', name: 'Name is required' });

      const errorGroups = container.querySelectorAll('.tx-form-error');
      expect(errorGroups.length).toBe(2);

      const emailFeedback = container.querySelector('[data-field="email"] .tx-form-feedback') as HTMLElement;
      expect(emailFeedback.textContent).toBe('Invalid email');
    });
  });

  // ---- clearErrors() ----
  describe('clearErrors()', () => {
    it('should remove error state', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [{ name: 'email', label: 'Email' }],
      });

      f.setErrors({ email: 'Bad email' });
      expect(container.querySelectorAll('.tx-form-error').length).toBe(1);

      f.clearErrors();
      expect(container.querySelectorAll('.tx-form-error').length).toBe(0);

      const feedback = container.querySelector('.tx-form-feedback') as HTMLElement;
      expect(feedback.textContent).toBe('');
    });
  });

  // ---- Layout classes ----
  describe('layout classes', () => {
    it('should apply vertical layout class by default', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'name', label: 'Name' }],
      });

      const formEl = container.querySelector('form') as HTMLElement;
      expect(formEl.classList.contains('tx-form-vertical')).toBe(true);
    });

    it('should apply horizontal layout class', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'name', label: 'Name' }],
        layout: 'horizontal',
      });

      const formEl = container.querySelector('form') as HTMLElement;
      expect(formEl.classList.contains('tx-form-horizontal')).toBe(true);
    });

    it('should apply inline layout class', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'name', label: 'Name' }],
        layout: 'inline',
      });

      const formEl = container.querySelector('form') as HTMLElement;
      expect(formEl.classList.contains('tx-form-inline')).toBe(true);
    });

    it('should apply multi-column grid class', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'a', label: 'A' }, { name: 'b', label: 'B' }],
        columns: 2,
      });

      const gridEl = container.querySelector('.tx-form-grid.tx-form-cols-2');
      expect(gridEl).not.toBeNull();
    });
  });

  // ---- Additional ----
  describe('additional behavior', () => {
    it('should render submit button with custom label', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'x', label: 'X' }],
        submitLabel: 'Save Changes',
      });

      const submitBtn = container.querySelector('button[type="submit"]') as HTMLElement;
      expect(submitBtn.textContent).toBe('Save Changes');
    });

    it('should render cancel button when cancelLabel is set', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'x', label: 'X' }],
        cancelLabel: 'Discard',
      });

      const cancelBtn = container.querySelector('.tx-form-cancel') as HTMLElement;
      expect(cancelBtn).not.toBeNull();
      expect(cancelBtn.textContent).toBe('Discard');
    });

    it('should set the form action via xh-* attribute', () => {
      form(container, {
        action: '/api/submit',
        method: 'post',
        fields: [{ name: 'x', label: 'X' }],
      });

      const formEl = container.querySelector('form') as HTMLElement;
      expect(formEl.getAttribute('xh-post')).toBe('/api/submit');
    });

    it('should render hidden fields', () => {
      form(container, {
        action: '/api/save',
        fields: [
          { name: 'token', type: 'hidden', value: 'abc123' },
          { name: 'name', label: 'Name', type: 'text' },
        ],
      });

      const hidden = container.querySelector('input[name="token"]') as HTMLInputElement;
      expect(hidden).not.toBeNull();
      expect(hidden.type).toBe('hidden');
      expect(hidden.value).toBe('abc123');
    });

    it('should render disabled fields', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'locked', label: 'Locked', type: 'text', disabled: true }],
      });

      const input = container.querySelector('input[name="locked"]') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should render placeholder text', () => {
      form(container, {
        action: '/api/save',
        fields: [{ name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' }],
      });

      const input = container.querySelector('input[name="email"]') as HTMLInputElement;
      expect(input.placeholder).toBe('you@example.com');
    });

    it('getField() returns the field element', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [{ name: 'username', label: 'Username', type: 'text' }],
      });

      const field = f.getField('username');
      expect(field).not.toBeNull();
      expect(field!.tagName).toBe('INPUT');
    });

    it('destroy() clears content', () => {
      const f = form(container, {
        action: '/api/save',
        fields: [{ name: 'x', label: 'X' }],
      });

      f.destroy();
      expect(container.innerHTML).toBe('');
    });
  });
});
