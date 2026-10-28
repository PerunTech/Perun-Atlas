import { between, easeInOut, reversed, routeEnds } from './route';

// Past this many lines moving at once they are placed, not travelled: too costly per frame, too busy to follow.
export const GLIDE_LIMIT = 150;

// The ends travel rather than jump, so the reader sees which badge swallowed them. Placed outright
// under reduced motion, past GLIDE_LIMIT, or with `glide: false`.
export const followClusters = ({ map, surface, lines, markerAt, decoratorOf, glide }) => {
  const visibleParentOf = (marker) => surface.getVisibleParent?.(marker);

  const place = (line, points) => {
    line.layer.setLatLngs(points);

    // A reversed decorator holds a copy, so it is handed the new path rather than asked to redraw.
    const decorator = decoratorOf?.get(line.layer);
    if (decorator) decorator.setPaths(line.reverse ? reversed(points) : line.layer);
  };

  const reducedMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let frame = null;

  // A restarted glide carries these on; otherwise lines mid-flight would stop partway to a badge.
  let flying = [];

  const stop = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    flying = [];
  };

  const travel = (moves) => {
    stop();
    flying = moves;

    const from = moves.map(({ line }) => line.layer.getLatLngs());
    const began = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - began) / glide);
      const eased = easeInOut(t);

      moves.forEach((move, i) => place(move.line, between(from[i], move.next, eased)));

      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        // Land on the target itself, so a fully zoomed-in map holds the producer's exact coordinates.
        frame = null;
        flying = [];
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

    const moving = new Set(moves.map(({ line }) => line));
    const all = [...flying.filter(({ line }) => !moving.has(line)), ...moves];

    if (!glide || reducedMotion || all.length > GLIDE_LIMIT) {
      // Stop the glide under way, or it would overwrite these.
      stop();
      all.forEach((move) => place(move.line, move.next));
    } else {
      travel(all);
    }
  };

  routeLines();
  surface.on('animationend', routeLines);
  map.on('moveend', routeLines);

  const off = () => {
    stop();
    surface.off('animationend', routeLines);
    map.off('moveend', routeLines);
  };

  // For a change to the cluster's contents with no map move, such as the legend hiding a kind: the
  // badges move but neither event fires.
  off.reroute = routeLines;

  return off;
};
