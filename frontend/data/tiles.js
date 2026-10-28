import { axios, utils } from 'perun-core';
import { core } from '../spatial';

const { factory } = core;
const { getServerOrigin } = utils;

// No service serves GEO_LAYER_TYPE, so its rows are read through svarog's generic table reader.
const LAYER_TABLE = 'GEO_LAYER_TYPE';
const LAYER_TYPE = { BASEMAP: '1', OVERLAY: '2' };

const readRow = (row, table = LAYER_TABLE) => ({
  layerType: row?.[`${table}.LAYER_TYPE`],
  protocol: (row?.[`${table}.PROTOCOL`] ?? '').toLowerCase(),
  version: row?.[`${table}.VERSION`] || '1.1.1',
  format: row?.[`${table}.FORMAT`] || 'image/png',
  url: row?.[`${table}.URL`],
  group: row?.[`${table}.LAYER_GROUP`] || 'Other',
  title: row?.[`${table}.TITLE`],
  label: row?.[`${table}.LABEL_CODE`] || row?.[`${table}.TITLE`]
});

// Measured limits: past `maxNativeZoom` Leaflet upscales the last real tile instead of requesting
// blank or failing ones. The credits belong in GEO_LAYER_TYPE, which has no column for them yet.
const PROVIDERS = [
  {
    match: /openstreetmap\.org/i,
    name: 'OpenStreetMap',
    maxNativeZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    match: /opentopomap\.org/i,
    name: 'OpenTopoMap',
    maxNativeZoom: 17,
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
  },
  {
    match: /cartocdn\.com/i,
    name: 'CARTO',
    maxNativeZoom: 20,
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  {
    match: /arcgisonline\.com/i,
    name: 'Esri',
    attribution: 'Tiles &copy; <a href="https://www.esri.com">Esri</a>'
  }
];

const providerFor = (url) => PROVIDERS.find(entry => entry.match.test(url ?? '')) ?? {};

const buildTileLayer = (row, { maxZoom } = {}) => {
  // The origin, not `window.server`, which carries the REST API's /services path.
  const service = row.url || getServerOrigin();

  const provider = providerFor(service);

  const limits = {
    ...(maxZoom != null && { maxZoom }),
    ...(provider.maxNativeZoom != null && { maxNativeZoom: provider.maxNativeZoom })
  };
  const credit = provider.attribution ? { attribution: provider.attribution } : {};

  if (row.protocol === 'wms') {
    return factory.tileLayer.extendedWMS(service, {
      layers: row.title,
      format: row.format,
      version: row.version,
      transparent: true,
      uppercase: true,
      ...limits,
      ...credit,
      ...(row.layerType === LAYER_TYPE.OVERLAY && { tiled: true, isOverlay: true })
    });
  }

  if (row.protocol === 'tile') {
    // Google's hosts are mt0-mt3; Leaflet's default a, b, c suit everything else.
    const google = /google|mt\{s\}/i.test(service);
    return factory.tileLayer(service, {
      ...limits,
      ...credit,
      ...(google && { subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] })
    });
  }

  // `grid` is the Google Maps API; the URL names the variant, e.g. google_satellite.
  if (row.protocol === 'grid') {
    if (!row.url?.includes('google')) {
      console.warn(`perun-atlas: grid layer "${row.title}" has no recognised provider in its URL`);
      return null;
    }
    return factory.gridLayer.googleMutant({ maxZoom: 24, type: row.url.split('_')[1] });
  }

  console.warn(`perun-atlas: unsupported layer protocol "${row.protocol}" for "${row.title}"`);
  return null;
};

// `catalogue` is `ok`, `empty` when no row made a basemap, or `unreachable`.
export const fetchLayers = async (session, options = {}) => {
  const basemap = {};
  const overlays = {};

  const response = await axios
    .get(`${window.server}/ReactElements/getTableData/${session}/${LAYER_TABLE}/0`)
    .catch(err => {
      console.error('perun-atlas: layer catalogue unavailable', err);
      return null;
    });

  const rows = response?.data;
  if (!Array.isArray(rows)) return { basemap, overlays, catalogue: 'unreachable' };

  rows.forEach(raw => {
    const row = readRow(raw);
    const layer = buildTileLayer(row, options);
    if (!layer) return;

    const target = row.layerType === LAYER_TYPE.OVERLAY ? overlays : basemap;
    target[row.group] = target[row.group] || {};
    target[row.group][row.label] = layer;
  });

  return { basemap, overlays, catalogue: firstOf(basemap) ? 'ok' : 'empty' };
};

const FALLBACK_OFF = /^(none|off|false)$/i;

// XYZ tiles are on the Web Mercator grid; on any other CRS they would draw in the wrong place.
const WEB_MERCATOR = ['EPSG:3857', 'EPSG:900913'];

export const fallbackBasemap = (url, { crs, maxZoom } = {}) => {
  if (!url || FALLBACK_OFF.test(url.trim())) return { layer: null, reason: 'off' };
  if (!WEB_MERCATOR.includes(crs)) return { layer: null, reason: 'crs' };

  const layer = buildTileLayer({ protocol: 'tile', url }, { maxZoom });
  return { layer, name: providerFor(url).name ?? 'Default basemap' };
};

export const firstOf = (grouped) => {
  const group = Object.values(grouped ?? {})[0];
  return group ? Object.values(group)[0] : null;
};

// By label code, or title where a row has none, so a link names it the same in every language.
export const layerNamed = (grouped, name) => {
  if (!name) return null;
  const group = Object.values(grouped ?? {})
    .find((layers) => Object.prototype.hasOwnProperty.call(layers, name));
  return group ? group[name] : null;
};

export const shownName = (grouped, map) => {
  for (const layers of Object.values(grouped ?? {})) {
    const shown = Object.entries(layers).find(([, layer]) => map?.hasLayer?.(layer));
    if (shown) return shown[0];
  }
  return null;
};
