import { reader } from './path';

/**
 * Joins a status feed onto features by a shared key.
 *
 * Needed because the geometry and the thing being coloured generally come from
 * different services, and meet on a shared key rather than arriving joined.
 *
 * @param {Object} collection      - GeoJSON FeatureCollection.
 * @param {Array}  rows            - Status records.
 * @param {Object} keys
 * Both keys are read the way a category is -- see `reader` in `data/path` -- so a row whose
 * key sits under a related object and a row with a flat `TABLE.COLUMN` key join
 * on the same configured name. The two sides of a join arriving in different
 * shapes is the ordinary case here, not the awkward one.
 *
 * @param {string} keys.featureKey - Feature property to match on.
 * @param {string} keys.rowKey     - Row property to match on.
 * @param {string} keys.as         - Property name to write the matched row under.
 */
export const joinStatus = (collection, rows, { featureKey, rowKey, as = 'status' }) => {
  const readRow = reader(rowKey);
  const readFeature = reader(featureKey);

  const index = new Map((rows ?? []).map(row => [String(readRow(row)), row]));

  return {
    ...collection,
    features: (collection?.features ?? []).map(feature => {
      const match = index.get(String(readFeature(feature?.properties)));
      return match
        ? { ...feature, properties: { ...feature.properties, [as]: match } }
        : feature;
    })
  };
};
