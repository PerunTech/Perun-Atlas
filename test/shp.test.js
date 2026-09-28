import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readShapefile } from '../frontend/modules/shp';
import { FILE_LIMITS, fileKind, readLayers } from '../frontend/data/read';

/**
 * The shapefile reader, against files GDAL wrote.
 *
 * `fixtures/shapefiles/make.sh` says how each was made. They hold the same two
 * sites, at the positions below, in one projection or another, so every test
 * that reads one back can say where the sites should land.
 */

const fixture = (name) => {
  const bytes = readFileSync(new URL(`./fixtures/shapefiles/${name}`, import.meta.url));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
};

const read = (name, { kind = 'zip', limit = FILE_LIMITS.bytes } = {}) =>
  readShapefile(fixture(name), { kind, limit });

const SITES = [[21.4394, 41.9981], [21.5, 42.05]];

/** Each position of a layer's points within `tolerance` degrees of the sites. */
const expectSites = (layer, tolerance) => {
  const positions = layer.collection.features.map(feature => feature.geometry.coordinates);
  expect(positions).toHaveLength(2);
  positions.forEach(([lng, lat], i) => {
    expect(Math.abs(lng - SITES[i][0])).toBeLessThan(tolerance);
    expect(Math.abs(lat - SITES[i][1])).toBeLessThan(tolerance);
  });
};

describe('fileKind', () => {
  it('knows a zip and a .shp by their first bytes', () => {
    expect(fileKind(fixture('wgs84.zip'), 'wgs84.zip')).toBe('zip');
    expect(fileKind(fixture('lone.shp'), 'lone.shp')).toBe('shp');
  });

  it('reads a file for what it holds, whatever its name says', () => {
    expect(fileKind(fixture('wgs84.zip'), 'sites.geojson')).toBe('zip');
    const text = new TextEncoder().encode('{"type":"FeatureCollection","features":[]}').buffer;
    expect(fileKind(text, 'sites.zip')).toBe('text');
  });

  it("tells a shapefile's other parts apart by name", () => {
    expect(fileKind(fixture('lone.dbf'), 'lone.dbf')).toBe('part');
    const prj = new TextEncoder().encode('GEOGCS["GCS_WGS_1984"]').buffer;
    expect(fileKind(prj, 'SITES.PRJ')).toBe('part');
  });

  it('takes an empty file for text, which then has nothing in it', () => {
    expect(fileKind(new ArrayBuffer(0), 'empty.kml')).toBe('text');
  });
});

describe('readShapefile', () => {
  it('reads a zip in WGS 84 with its attributes, in the encoding its .cpg names', async () => {
    const { layers } = await read('wgs84.zip');
    expect(layers).toHaveLength(1);
    expect(layers[0].name).toBe('sites');
    expect(layers[0].assumed).toBe(false);
    expectSites(layers[0], 1e-9);
    expect(layers[0].collection.features[0].properties).toEqual({ name: 'Gazimağusa', code: 7 });
  });

  it('converts a projected grid on WGS 84 to longitude and latitude', async () => {
    const { layers } = await read('utm.zip');
    expectSites(layers[0], 1e-7);
  });

  it('takes ETRS89 as WGS 84, which it is within a metre of', async () => {
    const { layers } = await read('etrs.zip');
    expectSites(layers[0], 1e-5);
  });

  it('refuses a datum whose .prj gives no shift to WGS 84, naming it', async () => {
    // Read with no shift, these sites land about 1.2 km east of where they are.
    expect(await read('grid.zip')).toEqual({ refused: 'noDatumShift', crs: 'MGI 1901 Balkans zone 7' });
  });

  it('uses a shift the .prj gives', async () => {
    // Written with the same shift the .prj states, so it reads back to where
    // it was written from, well within a centimetre.
    const { layers } = await read('shifted.zip');
    expectSites(layers[0], 1e-7);
  });

  it('refuses a .prj nothing can read', async () => {
    expect(await read('badprj.zip')).toEqual({ refused: 'unknownProjection' });
  });

  it('reads a zip with no .prj as stored, and says so', async () => {
    const { layers } = await read('noprj.zip');
    expect(layers[0].assumed).toBe(true);
    expectSites(layers[0], 1e-9);
  });

  it('reads a lone .shp, which has shapes and nothing else', async () => {
    const { layers } = await read('lone.shp', { kind: 'shp' });
    expect(layers).toHaveLength(1);
    expect(layers[0].assumed).toBe(true);
    expectSites(layers[0], 1e-9);
    expect(layers[0].collection.features[0].properties).toEqual({});
  });

  it("reads each layer in a zip, named with its folder, and not Finder's copies", async () => {
    const { layers } = await read('layers.zip');
    expect(layers.map(layer => layer.name).sort()).toEqual(['data/areas', 'data/sites']);
  });

  it('keeps holes and parts', async () => {
    const { layers } = await read('layers.zip');
    const areas = layers.find(layer => layer.name === 'data/areas').collection.features;
    const holed = areas.find(feature => feature.properties.name === 'holed').geometry;
    expect(holed.type).toBe('Polygon');
    expect(holed.coordinates).toHaveLength(2);
    const parts = areas.find(feature => feature.properties.name === 'two parts').geometry;
    expect(parts.type).toBe('MultiPolygon');
    expect(parts.coordinates).toHaveLength(2);
  });

  it('refuses a zip with no shapefile in it', async () => {
    expect(await read('nothing.zip')).toEqual({ refused: 'noShapefile' });
  });

  it('stops unzipping once the shapes and attributes pass the limit', async () => {
    expect(await read('wgs84.zip', { limit: 200 })).toEqual({ refused: 'tooLargeUnzipped', limit: 200 });
  });

  it('throws on a zip too damaged to read, which the panel calls unreadable', async () => {
    const whole = fixture('wgs84.zip');
    await expect(readShapefile(whole.slice(0, 200), { kind: 'zip', limit: FILE_LIMITS.bytes })).rejects.toThrow();
  });
});

