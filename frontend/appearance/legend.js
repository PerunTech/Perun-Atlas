import { BASE_STYLE, pathOptions, variantOf } from './descriptor';

const KEY_SEPARATOR = '::';

export const MINIMUM_ENTRIES = 2;

// Also shown when a row is switched off, or a map that switch emptied would offer no way back.
export const legendShown = (entries = [], hidden = []) =>
  entries.length >= MINIMUM_ENTRIES || entries.some(entry => hidden.includes(entry.key));

// Shared by the legend rows and the layers that hide features for them.
export const kindKey = (name, value) => `${name ?? ''}${KEY_SEPARATOR}${value ?? ''}`;

/** The fallback band's key, which no category value can spell. */
export const FALLBACK_KEY = `${KEY_SEPARATOR}fallback`;

export const FILE_KEY = `${KEY_SEPARATOR}file`;

// Only a value with a case behind it gets its own row: forty values and two cases make two rows.
export const drawnAs = (name, descriptor, feature) => {
  const by = descriptor?.variants?.by;
  const raw = by ? feature?.properties?.[by] : undefined;
  const value = raw !== undefined && descriptor?.variants?.cases?.[raw] ? raw : undefined;

  return { name, value, key: kindKey(name, value) };
};

export const drawnKinds = ({ descriptors, nameOf }) => {
  const entries = new WeakMap();

  const entryFor = (feature) => {
    // Each feature is asked two or three times per draw, and variantOf allocates on every merge.
    if (entries.has(feature)) return entries.get(feature);
    const entry = variantOf(descriptors[nameOf(feature)], feature);
    entries.set(feature, entry);
    return entry;
  };

  const kindOf = (feature) => {
    const name = nameOf(feature);
    return drawnAs(name, descriptors[name], feature);
  };

  const kinds = new Map();

  const note = (feature) => {
    const { name, value, key } = kindOf(feature);
    if (!kinds.has(key)) {
      kinds.set(key, {
        name,
        value,
        descriptor: entryFor(feature),
        geometry: feature?.geometry?.type
      });
    }
    return key;
  };

  return {
    entryFor,
    kindOf,
    note,
    drawn: () => [...kinds.values()]
  };
};

const kindOf = (geometry = '') => {
  if (/Point$/.test(geometry)) return 'point';
  if (/LineString$/.test(geometry)) return 'line';
  return 'area';
};

// A variant asks about its own value first: `IN` and `OUT` are what its colours tell apart.
const labelFor = ({ name, value, descriptor }, resolveLabel) => {
  const explicit = descriptor?.legend;
  if (explicit) {
    const resolved = resolveLabel?.(explicit);
    if (resolved) return resolved;
  }

  const own = value ?? name;
  if (own === undefined || own === null || own === '') return '';

  return resolveLabel?.(String(own).toLowerCase()) || String(own);
};

// The descriptor's own style rather than a square of its colour: a dashed line is not a fill.
const entryFor = (drawn, resolveLabel) => {
  const kind = kindOf(drawn.geometry);
  const descriptor = drawn.descriptor ?? {};

  return {
    key: kindKey(drawn.name, drawn.value),
    label: labelFor(drawn, resolveLabel),
    kind,
    path: pathOptions(descriptor),
    marker: kind === 'point' ? (descriptor.marker ?? {}) : null,
    arrow: kind === 'line' ? (descriptor.arrow ?? null) : null
  };
};

// From what was drawn, not what was configured: a key listing things that are not on the map is
// worse than no key.
export const legendFrom = (drawn = [], resolveLabel) =>
  drawn.map(item => entryFor(item, resolveLabel)).filter(entry => entry.label !== '');

// Lists only the categories drawn, and the fallback row only if something fell back to it.
export const legendFromPalette = (
  { palette = {}, values = [], fallback, usedFallback = false, unknownLabel = 'unknown' } = {},
  resolveLabel
) => {
  const swatch = (colour) => ({
    ...BASE_STYLE, color: colour, fillColor: colour, fillOpacity: 0.7
  });

  const rows = values
    // Own properties only, as in isMapped.
    .filter(value => Object.prototype.hasOwnProperty.call(Object(palette), value) && palette[value])
    .map(value => ({
      key: String(value),
      label: resolveLabel?.(String(value).toLowerCase()) || String(value),
      kind: 'area',
      path: swatch(palette[value]),
      marker: null,
      arrow: null
    }));

  if (!usedFallback || !fallback) return rows;

  return [...rows, {
    key: FALLBACK_KEY,
    label: resolveLabel?.(unknownLabel) || 'Not classified',
    kind: 'area',
    path: swatch(fallback),
    marker: null,
    arrow: null
  }];
};
