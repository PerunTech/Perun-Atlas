import { describe, expect, it } from 'vitest';
import { identifiersOf, spanTo, withinCircle } from '../frontend/data/select';

/**
 * A centre on the island these deployments cover, and features at distances
 * measured with Leaflet's own haversine rather than chosen: 910 m due east,
 * 1112 m due north, 4549 m east, 9097 m east and 14363 m to the north-east.
 */
const CENTRE = { lat: 35.1, lng: 33.9 };

const at = (lng, lat, properties = {}) => ({
  type: 'Feature',
  properties,
  geometry: { type: 'Point', coordinates: [lng, lat] }
});

const near = at(33.91, 35.1, { name: 'near' });      //   910 m
const north = at(33.9, 35.11, { name: 'north' });    //  1112 m
const mid = at(33.95, 35.1, { name: 'mid' });        //  4549 m
const far = at(34.0, 35.1, { name: 'far' });         //  9097 m

const set = (...features) => ({ type: 'FeatureCollection', features });

describe('spanTo', () => {
  it('measures a point to itself as nothing', () => {
    expect(spanTo(at(33.9, 35.1), CENTRE, 4326).nearest).toBeCloseTo(0, 6);
  });

  it('gives the nearest and the furthest end of a line', () => {
    const line = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: [[33.91, 35.1], [33.95, 35.1]] }
    };
    const span = spanTo(line, CENTRE, 4326);
    expect(Math.round(span.nearest)).toBe(910);
    expect(Math.round(span.furthest)).toBe(4549);
  });

  it('walks a polygon, a multipolygon and a collection by depth rather than by type', () => {
    const ring = [[33.91, 35.1], [33.95, 35.1], [33.95, 35.11], [33.91, 35.1]];
    const polygon = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } };
    const multi = { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[ring]] } };
    const collection = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'GeometryCollection',
        geometries: [{ type: 'Point', coordinates: [33.91, 35.1] }, { type: 'Polygon', coordinates: [ring] }]
      }
    };

    expect(Math.round(spanTo(polygon, CENTRE, 4326).nearest)).toBe(910);
    expect(Math.round(spanTo(multi, CENTRE, 4326).nearest)).toBe(910);
    expect(Math.round(spanTo(collection, CENTRE, 4326).nearest)).toBe(910);
  });

  it('says nothing about a feature with no geometry to measure', () => {
    expect(spanTo({ type: 'Feature', properties: {} }, CENTRE, 4326)).toBeNull();
    expect(spanTo({ geometry: { type: 'Point', coordinates: [] } }, CENTRE, 4326)).toBeNull();
  });
});

