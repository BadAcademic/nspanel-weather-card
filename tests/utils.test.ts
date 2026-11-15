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
