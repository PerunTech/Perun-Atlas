import { valueAt } from './path';
import { cell, columnsFor } from './export';

// Written here rather than with @mapbox/shp-write, which garbles Cyrillic in the `.dbf`, cuts names
// without keeping them unique and drops MultiPoint.
// WGS 84 in ESRI's dialect, as ogr2ogr writes it for EPSG 4326.
export const WGS84_PRJ = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],' +
  'PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]';

// Shape types, as the ESRI specification numbers them.
const POINT = 1;
const POLYLINE = 3;
const POLYGON = 5;
const MULTIPOINT = 8;

const FAMILIES = [
  { name: 'points', types: ['Point', 'MultiPoint'] },
  { name: 'lines', types: ['LineString', 'MultiLineString'], shape: POLYLINE },
  { name: 'polygons', types: ['Polygon', 'MultiPolygon'], shape: POLYGON }
];

const isPosition = (node) => Array.isArray(node) && Number.isFinite(node[0]) && Number.isFinite(node[1]);
const positions = (list) => (Array.isArray(list) ? list.filter(isPosition) : []);

const closed = (ring) => {
  const [first, last] = [ring[0], ring[ring.length - 1]];
  return first[0] === last[0] && first[1] === last[1] ? ring : [...ring, first];
};

// Twice the signed area, positive for clockwise with y increasing northwards.
const clockwise = (ring) => {
  let sum = 0;
  for (let i = 1; i < ring.length; i += 1) {
    sum += (ring[i][0] - ring[i - 1][0]) * (ring[i][1] + ring[i - 1][1]);
  }
  return sum > 0;
};

// A shapefile marks holes by winding: outer rings clockwise, holes the other way. ArcGIS relies on it.
const polygonRings = (polygon) => {
  const [outer, ...holes] = (Array.isArray(polygon) ? polygon : []).map(positions);
  if (!outer?.length) return [];
  return [outer, ...holes.filter(hole => hole.length)]
    .map(closed)
    .map((ring, i) => (clockwise(ring) === (i === 0) ? ring : [...ring].reverse()));
};

const lineParts = (lines) => (Array.isArray(lines) ? lines.map(positions).filter(part => part.length) : []);

const PARTS = {
  Point: (coordinates) => (isPosition(coordinates) ? [[coordinates]] : []),
  MultiPoint: (coordinates) => {
    const all = positions(coordinates);
    return all.length ? [all] : [];
  },
  LineString: (coordinates) => lineParts([coordinates]),
  MultiLineString: lineParts,
  Polygon: polygonRings,
  MultiPolygon: (coordinates) => (Array.isArray(coordinates) ? coordinates.flatMap(polygonRings) : [])
};

const partsOf = (geometry) => PARTS[geometry?.type]?.(geometry.coordinates) ?? [];

const boxOf = (list) => list.reduce(
  ([xmin, ymin, xmax, ymax], [x, y]) => [Math.min(xmin, x), Math.min(ymin, y), Math.max(xmax, x), Math.max(ymax, y)],
  [Infinity, Infinity, -Infinity, -Infinity]
);

const writeBox = (view, at, box) => box.forEach((value, i) => view.setFloat64(at + 8 * i, value, true));

// Bytes after the eight-byte record header.
const contentLength = (shape, parts) => {
  const count = parts.reduce((sum, part) => sum + part.length, 0);
  if (shape === POINT) return 20;
  if (shape === MULTIPOINT) return 40 + 16 * count;
  return 44 + 4 * parts.length + 16 * count;
};

// PolyLine and Polygon share a layout; MultiPoint is the same without parts.
const writeRecord = (view, at, shape, parts) => {
  view.setInt32(at, shape, true);
  if (shape === POINT) {
    const [[[x, y]]] = parts;
    view.setFloat64(at + 4, x, true);
    view.setFloat64(at + 12, y, true);
    return;
  }

  const all = parts.flat();
  writeBox(view, at + 4, boxOf(all));
  let next = at + 36;
  if (shape !== MULTIPOINT) {
    view.setInt32(next, parts.length, true);
    next += 4;
  }
  view.setInt32(next, all.length, true);
  next += 4;
  if (shape !== MULTIPOINT) {
    let start = 0;
    parts.forEach(part => {
      view.setInt32(next, start, true);
      next += 4;
      start += part.length;
    });
  }
  all.forEach(([x, y]) => {
    view.setFloat64(next, x, true);
    view.setFloat64(next + 8, y, true);
    next += 16;
  });
};

