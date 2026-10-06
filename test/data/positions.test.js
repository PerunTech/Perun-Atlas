import { describe, expect, it } from 'vitest';
import { mapPositions, positionsOf } from '../../frontend/data/positions';

const feature = (geometry, properties = {}) => ({ type: 'Feature', properties, geometry });
const set = (...features) => ({ type: 'FeatureCollection', features });

/** Something unmistakable, so a position that was missed stands out. */
const tagged = ([x, y, ...rest]) => [x + 1000, y + 2000, ...rest];

const outer = [[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]];
const hole = [[1, 1], [2, 1], [2, 2], [1, 1]];

describe('positionsOf', () => {
  it('reads every position of every shape, in order', () => {
    expect(positionsOf({ type: 'Point', coordinates: [1, 2] })).toEqual([[1, 2]]);
    expect(positionsOf({ type: 'Polygon', coordinates: [outer, hole] })).toHaveLength(9);
    expect(positionsOf({
      type: 'GeometryCollection',
      geometries: [{ type: 'Point', coordinates: [1, 2] }, { type: 'LineString', coordinates: [[3, 4], [5, 6]] }]
    })).toEqual([[1, 2], [3, 4], [5, 6]]);
  });

  it('has nothing to say about a missing geometry', () => {
    expect(positionsOf(null)).toEqual([]);
    expect(positionsOf({ type: 'Point' })).toEqual([]);
  });
});

describe('mapPositions', () => {
  it('passes each of the six shapes through the conversion', () => {
    const shapes = [
      { type: 'Point', coordinates: [1, 2] },
      { type: 'MultiPoint', coordinates: [[1, 2], [3, 4]] },
      { type: 'LineString', coordinates: [[1, 2], [3, 4]] },
      { type: 'MultiLineString', coordinates: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]] },
      { type: 'Polygon', coordinates: [outer] },
      { type: 'MultiPolygon', coordinates: [[outer], [hole]] }
    ];

    const out = mapPositions(set(...shapes.map(shape => feature(shape))), tagged);

    out.features.forEach((each, i) => {
      expect(each.geometry.type).toBe(shapes[i].type);
      expect(positionsOf(each.geometry)).toEqual(positionsOf(shapes[i]).map(tagged));
    });
  });

  it('keeps both rings of a multipolygon with a hole, each in its place', () => {
    const multi = feature({ type: 'MultiPolygon', coordinates: [[outer, hole], [outer]] });
    const [out] = mapPositions(set(multi), tagged).features;

    expect(out.geometry.coordinates).toHaveLength(2);
    expect(out.geometry.coordinates[0]).toHaveLength(2);
    expect(out.geometry.coordinates[0][1]).toEqual(hole.map(tagged));
    expect(out.geometry.coordinates[1]).toEqual([outer.map(tagged)]);
  });

  it('walks into a geometry collection', () => {
    const mixed = feature({
      type: 'GeometryCollection',
      geometries: [{ type: 'Point', coordinates: [1, 2] }, { type: 'Polygon', coordinates: [hole] }]
    });
    const [out] = mapPositions(set(mixed), tagged).features;

    expect(out.geometry.geometries[0].coordinates).toEqual([1001, 2002]);
    expect(out.geometry.geometries[1].coordinates).toEqual([hole.map(tagged)]);
  });

  it('leaves a null geometry null, and a feature without one as it was', () => {
    const none = feature(null, { name: 'nowhere' });
    const absent = { type: 'Feature', properties: { name: 'nothing' } };
    const out = mapPositions(set(none, absent), tagged);

    expect(out.features[0].geometry).toBeNull();
    expect(out.features[1]).toEqual(absent);
    expect('geometry' in out.features[1]).toBe(false);
  });

  it('keeps properties, ids and the collection\'s own members, in their order', () => {
    const given = { type: 'FeatureCollection', name: 'set', features: [{ id: 7, ...feature({ type: 'Point', coordinates: [1, 2] }, { A: 1 }) }] };
    const out = mapPositions(given, tagged);

    expect(Object.keys(out)).toEqual(Object.keys(given));
    expect(Object.keys(out.features[0])).toEqual(Object.keys(given.features[0]));
    expect(out.features[0].properties).toEqual({ A: 1 });
    expect(out.features[0].id).toBe(7);
  });

  it('does not touch the collection it was given', () => {
    const given = set(feature({ type: 'Polygon', coordinates: [outer, hole] }));
    const before = JSON.stringify(given);
    mapPositions(given, tagged);
    expect(JSON.stringify(given)).toBe(before);
  });

  it('hands back what it was given when there are no features to walk', () => {
    expect(mapPositions(null, tagged)).toBeNull();
    expect(mapPositions(undefined, tagged)).toBeUndefined();
  });
});
