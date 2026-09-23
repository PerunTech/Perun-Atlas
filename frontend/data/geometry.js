import { axios } from 'perun-core';
import { data as spatialData } from '../spatial';
import { bindPath } from './path';

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
 * What came back, as the decoder saw it.
 *
 * Always, with no switch to find. The people who need this are debugging an
 * encoder against a deployed environment, and a flag they have to be told about
 * is a flag that is off at the moment it would have explained something.
 *
 * Collapsed, because a bbox-scoped screen refetches on every `moveend` and an
 * expanded entry per pan would bury everything else in the console. The
 * collection is logged as a live object rather than a string so it can be
 * expanded, and the newest is left on `window` so devtools' `copy()` takes it
 * whole -- usually the quickest way to compare what arrived against what the
 * encoder meant to send.
 */
const logCollection = (url, bytes, collection) => {
  window.PERUN_ATLAS_LAST = collection;
  console.groupCollapsed(`perun-atlas: ${collection.features.length} feature(s), ${bytes} bytes — ${url}`);
  console.log('collection', collection);
  console.log('also at window.PERUN_ATLAS_LAST');
  console.groupEnd();
};

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

  const bytes = response?.data?.byteLength ?? 0;

  if (!response?.data || bytes === 0) {
    const empty = { type: 'FeatureCollection', features: [] };
    logCollection(url, bytes, empty);
    return empty;
  }

  const decoded = geobuf.decode(new Pbf(new Uint8Array(response.data)));

  if (!decoded || !decoded.type) {
    // A body that decodes to something without a `type` is the shape a service
    // takes when it has written a plain-text error into the stream, and returning
    // an empty set for that looks exactly like a query that legitimately matched
    // nothing. The body is printed because that is where the message actually is.
    console.warn(`perun-atlas: response from ${url} decoded to no GeoJSON type; treating as empty`);
    console.warn('perun-atlas: response body was', new TextDecoder().decode(response.data).slice(0, 500));

    const empty = { type: 'FeatureCollection', features: [] };
    logCollection(url, bytes, empty);
    return empty;
  }

  const collection = decoded.type === 'FeatureCollection'
    ? decoded
    : { type: 'FeatureCollection', features: [decoded] };

  logCollection(url, bytes, collection);

  return collection;
};
