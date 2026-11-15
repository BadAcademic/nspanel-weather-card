import { NSPanelWeatherCard } from './card';
import { NSPanelWeatherCardEditor } from './editor';

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
    }>;
  }
}

if (!customElements.get('nspanel-weather-card')) {
  customElements.define('nspanel-weather-card', NSPanelWeatherCard);
}
if (!customElements.get('nspanel-weather-card-editor')) {
  customElements.define('nspanel-weather-card-editor', NSPanelWeatherCardEditor);
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === 'nspanel-weather-card')) {
  window.customCards.push({
    type: 'nspanel-weather-card',
    name: 'NSPanel Weather Card',
    description: 'Weather dashboard card for Sonoff NSPanel 480×480',
    preview: true,
  });
}
