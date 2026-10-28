// Leaflet's own projection and distance arithmetic, transcribed: `project.js` measures scale with it,
// so made-up numbers would only test the stub.

const R = 6378137;
const R_MINOR = 6356752.314245179;
const MAX_LATITUDE = 85.0511287798;
const RAD = Math.PI / 180;

/** L.Projection.LonLat: degrees straight through, which is what EPSG:4326 is. */
const lonLat = {
  project: (latlng) => ({ x: latlng.lng, y: latlng.lat }),
  unproject: (point) => ({ lat: point.y, lng: point.x })
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
  },
  unproject: (point) => {
    const d = 180 / Math.PI;
    return {
      lat: (2 * Math.atan(Math.exp(point.y / R)) - Math.PI / 2) * d,
      lng: (point.x * d) / R
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
  },
  // Iterative, as Leaflet's is: the elliptical inverse has no closed form, and a
  // stub that solved it some other way would not be the thing under test.
  unproject: (point) => {
    const d = 180 / Math.PI;
    const tmp = R_MINOR / R;
    const e = Math.sqrt(1 - tmp * tmp);
    const ts = Math.exp(-point.y / R);
    let phi = Math.PI / 2 - 2 * Math.atan(ts);

    for (let i = 0, dphi = 0.1; i < 15 && Math.abs(dphi) > 1e-7; i += 1) {
      let con = e * Math.sin(phi);
      con = ((1 - con) / (1 + con)) ** (e / 2);
      dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
      phi += dphi;
    }

    return { lat: phi * d, lng: (point.x * d) / R };
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

// Set by the test; `resetView` keeps one test from leaning on another.
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

// A map whose view no `setView` reaches, to show a function reads the map it is given.
export const mapWith = (own = {}) => {
  const at = { ...INITIAL, ...own };
  return {
    getCRS: () => at.crs,
    getBounds: () => at.bounds,
    getBBox: () => at.bbox,
    getZoom: () => at.zoom,
    distance
  };
};

const core = {
  Map: {
    getCRS: () => view.crs,
    getBounds: () => view.bounds,
    getBBox: () => view.bbox,
    getZoom: () => view.zoom,
    distance
  },
  createMap: (element, options = {}) => mapWith(options),
  factory: { CRS, latLng, latLngBounds, point: (x, y) => ({ x, y }) }
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
