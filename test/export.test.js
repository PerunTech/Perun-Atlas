import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toCSV, toGeoJSON } from '../frontend/data/export';
import { inDegrees } from '../frontend/data/project';
import { download } from '../frontend/lib/dom';
import { useExport } from '../frontend/hooks/useExport';
import { resetView } from './stubs/spatial.js';

// The half that touches the page. What the hook hands it is what a file holds.
vi.mock('../frontend/lib/dom', () => ({ download: vi.fn() }));

const point = (properties, coordinates = [33.9, 35.1]) =>
  ({ type: 'Feature', properties, geometry: { type: 'Point', coordinates } });
const rows = (csv) => csv.split('\r\n');

describe('toGeoJSON', () => {
  it('writes an empty collection rather than "undefined" when nothing arrived', () => {
    expect(JSON.parse(toGeoJSON(undefined))).toEqual({ type: 'FeatureCollection', features: [] });
  });
});

describe('toCSV', () => {
  // A denormalised reader names a related column `TABLE.COLUMN`, flat. The
  // column is collected under that name, so the cell has to be read under it
  // too rather than walked as two levels that are not there.
  it('fills a column whose name has a dot in it', () => {
    const csv = toCSV({ features: [point({ 'T.CODE': 'x' })] });
    expect(rows(csv)[0]).toBe('T.CODE,latitude,longitude');
    expect(rows(csv)[1].split(',')[0]).toBe('x');
  });

  it('collects columns from every feature, not just the first', () => {
    const csv = toCSV({ features: [point({ A: 1 }), point({ B: 2 })] });
    expect(rows(csv)[0]).toBe('A,B,latitude,longitude');
  });

  it('hides the framework fields and whatever the caller excluded', () => {
    const csv = toCSV(
      { features: [point({ A: 1, pkid: 9, type: 3, status: 'V', parent_id: 1, DESCRIPTOR: 'T', B: 2 })] },
      { exclude: ['B'] }
    );
    expect(rows(csv)[0]).toBe('A,latitude,longitude');
  });

  it('takes named fields in the order given, headers and all', () => {
    const csv = toCSV(
      { features: [point({ A: 1, B: 2 })] },
      { fields: [{ field: 'B', label: 'x.b' }, { field: 'A' }], labelResolver: (c) => (c === 'x.b' ? 'Bee' : null) }
    );
    expect(rows(csv)[0]).toBe('Bee,A,latitude,longitude');
    expect(rows(csv)[1]).toBe('2,1,35.1,33.9');
  });

  it('adds coordinate columns only for points and a geometry column only for shapes', () => {
    const shape = { type: 'Feature', properties: { A: 1 }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]] } };
    expect(rows(toCSV({ features: [point({ A: 1 })] }))[0]).toBe('A,latitude,longitude');
    expect(rows(toCSV({ features: [shape] }))[0]).toBe('A,geometry');
    expect(rows(toCSV({ features: [shape] }))[1]).toBe('1,"POLYGON ((0 0, 1 0, 0 1, 0 0))"');
  });

  it('quotes a value carrying a comma, a quote or a newline', () => {
    expect(rows(toCSV({ features: [point({ A: 'a,b' })] }))[1]).toMatch(/^"a,b"/);
    expect(rows(toCSV({ features: [point({ A: 'say "x"' })] }))[1]).toMatch(/^"say ""x"""/);
  });

  /**
   * A cell opening with `=`, `+`, `-` or `@` is a formula to a spreadsheet, and
   * these cells hold whatever a registry's free-text field holds. The quote
   * makes it text. A negative number is not defused, because it is a number.
   */
  it('defuses a cell a spreadsheet would run, and leaves a number alone', () => {
    expect(rows(toCSV({ features: [point({ A: '=1+1' })] }))[1]).toMatch(/^'=1\+1/);
    expect(rows(toCSV({ features: [point({ A: '-5' })] }))[1]).toMatch(/^-5/);
    expect(rows(toCSV({ features: [point({ A: '-5e3' })] }))[1]).toMatch(/^-5e3/);
  });

  it('leaves a cell empty for a missing value rather than writing null', () => {
    expect(rows(toCSV({ features: [point({ A: 1 }), point({ B: 2 })] }))[1]).toBe('1,,35.1,33.9');
  });
});

/**
 * A place on the ground, and where a deployment storing Web Mercator keeps it.
 *
 * The metres come from the formula rather than from `pointIn`, so the tests below
 * check the stub's inverse against the projection itself and not against its
 * own forward half.
 */
