import { LitElement, html, nothing } from 'lit';
import type { ClockConfig } from '../types';
import type { Lang } from '../localize';
import { formatDate, formatTime, weekdayLong } from '../utils';

export class NSPanelClock extends LitElement {
  static properties = {
    config: { attribute: false },
    lang: { attribute: false },
    hour12: { attribute: false },
  };

  config!: ClockConfig;
  lang: Lang = 'en';
  hour12: boolean | undefined = undefined;

  private _timer?: number;

  connectedCallback(): void {
    super.connectedCallback();
    this._timer = window.setInterval(() => this.requestUpdate(), 1000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this._timer);
  }

  protected render() {
    if (!this.config) return nothing;
    const c = this.config;
    const now = new Date();
    const dateLine = [
      c.show_weekday ? weekdayLong(now, this.lang) : '',
      c.show_date ? formatDate(now, this.lang) : '',
    ]
      .filter(Boolean)
      .join(', ');
    return html`
      <style>
        :host { display: block; }
        .time { font-size: ${c.time_size}px; font-weight: ${c.time_weight}; line-height: 1; }
        .date { font-size: ${c.date_size}px; margin-top: 4px; }
      </style>
      <div style="text-align:${c.align};color:${c.color || 'inherit'}">
        ${c.show_time ? html`<div class="time">${formatTime(now, this.lang, this.hour12)}</div>` : nothing}
        ${dateLine ? html`<div class="date">${dateLine}</div>` : nothing}
      </div>
    `;
  }
}

if (!customElements.get('nspanel-clock')) {
  customElements.define('nspanel-clock', NSPanelClock);
}
