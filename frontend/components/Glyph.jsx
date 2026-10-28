import { React, PropTypes } from 'perun-core';
import { GLYPHS, ICON_SIZE, ICON_STROKE } from '../lib/icons';

// The JSX twin of `svgMarkup`; both take the paths, size and stroke from `lib/icons.js`.
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
