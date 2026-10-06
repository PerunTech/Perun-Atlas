import { redux } from 'perun-core';

/**
 * A label under `perun.spatial.`, or the plain word when nobody has registered
 * one.
 *
 * The codes are spatial's, because these controls came from there and a
 * deployment has registered its translations under them. An unregistered code
 * would read on screen as `perun.spatial.latitude` in a box two centimetres
 * wide, and a neutral English word is the better failure: it is legible, and
 * it says which rung was reached.
 *
 * Read from the shell's store, as spatial's own lookup does. Unlike that one, a
 * store whose messages have not arrived yet answers with the word rather than
 * throwing, which on spatial took the whole map down with it.
 */
export const label = (code, fallback) =>
  redux.store.getState().intl?.messages?.[`perun.spatial.${code}`] || fallback;
