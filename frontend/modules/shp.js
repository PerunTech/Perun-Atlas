import { iter } from 'but-unzip';
import proj4 from 'proj4';
import { combine, parseDbf, parseShp } from 'shpjs';

// Built as its own ES module (`vite.modules.config.mjs`) and loaded on first use, keeping shpjs and
// proj4 out of the main bundle. Imports nothing from the rest of the package. The zip is read here
// rather than with shpjs's `parseZip`, which cannot say which layers had a `.prj`.
const PARTS = /\.(shp|dbf|prj|cpg)$/i;

// The `__MACOSX/` folder of `._` files that Finder adds to a zip.
const finderCopy = (path) => path.startsWith('__MACOSX/') || /(^|\/)\._/.test(path);

// proj4 treats a datum it has no parameters for as WGS 84 and applies no shift, and ESRI-dialect `.prj`
// files carry no TOWGS84, so MGI 1901 would land about 1.2 km off. ETRS89 is within a metre.
const NO_SHIFT = new Set([
  'wgs84', 'wgs1984', 'worldgeodeticsystem1984',
  'etrs89', 'etrs1989', 'europeanterrestrialreferencesystem1989'
]);

const nameOf = (crs) => String(crs.name ?? crs.srsCode ?? '').replace(/_/g, ' ').trim();

// Usable when the datum needs no shift, or proj4 has parameters for it (from TOWGS84 or its own table).
const projectionRefusal = (prj) => {
  let crs;
  try {
    crs = proj4(prj).oProj;
  } catch {
    // proj4 throws strings and undefined as well as errors.
    return { refused: 'unknownProjection' };
  }
  if (!crs) return { refused: 'unknownProjection' };

  const datum = String(crs.datumCode ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (Array.isArray(crs.datum_params) || NO_SHIFT.has(datum)) return null;
  return { refused: 'noDatumShift', crs: nameOf(crs) };
};

const text = (bytes) => (bytes ? new TextDecoder().decode(bytes).trim() : undefined);

const layerFrom = ({ name, shp, dbf, prj, cpg }) => {
  const projection = text(prj);
  if (projection) {
    const refusal = projectionRefusal(projection);
    if (refusal) return refusal;
  }
  const shapes = parseShp(shp, projection);
  const rows = dbf ? parseDbf(dbf, text(cpg)) : undefined;
  return { name, collection: combine([shapes, rows]), assumed: !projection };
};

// but-unzip searches backwards for the end record, and without one wraps round and never stops,
// freezing the tab. So a truncated zip is caught here first, over the same range.
const whole = (zip) => {
  const last = zip.length - 22;
  for (let at = last; at >= 0 && at >= last - 0xffff; at -= 1) {
    if (zip[at] === 0x50 && zip[at + 1] === 0x4b && zip[at + 2] === 5 && zip[at + 3] === 6) return true;
  }
  return false;
};

// Grouped by stem regardless of case, as the tools that wrote them treat it. The limit counts inflated
// shapes and attributes, since a small zip can hold a great deal.
const layersIn = async (zip, limit) => {
  if (!whole(zip)) throw new Error('perun-atlas: the zip has no end record, so it is not whole');

  const layers = new Map();
  let size = 0;

  for (const entry of iter(zip)) {
    const path = entry.filename;
    const part = PARTS.exec(path);
    if (!part || finderCopy(path)) continue;

    const kind = part[1].toLowerCase();
    const stem = path.slice(0, -part[0].length);
    const layer = layers.get(stem.toLowerCase()) ?? {};
    layer[kind] = await entry.read();
    if (kind === 'shp') layer.name = stem;
    layers.set(stem.toLowerCase(), layer);

    if (kind === 'shp' || kind === 'dbf') {
      size += layer[kind].byteLength;
      if (size > limit) return { refused: 'tooLargeUnzipped', limit };
    }
  }

  return { layers: [...layers.values()].filter((layer) => layer.shp) };
};

export const readShapefile = async (bytes, { kind, limit }) => {
  // A lone `.shp` has no attributes or projection; `readLayers` checks it is in degrees.
  if (kind === 'shp') {
    return { layers: [{ name: '', collection: combine([parseShp(bytes)]), assumed: true }] };
  }

  const found = await layersIn(new Uint8Array(bytes), limit);
  if (found.refused) return found;
  if (found.layers.length === 0) return { refused: 'noShapefile' };

  const layers = [];
  for (const each of found.layers) {
    const layer = layerFrom(each);
    if (layer.refused) return layer;
    layers.push(layer);
  }
  return { layers };
};
