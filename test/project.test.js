import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bboxIn, crsFor, pointIn, ringIn, unitsPerMetre } from '../frontend/data/project';
import { latLngBounds, resetView, setView } from './stubs/spatial.js';

/** Somewhere in the deployment's own latitudes, where the scale error is worth having. */
const CENTRE = { lat: 35.124805, lng: 33.941707 };
const ground = (a, b) => {
  const rad = Math.PI / 180;
  const sinDLat = Math.sin(((b.lat - a.lat) * rad) / 2);
  const sinDLon = Math.sin(((b.lng - a.lng) * rad) / 2);
  const x = sinDLat ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * sinDLon ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

beforeEach(() => resetView());

describe('crsFor', () => {
  it('builds the three the engine can convert, by code or by string', () => {
    expect(crsFor(4326)).toBeTruthy();
    expect(crsFor('3857')).toBeTruthy();
    expect(crsFor(3395)).toBeTruthy();
  });

  it('is null for anything else, rather than a plausible wrong grid', () => {
    expect(crsFor(32636)).toBeNull();
    expect(crsFor(undefined)).toBeNull();
  });
});

describe('pointIn', () => {
  it('passes degrees straight through for 4326', () => {
    expect(pointIn(CENTRE, 4326)).toEqual({ x: 33.941707, y: 35.124805 });
  });

  it('projects to metres for 3857', () => {
    const { x, y } = pointIn(CENTRE, 3857);
    // Against the formula rather than a copied number, so a failure says which
    // projection went wrong instead of which digit did.
    expect(x).toBeCloseTo(6378137 * CENTRE.lng * (Math.PI / 180), 6);
    expect(y).toBeGreaterThan(4_000_000);
  });

  it("uses the map's own projection when no code is given", () => {
    setView({ crs: crsFor(4326) });
    expect(pointIn(CENTRE)).toEqual({ x: 33.941707, y: 35.124805 });
  });

  it("falls back to the map's projection for a code the engine cannot build, and says so once", () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setView({ crs: crsFor(4326) });
    expect(pointIn(CENTRE, 32636)).toEqual({ x: 33.941707, y: 35.124805 });
    pointIn(CENTRE, 32636);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe('unitsPerMetre', () => {
  /**
   * The number the whole conversion exists for. A degree of longitude at 35.1°N
   * is about 91 km, so a projected unit is about 91,000 ground metres -- four
   * orders of magnitude, not a rounding error.
   */
  it('measures a degree of longitude at this latitude', () => {
    expect(1 / unitsPerMetre(CENTRE, 4326)).toBeCloseTo(90_950, -2);
  });

  /**
   * Web Mercator's scale error, which is the one that goes unnoticed: a metre
   * on the grid is 0.82 ground metres here, so an unconverted radius is a fifth
   * short in a record nobody re-measures.
   */
  it('measures Web Mercator as 1/cos(latitude)', () => {
    expect(unitsPerMetre(CENTRE, 3857)).toBeCloseTo(1 / Math.cos(CENTRE.lat * Math.PI / 180), 2);
  });

  /**
   * Not quite 1, and correctly so. Leaflet projects on the WGS84 semi-major
   * axis (6378137 m) and measures ground distance on a 6371 km sphere, so its
   * own two halves disagree by 0.112% everywhere. Measuring the scale off the
   * projection inherits that, which is the right trade: it is three orders of
   * magnitude smaller than the error this function exists to remove, and it is
   * the same number the map itself draws with.
   */
  it('is 1 at the equator, to within the radius Leaflet disagrees with itself by', () => {
    expect(unitsPerMetre({ lat: 0, lng: 0 }, 3857)).toBeCloseTo(6378137 / 6371000, 5);
  });

  /**
   * The premise of the guard in `FeaturePanel.saveShape`. A service parsing an
   * integer radius cannot be handed a circle measured in degrees: 1500 m is
   * 0.0165 of a unit, which rounds to nothing, and a radius of zero is a save
   * that fails somewhere deep or stores a shape with no extent. If this ever
   * stops being true the guard is dead code and should go.
   */
  it('rounds a real radius to zero in a projection measured in degrees', () => {
    expect(Math.round(1500 * unitsPerMetre(CENTRE, 4326))).toBe(0);
    expect(Math.round(1500 * unitsPerMetre(CENTRE, 3857))).toBeGreaterThan(1000);
  });
});

describe('ringIn', () => {
  it('returns the vertex count asked for, and never fewer than three', () => {
    expect(ringIn(CENTRE, 1500, 4326)).toHaveLength(24);
    expect(ringIn(CENTRE, 1500, 4326, 8)).toHaveLength(8);
    expect(ringIn(CENTRE, 1500, 4326, 1)).toHaveLength(3);
  });

  it('leaves the ring open, because the services that take one close it', () => {
    const ring = ringIn(CENTRE, 1500, 4326);
    expect(ring[0]).not.toEqual(ring[ring.length - 1]);
  });

  /**
   * Round on the ground, not round on the grid. The radius goes through each
   * axis's own scale, so every vertex is the distance the reader measured --
   * which in a geographic projection means the ring is the ellipse a circle on
   * the ground actually is.
   */
  it('puts every vertex the requested distance away on the ground', () => {
    ringIn(CENTRE, 1500, 4326).forEach(({ x, y }) => {
      expect(ground(CENTRE, { lat: y, lng: x })).toBeCloseTo(1500, -1);
    });
  });

  it('is wider than it is tall in degrees, which is what that ellipse is', () => {
    const ring = ringIn(CENTRE, 1500, 4326);
    const width = Math.max(...ring.map(v => v.x)) - Math.min(...ring.map(v => v.x));
    const height = Math.max(...ring.map(v => v.y)) - Math.min(...ring.map(v => v.y));
    expect(width).toBeGreaterThan(height * 1.15);
  });

  it('is as wide as it is tall in a conformal projection', () => {
    const ring = ringIn(CENTRE, 1500, 3857);
    const width = Math.max(...ring.map(v => v.x)) - Math.min(...ring.map(v => v.x));
    const height = Math.max(...ring.map(v => v.y)) - Math.min(...ring.map(v => v.y));
    expect(width).toBeCloseTo(height, 0);
  });

  it('writes degrees at more decimals than it writes metres', () => {
    const decimals = (n) => (String(n).split('.')[1] ?? '').length;
    const inDegrees = Math.max(...ringIn(CENTRE, 1500, 4326).map(v => decimals(v.x)));
    const inMetres = Math.max(...ringIn(CENTRE, 1500, 3857).map(v => decimals(v.x)));
    expect(inDegrees).toBeGreaterThan(inMetres);
  });
});

describe('bboxIn', () => {
  const bounds = latLngBounds({ lat: 34.5, lng: 32.2 }, { lat: 35.8, lng: 34.6 });

  it('projects both corners of the view into the projection asked for', () => {
    setView({ bounds });
    expect(bboxIn(4326)).toBe('32.2,34.5,34.6,35.8');
  });

  it("hands back the map's own box when no code is given", () => {
    setView({ bbox: 'already,in,the,map' });
    expect(bboxIn()).toBe('already,in,the,map');
  });

  it("hands back the map's own box for a code the engine cannot build", () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setView({ bbox: 'already,in,the,map' });
    expect(bboxIn(2100)).toBe('already,in,the,map');
    warn.mockRestore();
  });
});
