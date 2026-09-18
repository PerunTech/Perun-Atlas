import { applyStyle } from './dom';

/**
 * When a set of points is worth collapsing, and what one cluster is drawn as.
 *
 * Two decisions, neither of which needs the map, which is why they are here
 * rather than in `FeatureSet`: what the clustering plugin is asked for, and what
 * the badge standing for a group of markers is made of. Both are settled before
 * a layer exists.
 *
 * The plugin itself lives in the engine. It extends Leaflet rather than sitting
 * beside it, so a copy bundled here would extend a second Leaflet that the map
 * on screen was not built on -- see the import comment in the engine's
 * `Factory.js`. This file never touches it; it produces the arguments.
 */

/**
 * How long a line takes to follow its end into a badge, in milliseconds.
 *
 * Close to Leaflet's own zoom animation, so the lines settle just after the
 * markers they are chasing rather than far enough behind to read as a second
 * event. `glide: false` turns it off; a number sets it.
 */
const GLIDE = 280;

/**
 * What the plugin is asked for when a row does not say.
 *
 * `chunkedLoading` is the one that is not cosmetic. Adding ten thousand markers
 * in one pass blocks the main thread for seconds -- a frozen tab, not a slow one
 * -- and chunking is what turns that into a map that draws itself while the
 * browser stays answerable. Clustering is asked for precisely when a set is that
 * large, so it is on rather than offered.
 *
 * `showCoverageOnHover` is off, which reverses the plugin's own default. It
 * outlines the area a cluster covers in Leaflet's stock blue, and every feature
 * around it is drawn in a colour its descriptor chose -- so the one shape on the
 * map that means nothing about the data is the one that looks most like a
 * deliberate highlight. A row that wants it back says so.
 *
 * `spiderfyDistanceMultiplier` is doubled because the markers are ours. The
 * plugin spaces a spiderfied cluster for Leaflet's default pin; a 24px round
 * marker at that spacing still overlaps its neighbours, which defeats the point
 * of opening the cluster at all.
 */
const DEFAULTS = {
  chunkedLoading: true,
  showCoverageOnHover: false,
  spiderfyDistanceMultiplier: 2
};

/**
 * Badge size, by how many markers stand behind it.
 *
 * Size rather than colour. The plugin's own badge runs green to amber to red,
 * which is a second colour language on a map whose first one is the descriptors'
 * -- and on a map where red already means something about the features, a red
 * badge means it about the count instead. Area reads as quantity without
 * claiming anything.
 */
const BANDS = [
  { upTo: 9, name: 'sm', size: 32 },
  { upTo: 99, name: 'md', size: 38 },
  { upTo: Infinity, name: 'lg', size: 46 }
];

/**
 * A `cluster` option, resolved, or null for a set drawn a marker at a time.
 *
 * Three forms, because one menu row serves every record on a screen and the
 * screens differ by orders of magnitude -- one holding with four movements, the
 * next with nine thousand:
 *
 *   true      cluster, whatever the size of the set
 *   200       cluster from two hundred points up, and draw the small sets plainly
 *   { ... }   `from`, plus anything the plugin takes, plus `className` and
 *             `style` for the badge, and `glide` for how long a line takes to
 *             follow its end into one
 *
 * The threshold is what makes the middle form worth having. Collapsing four
 * markers into a badge hides four labels and answers a question nobody asked;
 * the same row on the next record has to collapse them or draw nothing legible.
 *
 * @param {boolean|number|Object} [cluster] - The option as configured.
 * @returns {{ from: number, options: Object, badge: Object, glide: number|false }|null}
 */
export const clusterSettings = (cluster) => {
  if (!cluster) return null;
  if (cluster === true) return { from: 0, options: { ...DEFAULTS }, badge: {}, glide: GLIDE };
  if (typeof cluster === 'number') return { from: cluster, options: { ...DEFAULTS }, badge: {}, glide: GLIDE };

  // `glide` comes out with the rest of ours: whatever is left is handed to the
  // plugin, and a key it does not know would sit in its options unread.
  const { from = 0, className, style, glide = GLIDE, ...options } = cluster;
  return {
    from,
    options: { ...DEFAULTS, ...options },
    badge: { className, style },
    glide: glide === true ? GLIDE : glide
  };
};

/**
 * The badge standing for a group of markers.
 *
 * An element and the numbers to build an icon around it, rather than an icon:
 * building one is a call into the engine, and this file does not make those.
 *
 * The span is the chip, not the div Leaflet wraps it in. Leaflet creates that
 * div itself and hands it no styling of ours, so a `style` carried by a menu row
 * -- the whole mechanism by which a configured screen has colours without a
 * stylesheet -- would have nowhere to land. The child is ours, so the child is
 * the thing with a background. `features.css` sizes it to fill its parent.
 *
 * The count is a number this code was handed by the plugin, so `textContent` is
 * belt and braces rather than a defence. It is written that way because
 * everything else in this package that puts content in an element is, and an
 * exception is how the rule stops being the rule.
 *
 * @param {number} count - How many markers the cluster stands for.
 * @param {Object} [badge] - `className` and `style` from the `cluster` option.
 * @returns {{ element: Element, size: number, className: string }}
 */
export const clusterBadge = (count, badge = {}) => {
  const band = BANDS.find(({ upTo }) => count <= upTo) ?? BANDS[BANDS.length - 1];

  const element = document.createElement('span');
  element.className = 'atlas-cluster__count';
  element.textContent = String(count);
  applyStyle(element, badge.style);

  return {
    element,
    size: band.size,
    // The band class is a styling hook and nothing here reads it: a deployment
    // that wants its big clusters to look different needs somewhere to say so.
    className: ['atlas-cluster', `atlas-cluster--${band.name}`, badge.className].filter(Boolean).join(' ')
  };
};
