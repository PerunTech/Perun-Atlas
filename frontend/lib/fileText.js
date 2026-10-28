import { bindPath } from '../data/path';

const megabytes = (bytes) => `${Number((bytes / (1024 * 1024)).toFixed(1))} MB`;

const number = (value) => new Intl.NumberFormat().format(value);

export const countText = (count, labels = {}) => bindPath(
  count === 1 ? (labels.fileFeature ?? '{count} feature') : (labels.fileFeatures ?? '{count} features'),
  { count: number(count) }
);

export const openingText = (name, labels = {}) =>
  bindPath(labels.fileOpening ?? 'Opening {name}…', { name });

export const assumedText = (name, labels = {}) => bindPath(
  labels.fileAssumedDegrees ?? '{name} has no .prj, so its coordinates were read as longitude and latitude (WGS 84).',
  { name }
);

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

// Filled after resolving, so a translation can put `{name}` and `{limit}` wherever its grammar needs.
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
