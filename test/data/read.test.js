import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DOMParser } from '@xmldom/xmldom';
import { FILE_LIMITS, readFile, sizeRefusal } from '../../frontend/data/read';
import { toKML } from '../../frontend/data/export';

/**
 * The suite runs in node, which has no DOMParser. xmldom is the parser
 * togeojson's own tests use, and `readFile` takes one for exactly this.
 *
 * With no `onError`, xmldom prints every parse error to stderr before throwing,
 * so the test that feeds it broken XML on purpose left a `[xmldom fatalError]`
 * in the CI log beside a pass. A fatal error still throws with this one, which
 * is what the reader catches; it just says nothing first.
 */
const parse = (text) => new DOMParser({ onError: () => {} }).parseFromString(text, 'application/xml');
const read = (text, options) => readFile(text, { parse, ...options });

const feature = (geometry, properties = {}) => ({ type: 'Feature', properties, geometry });
const collection = (...features) => JSON.stringify({ type: 'FeatureCollection', features });

let warn;
beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => warn.mockRestore());

describe('readFile: GeoJSON', () => {
  it('reads a FeatureCollection, keeping properties and ids', () => {
    const text = JSON.stringify({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', id: 7, properties: { NAME: 'Gazimağusa' }, geometry: { type: 'Point', coordinates: [33.94, 35.12] } }]
    });
    const result = read(text);
    expect(result.format).toBe('geojson');
    expect(result.collection.features).toEqual([
      { type: 'Feature', id: 7, properties: { NAME: 'Gazimağusa' }, geometry: { type: 'Point', coordinates: [33.94, 35.12] } }
    ]);
    expect(result.positions).toBe(1);
  });

  it('reads a lone Feature and a bare geometry as one-feature collections', () => {
    const lone = read(JSON.stringify(feature({ type: 'LineString', coordinates: [[33.9, 35.1], [34, 35.2]] }, { A: 1 })));
    expect(lone.collection.features).toHaveLength(1);
    expect(lone.collection.features[0].properties).toEqual({ A: 1 });

    const bare = read(JSON.stringify({ type: 'Polygon', coordinates: [[[33, 35], [34, 35], [34, 36], [33, 35]]] }));
    expect(bare.collection.features[0]).toEqual({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [[[33, 35], [34, 35], [34, 36], [33, 35]]] }
    });
  });

  it('gives a feature with no properties an empty object, so the pane can read it', () => {
    const result = read(JSON.stringify({ type: 'Feature', geometry: { type: 'Point', coordinates: [1, 2] } }));
    expect(result.collection.features[0].properties).toEqual({});
  });

  it('ignores a byte-order mark and leading whitespace', () => {
    expect(read(`﻿\n  ${collection(feature({ type: 'Point', coordinates: [1, 2] }))}`).format).toBe('geojson');
  });

  it('drops features with no geometry, and counts only what it will draw', () => {
    const result = read(collection(
      feature(null, { A: 1 }),
      feature({ type: 'Point', coordinates: [1, 2] }, { A: 2 }),
      feature({ type: 'MultiPoint', coordinates: [] }, { A: 3 })
    ));
    expect(result.collection.features.map(f => f.properties.A)).toEqual([2]);
  });

  it('reads a GeometryCollection', () => {
    const result = read(collection(feature({
      type: 'GeometryCollection',
      geometries: [{ type: 'Point', coordinates: [1, 2] }, { type: 'LineString', coordinates: [[1, 2], [3, 4]] }]
    })));
    expect(result.positions).toBe(3);
  });
});

