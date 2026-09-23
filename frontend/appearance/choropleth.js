import { reader } from '../data/path';

/**
 * Colouring features by a categorical attribute.
 *
 * Deliberately categorical rather than a continuous ramp: what these screens
 * colour by is a code list, not a measurement. A sequential scale for numeric
 * attributes is a separate concern and should not be bolted onto this one.
 *
 * Every configured name -- the category, and both sides of a join -- is read
 * through `reader` in `data/path`, so a related field may arrive nested or as a
 * flat `TABLE.COLUMN` key and the same row describes either.
 */

/**
 * A neutral fallback palette. Deployments should supply their own via the
 * `palette` option so that a status colour means the same thing across screens.
 */
export const DEFAULT_PALETTE = {
  __unknown: '#B8C6CC'
};

/**
 * Whether the palette has a colour for this value.
 *
 * One line, and shared, because two things ask it: the fill, and the key drawn
 * beside it. A key that disagreed with the map about which values are known
 * would be worse than no key at all, and two copies of a predicate agreeing
 * today is how that disagreement arrives later.
 *
 * Own properties only. A palette is an object out of a menu row, so it inherits
 * `toString` and `constructor` like any other -- and a category that happened to
 * be spelled that way would be answered yes, and then coloured with a function.
 */
const isMapped = (palette, value) =>
  Object.prototype.hasOwnProperty.call(Object(palette), value) && Boolean(palette[value]);

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

  // Dotted, so a category can live on a joined record rather than forcing
  // callers to flatten before colouring.
  const readField = reader(field);
  const read = (feature) => readField(feature?.properties);

  return (feature) => {
    const value = read(feature);
    if (value === undefined || value === null) return fallback;

    if (isMapped(palette, value)) return palette[value];

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
 * Which categories a set actually drew, and whether anything fell through.
 *
 * A key built from the palette lists what a deployment configured. A key built
 * from this lists what is on the screen -- and on a bbox-scoped map those differ
 * with every pan. The second is the one worth reading: a key naming six bands
 * when two are drawn is a key nobody checks a third time.
 *
 * The fallback rule is `colourBy`'s -- the same `isMapped`, not a second copy of
 * it. A value that is absent and a value the palette does not know are both
 * drawn in the fallback colour, so both count here as having used it.
 *
 * Every value seen is reported, mapped or not, in the order the features first
 * mention them. `legendFromPalette` decides which of them the palette can draw a
 * swatch for; deciding it twice, in two files, is the same drift by another
 * route.
 *
 * @param {Array} features - The features as drawn, after any join.
 * @param {Object} options - `field` and `palette`, as `colourBy` was given them.
 * @returns {{ values: Array, usedFallback: boolean }} Shaped for `legendFromPalette`.
 */
export const categoriesDrawn = (features = [], { field, palette = DEFAULT_PALETTE } = {}) => {
  const readField = reader(field);
  const read = (feature) => readField(feature?.properties);
  const seen = new Set();
  const values = [];
  let usedFallback = false;

  features.forEach((feature) => {
    const value = read(feature);

    if (value === undefined || value === null) {
      usedFallback = true;
      return;
    }
    if (!isMapped(palette, value)) usedFallback = true;

    if (seen.has(value)) return;
    seen.add(value);
    values.push(value);
  });

  return { values, usedFallback };
};

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
