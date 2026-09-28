/**
 * The positions in a geometry, read or rewritten.
 *
 * GeoJSON nests coordinates by type -- a position, an array of them, an array of
 * those -- and the depth is the only difference between a point and a
 * multipolygon. So the depth is what these walk, rather than switching on
 * `type`, and a geometry type nobody thought of is still walked whole.
 *
 * `GeometryCollection` is the one that carries geometries instead of
 * coordinates, so it is named.
 *
 * Pure on purpose: no engine, no projection. A caller that needs positions in
 * another projection hands `mapPositions` the conversion, which is how
 * `inDegrees` in `project.js` uses it.
 */

/** A position is an array of numbers; anything else is a level of nesting. */
const isPosition = (node) => Array.isArray(node) && typeof node[0] === 'number';

/**
 * Every position in a geometry, whatever shape it is.
 *
 * @param {Object|null} geometry - A GeoJSON geometry.
 * @returns {number[][]} Each position as it is stored, in document order.
 */
export const positionsOf = (geometry) => {
  if (!geometry) return [];

  if (geometry.type === 'GeometryCollection') {
    return (geometry.geometries ?? []).flatMap(positionsOf);
  }

  const walk = (node) => {
    if (!Array.isArray(node)) return [];
    return isPosition(node) ? [node] : node.flatMap(walk);
  };

  return walk(geometry.coordinates);
};

/** A geometry with every position passed through `convert`. */
const mapGeometry = (geometry, convert) => {
  if (!geometry) return geometry;

  if (geometry.type === 'GeometryCollection') {
    return { ...geometry, geometries: (geometry.geometries ?? []).map(each => mapGeometry(each, convert)) };
  }

  const walk = (node) => {
    if (!Array.isArray(node)) return node;
    return isPosition(node) ? convert(node) : node.map(walk);
  };

  return { ...geometry, coordinates: walk(geometry.coordinates) };
};

/**
 * A copy of a collection with every position passed through `convert`.
 *
 * Everything else is kept as it was, in the order it was: properties, ids, any
 * member the service added. A feature with no geometry keeps none, rather than
 * gaining an empty one. The collection given is not touched, because it is the
 * one the map drew and the one a circle measures.
 *
 * @param {Object|null} collection - A GeoJSON FeatureCollection.
 * @param {(position: number[]) => number[]} convert - One position in, one out.
 * @returns {Object|null} The copy, or what was given when it has no features.
 */
export const mapPositions = (collection, convert) => {
  if (!Array.isArray(collection?.features)) return collection;

  return {
    ...collection,
    features: collection.features.map(feature => (feature?.geometry
      ? { ...feature, geometry: mapGeometry(feature.geometry, convert) }
      : feature))
  };
};
