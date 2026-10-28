import { axios } from 'perun-core';
import { SCHEMA } from '../config/Schema';

/**
 * Where configuration values come from, in precedence order.
 *
 * Each source answers with a plain { key: rawValue } object and knows nothing
 * about types, defaults or validation — resolve() composes them. The remote
 * source also says which parameters it could not ask about, so a request that
 * failed is not reported as a parameter nobody set.
 */

/**
 * Remote parameters from SVAROG_SYS_PARAMS.
 *
 * `GET /WsConf/params/get/sys/{paramName}` is unauthenticated and already in
 * production use — every deployment's index.html resolves its assets location
 * this way — so this works today with no backend change. It costs one request per
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
        .then(res => ({ key, value: res?.data?.VALUE }))
        .catch(() => ({ key, failed: true }))
    )
  );

  return {
    values: Object.fromEntries(results
      .filter(({ value }) => value !== undefined && value !== '')
      .map(({ key, value }) => [key, value])),
    unreachable: results.filter(({ failed }) => failed).map(({ key }) => key)
  };
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

/** Schema defaults. Lowest precedence, and never required. */
export const defaultSource = () =>
  Object.fromEntries(
    Object.entries(SCHEMA)
      .filter(([, entry]) => 'default' in entry)
      .map(([key, entry]) => [key, entry.default])
  );
