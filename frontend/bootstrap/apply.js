import { config as engine, core } from '../spatial';
import { crsFor } from '../data/project';

const { Map, store } = core;

/**
 * Hands the resolved configuration to the engine.
 *
 * spatial replaced its `window.sys*` globals with `config.configure()`, and in
 * 5.0 removed them, so a deployment's parameters reach the engine as values
 * rather than as script tags a human keeps in step. perun-atlas already resolves
 * those parameters from SVAROG_SYS_PARAMS, which makes it the natural caller:
 * the database is the single source and `index.html` carries no configuration.
 *
 * The two projects name these things differently, and deliberately so — `units`
 * and `bboxOrder` read better in a schema than `measurementSystem` and
 * `switchBboxOrder` — so the mapping lives here, in one table, rather than by
 * renaming either side.
 */
const TO_ENGINE = {
  crs: 'crs',
  center: 'center',
  bounds: 'bounds',
  zoom: 'zoom',
  minZoom: 'minZoom',
  maxZoom: 'maxZoom',
  units: 'measurementSystem',
  bboxOrder: 'switchBboxOrder'
};

/**
 * Warns when the engine did not end up on the CRS this deployment declared.
 *
 * Until spatial 5.0 this was the common case rather than a fault: a map's CRS
 * was fixed when the bundle evaluated, so it came from a `window.sysCrs` on the
 * page and SPATIAL_CRS could not reach it. A deployment that set the parameter
 * and not the global ran on spatial's own default, asked its basemap for tiles
 * far outside the Web Mercator grid, and got back nothing but HTTP 400.
 *
 * `configure({ crs })` now applies, so this is a check rather than a warning
 * about a known limitation — it should only fire if the code is one spatial
 * cannot resolve, and it names the code so that is obvious.
 */
const verifyCrs = (declared) => {
  if (!declared) return;

  const actual = Map.getCRS?.()?.code;
  const wanted = typeof declared === 'object' ? declared.code : declared;
  if (!actual || !wanted || actual === wanted) return;

  console.warn(
    `perun-atlas: this deployment declares ${wanted}, but the map is on ${actual}. ` +
    'The engine could not resolve the declared value — as a plain code it must be ' +
    'EPSG:3857, EPSG:3395 or EPSG:4326, and any other projection needs a proj4 ' +
    'definition. Basemap tiles will be requested outside the grid they are published on.'
  );
};

/**
 * Tells the engine which CRS incoming geometry is in.
 *
 * This does not go through `configure()`, because spatial does not read it from
 * there: its GeoJSON override reads `dbCRSCode` out of its own store on every
 * `addData`. Set it before any geometry is drawn or the default applies, and the
 * default is wrong wherever the database and the map disagree — coordinates are
 * unprojected through the *map's* CRS, so degrees from a 4326 database are read
 * as Web Mercator metres and every feature lands within a few hundred microdegrees
 * of 0,0. It fails silently: the layer draws, `fitBounds` frames it, and the map
 * shows the Gulf of Guinea.
 *
 * Every bundle drawing a map has had to do this for itself — this is the copy in
 * lpis, made shared, which is the whole point of this package.
 */
const applyDataCrs = (srid) => {
  if (!srid) return;

  store.addState('dbCRSCode', { dbCRS: srid });

  // `crsFor` is the same table the bounding box is built from, shared rather than
  // copied: a deployment whose geometry the engine cannot read is one it cannot
  // address a box to either, and the two should never be able to disagree.
  const converted = crsFor(srid);
  if (converted) {
    // Also kept for callers that serialise geometry back out, which need the CRS
    // object rather than the code.
    store.addState('dbCRS', converted);
    return;
  }

  const mapCode = Map.getCRS?.()?.code;
  if (srid !== mapCode?.split(':')[1]) {
    console.warn(
      `perun-atlas: this deployment stores geometry in EPSG:${srid}, which spatial ` +
      `cannot convert from — it handles 3857, 3395 and 4326. Geometry will be read as ` +
      `though it were already in ${mapCode}, and will be drawn in the wrong place.`
    );
  }
};

/**
 * @param {Object} config - A resolved configuration, as `resolve()` returns it.
 * @returns {Object} The engine's settings as they now stand, for logging or tests.
 */
export const applyToEngine = (config = {}) => {
  const settings = {};

  Object.entries(TO_ENGINE).forEach(([ours, theirs]) => {
    if (config[ours] !== undefined) settings[theirs] = config[ours];
  });

  const applied = engine.configure(settings);

  // Both checks read the map's CRS, so both have to run after the engine has
  // been given the chance to change it.
  verifyCrs(config.crs);
  applyDataCrs(config.dataSrid);

  return applied;
};
