import { describe, expect, it } from 'vitest';
import { assumedText, countText, openingText, refusalText } from '../../frontend/lib/fileText';

describe('countText', () => {
  it('says one feature, or several', () => {
    expect(countText(1)).toBe('1 feature');
    expect(countText(3)).toBe('3 features');
  });

  it('fills the count into a deployment wording', () => {
    expect(countText(3, { fileFeatures: 'objekti: {count}' })).toBe('objekti: 3');
  });
});

describe('openingText', () => {
  it('names the file being opened', () => {
    expect(openingText('visit.gpx')).toBe('Opening visit.gpx\u2026');
  });

  it("fills the name into a deployment's wording", () => {
    expect(openingText('visit.gpx', { fileOpening: 'Се отвора {name}' })).toBe('Се отвора visit.gpx');
  });
});

describe('assumedText', () => {
  it('says a shapefile with no .prj was read as longitude and latitude', () => {
    expect(assumedText('sites.zip')).toBe('sites.zip has no .prj, so its coordinates were read as longitude and latitude (WGS 84).');
  });

  it("uses the deployment's wording", () => {
    expect(assumedText('sites.zip', { fileAssumedDegrees: '{name}: WGS 84' })).toBe('sites.zip: WGS 84');
  });
});

describe('refusalText', () => {
  it('names the file and the reason', () => {
    expect(refusalText({ refused: 'unreadable' }, 'notes.txt')).toBe('notes.txt could not be read as GeoJSON, KML, GPX or a shapefile.');
    expect(refusalText({ refused: 'empty' }, 'a.kml')).toBe('a.kml has nothing in it to draw.');
    expect(refusalText({ refused: 'notDegrees' }, 'b.geojson')).toMatch(/^b\.geojson is not in longitude and latitude/);
  });

  it('gives the numbers that decided it', () => {
    const size = refusalText({ refused: 'tooLarge', size: 31.24 * 1024 * 1024, limit: 20 * 1024 * 1024 }, 'big.gpx');
    expect(size).toBe('big.gpx is 31.2 MB. Files up to 20 MB can be opened.');

    const points = refusalText({ refused: 'tooManyPoints', count: 250001, limit: 200000 }, 'track.gpx');
    const number = (n) => new Intl.NumberFormat().format(n);
    expect(points).toBe(`track.gpx has ${number(250001)} points. Files with up to ${number(200000)} points can be opened.`);
  });

  it("uses the deployment's wording, with the placeholders where its grammar puts them", () => {
    const labels = { fileTooLarge: 'Limit {limit}; {name} ima {size}.' };
    expect(refusalText({ refused: 'tooLarge', size: 30 * 1024 * 1024, limit: 20 * 1024 * 1024 }, 'x.kml', labels))
      .toBe('Limit 20 MB; x.kml ima 30 MB.');
  });

  it('names the projection a shapefile would need shifting from, and says how to fix it', () => {
    expect(refusalText({ refused: 'noDatumShift', crs: 'MGI 1901 Balkans zone 7' }, 'parcels.zip')).toBe(
      'parcels.zip is in MGI 1901 Balkans zone 7, and its .prj does not say how to shift that to WGS 84, ' +
      'so it would land in the wrong place. Save it in WGS 84 (EPSG:4326) and open it again.'
    );
    expect(refusalText({ refused: 'unknownProjection' }, 'a.zip')).toMatch(/Save it in WGS 84 \(EPSG:4326\)/);
  });

  it('gives the limit a zip passed once unzipped', () => {
    const text = refusalText({ refused: 'tooLargeUnzipped', limit: 20 * 1024 * 1024 }, 'big.zip');
    expect(text).toBe('big.zip is over 20 MB once unzipped, and 20 MB is the most that can be opened.');
  });

  it("has words for each of a shapefile's own refusals", () => {
    ['noShapefile', 'shapefilePart', 'noPrj', 'readerUnavailable'].forEach((refused) => {
      const text = refusalText({ refused }, 'x.zip');
      expect(text).toMatch(/x\.zip/);
      expect(text).not.toMatch(/could not be read as/);
    });
  });

  it('falls back to unreadable for a reason it does not know', () => {
    expect(refusalText({ refused: 'somethingNew' }, 'a.kml')).toMatch(/could not be read/);
  });
});
