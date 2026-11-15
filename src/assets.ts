import type { WeatherConditionKey } from './types';
import { normalizeCondition } from './utils';

import clearNight from './assets/weather/clear-night.svg';
import cloudy from './assets/weather/cloudy.svg';
import exceptional from './assets/weather/exceptional.svg';
import fog from './assets/weather/fog.svg';
import hail from './assets/weather/hail.svg';
import lightning from './assets/weather/lightning.svg';
import lightningRainy from './assets/weather/lightning-rainy.svg';
import partlycloudy from './assets/weather/partlycloudy.svg';
import pouring from './assets/weather/pouring.svg';
import rainy from './assets/weather/rainy.svg';
import snowy from './assets/weather/snowy.svg';
import snowyRainy from './assets/weather/snowy-rainy.svg';
import sunny from './assets/weather/sunny.svg';
import windy from './assets/weather/windy.svg';
import windyVariant from './assets/weather/windy-variant.svg';

export const WEATHER_ICONS: Record<WeatherConditionKey, string> = {
  'clear-night': clearNight,
  cloudy,
  exceptional,
  fog,
  hail,
  lightning,
  'lightning-rainy': lightningRainy,
  partlycloudy,
  pouring,
  rainy,
  snowy,
  'snowy-rainy': snowyRainy,
  sunny,
  windy,
  'windy-variant': windyVariant,
};

export const CONDITION_KEYS = Object.keys(WEATHER_ICONS) as WeatherConditionKey[];

export function weatherIcon(condition: unknown, overrides: Record<string, string> = {}): string {
  const key = normalizeCondition(condition);
  const override = overrides[key];
  return typeof override === 'string' && override.trim() ? override.trim() : WEATHER_ICONS[key];
}

export function handleIconError(ev: Event): void {
  const img = ev.currentTarget as HTMLImageElement;
  if (img.dataset.fallback) return;
  img.dataset.fallback = '1';
  img.src = WEATHER_ICONS.exceptional;
}
