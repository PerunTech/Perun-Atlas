import { axios } from 'perun-core';
import { bindPath } from './path';

// Fails to an empty array, unlike fetchGeometry: shapes without their categories still make a map,
// drawn in the fallback colour.
export const fetchRows = async (servicePath, context = {}) => {
  if (!servicePath) return [];

  const url = `${window.server}${bindPath(servicePath, context)}`;

  const response = await axios.get(url).catch((err) => {
    console.error(`perun-atlas: rows unavailable from ${url}`, err);
    return null;
  });

  const rows = response?.data;
  if (rows && !Array.isArray(rows)) {
    // Usually a configuration pointing at the wrong endpoint.
    console.warn(`perun-atlas: ${url} answered with no array of rows; treating as empty`);
  }

  return Array.isArray(rows) ? rows : [];
};