// The file code and length are big-endian, the rest little-endian. The length counts 16-bit words.
const writeHeader = (view, shape, box) => {
  view.setInt32(0, 9994);
  view.setInt32(24, view.byteLength / 2);
  view.setInt32(28, 1000, true);
  view.setInt32(32, shape, true);
  writeBox(view, 36, box);
};

const writeShapes = (shape, shapes) => {
  const lengths = shapes.map(parts => contentLength(shape, parts));
  const shp = new DataView(new ArrayBuffer(lengths.reduce((sum, length) => sum + 8 + length, 100)));
  const shx = new DataView(new ArrayBuffer(100 + 8 * shapes.length));
  const box = boxOf(shapes.flatMap(parts => parts.flat()));
  writeHeader(shp, shape, box);
  writeHeader(shx, shape, box);

  let at = 100;
  shapes.forEach((parts, i) => {
    shx.setInt32(100 + 8 * i, at / 2);
    shx.setInt32(104 + 8 * i, lengths[i] / 2);
    shp.setInt32(at, i + 1);
    shp.setInt32(at + 4, lengths[i] / 2);
    writeRecord(shp, at + 8, shape, parts);
    at += 8 + lengths[i];
  });

  return { shp: new Uint8Array(shp.buffer), shx: new Uint8Array(shx.buffer) };
};

const MAX_NAME = 10;

// At most ten characters and unique regardless of case; a clash takes `_1`, `_2`, as GDAL does.
export const shortNames = (columns) => {
  const taken = new Set();
  return columns.map(column => {
    const laundered = String(column.short || column.field).replace(/[^A-Za-z0-9_]/g, '_');
    const base = (/[A-Za-z0-9]/.test(laundered) ? laundered : 'FIELD').slice(0, MAX_NAME);
    let name = base;
    for (let n = 1; taken.has(name.toUpperCase()); n += 1) {
      const suffix = `_${n}`;
      name = base.slice(0, MAX_NAME - suffix.length) + suffix;
    }
    taken.add(name.toUpperCase());
    return { ...column, short: name };
  });
};

const encoder = new TextEncoder();
const SPACE = 0x20;

const MAX_TEXT = 254;
// As wide as ArcGIS reads a number; fifteen decimals is past a double's precision.
const MAX_NUMBER = 19;
const MAX_DECIMALS = 15;

// Cut between characters, never inside one.
const textBytes = (value) => {
  const bytes = encoder.encode(String(value));
  if (bytes.length <= MAX_TEXT) return bytes;
  let end = MAX_TEXT;
  // A byte of the form 10xxxxxx continues a character that began before it.
  while (end > 0 && (bytes[end] & 0xc0) === 0x80) end -= 1;
  return bytes.subarray(0, end);
};

// Not Math.max(...list): spreading a 200,000-row column overruns the engine's argument limit.
const widest = (list, floor = 0) => list.reduce((max, value) => Math.max(max, value), floor);

const decimalsOf = (value) => {
  for (let places = 0; places < MAX_DECIMALS; places += 1) {
    if (Number(value.toFixed(places)) === value) return places;
  }
  return MAX_DECIMALS;
};

// Null when the values won't fit, and the column is then written as text.
const numericField = (values) => {
  const places = widest(values.filter(value => value !== null).map(decimalsOf));
  const texts = values.map(value => (value === null ? null : value.toFixed(places)));
  // `toFixed` writes 1e21 and up with an exponent, which a numeric field cannot hold.
  if (texts.some(text => text?.includes('e'))) return null;
  const width = widest(texts.map(text => text?.length ?? 0));
  return width <= MAX_NUMBER ? { type: 'N', width, decimals: places, cells: texts.map(text => text && encoder.encode(text)) } : null;
};

const fieldOf = (values) => {
  const present = values.filter(value => value !== null && value !== undefined);
  const cleaned = values.map(value => (value === undefined ? null : value));

  if (present.length && present.every(value => typeof value === 'number' && Number.isFinite(value))) {
    const numeric = numericField(cleaned);
    if (numeric) return numeric;
  }
  if (present.length && present.every(value => typeof value === 'boolean')) {
    return { type: 'L', width: 1, decimals: 0, cells: cleaned.map(value => encoder.encode(value === null ? '?' : value ? 'T' : 'F')) };
  }

  const cells = cleaned.map(value => (value === null ? null : textBytes(value)));
  const width = widest(cells.map(bytes => bytes?.length ?? 0), 1);
  return { type: 'C', width, decimals: 0, cells };
};

