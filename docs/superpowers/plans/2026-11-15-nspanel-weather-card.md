# NSPanel Weather Card — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lovelace-карточка `custom:nspanel-weather-card` 480×480 для Sonoff NSPanel с погодой, часами, прогнозом, помещением и кнопками, полностью настраиваемая через визуальный редактор HA, распространяемая через HACS.

**Architecture:** Lit-компонент холста фиксированного размера с абсолютно позиционированными блоками (clock / outdoor / forecast / indoor / buttons), каждый блок — отдельный Lit-элемент без глобального состояния. Конфиг — один объект с глубоким merge поверх дефолтов; редактор — второй Lit-элемент на `ha-form`. Сборка Vite в единственный файл `dist/nspanel-weather-card.js`, который публикуется ассетом GitHub Release.

**Tech Stack:** TypeScript (strict), Lit 3, Vite 6 (library build), Vitest 3, Node 24.

Полная спецификация: `docs/superpowers/specs/2026-11-15-nspanel-weather-card-design.md`.

## Global Constraints

- Холст по умолчанию 480×480 px, `overflow: hidden`, блоки абсолютно позиционируются по X/Y из конфига. Адаптивности нет.
- Единственный артефакт сборки — `dist/nspanel-weather-card.js` (ES-модуль, всё в одном файле, SVG инлайнятся).
- Runtime-зависимость только `lit` (бандлится). Никаких других зависимостей в `dependencies`.
- Давление всегда показывается в мм рт. ст.; конверсия: 1 hPa = 0.750061683 mmHg, 1 Pa = 0.00750061683 mmHg, 1 inHg = 25.4 mmHg, mmHg — без изменений.
- Языки RU + EN, выбор по `locale` конфига → `hass.locale.language` (`ru*` → ru, иначе en).
- Ядро HA обращается к карточке через `setConfig(config)`, `set hass(hass)`, `static getConfigElement()`, `static getStubConfig()`, `getCardSize()`.
- Имя карточки в HA: `custom:nspanel-weather-card`. Лицензия MIT.
- Все юнит-логические функции — чистые, в `src/utils.ts` / `src/defaults.ts` / `src/localize.ts` / `src/assets.ts`, покрыты Vitest. DOM-рендер Lit юнит-тестами не покрывается.

---

### Task 1: Скаффолд проекта и инструменты

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `src/vite-env.d.ts`
- Create: `src/main.ts`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Consumes: ничего.
- Produces: рабочая инфраструктура `npm test` / `npm run build`; точка входа `src/main.ts`.

- [ ] **Step 1: Инициализировать git и создать package.json**

```bash
cd "G:/Code/HomeAssistant/NSPanel"
git init -b main
```

`package.json`:

```json
{
  "name": "nspanel-weather-card",
  "version": "0.1.0",
  "description": "Custom Lovelace weather card for Sonoff NSPanel 480x480",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "vite --config vite.dev.config.ts --open",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lit": "^3.2.1"
  },
  "devDependencies": {
    "typescript": "^5.7.3",
    "vite": "^6.3.5",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Установить зависимости**

Run: `npm install`
Expected: `node_modules/` создан, `package-lock.json` появился, 0 vulnerabilities (или только dev-предупреждения).

- [ ] **Step 3: Создать конфиги**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "useDefineForClassFields": false,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "tests", "dev", "vite.config.ts", "vite.dev.config.ts", "vitest.config.ts"]
}
```

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['es'],
      fileName: () => 'nspanel-weather-card.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2021',
    assetsInlineLimit: 100000000,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

`.gitignore`:

```
node_modules/
dist/
coverage/
*.log
.DS_Store
```

`src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 4: Создать точку входа и LICENSE**

`src/main.ts`:

```ts
export {};
```

`LICENSE` (MIT, стандартный текст):

```
MIT License

Copyright (c) 2026 nspanel-weather-card contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 5: Смоук-тест**

`tests/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Проверить тесты и сборку**

Run: `npm test`
Expected: `1 passed`.

Run: `npm run build`
Expected: успешная сборка, создан `dist/nspanel-weather-card.js`.

- [ ] **Step 7: Коммит**

```bash
git add -A
git commit -m "chore: scaffold NSPanel weather card project"
```

---

### Task 2: Типы и конфиг по умолчанию

**Files:**
- Create: `src/types.ts`
- Create: `src/defaults.ts`
- Test: `tests/defaults.test.ts`

**Interfaces:**
- Consumes: ничего.
- Produces:
  - `types.ts`: `NSPanelCardConfig`, `BackgroundConfig`, `FontConfig`, `ClockConfig`, `OutdoorConfig`, `ForecastConfig`, `IndoorConfig`, `ButtonsConfig`, `ButtonItem`, `BlocksConfig`, `Align`, `LocaleSetting`, `WeatherConditionKey`, `ForecastDay`, `HassEntity`, `HomeAssistant`, `DeepPartial<T>`.
  - `defaults.ts`: `DEFAULT_CONFIG: NSPanelCardConfig`, `mergeConfig(config?: DeepPartial<NSPanelCardConfig>): NSPanelCardConfig`.

- [ ] **Step 1: Написать падающий тест**

`tests/defaults.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { mergeConfig } from '../src/defaults';

describe('mergeConfig', () => {
  it('returns working defaults for empty config', () => {
    const c = mergeConfig({});
    expect(c.width).toBe(480);
    expect(c.height).toBe(480);
    expect(c.locale).toBe('auto');
    expect(c.blocks.clock.enabled).toBe(true);
    expect(c.blocks.outdoor.weather_entity).toBe('weather.home');
    expect(c.blocks.buttons.items.length).toBe(2);
  });

  it('merges nested blocks without losing sibling defaults', () => {
    const c = mergeConfig({ blocks: { clock: { time_size: 100 } } });
    expect(c.blocks.clock.time_size).toBe(100);
    expect(c.blocks.clock.show_time).toBe(true);
    expect(c.blocks.outdoor.x).toBe(24);
  });

  it('replaces button items array instead of merging', () => {
    const c = mergeConfig({
      blocks: {
        buttons: {
          items: [{ icon: 'mdi:a', image: '', label: 'A', path: '/a', enabled: true }],
        },
      },
    });
    expect(c.blocks.buttons.items).toHaveLength(1);
    expect(c.blocks.buttons.items[0].label).toBe('A');
  });

  it('keeps unknown keys harmless', () => {
    const c = mergeConfig({ foo: 'bar' } as never);
    expect((c as Record<string, unknown>).foo).toBe('bar');
    expect(c.width).toBe(480);
  });

  it('does not mutate DEFAULT_CONFIG across calls', () => {
    const a = mergeConfig({ blocks: { clock: { x: 1 } } });
    const b = mergeConfig({});
    expect(a.blocks.clock.x).toBe(1);
    expect(b.blocks.clock.x).toBe(24);
  });
});
```

- [ ] **Step 2: Запустить тест — должен упасть**

Run: `npx vitest run tests/defaults.test.ts`
Expected: FAIL — `Failed to resolve import "../src/defaults"`.

- [ ] **Step 3: Создать `src/types.ts`**

```ts
export type LocaleSetting = 'auto' | 'ru' | 'en';
export type Align = 'left' | 'center' | 'right';

export type WeatherConditionKey =
  | 'clear-night'
  | 'cloudy'
  | 'exceptional'
  | 'fog'
  | 'hail'
  | 'lightning'
  | 'lightning-rainy'
  | 'partlycloudy'
  | 'pouring'
  | 'rainy'
  | 'snowy'
  | 'snowy-rainy'
  | 'sunny'
  | 'windy'
  | 'windy-variant';

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  locale?: { language: string; time_format?: '24' | '12' | 'am_pm' | 'AM_PM' };
  connection?: {
    subscribeMessage<T>(
      callback: (message: T) => void,
      message: Record<string, unknown>,
    ): Promise<() => void | Promise<void>>;
  };
  callWS<T>(message: Record<string, unknown>): Promise<T>;
}

export interface BackgroundConfig {
  image: string;
  color: string;
  opacity: number;
}

export interface FontConfig {
  family: string;
  custom_font_url: string;
  color: string;
}

export interface BlockBase {
  enabled: boolean;
  x: number;
  y: number;
  color: string;
}

export interface ClockConfig extends BlockBase {
  show_time: boolean;
  show_date: boolean;
  show_weekday: boolean;
  time_size: number;
  date_size: number;
  time_weight: number;
  align: Align;
}

export interface OutdoorConfig extends BlockBase {
  weather_entity: string;
  temp_entity: string;
  humidity_entity: string;
  pressure_entity: string;
  show_temp: boolean;
  show_humidity: boolean;
  show_pressure: boolean;
  show_icon: boolean;
  temp_size: number;
  value_size: number;
  icon_size: number;
  icon_override: Record<string, string>;
}

export interface ForecastConfig extends BlockBase {
  days: number;
  icon_size: number;
  day_size: number;
  temp_size: number;
  show_min: boolean;
  weather_entity: string;
}

export interface IndoorConfig extends BlockBase {
  temp_entity: string;
  humidity_entity: string;
  temp_size: number;
  value_size: number;
  show_humidity: boolean;
}

export interface ButtonItem {
  icon: string;
  image: string;
  label: string;
  path: string;
  enabled: boolean;
}

export interface ButtonsConfig extends BlockBase {
  width: number;
  height: number;
  active_path: string;
  items: ButtonItem[];
}

export interface BlocksConfig {
  clock: ClockConfig;
  outdoor: OutdoorConfig;
  forecast: ForecastConfig;
  indoor: IndoorConfig;
  buttons: ButtonsConfig;
}

