import { beforeAll, describe, expect, it } from 'vitest';

const defines = new Map<string, unknown>();
(globalThis as Record<string, unknown>).customElements = {
  get: (name: string) => defines.get(name),
  define: (name: string, ctor: unknown) => {
    defines.set(name, ctor);
  },
};
(globalThis as Record<string, unknown>).HTMLElement = class {};
(globalThis as Record<string, unknown>).document = undefined;

describe('custom element registration', () => {
  beforeAll(async () => {
    await import('../src/blocks/clock');
    await import('../src/blocks/outdoor');
    await import('../src/blocks/indoor');
    await import('../src/blocks/forecast');
    await import('../src/blocks/buttons');
  });

  it('registers every block element', () => {
    for (const tag of [
      'nspanel-clock',
      'nspanel-outdoor',
      'nspanel-indoor',
      'nspanel-forecast',
      'nspanel-buttons',
    ]) {
      expect(defines.get(tag)).toBeTruthy();
    }
  });
});
