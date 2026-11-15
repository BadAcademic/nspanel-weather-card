import { LitElement } from 'lit';
import type { HomeAssistant, NSPanelCardConfig } from './types';

export class NSPanelWeatherCardEditor extends LitElement {
  setConfig(_config: Partial<NSPanelCardConfig>): void {}
  set hass(_hass: HomeAssistant) {}
}
