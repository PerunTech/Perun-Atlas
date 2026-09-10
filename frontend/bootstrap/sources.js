import { axios } from 'perun-core';
import { SCHEMA } from '../config';

/**
 * Where configuration values come from, in precedence order.
 *
 * Each source answers with a plain { key: rawValue } object and knows nothing
 * about types, defaults or validation — resolve() composes them.
 */

/**
 * Remote parameters from SVAROG_SYS_PARAMS.
 *
 * `GET /WsConf/params/get/sys/{paramName}` is unauthenticated and already in
 * production use (farm-registry's index.html resolves its assets location this
 * way), so this works today with no backend change. It costs one request per
 * parameter, which is the argument for the batched `GET /spatial/config/{session}`
 * proposed alongside this project; swap `remoteSource` for `batchSource` once
 * that endpoint exists and nothing else here changes.
 */
export const remoteSource = async () => {
  const entries = Object.entries(SCHEMA).filter(([, entry]) => entry.param);

  const results = await Promise.all(
    entries.map(([key, entry]) =>
      axios
        .get(`${window.server}/WsConf/params/get/sys/${entry.param}`)
        .then(res => [key, res?.data?.VALUE])
        .catch(() => [key, undefined])
    )
  );

  return Object.fromEntries(results.filter(([, value]) => value !== undefined && value !== ''));
};

/**
 * The batched replacement. Returns parameters, the layer catalogue and the
 * registries this deployment actually has, in one round trip.
 * Unused until the endpoint is published — kept here so the swap is a one-line change.
 */
export const batchSource = async (session) => {
  const res = await axios.get(`${window.server}/spatial/config/${session}`);
  return res?.data?.params ?? {};
};

/**
 * Legacy `window` globals.
 *
 * A compatibility shim so deployments keep working while SPATIAL_* parameters are
 * seeded. Every hit is a deployment that has not been migrated yet, so it says so
 * once rather than silently.
 */
export const legacySource = () => {
  const found = {};

  Object.entries(SCHEMA).forEach(([key, entry]) => {
    if (!entry.legacy) return;
    const value = window[entry.legacy];
    if (value !== undefined && value !== null && value !== '') found[key] = value;
  });

  const keys = Object.keys(found);
  if (keys.length) {
    console.warn(
      `perun-atlas: read ${keys.length} setting(s) from window globals — ` +
      keys.map(k => `window.${SCHEMA[k].legacy}`).join(', ') + '. ' +
      'Seed the corresponding SPATIAL_* parameters in SVAROG_SYS_PARAMS; ' +
      'this fallback is temporary.'
    );
  }

  return found;
};

/** Schema defaults. Lowest precedence, and never required. */
export const defaultSource = () =>
  Object.fromEntries(
    Object.entries(SCHEMA)
      .filter(([, entry]) => 'default' in entry)
      .map(([key, entry]) => [key, entry.default])
  );
