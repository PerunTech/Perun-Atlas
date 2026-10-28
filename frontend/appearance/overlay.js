import { FILE_KEY } from './legend';

// One look for every file, so an overlay is never mistaken for part of the set. The colour is a
// fallback: `.atlas-overlay` sets the stroke from `--ap-overlay`.
const OVERLAY_COLOUR = '#e8590c';

export const OVERLAY_STYLE = {
  className: 'atlas-overlay',
  color: OVERLAY_COLOUR,
  weight: 2.5,
  opacity: 1,
  dashArray: '6 5',
  fillColor: OVERLAY_COLOUR,
  fillOpacity: 0.08
};

// Solid, since a dash on a 10px ring is a few specks. The white fill makes the whole ring clickable.
export const OVERLAY_POINT = {
  className: 'atlas-overlay atlas-overlay--point',
  radius: 5,
  color: OVERLAY_COLOUR,
  weight: 2.5,
  opacity: 1,
  fillColor: '#ffffff',
  fillOpacity: 0.85
};

export const overlayEntry = (name) => ({
  key: FILE_KEY,
  label: name,
  kind: 'line',
  path: OVERLAY_STYLE,
  marker: null,
  arrow: null
});

const shown = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return typeof value === 'object' ? null : String(value);
};

// Nothing is hidden as a system field: a `type` or `status` column in someone's file is theirs.
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
