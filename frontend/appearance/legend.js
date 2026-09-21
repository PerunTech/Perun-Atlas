import { BASE_STYLE, pathOptions } from './descriptor';

/**
 * What the colours on a map mean.
 *
 * Two screens grew the same gap from different directions. A movements map draws
 * arriving lines in one colour and leaving ones in another, and nothing on
 * screen says which is which -- the distinction is legible only to whoever wrote
 * the menu row. A choropleth fills areas from a palette, which is the one map in
 * the stack where misreading a colour has consequences. Both are answered by a
 * list of swatches and words, so both are answered here.
 *
 * Nothing in this file is configured. The descriptors already carry the names,
 * the cases and the colours, and the palette already carries the categories --
 * a legend is a second reading of what is on the map rather than a second
 * description of it, which is what keeps it from drifting out of step.
 *
 * Engine-free and pure: entries in, entries out, no Leaflet and no DOM.
 */

/** Separates a descriptor name from its variant case in an entry's key. */
const KEY_SEPARATOR = '::';

/** Which shape a swatch draws, from the geometry it stands for. */
const kindOf = (geometry = '') => {
  if (/Point$/.test(geometry)) return 'point';
  if (/LineString$/.test(geometry)) return 'line';
  return 'area';
};

/**
 * The label for one entry, and the ladder it climbs.
 *
 * A variant case asks about its own value first -- `IN` and `OUT` are what the
 * two colours actually distinguish, and the descriptor name they share says
 * nothing about either. A plain descriptor asks about its name. Both accept an
 * explicit `legend` code on the descriptor for the case where neither reads
 * well, which is the only key this feature adds and the only optional one.
 *
 * Every rung is legible on screen and says which was reached: a translated word,
 * then the raw value or name. A bare `CONNECTION` in a legend is exactly the
 * instruction to register `connection`.
 */
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

/**
 * One drawn kind, as something a legend can render.
 *
 * The swatch carries the descriptor's own style rather than a square of its
 * colour, because a legend that draws a line descriptor as a block lies about
 * what is on the map: a dashed amber line and a solid amber fill are different
 * things and the difference is the point.
 */
const entryFor = (drawn, resolveLabel) => {
  const kind = kindOf(drawn.geometry);
  const descriptor = drawn.descriptor ?? {};

  return {
    key: `${drawn.name ?? ''}${KEY_SEPARATOR}${drawn.value ?? ''}`,
    label: labelFor(drawn, resolveLabel),
    kind,
    // Resolved through the same function the map draws with, so a legend cannot
    // disagree with the feature beside it.
    path: pathOptions(descriptor),
    marker: kind === 'point' ? (descriptor.marker ?? {}) : null,
    arrow: kind === 'line' ? (descriptor.arrow ?? null) : null
  };
};

/**
 * A legend for the kinds a set actually drew.
 *
 * `drawn` is collected by whatever rendered the features, not read back out of
 * the configuration, and the difference matters: a menu row commonly configures
 * more descriptors than any one response carries, and a key listing things that
 * are not on the map is worse than no key at all.
 *
 * Entries with nothing to say are dropped -- a descriptor with no name and no
 * case resolves to an empty label, and a blank row beside a swatch explains
 * nothing.
 *
 * @param {Array} drawn - [{ name, value, descriptor, geometry }], one per
 *        distinct kind rendered. `value` is the variant case, where there was one.
 * @param {Function} [resolveLabel] - Turns a label code into display text.
 * @returns {Array} [{ key, label, kind, path, marker, arrow }]
 */
export const legendFrom = (drawn = [], resolveLabel) =>
  drawn.map(item => entryFor(item, resolveLabel)).filter(entry => entry.label !== '');

/**
 * A legend for a categorical fill.
 *
 * The palette is already the mapping, so this is mostly a reshaping -- with one
 * decision in it. Only the categories a response actually contained are listed,
 * for the same reason as above, and the fallback colour is listed only when
 * something actually fell back to it. A palette with forty codes and a map
 * showing three of them should produce three rows.
 *
 * @param {Object} options
 * @param {Object} options.palette         - { categoryValue: cssColour }.
 * @param {Array}  options.values          - The category values actually drawn.
 * @param {string} [options.fallback]      - The colour used for unmapped values.
 * @param {boolean} [options.usedFallback] - Whether anything reached it.
 * @param {string} [options.unknownLabel]  - Label code for the fallback row.
 * @param {Function} [resolveLabel]
 * @returns {Array} Entries in the same shape `legendFrom` returns.
 */
export const legendFromPalette = (
  { palette = {}, values = [], fallback, usedFallback = false, unknownLabel = 'unknown' } = {},
  resolveLabel
) => {
  const swatch = (colour) => ({
    ...BASE_STYLE, color: colour, fillColor: colour, fillOpacity: 0.7
  });

  const rows = values
    // Own properties only, for the reason `isMapped` is written that way: a
    // palette inherits `toString` like any object, and a band spelled that way
    // would pass this filter and be drawn with a function for a colour.
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
    key: `${KEY_SEPARATOR}fallback`,
    label: resolveLabel?.(unknownLabel) || 'Not classified',
    kind: 'area',
    path: swatch(fallback),
    marker: null,
    arrow: null
  }];
};
