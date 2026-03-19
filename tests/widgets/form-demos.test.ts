import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { form } from '../../src/widgets/form';

// ── Form demos — unit tests ──
describe('Form demos — unit tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Basic Form ──
  describe('Basic Form (text, email, password, number)', () => {
    it('renders a form element', () => {
      form(container, {
        action: '/api/register',
        fields: [
          { name: 'fullName', label: 'Full Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true },
          { name: 'age', label: 'Age', type: 'number', min: 18, max: 120 },
        ],
        submitLabel: 'Register',
        cancelLabel: 'Reset',
      });
      expect(container.querySelector('form')).not.toBeNull();
    });

    it('renders 4 input fields', () => {
      form(container, {
        action: '/api/register',
        fields: [
          { name: 'fullName', label: 'Full Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'password', label: 'Password', type: 'password' },
          { name: 'age', label: 'Age', type: 'number' },
        ],
      });
      const inputs = container.querySelectorAll('input');
      expect(inputs.length).toBe(4);
    });

    it('renders correct input types', () => {
      form(container, {
        action: '/api/register',
        fields: [
          { name: 'fullName', type: 'text' },
          { name: 'email', type: 'email' },
          { name: 'password', type: 'password' },
          { name: 'age', type: 'number' },
        ],
      });
      const inputs = container.querySelectorAll('input');
      expect(inputs[0].type).toBe('text');
      expect(inputs[1].type).toBe('email');
      expect(inputs[2].type).toBe('password');
      expect(inputs[3].type).toBe('number');
    });

    it('marks required fields with required attribute', () => {
      form(container, {
        action: '/api/register',
        fields: [
          { name: 'fullName', type: 'text', required: true },
          { name: 'age', type: 'number' },
        ],
      });
      const inputs = container.querySelectorAll('input');
      expect(inputs[0].required).toBe(true);
      expect(inputs[1].required).toBe(false);
    });

    it('renders submit and cancel buttons', () => {
      form(container, {
        action: '/api/register',
        fields: [{ name: 'fullName', type: 'text' }],
        submitLabel: 'Register',
        cancelLabel: 'Reset',
      });
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent).toBe('Register');
      expect(buttons[1].textContent).toBe('Reset');
    });

    it('sets min and max on number input', () => {
      form(container, {
        action: '/api/register',
        fields: [{ name: 'age', type: 'number', min: 18, max: 120 }],
      });
      const input = container.querySelector('input[name="age"]') as HTMLInputElement;
      expect(input.min).toBe('18');
      expect(input.max).toBe('120');
    });
  });

  // ── Select, Checkbox, Radio, Switch ──
  describe('Select, Checkbox, Radio & Switch', () => {
    it('renders a select element with options', () => {
      form(container, {
        action: '/api/preferences',
        fields: [
          {
            name: 'country',
            label: 'Country',
            type: 'select',
            placeholder: 'Choose a country',
            options: [
              { value: 'us', label: 'United States' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'de', label: 'Germany' },
              { value: 'jp', label: 'Japan' },
            ],
          },
        ],
      });
      const select = container.querySelector('select');
      expect(select).not.toBeNull();
      // 4 options + 1 placeholder
      const options = select!.querySelectorAll('option');
      expect(options.length).toBe(5);
    });

    it('renders a checkbox', () => {
      form(container, {
        action: '/api/preferences',
        fields: [{ name: 'newsletter', label: 'Subscribe to newsletter', type: 'checkbox' }],
      });
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).not.toBeNull();
    });

    it('renders radio buttons', () => {
      form(container, {
        action: '/api/preferences',
        fields: [
          {
            name: 'theme',
            label: 'Theme',
            type: 'radio',
            options: [
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'Auto' },
            ],
            value: 'auto',
          },
        ],
      });
      const radios = container.querySelectorAll('input[type="radio"]');
      expect(radios.length).toBe(3);
    });

    it('selects the default radio value', () => {
      form(container, {
        action: '/api/preferences',
        fields: [
          {
            name: 'theme',
            type: 'radio',
            options: [
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'Auto' },
            ],
            value: 'auto',
          },
        ],
      });
      const autoRadio = container.querySelector('input[type="radio"][value="auto"]') as HTMLInputElement;
      expect(autoRadio.checked).toBe(true);
    });

    it('renders a switch', () => {
      form(container, {
        action: '/api/preferences',
        fields: [{ name: 'notifications', label: 'Enable notifications', type: 'switch' }],
      });
      const switchInput = container.querySelector('.tx-switch-input');
      expect(switchInput).not.toBeNull();
    });
  });

  // ── Form Validation ──
  describe('Form Validation', () => {
    it('renders a form with liveValidation enabled', () => {
      const inst = form(container, {
        action: '/api/validate',
        liveValidation: true,
        fields: [
          {
            name: 'username',
            label: 'Username',
            type: 'text',
            required: true,
            minLength: 3,
            maxLength: 20,
            validators: [
              {
                type: 'minLength',
                value: 3,
                message: 'Username must be at least 3 characters',
              },
            ],
          },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'website', label: 'Website', type: 'url' },
          { name: 'bio', label: 'Bio', type: 'textarea', rows: 3, maxLength: 200 },
        ],
        submitLabel: 'Submit',
      });
      expect(inst.el).toBeTruthy();
    });

    it('renders textarea with rows attribute', () => {
      form(container, {
        action: '/api/validate',
        fields: [{ name: 'bio', label: 'Bio', type: 'textarea', rows: 3 }],
      });
      const textarea = container.querySelector('textarea');
      expect(textarea).not.toBeNull();
      expect(textarea!.rows).toBe(3);
    });

    it('renders help text', () => {
      form(container, {
        action: '/api/validate',
        fields: [{ name: 'bio', label: 'Bio', type: 'textarea', helpText: 'Max 200 characters' }],
      });
      const help = container.querySelector('.tx-form-help');
      expect(help).not.toBeNull();
      expect(help!.textContent).toBe('Max 200 characters');
    });

    it('validate() returns false when required fields are empty', () => {
      const inst = form(container, {
        action: '/api/validate',
        fields: [
          { name: 'username', label: 'Username', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
        ],
      });
      expect(inst.validate()).toBe(false);
    });

    it('setErrors() adds error class and message', () => {
      const inst = form(container, {
        action: '/api/validate',
        fields: [{ name: 'username', label: 'Username', type: 'text' }],
      });
      inst.setErrors({ username: 'Username is required' });
      const group = container.querySelector('[data-field="username"]');
      expect(group!.classList.contains('tx-form-error')).toBe(true);
      const feedback = group!.querySelector('.tx-form-feedback');
      expect(feedback!.textContent).toBe('Username is required');
    });

    it('clearErrors() removes error states', () => {
      const inst = form(container, {
        action: '/api/validate',
        fields: [{ name: 'username', label: 'Username', type: 'text' }],
      });
      inst.setErrors({ username: 'Error' });
      inst.clearErrors();
      const group = container.querySelector('[data-field="username"]');
      expect(group!.classList.contains('tx-form-error')).toBe(false);
    });
  });

  // ── Layout Modes ──
  describe('Layout Modes', () => {
    it('renders vertical layout by default', () => {
      form(container, {
        action: '/api/contact',
        layout: 'vertical',
        fields: [
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'message', label: 'Message', type: 'textarea', rows: 2 },
        ],
        submitLabel: 'Send',
      });
      expect(container.querySelector('.tx-form-vertical')).not.toBeNull();
    });

    it('renders horizontal layout', () => {
      form(container, {
        action: '/api/contact',
        layout: 'horizontal',
        fields: [
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
        ],
        submitLabel: 'Send',
      });
      expect(container.querySelector('.tx-form-horizontal')).not.toBeNull();
    });

    it('renders inline layout', () => {
      form(container, {
        action: '/api/search',
        layout: 'inline',
        fields: [
          { name: 'query', label: 'Search', type: 'text', placeholder: 'Search...' },
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            options: [
              { value: 'all', label: 'All' },
              { value: 'docs', label: 'Docs' },
              { value: 'api', label: 'API' },
            ],
          },
        ],
        submitLabel: 'Go',
      });
      expect(container.querySelector('.tx-form-inline')).not.toBeNull();
    });

    it('horizontal layout groups have horizontal class', () => {
      form(container, {
        action: '/api/contact',
        layout: 'horizontal',
        fields: [{ name: 'name', label: 'Name', type: 'text' }],
      });
      const group = container.querySelector('.tx-form-group-horizontal');
      expect(group).not.toBeNull();
    });
  });

  // ── Instance methods ──
  describe('Instance methods', () => {
    it('getData() returns form data', () => {
      const inst = form(container, {
        action: '/api/test',
        fields: [{ name: 'name', label: 'Name', type: 'text', value: 'Alice' }],
      });
      const data = inst.getData();
      expect(data.name).toBe('Alice');
    });

    it('setData() updates input values', () => {
      const inst = form(container, {
        action: '/api/test',
        fields: [{ name: 'name', label: 'Name', type: 'text' }],
      });
      inst.setData({ name: 'Bob' });
      const input = container.querySelector('input[name="name"]') as HTMLInputElement;
      expect(input.value).toBe('Bob');
    });

    it('reset() clears form values', () => {
      const inst = form(container, {
        action: '/api/test',
        fields: [{ name: 'name', label: 'Name', type: 'text' }],
      });
      inst.setData({ name: 'Bob' });
      inst.reset();
      const input = container.querySelector('input[name="name"]') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('destroy() clears the container', () => {
      const inst = form(container, {
        action: '/api/test',
        fields: [{ name: 'name', label: 'Name', type: 'text' }],
      });
      inst.destroy();
      expect(container.querySelector('form')).toBeNull();
    });

    it('getField() returns the correct input', () => {
      const inst = form(container, {
        action: '/api/test',
        fields: [{ name: 'email', label: 'Email', type: 'email' }],
      });
      const field = inst.getField('email');
      expect(field).not.toBeNull();
      expect((field as HTMLInputElement).type).toBe('email');
    });
  });
});
