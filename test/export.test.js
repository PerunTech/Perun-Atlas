import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toCSV, toGeoJSON, toKML } from '../frontend/data/export';
import { fromDegrees, inDegrees } from '../frontend/data/project';
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

describe('toKML', () => {
  const shape = (type, coordinates, properties = {}) => ({ type: 'Feature', properties, geometry: { type, coordinates } });
  const placemarks = (kml) => kml.match(/<Placemark>[\s\S]*?<\/Placemark>/g) ?? [];
  const only = (feature, options) => placemarks(toKML({ features: [feature] }, options))[0];

  it('writes a document with one placemark per feature, a feature without a shape included', () => {
    const kml = toKML({ features: [point({ A: 1 }), { type: 'Feature', properties: { A: 2 }, geometry: null }] });
    expect(kml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">')).toBe(true);
    expect(placemarks(kml)).toHaveLength(2);
    expect(placemarks(kml)[1]).not.toMatch(/<Point|<coordinates/);
  });

  it('writes an empty document rather than "undefined" when nothing arrived', () => {
    expect(placemarks(toKML(undefined))).toHaveLength(0);
    expect(toKML(undefined)).toMatch(/<Document>\s*<\/Document>/);
  });

  it('writes a point as lng,lat, keeping an altitude', () => {
    expect(only(point({}))).toMatch('<Point><coordinates>33.9,35.1</coordinates></Point>');
    expect(only(point({}, [33.9, 35.1, 120]))).toMatch('<coordinates>33.9,35.1,120</coordinates>');
  });

  it('writes a line as a tessellated run of positions separated by spaces', () => {
    expect(only(shape('LineString', [[0, 0], [1, 1], [2, 0]])))
      .toMatch('<LineString><tessellate>1</tessellate><coordinates>0,0 1,1 2,0</coordinates></LineString>');
  });

  it('writes a polygon hole as its own innerBoundaryIs', () => {
    const outer = [[0, 0], [4, 0], [4, 4], [0, 0]];
    const holes = [[[1, 1], [2, 1], [2, 2], [1, 1]], [[3, 1], [3.5, 1], [3.5, 2], [3, 1]]];
    expect(only(shape('Polygon', [outer, ...holes]))).toMatch(
      '<Polygon><tessellate>1</tessellate>' +
      '<outerBoundaryIs><LinearRing><coordinates>0,0 4,0 4,4 0,0</coordinates></LinearRing></outerBoundaryIs>' +
      '<innerBoundaryIs><LinearRing><coordinates>1,1 2,1 2,2 1,1</coordinates></LinearRing></innerBoundaryIs>' +
      '<innerBoundaryIs><LinearRing><coordinates>3,1 3.5,1 3.5,2 3,1</coordinates></LinearRing></innerBoundaryIs>' +
      '</Polygon>'
    );
  });

  it('writes each Multi type as a MultiGeometry of its parts', () => {
    expect(only(shape('MultiPoint', [[0, 0], [1, 1]])))
      .toMatch('<MultiGeometry><Point><coordinates>0,0</coordinates></Point><Point><coordinates>1,1</coordinates></Point></MultiGeometry>');

    const lines = only(shape('MultiLineString', [[[0, 0], [1, 1]], [[2, 2], [3, 3]]]));
    expect(lines).toMatch(/<MultiGeometry>(<LineString>.*?<\/LineString>){2}<\/MultiGeometry>/);
    expect(lines).toMatch('<coordinates>2,2 3,3</coordinates>');

    const ring = [[0, 0], [1, 0], [1, 1], [0, 0]];
    const hole = [[0.2, 0.2], [0.4, 0.2], [0.4, 0.4], [0.2, 0.2]];
    const areas = only(shape('MultiPolygon', [[ring, hole], [ring]]));
    expect(areas).toMatch(/<MultiGeometry>(<Polygon>.*?<\/Polygon>){2}<\/MultiGeometry>/);
    expect(areas.match(/<innerBoundaryIs>/g)).toHaveLength(1);
  });

  it('writes no shape for a geometry it does not know, or one with no positions', () => {
    expect(only(shape('GeometryCollection', undefined))).not.toMatch(/<coordinates/);
    expect(only(shape('LineString', []))).not.toMatch(/<LineString/);
  });

  it('carries the columns and headers the CSV would, every one on every placemark', () => {
    const features = [point({ A: 1, pkid: 9 }), point({ B: 'two' })];
    const kml = toKML({ features }, { labelResolver: (code) => (code === 'a' ? 'Aye' : null) });
    const [first, second] = placemarks(kml);

    expect(first).toMatch('<Data name="A"><displayName>Aye</displayName><value>1</value></Data>');
    expect(first).toMatch('<Data name="B"><displayName>B</displayName><value></value></Data>');
    expect(second).toMatch('<Data name="A"><displayName>Aye</displayName><value></value></Data>');
    expect(kml).not.toMatch('pkid');
  });

  it('takes named fields in the order given, headers and all', () => {
    const one = only(point({ A: 1, B: 2 }), {
      fields: [{ field: 'B', label: 'x.b' }, { field: 'A' }],
      labelResolver: (c) => (c === 'x.b' ? 'Bee' : null)
    });
    expect(one.indexOf('name="B"')).toBeLessThan(one.indexOf('name="A"'));
    expect(one).toMatch('<displayName>Bee</displayName><value>2</value>');
  });

  it('writes no ExtendedData for a set with no columns', () => {
    expect(only(point({}))).not.toMatch('ExtendedData');
  });

  it('names a placemark by what nameOf answers, and leaves it unnamed on nothing', () => {
    const features = [point({ N: 'North' }), point({ N: '' }), point({})];
    const nameOf = (feature) => feature.properties.N ?? null;
    const [named, blank, none] = placemarks(toKML({ features }, { nameOf }));

    expect(named).toMatch(/<Placemark>\n {6}<name>North<\/name>\n/);
    expect(blank).not.toMatch('<name>');
    expect(none).not.toMatch('<name>');
    expect(placemarks(toKML({ features }))[0]).not.toMatch('<name>');
  });

  /**
   * These values are whatever a registry's free-text field holds. Unescaped, a
   * `<` ends an element and a `&` starts an entity, and one such record makes
   * the whole file unreadable.
   */
  it('escapes every text node and attribute', () => {
    const nasty = `<b class="x">Tom & 'Jerry'</b>`;
    const escaped = '&lt;b class=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/b&gt;';
    const one = only(point({ [nasty]: nasty }), { labelResolver: () => nasty, nameOf: () => nasty });

    expect(one).toMatch(`<name>${escaped}</name>`);
    expect(one).toMatch(`<Data name="${escaped}"><displayName>${escaped}</displayName><value>${escaped}</value></Data>`);
    expect(one).not.toMatch(/<b|'Jerry'|"x"/);
  });

  // XML 1.0 has no way to write these at all, and a parser that meets one
  // refuses the document.
  it('drops the control characters XML cannot hold, and keeps tab and newline', () => {
    const one = only(point({ A: 'a\u0000b\u000Cc\td\ne' }));
    expect(one).toMatch('<value>abc\td\ne</value>');
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

/**
 * The same conversion the other way, for a file the reader opens: degrees in,
 * stored units out, so the engine's own unprojection puts it back where it was.
 */
describe('fromDegrees', () => {
  beforeEach(() => resetView());

  const inFile = (coordinates, type = 'Point') => ({
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: { A: 1 }, geometry: { type, coordinates } }]
  });

  it('turns a point in degrees into Web Mercator metres', () => {
    const [x, y] = fromDegrees(inFile([CENTRE.lng, CENTRE.lat]), 3857).features[0].geometry.coordinates;
    const [mx, my] = mercator(CENTRE);
    expect(x).toBeCloseTo(mx, 6);
    expect(y).toBeCloseTo(my, 6);
  });

  it('is undone by inDegrees, hole and altitude included', () => {
    const ring = [CENTRE, EAST, NORTH, CENTRE].map(({ lat, lng }) => [lng, lat, 7]);
    const hole = [EAST, NORTH, CENTRE, EAST].map(({ lat, lng }) => [lng, lat]);
    const file = inFile([[ring, hole]], 'MultiPolygon');

    const back = inDegrees(fromDegrees(file, 3857), 3857).features[0].geometry.coordinates[0];
    back[0].forEach((position, i) => expectDegrees(position, [CENTRE, EAST, NORTH, CENTRE][i]));
    back[1].forEach((position, i) => expectDegrees(position, [EAST, NORTH, CENTRE, EAST][i]));
    expect(back[0][0][2]).toBe(7);
  });

  it('changes nothing for a deployment that stores 4326', () => {
    const file = inFile([[33.9, 35.1], [34, 35.2]], 'LineString');
    expect(fromDegrees(file, 4326)).toEqual(file);
  });

  it('leaves the file it was given alone', () => {
    const file = inFile([CENTRE.lng, CENTRE.lat]);
    fromDegrees(file, 3857);
    expect(file.features[0].geometry.coordinates).toEqual([CENTRE.lng, CENTRE.lat]);
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
  it('writes the KML in degrees, as a .kml of the Google Earth type', () => {
    offer().saveKML();
    const [filename, , type] = download.mock.calls[0];
    expect(filename).toMatch(/\.kml$/);
    expect(type).toBe('application/vnd.google-earth.kml+xml');

    const [lng, lat] = written().match(/<Point><coordinates>([^<]+)</)[1].split(',').map(Number);
    expectDegrees([lng, lat], CENTRE);
  });

  describe('naming placemarks', () => {
    const set = {
      type: 'FeatureCollection',
      features: [
        point({ DESCRIPTOR: 'SITE', NAME: 'Site one', CODE: 'S1' }),
        point({ DESCRIPTOR: 'SITE', CODE: 'S2' }),
        { type: 'Feature', properties: { DESCRIPTOR: 'LINE', REF: 'L1' }, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } }
      ]
    };
    const descriptors = { SITE: { label: { field: 'CODE' } }, LINE: { popup: { title: 'REF' } } };
    const drawnWith = (feature) => descriptors[feature.properties.DESCRIPTOR];
    const names = (exportable) => {
      useExport({ set, exportable, drawnWith, timeScoped: false, range: {}, srid: 4326 }).saveKML();
      return (written().match(/<Placemark>[\s\S]*?<\/Placemark>/g)).map(p => p.match(/<name>(.*)<\/name>/)?.[1] ?? null);
    };

    it("takes the row's name field first, and the descriptor where a feature has none", () => {
      expect(names({ name: 'NAME' })).toEqual(['Site one', 'S2', 'L1']);
    });

    it('takes the descriptor alone when the row names no field', () => {
      expect(names(true)).toEqual(['S1', 'S2', 'L1']);
    });

    it('leaves a placemark unnamed when neither says', () => {
      useExport({ set, exportable: true, timeScoped: false, range: {}, srid: 4326 }).saveKML();
      expect(written()).not.toMatch('<name>');
    });
  });
});
