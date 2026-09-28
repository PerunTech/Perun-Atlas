import { gpx, kml } from '@tmcw/togeojson';
import { positionsOf } from './positions';

/**
 * A file the reader brought, as a FeatureCollection.
 *
 * The other direction from `export.js`: text in, a collection out, and nothing
 * in between that knows about a map. What arrives is in longitude and latitude,
 * because every format read here is -- RFC 7946 defines GeoJSON that way, and
 * KML and GPX have no other coordinate system. Converting to the deployment's
 * stored units is the caller's step (`fromDegrees`), the same way converting out
 * of them is `useExport`'s.
 *
 * Each reader answers with the collection or with a refusal naming the reason,
 * never by throwing. A refusal is something the reader of the map has to be
 * told, in words, with the numbers that caused it -- see `refusalText` -- and a
 * thrown error is something a console gets told.
 *
 * `@tmcw/togeojson` does the KML and GPX. It has no dependencies of its own and
 * walks a parsed document rather than parsing one, so the parser is the
 * browser's `DOMParser` and a test can hand it another.
 *
 * Shapefiles are the exception to text in. Their reader is `modules/shp.js`,
 * loaded only when one is opened, which hands back layers already converted from
 * their `.prj` to longitude and latitude. `readLayers` gives those the same
 * checks `readFile` gives text.
 */

/**
 * The largest file that is read at all, and the most positions one may draw.
 *
 * The size is checked before a byte is read, so a file far too large is turned
 * away without the tab first holding all of it as a string. A zip is checked
 * twice: as it is, and again on the shapes and attributes it holds once
 * unzipped, since those are what is parsed. The positions are
 * the real cost: every one becomes a vertex the renderer draws and redraws on
 * each zoom. A day's GPS track at one fix a second is about 86,000 of them, and
 * fits with room to spare.
 */
export const FILE_LIMITS = {
  bytes: 20 * 1024 * 1024,
  positions: 200000
};

/**
 * A refusal for a file too large to read, or null.
 *
 * @param {number} bytes - `File.size`.
 * @param {Object} [limits]
 * @returns {Object|null} `{ refused: 'tooLarge', size, limit }`.
 */
export const sizeRefusal = (bytes, limits = FILE_LIMITS) =>
  bytes > limits.bytes ? { refused: 'tooLarge', size: bytes, limit: limits.bytes } : null;

/** The browser's XML parser. A test in node passes its own. */
const parseXML = (text) => new DOMParser().parseFromString(text, 'application/xml');

/**
 * Whether a parse failed.
 *
 * Browsers do not throw on malformed XML: they hand back a document holding a
 * `parsererror` element, at the root or inside it depending on the browser.
 * xmldom throws instead, which the caller catches.
 */
const failedParse = (doc) => !doc?.documentElement ||
  doc.getElementsByTagName('parsererror').length > 0;

/** A feature, reduced to the members this package reads, with an object for properties. */
const asFeature = (feature) => ({
  type: 'Feature',
  ...(feature.id !== undefined && { id: feature.id }),
  properties: feature.properties && typeof feature.properties === 'object' ? feature.properties : {},
  geometry: feature.geometry ?? null
});

const GEOMETRY_TYPES = new Set([
  'Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'
]);

/**
 * GeoJSON text as a collection, or null when it is not GeoJSON.
 *
 * A FeatureCollection, a lone Feature or a bare geometry: all three are GeoJSON
 * texts, and a file saved out of another tool is as likely to be one as another.
 * A member called `crs` is not read. RFC 7946 removed it, and a file that still
 * carries one naming a projected grid has coordinates far outside the range of
 * degrees, which the check after this turns away.
 */
export const readGeoJSON = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (parsed?.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
    return { type: 'FeatureCollection', features: parsed.features.filter(f => f?.type === 'Feature').map(asFeature) };
  }
  if (parsed?.type === 'Feature') return { type: 'FeatureCollection', features: [asFeature(parsed)] };
  if (GEOMETRY_TYPES.has(parsed?.type)) {
    return { type: 'FeatureCollection', features: [asFeature({ geometry: parsed })] };
  }
  return null;
};

