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
