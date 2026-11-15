import '../src/main.ts';

type FormValue = Record<string, unknown>;

class HaIconStub extends HTMLElement {
  private _icon = '';
  set icon(value: string) {
    this._icon = value;
    this.textContent = '◉';
    this.title = value;
  }
  get icon(): string {
    return this._icon;
  }
}

if (!customElements.get('ha-icon')) {
  customElements.define('ha-icon', HaIconStub);
}

const tomorrow = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

const demoForecast = [
  { datetime: tomorrow(0), condition: 'partlycloudy', temperature: 9, templow: 3 },
  { datetime: tomorrow(1), condition: 'rainy', temperature: 7, templow: 2 },
  { datetime: tomorrow(2), condition: 'sunny', temperature: 12, templow: 4 },
  { datetime: tomorrow(3), condition: 'snowy', temperature: 1, templow: -4 },
];

const hass: Record<string, unknown> = {
  locale: { language: 'ru', time_format: '24' },
  states: {
    'weather.home': {
      entity_id: 'weather.home',
      state: 'partlycloudy',
      attributes: { temperature: 8.3, humidity: 72, pressure: 1012 },
    },
    'sensor.indoor_temperature': {
      entity_id: 'sensor.indoor_temperature',
      state: '21.4',
      attributes: { unit_of_measurement: '°C' },
    },
    'sensor.indoor_humidity': {
      entity_id: 'sensor.indoor_humidity',
      state: '45',
      attributes: { unit_of_measurement: '%' },
    },
  },
  connection: {
    subscribeMessage: async (callback: (message: unknown) => void) => {
      callback({ forecast: demoForecast });
      return async () => {};
    },
  },
  callWS: async () => ({ forecast: demoForecast }),
};

const card = document.createElement('nspanel-weather-card') as HTMLElement & {
  setConfig: (config: unknown) => void;
  hass: unknown;
};
card.setConfig({});
card.hass = hass;
document.getElementById('root')!.append(card);

class HaFormStub extends HTMLElement {
  private _data: FormValue = {};
  private _schema: Array<{ name?: string; label?: string; selector?: Record<string, unknown> }> = [];
  private _label?: (schema: unknown) => string;

  set data(value: FormValue) {
    this._data = value ?? {};
    this._render();
  }
  get data(): FormValue {
    return this._data;
  }
  set schema(value: typeof this._schema) {
    this._schema = value ?? [];
    this._render();
  }
  set computeLabel(fn: (schema: unknown) => string) {
    this._label = fn;
  }

  private _render(): void {
    this.innerHTML = '';
    for (const field of this._schema) {
      if (!field?.name) continue;
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.marginBottom = '4px';
      label.textContent = this._label?.(field) ?? field.name;
      const selector = field.selector ?? {};
      let input: HTMLInputElement;
      if ('boolean' in selector) {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!this._data[field.name];
        input.onchange = () => this._emit(field.name!, input.checked);
      } else if ('number' in selector) {
        input = document.createElement('input');
        input.type = 'number';
        input.value = String(this._data[field.name] ?? '');
        input.oninput = () => this._emit(field.name!, Number(input.value));
      } else {
        input = document.createElement('input');
        const value = this._data[field.name];
        input.value = Array.isArray(value) ? value.join(',') : String(value ?? '');
        input.oninput = () => this._emit(field.name!, input.value);
      }
      label.appendChild(input);
      this.appendChild(label);
    }
  }

  private _emit(name: string, value: unknown): void {
    const next = { ...this._data, [name]: value };
    this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: next }, bubbles: true, composed: true }));
  }
}

if (!customElements.get('ha-form')) {
  customElements.define('ha-form', HaFormStub);
}

const editor = document.createElement('nspanel-weather-card-editor') as HTMLElement & {
  setConfig: (config: unknown) => void;
  hass: unknown;
};
editor.setConfig({});
editor.hass = hass;
editor.addEventListener('config-changed', (ev) => {
  card.setConfig((ev as CustomEvent<{ config: unknown }>).detail.config);
});
document.getElementById('editor-root')!.append(editor);