/**
 * What a KML placemark's style would have added to its properties.
 *
 * togeojson turns a placemark's style into properties -- `styleUrl`,
 * `styleHash`, `stroke`, `fill-opacity`, `icon` and the rest -- so that a map
 * can draw the file the way Google Earth would. This overlay draws every file
 * in one style of its own, so those would be a record pane full of hashes and
 * colour codes describing nothing on screen. Taking the elements out of the
 * document before it is read, rather than the keys out of the result, keeps a
 * column that happens to be called `fill` in the file's own data.
 */
const STYLE_ELEMENTS = ['Style', 'StyleMap', 'styleUrl'];

const withoutStyles = (doc) => {
  STYLE_ELEMENTS.forEach((tag) => {
    // Copied first: the collection is live, and shrinks as its elements go.
    Array.from(doc.getElementsByTagName(tag)).forEach((node) => node.parentNode?.removeChild(node));
  });
  return doc;
};

/**
 * A description as its text.
 *
 * togeojson keeps a description written as CDATA in an object marked as HTML,
 * which the pane would drop as not flat. It is shown as the text it is, markup
 * and all, because the pane writes text and never parses it.
 */
const flatDescription = (feature) => {
  const description = feature.properties?.description;
  if (description && typeof description === 'object' && 'value' in description) {
    return { ...feature, properties: { ...feature.properties, description: String(description.value ?? '') } };
  }
  return feature;
};

/** A parsed KML document as a collection. Placemarks with no geometry are left out. */
export const readKML = (doc) => {
  const collection = kml(withoutStyles(doc), { skipNullGeometry: true });
  return { type: 'FeatureCollection', features: collection.features.map(flatDescription).map(asFeature) };
};

/** A parsed GPX document as a collection: tracks, routes, then waypoints. */
export const readGPX = (doc) => {
  const collection = gpx(doc);
  return { type: 'FeatureCollection', features: collection.features.map(asFeature) };
};

/** XML text, read by whichever reader its root element asks for. */
const readXML = (text, parse) => {
  let doc;
  try {
    doc = parse(text);
  } catch {
    return null;
  }
  if (failedParse(doc)) return null;

  const root = doc.documentElement.localName ?? doc.documentElement.nodeName;
  if (root === 'kml') return { format: 'kml', collection: readKML(doc) };
  if (root === 'gpx') return { format: 'gpx', collection: readGPX(doc) };
  return null;
};

/**
 * Whether a position is a real one, and whether it is in degrees.
 *
 * Out of range is its own refusal because it says something the reader can act
 * on: this file is in a projected grid, and the tool that wrote it can write
 * longitude and latitude instead.
 */
const positionState = (position) => {
  const [lng, lat] = position;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return 'unreadable';
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return 'notDegrees';
  return null;
};

/**
 * What a picked file is, before any of it is parsed.
 *
 * A zip and a `.shp` are told apart by their first bytes, as the text formats
 * are by their first character: a zip starts `PK`, and a `.shp` with its file
 * code, 9994 as a big-endian integer. Neither can be read as text, and both need
 * the shapefile reader, which is loaded only for them.
 *
 * A shapefile's other parts are told apart by name, since none of them has a
 * signature. Each is refused with its own reason: none holds a shape.
 *
 * @param {ArrayBuffer} bytes - The file's contents.
 * @param {string} [name] - The file's name.
 * @returns {string} `zip`, `shp`, `part` or `text`.
 */
export const fileKind = (bytes, name = '') => {
  const head = new Uint8Array(bytes, 0, Math.min(4, bytes.byteLength));
  // A zip's first entry, or the end record of a zip with no entries.
  if (head[0] === 0x50 && head[1] === 0x4b && ((head[2] === 3 && head[3] === 4) || (head[2] === 5 && head[3] === 6))) {
    return 'zip';
  }
  if (head[0] === 0 && head[1] === 0 && head[2] === 0x27 && head[3] === 0x0a) return 'shp';
  if (/\.(dbf|shx|prj|cpg)$/i.test(name)) return 'part';
  return 'text';
};

/**
 * A collection that was read, checked the way every file is: `{ format,
 * collection, positions }`, or the refusal.
 *
 * The checks, in the order a reader would want to hear them: it holds nothing to
 * draw, it is too large to draw, it is not in longitude and latitude. Features
 * without a geometry are dropped rather than refused, since nothing about them
 * can be drawn and the rest of the file can.
 */
