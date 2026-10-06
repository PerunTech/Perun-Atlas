import { describe, expect, it } from 'vitest';
import { iter } from 'but-unzip';
import { shortNames, toShapefile, WGS84_PRJ } from '../../frontend/data/shapefile';
import { FILE_LIMITS } from '../../frontend/data/read';
import { crc32, zip } from '../../frontend/lib/zip';
import { readShapefile } from '../../frontend/modules/shp';

/**
 * The shapefile writer, read back through the shapefile reader.
 *
 * Session 4's reader is shpjs, which the writer shares nothing with, so a file
 * that comes back as it went in was written the way the format says. GDAL reads
 * the same files in the bench; this is the half that runs on every pipeline.
 */

const feature = (properties, geometry) => ({ type: 'Feature', properties, geometry });
const point = (properties, coordinates) => feature(properties, { type: 'Point', coordinates });

// A square with a hole, both wound the way RFC 7946 asks: the outline
// anticlockwise, the hole clockwise. A shapefile wants the opposite.
const OUTLINE = [[21.3, 41.9], [21.6, 41.9], [21.6, 42.1], [21.3, 42.1], [21.3, 41.9]];
const HOLE = [[21.4, 41.95], [21.4, 42.0], [21.5, 42.0], [21.5, 41.95], [21.4, 41.95]];
const SQUARE = (x, y) => [[x, y], [x + 0.1, y], [x + 0.1, y + 0.1], [x, y + 0.1], [x, y]];

const SET = {
  type: 'FeatureCollection',
  features: [
    point({ NAME: 'Скопје', CODE: 7, RATIO: 0.5, OPEN: true }, [21.4394, 41.9981]),
    point({ NAME: 'Gazimağusa', CODE: 8, RATIO: 0.125, OPEN: false }, [21.5, 42.05]),
    feature({ FROM: 7, TO: 8 }, { type: 'LineString', coordinates: [[21.4394, 41.9981], [21.5, 42.05]] }),
    feature({ FROM: 8, TO: 7 }, { type: 'MultiLineString', coordinates: [[[21.5, 42.05], [21.45, 42.0]], [[21.45, 42.0], [21.4394, 41.9981]]] }),
    feature({ NAME: 'holed' }, { type: 'Polygon', coordinates: [OUTLINE, HOLE] }),
    feature({ NAME: 'two parts' }, { type: 'MultiPolygon', coordinates: [[SQUARE(21.0, 41.0)], [SQUARE(21.2, 41.2)]] }),
    feature({ NAME: 'nowhere' }, null),
    feature({ NAME: 'bundle' }, { type: 'GeometryCollection', geometries: [] })
  ]
};

const bufferOf = (bytes) => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

/** The files written for a set, zipped and read back: `{ files, layers }`, layers by family. */
const roundTrip = async (collection, options = {}) => {
  const files = toShapefile(collection, { stem: 'sites', ...options });
  const read = await readShapefile(bufferOf(await zip(files)), { kind: 'zip', limit: FILE_LIMITS.bytes });
  const layers = Object.fromEntries((read.layers ?? []).map(layer => [layer.name.replace(/^sites-/, ''), layer.collection]));
  return { files, layers, read };
};

const fileNamed = (files, name) => files.find(file => file.name === name)?.bytes;

/** A `.dbf`'s field descriptors: `{ name, type, width, decimals }`. */
const fieldsOf = (dbf) => {
  const view = new DataView(bufferOf(dbf));
  const fields = [];
  for (let at = 32; dbf[at] !== 0x0d; at += 32) {
    fields.push({
      name: new TextDecoder().decode(dbf.subarray(at, at + 11)).replace(/\0+$/, ''),
      type: String.fromCharCode(dbf[at + 11]),
      width: view.getUint8(at + 16),
      decimals: view.getUint8(at + 17)
    });
  }
  return fields;
};

const shapeTypeOf = (shp) => new DataView(bufferOf(shp)).getInt32(32, true);

/** The rings of the first record in a polygon `.shp`, as the bytes hold them. */
const firstRings = (shp) => {
  const view = new DataView(bufferOf(shp));
  const content = 108;
  const [parts, points] = [view.getInt32(content + 36, true), view.getInt32(content + 40, true)];
  const starts = Array.from({ length: parts }, (_, i) => view.getInt32(content + 44 + 4 * i, true));
  const at = (i) => content + 44 + 4 * parts + 16 * i;
  const position = (i) => [view.getFloat64(at(i), true), view.getFloat64(at(i) + 8, true)];
  return starts.map((start, i) => Array.from({ length: (starts[i + 1] ?? points) - start }, (_, k) => position(start + k)));
};

