import { bindPath } from '../data/path';
import { FILE_KEY } from './legend';

/**
 * How a file the reader opened is drawn, named and described.
 *
 * One look for every file, whatever the file says about its own. The overlay is
 * there to be compared with the set, so the one thing it must never be is
 * mistaken for part of it -- and a file's own colours, or a guess at a
 * descriptor's, could be exactly that. A dashed outline in a colour no
 * descriptor is given by default, points as small rings rather than the set's
 * filled markers, and a row in the key named after the file.
 *
 * The colour is a fallback. `.atlas-overlay` in `overlay.css` sets the stroke
 * from `--ap-overlay`, which a row can set in `tokens`. A CSS property wins over
 * the attribute Leaflet writes, so the token decides wherever the sheet loads.
 *
 * Engine-free and pure, like the rest of `appearance/`.
 */

const OVERLAY_COLOUR = '#e8590c';

/** Leaflet path options for a file's lines and areas. */
export const OVERLAY_STYLE = {
  className: 'atlas-overlay',
  color: OVERLAY_COLOUR,
  weight: 2.5,
  opacity: 1,
  dashArray: '6 5',
  fillColor: OVERLAY_COLOUR,
  fillOpacity: 0.08
};

/**
 * Leaflet circle-marker options for a file's points.
 *
 * Solid rather than dashed: a dash pattern on a ring ten pixels across is a few
 * specks. White inside, so the ring reads on imagery and on a pale basemap
 * alike, and so the whole of it takes the click rather than only the stroke.
 */
export const OVERLAY_POINT = {
  className: 'atlas-overlay atlas-overlay--point',
  radius: 5,
  color: OVERLAY_COLOUR,
  weight: 2.5,
  opacity: 1,
  fillColor: '#ffffff',
  fillOpacity: 0.85
};

/**
 * The key's row for an open file, in the shape `legendFrom` builds.
 *
 * A dashed line whatever the file holds, because that is the overlay's one
 * look. The label is the file's name, which is what the chip in the toolbar
 * calls it too, so the key and the chip plainly mean the same thing -- and the
 * key is the one of the two that is still there in fullscreen.
 *
 * @param {string} name - The file's name.
 */
export const overlayEntry = (name) => ({
  key: FILE_KEY,
  label: name,
  kind: 'line',
  path: OVERLAY_STYLE,
  marker: null,
  arrow: null
});

/** A value as the pane shows it, or null for one it leaves out. */
const shown = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return typeof value === 'object' ? null : String(value);
};

/**
 * One feature from a file, as the record pane shows it.
 *
 * Every flat property the feature has, in the file's own order. None of the
 * system fields a fetched record hides are hidden here: a column called `type`
 * or `status` in someone's file is theirs, not the registry's. Nested values --
 * a GPX track's per-point times, a link list -- are left out, because a pane
 * row is one line of text.
 *
 * The heading is the feature's `name`, which is where KML and GPX keep what a
 * placemark or a waypoint is called, and the file's name when it has none. So a
 * pane opened from the overlay always says which file it came from or what the
 * feature is called in it.
 *
 * @param {Object} feature
 * @param {string} fileName
 * @param {Function} [resolveLabel] - Tries each column name as a label code,
 *        as the pane does for a fetched record. A file written by this
 *        package's own KML export carries the same columns, so it reads back
 *        under the same words.
 * @returns {{ title: string, rows: Array, spec: Object }}
 */
export const overlayRecord = (feature, fileName, resolveLabel) => {
  const properties = feature?.properties ?? {};
  const named = shown(properties.name);

  const rows = Object.entries(properties)
    .filter(([field]) => !(named !== null && field === 'name'))
    .map(([field, value]) => ({
      field,
      label: resolveLabel?.(field.toLowerCase()) || field,
      value: shown(value)
    }))
    .filter(row => row.value !== null);

  return {
    title: named ?? fileName,
    rows,
    // So a deployment can mark a file's record out from the registry's.
    spec: { className: 'atlas-panel__details--file' }
  };
};

/** A byte count in megabytes, to one decimal place and no more than it needs. */
const megabytes = (bytes) => `${Number((bytes / (1024 * 1024)).toFixed(1))} MB`;

const number = (value) => new Intl.NumberFormat().format(value);

/**
 * What the panel says about the open file: its feature count.
 *
 * @param {number} count
 * @param {Object} [labels] - The panel's resolved words. `fileFeature` and
 *        `fileFeatures`, each with a `{count}` placeholder.
 */
export const countText = (count, labels = {}) => bindPath(
  count === 1 ? (labels.fileFeature ?? '{count} feature') : (labels.fileFeatures ?? '{count} features'),
  { count: number(count) }
);

/** The words for each refusal, by the reason `readFile` and `sizeRefusal` give. */
const REFUSALS = {
  unreadable: ['fileUnreadable', '{name} could not be read as GeoJSON, KML or GPX.'],
  empty: ['fileEmpty', '{name} has nothing in it to draw.'],
  notDegrees: ['fileNotDegrees', '{name} is not in longitude and latitude, so it cannot be placed on the map.'],
  tooLarge: ['fileTooLarge', '{name} is {size}. Files up to {limit} can be opened.'],
  tooManyPoints: ['fileTooManyPoints', '{name} has {count} points. Files with up to {limit} points can be opened.']
};

/**
 * Why a file was not opened, in words, with the numbers that decided it.
 *
 * The panel's own words come as resolved labels, so the placeholders are filled
 * after resolving: a deployment's translation carries `{name}` and `{limit}`
 * wherever its grammar puts them.
 *
 * @param {Object} refusal - `{ refused, ...numbers }`.
 * @param {string} name - The file's name.
 * @param {Object} [labels]
 * @returns {string}
 */
export const refusalText = (refusal, name, labels = {}) => {
  const [key, fallback] = REFUSALS[refusal?.refused] ?? REFUSALS.unreadable;
  const values = { name };

  if (refusal?.refused === 'tooLarge') {
    values.size = megabytes(refusal.size);
    values.limit = megabytes(refusal.limit);
  }
  if (refusal?.refused === 'tooManyPoints') {
    values.count = number(refusal.count);
    values.limit = number(refusal.limit);
  }

  return bindPath(labels[key] ?? fallback, values);
};