// Byte 29 names no code page, since dBase has none for UTF-8; the `.cpg` says it, as GDAL does.
// A table needs a column, so features without properties get `FID`.
const writeTable = (columns, features, today) => {
  const fields = columns.length
    ? columns.map(column => ({ name: column.short, ...fieldOf(features.map(feature => valueAt(feature?.properties, column.field))) }))
    : [{ name: 'FID', ...fieldOf(features.map((_, i) => i)) }];

  const headerLength = 32 + 32 * fields.length + 1;
  const recordLength = fields.reduce((sum, field) => sum + field.width, 1);
  const bytes = new Uint8Array(headerLength + recordLength * features.length + 1);
  const view = new DataView(bytes.buffer);

  view.setUint8(0, 0x03);
  view.setUint8(1, today.getFullYear() - 1900);
  view.setUint8(2, today.getMonth() + 1);
  view.setUint8(3, today.getDate());
  view.setUint32(4, features.length, true);
  view.setUint16(8, headerLength, true);
  view.setUint16(10, recordLength, true);

  fields.forEach(({ name, type, width, decimals }, i) => {
    const at = 32 + 32 * i;
    bytes.set(encoder.encode(name), at);
    view.setUint8(at + 11, type.charCodeAt(0));
    view.setUint8(at + 16, width);
    view.setUint8(at + 17, decimals);
  });
  view.setUint8(headerLength - 1, 0x0d);

  bytes.fill(SPACE, headerLength, bytes.length - 1);
  let at = headerLength;
  features.forEach((_, row) => {
    // The first byte of each record is its deletion flag, a space for a live one.
    at += 1;
    fields.forEach(({ type, width, cells }) => {
      const value = cells[row];
      // Numbers are right-aligned and everything else left, padded with spaces.
      if (value) bytes.set(value, type === 'N' ? at + width - value.length : at);
      at += width;
    });
  });
  view.setUint8(bytes.length - 1, 0x1a);

  return bytes;
};

// A `.dbf` holds ten ASCII characters of a name, so the readable headers go here.
const namesTable = (columns) => '﻿' + [
  ['short', 'column', 'header'],
  ...columns.map(({ short, field, header }) => [short, field, header])
].map(row => row.map(cell).join(',')).join('\r\n');

const columnsCarried = (columns, features, exclude) => {
  const carried = new Set(columnsFor(features, { exclude }).map(({ field }) => field));
  return columns.filter(({ field }) => carried.has(field));
};

// With `fields`, every family gets all the columns; without, only those its own features carry.
export const toShapefile = (collection, { stem = 'features', fields, exclude, labelResolver, today = new Date() } = {}) => {
  const features = collection?.features ?? [];
  const columns = shortNames(columnsFor(features, { fields, exclude, labelResolver }));
  const files = [];

  FAMILIES.forEach(({ name, types, shape }) => {
    const members = features
      .filter(feature => types.includes(feature?.geometry?.type))
      .map(feature => ({ feature, parts: partsOf(feature.geometry) }))
      .filter(({ parts }) => parts.length);
    if (!members.length) return;

    // One MultiPoint makes the whole layer MultiPoint, as GDAL writes a mixed layer.
    const type = shape ?? (members.every(({ feature }) => feature.geometry.type === 'Point') ? POINT : MULTIPOINT);
    const own = fields?.length ? columns : columnsCarried(columns, members.map(({ feature }) => feature), exclude);

    const { shp, shx } = writeShapes(type, members.map(({ parts }) => parts));
    const base = `${stem}-${name}`;
    files.push(
      { name: `${base}.shp`, bytes: shp },
      { name: `${base}.shx`, bytes: shx },
      { name: `${base}.dbf`, bytes: writeTable(own, members.map(({ feature }) => feature), today) },
      { name: `${base}.prj`, bytes: encoder.encode(WGS84_PRJ) },
      { name: `${base}.cpg`, bytes: encoder.encode('UTF-8') }
    );
  });

  files.push({ name: `${stem}-fields.csv`, bytes: encoder.encode(namesTable(columns)) });
  return files;
};
