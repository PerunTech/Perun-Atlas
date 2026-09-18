import { core } from '../spatial';

const { Map, factory } = core;

/**
 * Coordinates in the projection a service keeps its geometry in.
 *
 * A map and the database under it need not share a projection, and on these
 * deployments they routinely do not: the map is drawn in `SPATIAL_CRS` because
 * that is the grid its basemap tiles are published on, and geometry is stored in
 * `sys.gis.default_srid` because that is what the SDI tables hold. The engine
 * already reconciles one direction -- it is told the data's SRID and unprojects
 * incoming geometry through it.
 *
 * The other direction had nothing doing the same job. `Map.getBBox()` projects
 * the view through the *map's* CRS, which is right for a WMS request, because a
 * tile server is asked in the CRS the tiles are published on. It is wrong for a
 * geometry service, which compares the box against stored coordinates: Web
 * Mercator metres read as degrees describe a box far outside any real extent, so
 * the query matches nothing and the screen shows an empty map rather than an
 * error.
 */

/**
 * The CRS objects the engine can build from a bare EPSG code.
 *
 * Thunks rather than values: this module is imported before a map exists, and
 * `factory.CRS` is not there to be read at that point.
 *
 * The same three the engine's GeoJSON reader can convert between, which is not a
 * coincidence -- a deployment it cannot read geometry from is one this cannot
 * address a bounding box to either, and both say so rather than guessing.
 */
const CONVERTIBLE = {
  3857: () => factory.CRS.EPSG3857,
  3395: () => factory.CRS.EPSG3395,
  4326: () => factory.CRS.EPSG4326
};

/** A CRS object for a bare EPSG code, or null where the engine has none. */
export const crsFor = (srid) => CONVERTIBLE[String(srid)]?.() ?? null;

/** Said once per code: a warning per pan would bury the console on a bbox map. */
const warned = new Set();

/**
 * The current view as `minx,miny,maxx,maxy` in the given projection.
 *
 * With no code, or one the engine cannot build, the map's own CRS is used and
 * the result is exactly what `Map.getBBox()` returns -- which is the right
 * answer when the two agree, and the only answer available when they do not.
 * The second case says so, because a box in the wrong projection fails by
 * matching nothing, and an empty map is the least informative symptom there is.
 *
 * @param {string|number} [srid] - EPSG code to express the box in.
 * @returns {string} Four comma-separated numbers, as the services expect.
 */
/**
 * The CRS to express a coordinate in, or null to use the map's own.
 *
 * Said once per code rather than per call, and shared by everything below so
 * that one unconvertible SRID is one line in the console however many things
 * ask about it.
 */
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

export const bboxIn = (srid) => {
  const crs = projectionFor(srid);
  if (!crs) return Map.getBBox();

  const bounds = Map.getBounds();
  const sw = crs.projection.project(bounds.getSouthWest());
  const ne = crs.projection.project(bounds.getNorthEast());

  return `${sw.x},${sw.y},${ne.x},${ne.y}`;
};

/**
 * One point, in the projection a service stores.
 *
 * The same conversion `bboxIn` makes for the two corners of the view, for the
 * one coordinate a screen sends back -- a drawn centre, a picked location. With
 * no code, or one the engine cannot build, the map's own projection is used, and
 * the warning above says so once.
 *
 * @param {{lat: number, lng: number}} latlng
 * @param {string|number} [srid] - EPSG code to express the point in.
 * @returns {{x: number, y: number}}
 */
export const pointIn = (latlng, srid) => {
  const crs = projectionFor(srid) ?? Map.getCRS();
  const { x, y } = crs.projection.project(factory.latLng(latlng));
  return { x, y };
};

/**
 * How many units of a projection go to a metre on the ground, at a place.
 *
 * A distance drawn on the map is in metres, because that is what the reader
 * measured and what Leaflet sizes a circle by. A service that stores Web
 * Mercator wants the same distance in *its* units, and those are not metres
 * anywhere but the equator -- at 35° north a projected metre is about 0.82 real
 * ones, so a circle sent across unconverted is a fifth too small. In degrees the
 * gap is four orders of magnitude rather than a fifth, and the shape is a dot.
 *
 * Measured rather than derived: the ratio is read off the projection itself, by
 * projecting two points a short way apart and comparing that to the ground
 * distance Leaflet computes between them. No projection's scale formula is
 * written down here, so this is right for any CRS the engine can build and stays
 * right for the next one.
 *
 * East-west and at the point's own latitude, which is where a conformal
 * projection's scale is the same in every direction. It is not constant over a
 * large shape -- a circle spanning degrees of latitude has no single scale --
 * and neither does the service that receives it, which draws its circle in
 * projected units from one radius.
 *
 * @param {{lat: number, lng: number}} latlng - Where the scale is measured.
 * @param {string|number} [srid]
 * @returns {number} Projected units per ground metre, or 1 where it cannot be measured.
 */
export const unitsPerMetre = (latlng, srid) => {
  // A thousandth of a degree: far enough that floating point noise is nothing
  // beside it, near enough that the scale has not changed across it.
  const step = 0.001;
  const here = factory.latLng(latlng);
  const along = factory.latLng({ lat: here.lat, lng: here.lng + step });

  const ground = Map.distance(here, along);
  if (!ground) return 1;

  const a = pointIn(here, srid);
  const b = pointIn(along, srid);

  return Math.abs(b.x - a.x) / ground;
};
