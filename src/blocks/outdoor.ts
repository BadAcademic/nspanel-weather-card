import { LitElement, html, nothing } from 'lit';
import type { HassEntity, HomeAssistant, OutdoorConfig } from '../types';
import type { Lang } from '../localize';
import { localize } from '../localize';
import { convertPressure, formatPressure, formatTemp } from '../utils';
import { handleIconError, weatherIcon } from '../assets';

export class NSPanelOutdoor extends LitElement {
  static properties = {
    config: { attribute: false },
    hass: { attribute: false },
    lang: { attribute: false },
  };

  config!: OutdoorConfig;
  hass?: HomeAssistant;
  lang: Lang = 'en';

  private _value(overrideEntity: string, attr: string, weather?: HassEntity): number | undefined {
    if (overrideEntity) {
      const state = this.hass?.states[overrideEntity];
      const parsed = state ? parseFloat(state.state) : NaN;
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    const value = weather?.attributes?.[attr];
    return typeof value === 'number' ? value : undefined;
  }

  private _pressure(weather?: HassEntity): number | undefined {
    const id = this.config.pressure_entity;
    if (id) {
      const state = this.hass?.states[id];
      const parsed = state ? parseFloat(state.state) : NaN;
      if (Number.isNaN(parsed)) return undefined;
      const unit = state?.attributes?.unit_of_measurement;
      return convertPressure(parsed, typeof unit === 'string' ? unit : undefined);
    }
    const value = weather?.attributes?.pressure;
    return typeof value === 'number' ? convertPressure(value, 'hPa') : undefined;
  }

  protected render() {
    if (!this.config) return nothing;
    const c = this.config;
    const weather = c.weather_entity ? this.hass?.states[c.weather_entity] : undefined;
    const temp = this._value(c.temp_entity, 'temperature', weather);
    const humidity = this._value(c.humidity_entity, 'humidity', weather);
    const pressure = this._pressure(weather);
    const icon = weatherIcon(weather?.state, c.icon_override);
    return html`
      <style>
        :host { display: block; }
        .main { display: flex; align-items: center; gap: 12px; }
        .temp { font-size: ${c.temp_size}px; font-weight: 300; line-height: 1; }
        .icon { width: ${c.icon_size}px; height: ${c.icon_size}px; }
        .values { display: flex; flex-direction: column; gap: 4px; font-size: ${c.value_size}px; margin-top: 6px; }
      </style>
      <div style="color:${c.color || 'inherit'}">
        <div class="main">
          ${c.show_temp ? html`<div class="temp">${temp !== undefined ? `${formatTemp(temp)}°` : '—'}</div>` : nothing}
          ${c.show_icon ? html`<img class="icon" src=${icon} alt="" @error=${handleIconError} />` : nothing}
        </div>
        <div class="values">
          ${c.show_humidity
            ? html`<div>${localize(this.lang, 'humidity')}: ${humidity !== undefined ? `${Math.round(humidity)}%` : '—'}</div>`
            : nothing}
          ${c.show_pressure
            ? html`<div>${localize(this.lang, 'pressure')}: ${pressure !== undefined ? `${formatPressure(pressure)} ${localize(this.lang, 'pressureUnit')}` : '—'}</div>`
            : nothing}
        </div>
      </div>
    `;
  }
}

if (!customElements.get('nspanel-outdoor')) {
  customElements.define('nspanel-outdoor', NSPanelOutdoor);
}