describe('readLayers', () => {
  const point = (coordinates, properties = {}) => ({ type: 'Feature', properties, geometry: { type: 'Point', coordinates } });
  const layer = (name, features, assumed = false) => ({ name, assumed, collection: { type: 'FeatureCollection', features } });

  it("puts a zip's layers in one collection, each feature saying which layer it came from", async () => {
    const result = readLayers(await read('layers.zip'));
    expect(result.format).toBe('shapefile');
    expect(result.assumed).toBe(false);
    expect(result.collection.features).toHaveLength(4);
    const first = result.collection.features.find(feature => feature.properties.name === 'Gazimağusa');
    expect(Object.keys(first.properties)).toEqual(['layer', 'name', 'code']);
    expect(first.properties.layer).toBe('data/sites');
  });

  it('adds no layer column to a zip with one layer', async () => {
    const result = readLayers(await read('wgs84.zip'));
    expect(result.collection.features[0].properties).toEqual({ name: 'Gazimağusa', code: 7 });
    expect(result.positions).toBe(2);
  });

  it("never writes over a column of the file's own", () => {
    const result = readLayers({
      layers: [
        layer('a', [point([21, 42], { layer: 'theirs' })]),
        layer('b', [point([21, 42], { layer_2: 'also theirs' })])
      ]
    });
    const [a, b] = result.collection.features;
    expect(a.properties).toEqual({ layer_3: 'a', layer: 'theirs' });
    expect(b.properties).toEqual({ layer_3: 'b', layer_2: 'also theirs' });
  });

  it('says when a layer was assumed to be in degrees', async () => {
    expect(readLayers(await read('noprj.zip')).assumed).toBe(true);
  });

  it('refuses a layer with no .prj that is not in degrees as needing its .prj', async () => {
    expect(readLayers(await read('noprjgrid.zip'))).toEqual({ refused: 'noPrj' });
  });

  it('refuses one with a .prj that still is not in degrees the usual way', () => {
    expect(readLayers({ layers: [layer('a', [point([7535229, 4650713])])] })).toEqual({ refused: 'notDegrees' });
  });

  it("gives the reader's refusals the same checks as a text file's", () => {
    expect(readLayers({ refused: 'noShapefile' })).toEqual({ refused: 'noShapefile' });
    expect(readLayers({ layers: [layer('a', [{ type: 'Feature', properties: {}, geometry: null }])] }))
      .toEqual({ refused: 'empty' });
    expect(readLayers({ layers: [layer('a', [point([21, 42]), point([21, 42])])] }, { limits: { positions: 1 } }))
      .toEqual({ refused: 'tooManyPoints', count: 2, limit: 1 });
  });
});
