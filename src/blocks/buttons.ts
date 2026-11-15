import { LitElement, html, nothing } from 'lit';
import type { ButtonItem, ButtonsConfig } from '../types';

export class NSPanelButtons extends LitElement {
  static properties = {
    config: { attribute: false },
  };

  config!: ButtonsConfig;

  private _click(item: ButtonItem): void {
    if (!item.enabled || !item.path) return;
    history.pushState(null, '', item.path);
    window.dispatchEvent(new Event('location-changed'));
  }

  private _isActive(item: ButtonItem): boolean {
    return !!item.path && item.path === this.config.active_path;
  }

  protected render() {
    if (!this.config) return nothing;
    const c = this.config;
    return html`
      <style>
        :host { display: block; }
        .bar { display: flex; width: ${c.width}px; height: ${c.height}px; }
        .btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          cursor: pointer;
          user-select: none;
        }
        .btn.disabled { opacity: 0.4; cursor: default; }
        .btn.active { color: var(--nwc-accent, #4fc3f7); }
        ha-icon { --mdc-icon-size: 28px; }
        .label { font-size: 13px; }
      </style>
      <div class="bar" style="color:${c.color || 'inherit'}">
        ${c.items
          .filter((item) => item.enabled)
          .map(
            (item) => html`
              <div
                class="btn ${item.path ? '' : 'disabled'} ${this._isActive(item) ? 'active' : ''}"
                @click=${() => this._click(item)}
              >
                ${item.image
                  ? html`<img src=${item.image} style="width:28px;height:28px" alt="" />`
                  : html`<ha-icon .icon=${item.icon}></ha-icon>`}
                ${item.label ? html`<div class="label">${item.label}</div>` : nothing}
              </div>
            `,
          )}
      </div>
    `;
  }
}

if (!customElements.get('nspanel-buttons')) {
  customElements.define('nspanel-buttons', NSPanelButtons);
}