/** Twice a ring's signed area, positive for clockwise with y increasing northwards. */
const turn = (ring) => ring.slice(1).reduce((sum, [x, y], i) => sum + (x - ring[i][0]) * (y + ring[i][1]), 0);

describe('toShapefile', () => {
  it('writes a shapefile for each kind of geometry the set has, and the list of names', () => {
    expect(toShapefile(SET, { stem: 'sites' }).map(file => file.name)).toEqual([
      'sites-points.shp', 'sites-points.shx', 'sites-points.dbf', 'sites-points.prj', 'sites-points.cpg',
      'sites-lines.shp', 'sites-lines.shx', 'sites-lines.dbf', 'sites-lines.prj', 'sites-lines.cpg',
      'sites-polygons.shp', 'sites-polygons.shx', 'sites-polygons.dbf', 'sites-polygons.prj', 'sites-polygons.cpg',
      'sites-fields.csv'
    ]);
  });

  it('writes no file for a kind the set does not have', () => {
    const names = toShapefile({ features: [SET.features[0]] }, { stem: 'sites' }).map(file => file.name);
    expect(names.filter(name => /\.shp$/.test(name))).toEqual(['sites-points.shp']);
  });

  it('says WGS 84 in every .prj and UTF-8 in every .cpg', () => {
    const files = toShapefile(SET);
    const text = (pattern) => files.filter(file => pattern.test(file.name)).map(file => new TextDecoder().decode(file.bytes));
    expect(text(/\.prj$/)).toEqual([WGS84_PRJ, WGS84_PRJ, WGS84_PRJ]);
    expect(text(/\.cpg$/)).toEqual(['UTF-8', 'UTF-8', 'UTF-8']);
  });

  it('reads back with each feature in its family, and the ones with no shape left out', async () => {
    const { layers } = await roundTrip(SET);
    expect(Object.keys(layers)).toEqual(['points', 'lines', 'polygons']);
    expect(layers.points.features).toHaveLength(2);
    expect(layers.lines.features).toHaveLength(2);
    expect(layers.polygons.features).toHaveLength(2);
    expect(layers.points.features[0].geometry).toEqual({ type: 'Point', coordinates: [21.4394, 41.9981] });
  });

  it('reads back every value in its own column, Cyrillic included', async () => {
    const { layers } = await roundTrip(SET);
    expect(layers.points.features.map(each => each.properties)).toEqual([
      { NAME: 'Скопје', CODE: 7, RATIO: 0.5, OPEN: true },
      { NAME: 'Gazimağusa', CODE: 8, RATIO: 0.125, OPEN: false }
    ]);
  });

  it("gives each family the columns its own features carry, not the others'", async () => {
    const { layers } = await roundTrip(SET);
    expect(Object.keys(layers.lines.features[0].properties)).toEqual(['FROM', 'TO']);
    expect(Object.keys(layers.polygons.features[0].properties)).toEqual(['NAME']);
  });

  it('gives every family every column a row names in fields', () => {
    const files = toShapefile(SET, { fields: [{ field: 'NAME' }, { field: 'FROM' }] });
    const names = (family) => fieldsOf(fileNamed(files, `features-${family}.dbf`)).map(field => field.name);
    expect(names('points')).toEqual(['NAME', 'FROM']);
    expect(names('lines')).toEqual(['NAME', 'FROM']);
  });

  it('keeps holes and parts', async () => {
    const { layers } = await roundTrip(SET);
    const [holed, twoParts] = layers.polygons.features.map(each => each.geometry);
    expect(holed.type).toBe('Polygon');
    expect(holed.coordinates).toHaveLength(2);
    expect(twoParts.type).toBe('MultiPolygon');
    expect(twoParts.coordinates).toHaveLength(2);
    expect(layers.lines.features[1].geometry.type).toBe('MultiLineString');
  });

  // Read from the bytes, not back through shpjs: it forgives a polygon wound the
  // wrong way round by trying every ring reversed. ArcGIS does not.
  it('winds an outline clockwise and a hole the other way, whichever way they came', () => {
    const reversed = feature({}, { type: 'Polygon', coordinates: [[...OUTLINE].reverse(), [...HOLE].reverse()] });
    for (const polygon of [SET.features[4], reversed]) {
      const [outline, hole] = firstRings(fileNamed(toShapefile({ features: [polygon] }), 'features-polygons.shp'));
      expect(turn(outline)).toBeGreaterThan(0);
      expect(turn(hole)).toBeLessThan(0);
      expect(outline).toContainEqual([21.3, 41.9]);
      expect(hole).toContainEqual([21.4, 41.95]);
    }
  });

  it('closes a ring that does not end where it starts', async () => {
    const open = feature({}, { type: 'Polygon', coordinates: [OUTLINE.slice(0, -1)] });
    const { layers } = await roundTrip({ features: [open] });
    const [ring] = layers.polygons.features[0].geometry.coordinates;
    expect(ring).toHaveLength(5);
    expect(ring[0]).toEqual(ring[4]);
  });

  it('writes points as points, and all of them as MultiPoint once one is', async () => {
    expect(shapeTypeOf(fileNamed(toShapefile(SET), 'features-points.shp'))).toBe(1);

    const mixed = { features: [SET.features[0], feature({}, { type: 'MultiPoint', coordinates: [[21.4, 42.0], [21.45, 42.0]] })] };
    expect(shapeTypeOf(fileNamed(toShapefile(mixed), 'features-points.shp'))).toBe(8);
    const { layers } = await roundTrip(mixed);
    // shpjs reads a MultiPoint of one position as a Point.
    expect(layers.points.features.map(each => each.geometry.type)).toEqual(['Point', 'MultiPoint']);
  });

  it('drops an altitude, which a two-dimensional shapefile has no room for', async () => {
    const { layers } = await roundTrip({ features: [point({}, [21.4, 42.0, 312])] });
    expect(layers.points.features[0].geometry.coordinates).toEqual([21.4, 42.0]);
  });

  it('sizes a text field to its widest value, in bytes rather than letters', () => {
    const [name] = fieldsOf(fileNamed(toShapefile(SET), 'features-points.dbf'));
    // Скопје is six letters and twelve bytes; Gazimağusa is ten letters and eleven.
    expect(name).toEqual({ name: 'NAME', type: 'C', width: 12, decimals: 0 });
  });

  it('cuts text at 254 bytes, between two letters rather than inside one', async () => {
    // One byte, then two a letter: byte 254 is the second half of a letter.
    const long = 'a' + 'Ж'.repeat(200);
    const { files, layers } = await roundTrip({ features: [point({ NOTE: long }, [21.4, 42.0])] });
    expect(fieldsOf(fileNamed(files, 'sites-points.dbf'))[0].width).toBe(253);
    expect(layers.points.features[0].properties.NOTE).toBe('a' + 'Ж'.repeat(126));
  });

  it('gives a number the decimals it needs and no more', async () => {
    const values = [{ N: 1, R: 2.5 }, { N: -12, R: 0.125 }, { N: 300, R: 0.1 + 0.2 }];
    const { files, layers } = await roundTrip({ features: values.map(properties => point(properties, [21.4, 42.0])) });
    const [n, r] = fieldsOf(fileNamed(files, 'sites-points.dbf'));
    expect(n).toEqual({ name: 'N', type: 'N', width: 3, decimals: 0 });
    expect(r).toMatchObject({ type: 'N', decimals: 15 });
    const back = layers.points.features.map(each => each.properties);
    expect(back.map(each => each.N)).toEqual([1, -12, 300]);
    expect(back[1].R).toBe(0.125);
    expect(back[2].R).toBeCloseTo(0.3, 14);
  });

  it('writes numbers right-aligned and text left-aligned, as dBase does', () => {
    const dbf = fileNamed(toShapefile({ features: [point({ N: 7, T: 'a' }, [21.4, 42.0]), point({ N: 300, T: 'abc' }, [21.5, 42.0])] }), 'features-points.dbf');
    const records = new TextDecoder().decode(dbf.subarray(dbf.length - 1 - 14, dbf.length - 1));
    expect(records).toBe(' ' + '  7' + 'a  ' + ' ' + '300' + 'abc');
  });

  it('writes a number too long for a numeric field as text', () => {
    for (const big of [1e21, 2 ** 64]) {
      const dbf = fileNamed(toShapefile({ features: [point({ N: big }, [21.4, 42.0])] }), 'features-points.dbf');
      expect(fieldsOf(dbf)[0].type).toBe('C');
    }
  });

  it('writes a column that mixes numbers and text as text', async () => {
    const { files, layers } = await roundTrip({ features: [point({ C: 7 }, [21.4, 42.0]), point({ C: '7a' }, [21.5, 42.0])] });
    expect(fieldsOf(fileNamed(files, 'sites-points.dbf'))[0].type).toBe('C');
    expect(layers.points.features.map(each => each.properties.C)).toEqual(['7', '7a']);
  });

  it('leaves an empty value blank, whatever the type', () => {
    const files = toShapefile({ features: [point({ N: 1, T: 'x', B: true }, [21.4, 42.0]), point({ N: null, T: null }, [21.5, 42.0])] });
    const dbf = fileNamed(files, 'features-points.dbf');
    const record = dbf.subarray(dbf.length - 1 - 4, dbf.length - 1);
    // Deletion flag, then N (1), T (1) and B (1), which a missing value marks unknown.
    expect(new TextDecoder().decode(record)).toBe('   ?');
  });

  it('gives a table with no columns the FID GDAL would', () => {
    const [fid] = fieldsOf(fileNamed(toShapefile({ features: [point({}, [21.4, 42.0])] }), 'features-points.dbf'));
    expect(fid).toMatchObject({ name: 'FID', type: 'N' });
  });

  it('lists each short name with its column and header, with a BOM for spreadsheets', () => {
    const fields = [{ field: 'VILLAGE_CODE', label: 'v.code' }, { field: 'VILLAGE_COUNT' }, { field: 'NAME', label: 'n, full' }];
    const files = toShapefile({ features: [point({}, [21.4, 42.0])] }, { stem: 'sites', fields, labelResolver: (code) => (code === 'v.code' ? 'Село' : null) });
    expect(new TextDecoder('utf-8', { ignoreBOM: true }).decode(fileNamed(files, 'sites-fields.csv')).split('\r\n')).toEqual([
      '﻿short,column,header',
      'VILLAGE_CO,VILLAGE_CODE,Село',
      'VILLAGE__1,VILLAGE_COUNT,VILLAGE_COUNT',
      'NAME,NAME,"n, full"'
    ]);
  });
});

