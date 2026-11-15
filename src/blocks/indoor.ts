import { LitElement, html, nothing } from 'lit';
import type { HomeAssistant, IndoorConfig } from '../types';
import type { Lang } from '../localize';
import { localize } from '../localize';
import { formatTemp, parseNumericState } from '../utils';

export class NSPanelIndoor extends LitElement {
  static properties = {
    config: { attribute: false },
    hass: { attribute: false },
    lang: { attribute: false },
  };

  config!: IndoorConfig;
  hass?: HomeAssistant;
  lang: Lang = 'en';

  private _sensor(entityId: string): number | undefined {
    return parseNumericState(this.hass, entityId);
  }

  protected render() {
    if (!this.config) return nothing;
    const c = this.config;
    const temp = this._sensor(c.temp_entity);
    const humidity = this._sensor(c.humidity_entity);
    return html`
      <style>
        :host { display: block; }
        .temp { font-size: ${c.temp_size}px; font-weight: 300; line-height: 1; }
        .values { margin-top: 6px; font-size: ${c.value_size}px; }
      </style>
      <div style="color:${c.color || 'inherit'};text-align:right">
        <div class="temp">${temp !== undefined ? `${formatTemp(temp)}°` : '—'}</div>
        ${c.show_humidity
          ? html`<div class="values">${localize(this.lang, 'humidity')}: ${humidity !== undefined ? `${Math.round(humidity)}%` : '—'}</div>`
          : nothing}
      </div>
    `;
  }
}

if (!customElements.get('nspanel-indoor')) {
  customElements.define('nspanel-indoor', NSPanelIndoor);
}
