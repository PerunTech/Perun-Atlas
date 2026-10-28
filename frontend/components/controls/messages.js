import { redux } from 'perun-core';

// Under spatial's codes, which deployments have already translated. Falls back to the plain word rather
// than throwing when the store's messages haven't arrived, which took spatial's map down.
export const label = (code, fallback) =>
  redux.store.getState().intl?.messages?.[`perun.spatial.${code}`] || fallback;
