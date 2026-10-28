import { SYSTEM_FIELDS } from '../data/system';

export const BASE_STYLE = {
  weight: 1,
  opacity: 1,
  color: '#4A5C66',
  fillOpacity: 0.55,
  fillColor: '#B8C6CC'
};

export const pathOptions = (descriptor = {}, overrides = {}) => ({
  ...BASE_STYLE,
  ...descriptor.style,
  ...overrides
});

// Undefined when neither exists: several keys are read as "configured at all", and an empty object
// would put arrow heads on every line.
const merged = (base, over) => (base || over ? { ...base, ...over } : undefined);

// A case is merged one level down, so it states only what differs from the descriptor.
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

export const labelVisible = (descriptor, zoom) => {
  const band = descriptor?.label?.scale;
  if (!band) return false;
  const { min = 0, max = 24 } = band;
  return zoom >= min && zoom <= max;
};

export const labelFor = (descriptor, feature) => {
  const field = descriptor?.label?.field;
  if (!field) return null;
  const value = feature?.properties?.[field];
  return value === undefined || value === null ? null : String(value);
};

export const nameFor = (descriptor, feature) => {
  const read = (field) => {
    const value = field ? feature?.properties?.[field] : undefined;
    return value === undefined || value === null || value === '' ? null : String(value);
  };

  return read(descriptor?.label?.field) ?? read(descriptor?.popup?.title) ?? read(descriptor?.details?.title);
};

// Plain data, not markup, so a record's value never reaches an HTML parser. Null when there is nothing
// to show, since an empty bubble is worse than none.
export const popupFor = (descriptor, feature, resolveLabel) => {
  const spec = descriptor?.popup;
  if (!spec) return null;

  const read = (field) => {
    const value = feature?.properties?.[field];
    return value === undefined || value === null || value === '' ? null : String(value);
  };

  const title = spec.title ? read(spec.title) : null;

  // Resolved label, then the configured one, then the field name, so nothing renders blank.
  const rows = (spec.fields ?? [])
    .map(({ label, field }) => ({
      label: (label && resolveLabel?.(label)) || label || field,
      value: read(field)
    }))
    .filter(row => row.value !== null);

  return title === null && rows.length === 0 ? null : { title, rows };
};

// Lists what to leave out rather than what to show, so a column the service starts returning appears
// without a menu-row change. Nested objects are skipped, as in a CSV.
export const detailsFor = (descriptor, feature, resolveLabel) => {
  const spec = descriptor?.details;
  if (!spec) return null;

  const properties = feature?.properties ?? {};
  const hidden = new Set([...SYSTEM_FIELDS, ...(spec.exclude ?? [])]);

  const read = (value) =>
    value === undefined || value === null || value === '' ? null : String(value);

  const title = spec.title ? read(properties[spec.title]) : null;

  const rows = Object.entries(properties)
    .filter(([field, value]) =>
      !hidden.has(field) && field !== spec.title &&
      (value === null || typeof value !== 'object'))
    .map(([field, value]) => ({
      field,
      label: resolveLabel?.(field.toLowerCase()) || field,
      value: read(value)
    }))
    .filter(row => row.value !== null);

  return title === null && rows.length === 0 ? null : { title, rows, spec };
};
