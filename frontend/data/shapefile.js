import { valueAt } from './path';
import { cell, columnsFor } from './export';

/**
 * A set, as a shapefile: the format a GIS office expects back.
 *
 * Written here rather than with `@mapbox/shp-write`, which the plan named. Its
 * `dbf` writes one byte per UTF-16 unit, so every Cyrillic name comes out as
 * punctuation. It cuts field names to ten characters without making them unique.
 * Its zip writes every line in a set as one record, while the table keeps a row
 * per feature. It writes a `LineString` and a `MultiLineString` layer under the
 * same name, so one replaces the other, and it drops MultiPoint. The format is
 * small enough that working around all of that would cost more than writing it.
 *
 * Pure on purpose, like `export.js`: a collection in, the files of the zip out,
 * as bytes. `lib/zip.js` packs them and `download` hands them over.
 *
 * A shapefile holds one kind of geometry, so a set is split into points, lines
 * and polygons, one shapefile each, named with the file's stem. A movement screen
 * gives two. A feature with no shape, or a `GeometryCollection`, has no family and
 * is left out; the GeoJSON and the CSV still carry it. Positions are written as
 * the caller hands them over, which `useExport` makes WGS 84 longitude and
 * latitude, so every `.prj` is the same. A third number, an altitude, is dropped.
 */

/**
 * WGS 84, as GDAL, QGIS and ArcGIS write it in a `.prj`: ESRI's dialect, which
 * every shapefile reader knows. Taken from a file `ogr2ogr` wrote for EPSG 4326.
 */
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

/** A ring as a shapefile needs it: closed, its last position the same as its first. */
const closed = (ring) => {
  const [first, last] = [ring[0], ring[ring.length - 1]];
  return first[0] === last[0] && first[1] === last[1] ? ring : [...ring, first];
};

/**
 * Whether a ring runs clockwise, with y increasing northwards. The sum is twice
 * the ring's signed area, and positive for clockwise.
 */
const clockwise = (ring) => {
  let sum = 0;
  for (let i = 1; i < ring.length; i += 1) {
    sum += (ring[i][0] - ring[i - 1][0]) * (ring[i][1] + ring[i - 1][1]);
  }
  return sum > 0;
};

/**
 * A polygon's rings, turned the way a shapefile says which is which.
 *
 * A shapefile polygon is a flat list of rings, with no nesting to say which ring
 * is a hole: an outer ring runs clockwise and a hole the other way. GeoJSON
 * (RFC 7946) asks for the opposite, and older GeoJSON asks for nothing, so each
 * ring is turned to suit. GDAL and QGIS work out nesting for themselves when a
 * file gets this wrong. ArcGIS does not, and draws a wrongly turned outer ring as
 * a hole in nothing.
 *
 * A polygon with no outer ring has nothing to be a hole in, and is dropped.
 */
const polygonRings = (polygon) => {
  const [outer, ...holes] = (Array.isArray(polygon) ? polygon : []).map(positions);
  if (!outer?.length) return [];
  return [outer, ...holes.filter(hole => hole.length)]
    .map(closed)
    .map((ring, i) => (clockwise(ring) === (i === 0) ? ring : [...ring].reverse()));
};

const lineParts = (lines) => (Array.isArray(lines) ? lines.map(positions).filter(part => part.length) : []);

/**
 * A geometry as the parts a shapefile record holds: lists of positions. A point
 * is one part of one position, and a MultiPoint one part of all of them. Empty
 * when there is nothing to write.
 */
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

/** The smallest box around some positions: `[xmin, ymin, xmax, ymax]`. */
const boxOf = (list) => list.reduce(
  ([xmin, ymin, xmax, ymax], [x, y]) => [Math.min(xmin, x), Math.min(ymin, y), Math.max(xmax, x), Math.max(ymax, y)],
  [Infinity, Infinity, -Infinity, -Infinity]
);

const writeBox = (view, at, box) => box.forEach((value, i) => view.setFloat64(at + 8 * i, value, true));

/** How many bytes a record's content takes, after its eight-byte header. */
const contentLength = (shape, parts) => {
  const count = parts.reduce((sum, part) => sum + part.length, 0);
  if (shape === POINT) return 20;
  if (shape === MULTIPOINT) return 40 + 16 * count;
  return 44 + 4 * parts.length + 16 * count;
};

/** One record's content. PolyLine and Polygon are laid out alike, and MultiPoint is them without parts. */
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

/**
 * The header a `.shp` and its `.shx` share. The file code and the length are
 * big-endian and the rest little-endian, as the specification has it. The
 * length counts 16-bit words.
 */
const writeHeader = (view, shape, box) => {
  view.setInt32(0, 9994);
  view.setInt32(24, view.byteLength / 2);
  view.setInt32(28, 1000, true);
  view.setInt32(32, shape, true);
  writeBox(view, 36, box);
};

/**
 * The `.shp` and the `.shx` for one family: the shapes, and where each one
 * starts. Records are numbered from one.
 */
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

/**
 * The name each column has in the `.dbf`: at most ten characters, letters,
 * digits and underscores, and unique without regard to case.
 *
 * A row's `short` is taken first, else the column itself, with anything else
 * made an underscore and the rest cut off. A name already taken ends in `_1`,
 * `_2` and so on, cut to fit, which is what GDAL does: `VILLAGE_CODE` and
 * `VILLAGE_COUNT` become `VILLAGE_CO` and `VILLAGE__1`. Worked out once for the
 * whole set, so a column has the same name in every file of the zip.
 */
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

