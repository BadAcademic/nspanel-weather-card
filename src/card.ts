import { LitElement, html, nothing } from 'lit';
import type { Align, ForecastDay, HomeAssistant, NSPanelCardConfig } from './types';
import { mergeConfig } from './defaults';
import { resolveLang } from './localize';
import { buildForecast, ensureCustomFont } from './utils';
import './blocks/clock';
import './blocks/outdoor';
import './blocks/indoor';
import './blocks/forecast';

const FORECAST_REFRESH_MS = 30 * 60 * 1000;

export class NSPanelWeatherCard extends LitElement {
  static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement('nspanel-weather-card-editor');
  }

  static getStubConfig(hass: HomeAssistant) {
    const weather = Object.keys(hass?.states ?? {}).find((id) => id.startsWith('weather.'));
    return {
      type: 'custom:nspanel-weather-card',
      blocks: { outdoor: { weather_entity: weather ?? '' } },
    };
  }

  private _config: NSPanelCardConfig = mergeConfig({});
  private _hass?: HomeAssistant;
  private _forecast: ForecastDay[] = [];
  private _unsubForecast?: () => void;
  private _forecastKey = '';
  private _forecastRetryAt = 0;
  private _forecastTimer?: number;

  setConfig(config: Partial<NSPanelCardConfig>): void {
    this._config = mergeConfig(config);
    this._ensureForecast();
    this.requestUpdate();
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (!this._unsubForecast) this._forecastFromAttributes();
    this._ensureForecast();
    this.requestUpdate();
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!this._forecastTimer) {
      this._forecastTimer = window.setInterval(() => {
        if (!this._unsubForecast) this._forecastFromAttributes();
        this._forecastRetryAt = 0;
        this._ensureForecast();
        this.requestUpdate();
      }, FORECAST_REFRESH_MS);
    }
    this._ensureForecast();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this._forecastTimer);
    this._forecastTimer = undefined;
    this._stopForecast();
  }

  private _forecastEntity(): string {
    return this._config.blocks.forecast.weather_entity || this._config.blocks.outdoor.weather_entity;
  }

  private _stopForecast(): void {
    this._unsubForecast?.();
    this._unsubForecast = undefined;
    this._forecastKey = '';
    this._forecastRetryAt = 0;
  }

  private _ensureForecast(): void {
    const c = this._config.blocks.forecast;
    if (!c.enabled) {
      this._stopForecast();
      this._forecast = [];
      return;
    }
    const entity = this._forecastEntity();
    if (!entity) {
      this._stopForecast();
      return;
    }
    if (!this._hass) return;
    const key = `${entity}|${c.days}`;
    if (key === this._forecastKey) {
      // Already subscribed, or a subscribe attempt is in flight/backing off.
      if (this._unsubForecast || Date.now() < this._forecastRetryAt) return;
    } else {
      this._stopForecast();
      this._forecastKey = key;
      this._forecastRetryAt = 0;
    }
    const connection = this._hass.connection;
    if (!connection?.subscribeMessage) {
      this._forecastFromAttributes();
      return;
    }
    // Marks the attempt as in flight; the catch handler keeps this backoff.
    this._forecastRetryAt = Date.now() + FORECAST_REFRESH_MS;
    connection
      .subscribeMessage<{ forecast?: unknown }>(
        (message) => {
          this._forecast = buildForecast(message.forecast, c.days);
          this.requestUpdate();
        },
        { type: 'weather/subscribe_forecast', entity_id: entity, forecast_type: 'daily' },
      )
      .then((unsub) => {
        const stop = () => {
          void unsub();
        };
        if (!this.isConnected || this._forecastKey !== key) {
          stop();
          return;
        }
        this._unsubForecast = stop;
        this._forecastRetryAt = 0;
      })
      .catch(() => {
        this._forecastRetryAt = Date.now() + FORECAST_REFRESH_MS;
        void this._fetchForecastOnce(entity, key);
      });
  }

  private async _fetchForecastOnce(entity: string, key: string): Promise<void> {
    const days = this._config.blocks.forecast.days;
    try {
      const result = await this._hass?.callWS<{ response?: Record<string, { forecast?: unknown }> }>({
        type: 'call_service',
        domain: 'weather',
        service: 'get_forecasts',
        service_data: { type: 'daily' },
        target: { entity_id: entity },
        return_response: true,
      });
      if (this._forecastKey !== key) return;
      const entries = result?.response?.[entity]?.forecast;
      this._forecast = buildForecast(entries, days);
    } catch {
      if (this._forecastKey !== key) return;
      this._forecastFromAttributes();
    }
    this.requestUpdate();
  }

  private _forecastFromAttributes(): void {
    const entity = this._forecastEntity();
    const attributes = entity ? this._hass?.states[entity]?.attributes : undefined;
    this._forecast = buildForecast(attributes?.forecast, this._config.blocks.forecast.days);
  }

  getCardSize(): number {
    return 4;
  }

  private _block(cfg: { x: number; y: number; align?: Align }, content: unknown) {
    const transform =
      cfg.align === 'center' ? 'translateX(-50%)' : cfg.align === 'right' ? 'translateX(-100%)' : 'none';
    return html`<div class="blk" style="left:${cfg.x}px;top:${cfg.y}px;transform:${transform}">${content}</div>`;
  }

  protected render() {
    const c = this._config;
    const lang = resolveLang(c.locale, this._hass?.locale?.language);
    const timeFormat = this._hass?.locale?.time_format;
    const hour12 = !!timeFormat && timeFormat !== '24';
    if (c.font.custom_font_url) ensureCustomFont(c.font.custom_font_url);
    const font = `${c.font.custom_font_url ? "'NSPanelCustomFont', " : ''}${c.font.family}`;
    return html`
      <style>
        :host { display: block; }
        .card {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          color: ${c.font.color};
          font-family: ${font};
          background-color: ${c.background.color};
        }
        .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: ${c.background.opacity}; }
        .blk { position: absolute; }
      </style>
      <div class="card" style="width:${c.width}px;height:${c.height}px">
        ${c.background.image ? html`<img class="bg" src=${c.background.image} alt="" />` : nothing}
        ${c.blocks.clock.enabled
          ? this._block(
              c.blocks.clock,
              html`<nspanel-clock .config=${c.blocks.clock} .lang=${lang} .hour12=${hour12}></nspanel-clock>`,
            )
          : nothing}
        ${c.blocks.outdoor.enabled
          ? this._block(
              c.blocks.outdoor,
              html`<nspanel-outdoor
                .config=${c.blocks.outdoor}
                .hass=${this._hass}
                .lang=${lang}
              ></nspanel-outdoor>`,
            )
          : nothing}
        ${c.blocks.indoor.enabled
          ? this._block(
              c.blocks.indoor,
              html`<nspanel-indoor
                .config=${c.blocks.indoor}
                .hass=${this._hass}
                .lang=${lang}
              ></nspanel-indoor>`,
            )
          : nothing}
        ${c.blocks.forecast.enabled
          ? this._block(
              c.blocks.forecast,
              html`<nspanel-forecast
                .config=${c.blocks.forecast}
                .forecast=${this._forecast}
                .lang=${lang}
                .iconOverride=${c.blocks.outdoor.icon_override}
              ></nspanel-forecast>`,
            )
          : nothing}
      </div>
    `;
  }
}
