import type { DeepPartial, NSPanelCardConfig } from './types';

export const DEFAULT_CONFIG: NSPanelCardConfig = {
  width: 480,
  height: 480,
  locale: 'auto',
  background: {
    image: '',
    color: '#101418',
    opacity: 1,
  },
  font: {
    family: 'Roboto, sans-serif',
    custom_font_url: '',
    color: '#ffffff',
  },
  blocks: {
    clock: {
      enabled: true,
      x: 24,
      y: 16,
      show_time: true,
      show_date: true,
      show_weekday: true,
      time_size: 72,
      date_size: 18,
      time_weight: 300,
      align: 'left',
      color: '',
    },
    outdoor: {
      enabled: true,
      x: 24,
      y: 128,
      weather_entity: 'weather.home',
      temp_entity: '',
      humidity_entity: '',
      pressure_entity: '',
      show_temp: true,
      show_humidity: true,
      show_pressure: true,
      show_icon: true,
      temp_size: 44,
      value_size: 16,
      icon_size: 88,
      icon_override: {},
      color: '',
    },
    forecast: {
      enabled: true,
      x: 24,
      y: 260,
      days: 4,
      icon_size: 36,
      day_size: 14,
      temp_size: 16,
      show_min: true,
      weather_entity: '',
      color: '',
    },
    indoor: {
      enabled: true,
      x: 300,
      y: 128,
      temp_entity: '',
      humidity_entity: '',
      temp_size: 32,
      value_size: 16,
      show_humidity: true,
      color: '',
    },
    buttons: {
      enabled: true,
      x: 0,
      y: 408,
      width: 480,
      height: 72,
      active_path: '',
      items: [
        {
          icon: 'mdi:weather-partly-cloudy',
          image: '',
          label: 'Погода',
          path: '',
          enabled: true,
        },
        {
          icon: 'mdi:thermostat',
          image: '',
          label: 'Климат',
          path: '',
          enabled: true,
        },
      ],
      color: '',
    },
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(patch)) return (patch === undefined ? base : patch) as T;
  const out: Record<string, unknown> = isPlainObject(base) ? { ...base } : {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || key === '__proto__') continue;
    const current = out[key];
    out[key] = isPlainObject(value) && isPlainObject(current) ? deepMerge(current, value) : value;
  }
  return out as T;
}

export function mergeConfig(config: DeepPartial<NSPanelCardConfig> = {}): NSPanelCardConfig {
  return deepMerge(structuredClone(DEFAULT_CONFIG), config);
}
