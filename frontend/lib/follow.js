import { between, easeInOut, reversed, routeEnds } from './route';

/**
 * Lines following their ends into a cluster's badges, and back out again.
 *
 * `route.js` says where each end belongs; this puts it there, keeps putting it
 * there as the view changes, and moves it rather than teleporting it. The layers
 * are `FeatureSet`'s and so is the decision to call this at all -- only a
 * clustered set with lines in it has ends to follow.
 *
 * Handed the map rather than importing the engine, so a test can give it one.
 */

/**
 * Past this many lines moving at once, they are placed rather than travelled.
 *
 * Redrawing a path and its arrow heads per frame is the cost, and a hundred and
 * fifty lines all sliding at once is not motion a reader can follow anyway.
 */
export const GLIDE_LIMIT = 150;

/**
 * Keep a set's lines aimed at wherever the cluster is drawing their ends.
 *
 * `getVisibleParent` walks up from a marker until it reaches something with an
 * icon on screen, which is the badge standing for it -- or the marker itself,
 * once the view is close enough to draw it. Zoomed right in, every marker is
 * its own parent and this restores the geometry the producer sent, exactly.
 *
 * The ends travel rather than teleport. The cluster slides its markers into the
 * badge over Leaflet's zoom animation and then fires `animationend`, which is
 * where this starts -- so without a tween the markers glide and the lines snap
 * a beat later, which reads as two separate things happening rather than one.
 * The travel is not decoration: an end that moves tells the reader *which*
 * badge swallowed it, which is the whole question a collapsed end raises. A
 * jump leaves them to guess.
 *
 * Straight to the answer in three cases. A reader who has asked their system
 * for less motion gets none. A set past `GLIDE_LIMIT` lines is both too
 * expensive to redraw per frame and too busy to read as motion anyway. And a
 * row can turn it off, or set its own duration, with `cluster: { glide: false }`
 * or `{ glide: 400 }`.
 *
 * Runs once straight away, then on `animationend` -- the cluster settling after
 * a zoom -- and on `moveend`, which covers a pan that swaps markers in and out
 * without any animation.
 *
 * @param {Object} params
 * @param {Object} params.map         - The Leaflet map the set is on.
 * @param {Object} params.surface     - The cluster group the markers are in.
 * @param {Array}  params.lines       - `{ layer, original, reverse, key }` per
 *        flat line: the layer, the path as the producer sent it, whether its
 *        arrows point back along it, and the last key applied.
 * @param {Object} params.markerAt    - Position key -> marker, null-prototype.
 * @param {WeakMap} [params.decoratorOf] - Line layer -> its arrow decorator.
 * @param {number|false} params.glide - Milliseconds for the travel, or false.
 * @returns {Function} Takes every handler off and stops any travel in flight.
 */
export const followClusters = ({ map, surface, lines, markerAt, decoratorOf, glide }) => {
  const visibleParentOf = (marker) => surface.getVisibleParent?.(marker);

  /** A line and its decorator, put where the arithmetic says. */
  const place = (line, points) => {
    line.layer.setLatLngs(points);

    // The decorator does not read the layer back on its own, and a reversed
    // one was handed a copy that cannot change at all -- so it is given the new
    // path rather than asked to redraw.
    const decorator = decoratorOf?.get(line.layer);
    if (decorator) decorator.setPaths(line.reverse ? reversed(points) : line.layer);
  };

  const reducedMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let frame = null;

  const stop = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  };

  const travel = (moves) => {
    stop();

    const from = moves.map(({ line }) => line.layer.getLatLngs());
    const began = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - began) / glide);
      const eased = easeInOut(t);

      moves.forEach((move, i) => place(move.line, between(from[i], move.next, eased)));

      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        // Land on the target itself rather than on the last frame's
        // arithmetic, so a fully zoomed-in map holds the exact coordinates the
        // producer sent.
        frame = null;
        moves.forEach((move) => place(move.line, move.next));
      }
    };

    frame = requestAnimationFrame(step);
  };

  const routeLines = () => {
    const moves = [];

    lines.forEach((line) => {
      const change = routeEnds(line, markerAt, visibleParentOf);
      if (!change) return;
      line.key = change.key;
      moves.push({ line, next: change.next });
    });

    if (!moves.length) return;

    if (!glide || reducedMotion || moves.length > GLIDE_LIMIT) {
      moves.forEach((move) => place(move.line, move.next));
    } else {
      travel(moves);
    }
  };

  routeLines();
  surface.on('animationend', routeLines);
  map.on('moveend', routeLines);

  return () => {
    stop();
    surface.off('animationend', routeLines);
    map.off('moveend', routeLines);
  };
};
