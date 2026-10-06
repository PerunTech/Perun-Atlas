import { bindPath } from '../data/path';

/**
 * What the panel says about a file the reader opened: how many features it
 * holds, that it is being opened, what was assumed about it, and why it was not
 * opened.
 *
 * Words rather than appearance. They sat in `appearance/overlay.js` beside how
 * the file is drawn, and are here because the panel's cards and
 * `useFileOverlay` both say them. Each takes the panel's resolved `labels`,
 * falls back to neutral English, and fills its placeholders after resolving.
 */

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

/**
 * What the loading card says while a file is read and drawn.
 *
 * @param {string} name - The file's name.
 * @param {Object} [labels] - The panel's resolved words. `fileOpening`, with a
 *        `{name}` placeholder.
 */
export const openingText = (name, labels = {}) =>
  bindPath(labels.fileOpening ?? 'Opening {name}…', { name });

/**
 * What the panel says about an open shapefile that had no `.prj`: that its
 * coordinates were taken to be longitude and latitude. They were in range, which
 * is all that can be checked, so the reader is the one who can say whether the
 * file landed where it belongs.
 *
 * @param {string} name - The file's name.
 * @param {Object} [labels] - The panel's resolved words. `fileAssumedDegrees`,
 *        with a `{name}` placeholder.
 */
export const assumedText = (name, labels = {}) => bindPath(
  labels.fileAssumedDegrees ?? '{name} has no .prj, so its coordinates were read as longitude and latitude (WGS 84).',
  { name }
);

/**
 * The words for each refusal, by the reason `readFile`, `readLayers`,
 * `sizeRefusal` and the shapefile reader give.
 *
 * The shapefile refusals that are about a projection end the same way, because
 * the fix is the same: GDAL, QGIS and ArcGIS all save a layer in WGS 84 in one
 * step.
 */
const REFUSALS = {
  unreadable: ['fileUnreadable', '{name} could not be read as GeoJSON, KML, GPX or a shapefile.'],
  empty: ['fileEmpty', '{name} has nothing in it to draw.'],
  notDegrees: ['fileNotDegrees', '{name} is not in longitude and latitude, so it cannot be placed on the map.'],
  tooLarge: ['fileTooLarge', '{name} is {size}. Files up to {limit} can be opened.'],
  tooManyPoints: ['fileTooManyPoints', '{name} has {count} points. Files with up to {limit} points can be opened.'],
  tooLargeUnzipped: ['fileTooLargeUnzipped', '{name} is over {limit} once unzipped, and {limit} is the most that can be opened.'],
  noShapefile: ['fileNoShapefile', '{name} holds no shapefile.'],
  shapefilePart: ['fileShapefilePart', '{name} is one part of a shapefile and holds no shapes. Open the .zip holding all its parts, or its .shp.'],
  noPrj: ['fileNoPrj', '{name} has no .prj, and its coordinates are not longitude and latitude, so nothing says where it belongs. Open it zipped with its .prj.'],
  unknownProjection: ['fileUnknownProjection', 'The projection in {name}\'s .prj could not be read. Save it in WGS 84 (EPSG:4326) and open it again.'],
  noDatumShift: ['fileNoDatumShift', '{name} is in {crs}, and its .prj does not say how to shift that to WGS 84, so it would land in the wrong place. Save it in WGS 84 (EPSG:4326) and open it again.'],
  readerUnavailable: ['fileReaderUnavailable', 'The shapefile reader could not be loaded, so {name} was not opened. Try again.']
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
  if (refusal?.refused === 'tooLargeUnzipped') {
    values.limit = megabytes(refusal.limit);
  }
  if (refusal?.refused === 'tooManyPoints') {
    values.count = number(refusal.count);
    values.limit = number(refusal.limit);
  }
  if (refusal?.refused === 'noDatumShift') {
    values.crs = refusal.crs || 'a projection';
  }

  return bindPath(labels[key] ?? fallback, values);
};
