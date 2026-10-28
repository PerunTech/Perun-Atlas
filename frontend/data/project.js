import { core } from '../spatial';
import { mapPositions } from './positions';

const { Map, factory } = core;

// Thunks: `factory.CRS` does not exist yet when this module is imported.
const CONVERTIBLE = {
  3857: () => factory.CRS.EPSG3857,
  3395: () => factory.CRS.EPSG3395,
  4326: () => factory.CRS.EPSG4326
};

export const crsFor = (srid) => CONVERTIBLE[String(srid)]?.() ?? null;

// A page can hold several maps. spatial's own is the fallback: right projection, nobody's view.
const mapFor = (map) => map ?? Map;

// Once per code: a warning per pan would bury the console on a bbox map.
const warned = new Set();

const projectionFor = (srid) => {
  if (srid === undefined || srid === null) return null;

  const crs = crsFor(srid);
  if (crs) return crs;

  if (!warned.has(String(srid))) {
    warned.add(String(srid));
    console.warn(
      `perun-atlas: cannot express a coordinate in EPSG:${srid} — the engine builds ` +
      '3857, 3395 and 4326. Using the map\'s own projection instead, which is ' +
      'correct only if this deployment stores geometry in it.'
    );
  }
  return null;
};

// The map's getBBox() projects through the map's CRS, which suits a tile server but not a geometry
// service comparing against stored coordinates: it matches nothing and the map shows empty.
export const bboxIn = (srid, map) => {
  const crs = projectionFor(srid);
  if (!crs) return mapFor(map).getBBox();

  const bounds = mapFor(map).getBounds();
  const sw = crs.projection.project(bounds.getSouthWest());
  const ne = crs.projection.project(bounds.getNorthEast());

  return `${sw.x},${sw.y},${ne.x},${ne.y}`;
};

export const pointIn = (latlng, srid, map) => {
  const crs = projectionFor(srid) ?? mapFor(map).getCRS();
  const { x, y } = crs.projection.project(factory.latLng(latlng));
  return { x, y };
};

// spatial unprojects only what reaches a layer, so anything reading the collection itself holds
// stored units.
export const latLngOf = (position, srid, map) => {
  const [x, y] = Array.isArray(position) ? position : [position?.x, position?.y];
  const crs = projectionFor(srid) ?? mapFor(map).getCRS();
  const { lat, lng } = crs.projection.unproject(factory.point(x, y));
  return { lat, lng };
};

// For files written out: GeoJSON and KML positions are WGS 84 by definition.
export const inDegrees = (collection, srid, map) => mapPositions(collection, (position) => {
  const { lat, lng } = latLngOf(position, srid, map);
  return [lng, lat, ...position.slice(2)];
});

// spatial's GeoJSON layer reads every position as stored units, whatever coordsToLatLng a caller passes.
export const fromDegrees = (collection, srid, map) => mapPositions(collection, (position) => {
  const { x, y } = pointIn({ lat: position[1], lng: position[0] }, srid, map);
  return [x, y, ...position.slice(2)];
});

// Measured off the projection rather than derived, so it holds for any CRS the engine builds. Sent
// unconverted, a Web Mercator circle at 35°N is a fifth too small.
export const unitsPerMetre = (latlng, srid, map) => scalesAt(latlng, srid, map).ew;

// The two differ in a geographic CRS: at 35°N a degree of longitude is 91 km, one of latitude 111.
const scalesAt = (latlng, srid, map) => {
  const step = 0.001;
  const here = factory.latLng(latlng);
  const east = factory.latLng({ lat: here.lat, lng: here.lng + step });
  const north = factory.latLng({ lat: here.lat + step, lng: here.lng });

  const a = pointIn(here, srid, map);
  const eastGround = mapFor(map).distance(here, east);
  const northGround = mapFor(map).distance(here, north);

  return {
    ew: eastGround ? Math.abs(pointIn(east, srid, map).x - a.x) / eastGround : 1,
    ns: northGround ? Math.abs(pointIn(north, srid, map).y - a.y) / northGround : 1
  };
};

// A thousandth of the shape's size: six decimals for degrees, Leaflet's own default, and one for metres.
const decimalsFor = (size) => {
  if (!(size > 0)) return 6;
  return Math.min(12, Math.max(0, 3 - Math.floor(Math.log10(size))));
};

const roundTo = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

// Round on the ground: each axis takes its own scale, so in degrees the ring is an ellipse. Left open,
// since the services close it themselves.
export const ringIn = (centre, metres, srid, points = 24, map) => {
  const { ew, ns } = scalesAt(centre, srid, map);
  const { x, y } = pointIn(centre, srid, map);
  const rx = metres * ew;
  const ry = metres * ns;
  const places = decimalsFor(Math.min(rx, ry));

  return Array.from({ length: Math.max(3, points) }, (unused, i) => {
    const angle = (2 * Math.PI * i) / Math.max(3, points);
    return {
      x: roundTo(x + rx * Math.cos(angle), places),
      y: roundTo(y + ry * Math.sin(angle), places)
    };
  });
};
