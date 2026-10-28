import { reversed } from './route';

// The factory is passed in so a test can supply one. Decorators join `into`, not the map, so they
// come off with it; see `placeSet` for why a cluster cannot hold them.
export const drawArrows = ({ factory, group, into, arrowOf }) => {
  const decoratorOf = new WeakMap();

  group.eachLayer((layer) => {
    const arrow = arrowOf(layer.feature);
    if (!arrow || typeof layer.getLatLngs !== 'function') return;

    // `Symbol.arrowHead` cannot turn a head around, so a reversed arrow is drawn on a reversed copy.
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
