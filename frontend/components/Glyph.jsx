import { React, PropTypes } from 'perun-core';
import { GLYPHS, ICON_SIZE, ICON_STROKE } from '../lib/icons';

/**
 * A glyph from `lib/icons.js`, as JSX.
 *
 * The same preset `svgMarkup` serialises for the Leaflet controls, said again
 * here because a React tree cannot take a string of markup. The paths, the
 * default size and the stroke come from there, so the two renderings cannot
 * disagree about the part that could change.
 */
export const Glyph = ({ name, size = ICON_SIZE }) => (
  <svg
    className={`atlas-icon atlas-icon--${name}`}
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={ICON_STROKE}
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    focusable='false'
  >
    {GLYPHS[name].map(d => <path key={d} d={d} />)}
  </svg>
);

Glyph.propTypes = {
  name: PropTypes.oneOf(Object.keys(GLYPHS)).isRequired,
  size: PropTypes.number
};