export interface NSPanelCardConfig {
  type?: string;
  width: number;
  height: number;
  locale: LocaleSetting;
  background: BackgroundConfig;
  font: FontConfig;
  blocks: BlocksConfig;
}

export interface ForecastDay {
  date: Date;
  condition: WeatherConditionKey;
  tempMax?: number;
  tempMin?: number;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};
```

- [ ] **Step 4: Создать `src/defaults.ts`**

```ts
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
    if (value === undefined) continue;
    const current = out[key];
    out[key] = isPlainObject(value) && isPlainObject(current) ? deepMerge(current, value) : value;
  }
  return out as T;
}

export function mergeConfig(config: DeepPartial<NSPanelCardConfig> = {}): NSPanelCardConfig {
  return deepMerge(structuredClone(DEFAULT_CONFIG), config);
}
```

- [ ] **Step 5: Запустить тесты — должны пройти**

Run: `npx vitest run tests/defaults.test.ts`
Expected: `5 passed`.

- [ ] **Step 6: Коммит**

```bash
git add src/types.ts src/defaults.ts tests/defaults.test.ts
git commit -m "feat: add card config types and default merge"
```

---

### Task 3: Утилиты (давление, прогноз, даты, цвета)

**Files:**
- Create: `src/utils.ts`
- Test: `tests/utils.test.ts`

**Interfaces:**
- Consumes: `ForecastDay`, `WeatherConditionKey` из `src/types.ts`.
- Produces:
  - `convertPressure(value: number, unit?: string): number`
  - `formatPressure(mmhg: number): string`
  - `formatTemp(value: number): string`
  - `normalizeCondition(condition: unknown): WeatherConditionKey`
  - `buildForecast(entries: unknown, days: number): ForecastDay[]`
  - `weekdayShort(date: Date, lang: string): string`
  - `weekdayLong(date: Date, lang: string): string`
  - `formatDate(date: Date, lang: string): string`
  - `formatTime(date: Date, lang: string, hour12: boolean): string`
  - `hexToRgb(hex: string): [number, number, number] | undefined`
  - `rgbToHex(value: unknown): string`
  - `ensureCustomFont(url: string): void`

- [ ] **Step 1: Написать падающий тест**

`tests/utils.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  buildForecast,
  convertPressure,
  formatPressure,
  formatTemp,
  formatTime,
  formatDate,
  hexToRgb,
  normalizeCondition,
  rgbToHex,
  weekdayLong,
  weekdayShort,
} from '../src/utils';

describe('convertPressure', () => {
  it('converts hPa to mmHg', () => {
    expect(convertPressure(1013.25, 'hPa')).toBeCloseTo(760, 1);
  });
  it('converts mb and mbar like hPa', () => {
    expect(convertPressure(1013.25, 'mb')).toBeCloseTo(760, 1);
    expect(convertPressure(1013.25, 'mbar')).toBeCloseTo(760, 1);
  });
  it('converts Pa', () => {
    expect(convertPressure(101325, 'Pa')).toBeCloseTo(760, 0);
  });
  it('passes mmHg through', () => {
    expect(convertPressure(745.2, 'mmHg')).toBeCloseTo(745.2, 5);
  });
  it('converts inHg', () => {
    expect(convertPressure(29.92, 'inHg')).toBeCloseTo(759.97, 1);
  });
  it('defaults to hPa when unit is missing', () => {
    expect(convertPressure(1013.25)).toBeCloseTo(760, 1);
  });
});

describe('formatting', () => {
  it('formats pressure with one decimal', () => {
    expect(formatPressure(745.24)).toBe('745.2');
  });
  it('drops trailing .0 in temperature', () => {
    expect(formatTemp(21)).toBe('21');
    expect(formatTemp(21.55)).toBe('21.6');
  });
});

describe('normalizeCondition', () => {
  it('keeps known conditions', () => {
    expect(normalizeCondition('partlycloudy')).toBe('partlycloudy');
    expect(normalizeCondition('clear-night')).toBe('clear-night');
  });
  it('maps unknown values to exceptional', () => {
    expect(normalizeCondition('unknown')).toBe('exceptional');
    expect(normalizeCondition(undefined)).toBe('exceptional');
  });
});

describe('buildForecast', () => {
  const entries = [
    { datetime: '2026-11-16T00:00:00Z', condition: 'rainy', temperature: 9, templow: 3 },
    { datetime: '2026-11-17T00:00:00Z', condition: 'sunny', temperature: 11 },
    { datetime: 'bad-date', condition: 'sunny', temperature: 11 },
    { condition: 'sunny' },
  ];

  it('maps valid entries and respects day limit', () => {
    const result = buildForecast(entries, 4);
    expect(result).toHaveLength(2);
    expect(result[0].condition).toBe('rainy');
    expect(result[0].tempMax).toBe(9);
    expect(result[0].tempMin).toBe(3);
    expect(result[1].tempMin).toBeUndefined();
  });

  it('limits days', () => {
    expect(buildForecast(entries, 1)).toHaveLength(1);
  });

  it('returns empty array for non-array input', () => {
    expect(buildForecast(undefined, 3)).toEqual([]);
    expect(buildForecast('nope', 3)).toEqual([]);
  });
});

describe('date helpers', () => {
  const sunday = new Date(2026, 10, 15, 9, 5);

  it('formats short weekday capitalized', () => {
    expect(weekdayShort(sunday, 'ru')).toBe('Вс');
    expect(weekdayShort(sunday, 'en')).toBe('Sun');
  });

  it('formats long weekday capitalized', () => {
    expect(weekdayLong(sunday, 'ru')).toBe('Воскресенье');
  });

  it('formats date', () => {
    expect(formatDate(sunday, 'ru')).toBe('15 ноября');
  });

  it('formats time 24h', () => {
    expect(formatTime(sunday, 'ru', false)).toBe('09:05');
  });
});

describe('color helpers', () => {
  it('converts hex to rgb', () => {
    expect(hexToRgb('#101418')).toEqual([16, 20, 24]);
    expect(hexToRgb('101418')).toEqual([16, 20, 24]);
    expect(hexToRgb('bad')).toBeUndefined();
  });
  it('converts rgb to hex', () => {
    expect(rgbToHex([16, 20, 24])).toBe('#101418');
    expect(rgbToHex('#abcdef')).toBe('#abcdef');
    expect(rgbToHex(undefined)).toBe('');
  });
});
```

- [ ] **Step 2: Запустить тест — должен упасть**

Run: `npx vitest run tests/utils.test.ts`
Expected: FAIL — `Failed to resolve import "../src/utils"`.

- [ ] **Step 3: Создать `src/utils.ts`**

```ts
import type { ForecastDay, WeatherConditionKey } from './types';

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
  if (!Array.isArray(entries)) return [];
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