describe('shortNames', () => {
  const names = (columns) => shortNames(columns.map(each => (typeof each === 'string' ? { field: each } : each))).map(each => each.short);

  it('cuts a name to ten characters, numbering a clash as GDAL does', () => {
    expect(names(['VILLAGE_CODE', 'VILLAGE_COUNT', 'VILLAGE_COLOUR'])).toEqual(['VILLAGE_CO', 'VILLAGE__1', 'VILLAGE__2']);
  });

  it('takes the numbering to two digits when it needs them', () => {
    const many = Array.from({ length: 11 }, (_, i) => `LONG_NAME_${i}`);
    expect(names(many).slice(-2)).toEqual(['LONG_NAM_9', 'LONG_NA_10']);
  });

  it('counts a name in another case as the same name', () => {
    expect(names(['code', 'CODE'])).toEqual(['code', 'CODE_1']);
  });

  it('turns anything but letters, digits and underscores into an underscore', () => {
    expect(names(['T.CODE', 'a b'])).toEqual(['T_CODE', 'a_b']);
  });

  it('names a column with nothing usable in it FIELD', () => {
    expect(names(['Село', 'Град'])).toEqual(['FIELD', 'FIELD_1']);
  });

  it("takes a row's short name first, and holds it to the same rules", () => {
    expect(names([{ field: 'VILLAGE_CODE', short: 'VCODE' }, { field: 'X', short: 'VCODE' }, { field: 'Y', short: 'far too long' }]))
      .toEqual(['VCODE', 'VCODE_1', 'far_too_lo']);
  });
});

