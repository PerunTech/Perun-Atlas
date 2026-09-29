/**
 * A link that reopens a map screen where the reader left it.
 *
 * The shell routes with hash history, and a record's own address already
 * reopens the record. What it cannot say is which of the record's map buttons
 * was open, or what the map was showing. Both go in the query after the route,
 * where the router's path matching never looks:
 *
 *     #/main/<route>/<table>/<id>/<item>?map=<id>&at=<lat>,<lng>,<zoom>&base=<basemap>&from=<day>&to=<day>
 *
 * `map` is the caller's name for the screen, the button's id for a screen drawn
 * from a menu row. The consuming bundle reads it to open that button, and the
 * screen reads the rest only when `map` names it, so a link to one map never
 * moves another.
 *
 * Everything here is a function of the address it is given. The one thing held
 * is which addresses have already been read, in `takeLink`.
 */

/** The keys this writes, and replaces when it writes them again. */
const KEYS = ['map', 'at', 'base', 'from', 'to'];

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * An address, cut where its query starts.
 *
 * The query after the hash when there is a hash, since that is the one the
 * router hands on; a page with no hash keeps its query in the usual place.
 */
const split = (href) => {
  const start = Math.max(href.indexOf('#'), 0);
  const mark = href.indexOf('?', start);
  return mark === -1
    ? { head: href, query: '' }
    : { head: href.slice(0, mark), query: href.slice(mark + 1) };
};

/** A day as the date window writes it, and one that exists: 2026-02-30 does not. */
const isDay = (value) => DAY.test(value ?? '') &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

/** Six places is about a decimetre, and a longer number says nothing more. */
const fixed = (value, places) => String(Number(value.toFixed(places)));

/** A longitude brought back into ±180, as a map panned round the world reports it outside. */
const wrap = (lng) => ((((lng + 180) % 360) + 360) % 360) - 180;

/**
 * The view a link asks a screen to open at, or null when it names another.
 *
 * Only what reads as valid is returned, and a part that does not is left out
 * rather than guessed at. A link names the screen and nothing else when every
 * part fails, and the screen then opens as it always does.
 *
 * @param {string} href - The address, as `window.location.href` gives it.
 * @param {string|number} id - The screen's name in a link.
 * @returns {?{ center?: number[], zoom?: number, basemap?: string, from?: string, to?: string }}
 */
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

/**
 * The address with this screen's view in its query.
 *
 * A view already there is replaced, and any other key is kept, so copying a
 * link from a screen that was itself opened from one gives the new view.
 *
 * @param {string} href - The address, as `window.location.href` gives it.
 * @param {string|number} id - The screen's name in a link.
 * @param {Object} view - `center` as `[lat, lng]`, `zoom`, and `basemap`,
 *        `from` and `to` where there are any.
 * @returns {string}
 */
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

/**
 * The addresses whose view has been read.
 *
 * A screen opened from a link takes its view once. Closed and opened again
 * from its button, with the same address still in the bar, it opens as it
 * always does: the reader asked for the map, not for the link again. A reload
 * starts this over, and the link is read again, which is what the address
 * asks for.
 */
const taken = new Set();

/**
 * `readLink`, once per address.
 *
 * @param {string} href
 * @param {string|number} id
 */
export const takeLink = (href, id) => {
  if (taken.has(href)) return null;
  const view = readLink(href, id);
  if (view) taken.add(href);
  return view;
};