export function formatTime(date: Date, lang: string, hour12: boolean): string {
  return new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', hour12 }).format(date);
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
```

- [ ] **Step 4: Запустить тесты — должны пройти**

Run: `npx vitest run tests/utils.test.ts`
Expected: `19 passed`.

- [ ] **Step 5: Коммит**

```bash
git add src/utils.ts tests/utils.test.ts
git commit -m "feat: add pressure, forecast and formatting utils"
```

---

### Task 4: Локализация RU/EN

**Files:**
- Create: `src/localize.ts`
- Test: `tests/localize.test.ts`

**Interfaces:**
- Consumes: `WeatherConditionKey` из `src/types.ts`.
- Produces:
  - `Lang = 'ru' | 'en'`
  - `STRINGS: Record<Lang, Dictionary>`
  - `StringKey` (ключи словаря, кроме `conditions`)
  - `resolveLang(locale: string | undefined, hassLang: string | undefined): Lang`
  - `localize(lang: Lang, key: StringKey): string`
  - `conditionLabel(lang: Lang, key: WeatherConditionKey): string`

- [ ] **Step 1: Написать падающий тест**

`tests/localize.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { conditionLabel, localize, resolveLang } from '../src/localize';

describe('resolveLang', () => {
  it('uses hass language when locale is auto', () => {
    expect(resolveLang('auto', 'ru-RU')).toBe('ru');
    expect(resolveLang(undefined, 'en-US')).toBe('en');
  });
  it('explicit locale wins', () => {
    expect(resolveLang('en', 'ru')).toBe('en');
    expect(resolveLang('ru', 'en')).toBe('ru');
  });
  it('falls back to en for unknown languages', () => {
    expect(resolveLang('auto', 'de-DE')).toBe('en');
    expect(resolveLang(undefined, undefined)).toBe('en');
  });
});

describe('localize', () => {
  it('returns russian strings', () => {
    expect(localize('ru', 'humidity')).toBe('Влажность');
    expect(localize('ru', 'today')).toBe('Сегодня');
  });
  it('returns english strings', () => {
    expect(localize('en', 'pressure')).toBe('Pressure');
  });
});

describe('conditionLabel', () => {
  it('localizes weather conditions', () => {
    expect(conditionLabel('ru', 'partlycloudy')).toBe('Переменная облачность');
    expect(conditionLabel('en', 'partlycloudy')).toBe('Partly cloudy');
  });
});
```

- [ ] **Step 2: Запустить тест — должен упасть**

Run: `npx vitest run tests/localize.test.ts`
Expected: FAIL — `Failed to resolve import "../src/localize"`.

- [ ] **Step 3: Создать `src/localize.ts`**

```ts
import type { WeatherConditionKey } from './types';

export type Lang = 'ru' | 'en';

interface Dictionary {
  humidity: string;
  pressure: string;
  pressureUnit: string;
  today: string;
  tomorrow: string;
  general: string;
  backgroundAndFont: string;
  clock: string;
  outdoor: string;
  forecast: string;
  indoor: string;
  buttons: string;
  width: string;
  height: string;
  locale: string;
  localeAuto: string;
  backgroundImage: string;
  backgroundOpacity: string;
  fontFamily: string;
  customFontUrl: string;
  enabled: string;
  x: string;
  y: string;
  color: string;
  inheritColor: string;
  align: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  showTime: string;
  showDate: string;
  showWeekday: string;
  timeSize: string;
  dateSize: string;
  timeWeight: string;
  weatherEntity: string;
  tempEntity: string;
  humidityEntity: string;
  pressureEntity: string;
  showTemp: string;
  showHumidity: string;
  showPressure: string;
  showIcon: string;
  tempSize: string;
  valueSize: string;
  iconSize: string;
  iconOverride: string;
  days: string;
  daySize: string;
  showMin: string;
  forecastEntity: string;
  indoorTempEntity: string;
  indoorHumidityEntity: string;
  activePath: string;
  buttonIcon: string;
  buttonImage: string;
  buttonLabel: string;
  buttonPath: string;
  addButton: string;
  conditions: Record<WeatherConditionKey, string>;
}

export const STRINGS: Record<Lang, Dictionary> = {
  ru: {
    humidity: 'Влажность',
    pressure: 'Давление',
    pressureUnit: 'мм рт. ст.',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    general: 'Общие',
    backgroundAndFont: 'Фон и шрифт',
    clock: 'Часы',
    outdoor: 'Улица',
    forecast: 'Прогноз',
    indoor: 'Помещение',
    buttons: 'Кнопки',
    width: 'Ширина (px)',
    height: 'Высота (px)',
    locale: 'Язык',
    localeAuto: 'Как в Home Assistant',
    backgroundImage: 'Фоновое изображение (URL)',
    backgroundOpacity: 'Прозрачность фона (0–1)',
    fontFamily: 'Семейство шрифта',
    customFontUrl: 'URL шрифта (@font-face)',
    enabled: 'Включён',
    x: 'X (px)',
    y: 'Y (px)',
    color: 'Цвет',
    inheritColor: 'Сбросить (наследовать цвет)',
    align: 'Выравнивание',
    alignLeft: 'Слева',
    alignCenter: 'По центру',
    alignRight: 'Справа',
    showTime: 'Показывать время',
    showDate: 'Показывать дату',
    showWeekday: 'Показывать день недели',
    timeSize: 'Размер времени (px)',
    dateSize: 'Размер даты (px)',
    timeWeight: 'Жирность времени',
    weatherEntity: 'Погодная сущность',
    tempEntity: 'Датчик температуры (пусто = из погоды)',
    humidityEntity: 'Датчик влажности (пусто = из погоды)',
    pressureEntity: 'Датчик давления (пусто = из погоды)',
    showTemp: 'Показывать температуру',
    showHumidity: 'Показывать влажность',
    showPressure: 'Показывать давление',
    showIcon: 'Показывать иконку',
    tempSize: 'Размер температуры (px)',
    valueSize: 'Размер значений (px)',
    iconSize: 'Размер иконки (px)',
    iconOverride: 'Свои картинки погоды (URL по состоянию)',
    days: 'Количество дней (1–7)',
    daySize: 'Размер подписи дня (px)',
    showMin: 'Показывать минимум',
    forecastEntity: 'Погодная сущность (пусто = как у улицы)',
    indoorTempEntity: 'Датчик температуры',
    indoorHumidityEntity: 'Датчик влажности',
    activePath: 'Активный путь (для подсветки)',
    buttonIcon: 'Иконка (mdi)',
    buttonImage: 'Картинка (URL, вместо иконки)',
    buttonLabel: 'Подпись',
    buttonPath: 'Путь (пусто = заглушка)',
    addButton: 'Добавить кнопку',
    conditions: {
      'clear-night': 'Ясно (ночь)',
      cloudy: 'Облачно',
      exceptional: 'Аномально',
      fog: 'Туман',
      hail: 'Град',
      lightning: 'Гроза',
      'lightning-rainy': 'Гроза с дождём',
      partlycloudy: 'Переменная облачность',
      pouring: 'Ливень',
      rainy: 'Дождь',
      snowy: 'Снег',
      'snowy-rainy': 'Снег с дождём',
      sunny: 'Солнечно',
      windy: 'Ветрено',
      'windy-variant': 'Сильный ветер',
    },
  },
  en: {
    humidity: 'Humidity',
    pressure: 'Pressure',
    pressureUnit: 'mmHg',
    today: 'Today',
    tomorrow: 'Tomorrow',
    general: 'General',
    backgroundAndFont: 'Background & font',
    clock: 'Clock',
    outdoor: 'Outdoor',
    forecast: 'Forecast',
    indoor: 'Indoor',
    buttons: 'Buttons',
    width: 'Width (px)',
    height: 'Height (px)',
    locale: 'Language',
    localeAuto: 'Same as Home Assistant',
    backgroundImage: 'Background image (URL)',
    backgroundOpacity: 'Background opacity (0–1)',
    fontFamily: 'Font family',
    customFontUrl: 'Font URL (@font-face)',
    enabled: 'Enabled',
    x: 'X (px)',
    y: 'Y (px)',
    color: 'Color',
    inheritColor: 'Reset (inherit color)',
    align: 'Alignment',
    alignLeft: 'Left',
    alignCenter: 'Center',
    alignRight: 'Right',
    showTime: 'Show time',
    showDate: 'Show date',
    showWeekday: 'Show weekday',
    timeSize: 'Time size (px)',
    dateSize: 'Date size (px)',
    timeWeight: 'Time font weight',
    weatherEntity: 'Weather entity',
    tempEntity: 'Temperature sensor (empty = from weather)',
    humidityEntity: 'Humidity sensor (empty = from weather)',
    pressureEntity: 'Pressure sensor (empty = from weather)',
    showTemp: 'Show temperature',
    showHumidity: 'Show humidity',
    showPressure: 'Show pressure',
    showIcon: 'Show icon',
    tempSize: 'Temperature size (px)',
    valueSize: 'Value size (px)',
    iconSize: 'Icon size (px)',
    iconOverride: 'Custom weather images (URL per state)',
    days: 'Days (1–7)',
    daySize: 'Day label size (px)',
    showMin: 'Show minimum',
    forecastEntity: 'Weather entity (empty = same as outdoor)',
    indoorTempEntity: 'Temperature sensor',
    indoorHumidityEntity: 'Humidity sensor',
    activePath: 'Active path (for highlighting)',
    buttonIcon: 'Icon (mdi)',
    buttonImage: 'Image (URL, instead of icon)',
    buttonLabel: 'Label',
    buttonPath: 'Path (empty = placeholder)',
    addButton: 'Add button',
    conditions: {
      'clear-night': 'Clear (night)',
      cloudy: 'Cloudy',
      exceptional: 'Exceptional',
      fog: 'Fog',
      hail: 'Hail',
      lightning: 'Lightning',
      'lightning-rainy': 'Lightning rain',
      partlycloudy: 'Partly cloudy',
      pouring: 'Pouring',
      rainy: 'Rain',
      snowy: 'Snow',
      'snowy-rainy': 'Snow and rain',
      sunny: 'Sunny',
      windy: 'Windy',
      'windy-variant': 'Windy variant',
    },
  },
};

export type StringKey = Exclude<keyof Dictionary, 'conditions'>;

export function resolveLang(locale: string | undefined, hassLang: string | undefined): Lang {
  const value = locale && locale !== 'auto' ? locale : hassLang;
  return (value ?? 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export function localize(lang: Lang, key: StringKey): string {
  return STRINGS[lang][key];
}

export function conditionLabel(lang: Lang, key: WeatherConditionKey): string {
  return STRINGS[lang].conditions[key];
}
```

- [ ] **Step 4: Запустить тесты — должны пройти**

Run: `npx vitest run tests/localize.test.ts`
Expected: `6 passed`.

- [ ] **Step 5: Коммит**

```bash
git add src/localize.ts tests/localize.test.ts
git commit -m "feat: add RU/EN localization"
```

---

### Task 5: Иконки погоды и резолвер

**Files:**
- Create: `src/assets/weather/sunny.svg`, `clear-night.svg`, `cloudy.svg`, `partlycloudy.svg`, `rainy.svg`, `pouring.svg`, `snowy.svg`, `snowy-rainy.svg`, `hail.svg`, `lightning.svg`, `lightning-rainy.svg`, `fog.svg`, `windy.svg`, `windy-variant.svg`, `exceptional.svg`
- Create: `src/assets.ts`
- Test: `tests/assets.test.ts`

**Interfaces:**
- Consumes: `WeatherConditionKey` из `src/types.ts`, `normalizeCondition` из `src/utils.ts`.
- Produces:
  - `WEATHER_ICONS: Record<WeatherConditionKey, string>`
  - `CONDITION_KEYS: readonly WeatherConditionKey[]`
  - `weatherIcon(condition: unknown, overrides?: Record<string, string>): string`
  - `handleIconError(ev: Event): void`

- [ ] **Step 1: Написать падающий тест**

`tests/assets.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CONDITION_KEYS, WEATHER_ICONS, weatherIcon } from '../src/assets';

describe('weather icons', () => {
  it('has an icon for every condition', () => {
    expect(CONDITION_KEYS).toHaveLength(15);
    for (const key of CONDITION_KEYS) {
      expect(typeof WEATHER_ICONS[key]).toBe('string');
      expect(WEATHER_ICONS[key].length).toBeGreaterThan(0);
    }
  });

  it('returns default icon for a condition', () => {
    expect(weatherIcon('sunny')).toBe(WEATHER_ICONS.sunny);
  });

  it('prefers overrides', () => {
    expect(weatherIcon('sunny', { sunny: '/local/custom.png' })).toBe('/local/custom.png');
  });

  it('falls back to exceptional for unknown condition', () => {
    expect(weatherIcon('wat')).toBe(WEATHER_ICONS.exceptional);
  });
});
```

- [ ] **Step 2: Запустить тест — должен упасть**

Run: `npx vitest run tests/assets.test.ts`
Expected: FAIL — `Failed to resolve import "../src/assets"`.

- [ ] **Step 3: Создать SVG-файлы**

`src/assets/weather/sunny.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="13" fill="#FFC107"/><g stroke="#FFC107" stroke-width="4" stroke-linecap="round"><path d="M32 6v7M32 51v7M6 32h7M51 32h7M13.6 13.6l5 5M45.4 45.4l5 5M13.6 50.4l5-5M45.4 18.6l5-5"/></g></svg>
```

`src/assets/weather/clear-night.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M42 10a24 24 0 1 0 12 34A26 26 0 0 1 42 10z" fill="#B0BEC5"/><circle cx="48" cy="14" r="2.5" fill="#E3F2FD"/></svg>
```

`src/assets/weather/cloudy.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M18 44a10 10 0 0 1-1-20 14 14 0 0 1 27-2 9 9 0 0 1 4 22z" fill="#90A4AE"/><path d="M22 56a7 7 0 0 1-1-14 10 10 0 0 1 19-2 6 6 0 0 1 3 16z" fill="#CFD8DC"/></svg>
```

`src/assets/weather/partlycloudy.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="22" cy="22" r="10" fill="#FFC107"/><path d="M24 48a9 9 0 0 1-1-18 12 12 0 0 1 23-2 8 8 0 0 1 4 20z" fill="#ECEFF1"/></svg>
```

`src/assets/weather/rainy.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 38a9 9 0 0 1-1-18 13 13 0 0 1 25-2 8 8 0 0 1 4 20z" fill="#90A4AE"/><g stroke="#42A5F5" stroke-width="4" stroke-linecap="round"><path d="M20 46l-3 9M32 46l-3 9M44 46l-3 9"/></g></svg>
```

`src/assets/weather/pouring.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 38a9 9 0 0 1-1-18 13 13 0 0 1 25-2 8 8 0 0 1 4 20z" fill="#78909C"/><g stroke="#1E88E5" stroke-width="4" stroke-linecap="round"><path d="M16 44l-4 12M28 44l-4 12M40 44l-4 12M50 44l-4 12"/></g></svg>
```

`src/assets/weather/snowy.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 38a9 9 0 0 1-1-18 13 13 0 0 1 25-2 8 8 0 0 1 4 20z" fill="#B0BEC5"/><g fill="#E3F2FD"><circle cx="20" cy="50" r="3"/><circle cx="32" cy="54" r="3"/><circle cx="44" cy="50" r="3"/><circle cx="52" cy="58" r="2"/></g></svg>
```

`src/assets/weather/snowy-rainy.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 38a9 9 0 0 1-1-18 13 13 0 0 1 25-2 8 8 0 0 1 4 20z" fill="#90A4AE"/><path d="M22 46l-3 9" stroke="#42A5F5" stroke-width="4" stroke-linecap="round"/><g fill="#E3F2FD"><circle cx="34" cy="50" r="3"/><circle cx="46" cy="54" r="3"/></g></svg>
```

`src/assets/weather/hail.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 38a9 9 0 0 1-1-18 13 13 0 0 1 25-2 8 8 0 0 1 4 20z" fill="#90A4AE"/><g fill="#E3F2FD"><circle cx="20" cy="50" r="3"/><circle cx="32" cy="55" r="3"/><circle cx="44" cy="50" r="3"/></g><g fill="#42A5F5"><circle cx="26" cy="60" r="2.5"/><circle cx="38" cy="60" r="2.5"/></g></svg>
```

`src/assets/weather/lightning.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 34a9 9 0 0 1-1-18 13 13 0 0 1 25-2 8 8 0 0 1 4 20z" fill="#78909C"/><path d="M34 36l-9 13h7l-4 11 13-16h-7l5-8z" fill="#FFC107"/></svg>
```

`src/assets/weather/lightning-rainy.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 34a9 9 0 0 1-1-18 13 13 0 0 1 25-2 8 8 0 0 1 4 20z" fill="#78909C"/><path d="M33 36l-8 12h6l-3 10 11-14h-6l4-8z" fill="#FFC107"/><path d="M18 44l-3 9M48 44l-3 9" stroke="#42A5F5" stroke-width="4" stroke-linecap="round"/></svg>
```

`src/assets/weather/fog.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 32a9 9 0 0 1-1-18 13 13 0 0 1 25-2 8 8 0 0 1 4 20z" fill="#B0BEC5"/><g stroke="#CFD8DC" stroke-width="4" stroke-linecap="round"><path d="M12 44h40M18 52h28M24 60h16"/></g></svg>
```

`src/assets/weather/windy.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g stroke="#90A4AE" stroke-width="4" stroke-linecap="round" fill="none"><path d="M12 22h28a6 6 0 1 0-6-6"/><path d="M12 34h38a6 6 0 1 1-6 6"/><path d="M12 46h22"/></g></svg>
```

`src/assets/weather/windy-variant.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 34a9 9 0 0 1-1-18 13 13 0 0 1 25-2 8 8 0 0 1 4 20z" fill="#90A4AE"/><g stroke="#CFD8DC" stroke-width="4" stroke-linecap="round" fill="none"><path d="M14 44h30a5 5 0 1 0-5-5"/><path d="M14 54h22"/></g></svg>
```

`src/assets/weather/exceptional.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 8l26 46H6z" fill="#FFC107"/><path d="M32 24v14" stroke="#3E2723" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="45" r="3" fill="#3E2723"/></svg>
```

- [ ] **Step 4: Создать `src/assets.ts`**

```ts
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
```

- [ ] **Step 5: Запустить тесты — должны пройти**

Run: `npx vitest run tests/assets.test.ts`
Expected: `4 passed`.

- [ ] **Step 6: Коммит**

```bash
git add src/assets.ts src/assets/weather tests/assets.test.ts
git commit -m "feat: add built-in weather SVG icons and resolver"
```

---

### Task 6: Каркас карточки, блок часов, регистрация, dev-страница

**Files:**
- Create: `src/card.ts`
- Create: `src/blocks/clock.ts`
- Modify: `src/main.ts`
- Create: `dev/index.html`
- Create: `dev/demo.ts`
- Create: `vite.dev.config.ts`

**Interfaces:**
- Consumes: `mergeConfig`, `resolveLang`, `ensureCustomFont`, `formatTime`, `formatDate`, `weekdayLong`, типы.
- Produces:
  - `NSPanelWeatherCard` (класс) и элемент `nspanel-weather-card`
  - `NSPanelClock` и элемент `nspanel-clock` c reactive-свойствами `config: ClockConfig`, `lang: Lang`, `hour12: boolean`
  - `src/main.ts` регистрирует элементы и `window.customCards`
  - `npm run dev` открывает демо-страницу с фейковым `hass`

- [ ] **Step 1: Создать блок часов `src/blocks/clock.ts`**

```ts
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
  hour12 = false;

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
```

- [ ] **Step 2: Создать `src/card.ts`**

```ts
import { LitElement, html, nothing } from 'lit';
import type { Align, HomeAssistant, NSPanelCardConfig } from './types';
import { mergeConfig } from './defaults';
import { resolveLang } from './localize';
import { ensureCustomFont } from './utils';
import './blocks/clock';

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
      </div>
    `;
  }
}
```

- [ ] **Step 3: Зарегистрировать элементы в `src/main.ts`**

```ts
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
```

**Важно:** `./editor` появится в Task 11. Чтобы сборка в этом задании проходила, временно создай `src/editor.ts` с заглушкой класса и замени его содержимое в Task 11:

```ts
import { LitElement } from 'lit';
import type { HomeAssistant, NSPanelCardConfig } from './types';

export class NSPanelWeatherCardEditor extends LitElement {
  setConfig(_config: Partial<NSPanelCardConfig>): void {}
  set hass(_hass: HomeAssistant) {}
}
```

- [ ] **Step 4: Создать dev-страницу**

`vite.dev.config.ts`:

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'dev',
});
```

`dev/index.html`:

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>NSPanel Weather Card — dev</title>
    <style>
      body { background: #222; color: #eee; font-family: sans-serif; padding: 20px; display: flex; gap: 40px; align-items: flex-start; }
      h2 { font-size: 14px; opacity: 0.7; font-weight: 400; }
    </style>
  </head>
  <body>
    <div>
      <h2>Card</h2>
      <div id="root"></div>
    </div>
    <div>
      <h2>Editor</h2>
      <div id="editor-root"></div>
    </div>
    <script type="module" src="./demo.ts"></script>
  </body>
</html>
```

