import { describe, expect, it } from 'vitest';
import { drawArrows } from '../frontend/lib/arrows';

const at = (lat, lng) => ({ lat, lng });

/** Just enough of the engine's factory to see what was asked of it. */
const factory = {
  polylineDecorator: (path, options) => ({
    path,
    options,
    addTo(group) { group.added.push(this); return this; }
  }),
  Symbol: { arrowHead: (options) => ({ arrowHead: options }) }
};

const line = (arrow, points = [at(1, 1), at(2, 2)]) => ({
  feature: { arrow },
  options: { color: '#123' },
  getLatLngs: () => points
});

const draw = (layers) => {
  const into = { added: [] };
  const group = { eachLayer: (fn) => layers.forEach(fn) };
  const decoratorOf = drawArrows({ factory, group, into, arrowOf: (feature) => feature.arrow });
  return { into, decoratorOf };
};

describe('drawArrows', () => {
  it('draws heads on a line whose descriptor asks, in the line\'s colour and the group given', () => {
    const l = line({});
    const { into, decoratorOf } = draw([l]);

    expect(into.added).toHaveLength(1);
    expect(decoratorOf.get(l)).toBe(into.added[0]);

    const [pattern] = into.added[0].options.patterns;
    expect(pattern).toMatchObject({ offset: '12%', repeat: 160 });
    expect(pattern.symbol.arrowHead).toMatchObject({
      pixelSize: 12,
      polygon: false,
      pathOptions: { color: '#123' }
    });
  });

  it('takes the spacing and size a descriptor gives', () => {
    const { into } = draw([line({ offset: '50%', repeat: 40, pixelSize: 8 })]);
    const [pattern] = into.added[0].options.patterns;
    expect(pattern).toMatchObject({ offset: '50%', repeat: 40 });
    expect(pattern.symbol.arrowHead.pixelSize).toBe(8);
  });

  it('draws on the line itself, or on a reversed copy for an arrow that points back', () => {
    const forward = line({});
    const back = line({ reverse: true });
    const { decoratorOf } = draw([forward, back]);

    expect(decoratorOf.get(forward).path).toBe(forward);
    expect(decoratorOf.get(back).path).toEqual([at(2, 2), at(1, 1)]);
    expect(back.getLatLngs()).toEqual([at(1, 1), at(2, 2)]);
  });

  it('draws nothing for a line without an arrow, or for a marker', () => {
    const marker = { feature: { arrow: {} } };
    const { into } = draw([line(undefined), marker]);
    expect(into.added).toEqual([]);
  });
});
