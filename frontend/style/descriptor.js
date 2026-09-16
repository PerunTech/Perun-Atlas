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
 * Two blocks of a descriptor, merged -- and undefined when neither exists.
 *
 * The undefined is the point. Several of these keys are read as "is this
 * configured at all", so an empty object answers yes: a descriptor with no
 * `arrow` that merged into `{}` would put arrow heads on every line in the set.
 */
const merged = (base, over) => (base || over ? { ...base, ...over } : undefined);

/**
 * A descriptor, with the variant for this feature merged over it.
 *
 * A descriptor describes a kind of feature, and that is usually the whole
 * story. Sometimes one column splits a kind in two -- the same line, but
 * arriving rather than leaving -- and that distinction is a property of the
 * data rather than a second kind of thing:
 *
 *     "variants": {
 *       "by": "SOME_COLUMN",
 *       "cases": {
 *         "SOME_VALUE":  { "style": { "color": "#1565c0" }, "arrow": { "reverse": true } },
 *         "OTHER_VALUE": { "style": { "color": "#e65100" } }
 *       }
 *     }
 *
 * The column and its values belong to whoever produces the set, so both are
 * named in configuration and neither appears here -- the same reason the
 * descriptors themselves are configuration.
 *
 * Merged one level down rather than replacing, so a case states only what
 * differs: a colour, without restating the weight, the line caps and the arrow
 * spacing that both cases share. The alternative -- two complete descriptors
 * and a `descriptorFor` to pick between them -- puts code back in the consumer,
 * which is what this package spent a round removing.
 *
 * A value with no case, a column the feature does not carry, or no `variants`
 * at all: the descriptor is returned as written.
 *
 * @param {Object} descriptor - The descriptor entry for this feature's type.
 * @param {Object} feature    - The GeoJSON feature.
 */
export const variantOf = (descriptor, feature) => {
  const spec = descriptor?.variants;
  if (!spec?.by) return descriptor;

  const variant = spec.cases?.[feature?.properties?.[spec.by]];
  if (!variant) return descriptor;

  return {
    ...descriptor,
    ...variant,
    style: merged(descriptor.style, variant.style),
    marker: merged(descriptor.marker, variant.marker),
    label: merged(descriptor.label, variant.label),
    popup: merged(descriptor.popup, variant.popup),
    arrow: merged(descriptor.arrow, variant.arrow)
  };
};

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
 * @param {Function} [resolveLabel] - Turns a field's label into display text.
 *        Descriptors routinely arrive from configuration, where everything
 *        user-visible is a label code rather than a word, and only the consumer
 *        can resolve one. Returning nothing for a code it does not know is the
 *        expected answer, not a failure — see the ladder below.
 * @returns {{ title: string|null, rows: Array<{label: string, value: string}> }|null}
 */
export const popupFor = (descriptor, feature, resolveLabel) => {
  const spec = descriptor?.popup;
  if (!spec) return null;

  const read = (field) => {
    const value = feature?.properties?.[field];
    return value === undefined || value === null || value === '' ? null : String(value);
  };

  const title = spec.title ? read(spec.title) : null;

  // Resolved label, then the configured one, then the field name. Every rung
  // is legible on screen and says which one was reached: a translated word, an
  // unregistered code, or a bare column name. Nothing renders blank, and the
  // package still ships no module's translations — it only asks the caller.
  const rows = (spec.fields ?? [])
    .map(({ label, field }) => ({
      label: (label && resolveLabel?.(label)) || label || field,
      value: read(field)
    }))
    .filter(row => row.value !== null);

  return title === null && rows.length === 0 ? null : { title, rows };
};