const checked = ({ format, collection }, limits) => {
  const drawable = collection.features
    .map(feature => ({ feature, positions: positionsOf(feature.geometry) }))
    .filter(({ positions }) => positions.length > 0);
  if (drawable.length === 0) return { refused: 'empty' };

  const positions = drawable.reduce((sum, each) => sum + each.positions.length, 0);
  if (positions > limits.positions) return { refused: 'tooManyPoints', count: positions, limit: limits.positions };

  for (const each of drawable) {
    for (const position of each.positions) {
      const state = positionState(position);
      if (state) return { refused: state };
    }
  }

  const features = drawable.map(({ feature }) => feature);
  return { format, collection: { type: 'FeatureCollection', features }, positions };
};

/**
 * A file's text as a collection in degrees, or the reason it cannot be one.
 *
 * Told apart by what the text is rather than by the file's name: a `.json` saved
 * from one tool and a `.geojson` from another are the same thing, and a file
 * whose extension lies is read for what it holds. The first character decides,
 * since a GeoJSON text is an object and an XML one starts with a tag.
 *
 * @param {string} text - The file's contents.
 * @param {Object} [options]
 * @param {Function} [options.parse] - XML text to a Document. The browser's
 *        `DOMParser` unless given.
 * @param {Object} [options.limits] - `FILE_LIMITS` unless given.
 * @returns {Object} `{ format, collection, positions }` for a file that can be
 *          drawn, or `{ refused, ...numbers }` for one that cannot. `refused` is
 *          `unreadable`, `empty`, `tooManyPoints` (with `count` and `limit`) or
 *          `notDegrees`.
 */
export const readFile = (text, { parse = parseXML, limits = FILE_LIMITS } = {}) => {
  const body = String(text ?? '').replace(/^﻿/, '').trimStart();

  let read = null;
  try {
    if (body.startsWith('{')) {
      const collection = readGeoJSON(body);
      read = collection && { format: 'geojson', collection };
    } else if (body.startsWith('<')) {
      read = readXML(body, parse);
    }
  } catch (err) {
    // togeojson on a document shaped in a way it did not expect. The file is
    // unreadable to this overlay either way; the console gets the detail.
    console.warn('perun-atlas: a file could not be read', err);
    read = null;
  }
  if (!read) return { refused: 'unreadable' };

  return checked(read, limits);
};

/**
 * The name of the column a zip's layer goes in: `layer`, unless the file already
 * has a column by that name, in which case `layer_2`, and so on. The file's own
 * columns are never written over.
 */
const layerColumn = (layers) => {
  const taken = new Set(layers.flatMap(({ collection }) =>
    collection.features.flatMap(feature => Object.keys(feature?.properties ?? {}))));
  let column = 'layer';
  for (let n = 2; taken.has(column); n += 1) column = `layer_${n}`;
  return column;
};

/**
 * What the shapefile reader returned, as one collection in degrees, or the
 * reason it cannot be one.
 *
 * A zip can hold several layers. They open together, as one file, since the zip
 * is one file to the reader who picked it, and each feature says which layer it
 * came from in a column the record pane shows. A zip with one layer gets no such
 * column: it would only repeat the file's name.
 *
 * A layer with no `.prj` was read as it is stored. Coordinates in range are
 * taken to be longitude and latitude, and the result says so in `assumed`, which
 * the panel tells the reader. Coordinates out of range are refused as `noPrj`
 * rather than `notDegrees`, because the fix is different: the file is in some
 * grid, and without its `.prj` nothing says which.
 *
 * @param {Object} read - `readShapefile`'s answer: `{ layers }` or a refusal.
 * @param {Object} [options]
 * @param {Object} [options.limits] - `FILE_LIMITS` unless given.
 * @returns {Object} `{ format: 'shapefile', collection, positions, assumed }`,
 *          or `{ refused, ...details }`.
 */
export const readLayers = (read, { limits = FILE_LIMITS } = {}) => {
  if (read.refused) return read;

  const column = read.layers.length > 1 ? layerColumn(read.layers) : null;
  const features = read.layers.flatMap(({ name, collection }) => collection.features.map((feature) => {
    const one = asFeature(feature);
    return column ? { ...one, properties: { [column]: name, ...one.properties } } : one;
  }));

  const assumed = read.layers.some(layer => layer.assumed);
  const result = checked({ format: 'shapefile', collection: { type: 'FeatureCollection', features } }, limits);
  if (result.refused === 'notDegrees' && assumed) return { refused: 'noPrj' };
  return result.refused ? result : { ...result, assumed };
};
