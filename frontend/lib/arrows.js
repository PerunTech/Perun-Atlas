import { reversed } from './route';

/**
 * Direction, drawn on the lines themselves.
 *
 * Decorators are separate layers, so they join a group rather than the map and
 * come off with it. Which group is the caller's to say: the set itself, or a
 * group beside a cluster -- see `placeSet` in `surface.js` for why a cluster
 * cannot hold them.
 *
 * Handed the engine's factory rather than importing it, so a test can give it one.
 *
 * @param {Object} params
 * @param {Object} params.factory  - The engine's factory.
 * @param {Object} params.group    - The set's layers, as drawn.
 * @param {Object} params.into     - The group the decorators are added to.
 * @param {Function} params.arrowOf - A feature -> its descriptor's `arrow`, or nothing.
 * @returns {WeakMap} Line layer -> its decorator. Weak, because the layers are
 *          the draw's and go when it does.
 */
export const drawArrows = ({ factory, group, into, arrowOf }) => {
  const decoratorOf = new WeakMap();

  group.eachLayer((layer) => {
    const arrow = arrowOf(layer.feature);
    if (!arrow || typeof layer.getLatLngs !== 'function') return;

    // Which way a head points is the order of the points, and
    // `Symbol.arrowHead` has no option to turn one around -- so an arrow
    // that has to point back is drawn on a reversed copy of the path
    // rather than on the layer.
    //
    // Which end that is belongs to the producer: a set of these paths is
    // emitted from the record the screen is about outwards, so a plain
    // arrow points away from it and a reversed one points at it.
    const path = arrow.reverse ? reversed(layer.getLatLngs()) : layer;

    decoratorOf.set(layer, factory.polylineDecorator(path, {
      patterns: [{
        offset: arrow.offset ?? '12%',
        repeat: arrow.repeat ?? 160,
        symbol: factory.Symbol.arrowHead({
          pixelSize: arrow.pixelSize ?? 12,
          polygon: false,
          pathOptions: { stroke: true, weight: 2, color: layer.options.color, opacity: 1 }
        })
      }]
    }).addTo(into));
  });

  return decoratorOf;
};
