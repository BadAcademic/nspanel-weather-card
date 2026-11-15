import { LitElement, html, nothing } from 'lit';
import type { BlocksConfig, ButtonItem, HomeAssistant, NSPanelCardConfig } from './types';
import { mergeConfig } from './defaults';
import { conditionLabel, localize, resolveLang, type Lang, type StringKey } from './localize';
import { hexToRgb, rgbToHex } from './utils';
import { CONDITION_KEYS } from './assets';

function fireEvent(node: EventTarget, type: string, detail?: unknown): void {
  node.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}

type FormValue = Record<string, unknown>;

export class NSPanelWeatherCardEditor extends LitElement {
  private _config: NSPanelCardConfig = mergeConfig({});
  private _hass?: HomeAssistant;

  setConfig(config: Partial<NSPanelCardConfig>): void {
    this._config = mergeConfig(config);
    this.requestUpdate();
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    this.requestUpdate();
  }

  private get _lang(): Lang {
    return resolveLang(this._config.locale, this._hass?.locale?.language);
  }

  private _t(key: StringKey): string {
    return localize(this._lang, key);
  }

  private _updateConfig(patch: Partial<NSPanelCardConfig>): void {
    this._config = mergeConfig({ ...this._config, ...patch });
    fireEvent(this, 'config-changed', { config: this._config });
    this.requestUpdate();
  }

  private _updateBlock<K extends keyof BlocksConfig>(key: K, value: Partial<BlocksConfig[K]>): void {
    const blocks = { ...this._config.blocks, [key]: { ...this._config.blocks[key], ...value } };
    this._updateConfig({ blocks });
  }

  private _form(schema: unknown[], data: object, onChange: (value: any) => void) {
    return html`
      <ha-form
        .hass=${this._hass}
        .schema=${schema}
        .data=${data}
        .computeLabel=${(s: { label?: string; name?: string }) => s.label ?? s.name ?? ''}
        @value-changed=${(ev: CustomEvent<{ value: FormValue }>) => onChange(ev.detail.value)}
      ></ha-form>
    `;
  }

  private _colorRow(current: string, apply: (hex: string) => void) {
    const schema = [{ name: 'color', label: this._t('color'), selector: { color_rgb: {} } }];
    const data = { color: hexToRgb(current) ?? [255, 255, 255] };
    return html`
      <div class="color-row">
        ${this._form(schema, data, (value) => apply(rgbToHex(value.color)))}
        <button type="button" title=${this._t('inheritColor')} @click=${() => apply('')}>↺</button>
      </div>
    `;
  }

  private _section(title: string, open: boolean, content: unknown) {
    return html`
      <details ?open=${open}>
        <summary>${title}</summary>
        <div class="body">${content}</div>
      </details>
    `;
  }

  private _number(name: string, label: StringKey, min: number, max: number, step?: number) {
    const selector = step
      ? { number: { min, max, step, mode: 'box' } }
      : { number: { min, max, mode: 'box' } };
    return { name, label: this._t(label), selector };
  }

  private _flag(name: string, label: StringKey) {
    return { name, label: this._t(label), selector: { boolean: {} } };
  }

  private _generalForm() {
    const c = this._config;
    const schema = [
      this._number('width', 'width', 64, 1024),
      this._number('height', 'height', 64, 1024),
      {
        name: 'locale',
        label: this._t('locale'),
        selector: {
          select: {
            options: [
              { value: 'auto', label: this._t('localeAuto') },
              { value: 'ru', label: 'Русский' },
              { value: 'en', label: 'English' },
            ],
          },
        },
      },
    ];
    return this._form(schema, { width: c.width, height: c.height, locale: c.locale }, (value) =>
      this._updateConfig(value),
    );
  }

  private _backgroundFontForm() {
    const c = this._config;
    const backgroundSchema = [
      { name: 'image', label: this._t('backgroundImage'), selector: { text: {} } },
      this._number('opacity', 'backgroundOpacity', 0, 1, 0.05),
    ];
    const fontSchema = [
      { name: 'family', label: this._t('fontFamily'), selector: { text: {} } },
      { name: 'custom_font_url', label: this._t('customFontUrl'), selector: { text: {} } },
    ];
    return html`
      ${this._form(backgroundSchema, { image: c.background.image, opacity: c.background.opacity }, (value) =>
        this._updateConfig({ background: { ...c.background, ...(value as object) } }),
      )}
      ${this._colorRow(c.background.color, (hex) =>
        this._updateConfig({ background: { ...this._config.background, color: hex } }),
      )}
      ${this._form(fontSchema, { family: c.font.family, custom_font_url: c.font.custom_font_url }, (value) =>
        this._updateConfig({ font: { ...c.font, ...(value as object) } }),
      )}
      ${this._colorRow(c.font.color, (hex) => this._updateConfig({ font: { ...this._config.font, color: hex } }))}
    `;
  }

