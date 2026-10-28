// Walks by nesting depth rather than by `type`, so any geometry type is covered.
const isPosition = (node) => Array.isArray(node) && typeof node[0] === 'number';

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

// Leaves the collection given untouched: it is the one the map drew.
export const mapPositions = (collection, convert) => {
  if (!Array.isArray(collection?.features)) return collection;

  return {
    ...collection,
    features: collection.features.map(feature => (feature?.geometry
      ? { ...feature, geometry: mapGeometry(feature.geometry, convert) }
      : feature))
  };
};
