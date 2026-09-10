/**
 * Descriptors: how a feature is drawn.
 *
 * This is the part harvested from the legacy module's `descriptor` block — the
 * shape of the data survives, the Leaflet-specific rendering does not. A descriptor
 * is plain data with no engine import, so it can be unit-tested without a map and
 * later moved into configuration without rewriting it.
 */

/** Applied wherever a descriptor leaves a property unset. */
export const BASE_STYLE = {
  weight: 1,
  opacity: 1,
  color: '#4A5C66',
  fillOpacity: 0.55,
  fillColor: '#B8C6CC'
};

/**
 * Resolves a feature's path options from its descriptor.
 *
 * @param {Object} descriptor - The descriptor entry for this feature's type.
 * @param {Object} [overrides] - Per-feature overrides, e.g. a choropleth fill.
 */
export const pathOptions = (descriptor = {}, overrides = {}) => ({
  ...BASE_STYLE,
  ...descriptor.style,
  ...overrides
});

/**
 * Whether a feature's label should render at the current zoom.
 *
 * The legacy module expressed this as a `label_scale` band per descriptor and
 * evaluated it with a sign trick; the intent is simply an inclusive range, so it
 * is written as one here.
 */
export const labelVisible = (descriptor, zoom) => {
  const band = descriptor?.label?.scale;
  if (!band) return false;
  const { min = 0, max = 24 } = band;
  return zoom >= min && zoom <= max;
};

/** The text of a feature's label, per its descriptor's field. */
export const labelFor = (descriptor, feature) => {
  const field = descriptor?.label?.field;
  if (!field) return null;
  const value = feature?.properties?.[field];
  return value === undefined || value === null ? null : String(value);
};
