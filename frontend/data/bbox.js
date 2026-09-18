import { core } from '../spatial';

const { Map, factory } = core;

/**
 * The bounding box a service is asked for, in the projection it stores.
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
export const bboxIn = (srid) => {
  if (srid === undefined || srid === null) return Map.getBBox();

  const crs = crsFor(srid);
  if (!crs) {
    if (!warned.has(String(srid))) {
      warned.add(String(srid));
      console.warn(
        `perun-atlas: cannot express a bounding box in EPSG:${srid} — the engine builds ` +
        '3857, 3395 and 4326. Asking in the map\'s own projection instead, which is ' +
        'correct only if this deployment stores geometry in it.'
      );
    }
    return Map.getBBox();
  }

  const bounds = Map.getBounds();
  const sw = crs.projection.project(bounds.getSouthWest());
  const ne = crs.projection.project(bounds.getNorthEast());

  return `${sw.x},${sw.y},${ne.x},${ne.y}`;
};
