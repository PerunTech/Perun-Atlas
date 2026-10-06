import { describe, expect, it, vi } from 'vitest';
import { bandOf, categoriesDrawn, colourBy, DEFAULT_PALETTE } from '../../frontend/appearance/choropleth';
import { legendFromPalette } from '../../frontend/appearance/legend';

const feature = (properties) => ({ type: 'Feature', properties });
const PALETTE = { 0: '#2e7d32', 1: '#f9a825', 2: '#c62828' };

describe('colourBy', () => {
  it('reads a flat field and returns the palette entry', () => {
    const fill = colourBy({ field: 'AREA_STATUS', palette: PALETTE });
    expect(fill(feature({ AREA_STATUS: '1' }))).toBe('#f9a825');
  });

  it('falls back for a value the palette has no entry for', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fill = colourBy({ field: 'AREA_STATUS', palette: PALETTE, fallback: '#eee' });
    expect(fill(feature({ AREA_STATUS: '9' }))).toBe('#eee');
    warn.mockRestore();
  });

  it('warns once per unmapped value, not once per feature', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fill = colourBy({ field: 'AREA_STATUS', palette: PALETTE });
    fill(feature({ AREA_STATUS: '9' }));
    fill(feature({ AREA_STATUS: '9' }));
    fill(feature({ AREA_STATUS: '8' }));
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('falls back silently for a missing value, which is not a configuration fault', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fill = colourBy({ field: 'AREA_STATUS', palette: PALETTE });
    expect(fill(feature({}))).toBe(DEFAULT_PALETTE.__unknown);
    expect(fill(feature({ AREA_STATUS: null }))).toBe(DEFAULT_PALETTE.__unknown);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('reads a dotted path into a nested object', () => {
    const fill = colourBy({ field: 'status.AREA_STATUS', palette: PALETTE });
    expect(fill(feature({ status: { AREA_STATUS: '2' } }))).toBe('#c62828');
  });

  /**
   * The case a joined row actually arrives in. These services prefix every
   * column with its table, so a joined record is `{ 'AREA_HEALTH.AREA_STATUS':
   * '2' }` -- one flat key with a dot in it, not two levels. `data/path` tries
   * the remaining path as a literal own property at each step, which is what
   * makes one configured field name work against both shapes.
   */
  it('reads a dotted path that is one flat key with a dot in it', () => {
    const fill = colourBy({ field: 'status.AREA_HEALTH.AREA_STATUS', palette: PALETTE });
    expect(fill(feature({ status: { 'AREA_HEALTH.AREA_STATUS': '2' } }))).toBe('#c62828');
  });
});

describe('categoriesDrawn', () => {
  it('reports each value once, in the order first drawn', () => {
    const drawn = categoriesDrawn(
      [feature({ S: '2' }), feature({ S: '0' }), feature({ S: '2' })],
      { field: 'S', palette: PALETTE }
    );
    expect(drawn.values).toEqual(['2', '0']);
    expect(drawn.usedFallback).toBe(false);
  });

  it('reports the fallback when a value is missing or unmapped', () => {
    expect(categoriesDrawn([feature({})], { field: 'S', palette: PALETTE }).usedFallback).toBe(true);
    expect(categoriesDrawn([feature({ S: '9' })], { field: 'S', palette: PALETTE }).usedFallback).toBe(true);
  });

  it('is empty rather than throwing when nothing was drawn', () => {
    expect(categoriesDrawn(undefined, { field: 'S' })).toEqual({ values: [], usedFallback: false });
  });
});

describe('bandOf', () => {
  const band = bandOf({ field: 'LEVEL', palette: PALETTE });

  it('files an area under the key its row in the legend goes by', () => {
    const rows = legendFromPalette({ palette: PALETTE, values: ['2', 7], fallback: '#eee', usedFallback: true });
    const keys = rows.map((row) => row.key);

    expect(keys).toContain(band(feature({ LEVEL: '2' })));
    expect(keys).toContain(band(feature({ LEVEL: 7 })));
    expect(keys).toContain(band(feature({})));
  });

  it('puts a number and its string under one key, as the palette does', () => {
    expect(band(feature({ LEVEL: 2 }))).toBe(band(feature({ LEVEL: '2' })));
  });

  it('sends an unmapped or absent value to the fallback band, where the fill put it', () => {
    expect(band(feature({ LEVEL: 7 }))).toBe(band(feature({ LEVEL: null })));
    expect(band(feature({ LEVEL: 7 }))).not.toBe(band(feature({ LEVEL: '0' })));
  });

  it('does not take an inherited name for a band', () => {
    expect(band(feature({ LEVEL: 'toString' }))).toBe(band(feature({})));
  });

  it('reads a joined field the way the fill reads it', () => {
    const joined = bandOf({ field: 'status.LEVEL', palette: PALETTE });
    expect(joined(feature({ status: { LEVEL: '1' } }))).toBe('1');
  });
});
