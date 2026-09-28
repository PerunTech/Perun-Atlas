import { iter } from 'but-unzip';
import proj4 from 'proj4';
import { combine, parseDbf, parseShp } from 'shpjs';

/**
 * Shapefiles, read on demand.
 *
 * Not part of `perun-atlas.js`. `vite.modules.config.mjs` builds this as an ES
 * module of its own, `shp.perun-atlas.js` beside the bundle, and `lib/modules.js`
 * loads it with the browser's `import()` the first time a reader opens a
 * shapefile. shpjs brings proj4, and neither belongs in the download of every
 * screen that draws a map.
 *
 * Bytes in, FeatureCollections in longitude and latitude out. It imports nothing
 * from perun-core, spatial or the rest of this package, so it can be built alone
 * and cannot disagree with the bundle that loads it about anything but this
 * function. The checks every file gets -- nothing to draw, too many points, not
 * in degrees -- are `readLayers` in `data/read.js`, in the bundle, so a shapefile
 * gets the same checks a GeoJSON does.
 *
 * shpjs's own `parseZip` is not used, because it cannot say which layers had a
 * `.prj`, and a layer without one has its coordinates assumed to be longitude and
 * latitude, which the reader is told. So the zip is read here, and shpjs parses
 * the parts.
 *
 * Answers with `{ layers }` or with `{ refused, ...details }`, in the words
 * `readFile` uses. A zip or a `.shp` too damaged to parse throws, and the caller
 * treats that as unreadable.
 */

const PARTS = /\.(shp|dbf|prj|cpg)$/i;

/**
 * What Finder adds to a zip it makes: a `__MACOSX/` folder of `._` files, one
 * beside each real file and under the same name. They are not shapefiles.
 */
const finderCopy = (path) => path.startsWith('__MACOSX/') || /(^|\/)\._/.test(path);

/**
 * The datums that need no shift to WGS 84, by the code proj4 gives them.
 *
 * WGS 84 itself, and ETRS89, which is within a metre of it across Europe. proj4
 * treats any other datum it has no parameters for as if it were WGS 84 too, and
 * converts it with no shift at all. That is the trap: a `.prj` written by GDAL,
 * QGIS or ArcGIS is ESRI's dialect, which carries no `TOWGS84`, so a file in the
 * Balkans' Gauss-Krueger zone 7 (MGI 1901) would land about 1.2 km off, with
 * nothing to say so.
 */
const NO_SHIFT = new Set([
  'wgs84', 'wgs1984', 'worldgeodeticsystem1984',
  'etrs89', 'etrs1989', 'europeanterrestrialreferencesystem1989'
]);

/** A projection's name as a reader would write it: `MGI_1901_Balkans_zone_7` as `MGI 1901 Balkans zone 7`. */
const nameOf = (crs) => String(crs.name ?? crs.srsCode ?? '').replace(/_/g, ' ').trim();

/**
 * Whether a `.prj` can be used, and why not when it cannot.
 *
 * Usable when proj4 can read it and knows how to shift its datum to WGS 84:
 * because the datum needs no shift, because the `.prj` gives one in a
 * `TOWGS84`, or because the datum is one of the few proj4 carries parameters for.
 * The last two both arrive as `datum_params`.
 *
 * @param {string} prj - The `.prj`'s text.
 * @returns {Object|null} Null for a usable one, or a refusal.
 */
const projectionRefusal = (prj) => {
  let crs;
  try {
    crs = proj4(prj).oProj;
  } catch {
    // proj4 throws strings and undefined as well as errors, and says nothing
    // useful in any of them.
    return { refused: 'unknownProjection' };
  }
  if (!crs) return { refused: 'unknownProjection' };

  const datum = String(crs.datumCode ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (Array.isArray(crs.datum_params) || NO_SHIFT.has(datum)) return null;
  return { refused: 'noDatumShift', crs: nameOf(crs) };
};

const text = (bytes) => (bytes ? new TextDecoder().decode(bytes).trim() : undefined);

/**
 * One layer: its shapes, its attributes if it has a `.dbf`, converted to
 * longitude and latitude if it has a `.prj`.
 *
 * shpjs takes the `.prj` as text and reads it with proj4 again, which costs
 * nothing next to the shapes, and returns positions as `[lng, lat]` -- or as
 * stored, when there is no `.prj`.
 */
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

/**
 * Whether a zip is whole: whether its end record is where a zip's has to be,
 * in the last 22 bytes or before a comment of up to 65,535 bytes.
 *
 * but-unzip looks for that record from the end backwards. When it is not there,
 * as in a download cut short, the search reaches the first byte and
 * `lastIndexOf` then wraps round to the end and starts again. It never stops,
 * because every zip starts with the byte it is looking for. In a browser that
 * is a frozen tab. So the record is looked for here first, over the same range,
 * and a zip without one is not handed on.
 */
const whole = (zip) => {
  const last = zip.length - 22;
  for (let at = last; at >= 0 && at >= last - 0xffff; at -= 1) {
    if (zip[at] === 0x50 && zip[at + 1] === 0x4b && zip[at + 2] === 5 && zip[at + 3] === 6) return true;
  }
  return false;
};

/**
 * A zip's shapefiles, grouped into layers by the name their parts share.
 *
 * Grouped without regard to case, because a `SITES.SHP` beside a `sites.dbf` is
 * one layer to the tools that wrote it. A layer is named after its `.shp`, with
 * the folder it is in: two layers can share a name in different folders.
 *
 * The parts are inflated one at a time, and the count stops once the shapes and
 * attributes pass `limit`. A zip is refused on its own size before this, but a
 * small zip can hold a great deal: the limit is on what would be parsed. The
 * refusal gives no size, since nothing past the limit was inflated to count.
 */
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

/**
 * A shapefile's layers, each as a FeatureCollection in longitude and latitude.
 *
 * @param {ArrayBuffer} bytes - The picked file's contents.
 * @param {Object} options
 * @param {string} options.kind - `zip`, or `shp` for a lone `.shp`, as
 *        `fileKind` told them apart.
 * @param {number} options.limit - The most bytes of shapes and attributes to
 *        parse.
 * @returns {Promise<Object>} `{ layers: [{ name, collection, assumed }] }`, where
 *          `assumed` is true for a layer with no `.prj`. Or `{ refused }`:
 *          `noShapefile`, `unknownProjection`, `noDatumShift` (with `crs`) or
 *          `tooLargeUnzipped` (with `limit`).
 */
export const readShapefile = async (bytes, { kind, limit }) => {
  // A lone `.shp` has neither attributes nor a projection. What it holds is
  // read as it is, and `readLayers` checks that it is in degrees.
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