`dev/demo.ts`:

```ts
import '../src/main.ts';

class HaIconStub extends HTMLElement {
  private _icon = '';
  set icon(value: string) {
    this._icon = value;
    this.textContent = '◉';
    this.title = value;
  }
  get icon(): string {
    return this._icon;
  }
}

if (!customElements.get('ha-icon')) {
  customElements.define('ha-icon', HaIconStub);
}

const tomorrow = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

const demoForecast = [
  { datetime: tomorrow(0), condition: 'partlycloudy', temperature: 9, templow: 3 },
  { datetime: tomorrow(1), condition: 'rainy', temperature: 7, templow: 2 },
  { datetime: tomorrow(2), condition: 'sunny', temperature: 12, templow: 4 },
  { datetime: tomorrow(3), condition: 'snowy', temperature: 1, templow: -4 },
];

const hass: Record<string, unknown> = {
  locale: { language: 'ru', time_format: '24' },
  states: {
    'weather.home': {
      entity_id: 'weather.home',
      state: 'partlycloudy',
      attributes: { temperature: 8.3, humidity: 72, pressure: 1012 },
    },
    'sensor.indoor_temperature': {
      entity_id: 'sensor.indoor_temperature',
      state: '21.4',
      attributes: { unit_of_measurement: '°C' },
    },
    'sensor.indoor_humidity': {
      entity_id: 'sensor.indoor_humidity',
      state: '45',
      attributes: { unit_of_measurement: '%' },
    },
  },
  connection: {
    subscribeMessage: async (callback: (message: unknown) => void) => {
      callback({ forecast: demoForecast });
      return async () => {};
    },
  },
  callWS: async () => ({ forecast: demoForecast }),
};

const card = document.createElement('nspanel-weather-card') as HTMLElement & {
  setConfig: (config: unknown) => void;
  hass: unknown;
};
card.setConfig({});
card.hass = hass;
document.getElementById('root')!.append(card);
```

