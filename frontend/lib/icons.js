/**
 * The glyphs the map's own controls are drawn with.
 *
 * Tabler, which is what everything else in this stack draws with: perun-core
 * ships `@tabler/icons-react` as a lazy chunk, this package's panel buttons take
 * their icons from it through `elements.Icon`, and so do spatial's locate and
 * measure controls -- all of them at 18 pixels on a 1.75 stroke, which is why
 * those are the defaults here.
 *
 * The path data is transcribed rather than imported, and that is the whole
 * reason this file exists. `elements.Icon` resolves its component through a
 * dynamic import: it renders nothing until the chunk arrives and nothing at all
 * if it never does. A panel button survives that, because a text label sits
 * beside the icon; spatial's measure buttons survive it with a one-character
 * fallback shown by `:only-child`. Neither is available here. Two of the three
 * controls these glyphs go into are Leaflet's, and Leaflet puts a button's
 * contents in as an HTML string -- there is no React tree to host a lazy
 * component at all -- and on a zoom button the glyph *is* the button, so an icon
 * that never arrives is a control that says nothing and still works, which is
 * worse than one that looks slightly different.
 *
 * Four line segments cannot fail to render and cannot fall out of date: a plus
 * is a plus. Tabler is MIT, and these are `IconPlus`, `IconMinus`,
 * `IconMaximize`, `IconMinimize` and `IconZoomScan` at v3.36.0, on the set's
 * 24x24 outline grid. The notices' glyphs, from `map` on, are v3.46.0.
 */

/** The `d` of each path in the icon, in Tabler's own order. */
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
  // A magnifier inside a frame: zoom to what is framed. It sits in the zoom
  // control, so it is read beside `plus` and `minus` rather than beside the
  // fullscreen button, whose frame alone it shares.
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

/** What the rest of the map's controls are drawn at. */
export const ICON_SIZE = 18;
export const ICON_STROKE = 1.75;

/**
 * One glyph as SVG markup, for a control that takes its contents as a string.
 *
 * Leaflet's zoom control takes `zoomInText`/`zoomOutText` and the fullscreen
 * plugin takes `content`; both go in through `innerHTML`. That is safe here and
 * only here: every value below is a constant from this module, and nothing a
 * deployment or a record can reach is interpolated into it. `lib/dom.js` is
 * where the rule against building markup from values lives, and this does not
 * break it -- but a `name` that came from configuration would, so it is looked
 * up in `GLYPHS` rather than used.
 *
 * The same preset is written out again as JSX in `ZoomRail`, because a React
 * tree cannot take a string. What could drift between the two -- the paths, the
 * size, the stroke -- is shared from here; the rest is Tabler's fixed outline
 * preset, which is the same four attributes for every icon in the set.
 *
 * @param {string} name - A key of `GLYPHS`.
 * @param {Object} [options] - `className`, `size`, `stroke`.
 * @returns {string} An `<svg>`, or an empty string for a name with no glyph.
 */
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