// The widest a character field can be, in bytes.
const MAX_TEXT = 254;
// The widest number, and the most decimals it keeps. Nineteen is as wide as
// ArcGIS reads a number; fifteen decimals is past a double's precision.
const MAX_NUMBER = 19;
const MAX_DECIMALS = 15;

/**
 * A value as UTF-8, cut to what a character field holds.
 *
 * Cut between characters, never inside one: a letter's bytes left half written
 * would make the whole value unreadable to a strict decoder. The `.cpg` says
 * UTF-8, so a reader decodes them as such.
 */
const textBytes = (value) => {
  const bytes = encoder.encode(String(value));
  if (bytes.length <= MAX_TEXT) return bytes;
  let end = MAX_TEXT;
  // A byte of the form 10xxxxxx continues a character that began before it.
  while (end > 0 && (bytes[end] & 0xc0) === 0x80) end -= 1;
  return bytes.subarray(0, end);
};

/**
 * The largest of some numbers, or `floor`. Not `Math.max(...list)`: a column is
 * as long as the set, and a spread of 200,000 arguments overruns the engine's
 * limit on them.
 */
const widest = (list, floor = 0) => list.reduce((max, value) => Math.max(max, value), floor);

/** The fewest decimals that write a number back exactly, up to fifteen. */
const decimalsOf = (value) => {
  for (let places = 0; places < MAX_DECIMALS; places += 1) {
    if (Number(value.toFixed(places)) === value) return places;
  }
  return MAX_DECIMALS;
};

/**
 * A column of numbers, as a numeric field: as many decimals as its values need,
 * and as wide as its widest. Null when the values will not fit, and the column is
 * then written as text.
 */
const numericField = (values) => {
  const places = widest(values.filter(value => value !== null).map(decimalsOf));
  const texts = values.map(value => (value === null ? null : value.toFixed(places)));
  // `toFixed` writes a number from 1e21 up with an exponent, `1e+21`, which is
  // short enough to fit and which a numeric field cannot hold.
  if (texts.some(text => text?.includes('e'))) return null;
  const width = widest(texts.map(text => text?.length ?? 0));
  return width <= MAX_NUMBER ? { type: 'N', width, decimals: places, cells: texts.map(text => text && encoder.encode(text)) } : null;
};

/**
 * What a column's `.dbf` field is, from the values it holds.
 *
 * A number where every value is one, logical where every value is true or false,
 * and text otherwise, with numbers and the rest written as the CSV writes them.
 * Each is as wide as its widest value, rather than a fixed 254 bytes of spaces for
 * every text field. An empty value is blank, whatever the type.
 */
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

/**
 * The `.dbf`: one row per feature, in the order the `.shp` has them.
 *
 * dBase III, which every shapefile reader reads. Byte 29 names no code page,
 * since none of dBase's is UTF-8; the `.cpg` beside it does, which is how GDAL
 * writes UTF-8 too.
 *
 * A table needs a column. Features with no properties at all get `FID`, their
 * number from zero, as GDAL gives them.
 */
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

/**
 * What each short name stands for, as a CSV beside the shapefiles: the name in
 * the `.dbf`, the column it was cut from, and the header the CSV export gives it.
 * A `.dbf` holds ten ASCII characters of a name and nothing else, so this file is
 * the one place the readable headers go, in whatever script they are in.
 *
 * With the BOM that tells a spreadsheet it is UTF-8, as `download` gives the CSV
 * export.
 */
const namesTable = (columns) => '﻿' + [
  ['short', 'column', 'header'],
  ...columns.map(({ short, field, header }) => [short, field, header])
].map(row => row.map(cell).join(',')).join('\r\n');

/** Of the set's columns, the ones these features carry. */
const columnsCarried = (columns, features, exclude) => {
  const carried = new Set(columnsFor(features, { exclude }).map(({ field }) => field));
  return columns.filter(({ field }) => carried.has(field));
};

/**
 * The collection, as the files of a zipped shapefile.
 *
 * For each family the set has, `<stem>-points`, `-lines` or `-polygons`, with its
 * `.shp`, `.shx`, `.dbf`, `.prj` and a `.cpg` saying UTF-8. Then
 * `<stem>-fields.csv`, from short names to columns and headers.
 *
 * The columns are the ones the CSV and the KML carry, and `fields`, `exclude` and
 * `labelResolver` mean what they mean for `toCSV`. With `fields`, every family has
 * all of them. Without, each family has the columns its own features carry, so a
 * line's table is not padded with a site's columns. A field in `fields` can give
 * the short name it takes with `short`.
 *
 * @param {Object} collection - GeoJSON FeatureCollection, in longitude and latitude.
 * @param {Object} [options]
 * @param {string} [options.stem] - The name each file starts with.
 * @param {Array}  [options.fields] - [{ field, label, short }], fixing the columns.
 * @param {Array}  [options.exclude] - Property names to leave out, when `fields` is not given.
 * @param {Function} [options.labelResolver] - Turns a field's label into display text.
 * @param {Date} [options.today] - The date each `.dbf` says it was written.
 * @returns {Array<{name: string, bytes: Uint8Array}>} The files, in zip order.
 */
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

    // Points are written as points unless one of them is a MultiPoint, which a
    // point record cannot hold. Then every one is a MultiPoint, one of a single
    // position, as GDAL writes a mixed layer.
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