describe('readFile: refusals', () => {
  it('refuses text that is not JSON, not XML, or neither GeoJSON nor KML nor GPX', () => {
    expect(read('{ "type": "FeatureCollection", ')).toEqual({ refused: 'unreadable' });
    expect(read('NAME,LAT,LNG\nA,1,2')).toEqual({ refused: 'unreadable' });
    expect(read('{ "type": "Topology", "objects": {} }')).toEqual({ refused: 'unreadable' });
    expect(read('<svg xmlns="http://www.w3.org/2000/svg"></svg>')).toEqual({ refused: 'unreadable' });
    expect(read('')).toEqual({ refused: 'unreadable' });
  });

  it('refuses XML that does not parse', () => {
    expect(read('<kml><Document><Placemark></kml>')).toEqual({ refused: 'unreadable' });
  });

  it('refuses a file with nothing to draw', () => {
    expect(read(collection())).toEqual({ refused: 'empty' });
    expect(read(collection(feature(null, { A: 1 })))).toEqual({ refused: 'empty' });
    expect(read('<kml xmlns="http://www.opengis.net/kml/2.2"><Document></Document></kml>')).toEqual({ refused: 'empty' });
  });

  it('refuses coordinates outside the range of degrees, which is a projected file', () => {
    // A point in Web Mercator metres, as a file with a `crs` member still carries.
    const text = JSON.stringify({
      type: 'FeatureCollection',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::3857' } },
      features: [feature({ type: 'Point', coordinates: [3778591.6, 4182418.4] })]
    });
    expect(read(text)).toEqual({ refused: 'notDegrees' });
    expect(read(collection(feature({ type: 'Point', coordinates: [33, 91] })))).toEqual({ refused: 'notDegrees' });
    expect(read(collection(feature({ type: 'Point', coordinates: [-181, 0] })))).toEqual({ refused: 'notDegrees' });
  });

  it('accepts the edges of the range', () => {
    expect(read(collection(feature({ type: 'LineString', coordinates: [[-180, -90], [180, 90]] }))).format).toBe('geojson');
  });

  it('refuses a position that is not two numbers as unreadable, not as a projection', () => {
    expect(read(collection(feature({ type: 'Point', coordinates: [33, null] })))).toEqual({ refused: 'unreadable' });
  });

  it('refuses more positions than the limit, with both numbers', () => {
    const line = feature({ type: 'LineString', coordinates: [[1, 1], [2, 2], [3, 3], [4, 4]] });
    expect(read(collection(line), { limits: { ...FILE_LIMITS, positions: 3 } }))
      .toEqual({ refused: 'tooManyPoints', count: 4, limit: 3 });
    expect(read(collection(line), { limits: { ...FILE_LIMITS, positions: 4 } }).format).toBe('geojson');
  });

  it('refuses a file too large to read before reading it', () => {
    expect(sizeRefusal(FILE_LIMITS.bytes)).toBeNull();
    expect(sizeRefusal(FILE_LIMITS.bytes + 1)).toEqual({ refused: 'tooLarge', size: FILE_LIMITS.bytes + 1, limit: FILE_LIMITS.bytes });
  });
});

describe('readFile: KML', () => {
  const kml = (placemarks) => `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Style id="red"><LineStyle><color>ff0000ff</color><width>4</width></LineStyle></Style>
    ${placemarks}
  </Document>
</kml>`;

  it('reads points, lines and polygons with holes, in longitude and latitude', () => {
    const result = read(kml(`
      <Placemark><name>P</name><Point><coordinates>33.9,35.1</coordinates></Point></Placemark>
      <Placemark><name>L</name><LineString><coordinates>33.9,35.1 34.0,35.2</coordinates></LineString></Placemark>
      <Placemark><name>A</name><Polygon>
        <outerBoundaryIs><LinearRing><coordinates>33,35 34,35 34,36 33,35</coordinates></LinearRing></outerBoundaryIs>
        <innerBoundaryIs><LinearRing><coordinates>33.2,35.2 33.4,35.2 33.4,35.4 33.2,35.2</coordinates></LinearRing></innerBoundaryIs>
      </Polygon></Placemark>`));

    expect(result.format).toBe('kml');
    const [point, line, area] = result.collection.features;
    expect(point.geometry).toEqual({ type: 'Point', coordinates: [33.9, 35.1] });
    expect(line.geometry.type).toBe('LineString');
    expect(area.geometry.coordinates).toHaveLength(2);
    expect(point.properties.name).toBe('P');
  });

  it('leaves out what the file says about its own style', () => {
    const result = read(kml(`
      <Placemark><name>L</name><styleUrl>#red</styleUrl>
        <Style><PolyStyle><color>7f00ff00</color></PolyStyle></Style>
        <ExtendedData><Data name="fill"><value>wheat</value></Data></ExtendedData>
        <LineString><coordinates>33.9,35.1 34.0,35.2</coordinates></LineString></Placemark>`));

    const { properties } = result.collection.features[0];
    expect(Object.keys(properties).sort()).toEqual(['fill', 'name']);
    // A column of the file's own that happens to share a style key's name stays.
    expect(properties.fill).toBe('wheat');
  });

  it('keeps a description written as CDATA as text', () => {
    const result = read(kml(`
      <Placemark><description><![CDATA[<b>Pen</b> 4]]></description>
        <Point><coordinates>33.9,35.1</coordinates></Point></Placemark>`));
    expect(result.collection.features[0].properties.description).toBe('<b>Pen</b> 4');
  });

  it('drops placemarks with no geometry rather than refusing the file', () => {
    const result = read(kml(`
      <Placemark><name>none</name></Placemark>
      <Placemark><name>P</name><Point><coordinates>33.9,35.1</coordinates></Point></Placemark>`));
    expect(result.collection.features.map(f => f.properties.name)).toEqual(['P']);
  });
});

