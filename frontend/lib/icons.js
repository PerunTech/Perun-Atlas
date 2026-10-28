// Tabler outline paths (MIT), transcribed rather than imported: `elements.Icon` loads lazily and may
// render nothing, and Leaflet's controls take their contents as an HTML string. v3.36.0; the
// notices' glyphs, from `map` on, are v3.46.0.
export const GLYPHS = {
  plus: ['M12 5l0 14', 'M5 12l14 0'],
  minus: ['M5 12l14 0'],
  maximize: [
    'M4 8v-2a2 2 0 0 1 2 -2h2',
    'M4 16v2a2 2 0 0 0 2 2h2',
    'M16 4h2a2 2 0 0 1 2 2v2',
    'M16 20h2a2 2 0 0 0 2 -2v-2'
  ],
  minimize: [
    'M15 19v-2a2 2 0 0 1 2 -2h2',
    'M15 5v2a2 2 0 0 0 2 2h2',
    'M5 15h2a2 2 0 0 1 2 2v2',
    'M5 9h2a2 2 0 0 0 2 -2v-2'
  ],
  'zoom-scan': [
    'M4 8v-2a2 2 0 0 1 2 -2h2',
    'M4 16v2a2 2 0 0 0 2 2h2',
    'M16 4h2a2 2 0 0 1 2 2v2',
    'M16 20h2a2 2 0 0 0 2 -2v-2',
    'M8 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0',
    'M16 16l-2.5 -2.5'
  ],
  map: ['M3 7l6 -3l6 3l6 -3v13l-6 3l-6 -3l-6 3v-13', 'M9 4v13', 'M15 7v13'],
  'map-off': [
    'M8.32 4.34l.68 -.34l6 3l6 -3v13m-2.67 1.335l-3.33 1.665l-6 -3l-6 3v-13l2.665 -1.333',
    'M9 4v1m0 4v8',
    'M15 7v4m0 4v5',
    'M3 3l18 18'
  ],
  'cloud-off': [
    'M9.58 5.548c.24 -.11 .492 -.207 .752 -.286c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 .957 -.383 1.824 -1.003 2.454m-2.997 1.033h-11.343c-2.572 -.004 -4.657 -2.011 -4.657 -4.487c0 -2.475 2.085 -4.482 4.657 -4.482c.13 -.582 .37 -1.128 .7 -1.62',
    'M3 3l18 18'
  ],
  'info-circle': ['M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0', 'M12 9h.01', 'M11 12h1v4h1'],
  'alert-triangle': [
    'M12 9v4',
    'M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0',
    'M12 16h.01'
  ],
  x: ['M18 6l-12 12', 'M6 6l12 12'],
  copy: [
    'M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666',
    'M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1'
  ],
  check: ['M5 12l5 5l10 -10'],
  refresh: ['M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4', 'M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4'],
  'chevron-down': ['M6 9l6 6l6 -6'],
  'chevron-up': ['M6 15l6 -6l6 6']
};

// What perun-core and spatial draw their Tabler icons at.
export const ICON_SIZE = 18;
export const ICON_STROKE = 1.75;

// Only constants reach this markup: `name` is looked up in GLYPHS, never interpolated. ZoomRail
// writes the same preset as JSX.
export const svgMarkup = (name, options = {}) => {
  const paths = GLYPHS[name];
  if (!paths) return '';

  const {
    className = `atlas-icon atlas-icon--${name}`,
    size = ICON_SIZE,
    stroke = ICON_STROKE
  } = options;

  return `<svg xmlns="http://www.w3.org/2000/svg" class="${className}"`
    + ` width="${size}" height="${size}" viewBox="0 0 24 24"`
    + ' fill="none" stroke="currentColor"'
    + ` stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`
    + ' aria-hidden="true" focusable="false">'
    + paths.map(d => `<path d="${d}"/>`).join('')
    + '</svg>';
};
