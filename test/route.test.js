import { describe, expect, it } from 'vitest';
import { between, easeInOut, placeKey, reversed, routeEnds } from '../frontend/lib/route';

const at = (lat, lng) => ({ lat, lng });
const marker = (latlng) => ({ getLatLng: () => latlng });

describe('placeKey', () => {
  it('rounds to the six decimals these services write, so a key survives a round trip', () => {
    expect(placeKey(at(35.1248051, 33.9417069))).toBe('35.124805,33.941707');
    expect(placeKey(at(35.124805, 33.941707))).toBe(placeKey(at(35.1248050001, 33.9417070001)));
  });
});

describe('routeEnds', () => {
  const a = at(35.1, 33.9);
  const b = at(35.2, 34.0);
  const line = { original: [a, b], key: [placeKey(a), placeKey(b)].join(' ') };

  it('says nothing when no end has moved, so an unchanged line is not redrawn', () => {
    const m = marker(a);
    expect(routeEnds(line, { [placeKey(a)]: m }, () => m)).toBeNull();
  });

  it('moves an end onto the cluster that swallowed its marker', () => {
    const swallowed = marker(a);
    const cluster = marker(at(35.15, 33.95));
    const out = routeEnds(line, { [placeKey(a)]: swallowed }, (m) => (m === swallowed ? cluster : m));
    expect(out.next[0]).toEqual(at(35.15, 33.95));
    expect(out.next[1]).toBe(b);
  });

  it('leaves an end alone when nothing is drawn there at all', () => {
    expect(routeEnds(line, {}, () => null)).toBeNull();
  });
});

describe('easeInOut', () => {
  it('starts still, ends still, and is halfway at the halfway point', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBeCloseTo(0.5, 10);
  });

  it('is slower than linear at the start and faster in the middle', () => {
    expect(easeInOut(0.1)).toBeLessThan(0.1);
    expect(easeInOut(0.4)).toBeLessThan(0.4);
    expect(easeInOut(0.9)).toBeGreaterThan(0.9);
  });
});

describe('between', () => {
  it('interpolates each end independently', () => {
    const out = between([at(0, 0), at(10, 10)], [at(10, 20), at(20, 30)], 0.5);
    expect(out).toEqual([at(5, 10), at(15, 20)]);
  });

  it('lands exactly on the ends at 0 and 1', () => {
    const from = [at(1, 2)];
    const to = [at(3, 4)];
    expect(between(from, to, 0)).toEqual(from);
    expect(between(from, to, 1)).toEqual(to);
  });

  it('takes the destination when a line gained an end mid-flight', () => {
    expect(between([], [at(3, 4)], 0.5)).toEqual([at(3, 4)]);
  });
});

describe('reversed', () => {
  it('turns a flat path end to end and leaves the one it was given alone', () => {
    const path = [at(1, 1), at(2, 2), at(3, 3)];
    expect(reversed(path)).toEqual([at(3, 3), at(2, 2), at(1, 1)]);
    expect(path[0]).toEqual(at(1, 1));
  });

  it('reverses a path in parts as one path, parts and all', () => {
    expect(reversed([[at(1, 1), at(2, 2)], [at(3, 3), at(4, 4)]]))
      .toEqual([[at(4, 4), at(3, 3)], [at(2, 2), at(1, 1)]]);
  });

  it('answers nothing with an empty path', () => {
    expect(reversed(undefined)).toEqual([]);
  });
});
