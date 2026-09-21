import { describe, expect, it } from 'vitest';
import { legendFrom, legendFromPalette } from '../frontend/style/legend';

describe('legendFrom', () => {
  const drawn = [
    { name: 'AREA', value: null, geometry: 'MultiPolygon', descriptor: { legend: 'x.area', style: { color: '#123456' } } },
    { name: 'ROUTE', value: null, geometry: 'LineString', descriptor: { arrow: { size: 8 } } },
    { name: 'HOLDING', value: null, geometry: 'Point', descriptor: { marker: { radius: 5 } } }
  ];

  it('reads the kind off the geometry, not off the descriptor', () => {
    expect(legendFrom(drawn).map(e => e.kind)).toEqual(['area', 'line', 'point']);
  });

  it('carries the swatch the map would draw, so the key cannot drift from it', () => {
    expect(legendFrom(drawn)[0].path.color).toBe('#123456');
  });

  it('gives a marker only to a point and an arrow only to a line', () => {
    const [area, line, point] = legendFrom(drawn);
    expect(area.marker).toBeNull();
    expect(line.arrow).toEqual({ size: 8 });
    expect(point.marker).toEqual({ radius: 5 });
    expect(point.arrow).toBeNull();
  });

  it('prefers a resolved legend code over the name', () => {
    expect(legendFrom(drawn, (code) => (code === 'x.area' ? 'Areas' : null))[0].label).toBe('Areas');
  });

  it('drops an entry it has no words for rather than printing an empty row', () => {
    expect(legendFrom([{ name: '', value: null, geometry: 'Point' }])).toEqual([]);
  });
});

describe('legendFromPalette', () => {
  const palette = { 0: '#2e7d32', 2: '#c62828' };

  it('lists only the values the palette actually maps', () => {
    const rows = legendFromPalette({ palette, values: ['0', '2', '9'] });
    expect(rows.map(r => r.key)).toEqual(['0', '2']);
  });

  it('adds the unclassified row only when a draw actually used the fallback', () => {
    expect(legendFromPalette({ palette, values: ['0'], fallback: '#eee' })).toHaveLength(1);
    expect(legendFromPalette({ palette, values: ['0'], fallback: '#eee', usedFallback: true })).toHaveLength(2);
    expect(legendFromPalette({ palette, values: ['0'], usedFallback: true })).toHaveLength(1);
  });

  it('draws each swatch in its own colour, filled and stroked alike', () => {
    const [row] = legendFromPalette({ palette, values: ['2'] });
    expect(row.path.color).toBe('#c62828');
    expect(row.path.fillColor).toBe('#c62828');
  });

  it('names the fallback row from the row that asked for it', () => {
    const rows = legendFromPalette(
      { palette, values: [], fallback: '#eee', usedFallback: true, unknownLabel: 'x.none' },
      (code) => (code === 'x.none' ? 'No data' : null)
    );
    expect(rows[0].label).toBe('No data');
  });
});