- [ ] **Step 5: Проверить сборку и dev-страницу**

Run: `npm run build`
Expected: сборка успешна, `dist/nspanel-weather-card.js` создан.

Run: `npm run dev`
Expected: браузер открывает демо-страницу; видна карточка 480×480 на тёмном фоне, часы показывают время и строку «Воскресенье, 15 ноября»-подобную, время обновляется каждую секунду. Закрыть сервер (Ctrl+C).

- [ ] **Step 6: Коммит**

```bash
git add src/card.ts src/blocks/clock.ts src/main.ts src/editor.ts dev vite.dev.config.ts
git commit -m "feat: add card shell, clock block and dev playground"
```

---

### Task 7: Блок «Улица»

**Files:**
- Create: `src/blocks/outdoor.ts`
- Modify: `src/card.ts` (импорт + рендер)

**Interfaces:**
- Consumes: `OutdoorConfig`, `HassEntity`, `HomeAssistant`, `Lang`, `localize`, `convertPressure`, `formatPressure`, `formatTemp`, `weatherIcon`, `WEATHER_ICONS`, `handleIconError`.
- Produces: `NSPanelOutdoor`, элемент `nspanel-outdoor` c reactive-свойствами `config: OutdoorConfig`, `hass?: HomeAssistant`, `lang: Lang`.

- [ ] **Step 1: Создать `src/blocks/outdoor.ts`**

```ts
import { LitElement, html, nothing } from 'lit';
import type { HassEntity, HomeAssistant, OutdoorConfig } from '../types';
import type { Lang } from '../localize';
import { localize } from '../localize';
import { convertPressure, formatPressure, formatTemp } from '../utils';
import { handleIconError, weatherIcon } from '../assets';

export class NSPanelOutdoor extends LitElement {
  static properties = {
    config: { attribute: false },
    hass: { attribute: false },
    lang: { attribute: false },
  };

  config!: OutdoorConfig;
  hass?: HomeAssistant;
  lang: Lang = 'en';

  private _value(overrideEntity: string, attr: string, weather?: HassEntity): number | undefined {
    if (overrideEntity) {
      const state = this.hass?.states[overrideEntity];
      const parsed = state ? parseFloat(state.state) : NaN;
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    const value = weather?.attributes?.[attr];
    return typeof value === 'number' ? value : undefined;
  }

  private _pressure(weather?: HassEntity): number | undefined {
    const id = this.config.pressure_entity;
    if (id) {
      const state = this.hass?.states[id];
      const parsed = state ? parseFloat(state.state) : NaN;
      if (Number.isNaN(parsed)) return undefined;
      const unit = state?.attributes?.unit_of_measurement;
      return convertPressure(parsed, typeof unit === 'string' ? unit : undefined);
    }
    const value = weather?.attributes?.pressure;
    return typeof value === 'number' ? convertPressure(value, 'hPa') : undefined;
  }

  protected render() {
    if (!this.config) return nothing;
    const c = this.config;
    const weather = c.weather_entity ? this.hass?.states[c.weather_entity] : undefined;
    const temp = this._value(c.temp_entity, 'temperature', weather);
    const humidity = this._value(c.humidity_entity, 'humidity', weather);
    const pressure = this._pressure(weather);
    const icon = weatherIcon(weather?.state, c.icon_override);
    return html`
      <style>
        :host { display: block; }
        .main { display: flex; align-items: center; gap: 12px; }
        .temp { font-size: ${c.temp_size}px; font-weight: 300; line-height: 1; }
        .icon { width: ${c.icon_size}px; height: ${c.icon_size}px; }
        .values { display: flex; flex-direction: column; gap: 4px; font-size: ${c.value_size}px; margin-top: 6px; }
      </style>
      <div style="color:${c.color || 'inherit'}">
        <div class="main">
          ${c.show_temp ? html`<div class="temp">${temp !== undefined ? `${formatTemp(temp)}°` : '—'}</div>` : nothing}
          ${c.show_icon ? html`<img class="icon" src=${icon} alt="" @error=${handleIconError} />` : nothing}
        </div>
        <div class="values">
          ${c.show_humidity
            ? html`<div>${localize(this.lang, 'humidity')}: ${humidity !== undefined ? `${Math.round(humidity)}%` : '—'}</div>`
            : nothing}
          ${c.show_pressure
            ? html`<div>${localize(this.lang, 'pressure')}: ${pressure !== undefined ? `${formatPressure(pressure)} ${localize(this.lang, 'pressureUnit')}` : '—'}</div>`
            : nothing}
        </div>
      </div>
    `;
  }
}
```

- [ ] **Step 2: Подключить блок в карточке**

В `src/card.ts` добавить импорт рядом с `import './blocks/clock';`:

```ts
import './blocks/outdoor';
```

В `render()` после блока часов добавить:

```ts
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
```

- [ ] **Step 3: Проверить на dev-странице**

Run: `npm run dev`
Expected: под часами видны «8.3°», иконка переменной облачности, «Влажность: 72%», «Давление: 759.1 мм рт. ст.» (1012 × 0.750061683 ≈ 759.1). Кнопки/остальные блоки пока отсутствуют — это ожидаемо.

- [ ] **Step 4: Коммит**

```bash
git add src/blocks/outdoor.ts src/card.ts
git commit -m "feat: add outdoor weather block"
```

---

### Task 8: Блок «Помещение»

**Files:**
- Create: `src/blocks/indoor.ts`
- Modify: `src/card.ts` (импорт + рендер)

**Interfaces:**
- Consumes: `IndoorConfig`, `HomeAssistant`, `Lang`, `localize`, `formatTemp`.
- Produces: `NSPanelIndoor`, элемент `nspanel-indoor` c reactive-свойствами `config: IndoorConfig`, `hass?: HomeAssistant`, `lang: Lang`.

- [ ] **Step 1: Создать `src/blocks/indoor.ts`**

```ts
import { LitElement, html, nothing } from 'lit';
import type { HomeAssistant, IndoorConfig } from '../types';
import type { Lang } from '../localize';
import { localize } from '../localize';
import { formatTemp } from '../utils';

export class NSPanelIndoor extends LitElement {
  static properties = {
    config: { attribute: false },
    hass: { attribute: false },
    lang: { attribute: false },
  };

  config!: IndoorConfig;
  hass?: HomeAssistant;
  lang: Lang = 'en';

  private _sensor(entityId: string): number | undefined {
    if (!entityId) return undefined;
    const state = this.hass?.states[entityId];
    const parsed = state ? parseFloat(state.state) : NaN;
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  protected render() {
    if (!this.config) return nothing;
    const c = this.config;
    const temp = this._sensor(c.temp_entity);
    const humidity = this._sensor(c.humidity_entity);
    return html`
      <style>
        :host { display: block; }
        .temp { font-size: ${c.temp_size}px; font-weight: 300; line-height: 1; }
        .values { margin-top: 6px; font-size: ${c.value_size}px; }
      </style>
      <div style="color:${c.color || 'inherit'};text-align:right">
        <div class="temp">${temp !== undefined ? `${formatTemp(temp)}°` : '—'}</div>
        ${c.show_humidity
          ? html`<div class="values">${localize(this.lang, 'humidity')}: ${humidity !== undefined ? `${Math.round(humidity)}%` : '—'}</div>`
          : nothing}
      </div>
    `;
  }
}
```

- [ ] **Step 2: Подключить блок в карточке**

В `src/card.ts` добавить импорт:

```ts
import './blocks/indoor';
```

В `render()` после блока улицы добавить:

```ts
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
```

- [ ] **Step 3: Проверить на dev-странице**

Run: `npm run dev`
Expected: справа от улицы — «—» в темпе, «Влажность: —» (датчики в демо-конфиге не заданы). Временно задай в `dev/demo.ts` при создании карточки:

```ts
card.setConfig({
  blocks: {
    indoor: {
      temp_entity: 'sensor.indoor_temperature',
      humidity_entity: 'sensor.indoor_humidity',
    },
  },
});
```

Ожидание: «21.4°» и «Влажность: 45%». После проверки верни `card.setConfig({});`.

- [ ] **Step 4: Коммит**

```bash
git add src/blocks/indoor.ts src/card.ts
git commit -m "feat: add indoor temperature block"
```

---

### Task 9: Блок «Прогноз» и подписка на forecast

