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
