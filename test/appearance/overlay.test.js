import { describe, expect, it } from 'vitest';
import { OVERLAY_STYLE, overlayEntry, overlayRecord } from '../../frontend/appearance/overlay';
import { FILE_KEY, kindKey, legendShown } from '../../frontend/appearance/legend';

describe('overlayEntry', () => {
  it('is a dashed line in the key, named after the file', () => {
    expect(overlayEntry('visit.gpx')).toEqual({
      key: FILE_KEY, label: 'visit.gpx', kind: 'line', path: OVERLAY_STYLE, marker: null, arrow: null
    });
    expect(OVERLAY_STYLE.dashArray).toBeTruthy();
    expect(OVERLAY_STYLE.className).toBe('atlas-overlay');
  });

  it('has a key no descriptor and case can spell', () => {
    expect(FILE_KEY).not.toBe(kindKey('file', undefined));
    expect(FILE_KEY).not.toBe(kindKey('SITE', 'file'));
  });

  it('makes the key appear beside a set of one kind', () => {
    const site = { key: kindKey('SITE'), label: 'Site', kind: 'point' };
    expect(legendShown([site])).toBe(false);
    expect(legendShown([site, overlayEntry('a.kml')])).toBe(true);
  });
});

describe('overlayRecord', () => {
  const feature = (properties) => ({ type: 'Feature', properties, geometry: null });

  it('shows every flat property, including the ones a fetched record hides', () => {
    const record = overlayRecord(feature({ name: 'Gate', type: 'wpt', status: 'open', pkid: 3, ele: 12 }), 'visit.gpx');
    expect(record.title).toBe('Gate');
    expect(record.rows.map(row => row.field)).toEqual(['type', 'status', 'pkid', 'ele']);
    expect(record.rows.find(row => row.field === 'ele').value).toBe('12');
  });

  it('leaves out nested values and empty ones', () => {
    const record = overlayRecord(feature({
      name: 'Visit', coordinateProperties: { times: ['a', 'b'] }, links: [{ href: 'x' }], cmt: '', desc: null, visibility: false
    }), 'visit.gpx');
    expect(record.rows).toEqual([{ field: 'visibility', label: 'visibility', value: 'false' }]);
  });

  it('is headed by the file name when the feature has no name, and keeps an empty name out', () => {
    expect(overlayRecord(feature({ A: 1 }), 'zones.geojson').title).toBe('zones.geojson');
    const blank = overlayRecord(feature({ name: '', A: 1 }), 'zones.geojson');
    expect(blank.title).toBe('zones.geojson');
    expect(blank.rows.map(row => row.field)).toEqual(['A']);
  });

  it('tries column names as label codes, as the pane does for a fetched record', () => {
    const record = overlayRecord(feature({ HEADS: 4 }), 'a.kml', (code) => (code === 'heads' ? 'Head count' : null));
    expect(record.rows).toEqual([{ field: 'HEADS', label: 'Head count', value: '4' }]);
  });

  it('marks the pane as a file record', () => {
    expect(overlayRecord(feature({}), 'a.kml').spec.className).toBe('atlas-panel__details--file');
  });
});
