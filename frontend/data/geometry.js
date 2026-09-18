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

  // A failed service writes a plain-text error into the stream rather than a
  // protobuf body, so decoding would throw on something that is really a message.
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

/** Reads the svarog type descriptor a feature was encoded with. */
export const descriptorOf = (feature) =>
  feature?.properties?.DESCRIPTOR ?? feature?.properties?.descriptor ?? null;

/** Reads a feature's identity, tolerating both encoders' property casing. */
export const identityOf = (feature) => ({
  id: feature?.id ?? feature?.properties?.OBJECT_ID ?? null,
  parentId: feature?.properties?.parent_id ?? feature?.properties?.PARENT_ID ?? null
});

/**
 * Whether a feature is the record a screen is about.
 *
 * `match` names which of a feature's two identities to compare against. A
 * service routinely returns the record's *children* rather than the record --
 * a set of geometries hanging off one row -- and then the id worth matching is
 * on `parent_id` and the feature's own belongs to the geometry. `'id'` is the
 * default because it is the commoner case and because silence has to go on
 * meaning what it meant before.
 *
 * Deliberately not "try whichever one hits". Ids come from per-type sequences,
 * so a geometry and an unrelated record can hold the same number; a match that
 * accepted either would sometimes draw the wrong feature as the subject, on
 * exactly the screens this exists to serve, rarely and unreproducibly. Which
 * identity is the record's is something the caller knows and this cannot guess.
 *
 * Compared as text: an identity is a name, and the two sides reach here from
 * different places -- one decoded from the wire, one out of a configuration --
 * so one of them being a number is not a difference.
 *
 * @param {Object} feature - The GeoJSON feature.
 * @param {string|number} wanted - The record's id, or nothing for no subject.
 * @param {'id'|'parent'} [match] - Which identity to compare. Defaults to 'id'.
 * @returns {boolean}
 */
export const matchesIdentity = (feature, wanted, match = 'id') => {
  if (wanted === null || wanted === undefined) return false;

  const identity = identityOf(feature);
  const mine = match === 'parent' ? identity.parentId : identity.id;
  if (mine === null || mine === undefined) return false;

  return String(mine) === String(wanted);
};
