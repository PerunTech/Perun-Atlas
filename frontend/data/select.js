import { core } from '../spatial';
import { bindPath } from './path';
import { latLngOf } from './project';

const { Map, factory } = core;

/**
 * Which features fall inside a drawn shape.
 *
 * The question a circle on a map is usually being asked: everything within so
 * far of here. It is answered in the browser, over the collection already
 * decoded, because both halves are already here -- the shape was drawn in this
 * page and the features arrived in one response. Nothing is fetched and nothing
 * is posted.
 *
 * Two things about that answer are worth saying plainly, because neither is
 * visible from the result.
 *
 * It is over what the map has, not over the database. `FeatureSet` is for sets
 * that arrive complete in one response, so for those screens the two are the
 * same thing. A bounding-box layer is a different matter: it holds what is in
 * view, and a radius reaching past the edge of the view would be answered from
 * a set that stops there. `withinCircle` cannot tell the difference and does not
 * try; the caller knows which layer it mounted.
 *
 * And the distance is on the ground, not on the screen or in the projection.
 * `Map.distance` is the same haversine every other measurement in this stack
 * uses, which is what makes "3 km" here the same 3 km the scale bar draws and
 * the same one `unitsPerMetre` converts for a save.
 */

/**
 * Every position in a geometry, whatever shape it is.
 *
 * GeoJSON nests coordinates by type -- a position, an array of them, an array of
 * those -- and the depth is the only difference between a point and a
 * multipolygon. So the depth is what this walks, rather than switching on
 * `type`, and a geometry type nobody thought of still yields its positions.
 *
 * `GeometryCollection` is the one that carries geometries instead of
 * coordinates, so it is named.
 */
const positionsOf = (geometry) => {
  if (!geometry) return [];

  if (geometry.type === 'GeometryCollection') {
    return (geometry.geometries ?? []).flatMap(positionsOf);
  }

  const walk = (node) => {
    if (!Array.isArray(node)) return [];
    // A position is a pair of numbers; anything else is a level of nesting.
    return typeof node[0] === 'number' ? [node] : node.flatMap(walk);
  };

  return walk(geometry.coordinates);
};

/**
 * The ground distance from a centre to the nearest part of a feature, and to its
 * furthest.
 *
 * Both, in one pass, because the two answer the two readings of "inside": a
 * feature is *touched* by the circle when its nearest position is within the
 * radius, and *contained* by it when its furthest is.
 *
 * Positions are unprojected first. The collection is in whatever the deployment
 * stores -- see `latLngOf` -- and measuring stored units as though they were
 * degrees is the failure this exists to avoid: on a 3857 deployment every
 * feature would be millions of metres from everything.
 *
 * @param {Object} feature - A GeoJSON feature.
 * @param {{lat: number, lng: number}} centre
 * @param {string|number} [srid] - What the feature's coordinates are in.
 * @returns {{nearest: number, furthest: number}|null} Metres, or null for a
 *          feature with no geometry to measure.
 */
export const spanTo = (feature, centre, srid) => {
  const positions = positionsOf(feature?.geometry);
  if (positions.length === 0) return null;

  const from = factory.latLng(centre);
  let nearest = Infinity;
  let furthest = 0;

  positions.forEach((position) => {
    const metres = Map.distance(from, factory.latLng(latLngOf(position, srid)));
    if (metres < nearest) nearest = metres;
    if (metres > furthest) furthest = metres;
  });

  return { nearest, furthest };
};

/**
 * The features a circle catches, and the ones it does not.
 *
 * @param {Object} collection - A GeoJSON FeatureCollection, as it arrived.
 * @param {{lat: number, lng: number, radius: number}|null} circle - Radius in
 *        ground metres, which is what `CirclePicker` reports.
 * @param {Object} [options]
 * @param {string|number} [options.srid] - The projection the collection is in.
 * @param {'touches'|'contains'} [options.mode] - Whether a feature reaching into
 *        the circle counts, or only one wholly inside it. `touches` by default,
 *        because the question behind a radius is usually about reach.
 * @returns {Object} `{ inside, outside, has, metres, total }`. `inside` is
 *          nearest first, so a caller that wants the closest five takes them off
 *          the front. `has` and `metres` are keyed by the feature object itself
 *          rather than by an identifier: these are the very objects the layer
 *          drew, and no set of properties here is reliably unique.
 */
export const withinCircle = (collection, circle, options = {}) => {
  const { srid, mode = 'touches' } = options;
  const features = collection?.features ?? [];

  const empty = {
    inside: [],
    outside: features,
    has: () => false,
    metres: () => null,
    total: features.length
  };

  if (!circle || !(circle.radius > 0)) return empty;

  const centre = { lat: circle.lat, lng: circle.lng };
  if (!Number.isFinite(centre.lat) || !Number.isFinite(centre.lng)) return empty;

  const distances = new WeakMap();
  const caught = new WeakSet();
  const inside = [];
  const outside = [];

  features.forEach((feature) => {
    const span = spanTo(feature, centre, srid);

    // A feature with no geometry is not outside the circle; it is not anywhere.
    // It goes with the ones that were not caught, which is where a caller
    // looking for what to draw in grey will expect it.
    if (!span) {
      outside.push(feature);
      return;
    }

    distances.set(feature, span.nearest);

    const hit = mode === 'contains'
      ? span.furthest <= circle.radius
      : span.nearest <= circle.radius;

    if (hit) {
      caught.add(feature);
      inside.push(feature);
    } else {
      outside.push(feature);
    }
  });

  inside.sort((a, b) => distances.get(a) - distances.get(b));

  return {
    inside,
    outside,
    has: (feature) => (feature ? caught.has(feature) : false),
    metres: (feature) => (feature && distances.has(feature) ? distances.get(feature) : null),
    total: features.length
  };
};

/**
 * The caught features as a list a service can read.
 *
 * Templated per feature, the way a ring's vertices are: `id` spells one
 * identifier and `join` is what goes between them, so a service wanting `pkid`
 * and one wanting `OBJECT_ID` differ by a menu row rather than by a change here.
 *
 * A feature whose template resolved to nothing is left out rather than sent as
 * the word `{pkid}`. `bindPath` leaves an unresolved placeholder in place, which
 * is right when it is writing a path a person will read and wrong in a list a
 * service is about to parse -- there, a literal brace is either a rejected
 * request or a row created against an identifier nobody has.
 *
 * @param {Array} features - The features to name.
 * @param {Object} [options] - `id`, a template; `join`, the separator.
 * @returns {string}
 */
export const identifiersOf = (features, options = {}) => {
  const { id = '{pkid}', join = ',' } = options;

  return (features ?? [])
    .map((feature) => bindPath(id, feature?.properties ?? {}))
    .filter((text) => text && text !== id)
    .join(join);
};
