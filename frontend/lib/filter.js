/**
 * Kinds of feature the legend has switched off, applied to what a layer drew.
 *
 * A layer draws a set once, and the reader then says which parts of it they want
 * to look at. Hiding takes layers off the map. It does not fetch again, because
 * the service has already answered, and it does not make them transparent: a
 * see-through feature still takes the click, still counts in a cluster's badge
 * and still goes into the file.
 *
 * Each layer keeps a list of members, one per feature layer, as
 * `{ layer, feature, key, hidden }`. This file decides which of them move and
 * what the set now reads as. Putting layers on and off the map stays with the
 * layer, which is the part that knows where each one lives.
 */

/**
 * Which of a draw's features change state now that these keys are hidden.
 *
 * Only the changes. Switching off one row of a twelve-row key moves that row's
 * features and nothing else. Each member's `hidden` is updated in place, so the
 * next call measures from here.
 *
 * @param {Array} members - `{ key, hidden }`, and whatever else the layer keeps.
 * @param {Array} [hidden] - The legend keys switched off.
 * @returns {{ leaving: Array, returning: Array }} What to take off, and what to put back.
 */
export const changesFor = (members, hidden = []) => {
  const off = new Set(hidden);
  const leaving = [];
  const returning = [];

  members.forEach((member) => {
    const hide = off.has(member.key);
    if (hide === Boolean(member.hidden)) return;
    member.hidden = hide;
    (hide ? leaving : returning).push(member);
  });

  return { leaving, returning };
};

/**
 * Put the shown layers back in the order the producer sent them.
 *
 * Leaflet draws a path over everything drawn before it, so a layer put back on
 * the map comes back on top. Where shapes overlap, as circles drawn around the
 * same place do, switching a kind off and on again would change which of them
 * is in front. Walking the shown members in draw order and bringing each to the
 * front restores the order they arrived in.
 *
 * Then the arrow heads, in a second pass, because that is where the draw put
 * them: every decorator after every feature, so no line crosses another line's
 * heads. One pass doing a line and then its heads would let the next line cover
 * them.
 *
 * Shown members only: a path that is off the map has no element to move, and
 * Leaflet's `bringToFront` does not check. A marker has no such method and is
 * skipped; its pane orders it.
 *
 * @param {Array} members - In draw order.
 * @param {WeakMap} [decoratorOf] - A line layer -> its arrow decorator.
 */
export const restack = (members, decoratorOf) => {
  const shown = members.filter(({ hidden }) => !hidden);
  shown.forEach(({ layer }) => layer.bringToFront?.());
  shown.forEach(({ layer }) => decoratorOf?.get(layer)?.bringToFront?.());
};

/**
 * The set as the reader sees it, for whatever reads it after it is drawn: a
 * file, a circle's count, a save body naming what the circle caught.
 *
 * Filtered from the collection rather than rebuilt from the members, so a
 * feature Leaflet drew nothing for (one with no geometry) goes on being exported
 * exactly as it was before any row was switched off.
 *
 * The same object when nothing is hidden, so a caller holding both the fetched
 * set and this one can tell that nothing was taken out.
 *
 * @param {Object} collection - The FeatureCollection as drawn.
 * @param {Array} [hidden] - The legend keys switched off.
 * @param {Function} keyOf - A feature -> its legend key, as the layer decided it.
 * @returns {Object} A FeatureCollection.
 */
export const shownOf = (collection, hidden = [], keyOf) => {
  const features = collection?.features;
  if (!Array.isArray(features) || !hidden.length) return collection;

  const off = new Set(hidden);
  const kept = features.filter((feature) => !off.has(keyOf(feature)));

  return kept.length === features.length ? collection : { ...collection, features: kept };
};
