import { LitElement, html, nothing } from 'lit';
import type { Align, HomeAssistant, NSPanelCardConfig } from './types';
import { mergeConfig } from './defaults';
import { resolveLang } from './localize';
import { ensureCustomFont } from './utils';
import './blocks/clock';
import './blocks/outdoor';

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
      </div>
    `;
  }
}
