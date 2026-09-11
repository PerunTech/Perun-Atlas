import { axios, utils } from 'perun-core';
import { core } from '../spatial';

const { factory } = core;
const { getServerOrigin } = utils;

/**
 * The basemap and overlay catalogue.
 *
 * Deployments configure their layers in the GEO_LAYER_TYPE table, which has an
 * admin console screen in perun-core. There is no service that serves it: the
 * rows are read through svarog's generic table reader, which is what every other
 * bundle drawing a basemap does. `SpatialUtil` has a `getExternalLayerList()`
 * that would be the natural endpoint, but nothing exposes it over REST.
 *
 * Not to be confused with `GET /spatial/getLayers/{session}` — that returns the
 * svarog object types carrying geometry, which is the digitisable-layer
 * catalogue, not this one.
 *
 * Consumers should never parse these rows themselves. Doing it per bundle, in
 * about fifty lines each, is one of the duplications this layer exists to
 * remove.
 */

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

const buildTileLayer = (row) => {
  // A row with no URL of its own is served by this deployment. That is the
  // origin, not `window.server` -- which carries the /services path the REST
  // API lives under, and would send every tile request one level too deep.
  const service = row.url || getServerOrigin();

  if (row.protocol === 'wms') {
    return factory.tileLayer.extendedWMS(service, {
      layers: row.title,
      format: row.format,
      version: row.version,
      transparent: true,
      uppercase: true,
      ...(row.layerType === LAYER_TYPE.OVERLAY && { tiled: true, isOverlay: true })
    });
  }

  if (row.protocol === 'tile') {
    // Leaflet's default subdomains are a, b and c, which is what every {s} in
    // an OpenStreetMap-family URL expands to. Google's tile hosts are mt0-mt3
    // instead. Applying those everywhere would point an OpenStreetMap {s} at
    // hosts that do not resolve, so it is decided per URL.
    const google = /google|mt\{s\}/i.test(service);
    return factory.tileLayer(service, {
      maxZoom: 20,
      ...(google && { subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] })
    });
  }

  // `grid` is the Google Maps API rather than a tile service, and the row's URL
  // names the variant: google_terrain, google_satellite, google_hybrid.
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

/**
 * @returns {Promise<{ basemap: Object, overlays: Object }>} Grouped Leaflet layers,
 *          shaped for spatial's layer control: { groupName: { label: layer } }.
 */
export const fetchLayers = async (session) => {
  const basemap = {};
  const overlays = {};

  const response = await axios
    .get(`${window.server}/ReactElements/getTableData/${session}/${LAYER_TABLE}/0`)
    .catch(err => {
      console.error('perun-atlas: layer catalogue unavailable', err);
      return null;
    });

  const rows = response?.data;
  if (!Array.isArray(rows)) return { basemap, overlays };

  rows.forEach(raw => {
    const row = readRow(raw);
    const layer = buildTileLayer(row);
    if (!layer) return;

    const target = row.layerType === LAYER_TYPE.OVERLAY ? overlays : basemap;
    target[row.group] = target[row.group] || {};
    target[row.group][row.label] = layer;
  });

  return { basemap, overlays };
};

/** The first layer of the first group — what a map should show before a user chooses. */
export const firstOf = (grouped) => {
  const group = Object.values(grouped ?? {})[0];
  return group ? Object.values(group)[0] : null;
};
