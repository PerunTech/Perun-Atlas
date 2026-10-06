import { describe, expect, it } from 'vitest';
import { coerce } from '../../frontend/bootstrap/coerce';
import { SCHEMA } from '../../frontend/config/Schema';

/**
 * Every setting a deployment gives arrives through here: a parameter as a
 * string whatever its type, a window global as whatever was written, a default
 * already typed. Each case below is one of those shapes, and the throws are the
 * point -- a wrong value still draws a map, somewhere it should not be.
 */
const as = (type, value, entry = {}) => coerce('setting', value, { type, ...entry });

describe('coerce', () => {
  it('reads an integer from a parameter or a number, and refuses anything else', () => {
    expect(as('int', '8')).toBe(8);
    expect(as('int', 12)).toBe(12);
    expect(() => as('int', '8.5')).toThrow(/an integer/);
    expect(() => as('int', 'eight')).toThrow(/an integer/);
  });

  it('reads the ways a boolean gets written, and refuses a guess', () => {
    ['true', 'TRUE', ' yes ', '1', true].forEach((value) => expect(as('bool', value)).toBe(true));
    ['false', 'No', '0', false].forEach((value) => expect(as('bool', value)).toBe(false));
    expect(() => as('bool', 'maybe')).toThrow(/a boolean/);
  });

  it('takes a value from the list, and names the list when it refuses one', () => {
    const units = SCHEMA.units;
    expect(coerce('units', 'imperial', units)).toBe('imperial');
    expect(() => coerce('units', 'nautical', units)).toThrow(/one of metric, imperial/);
  });

  it('reads a centre as an object, as JSON, or as "lat,lng"', () => {
    expect(as('latlng', { lat: '35.1', lng: 33.4 })).toEqual({ lat: 35.1, lng: 33.4 });
    expect(as('latlng', ' {"lat": 35.1, "lng": 33.4} ')).toEqual({ lat: 35.1, lng: 33.4 });
    expect(as('latlng', '35.1,33.4')).toEqual({ lat: 35.1, lng: 33.4 });
  });

  it('refuses a centre it cannot place', () => {
    expect(() => as('latlng', '35.1')).toThrow(/a \{ lat, lng \} pair/);
    expect(() => as('latlng', 'north,east')).toThrow(/a \{ lat, lng \} pair/);
    expect(() => as('latlng', '{"lat": 35.1}')).toThrow(/a \{ lat, lng \} pair/);
  });

  it('reads bounds as two corners, each the way a centre is read', () => {
    const corners = [{ lat: 34.5, lng: 32.2 }, { lat: 35.8, lng: 34.6 }];
    expect(as('bounds', corners)).toEqual(corners);
    expect(as('bounds', JSON.stringify(corners))).toEqual(corners);
    expect(as('bounds', ['34.5,32.2', '35.8,34.6'])).toEqual(corners);
    expect(() => as('bounds', [corners[0]])).toThrow(/a \[southwest, northeast\] pair/);
    expect(() => as('bounds', [corners[0], 'nowhere'])).toThrow(/a \{ lat, lng \} pair/);
  });

  it('reads an EPSG code as svarog writes it, the number alone', () => {
    expect(as('srid', '4326')).toBe('4326');
    expect(as('srid', 3857)).toBe('3857');
    expect(as('srid', ' epsg:6316 ')).toBe('6316');
    expect(() => as('srid', '43')).toThrow(/an EPSG code such as 4326/);
    expect(() => as('srid', 'WGS 84')).toThrow(/an EPSG code/);
  });

  it('reads a CRS as a prefixed code or a definition, and refuses a bare number', () => {
    expect(as('crs', 'EPSG:3857')).toBe('EPSG:3857');
    const local = { code: 'EPSG:6316', def: '+proj=tmerc +lat_0=0 +lon_0=21 +k=0.9999 +x_0=7500000 +units=m' };
    expect(as('crs', JSON.stringify(local))).toEqual(local);
    expect(as('crs', local)).toBe(local);
    // A bare code is what SPATIAL_CRS is most likely to be mistyped as. spatial
    // would not resolve it, so it is refused here, at startup, by name.
    expect(() => as('crs', '3857')).toThrow(/an EPSG code or \{ code, def \} object/);
  });

  it('keeps a string as a string', () => {
    expect(as('string', 42)).toBe('42');
  });

  it('names the setting and the value it could not read', () => {
    expect(() => coerce('zoom', 'far', SCHEMA.zoom)).toThrow('perun-atlas: cannot read "zoom" as an integer (got "far")');
  });

  it('refuses a schema row whose type it has no coercion for', () => {
    expect(() => as('colour', 'red')).toThrow('perun-atlas: no coercion for type "colour" on "setting"');
  });

  it('reads every default the schema declares', () => {
    Object.entries(SCHEMA).forEach(([key, entry]) => {
      if ('default' in entry) expect(() => coerce(key, entry.default, entry)).not.toThrow();
    });
  });
});
