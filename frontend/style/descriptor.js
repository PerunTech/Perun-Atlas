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

/**
 * The rows of a feature's popup, per its descriptor.
 *
 * A label names a feature; a popup explains it. That division is already assumed
 * by the labels above — they are bound permanently, because a name has to stay on
 * screen, and that is exactly what makes them the wrong place to put detail.
 *
 * Returns plain data, not markup. The component turns these rows into elements,
 * which is what keeps this testable without a map, and what keeps a record's
 * field from ever reaching an HTML parser.
 *
 * A field with no value is dropped rather than rendered blank, and a popup left
 * with nothing to say comes back null so that no popup is bound at all — an empty
 * bubble is worse than none.
 *
 * @param {Object} descriptor - The descriptor entry for this feature's type.
 * @param {Object} feature    - The GeoJSON feature.
 * @returns {{ title: string|null, rows: Array<{label: string, value: string}> }|null}
 */
export const popupFor = (descriptor, feature) => {
  const spec = descriptor?.popup;
  if (!spec) return null;

  const read = (field) => {
    const value = feature?.properties?.[field];
    return value === undefined || value === null || value === '' ? null : String(value);
  };

  const title = spec.title ? read(spec.title) : null;

  // The field name is the fallback label rather than an error: it is a column
  // name and it will look like one, which is the correct amount of pressure to
  // put on a descriptor that has not named its fields yet. Labels belong to the
  // caller — this package ships no module's translations.
  const rows = (spec.fields ?? [])
    .map(({ label, field }) => ({ label: label ?? field, value: read(field) }))
    .filter(row => row.value !== null);

  return title === null && rows.length === 0 ? null : { title, rows };
};
