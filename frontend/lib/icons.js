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
 * 24x24 outline grid.
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
  ]
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
