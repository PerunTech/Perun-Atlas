import { config as engine, core } from '../spatial';
import { crsFor } from '../data/project';

const { Map, store } = core;

// Our setting names → spatial's configure() names.
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

// spatial reads this from its store on every addData, not from configure(). Left unset, degrees
// from a 4326 database are read as metres and every feature lands near 0,0.
const applyDataCrs = (srid) => {
  if (!srid) return;

  store.addState('dbCRSCode', { dbCRS: srid });

  const converted = crsFor(srid);
  if (converted) {
    // For callers that serialise geometry back out.
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

export const applyToEngine = (config = {}) => {
  const settings = {};

  Object.entries(TO_ENGINE).forEach(([ours, theirs]) => {
    if (config[ours] !== undefined) settings[theirs] = config[ours];
  });

  const applied = engine.configure(settings);

  // Both read the map's CRS, so they run after configure().
  verifyCrs(config.crs);
  applyDataCrs(config.dataSrid);

  return applied;
};
