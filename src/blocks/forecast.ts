import { LitElement, html, nothing } from 'lit';
import type { ForecastConfig, ForecastDay } from '../types';
import type { Lang } from '../localize';
import { localize } from '../localize';
import { formatTemp, weekdayShort } from '../utils';
import { handleIconError, weatherIcon } from '../assets';

export class NSPanelForecast extends LitElement {
  static properties = {
    config: { attribute: false },
    forecast: { attribute: false },
    lang: { attribute: false },
    iconOverride: { attribute: false },
  };

  config!: ForecastConfig;
  forecast: ForecastDay[] = [];
  lang: Lang = 'en';
  iconOverride: Record<string, string> = {};

  private _label(date: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const diff = Math.round((day.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return localize(this.lang, 'today');
    if (diff === 1) return localize(this.lang, 'tomorrow');
    return weekdayShort(date, this.lang);
  }

  protected render() {
    if (!this.config) return nothing;
    const c = this.config;
    return html`
      <style>
        :host { display: block; }
        .row { display: flex; gap: 14px; }
        .cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .min { opacity: 0.6; }
      </style>
      <div class="row" style="color:${c.color || 'inherit'}">
        ${this.forecast.length === 0
          ? html`<div>—</div>`
          : this.forecast.map(
              (day) => html`
                <div class="cell">
                  <div style="font-size:${c.day_size}px">${this._label(day.date)}</div>
                  <img
                    src=${weatherIcon(day.condition, this.iconOverride)}
                    style="width:${c.icon_size}px;height:${c.icon_size}px"
                    alt=""
                    @error=${handleIconError}
                  />
                  <div style="font-size:${c.temp_size}px">
                    ${day.tempMax !== undefined ? `${formatTemp(day.tempMax)}°` : '—'}${c.show_min && day.tempMin !== undefined
                      ? html`<span class="min"> / ${formatTemp(day.tempMin)}°</span>`
                      : nothing}
                  </div>
                </div>
              `,
            )}
      </div>
    `;
  }
}

if (!customElements.get('nspanel-forecast')) {
  customElements.define('nspanel-forecast', NSPanelForecast);
}
