import { gpx, kml } from '@tmcw/togeojson';
import { positionsOf } from './positions';

// Readers answer with a refusal naming the reason, never by throwing; the panel words it.
// Size is checked before a byte is read, and a zip again once unzipped. Positions are the real cost:
// each is a vertex redrawn on every zoom.
export const FILE_LIMITS = {
  bytes: 20 * 1024 * 1024,
  positions: 200000
};

export const sizeRefusal = (bytes, limits = FILE_LIMITS) =>
  bytes > limits.bytes ? { refused: 'tooLarge', size: bytes, limit: limits.bytes } : null;

// A test in node passes its own.
const parseXML = (text) => new DOMParser().parseFromString(text, 'application/xml');

// Browsers return a `parsererror` element instead of throwing; xmldom throws.
const failedParse = (doc) => !doc?.documentElement ||
  doc.getElementsByTagName('parsererror').length > 0;

const asFeature = (feature) => ({
  type: 'Feature',
  ...(feature.id !== undefined && { id: feature.id }),
  properties: feature.properties && typeof feature.properties === 'object' ? feature.properties : {},
  geometry: feature.geometry ?? null
});

const GEOMETRY_TYPES = new Set([
  'Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'
]);

// `crs` is not read: RFC 7946 removed it, and projected coordinates fail the degrees check anyway.
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

// togeojson turns styles into properties, which would fill the record pane with hashes. Removed from
// the document rather than the result, so a data column called `fill` survives.
const STYLE_ELEMENTS = ['Style', 'StyleMap', 'styleUrl'];

const withoutStyles = (doc) => {
  STYLE_ELEMENTS.forEach((tag) => {
    // Copied first: the collection is live, and shrinks as its elements go.
    Array.from(doc.getElementsByTagName(tag)).forEach((node) => node.parentNode?.removeChild(node));
  });
  return doc;
};

// togeojson keeps a CDATA description as an object, which the pane would drop.
const flatDescription = (feature) => {
  const description = feature.properties?.description;
  if (description && typeof description === 'object' && 'value' in description) {
    return { ...feature, properties: { ...feature.properties, description: String(description.value ?? '') } };
  }
  return feature;
};

export const readKML = (doc) => {
  const collection = kml(withoutStyles(doc), { skipNullGeometry: true });
  return { type: 'FeatureCollection', features: collection.features.map(flatDescription).map(asFeature) };
};

export const readGPX = (doc) => {
  const collection = gpx(doc);
  return { type: 'FeatureCollection', features: collection.features.map(asFeature) };
};

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

const positionState = (position) => {
  const [lng, lat] = position;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return 'unreadable';
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return 'notDegrees';
  return null;
};

// A zip and a `.shp` are told apart by their first bytes. A shapefile's other parts have no
// signature, so they go by name.
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

// Features without a geometry are dropped rather than refused.
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

// Read by the first character rather than the extension, so a file whose extension lies still reads.
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
    // togeojson can throw on a document shaped in a way it did not expect.
    console.warn('perun-atlas: a file could not be read', err);
    read = null;
  }
  if (!read) return { refused: 'unreadable' };

  return checked(read, limits);
};

const layerColumn = (layers) => {
  const taken = new Set(layers.flatMap(({ collection }) =>
    collection.features.flatMap(feature => Object.keys(feature?.properties ?? {}))));
  let column = 'layer';
  for (let n = 2; taken.has(column); n += 1) column = `layer_${n}`;
  return column;
};

// A zip's layers open as one file, each feature tagged with its layer when there are several. Without
// a `.prj`, coordinates in range are assumed to be degrees; out of range is `noPrj`, since the fix differs.
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