describe('readFile: GPX', () => {
  const gpx = (body) => `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">${body}</gpx>`;

  it('reads a track, a route and a waypoint, with elevation kept as a third number', () => {
    const result = read(gpx(`
      <wpt lat="35.1" lon="33.9"><ele>12</ele><name>Gate</name></wpt>
      <rte><name>Route</name><rtept lat="35.1" lon="33.9"/><rtept lat="35.2" lon="34.0"/></rte>
      <trk><name>Visit</name><trkseg>
        <trkpt lat="35.1" lon="33.9"><time>2026-09-28T08:00:00Z</time></trkpt>
        <trkpt lat="35.15" lon="33.95"><time>2026-09-28T08:01:00Z</time></trkpt>
      </trkseg></trk>`));

    expect(result.format).toBe('gpx');
    const byName = Object.fromEntries(result.collection.features.map(f => [f.properties.name, f]));
    expect(byName.Gate.geometry).toEqual({ type: 'Point', coordinates: [33.9, 35.1, 12] });
    expect(byName.Route.geometry.type).toBe('LineString');
    expect(byName.Visit.geometry.coordinates).toEqual([[33.9, 35.1], [33.95, 35.15]]);
  });

  it('refuses a GPX with no points at all', () => {
    expect(read(gpx('<metadata><name>empty</name></metadata>'))).toEqual({ refused: 'empty' });
  });
});

/**
 * The file this package writes, read back by the reader it now has.
 *
 * Each column is a `Data` element named after the column, so it should come back
 * as a property of the same name and the same text. The placemark's `<name>`
 * comes back as `name`, beside them. A column spelled exactly `name` is the one
 * place the two meet, and the column wins, since togeojson reads the extended
 * data after the name.
 */
describe('a KML written by toKML, read back', () => {
  const features = [
    feature({ type: 'Point', coordinates: [33.941707, 35.124805] }, { NAME: 'Gazimağusa <Pen 4>', HEADS: 12, OWNER: 'A & B' }),
    feature({ type: 'LineString', coordinates: [[33.9, 35.1], [34, 35.2]] }, { NAME: 'Route', HEADS: null, OWNER: 'C' })
  ];

  it('brings every column back under its own name', () => {
    const written = toKML({ features }, { nameOf: (f) => f.properties.NAME });
    const result = read(written);

    expect(result.collection.features).toHaveLength(2);
    const [site, route] = result.collection.features;
    expect(site.properties).toMatchObject({ name: 'Gazimağusa <Pen 4>', NAME: 'Gazimağusa <Pen 4>', HEADS: '12', OWNER: 'A & B' });
    expect(route.properties).toMatchObject({ name: 'Route', NAME: 'Route', OWNER: 'C' });
    expect(site.geometry.coordinates).toEqual([33.941707, 35.124805]);
  });

  it('lets a column called exactly `name` win over the placemark name', () => {
    const written = toKML({ features: [feature({ type: 'Point', coordinates: [1, 2] }, { name: 'column' })] }, { nameOf: () => 'placemark' });
    expect(read(written).collection.features[0].properties.name).toBe('column');
  });
});
