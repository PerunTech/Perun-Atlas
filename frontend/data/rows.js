import { axios } from 'perun-core';
import { bindPath } from './path';

/**
 * The records a map colours by.
 *
 * A choropleth's geometry and the thing it is coloured by come from different
 * services -- one serves shapes, the other serves the rows carrying a category
 * -- and they meet on a shared key in the browser. `fetchGeometry` is the first
 * half; this is the second, and it exists so that one menu row can describe a
 * whole screen rather than a consuming bundle having to fetch half of it.
 *
 * Nothing here reads a row. They are handed to `joinStatus` as they arrived and
 * matched on a key the caller named, so this file knows no more about them than
 * it does about a bounding box: a path from configuration, and an array back.
 */

/**
 * Fetches the rows a screen joins onto its geometry.
 *
 * Failure is answered with an empty array rather than a throw, which is the
 * opposite of `fetchGeometry` and deliberate. A map with no shapes has nothing
 * to show and the reader should be told; a map whose shapes arrived without
 * their categories still shows every area, in the fallback colour, which is a
 * worse map but a real one. Taking the screen down over the second service would
 * turn a partial answer into no answer.
 *
 * The console carries the reason, because a map drawn entirely in the fallback
 * colour is the one symptom this produces and it looks like a configuration
 * mistake rather than a service that was down.
 *
 * @param {string} servicePath - Path with optional {token} placeholders, from configuration.
 * @param {Object} context     - Values those placeholders resolve against.
 * @returns {Promise<Array>}   - The rows, or empty -- never null.
 */
export const fetchRows = async (servicePath, context = {}) => {
  if (!servicePath) return [];

  const url = `${window.server}${bindPath(servicePath, context)}`;

  const response = await axios.get(url).catch((err) => {
    console.error(`perun-atlas: rows unavailable from ${url}`, err);
    return null;
  });

  const rows = response?.data;
  if (rows && !Array.isArray(rows)) {
    // A service answering with an object where an array was expected is a
    // configuration pointing at the wrong endpoint far more often than it is a
    // service at fault, and an empty join looks identical to one that matched
    // nothing -- so say which it was.
    console.warn(`perun-atlas: ${url} answered with no array of rows; treating as empty`);
  }

  return Array.isArray(rows) ? rows : [];
};