**Files:**
- Create: `src/blocks/forecast.ts`
- Modify: `src/card.ts` (импорт, поля подписки, рендер)

**Interfaces:**
- Consumes: `ForecastConfig`, `ForecastDay`, `Lang`, `localize`, `formatTemp`, `weekdayShort`, `buildForecast`, `weatherIcon`, `handleIconError`, `HomeAssistant.connection`.
- Produces: `NSPanelForecast`, элемент `nspanel-forecast` c reactive-свойствами `config: ForecastConfig`, `forecast: ForecastDay[]`, `lang: Lang`, `iconOverride: Record<string, string>`.

- [ ] **Step 1: Создать `src/blocks/forecast.ts`**

```ts
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
```

- [ ] **Step 2: Добавить подписку в `src/card.ts`**

Добавить импорты:

```ts
import type { ForecastDay } from './types';
import { buildForecast } from './utils';
import './blocks/forecast';
```

Добавить константу на уровне модуля:

```ts
const FORECAST_REFRESH_MS = 30 * 60 * 1000;
```

Добавить приватные поля в класс (рядом с `_hass`):

```ts
  private _forecast: ForecastDay[] = [];
  private _unsubForecast?: () => void;
  private _forecastKey = '';
  private _forecastTimer?: number;
```

Заменить сеттер `hass` и `setConfig`, добавить методы:

```ts
  setConfig(config: Partial<NSPanelCardConfig>): void {
    this._config = mergeConfig(config);
    this._ensureForecast();
    this.requestUpdate();
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
  }

  private _ensureForecast(): void {
    const c = this._config.blocks.forecast;
    if (!c.enabled) {
      this._stopForecast();
      this._forecast = [];
      return;
    }
    const entity = this._forecastEntity();
    if (!entity || !this._hass) return;
    const key = `${entity}|${c.days}`;
    if (key === this._forecastKey) return;
    this._stopForecast();
    this._forecastKey = key;
    const connection = this._hass.connection;
    if (!connection?.subscribeMessage) {
      this._forecastFromAttributes();
      return;
    }
    connection
      .subscribeMessage<{ forecast?: unknown }>(
        (message) => {
          this._forecast = buildForecast(message.forecast, c.days);
          this.requestUpdate();
        },
        { type: 'weather/subscribe_forecast', entity_id: entity, forecast_type: 'daily' },
      )
      .then((unsub) => {
        this._unsubForecast = () => {
          void unsub();
        };
      })
      .catch(() => {
        this._forecastKey = '';
        this._forecastFromAttributes();
      });
  }

  private _forecastFromAttributes(): void {
    const entity = this._forecastEntity();
    const attributes = entity ? this._hass?.states[entity]?.attributes : undefined;
    this._forecast = buildForecast(attributes?.forecast, this._config.blocks.forecast.days);
  }
```

- [ ] **Step 3: Отрендерить блок в карточке**

В `render()` после блока помещения добавить:

```ts
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
```

- [ ] **Step 4: Проверить на dev-странице**

Run: `npm run dev`
Expected: под блоком улицы виден ряд из 4 ячеек: «Сегодня», «Завтра», затем сокращённые дни недели; иконки и температуры `9° / 3°`, `7° / 2°` и т.д. (данные из демо-подписки).

- [ ] **Step 5: Коммит**

```bash
git add src/blocks/forecast.ts src/card.ts
git commit -m "feat: add forecast block with websocket subscription"
```

---

### Task 10: Блок «Кнопки»

**Files:**
- Create: `src/blocks/buttons.ts`
- Modify: `src/card.ts` (импорт + рендер)

**Interfaces:**
- Consumes: `ButtonsConfig`, `ButtonItem`.
- Produces: `NSPanelButtons`, элемент `nspanel-buttons` c reactive-свойством `config: ButtonsConfig`.

- [ ] **Step 1: Создать `src/blocks/buttons.ts`**

```ts
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
```

- [ ] **Step 2: Подключить блок в карточке**

В `src/card.ts` добавить импорт:

```ts
import './blocks/buttons';
```

В `render()` после блока прогноза добавить:

```ts
        ${c.blocks.buttons.enabled
          ? this._block(
              c.blocks.buttons,
              html`<nspanel-buttons .config=${c.blocks.buttons}></nspanel-buttons>`,
            )
          : nothing}
```

- [ ] **Step 3: Проверить на dev-странице**

Run: `npm run dev`
Expected: внизу две полупрозрачные кнопки «Погода» и «Климат» (иконки-заглушки ◉). Клик ничего не делает (пустой path). Задай в демо `path: '/weather'` первой кнопке через `card.setConfig({ blocks: { buttons: { items: [{ icon: 'mdi:weather-partly-cloudy', image: '', label: 'Погода', path: '/weather', enabled: true }] } } })` — клик меняет URL на `/weather`; в консоли нет ошибок.

- [ ] **Step 4: Коммит**

```bash
git add src/blocks/buttons.ts src/card.ts
git commit -m "feat: add bottom navigation buttons block"
```

---

### Task 11: Визуальный редактор

**Files:**
- Modify: `src/editor.ts` (заменить заглушку)
- Modify: `dev/demo.ts` (подключить редактор и заглушку `ha-form`)

**Interfaces:**
- Consumes: `NSPanelCardConfig`, `BlocksConfig`, `HomeAssistant`, `mergeConfig`, `resolveLang`, `localize`, `conditionLabel`, `hexToRgb`, `rgbToHex`, `CONDITION_KEYS`.
- Produces: `NSPanelWeatherCardEditor`, элемент `nspanel-weather-card-editor`; событие `config-changed` с `detail.config: NSPanelCardConfig`.

- [ ] **Step 1: Заменить `src/editor.ts`**

