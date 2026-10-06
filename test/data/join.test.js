import { describe, expect, it } from 'vitest';
import { joinStatus } from '../../frontend/data/join';

const feature = (properties) => ({ type: 'Feature', properties });

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
