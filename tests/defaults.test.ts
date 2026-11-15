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