const CENTRE = { lat: 35.124805, lng: 33.941707 };
const mercator = ({ lat, lng }) => {
  const R = 6378137;
  const rad = Math.PI / 180;
  return [R * lng * rad, R * Math.log(Math.tan(Math.PI / 4 + (lat * rad) / 2))];
};
const EAST = { lat: 35.124805, lng: 33.951707 };
const NORTH = { lat: 35.134805, lng: 33.941707 };

const expectDegrees = ([lng, lat], place) => {
  expect(lng).toBeCloseTo(place.lng, 9);
  expect(lat).toBeCloseTo(place.lat, 9);
};

describe('inDegrees', () => {
  beforeEach(() => resetView());

  it('turns a stored Web Mercator point into longitude and latitude', () => {
    const stored = { type: 'FeatureCollection', features: [point({ A: 1 }, mercator(CENTRE))] };
    expectDegrees(inDegrees(stored, 3857).features[0].geometry.coordinates, CENTRE);
  });

  it('keeps both rings of a stored multipolygon with a hole', () => {
    const ring = [CENTRE, EAST, NORTH, CENTRE];
    const hole = [EAST, NORTH, CENTRE, EAST];
    const multi = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'MultiPolygon', coordinates: [[ring.map(mercator), hole.map(mercator)]] }
    };

    const [polygon] = inDegrees({ type: 'FeatureCollection', features: [multi] }, 3857).features[0].geometry.coordinates;
    expect(polygon).toHaveLength(2);
    polygon[0].forEach((position, i) => expectDegrees(position, ring[i]));
    polygon[1].forEach((position, i) => expectDegrees(position, hole[i]));
  });

  it('leaves a null geometry null', () => {
    const none = { type: 'Feature', properties: { A: 1 }, geometry: null };
    expect(inDegrees({ type: 'FeatureCollection', features: [none] }, 3857).features[0].geometry).toBeNull();
  });

  it('carries an altitude through unchanged', () => {
    const stored = { type: 'FeatureCollection', features: [point({}, [...mercator(CENTRE), 120])] };
    expect(inDegrees(stored, 3857).features[0].geometry.coordinates[2]).toBe(120);
  });

  /**
   * Both deployments this has run against store 4326, and the files they write
   * must not move by a byte: the same digits, in the same order, with nothing
   * added.
   */
  it('changes nothing in either file for a set stored in 4326', () => {
    const shape = { type: 'Feature', properties: { A: 2 }, geometry: { type: 'Polygon', coordinates: [[[33.9, 35.1], [33.95, 35.1], [33.95, 35.11], [33.9, 35.1]]] } };
    const stored = { type: 'FeatureCollection', features: [point({ A: 1 }, [33.941707, 35.124805]), shape, { type: 'Feature', properties: {}, geometry: null }] };

    expect(toGeoJSON(inDegrees(stored, 4326))).toBe(toGeoJSON(stored));
    expect(toCSV(inDegrees(stored, 4326))).toBe(toCSV(stored));
  });
});

describe('useExport', () => {
  beforeEach(() => {
    resetView();
    download.mockClear();
  });

  const stored = {
    type: 'FeatureCollection',
    features: [
      point({ A: 1 }, mercator(CENTRE)),
      { type: 'Feature', properties: { A: 2 }, geometry: { type: 'LineString', coordinates: [CENTRE, EAST].map(mercator) } }
    ]
  };
  const offer = (extra) => useExport({ set: stored, exportable: true, timeScoped: false, range: {}, srid: 3857, ...extra });
  const written = () => download.mock.calls[0][1];

  it('writes GeoJSON in degrees from a set stored in metres', () => {
    offer().saveGeoJSON();
    const file = JSON.parse(written());
    expectDegrees(file.features[0].geometry.coordinates, CENTRE);
    expectDegrees(file.features[1].geometry.coordinates[1], EAST);
  });

  it("writes the CSV's latitude, longitude and WKT in degrees", () => {
    offer().saveCSV();
    const [header, first, second] = rows(written());
    expect(header).toBe('A,latitude,longitude,geometry');

    const [, lat, lng] = first.split(',').map(Number);
    expectDegrees([lng, lat], CENTRE);

    const [x, y] = second.match(/LINESTRING \(([^ ]+) ([^,]+),/).slice(1).map(Number);
    expectDegrees([x, y], CENTRE);
  });

  it('writes what a circle caught in degrees too', () => {
    const selection = { selecting: true, feedsExport: true, count: 1, radius: 500, inside: [stored.features[0]] };
    offer({ selection }).saveGeoJSON();
    const file = JSON.parse(written());
    expect(file.features).toHaveLength(1);
    expectDegrees(file.features[0].geometry.coordinates, CENTRE);
  });

  it('leaves the set the map drew in stored units', () => {
    offer().saveGeoJSON();
    expect(stored.features[0].geometry.coordinates).toEqual(mercator(CENTRE));
  });
});
