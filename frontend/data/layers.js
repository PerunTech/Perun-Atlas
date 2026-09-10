import { axios } from 'perun-core';
import { core } from '../spatial';

const { factory } = core;

/**
 * The basemap and overlay catalogue.
 *
 * Deployments configure their layers in the GEO_LAYER_TYPE table, which has an
 * admin console screen in perun-core, and `GET /spatial/getLayers/{session}/`
 * serves them. Consumers of perun-atlas should never parse those rows
 * themselves — farm-registry's GpsMapSelect currently does, in about fifty lines,
 * and that duplication is one of the things this layer exists to remove.
 */

const LAYER_TYPE = { BASEMAP: '1', OVERLAY: '2' };

const readRow = (row, table = 'GEO_LAYER_TYPE') => ({
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
  const service = row.url || window.server;

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

  if (row.protocol === 'tile') return factory.tileLayer(service);

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
    .get(`${window.server}/spatial/getLayers/${session}/`)
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
