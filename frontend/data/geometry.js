import { axios } from 'perun-core';
import { data as spatialData } from '../spatial';
import { bindPath } from './path';

const { geobuf, Pbf } = spatialData;

// Always on, for debugging an encoder against a deployed environment. Collapsed, since a
// bbox-scoped screen refetches on every pan.
const logCollection = (url, bytes, collection) => {
  window.PERUN_ATLAS_LAST = collection;
  console.groupCollapsed(`perun-atlas: ${collection.features.length} feature(s), ${bytes} bytes — ${url}`);
  console.log('collection', collection);
  console.log('also at window.PERUN_ATLAS_LAST');
  console.groupEnd();
};

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
    // How a service that wrote a plain-text error into the stream decodes; the body holds the message.
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