  private _baseBlockSchema(block: { enabled: boolean; x: number; y: number }) {
    return [
      this._flag('enabled', 'enabled'),
      this._number('x', 'x', 0, 1024),
      this._number('y', 'y', 0, 1024),
    ];
  }

  private _clockForm() {
    const clock = this._config.blocks.clock;
    const schema = [
      ...this._baseBlockSchema(clock),
      {
        name: 'align',
        label: this._t('align'),
        selector: {
          select: {
            options: [
              { value: 'left', label: this._t('alignLeft') },
              { value: 'center', label: this._t('alignCenter') },
              { value: 'right', label: this._t('alignRight') },
            ],
          },
        },
      },
      this._flag('show_time', 'showTime'),
      this._flag('show_date', 'showDate'),
      this._flag('show_weekday', 'showWeekday'),
      this._number('time_size', 'timeSize', 8, 200),
      this._number('date_size', 'dateSize', 8, 100),
      this._number('time_weight', 'timeWeight', 100, 900, 100),
    ];
    return html`
      ${this._form(schema, clock, (value) => this._updateBlock('clock', value))}
      ${this._colorRow(clock.color, (hex) => this._updateBlock('clock', { color: hex }))}
    `;
  }

  private _outdoorForm() {
    const outdoor = this._config.blocks.outdoor;
    const schema = [
      ...this._baseBlockSchema(outdoor),
      { name: 'weather_entity', label: this._t('weatherEntity'), selector: { entity: { domain: ['weather'] } } },
      { name: 'temp_entity', label: this._t('tempEntity'), selector: { entity: { domain: ['sensor'] } } },
      { name: 'humidity_entity', label: this._t('humidityEntity'), selector: { entity: { domain: ['sensor'] } } },
      { name: 'pressure_entity', label: this._t('pressureEntity'), selector: { entity: { domain: ['sensor'] } } },
      this._flag('show_temp', 'showTemp'),
      this._flag('show_humidity', 'showHumidity'),
      this._flag('show_pressure', 'showPressure'),
      this._flag('show_icon', 'showIcon'),
      this._number('temp_size', 'tempSize', 8, 200),
      this._number('value_size', 'valueSize', 8, 100),
      this._number('icon_size', 'iconSize', 8, 300),
    ];
    const iconSchema = CONDITION_KEYS.map((key) => ({
      name: key,
      label: conditionLabel(this._lang, key),
      selector: { text: {} },
    }));
    return html`
      ${this._form(schema, outdoor, (value) => this._updateBlock('outdoor', value))}
      ${this._colorRow(outdoor.color, (hex) => this._updateBlock('outdoor', { color: hex }))}
      <details>
        <summary>${this._t('iconOverride')}</summary>
        ${this._form(iconSchema, outdoor.icon_override, (value) => {
          const clean: Record<string, string> = {};
          for (const [key, url] of Object.entries(value)) {
            if (typeof url === 'string' && url.trim()) clean[key] = url.trim();
          }
          this._updateBlock('outdoor', { icon_override: clean });
        })}
      </details>
    `;
  }

  private _forecastForm() {
    const forecast = this._config.blocks.forecast;
    const schema = [
      ...this._baseBlockSchema(forecast),
      { name: 'weather_entity', label: this._t('forecastEntity'), selector: { entity: { domain: ['weather'] } } },
      this._number('days', 'days', 1, 7),
      this._number('icon_size', 'iconSize', 8, 300),
      this._number('day_size', 'daySize', 8, 100),
      this._number('temp_size', 'tempSize', 8, 100),
      this._flag('show_min', 'showMin'),
    ];
    return html`
      ${this._form(schema, forecast, (value) => this._updateBlock('forecast', value))}
      ${this._colorRow(forecast.color, (hex) => this._updateBlock('forecast', { color: hex }))}
    `;
  }

