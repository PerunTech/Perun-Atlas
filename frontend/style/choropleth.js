/**
 * Colouring features by a categorical attribute.
 *
 * Deliberately categorical rather than a continuous ramp: the first consumer
 * colours administrative areas by disease status, which is a code list, not a
 * measurement. A sequential scale for numeric attributes is a separate concern
 * and should not be bolted onto this one.
 */

/**
 * A neutral fallback palette. Deployments should supply their own via the
 * `palette` option so that a status colour means the same thing across screens.
 */
export const DEFAULT_PALETTE = {
  __unknown: '#B8C6CC'
};

/**
 * Builds a lookup from feature to fill colour.
 *
 * @param {Object} options
 * @param {string} options.field      - Feature property holding the category.
 * @param {Object} options.palette    - { categoryValue: cssColour }.
 * @param {string} [options.fallback] - Colour for values absent from the palette.
 */
export const colourBy = ({ field, palette = DEFAULT_PALETTE, fallback = DEFAULT_PALETTE.__unknown }) => {
  const seenUnmapped = new Set();
  const path = String(field).split('.');

  // Dotted paths so a category can live on a joined record, e.g. "status.AREA_STATUS",
  // rather than forcing callers to flatten before colouring.
  const read = (feature) =>
    path.reduce((acc, part) => (acc == null ? acc : acc[part]), feature?.properties);

  return (feature) => {
    const value = read(feature);
    if (value === undefined || value === null) return fallback;

    const colour = palette[value];
    if (colour) return colour;

    // Say it once per category rather than once per feature — a missing palette
    // entry is a configuration gap worth noticing, not worth flooding the console.
    if (!seenUnmapped.has(value)) {
      seenUnmapped.add(value);
      console.warn(`perun-atlas: no palette entry for ${field}="${value}"`);
    }
    return fallback;
  };
};

/**
 * Joins a status feed onto features by a shared key.
 *
 * The first consumer needs this because the geometry and the thing being coloured
 * come from different tables: SVAROG_SDI_UNITS carries the polygons, AREA_HEALTH
 * carries the status, and they meet on an area code.
 *
 * @param {Object} collection      - GeoJSON FeatureCollection.
 * @param {Array}  rows            - Status records.
 * @param {Object} keys
 * @param {string} keys.featureKey - Feature property to match on.
 * @param {string} keys.rowKey     - Row property to match on.
 * @param {string} keys.as         - Property name to write the matched row under.
 */
export const joinStatus = (collection, rows, { featureKey, rowKey, as = 'status' }) => {
  const index = new Map((rows ?? []).map(row => [String(row?.[rowKey]), row]));

  return {
    ...collection,
    features: (collection?.features ?? []).map(feature => {
      const match = index.get(String(feature?.properties?.[featureKey]));
      return match
        ? { ...feature, properties: { ...feature.properties, [as]: match } }
        : feature;
    })
  };
};
