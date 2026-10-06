import { describe, expect, it } from 'vitest';
import { canLocate, cornerFor, locatePress, pointsOf, readingFor } from '../../frontend/lib/controls';

/**
 * The engine's measure, as far as `readingFor` uses it: plain arithmetic over
 * the numbers handed in, and formats that show what they were given, so a test
 * reads which value reached which formatter.
 */
const measure = {
  distance: (points) => points.reduce((sum, point) => sum + point.d, 0),
  area: (points) => points.reduce((sum, point) => sum + point.a, 0),
  circleArea: (radius) => radius * radius * 3,
  bearing: (from, to) => to.b - from.b,
  anglesAlong: (points) => points.map(point => point.angle),
  asDistance: (metres) => `${metres} m`,
  asArea: (squareMetres) => `${squareMetres} m²`,
  asAngle: (degrees) => `${degrees}°`,
  asBearing: (degrees) => `bearing ${degrees}`
};

const line = (...points) => ({ getLatLngs: () => points });
const polygon = (...ring) => ({ getLatLngs: () => [ring, [{ d: 99, a: 99 }]] });
const circle = (radius) => ({ getLatLngs: () => [], getRadius: () => radius });
const zero = () => ({ length: 0, area: 0 });

describe('pointsOf', () => {
  it('takes a line\'s points as they are and a polygon\'s outer ring', () => {
    expect(pointsOf(line({ d: 1 }, { d: 2 }))).toEqual([{ d: 1 }, { d: 2 }]);
    expect(pointsOf(polygon({ a: 1 }, { a: 2 }))).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it('answers an empty list for a layer with no points to give', () => {
    expect(pointsOf(null)).toEqual([]);
    expect(pointsOf({})).toEqual([]);
  });
});

describe('readingFor', () => {
  it('keeps a running total of lengths, and says it beside each one', () => {
    const totals = zero();
    expect(readingFor('length', line({ d: 10 }, { d: 0 }), totals, measure)).toBe('10 m   (Σ 10 m)');
    expect(readingFor('length', line({ d: 5 }, { d: 0 }), totals, measure)).toBe('5 m   (Σ 15 m)');
    expect(totals).toEqual({ length: 15, area: 0 });
  });

  it('keeps the areas\' total apart from the lengths\'', () => {
    const totals = { length: 40, area: 0 };
    expect(readingFor('area', polygon({ a: 300 }, { a: 0 }, { a: 0 }), totals, measure)).toBe('300 m²   (Σ 300 m²)');
    expect(totals).toEqual({ length: 40, area: 300 });
  });

  it('gives a radius and the area it encloses, and adds neither to a total', () => {
    const totals = zero();
    expect(readingFor('radius', circle(10), totals, measure)).toBe('10 m · 300 m²');
    expect(totals).toEqual(zero());
  });

  it('reads every corner along a line as an angle', () => {
    const totals = zero();
    const reading = readingFor('angle', line({ angle: NaN }, { angle: 90 }, { angle: 45 }, { angle: NaN }), totals, measure);
    expect(reading).toBe('90°, 45°');
    expect(totals).toEqual(zero());
  });

  it('gives two points with no corner their bearing instead, and one point nothing', () => {
    const totals = zero();
    expect(readingFor('angle', line({ angle: NaN, b: 10 }, { angle: NaN, b: 100 }), totals, measure)).toBe('bearing 90');
    expect(readingFor('angle', line({ angle: NaN, b: 10 }), totals, measure)).toBeNull();
  });

  it('gives a longer line with no readable corner nothing, rather than the bearing of its first leg', () => {
    const totals = zero();
    expect(readingFor('angle', line({ angle: NaN, b: 10 }, { angle: NaN, b: 100 }, { angle: NaN, b: 50 }), totals, measure)).toBeNull();
  });

  it('says nothing for a shape that measures nothing, and leaves the total alone', () => {
    const totals = { length: 7, area: 3 };
    expect(readingFor('length', line({ d: 0 }), totals, measure)).toBeNull();
    expect(readingFor('area', polygon({ a: NaN }), totals, measure)).toBeNull();
    expect(readingFor('radius', circle(undefined), totals, measure)).toBeNull();
    expect(totals).toEqual({ length: 7, area: 3 });
  });
});

describe('canLocate', () => {
  it('asks only a browser that has geolocation, in a secure context', () => {
    expect(canLocate({ geolocation: {} }, { isSecureContext: true })).toBe(true);
    expect(canLocate({ geolocation: {} }, { isSecureContext: false })).toBe(false);
    expect(canLocate({}, { isSecureContext: true })).toBe(false);
    expect(canLocate(undefined, undefined)).toBe(false);
  });

  it('takes a browser that does not say whether it is secure at its word', () => {
    expect(canLocate({ geolocation: {} }, {})).toBe(true);
  });
});

describe('locatePress', () => {
  it('explains instead of asking where the browser will not be asked', () => {
    expect(locatePress('unavailable')).toBe('explain');
  });

  it('clears an answer already on the map, whatever it was', () => {
    ['found', 'outside', 'error'].forEach(state => expect(locatePress(state)).toBe('clear'));
  });

  it('asks otherwise, including again while a fix is pending', () => {
    expect(locatePress('idle')).toBe('locate');
    expect(locatePress('locating')).toBe('locate');
  });
});

describe('cornerFor', () => {
  it('keeps a corner the map has, and falls back where it has not', () => {
    const corners = { bottomleft: {}, bottomcenter: {} };
    expect(cornerFor(corners, 'bottomcenter', 'bottomleft')).toBe('bottomcenter');
    expect(cornerFor({ bottomleft: {} }, 'bottomcenter', 'bottomleft')).toBe('bottomleft');
    expect(cornerFor(undefined, 'bottomcenter', 'bottomleft')).toBe('bottomleft');
  });
});