describe('zip', () => {
  const unzipped = async (bytes) => {
    const out = {};
    for (const entry of iter(bytes)) out[entry.filename] = new TextDecoder().decode(await entry.read());
    return out;
  };
  const files = [
    { name: 'a.txt', bytes: new TextEncoder().encode('hello '.repeat(100)) },
    { name: 'Скопје.csv', bytes: new TextEncoder().encode('x,y') }
  ];

  it('computes the CRC-32 zip records', () => {
    expect(crc32(new TextEncoder().encode('The quick brown fox jumps over the lazy dog'))).toBe(0x414fa339);
  });

  it('writes a zip that opens, deflated or stored, with every name as UTF-8', async () => {
    for (const compress of [true, false]) {
      const bytes = await zip(files, { compress });
      expect(await unzipped(bytes)).toEqual({ 'a.txt': 'hello '.repeat(100), 'Скопје.csv': 'x,y' });
      const header = new DataView(bufferOf(bytes));
      // Bit 11 of the local header's flags: the name is UTF-8.
      expect(header.getUint16(6, true) & 0x0800).toBe(0x0800);
      // The CRC of the bytes before compression, which a reader checks them by.
      expect(header.getUint32(14, true)).toBe(crc32(files[0].bytes));
    }
  });

  it('deflates what shrinks and stores what does not', async () => {
    const method = (bytes, at = 0) => new DataView(bufferOf(bytes)).getUint16(at + 8, true);
    expect(method(await zip([files[0]]))).toBe(8);
    expect(method(await zip([files[1]]))).toBe(0);
  });

  it('stamps each file with the time given, as MS-DOS writes it', async () => {
    const view = new DataView(bufferOf(await zip([files[1]], { now: new Date(2026, 8, 29, 14, 30, 10) })));
    expect(view.getUint16(10, true)).toBe((14 << 11) | (30 << 5) | 5);
    expect(view.getUint16(12, true)).toBe((46 << 9) | (9 << 5) | 29);
  });
});
