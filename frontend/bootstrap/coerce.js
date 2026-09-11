/**
 * Type coercion for configuration values.
 *
 * Remote parameters arrive as strings whatever their declared type, `window`
 * globals arrive as whatever a config.js author wrote, and defaults arrive
 * already typed. Everything funnels through here so the rest of the project can
 * assume a resolved value is the shape its schema entry promised.
 *
 * A coercion that cannot produce the declared type throws. Silent fallback is
 * what produces a plausible, wrong map — see the Moldova defaults in spatial.
 */

const fail = (key, value, expected) => {
  throw new TypeError(
    `perun-atlas: cannot read "${key}" as ${expected} (got ${JSON.stringify(value)})`
  );
};

const parseMaybeJson = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return value;
  try {
    return JSON.parse(trimmed);
  } catch (_e) {
    return value;
  }
};

const toLatLng = (key, raw) => {
  const value = parseMaybeJson(raw);
  if (value && typeof value === 'object' && 'lat' in value && 'lng' in value) {
    return { lat: Number(value.lat), lng: Number(value.lng) };
  }
  // Also accept "lat,lng", which is how a hand-edited parameter tends to be written.
  if (typeof value === 'string' && value.includes(',')) {
    const [lat, lng] = value.split(',').map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return fail(key, raw, 'a { lat, lng } pair');
};

export const COERCE = {
  string: (key, value) => String(value),

  int: (key, value) => {
    const n = Number(value);
    return Number.isInteger(n) ? n : fail(key, value, 'an integer');
  },

  bool: (key, value) => {
    if (typeof value === 'boolean') return value;
    const s = String(value).trim().toLowerCase();
    if (['true', '1', 'yes'].includes(s)) return true;
    if (['false', '0', 'no'].includes(s)) return false;
    return fail(key, value, 'a boolean');
  },

  enum: (key, value, entry) =>
    entry.values.includes(value) ? value : fail(key, value, `one of ${entry.values.join(', ')}`),

  latlng: toLatLng,

  bounds: (key, raw) => {
    const value = parseMaybeJson(raw);
    if (Array.isArray(value) && value.length === 2) {
      return [toLatLng(key, value[0]), toLatLng(key, value[1])];
    }
    return fail(key, raw, 'a [southwest, northeast] pair');
  },

  /**
   * A bare EPSG code, as svarog writes it: the number alone. `EPSG:4326` is
   * accepted too, because that is how a hand-edited parameter tends to read.
   */
  srid: (key, value) => {
    const s = String(value).trim().replace(/^EPSG:/i, '');
    return /^\d{4,6}$/.test(s) ? s : fail(key, value, 'an EPSG code such as 4326');
  },

  /**
   * A CRS is either a bare EPSG code that spatial resolves itself, or a
   * { code, def } pair carrying a proj4 definition for a local projection.
   */
  crs: (key, raw) => {
    const value = parseMaybeJson(raw);
    if (typeof value === 'string' && value.startsWith('EPSG:')) return value;
    if (value && typeof value === 'object' && value.code) return value;
    return fail(key, raw, 'an EPSG code or { code, def } object');
  }
};

export const coerce = (key, value, entry) => {
  const fn = COERCE[entry.type];
  if (!fn) throw new TypeError(`perun-atlas: no coercion for type "${entry.type}" on "${key}"`);
  return fn(key, value, entry);
};
