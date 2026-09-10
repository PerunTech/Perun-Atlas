import { axios } from 'perun-core';
import { data as spatialData } from '../spatial';

const { geobuf, Pbf } = spatialData;

/**
 * Fetching and decoding geometry.
 *
 * The wire format is geobuf over protobuf — the same format the legacy GIS module
 * used, and what svarog-spatial's server-side GeobufEncoder emits. Decoding gives
 * a GeoJSON FeatureCollection whose feature properties carry the svarog object's
 * value map, including DESCRIPTOR, parent_id and (from spatial's encoder) type,
 * status and pkid.
 */

/**
 * Substitutes {path} tokens in a service path against a context object.
 *
 * Server-side `%TOKEN%` placeholders are already resolved by MenuHelper before the
 * configuration reaches the browser; these are the ones that must stay live because
 * they change per request — {map.bbox} above all.
 */
export const bindPath = (path, context) =>
  path.replace(/\{([^}]+)\}/g, (match, expression) => {
    const value = expression
      .split('.')
      .reduce((acc, part) => (acc == null ? acc : acc[part]), context);
    return value === undefined || value === null ? match : String(value);
  });

/**
 * Fetches a geometry set and decodes it.
 *
 * @param {string} servicePath - Path with optional {token} placeholders, from configuration.
 * @param {Object} context     - Values the placeholders resolve against, e.g. { map: { bbox } }.
 * @returns {Promise<Object>}  - A GeoJSON FeatureCollection, empty rather than null on no data.
 */
export const fetchGeometry = async (servicePath, context = {}) => {
  const url = `${window.server}${bindPath(servicePath, context)}`;

  const response = await axios({ method: 'get', url, responseType: 'arraybuffer' });

  if (!response?.data || response.data.byteLength === 0) {
    return { type: 'FeatureCollection', features: [] };
  }

  // A failed service writes a plain-text error into the stream rather than a
  // protobuf body, so decoding would throw on something that is really a message.
  const decoded = geobuf.decode(new Pbf(new Uint8Array(response.data)));

  if (!decoded || !decoded.type) {
    return { type: 'FeatureCollection', features: [] };
  }

  return decoded.type === 'FeatureCollection'
    ? decoded
    : { type: 'FeatureCollection', features: [decoded] };
};

/** Reads the svarog type descriptor a feature was encoded with. */
export const descriptorOf = (feature) =>
  feature?.properties?.DESCRIPTOR ?? feature?.properties?.descriptor ?? null;

/** Reads a feature's identity, tolerating both encoders' property casing. */
export const identityOf = (feature) => ({
  id: feature?.id ?? feature?.properties?.OBJECT_ID ?? null,
  parentId: feature?.properties?.parent_id ?? feature?.properties?.PARENT_ID ?? null
});
