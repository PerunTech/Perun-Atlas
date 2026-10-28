import { axios } from 'perun-core';
import { SCHEMA } from '../config/Schema';

// One request per parameter. Swap in batchSource once `/spatial/config/{session}` exists.
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

// Unused until the batched endpoint is published.
export const batchSource = async (session) => {
  const res = await axios.get(`${window.server}/spatial/config/${session}`);
  return res?.data?.params ?? {};
};

export const defaultSource = () =>
  Object.fromEntries(
    Object.entries(SCHEMA)
      .filter(([, entry]) => 'default' in entry)
      .map(([key, entry]) => [key, entry.default])
  );
