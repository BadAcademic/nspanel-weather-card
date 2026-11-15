import type { ForecastDay, HomeAssistant, WeatherConditionKey } from './types';

const MMHG_PER_HPA = 0.750061683;
const MMHG_PER_PA = MMHG_PER_HPA / 100;

export function convertPressure(value: number, unit?: string): number {
  switch ((unit ?? 'hPa').toLowerCase()) {
    case 'hpa':
    case 'mb':
    case 'mbar':
      return value * MMHG_PER_HPA;
    case 'pa':
      return value * MMHG_PER_PA;
    case 'inhg':
      return value * 25.4;
    case 'mmhg':
      return value;
    default:
      return value * MMHG_PER_HPA;
  }
}

export function formatPressure(mmhg: number): string {
  return mmhg.toFixed(1);
}

export function formatTemp(value: number): string {
  const s = value.toFixed(1);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}

const KNOWN_CONDITIONS: readonly WeatherConditionKey[] = [
  'clear-night',
  'cloudy',
  'exceptional',
  'fog',
  'hail',
  'lightning',
  'lightning-rainy',
  'partlycloudy',
  'pouring',
  'rainy',
  'snowy',
  'snowy-rainy',
  'sunny',
  'windy',
  'windy-variant',
];

export function normalizeCondition(condition: unknown): WeatherConditionKey {
  return KNOWN_CONDITIONS.includes(condition as WeatherConditionKey)
    ? (condition as WeatherConditionKey)
    : 'exceptional';
}

export function buildForecast(entries: unknown, days: number): ForecastDay[] {
  if (!Array.isArray(entries) || days <= 0) return [];
  const out: ForecastDay[] = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Record<string, unknown>;
    if (typeof item.datetime !== 'string') continue;
    const date = new Date(item.datetime);
    if (Number.isNaN(date.getTime())) continue;
    out.push({
      date,
      condition: normalizeCondition(item.condition),
      tempMax: typeof item.temperature === 'number' ? item.temperature : undefined,
      tempMin: typeof item.templow === 'number' ? item.templow : undefined,
    });
    if (out.length >= days) break;
  }
  return out;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function weekdayShort(date: Date, lang: string): string {
  return capitalize(new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(date));
}

export function weekdayLong(date: Date, lang: string): string {
  return capitalize(new Intl.DateTimeFormat(lang, { weekday: 'long' }).format(date));
}

export function formatDate(date: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long' }).format(date);
}

export function formatTime(date: Date, lang: string, hour12?: boolean): string {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  if (hour12 !== undefined) options.hour12 = hour12;
  return new Intl.DateTimeFormat(lang, options).format(date);
}

export function parseNumericState(hass: HomeAssistant | undefined, entityId: string): number | undefined {
  if (!entityId) return undefined;
  const state = hass?.states[entityId];
  if (!state) return undefined;
  const parsed = Number.parseFloat(state.state);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function hexToRgb(hex: string): [number, number, number] | undefined {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!match) return undefined;
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(value: unknown): string {
  if (typeof value === 'string') return /^#[0-9a-f]{6}$/i.test(value) ? value : '';
  if (!Array.isArray(value) || value.length !== 3) return '';
  return (
    '#' +
    value
      .map((v) => Math.max(0, Math.min(255, Math.round(Number(v)))).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function ensureCustomFont(url: string): void {
  if (typeof document === 'undefined' || !url) return;
  const id = 'nspanel-weather-card-font';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `@font-face { font-family: 'NSPanelCustomFont'; src: url('${url}'); }`;
  document.head.appendChild(style);
}