describe('withinCircle', () => {
  it('catches what is inside the radius and leaves the rest', () => {
    const answer = withinCircle(set(near, mid, far), { ...CENTRE, radius: 5000 }, { srid: 4326 });
    expect(answer.inside.map(f => f.properties.name)).toEqual(['near', 'mid']);
    expect(answer.outside.map(f => f.properties.name)).toEqual(['far']);
    expect(answer.total).toBe(3);
  });

  it('puts the nearest first, so a caller can take the closest few off the front', () => {
    const answer = withinCircle(set(far, mid, north, near), { ...CENTRE, radius: 10000 }, { srid: 4326 });
    expect(answer.inside.map(f => f.properties.name)).toEqual(['near', 'north', 'mid', 'far']);
  });

  it('reports each feature by the object the layer drew, not by an identifier', () => {
    const answer = withinCircle(set(near, far), { ...CENTRE, radius: 5000 }, { srid: 4326 });
    expect(answer.has(near)).toBe(true);
    expect(answer.has(far)).toBe(false);
    expect(Math.round(answer.metres(near))).toBe(910);
    expect(Math.round(answer.metres(far))).toBe(9097);
    // A feature that was never offered has no distance rather than a wrong one.
    expect(answer.metres(at(33.9, 35.1))).toBeNull();
    expect(answer.has(null)).toBe(false);
  });

  it('counts a feature exactly on the edge as inside', () => {
    // Measured rather than asserted as a round number: the edge is wherever the
    // distance actually falls, and a test that picked 910 would be testing its
    // own rounding. `<=` is the choice being pinned here -- a radius typed to
    // the metre should catch what is at that metre.
    const edge = withinCircle(set(near), { ...CENTRE, radius: 1 }, { srid: 4326 }).metres(near);

    expect(withinCircle(set(near), { ...CENTRE, radius: edge }, { srid: 4326 }).inside).toHaveLength(1);
    expect(withinCircle(set(near), { ...CENTRE, radius: edge - 0.001 }, { srid: 4326 }).inside).toHaveLength(0);
  });

  describe('a shape that is partly in', () => {
    const straddling = {
      type: 'Feature',
      properties: { name: 'straddling' },
      geometry: { type: 'LineString', coordinates: [[33.91, 35.1], [33.95, 35.1]] }
    };

    it('counts as caught when it reaches in, which is what a radius usually asks', () => {
      const answer = withinCircle(set(straddling), { ...CENTRE, radius: 2000 }, { srid: 4326 });
      expect(answer.inside).toHaveLength(1);
    });

    it('does not count when the caller asked for wholly inside', () => {
      const answer = withinCircle(set(straddling), { ...CENTRE, radius: 2000 }, { srid: 4326, mode: 'contains' });
      expect(answer.inside).toHaveLength(0);
      expect(withinCircle(set(straddling), { ...CENTRE, radius: 5000 }, { srid: 4326, mode: 'contains' }).inside)
        .toHaveLength(1);
    });
  });

  it('reads the collection in the projection it is stored in, not the one it looks like', () => {
    // The very same numbers. Read as degrees they are 910 m away; read as Web
    // Mercator metres they are a third of a degree off the Gulf of Guinea, which
    // is the failure this argument exists to prevent -- and the one nothing on
    // screen would show, because the engine unprojects for the layer and leaves
    // the collection alone.
    const asDegrees = withinCircle(set(near), { ...CENTRE, radius: 5000 }, { srid: 4326 });
    const asMetres = withinCircle(set(near), { ...CENTRE, radius: 5000 }, { srid: 3857 });

    expect(asDegrees.inside).toHaveLength(1);
    expect(asMetres.inside).toHaveLength(0);
    expect(Math.round(asMetres.metres(near) / 1000)).toBe(5252);
  });

  it('finds a feature actually stored in Web Mercator', () => {
    const projected = at(3774843.93, 4177479.06, { name: 'projected' });
    const answer = withinCircle(set(projected), { ...CENTRE, radius: 5000 }, { srid: 3857 });
    expect(answer.inside).toHaveLength(1);
    expect(Math.round(answer.metres(projected))).toBe(910);
  });

  it('catches nothing before a shape is drawn, and says how many it looked at', () => {
    const features = set(near, far);
    for (const circle of [null, undefined, { ...CENTRE, radius: 0 }, { lat: NaN, lng: 33.9, radius: 5000 }]) {
      const answer = withinCircle(features, circle, { srid: 4326 });
      expect(answer.inside).toEqual([]);
      expect(answer.outside).toHaveLength(2);
      expect(answer.total).toBe(2);
      expect(answer.has(near)).toBe(false);
    }
  });

  it('treats a feature with no geometry as uncaught rather than as an error', () => {
    const blank = { type: 'Feature', properties: { name: 'blank' } };
    const answer = withinCircle(set(near, blank), { ...CENTRE, radius: 5000 }, { srid: 4326 });
    expect(answer.inside.map(f => f.properties.name)).toEqual(['near']);
    expect(answer.outside.map(f => f.properties.name)).toEqual(['blank']);
    expect(answer.metres(blank)).toBeNull();
  });

  it('takes an empty or absent collection without complaint', () => {
    expect(withinCircle(null, { ...CENTRE, radius: 5000 }).total).toBe(0);
    expect(withinCircle({ features: [] }, { ...CENTRE, radius: 5000 }).inside).toEqual([]);
  });
});

describe('identifiersOf', () => {
  const rows = [
    { properties: { pkid: 11, OBJECT_ID: 'A' } },
    { properties: { pkid: 12, OBJECT_ID: 'B' } }
  ];

  it('names each feature the way the row asked, in the order it was given them', () => {
    expect(identifiersOf(rows)).toBe('11,12');
    expect(identifiersOf(rows, { id: '{OBJECT_ID}' })).toBe('A,B');
    expect(identifiersOf(rows, { join: ' ' })).toBe('11 12');
  });

  it('takes a template rather than only a bare field', () => {
    expect(identifiersOf(rows, { id: 'id:{pkid}', join: ';' })).toBe('id:11;id:12');
  });

  it('leaves out a feature whose identifier did not resolve, rather than sending the template', () => {
    const mixed = [{ properties: { pkid: 11 } }, { properties: {} }, { properties: { pkid: 13 } }];
    expect(identifiersOf(mixed)).toBe('11,13');
    // The failure this prevents: a service asked to act on the row called "{pkid}".
    expect(identifiersOf(mixed)).not.toContain('{');
  });

  it('is empty for nothing to name', () => {
    expect(identifiersOf([])).toBe('');
    expect(identifiersOf(null)).toBe('');
  });
});
