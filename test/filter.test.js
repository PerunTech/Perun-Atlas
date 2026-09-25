import { describe, expect, it, vi } from 'vitest';
import { changesFor, restack, shownOf } from '../frontend/lib/filter';

const member = (key, extra = {}) => ({ key, hidden: false, layer: {}, ...extra });

describe('changesFor', () => {
  it('takes off every feature of a key switched off, and nothing else', () => {
    const members = [member('LINK::IN'), member('LINK::OUT'), member('SITE::'), member('LINK::OUT')];
    const { leaving, returning } = changesFor(members, ['LINK::OUT']);

    expect(leaving).toEqual([members[1], members[3]]);
    expect(returning).toEqual([]);
  });

  it('remembers what it did, so the next call moves only what changed', () => {
    const members = [member('A::'), member('B::')];
    changesFor(members, ['A::']);

    expect(members.map(m => m.hidden)).toEqual([true, false]);
    expect(changesFor(members, ['A::'])).toEqual({ leaving: [], returning: [] });
  });

  it('puts back what a key switched on again covers', () => {
    const members = [member('A::'), member('B::')];
    changesFor(members, ['A::', 'B::']);

    const { leaving, returning } = changesFor(members, ['B::']);
    expect(leaving).toEqual([]);
    expect(returning).toEqual([members[0]]);
  });

  it('treats no keys as everything on', () => {
    const members = [member('A::')];
    changesFor(members, ['A::']);
    expect(changesFor(members).returning).toEqual([members[0]]);
  });

  it('ignores a key nothing in the draw has, which is a kind absent from this set', () => {
    const members = [member('A::')];
    expect(changesFor(members, ['GONE::'])).toEqual({ leaving: [], returning: [] });
  });
});

describe('restack', () => {
  it('brings the shown layers forward in draw order, and then their arrow heads', () => {
    const order = [];
    const path = (name) => ({ bringToFront: () => order.push(name) });
    const first = path('first');
    const second = path('second');
    const heads = new WeakMap([[first, path('heads of first')], [second, path('heads of second')]]);

    restack([{ layer: first, hidden: false }, { layer: second, hidden: false }], heads);

    expect(order).toEqual(['first', 'second', 'heads of first', 'heads of second']);
  });

  it('leaves a hidden layer alone, since it has no element on the map to move', () => {
    const hidden = { bringToFront: vi.fn() };
    restack([{ layer: hidden, hidden: true }]);
    expect(hidden.bringToFront).not.toHaveBeenCalled();
  });

  it('passes over a marker, which has no stacking of its own to restore', () => {
    expect(() => restack([{ layer: {}, hidden: false }], new WeakMap())).not.toThrow();
  });
});

describe('shownOf', () => {
  const collection = {
    type: 'FeatureCollection',
    features: [
      { properties: { k: 'A' } },
      { properties: { k: 'B' } },
      { properties: { k: 'A' } }
    ]
  };
  const keyOf = (feature) => feature.properties.k;

  it('is the same object while nothing is hidden', () => {
    expect(shownOf(collection, [], keyOf)).toBe(collection);
    expect(shownOf(collection, undefined, keyOf)).toBe(collection);
  });

  it('is the same object when the hidden keys match nothing in it', () => {
    expect(shownOf(collection, ['C'], keyOf)).toBe(collection);
  });

  it('leaves out the hidden kinds and keeps the rest of the collection', () => {
    const shown = shownOf(collection, ['A'], keyOf);
    expect(shown.type).toBe('FeatureCollection');
    expect(shown.features).toEqual([collection.features[1]]);
    expect(collection.features).toHaveLength(3);
  });

  it('passes a missing set straight through', () => {
    expect(shownOf(null, ['A'], keyOf)).toBeNull();
  });
});
