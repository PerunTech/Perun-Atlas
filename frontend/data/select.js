import { core } from '../spatial';
import { bindPath } from './path';
import { positionsOf } from './positions';
import { latLngOf } from './project';

const { Map, factory } = core;

// Answered over what the map holds, not the database: on a bounding-box layer a radius past the edge
// of the view is answered from a set that stops there. Distances are on the ground.
// Nearest and furthest, for the two readings of "inside". Positions are unprojected first: on a 3857
// deployment stored units read as degrees would put everything millions of metres away.
export const spanTo = (feature, centre, srid, map) => {
  const positions = positionsOf(feature?.geometry);
  if (positions.length === 0) return null;

  const from = factory.latLng(centre);
  const ground = map ?? Map;
  let nearest = Infinity;
  let furthest = 0;

  positions.forEach((position) => {
    const metres = ground.distance(from, factory.latLng(latLngOf(position, srid, map)));
    if (metres < nearest) nearest = metres;
    if (metres > furthest) furthest = metres;
  });

  return { nearest, furthest };
};

// `has` and `metres` are keyed by the feature object, since no property here is reliably unique.
// `inside` comes nearest first.
export const withinCircle = (collection, circle, options = {}) => {
  const { srid, mode = 'touches', map } = options;
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
    const span = spanTo(feature, centre, srid, map);

    // No geometry means not anywhere; it goes with the uncaught ones.
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

// A feature whose template resolves to nothing is left out rather than sent as a literal `{pkid}`.
export const identifiersOf = (features, options = {}) => {
  const { id = '{pkid}', join = ',' } = options;

  return (features ?? [])
    .map((feature) => bindPath(id, feature?.properties ?? {}))
    .filter((text) => text && text !== id)
    .join(join);
};
