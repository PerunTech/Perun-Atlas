// The view rides in the query after the hash route, where the router's path matching never looks:
//   #/main/<route>/<table>/<id>/<item>?map=<id>&at=<lat>,<lng>,<zoom>&base=<basemap>&from=<day>&to=<day>
const KEYS = ['map', 'at', 'base', 'from', 'to'];

const DAY = /^\d{4}-\d{2}-\d{2}$/;

// The query after the hash, since that is the one the router hands on.
const split = (href) => {
  const start = Math.max(href.indexOf('#'), 0);
  const mark = href.indexOf('?', start);
  return mark === -1
    ? { head: href, query: '' }
    : { head: href.slice(0, mark), query: href.slice(mark + 1) };
};

// A day that exists: 2026-02-30 does not.
const isDay = (value) => DAY.test(value ?? '') &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const fixed = (value, places) => String(Number(value.toFixed(places)));

// A map panned round the world reports longitudes outside ±180.
const wrap = (lng) => ((((lng + 180) % 360) + 360) % 360) - 180;

// A part that doesn't read as valid is left out rather than guessed at.
export const readLink = (href, id) => {
  if (id === undefined || id === null || id === '') return null;
  const params = new URLSearchParams(split(href).query);
  if (params.get('map') !== String(id)) return null;

  const view = {};

  const at = (params.get('at') ?? '').split(',');
  if (at.length === 3 && at.every((part) => part.trim() !== '')) {
    const [lat, lng, zoom] = at.map(Number);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && zoom >= 0 && zoom <= 30) {
      view.center = [lat, lng];
      view.zoom = zoom;
    }
  }

  const base = params.get('base');
  if (base) view.basemap = base;

  const from = params.get('from');
  const to = params.get('to');
  if (isDay(from) && isDay(to) && from <= to) {
    view.from = from;
    view.to = to;
  }

  return view;
};

// Replaces a view already in the query and keeps every other key.
export const writeLink = (href, id, { center, zoom, basemap, from, to } = {}) => {
  const { head, query } = split(href);
  const params = new URLSearchParams(query);
  KEYS.forEach((key) => params.delete(key));

  params.set('map', String(id));
  if (center && Number.isFinite(zoom)) {
    params.set('at', [fixed(center[0], 6), fixed(wrap(center[1]), 6), fixed(zoom, 2)].join(','));
  }
  if (basemap) params.set('base', basemap);
  if (from && to) {
    params.set('from', from);
    params.set('to', to);
  }

  // Commas are allowed in a query, and `at` reads better with them than as %2C.
  return `${head}?${params.toString().replace(/%2C/gi, ',')}`;
};

// A link's view is taken once per address, so a map closed and reopened from its button opens as usual.
const taken = new Set();

export const takeLink = (href, id) => {
  if (taken.has(href)) return null;
  const view = readLink(href, id);
  if (view) taken.add(href);
  return view;
};