  private _indoorForm() {
    const indoor = this._config.blocks.indoor;
    const schema = [
      ...this._baseBlockSchema(indoor),
      { name: 'temp_entity', label: this._t('indoorTempEntity'), selector: { entity: { domain: ['sensor'] } } },
      {
        name: 'humidity_entity',
        label: this._t('indoorHumidityEntity'),
        selector: { entity: { domain: ['sensor'] } },
      },
      this._flag('show_humidity', 'showHumidity'),
      this._number('temp_size', 'tempSize', 8, 200),
      this._number('value_size', 'valueSize', 8, 100),
    ];
    return html`
      ${this._form(schema, indoor, (value) => this._updateBlock('indoor', value))}
      ${this._colorRow(indoor.color, (hex) => this._updateBlock('indoor', { color: hex }))}
    `;
  }

  private _updateButtonItem(index: number, value: Partial<ButtonItem>): void {
    const items = this._config.blocks.buttons.items.map((item, i) => (i === index ? { ...item, ...value } : item));
    this._updateBlock('buttons', { items });
  }

  private _moveButtonItem(index: number, delta: number): void {
    const items = [...this._config.blocks.buttons.items];
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    this._updateBlock('buttons', { items });
  }

  private _removeButtonItem(index: number): void {
    const items = this._config.blocks.buttons.items.filter((_, i) => i !== index);
    this._updateBlock('buttons', { items });
  }

  private _addButtonItem(): void {
    const items = [
      ...this._config.blocks.buttons.items,
      { icon: 'mdi:view-dashboard', image: '', label: '', path: '', enabled: true },
    ];
    this._updateBlock('buttons', { items });
  }

  private _buttonsForm() {
    const buttons = this._config.blocks.buttons;
    const schema = [
      ...this._baseBlockSchema(buttons),
      this._number('width', 'width', 64, 1024),
      this._number('height', 'height', 64, 1024),
      { name: 'active_path', label: this._t('activePath'), selector: { text: {} } },
    ];
    const itemSchema = [
      { name: 'icon', label: this._t('buttonIcon'), selector: { icon: {} } },
      { name: 'image', label: this._t('buttonImage'), selector: { text: {} } },
      { name: 'label', label: this._t('buttonLabel'), selector: { text: {} } },
      { name: 'path', label: this._t('buttonPath'), selector: { text: {} } },
      this._flag('enabled', 'enabled'),
    ];
    return html`
      ${this._form(schema, buttons, (value) => this._updateBlock('buttons', value))}
      ${this._colorRow(buttons.color, (hex) => this._updateBlock('buttons', { color: hex }))}
      ${buttons.items.map(
        (item, index) => html`
          <div class="item">
            ${this._form(itemSchema, item, (value) => this._updateButtonItem(index, value))}
            <div class="actions">
              <button type="button" @click=${() => this._moveButtonItem(index, -1)}>↑</button>
              <button type="button" @click=${() => this._moveButtonItem(index, 1)}>↓</button>
              <button type="button" @click=${() => this._removeButtonItem(index)}>✕</button>
            </div>
          </div>
        `,
      )}
      <button type="button" @click=${() => this._addButtonItem()}>+ ${this._t('addButton')}</button>
    `;
  }

  protected render() {
    return html`
      <style>
        :host { display: block; }
        details {
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 8px;
          margin-bottom: 8px;
          padding: 8px;
        }
        summary { cursor: pointer; font-weight: 600; }
        .body { padding-top: 8px; display: flex; flex-direction: column; gap: 8px; }
        .item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border: 1px dashed var(--divider-color, #ccc);
          border-radius: 6px;
          padding: 6px;
          margin-bottom: 6px;
        }
        .item .actions { display: flex; gap: 6px; }
        .color-row { display: flex; align-items: flex-end; gap: 6px; }
        .color-row ha-form { flex: 1; }
        button { cursor: pointer; background: var(--primary-color, #03a9f4); color: #fff; border: 0; border-radius: 4px; padding: 4px 8px; }
      </style>
      ${this._section(this._t('general'), true, this._generalForm())}
      ${this._section(this._t('backgroundAndFont'), false, this._backgroundFontForm())}
      ${this._section(this._t('clock'), false, this._clockForm())}
      ${this._section(this._t('outdoor'), false, this._outdoorForm())}
      ${this._section(this._t('forecast'), false, this._forecastForm())}
      ${this._section(this._t('indoor'), false, this._indoorForm())}
      ${this._section(this._t('buttons'), false, this._buttonsForm())}
    `;
  }
}
