import { describe, expect, it } from 'vitest';
import { toCSV, toGeoJSON } from '../frontend/data/export';

const point = (properties, coordinates = [33.9, 35.1]) =>
  ({ type: 'Feature', properties, geometry: { type: 'Point', coordinates } });
const rows = (csv) => csv.split('\r\n');

describe('toGeoJSON', () => {
  it('writes an empty collection rather than "undefined" when nothing arrived', () => {
    expect(JSON.parse(toGeoJSON(undefined))).toEqual({ type: 'FeatureCollection', features: [] });
  });
});

describe('toCSV', () => {
  // A denormalised reader names a related column `TABLE.COLUMN`, flat. The
  // column is collected under that name, so the cell has to be read under it
  // too rather than walked as two levels that are not there.
  it('fills a column whose name has a dot in it', () => {
    const csv = toCSV({ features: [point({ 'T.CODE': 'x' })] });
    expect(rows(csv)[0]).toBe('T.CODE,latitude,longitude');
    expect(rows(csv)[1].split(',')[0]).toBe('x');
  });

  it('collects columns from every feature, not just the first', () => {
    const csv = toCSV({ features: [point({ A: 1 }), point({ B: 2 })] });
    expect(rows(csv)[0]).toBe('A,B,latitude,longitude');
  });

  it('hides the framework fields and whatever the caller excluded', () => {
    const csv = toCSV(
      { features: [point({ A: 1, pkid: 9, type: 3, status: 'V', parent_id: 1, DESCRIPTOR: 'T', B: 2 })] },
      { exclude: ['B'] }
    );
    expect(rows(csv)[0]).toBe('A,latitude,longitude');
  });

  it('takes named fields in the order given, headers and all', () => {
    const csv = toCSV(
      { features: [point({ A: 1, B: 2 })] },
      { fields: [{ field: 'B', label: 'x.b' }, { field: 'A' }], labelResolver: (c) => (c === 'x.b' ? 'Bee' : null) }
    );
    expect(rows(csv)[0]).toBe('Bee,A,latitude,longitude');
    expect(rows(csv)[1]).toBe('2,1,35.1,33.9');
  });

  it('adds coordinate columns only for points and a geometry column only for shapes', () => {
    const shape = { type: 'Feature', properties: { A: 1 }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]] } };
    expect(rows(toCSV({ features: [point({ A: 1 })] }))[0]).toBe('A,latitude,longitude');
    expect(rows(toCSV({ features: [shape] }))[0]).toBe('A,geometry');
    expect(rows(toCSV({ features: [shape] }))[1]).toBe('1,"POLYGON ((0 0, 1 0, 0 1, 0 0))"');
  });

  it('quotes a value carrying a comma, a quote or a newline', () => {
    expect(rows(toCSV({ features: [point({ A: 'a,b' })] }))[1]).toMatch(/^"a,b"/);
    expect(rows(toCSV({ features: [point({ A: 'say "x"' })] }))[1]).toMatch(/^"say ""x"""/);
  });

  /**
   * A cell opening with `=`, `+`, `-` or `@` is a formula to a spreadsheet, and
   * these cells hold whatever a registry's free-text field holds. The quote
   * makes it text. A negative number is not defused, because it is a number.
   */
  it('defuses a cell a spreadsheet would run, and leaves a number alone', () => {
    expect(rows(toCSV({ features: [point({ A: '=1+1' })] }))[1]).toMatch(/^'=1\+1/);
    expect(rows(toCSV({ features: [point({ A: '-5' })] }))[1]).toMatch(/^-5/);
    expect(rows(toCSV({ features: [point({ A: '-5e3' })] }))[1]).toMatch(/^-5e3/);
  });

  it('leaves a cell empty for a missing value rather than writing null', () => {
    expect(rows(toCSV({ features: [point({ A: 1 }), point({ B: 2 })] }))[1]).toBe('1,,35.1,33.9');
  });
});
