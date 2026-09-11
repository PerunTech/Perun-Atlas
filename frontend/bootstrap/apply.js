import { config as engine, core } from '../spatial';

const { Map, factory, store } = core;

/**
 * Hands the resolved configuration to the engine.
 *
 * spatial 4.2.1 replaced its `window.sys*` globals with `config.configure()`, so
 * a deployment's parameters can reach the engine as values rather than as script
 * tags a human keeps in step. perun-atlas already resolves those parameters from
 * SVAROG_SYS_PARAMS, which makes it the natural caller: the database becomes the
 * single source and `index.html` stops carrying configuration.
 *
 * The two projects name these things differently, and deliberately so — `units`
 * and `bboxOrder` read better in a schema than `measurementSystem` and
 * `switchBboxOrder` — so the mapping lives here, in one table, rather than by
 * renaming either side.
 */
const TO_ENGINE = {
  center: 'center',
  bounds: 'bounds',
  units: 'measurementSystem',
  bboxOrder: 'switchBboxOrder'
};

/**
 * Warns when the deployment's declared CRS is not the one the map was built with.
 *
 * `crs` is the one setting `configure()` cannot deliver: spatial constructs its
 * map as its bundle evaluates, and Leaflet fixes a map's CRS at construction, so
 * the value has to be on the page before any of this runs. Rather than write a
 * setting that would not take effect — and leave `settings()` describing a map
 * that does not exist — say plainly that the two disagree.
 *
 * This is the check that turns a whole class of silent failure into one line:
 * XYZ basemaps only exist on the Web Mercator tile grid, so a map built with a
 * national projection requests tiles far outside it and every one comes back 400.
 */
const checkCrs = (declared) => {
  if (!declared) return;

  const actual = Map.getCRS?.()?.code;
  const wanted = typeof declared === 'object' ? declared.code : declared;
  if (!actual || !wanted || actual === wanted) return;

  console.warn(
    `perun-atlas: this deployment declares ${wanted}, but the map was built with ${actual}. ` +
    'A map\'s CRS is fixed when spatial loads, so it comes from the page, not from ' +
    'SVAROG_SYS_PARAMS — set window.sysCrs in index.html to match, or expect tile ' +
    'requests outside the grid your basemaps are published on.'
  );
};

/** The conversions spatial's GeoJSON reader can perform. */
const CONVERTIBLE = {
  '3857': () => factory.CRS.EPSG3857,
  '3395': () => factory.CRS.EPSG3395,
  '4326': () => factory.CRS.EPSG4326
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

  const convert = CONVERTIBLE[srid];
  if (convert) {
    // Also kept for callers that serialise geometry back out, which need the CRS
    // object rather than the code.
    store.addState('dbCRS', convert());
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

  checkCrs(config.crs);
  applyDataCrs(config.dataSrid);

  return engine.configure(settings);
};
