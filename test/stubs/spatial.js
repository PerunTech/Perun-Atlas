/**
 * The map engine, as the modules under test see it.
 *
 * The projections and the distance are Leaflet's own, transcribed rather than
 * invented: `L.Projection.LonLat`, `L.Projection.SphericalMercator`,
 * `L.Projection.Mercator` and `L.CRS.Earth.distance`. That is the whole point of
 * this file. `project.js` measures a projection's scale by projecting two points
 * and dividing by the ground distance between them, so a stub carrying made-up
 * arithmetic would test itself; carrying Leaflet's, the numbers a test asserts
 * are the numbers the browser produces.
 *
 * The export shape is the engine's: modules hang off the prototype, because
 * `frontend/spatial.js` reaches them with `getPrototypeOf`. Going through that
 * shim rather than around it keeps the package's one rule -- one caller of the
 * engine -- exercised by every test that touches geometry.
 */

const R = 6378137;
const R_MINOR = 6356752.314245179;
const MAX_LATITUDE = 85.0511287798;
const RAD = Math.PI / 180;

/** L.Projection.LonLat: degrees straight through, which is what EPSG:4326 is. */
const lonLat = {
  project: (latlng) => ({ x: latlng.lng, y: latlng.lat })
};

/** L.Projection.SphericalMercator, EPSG:3857. */
const sphericalMercator = {
  project: (latlng) => {
    const lat = Math.max(Math.min(MAX_LATITUDE, latlng.lat), -MAX_LATITUDE);
    const sin = Math.sin(lat * RAD);
    return {
      x: R * latlng.lng * RAD,
      y: (R * Math.log((1 + sin) / (1 - sin))) / 2
    };
  }
};

/** L.Projection.Mercator, EPSG:3395 -- elliptical, and a different number. */
const mercator = {
  project: (latlng) => {
    const y = latlng.lat * RAD;
    const tmp = R_MINOR / R;
    const e = Math.sqrt(1 - tmp * tmp);
    const con = e * Math.sin(y);
    const ts = Math.tan(Math.PI / 4 - y / 2) / ((1 - con) / (1 + con)) ** (e / 2);
    return { x: latlng.lng * RAD * R, y: -R * Math.log(Math.max(ts, 1e-10)) };
  }
};

const CRS = {
  EPSG4326: { projection: lonLat },
  EPSG3857: { projection: sphericalMercator },
  EPSG3395: { projection: mercator }
};

/** L.CRS.Earth.distance -- haversine on a 6371 km sphere. */
const distance = (a, b) => {
  const earth = 6371000;
  const lat1 = a.lat * RAD;
  const lat2 = b.lat * RAD;
  const sinDLat = Math.sin(((b.lat - a.lat) * RAD) / 2);
  const sinDLon = Math.sin(((b.lng - a.lng) * RAD) / 2);
  const x = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return earth * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const latLng = (value) => (Array.isArray(value)
  ? { lat: value[0], lng: value[1] }
  : { lat: value.lat, lng: value.lng });

/** A bounds in the shape `bboxIn` reads it: two corners, by method. */
export const latLngBounds = (sw, ne) => ({
  getSouthWest: () => latLng(sw),
  getNorthEast: () => latLng(ne)
});

/**
 * What the map currently is.
 *
 * Driven by the test rather than by a view, because none of the code under test
 * moves a map -- it asks one where it is. `setView` is this file's whole API to
 * a test, and `resetView` puts it back so one test cannot lean on another.
 */
const INITIAL = {
  crs: CRS.EPSG3857,
  bounds: latLngBounds({ lat: 34.5, lng: 32.2 }, { lat: 35.8, lng: 34.6 }),
  bbox: '3584418,4106711,3851622,4283490',
  zoom: 10
};

let view = { ...INITIAL };

export const setView = (next) => { view = { ...view, ...next }; };
export const resetView = () => { view = { ...INITIAL }; };
export const CRS_STUB = CRS;

const core = {
  Map: {
    getCRS: () => view.crs,
    getBounds: () => view.bounds,
    getBBox: () => view.bbox,
    getZoom: () => view.zoom,
    distance
  },
  factory: { CRS, latLng, latLngBounds }
};

const engine = {
  assets: {},
  config: {},
  core,
  data: { geobuf: {}, Pbf: function Pbf() {} },
  tools: {},
  ui: {},
  proj4: null
};

// The engine assembles its modules onto the prototype; `frontend/spatial.js`
// reads them back with getPrototypeOf. Mirrored so that shim is under test too.
export const spatial = Object.create(engine);
