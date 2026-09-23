import { describe, expect, it, vi } from 'vitest';
import { categoriesDrawn, colourBy, DEFAULT_PALETTE, joinStatus } from '../frontend/appearance/choropleth';

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

describe('joinStatus', () => {
  const collection = {
    type: 'FeatureCollection',
    features: [feature({ UNIT_ID: '1_1_6_5' }), feature({ UNIT_ID: '1_2_3_4' })]
  };
  const join = { featureKey: 'UNIT_ID', rowKey: 'PARENT_ID' };

  it('hangs the matching row under the `as` key', () => {
    const out = joinStatus(collection, [{ PARENT_ID: '1_1_6_5', AREA_STATUS: '2' }], join);
    expect(out.features[0].properties.status).toEqual({ PARENT_ID: '1_1_6_5', AREA_STATUS: '2' });
  });

  it('leaves a feature with no row exactly as it was', () => {
    const out = joinStatus(collection, [{ PARENT_ID: '1_1_6_5' }], join);
    expect(out.features[1]).toBe(collection.features[1]);
  });

  it('matches across types, because one side is a number on the wire', () => {
    const out = joinStatus(
      { features: [feature({ UNIT_ID: 5 })] },
      [{ PARENT_ID: '5', AREA_STATUS: '1' }],
      join
    );
    expect(out.features[0].properties.status.AREA_STATUS).toBe('1');
  });

  it('names the joined record whatever the row asked for', () => {
    const out = joinStatus(collection, [{ PARENT_ID: '1_1_6_5' }], { ...join, as: 'health' });
    expect(out.features[0].properties.health).toBeDefined();
    expect(out.features[0].properties.status).toBeUndefined();
  });

  /**
   * Pinned, not endorsed. Two rows carrying the same key silently overwrite,
   * and which one survives is the order the service sent them in. A deployment
   * whose status service returns one row per area per disease gets whichever
   * disease sorted last, with nothing logged. If that is ever made an error or
   * a merge, this test is the one that should fail and say so.
   */
  it('keeps the last of two rows sharing a key, silently', () => {
    const out = joinStatus(
      collection,
      [{ PARENT_ID: '1_1_6_5', DISEASE: 'FMDO' }, { PARENT_ID: '1_1_6_5', DISEASE: 'BTV' }],
      join
    );
    expect(out.features[0].properties.status.DISEASE).toBe('BTV');
  });

  it('survives a collection or a row set that never arrived', () => {
    expect(joinStatus(undefined, undefined, join).features).toEqual([]);
  });
});