```ts
import { LitElement, html, nothing } from 'lit';
import type { BlocksConfig, ButtonItem, HomeAssistant, NSPanelCardConfig } from './types';
import { mergeConfig } from './defaults';
import { conditionLabel, localize, resolveLang, type Lang, type StringKey } from './localize';
import { hexToRgb, rgbToHex } from './utils';
import { CONDITION_KEYS } from './assets';

function fireEvent(node: EventTarget, type: string, detail?: unknown): void {
  node.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}

type FormValue = Record<string, unknown>;

export class NSPanelWeatherCardEditor extends LitElement {
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

  private get _lang(): Lang {
    return resolveLang(this._config.locale, this._hass?.locale?.language);
  }

  private _t(key: StringKey): string {
    return localize(this._lang, key);
  }

  private _updateConfig(patch: Partial<NSPanelCardConfig>): void {
    this._config = mergeConfig({ ...this._config, ...patch });
    fireEvent(this, 'config-changed', { config: this._config });
    this.requestUpdate();
  }

  private _updateBlock<K extends keyof BlocksConfig>(key: K, value: Partial<BlocksConfig[K]>): void {
    const blocks = { ...this._config.blocks, [key]: { ...this._config.blocks[key], ...value } };
    this._updateConfig({ blocks });
  }

  private _form(schema: unknown[], data: object, onChange: (value: any) => void) {
    return html`
      <ha-form
        .hass=${this._hass}
        .schema=${schema}
        .data=${data}
        .computeLabel=${(s: { label?: string; name?: string }) => s.label ?? s.name ?? ''}
        @value-changed=${(ev: CustomEvent<{ value: FormValue }>) => onChange(ev.detail.value)}
      ></ha-form>
    `;
  }

  private _colorRow(current: string, apply: (hex: string) => void) {
    const schema = [{ name: 'color', label: this._t('color'), selector: { color_rgb: {} } }];
    const data = { color: hexToRgb(current) ?? [255, 255, 255] };
    return html`
      <div class="color-row">
        ${this._form(schema, data, (value) => apply(rgbToHex(value.color)))}
        <button type="button" title=${this._t('inheritColor')} @click=${() => apply('')}>↺</button>
      </div>
    `;
  }

  private _section(title: string, open: boolean, content: unknown) {
    return html`
      <details ?open=${open}>
        <summary>${title}</summary>
        <div class="body">${content}</div>
      </details>
    `;
  }

  private _number(name: string, label: StringKey, min: number, max: number, step?: number) {
    const selector = step
      ? { number: { min, max, step, mode: 'box' } }
      : { number: { min, max, mode: 'box' } };
    return { name, label: this._t(label), selector };
  }

  private _flag(name: string, label: StringKey) {
    return { name, label: this._t(label), selector: { boolean: {} } };
  }

  private _generalForm() {
    const c = this._config;
    const schema = [
      this._number('width', 'width', 64, 1024),
      this._number('height', 'height', 64, 1024),
      {
        name: 'locale',
        label: this._t('locale'),
        selector: {
          select: {
            options: [
              { value: 'auto', label: this._t('localeAuto') },
              { value: 'ru', label: 'Русский' },
              { value: 'en', label: 'English' },
            ],
          },
        },
      },
    ];
    return this._form(schema, { width: c.width, height: c.height, locale: c.locale }, (value) =>
      this._updateConfig(value),
    );
  }

  private _backgroundFontForm() {
    const c = this._config;
    const backgroundSchema = [
      { name: 'image', label: this._t('backgroundImage'), selector: { text: {} } },
      this._number('opacity', 'backgroundOpacity', 0, 1, 0.05),
    ];
    const fontSchema = [
      { name: 'family', label: this._t('fontFamily'), selector: { text: {} } },
      { name: 'custom_font_url', label: this._t('customFontUrl'), selector: { text: {} } },
    ];
    return html`
      ${this._form(backgroundSchema, { image: c.background.image, opacity: c.background.opacity }, (value) =>
        this._updateConfig({ background: { ...c.background, ...(value as object) } }),
      )}
      ${this._colorRow(c.background.color, (hex) =>
        this._updateConfig({ background: { ...this._config.background, color: hex } }),
      )}
      ${this._form(fontSchema, { family: c.font.family, custom_font_url: c.font.custom_font_url }, (value) =>
        this._updateConfig({ font: { ...c.font, ...(value as object) } }),
      )}
      ${this._colorRow(c.font.color, (hex) => this._updateConfig({ font: { ...this._config.font, color: hex } }))}
    `;
  }

  private _baseBlockSchema(block: { enabled: boolean; x: number; y: number }) {
    return [
      this._flag('enabled', 'enabled'),
      this._number('x', 'x', 0, 1024),
      this._number('y', 'y', 0, 1024),
    ];
  }

  private _clockForm() {
    const clock = this._config.blocks.clock;
    const schema = [
      ...this._baseBlockSchema(clock),
      {
        name: 'align',
        label: this._t('align'),
        selector: {
          select: {
            options: [
              { value: 'left', label: this._t('alignLeft') },
              { value: 'center', label: this._t('alignCenter') },
              { value: 'right', label: this._t('alignRight') },
            ],
          },
        },
      },
      this._flag('show_time', 'showTime'),
      this._flag('show_date', 'showDate'),
      this._flag('show_weekday', 'showWeekday'),
      this._number('time_size', 'timeSize', 8, 200),
      this._number('date_size', 'dateSize', 8, 100),
      this._number('time_weight', 'timeWeight', 100, 900, 100),
    ];
    return html`
      ${this._form(schema, clock, (value) => this._updateBlock('clock', value))}
      ${this._colorRow(clock.color, (hex) => this._updateBlock('clock', { color: hex }))}
    `;
  }

  private _outdoorForm() {
    const outdoor = this._config.blocks.outdoor;
    const schema = [
      ...this._baseBlockSchema(outdoor),
      { name: 'weather_entity', label: this._t('weatherEntity'), selector: { entity: { domain: ['weather'] } } },
      { name: 'temp_entity', label: this._t('tempEntity'), selector: { entity: { domain: ['sensor'] } } },
      { name: 'humidity_entity', label: this._t('humidityEntity'), selector: { entity: { domain: ['sensor'] } } },
      { name: 'pressure_entity', label: this._t('pressureEntity'), selector: { entity: { domain: ['sensor'] } } },
      this._flag('show_temp', 'showTemp'),
      this._flag('show_humidity', 'showHumidity'),
      this._flag('show_pressure', 'showPressure'),
      this._flag('show_icon', 'showIcon'),
      this._number('temp_size', 'tempSize', 8, 200),
      this._number('value_size', 'valueSize', 8, 100),
      this._number('icon_size', 'iconSize', 8, 300),
    ];
    const iconSchema = CONDITION_KEYS.map((key) => ({
      name: key,
      label: conditionLabel(this._lang, key),
      selector: { text: {} },
    }));
    return html`
      ${this._form(schema, outdoor, (value) => this._updateBlock('outdoor', value))}
      ${this._colorRow(outdoor.color, (hex) => this._updateBlock('outdoor', { color: hex }))}
      <details>
        <summary>${this._t('iconOverride')}</summary>
        ${this._form(iconSchema, outdoor.icon_override, (value) => {
          const clean: Record<string, string> = {};
          for (const [key, url] of Object.entries(value)) {
            if (typeof url === 'string' && url.trim()) clean[key] = url.trim();
          }
          this._updateBlock('outdoor', { icon_override: clean });
        })}
      </details>
    `;
  }

  private _forecastForm() {
    const forecast = this._config.blocks.forecast;
    const schema = [
      ...this._baseBlockSchema(forecast),
      { name: 'weather_entity', label: this._t('forecastEntity'), selector: { entity: { domain: ['weather'] } } },
      this._number('days', 'days', 1, 7),
      this._number('icon_size', 'iconSize', 8, 300),
      this._number('day_size', 'daySize', 8, 100),
      this._number('temp_size', 'tempSize', 8, 100),
      this._flag('show_min', 'showMin'),
    ];
    return html`
      ${this._form(schema, forecast, (value) => this._updateBlock('forecast', value))}
      ${this._colorRow(forecast.color, (hex) => this._updateBlock('forecast', { color: hex }))}
    `;
  }

  private _indoorForm() {
    const indoor = this._config.blocks.indoor;
    const schema = [
      ...this._baseBlockSchema(indoor),
      { name: 'temp_entity', label: this._t('indoorTempEntity'), selector: { entity: { domain: ['sensor'] } } },
      {
        name: 'humidity_entity',
        label: this._t('indoorHumidityEntity'),
        selector: { entity: { domain: ['sensor'] } },
      },
      this._flag('show_humidity', 'showHumidity'),
      this._number('temp_size', 'tempSize', 8, 200),
      this._number('value_size', 'valueSize', 8, 100),
    ];
    return html`
      ${this._form(schema, indoor, (value) => this._updateBlock('indoor', value))}
      ${this._colorRow(indoor.color, (hex) => this._updateBlock('indoor', { color: hex }))}
    `;
  }

  private _updateButtonItem(index: number, value: Partial<ButtonItem>): void {
    const items = this._config.blocks.buttons.items.map((item, i) => (i === index ? { ...item, ...value } : item));
    this._updateBlock('buttons', { items });
  }

  private _moveButtonItem(index: number, delta: number): void {
    const items = [...this._config.blocks.buttons.items];
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    this._updateBlock('buttons', { items });
  }

  private _removeButtonItem(index: number): void {
    const items = this._config.blocks.buttons.items.filter((_, i) => i !== index);
    this._updateBlock('buttons', { items });
  }

  private _addButtonItem(): void {
    const items = [
      ...this._config.blocks.buttons.items,
      { icon: 'mdi:view-dashboard', image: '', label: '', path: '', enabled: true },
    ];
    this._updateBlock('buttons', { items });
  }

  private _buttonsForm() {
    const buttons = this._config.blocks.buttons;
    const schema = [
      ...this._baseBlockSchema(buttons),
      this._number('width', 'width', 64, 1024),
      this._number('height', 'height', 64, 1024),
      { name: 'active_path', label: this._t('activePath'), selector: { text: {} } },
    ];
    const itemSchema = [
      { name: 'icon', label: this._t('buttonIcon'), selector: { icon: {} } },
      { name: 'image', label: this._t('buttonImage'), selector: { text: {} } },
      { name: 'label', label: this._t('buttonLabel'), selector: { text: {} } },
      { name: 'path', label: this._t('buttonPath'), selector: { text: {} } },
      this._flag('enabled', 'enabled'),
    ];
    return html`
      ${this._form(schema, buttons, (value) => this._updateBlock('buttons', value))}
      ${this._colorRow(buttons.color, (hex) => this._updateBlock('buttons', { color: hex }))}
      ${buttons.items.map(
        (item, index) => html`
          <div class="item">
            ${this._form(itemSchema, item, (value) => this._updateButtonItem(index, value))}
            <div class="actions">
              <button type="button" @click=${() => this._moveButtonItem(index, -1)}>↑</button>
              <button type="button" @click=${() => this._moveButtonItem(index, 1)}>↓</button>
              <button type="button" @click=${() => this._removeButtonItem(index)}>✕</button>
            </div>
          </div>
        `,
      )}
      <button type="button" @click=${() => this._addButtonItem()}>+ ${this._t('addButton')}</button>
    `;
  }

  protected render() {
    return html`
      <style>
        :host { display: block; }
        details {
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 8px;
          margin-bottom: 8px;
          padding: 8px;
        }
        summary { cursor: pointer; font-weight: 600; }
        .body { padding-top: 8px; display: flex; flex-direction: column; gap: 8px; }
        .item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border: 1px dashed var(--divider-color, #ccc);
          border-radius: 6px;
          padding: 6px;
          margin-bottom: 6px;
        }
        .item .actions { display: flex; gap: 6px; }
        .color-row { display: flex; align-items: flex-end; gap: 6px; }
        .color-row ha-form { flex: 1; }
        button { cursor: pointer; background: var(--primary-color, #03a9f4); color: #fff; border: 0; border-radius: 4px; padding: 4px 8px; }
      </style>
      ${this._section(this._t('general'), true, this._generalForm())}
      ${this._section(this._t('backgroundAndFont'), false, this._backgroundFontForm())}
      ${this._section(this._t('clock'), false, this._clockForm())}
      ${this._section(this._t('outdoor'), false, this._outdoorForm())}
      ${this._section(this._t('forecast'), false, this._forecastForm())}
      ${this._section(this._t('indoor'), false, this._indoorForm())}
      ${this._section(this._t('buttons'), false, this._buttonsForm())}
    `;
  }
}
```

- [ ] **Step 2: Подключить редактор в dev-страницу**

В `dev/demo.ts` после создания карточки добавить:

```ts
class HaFormStub extends HTMLElement {
  private _data: FormValue = {};
  private _schema: Array<{ name?: string; label?: string; selector?: Record<string, unknown> }> = [];
  private _label?: (schema: unknown) => string;

  set data(value: FormValue) {
    this._data = value ?? {};
    this._render();
  }
  get data(): FormValue {
    return this._data;
  }
  set schema(value: typeof this._schema) {
    this._schema = value ?? [];
    this._render();
  }
  set computeLabel(fn: (schema: unknown) => string) {
    this._label = fn;
  }

  private _render(): void {
    this.innerHTML = '';
    for (const field of this._schema) {
      if (!field?.name) continue;
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.marginBottom = '4px';
      label.textContent = this._label?.(field) ?? field.name;
      const selector = field.selector ?? {};
      let input: HTMLInputElement;
      if ('boolean' in selector) {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!this._data[field.name];
        input.onchange = () => this._emit(field.name!, input.checked);
      } else if ('number' in selector) {
        input = document.createElement('input');
        input.type = 'number';
        input.value = String(this._data[field.name] ?? '');
        input.oninput = () => this._emit(field.name!, Number(input.value));
      } else {
        input = document.createElement('input');
        const value = this._data[field.name];
        input.value = Array.isArray(value) ? value.join(',') : String(value ?? '');
        input.oninput = () => this._emit(field.name!, input.value);
      }
      label.appendChild(input);
      this.appendChild(label);
    }
  }

  private _emit(name: string, value: unknown): void {
    const next = { ...this._data, [name]: value };
    this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: next }, bubbles: true, composed: true }));
  }
}

if (!customElements.get('ha-form')) {
  customElements.define('ha-form', HaFormStub);
}

const editor = document.createElement('nspanel-weather-card-editor') as HTMLElement & {
  setConfig: (config: unknown) => void;
  hass: unknown;
};
editor.setConfig({});
editor.hass = hass;
editor.addEventListener('config-changed', (ev) => {
  card.setConfig((ev as CustomEvent<{ config: unknown }>).detail.config);
});
document.getElementById('editor-root')!.append(editor);
```

Добавить тип в начало `dev/demo.ts`:

```ts
type FormValue = Record<string, unknown>;
```

- [ ] **Step 3: Проверить на dev-странице**

Run: `npm run dev`
Expected:
- Справа виден редактор с секциями «Общие», «Фон и шрифт», «Часы», «Улица», «Прогноз», «Помещение», «Кнопки».
- Изменение «Размер времени» меняет размер часов на карточке мгновенно.
- Изменение Y у «Улица» перемещает блок.
- Изменение X на 100 при `align: center` у часов сдвигает центр.
- Кнопка «↺» у цвета возвращает наследование.
- Список кнопок: «+ Добавить кнопку» добавляет элемент, ↑/↓/✕ работают.

- [ ] **Step 4: Проверить сборку и тесты**

Run: `npm run build`
Expected: успешная сборка.

Run: `npm test`
Expected: все тесты проходят (5 + 18 + 7 + 4 = 34).

- [ ] **Step 5: Коммит**

```bash
git add src/editor.ts dev/demo.ts
git commit -m "feat: add visual editor with sectioned ha-form UI"
```

---

### Task 12: Упаковка HACS и релиз

**Files:**
- Create: `hacs.json`
- Create: `README.md`
- Create: `info.md`
- Create: `.github/workflows/release.yml`

**Interfaces:**
- Consumes: артефакт `dist/nspanel-weather-card.js`.
- Produces: репозиторий, устанавливаемый как HACS-плагин; GitHub Release с ассетом.

- [ ] **Step 1: Создать `hacs.json`**

```json
{
  "name": "NSPanel Weather Card",
  "filename": "nspanel-weather-card.js",
  "render_readme": true,
  "homeassistant": "2023.9.0"
}
```

- [ ] **Step 2: Создать `info.md`**

```markdown
# NSPanel Weather Card

Custom weather dashboard card for the Sonoff NSPanel (480×480).

- Time, date and weekday
- Outdoor temperature, humidity, pressure (mmHg) and weather icon
- Daily forecast with min/max temperatures
- Indoor temperature and humidity
- Bottom navigation buttons (placeholders by default)
- Fully configurable from the Home Assistant visual editor: fonts, sizes, block positions, background and weather icons
- RU / EN localization

See README for configuration details.
```

- [ ] **Step 3: Создать `README.md`**

```markdown
# NSPanel Weather Card

Custom Lovelace card sized for the Sonoff NSPanel (480×480) with weather, clock,
forecast, indoor sensors and bottom navigation buttons. Everything is
configurable from the Home Assistant visual editor.

## Features

- Clock: time, date, weekday, configurable size, weight and alignment
- Outdoor: temperature, humidity, pressure in mmHg, replaceable weather icon
- Forecast: daily forecast row (icons + max/min) via `weather/subscribe_forecast`
- Indoor: temperature and humidity from sensors
- Bottom buttons: configurable list, navigation or placeholders
- Background image, custom font (`@font-face` URL), per-block colors
- Blocks can be disabled and positioned freely with X/Y
- RU / EN localization (follows Home Assistant language by default)

## Installation

### HACS

1. Open HACS → Frontend → menu → **Custom repositories**.
2. Add the URL of this repository with category **Lovelace**.
3. Install **NSPanel Weather Card** and reload Home Assistant.
4. HACS adds the resource automatically. If not, add it manually:
   Settings → Dashboards → Resources → `/hacsfiles/nspanel-weather-card/nspanel-weather-card.js` (JavaScript module).

Requires Home Assistant 2023.9 or newer.

### Manual

Copy `dist/nspanel-weather-card.js` from the latest release to
`config/www/nspanel-weather-card.js` and add it as a JavaScript module resource:
`/local/nspanel-weather-card.js`.

## Configuration

Add a card via the UI and use the visual editor, or configure YAML directly:

```yaml
type: custom:nspanel-weather-card
width: 480
height: 480
locale: auto
background:
  image: /local/nspanel/bg.png
  color: "#101418"
  opacity: 1
font:
  family: "Roboto, sans-serif"
  custom_font_url: ""
  color: "#ffffff"
blocks:
  clock:
    enabled: true
    x: 24
    y: 16
    show_time: true
    show_date: true
    show_weekday: true
    time_size: 72
    date_size: 18
    time_weight: 300
    align: left
    color: ""
  outdoor:
    enabled: true
    x: 24
    y: 128
    weather_entity: weather.home
    temp_entity: ""
    humidity_entity: ""
    pressure_entity: ""
    show_temp: true
    show_humidity: true
    show_pressure: true
    show_icon: true
    temp_size: 44
    value_size: 16
    icon_size: 88
    icon_override:
      sunny: /local/nspanel/sunny.png
    color: ""
  forecast:
    enabled: true
    x: 24
    y: 260
    days: 4
    icon_size: 36
    day_size: 14
    temp_size: 16
    show_min: true
    weather_entity: ""
    color: ""
  indoor:
    enabled: true
    x: 300
    y: 128
    temp_entity: sensor.living_room_temperature
    humidity_entity: sensor.living_room_humidity
    temp_size: 32
    value_size: 16
    show_humidity: true
    color: ""
  buttons:
    enabled: true
    x: 0
    y: 408
    width: 480
    height: 72
    active_path: ""
    items:
      - icon: mdi:weather-partly-cloudy
        image: ""
        label: Погода
        path: ""
        enabled: true
      - icon: mdi:thermostat
        image: ""
        label: Климат
        path: ""
        enabled: true
    color: ""
```

### Notes

- `background.color` and per-block `color` are hex strings; an empty block color
  inherits `font.color`.
- Pressure is always converted to mmHg (from hPa, mb, Pa or inHg).
- `forecast.weather_entity` empty means "use `outdoor.weather_entity`".
- Forecast icons use `outdoor.icon_override`, so custom weather images apply to
  both blocks.
- Buttons with an empty `path` are shown dimmed and do nothing (placeholders).
  Set `path` (e.g. `/weather-panel/0`) to navigate, and `active_path` to
  highlight the current panel.

## Development

```bash
npm install
npm run dev     # demo page with fake hass at http://localhost:5173
npm test
npm run build   # produces dist/nspanel-weather-card.js
```

## License

MIT
```

- [ ] **Step 4: Создать релизный workflow**

`.github/workflows/release.yml`:

```yaml
name: Release

on:
  release:
    types: [published]

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Upload release asset
        run: gh release upload "${{ github.event.release.tag_name }}" dist/nspanel-weather-card.js --clobber
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 5: Финальная проверка сборки**

Run: `npm test`
Expected: все 34 теста проходят.

Run: `npm run build`
Expected:
- `dist/` содержит **только** `nspanel-weather-card.js` (никаких `assets/`).
- Файл не пустой (порядка 100+ КБ из-за Lit и SVG).

Run: `ls dist`
Expected: `nspanel-weather-card.js`.

- [ ] **Step 6: Коммит**

```bash
git add hacs.json README.md info.md .github
git commit -m "chore: add HACS metadata, docs and release workflow"
```

- [ ] **Step 7: Ручная проверка в реальном Home Assistant**

1. Собери `npm run build`; скопируй `dist/nspanel-weather-card.js` в `config/www/nspanel-weather-card.js`.
2. Ресурс: Настройки → Панели управления → Ресурсы → `/local/nspanel-weather-card.js` как модуль.
3. Добавь карточку `custom:nspanel-weather-card` в dashboard; в редакторе укажи `weather_entity` (например `weather.home`), сенсоры помещения, размеры/позиции.
4. Проверь: время тикает; давление в мм рт. ст.; иконка соответствует погоде; прогноз из 4 дней; кнопки видны; переключение `path` у кнопки меняет dashboard; замена фона и иконки погоды по URL работает; `unavailable` сенсор показывает «—».

---

## Примечания для исполнителя

- Все тесты запускаются `npm test` (vitest run). Добавляй тесты только в `tests/`.
- Дев-страница (`npm run dev`) — единственный способ проверить DOM-рендер до установки в HA; после каждой задачи с блоком обязательно открыть её и глазами проверить ожидаемое поведение из шага.
- Не коммить `dist/` и `node_modules/` (в `.gitignore`).
- При правках `src/card.ts` между задачами 7–10 порядок блоков в `render()`: clock → outdoor → indoor → forecast → buttons.
