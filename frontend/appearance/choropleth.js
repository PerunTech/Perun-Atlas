import { reader } from '../data/path';
import { FALLBACK_KEY } from './legend';

export const DEFAULT_PALETTE = {
  __unknown: '#B8C6CC'
};

// Shared by the fill and the key so the two agree. Own properties only, so a category spelled
// `toString` is not taken for a colour.
const isMapped = (palette, value) =>
  Object.prototype.hasOwnProperty.call(Object(palette), value) && Boolean(palette[value]);

export const colourBy = ({ field, palette = DEFAULT_PALETTE, fallback = DEFAULT_PALETTE.__unknown }) => {
  const seenUnmapped = new Set();

  const readField = reader(field);
  const read = (feature) => readField(feature?.properties);

  return (feature) => {
    const value = read(feature);
    if (value === undefined || value === null) return fallback;

    if (isMapped(palette, value)) return palette[value];

    // Once per category, not once per feature.
    if (!seenUnmapped.has(value)) {
      seenUnmapped.add(value);
      console.warn(`perun-atlas: no palette entry for ${field}="${value}"`);
    }
    return fallback;
  };
};

// The categories on screen rather than the palette's; on a bbox-scoped map they differ with every pan.
export const categoriesDrawn = (features = [], { field, palette = DEFAULT_PALETTE } = {}) => {
  const readField = reader(field);
  const read = (feature) => readField(feature?.properties);
  const seen = new Set();
  const values = [];
  let usedFallback = false;

  features.forEach((feature) => {
    const value = read(feature);

    if (value === undefined || value === null) {
      usedFallback = true;
      return;
    }
    if (!isMapped(palette, value)) usedFallback = true;

    if (seen.has(value)) return;
    seen.add(value);
    values.push(value);
  });

  return { values, usedFallback };
};

// Returns legendFromPalette's keys, so switching a key row off hides the matching areas.
export const bandOf = ({ field, palette = DEFAULT_PALETTE } = {}) => {
  const readField = reader(field);

  return (feature) => {
    const value = readField(feature?.properties);
    return value !== undefined && value !== null && isMapped(palette, value)
      ? String(value)
      : FALLBACK_KEY;
  };
};
